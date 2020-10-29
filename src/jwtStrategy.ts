import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import * as config from 'config';

@Injectable()
export class JwtStartegy extends PassportStrategy(Strategy,"jwt") {
    private logger: Logger = new Logger("JwtStartegy");
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.JWT_SECRET || config.get('jwt.secret')
        })
    }
    async validate(payload: any) {
        const { password, email, isAdmin } = payload;
        return {
             password,
             email,
             isAdmin
        }
    }

}