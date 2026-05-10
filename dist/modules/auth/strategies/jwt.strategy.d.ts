import { Strategy } from 'passport-jwt';
import { ConfigService } from '../../../config/config.service';
import { UserService } from '../../user/services/user.service';
import { TokenPayloadDto } from '../dto/auth-response.dto';
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly configService;
    private readonly userService;
    constructor(configService: ConfigService, userService: UserService);
    validate(payload: TokenPayloadDto): Promise<import("../../user/entities").User>;
}
export {};
