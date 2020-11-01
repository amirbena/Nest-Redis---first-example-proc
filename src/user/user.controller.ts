import { Response } from 'express';
import { IUser } from './user.interface';
import { Controller, UseGuards, Logger, Get, Patch, Param, Body, Res, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/user-upadte';

@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UserController {
    private logger: Logger = new Logger("UsersController");
    constructor(
        private userService: UserService
    ) { }

    @UseGuards(AuthGuard("admin"))
    @Get()
    public async getAllUsers(): Promise<Record<string, IUser>[]> {
        return this.userService.getAllUsers();
    }

    @Patch('/:id')
    @UseGuards(AuthGuard("admin"))
    public async updateUser(
        @Param('id') id: string,
        @Body() updateUserDto: UpdateUserDto,
        @Res() res: Response
    ) {
        const result = await this.userService.updateUserDetails(id, updateUserDto);
        if (result === "Can't update something that not exists") return res.status(HttpStatus.NOT_FOUND).send(result);
        res.send(result);
    }
}
