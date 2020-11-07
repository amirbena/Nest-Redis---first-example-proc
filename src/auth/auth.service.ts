import { AuthCrediantls } from './dto/auth-credantials';
import { JwtPayload } from './jwt-payload.interface';
import { CreateUserDto } from './../user/dto/create-user';
import { UserService } from './../user/user.service';
import { Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt';
import { Role } from 'src/enums/enums';

@Injectable()
export class AuthService {
    private logger: Logger = new Logger("AuthService");
    constructor(
        private userService: UserService,
        private jwtService: JwtService
    ) { }

    public async signup(createUserDto: CreateUserDto): Promise<string> {
        const result = await this.userService.createUser(createUserDto);
        const payload: JwtPayload = {
            email: createUserDto.email,
            password: result,
            role: Role.USER
        }
        return await this.genToken(payload);
    }
    private async genToken(payload: JwtPayload): Promise<string> {
        const accessToken = await this.jwtService.signAsync(payload, {

        });
        return accessToken;

    }
    public async signin(authCrediantls: AuthCrediantls):
        Promise<string> {
        const { email, password } = authCrediantls;
        const user = await this.userService.getUserByEmail(email);
        if (!user) throw new NotFoundException("Email not found for user");
        const res = await bcrypt.compare(password, user.password);
        if (!res) throw new UnauthorizedException("failed to authienticate");
        const payload: JwtPayload = {
            email,
            password: user.password,
            role: user.role
        }

        return await this.genToken(payload);

    }
}
