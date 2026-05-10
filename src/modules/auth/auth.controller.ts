import { Controller, Post, Body, Get, UseGuards, Req, Ip } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, RefreshTokenDto, ChangePasswordDto } from './dto/auth.dto';
import { AuthResponseDto, UserInfoDto } from './dto/auth-response.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from './guards/optional-jwt-auth.guard';

@ApiTags('认证')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: '用户登录' })
  @ApiResponse({ status: 200, description: '登录成功', type: AuthResponseDto })
  @ApiResponse({ status: 401, description: '认证失败' })
  async login(@Body() dto: LoginDto, @Req() req: any, @Ip() ip: string): Promise<AuthResponseDto> {
    const clientIp = ip || req.ip || req.connection?.remoteAddress || 'unknown';
    return this.authService.login(dto, clientIp);
  }

  @Post('register')
  @ApiOperation({ summary: '用户注册' })
  @ApiResponse({ status: 201, description: '注册成功', type: AuthResponseDto })
  @ApiResponse({ status: 400, description: '请求参数错误或邮箱已存在' })
  async register(@Body() dto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(dto);
  }

  @Post('refresh')
  @ApiOperation({ summary: '刷新访问令牌' })
  @ApiResponse({ status: 200, description: '刷新成功', type: AuthResponseDto })
  @ApiResponse({ status: 401, description: '刷新令牌无效或已过期' })
  async refresh(@Body() dto: RefreshTokenDto): Promise<AuthResponseDto> {
    return this.authService.refreshToken(dto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取当前用户信息' })
  @ApiResponse({ status: 200, description: '成功', type: UserInfoDto })
  @ApiResponse({ status: 401, description: '未登录或令牌无效' })
  async getProfile(@Req() req: any): Promise<UserInfoDto> {
    return this.authService.getProfile(req.user.id);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '修改密码' })
  @ApiResponse({ status: 200, description: '密码修改成功' })
  @ApiResponse({ status: 400, description: '新密码格式不正确' })
  @ApiResponse({ status: 401, description: '原密码错误或未登录' })
  async changePassword(@Req() req: any, @Body() dto: ChangePasswordDto): Promise<{ message: string }> {
    return this.authService.changePassword(req.user.id, dto);
  }

  @Post('forgot-password')
  @ApiOperation({ summary: '发送密码重置邮件' })
  @ApiResponse({ status: 200, description: '邮件发送成功' })
  async forgotPassword(@Body('email') email: string): Promise<{ message: string }> {
    return this.authService.sendPasswordResetEmail(email);
  }

  @Post('reset-password')
  @ApiOperation({ summary: '通过令牌重置密码' })
  @ApiResponse({ status: 200, description: '密码重置成功' })
  @ApiResponse({ status: 400, description: '重置链接已过期或无效' })
  async resetPassword(
    @Body('token') token: string,
    @Body('newPassword') newPassword: string,
  ): Promise<{ message: string }> {
    return this.authService.resetPassword(token, newPassword);
  }
}
