import { UserModule } from './../user/user.module';
import { Global, Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport'
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule} from '@nestjs/jwt';
import * as config from 'config';

const jwtConfig= config.get('jwt');

@Global()
@Module({
  imports: [
    UserModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || jwtConfig["secret"],
      signOptions: {
        expiresIn: jwtConfig["expiresIn"]
      }
    })

  ],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [AuthService]
})
export class AuthModule { }
