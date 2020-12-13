import { JwtPayload } from './../auth/jwt-payload.interface';
import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { Role } from '../enums/enums';


@Injectable()
export class RolesGuard implements CanActivate {

  constructor(private reflector: Reflector) { }

   
  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>("roles", [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) return true;
    const decode: JwtPayload = request.query["user"];
    if (decode.role < requiredRoles[0]) {
      throw new ForbiddenException("Can't access action");
    }
    return true;

  }
}
