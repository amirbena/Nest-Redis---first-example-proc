import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService) { }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const authorizationHeader = request.headers["authorization"];
    if (!authorizationHeader) {
      throw new UnauthorizedException("No token provided");
    }
    let token = authorizationHeader.split(" ")[1];
    token = this.authService.getToken(token);
    request.query["user"] = token;
    return true;
  }
}
