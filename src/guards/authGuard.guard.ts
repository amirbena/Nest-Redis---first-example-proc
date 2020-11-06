
import { JwtPayload } from './../auth/jwt-payload.interface';

import { JwtService } from '@nestjs/jwt';
import { Role } from './../enums/enums';

import { CanActivate, ExecutionContext, ForbiddenException, Inject, Injectable, Logger, UnauthorizedException } from "@nestjs/common";

import * as config from 'config';

const jwtConfig = config.get('jwt');

@Injectable()
export class RolesAuthGuard implements CanActivate {
    private readonly authService: JwtService = new JwtService({
        secret: process.env.JWT_SECRET || jwtConfig["secret"],
        signOptions: {
            expiresIn: jwtConfig["expiresIn"]
        }
    })
    private logger: Logger = new Logger("RolesAuthGuard");

    constructor(
        private role: Role
    ) { }
    canActivate(
        context: ExecutionContext
    ): boolean {
        const request: Request = context.switchToHttp().getRequest();
        return this.validateRequest(request);
    }

    public validateRequest(request: any): boolean {
        let token = request.headers["authorization"].split(" ")[1];
        if (!token) throw new UnauthorizedException("User not login");
        const decode = this.authService.decode(token);
        if (decode["role"] < this.role) throw new ForbiddenException("NOT authroized to access data");
        request.decodedHttp = {
            email: decode["email"],
            password: decode["password"],
            role: decode["role"]
        };
        return true;

    }
}
