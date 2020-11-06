import { AuthCrediantls } from './dto/auth-credantials';
import { Response } from 'express';
import { CreateUserDto } from './../user/dto/create-user';
import { AuthService } from './auth.service';
import { Controller, Logger, Post, Body, Res, HttpStatus, UsePipes, ValidationPipe } from '@nestjs/common';

@Controller('auth')
export class AuthController {
    private logger: Logger = new Logger("AuthController");

    constructor(
        private authService: AuthService
    ) { }

    @Post("signup")
    @UsePipes(ValidationPipe)
    public async signup(
        @Body() createUserDto: CreateUserDto,
        @Res() res: Response
    ): Promise<Response> {
        const result = await this.authService.signup(createUserDto)
        if (result === "Email is exist for other user") return res.status(HttpStatus.NOT_FOUND).send(result);
        return res.send(result);

    }

    @Post('signin')
    @UsePipes(ValidationPipe)
    public async signin(
        @Body() authCrediantls: AuthCrediantls,
        @Res() res: Response
    ) {
        const result = await this.authService.signin(authCrediantls);
        if (result === "email not found") return res.status(HttpStatus.NOT_FOUND).send(result);
        if (result=== "failed to authienticate") return res.status(HttpStatus.UNAUTHORIZED).send(result)
        res.status(HttpStatus.OK).send(result);
    }
}
