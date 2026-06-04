import { Injectable, UnauthorizedException, BadRequestException, ForbiddenException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { ConfigService } from '../../config/config.service';
import { UserService } from '../user/services/user.service';
import { User, UserStatus } from '../user/entities/user.entity';
import { Organization, OrganizationType } from '../user/entities/organization.entity';
import { Role, RoleType } from '../user/entities/role.entity';
import * as bcrypt from 'bcryptjs';
import { LoginDto, RegisterDto, RefreshTokenDto, ChangePasswordDto, PhoneLoginDto, PhoneRegisterDto } from './dto/auth.dto';
import { AuthResponseDto, UserInfoDto } from './dto/auth-response.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly accessTokenExpiration: number;
  private readonly refreshTokenExpiration: number; // 秒

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {
    // Token 过期时间：7天 = 604800 秒
    this.accessTokenExpiration = 604800;
    this.refreshTokenExpiration = 604800 * 30; // 30天
  }

  /**
   * 用户登录
   */
  async login(dto: LoginDto, ip?: string): Promise<AuthResponseDto> {
    // 验证用户
    const user = await this.userService.validatePassword(dto.email, dto.password);
    if (!user) {
      throw new UnauthorizedException('邮箱或密码错误');
    }

    // 检查用户状态
    if (user.status !== UserStatus.ACTIVE) {
      throw new ForbiddenException('账号已被停用或未激活');
    }

    // 更新登录信息
    if (ip) {
      await this.userService.updateLastLogin(user.id, ip);
    }

    // 生成 Token
    return this.generateTokens(user);
  }

  /**
   * 用户注册
   */
  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    // 检查邮箱是否已存在
    const existingUser = await this.userRepository.findOne({
      where: { email: dto.email },
    });
    if (existingUser) {
      throw new BadRequestException('该邮箱已被注册');
    }

    // 创建组织（如果不存在）
    let organization = await this.organizationRepository.findOne({
      where: { name: `${dto.name}的团队` },
    });
    if (!organization) {
      organization = this.organizationRepository.create({
        name: `${dto.name}的团队`,
        type: OrganizationType.INDIVIDUAL,
      });
      organization = await this.organizationRepository.save(organization);
    }

    // 获取默认角色（查看者）
    const defaultRole = await this.roleRepository.findOne({
      where: { code: RoleType.VIEWER },
    });
    if (!defaultRole) {
      throw new BadRequestException('系统角色配置错误');
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // 创建用户
    const user = this.userRepository.create({
      email: dto.email,
      password: hashedPassword,
      name: dto.name,
      phone: dto.phone,
      organizationId: organization.id,
      roleId: defaultRole.id,
      status: UserStatus.ACTIVE,
      emailVerified: false,
      createdBy: '', // 自己创建
    });
    await this.userRepository.save(user);

    // 重新加载用户（包含角色）
    const fullUser = await this.userService.findOne(user.id);

    // 生成 Token
    return this.generateTokens(fullUser);
  }

  /**
   * 手机号登录（小智聊天页专用）
   */
  async phoneLogin(dto: PhoneLoginDto, ip?: string): Promise<AuthResponseDto> {
    const user = await this.userRepository.findOne({
      where: { phone: dto.phone, status: UserStatus.ACTIVE },
      relations: ['role'],
    });

    if (!user) {
      throw new UnauthorizedException('手机号或密码错误');
    }

    const isValid = await bcrypt.compare(dto.password, user.password);
    if (!isValid) {
      throw new UnauthorizedException('手机号或密码错误');
    }

    if (ip) {
      await this.userService.updateLastLogin(user.id, ip);
    }

    return this.generateTokens(user);
  }

  /**
   * 手机号注册（小智聊天页专用，只需手机号+密码）
   */
  async phoneRegister(dto: PhoneRegisterDto): Promise<AuthResponseDto> {
    // 检查手机号是否已注册
    const existingByPhone = await this.userRepository.findOne({
      where: { phone: dto.phone },
    });
    if (existingByPhone) {
      throw new BadRequestException('该手机号已被注册');
    }

    // 用手机号生成 email（避免唯一约束冲突）
    const autoEmail = `${dto.phone}@xiaozhi.local`;

    // 创建组织（个人用户）
    let organization = await this.organizationRepository.findOne({
      where: { name: `用户${dto.phone}的团队` },
    });
    if (!organization) {
      organization = this.organizationRepository.create({
        name: `用户${dto.phone}的团队`,
        type: OrganizationType.INDIVIDUAL,
      });
      organization = await this.organizationRepository.save(organization);
    }

    // 获取默认角色（查看者）
    const defaultRole = await this.roleRepository.findOne({
      where: { code: RoleType.VIEWER },
    });
    if (!defaultRole) {
      throw new BadRequestException('系统角色配置错误');
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // 创建用户：name 取手机号后4位
    const user = this.userRepository.create({
      email: autoEmail,
      password: hashedPassword,
      name: `用户${dto.phone.slice(-4)}`,
      phone: dto.phone,
      organizationId: organization.id,
      roleId: defaultRole.id,
      status: UserStatus.ACTIVE,
      emailVerified: false,
      createdBy: '',
    });
    await this.userRepository.save(user);

    // 重新加载用户
    const fullUser = await this.userService.findOne(user.id);
    return this.generateTokens(fullUser);
  }

  /**
   * 刷新 Token
   */
  async refreshToken(dto: RefreshTokenDto): Promise<AuthResponseDto> {
    try {
      // 验证刷新 Token
      const payload = this.jwtService.verify(dto.refreshToken, {
        secret: this.configService.getJwtSecret(),
      });

      // 检查是否是刷新 Token
      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('无效的刷新令牌');
      }

      // 获取用户
      const user = await this.userService.findOne(payload.sub);
      if (!user || user.status !== UserStatus.ACTIVE) {
        throw new UnauthorizedException('用户不存在或已被停用');
      }

      // 生成新 Token
      return this.generateTokens(user);
    } catch (error) {
      if (error instanceof UnauthorizedException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new UnauthorizedException('刷新令牌已过期或无效');
    }
  }

  /**
   * 验证 Token 并返回用户信息
   */
  async validateToken(token: string): Promise<User> {
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.getJwtSecret(),
      });

      if (payload.type !== 'access') {
        throw new UnauthorizedException('无效的访问令牌');
      }

      const user = await this.userService.findOne(payload.sub);
      if (!user || user.status !== UserStatus.ACTIVE) {
        throw new UnauthorizedException('用户不存在或已被停用');
      }

      return user;
    } catch (error) {
      if (error instanceof UnauthorizedException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new UnauthorizedException('令牌无效或已过期');
    }
  }

  /**
   * 获取当前用户信息
   */
  async getProfile(userId: string): Promise<UserInfoDto> {
    const user = await this.userService.findOne(userId);
    return UserInfoDto.fromUser(user);
  }

  /**
   * 修改密码
   */
  async changePassword(userId: string, dto: ChangePasswordDto): Promise<{ message: string }> {
    // 获取用户
    const user = await this.userService.findOne(userId);
    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    // 验证旧密码
    const isOldPasswordValid = await bcrypt.compare(dto.oldPassword, user.password);
    if (!isOldPasswordValid) {
      throw new BadRequestException('原密码错误');
    }

    // 检查新旧密码是否相同
    const isSamePassword = await bcrypt.compare(dto.newPassword, user.password);
    if (isSamePassword) {
      throw new BadRequestException('新密码不能与原密码相同');
    }

    // 加密新密码
    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    // 更新密码
    user.password = hashedPassword;
    // 清除密码重置令牌（如果有）
    user.passwordResetToken = undefined as any;
    user.passwordResetExpires = undefined as any;
    await this.userRepository.save(user);

    return { message: '密码修改成功' };
  }

  /**
   * 发送密码重置邮件
   */
  async sendPasswordResetEmail(email: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { email } });
    
    // 为了安全起见，即使用户不存在也返回成功
    // 防止通过错误消息枚举用户
    if (!user) {
      return { message: '如果邮箱存在，密码重置邮件已发送' };
    }

    // 生成重置令牌
    const resetToken = require('crypto').randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 3600000); // 1小时后过期

    user.passwordResetToken = resetToken;
    user.passwordResetExpires = resetExpires;
    await this.userRepository.save(user);

    // TODO: 发送邮件
    // await this.mailService.sendPasswordResetEmail(user.email, resetToken);

    this.logger.log(`密码重置令牌已生成: ${email}`);

    return { message: '如果邮箱存在，密码重置邮件已发送' };
  }

  /**
   * 重置密码（通过令牌）
   */
  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({
      where: {
        passwordResetToken: token,
        passwordResetExpires: MoreThan(new Date()),
      },
    });

    if (!user) {
      throw new BadRequestException('重置链接已过期或无效');
    }

    // 加密新密码
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 更新密码
    user.password = hashedPassword;
    user.passwordResetToken = undefined as any;
    user.passwordResetExpires = undefined as any;
    await this.userRepository.save(user);

    return { message: '密码重置成功' };
  }

  /**
   * 生成访问令牌和刷新令牌
   */
  private generateTokens(user: User): AuthResponseDto {
    const payload = {
      sub: user.id,
      email: user.email,
      organizationId: user.organizationId,
      role: user.role?.code || '',
      type: 'access',
    };

    const refreshPayload = {
      ...payload,
      type: 'refresh',
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.getJwtExpiration() || '7d',
    });

    const refreshToken = this.jwtService.sign(refreshPayload, {
      expiresIn: '30d',
    });

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: this.accessTokenExpiration,
      user: UserInfoDto.fromUser(user),
    };
  }
}
