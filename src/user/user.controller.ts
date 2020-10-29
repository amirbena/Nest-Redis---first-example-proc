import { IUser } from './user.interface';
import { Controller, UseGuards, Logger, Get } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from './user.service';

@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UserController {
    private logger: Logger = new Logger("UsersController");
    constructor(
        private userService: UserService
    ){}

    @Get()
    public async getAllUsers():Promise<Record<string,IUser>[]>{
        return this.userService.getAllUsers();
    }
}
