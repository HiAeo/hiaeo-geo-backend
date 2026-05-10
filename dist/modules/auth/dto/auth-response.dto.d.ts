import { User } from '../../user/entities/user.entity';
export declare class UserInfoDto {
    id: string;
    email: string;
    name: string;
    phone?: string;
    avatar?: string;
    role: string;
    organizationId: string;
    static fromUser(user: User): UserInfoDto;
}
export declare class AuthResponseDto {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    expiresIn: number;
    user: UserInfoDto;
}
export declare class TokenPayloadDto {
    sub: string;
    email: string;
    organizationId: string;
    role: string;
    type: string;
    iat: number;
    exp: number;
}
