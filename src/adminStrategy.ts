import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import * as config from 'config';

@Injectable()
export class AdminStartegy extends PassportStrategy(Strategy,"admin") {
    private logger: Logger = new Logger("AdminStartegy");
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.JWT_SECRET || config.get('jwt.secret')
        })
    }
    async validate(payload: any) {
        const { password, email, isAdmin } = payload;
        this.logger.log(isAdmin);
        if(isAdmin){
            return {
                password,
                email,
                isAdmin
           }
        }
        return false;
    }

}