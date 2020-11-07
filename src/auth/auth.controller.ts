import { AuthCrediantls } from './dto/auth-credantials';
import { CreateUserDto } from './../user/dto/create-user';
import { AuthService } from './auth.service';
import { Controller, Logger, Post, Body, HttpStatus, UsePipes, ValidationPipe, HttpCode } from '@nestjs/common';

@Controller('auth')
export class AuthController {
    private logger: Logger = new Logger("AuthController");

    constructor(
        private authService: AuthService
    ) { }

    @Post("signup")
    @UsePipes(ValidationPipe)
    public async signup(
        @Body() createUserDto: CreateUserDto
    ): Promise<string> {
        const result = await this.authService.signup(createUserDto)
        return result;

    }

    @Post('signin')
    @UsePipes(ValidationPipe)
    @HttpCode(HttpStatus.OK)
    public async signin(
        @Body() authCrediantls: AuthCrediantls,
    ) {
        const result = await this.authService.signin(authCrediantls);
        return result;
    }
}
