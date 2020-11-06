import { IUserShow, IUserAdminShow } from './user.interface';

import { RolesAuthGuard } from './../guards/authGuard.guard';
import { Response } from 'express';
import { Controller, UseGuards, Logger, Get, Patch, Param, Body, Res, HttpStatus, Delete, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/user-upadte';
import { Role } from 'src/enums/enums';

@Controller('users')

export class UserController {
    private logger: Logger = new Logger("UsersController");
    constructor(
        private userService: UserService
    ) { }

    @Get()
    public async getAllUsers(): Promise<Record<string, IUserShow>[]> {
        return this.userService.getAllUsers();
    }


    @Get("ExceptAdmin")
    @UseGuards(new RolesAuthGuard(Role.ADMIN))
    public async getAllExceptAdmin(
        @Req() req: any,
        @Res() res: Response
    ) {
        const { decodedHttp } = req;
        const allUsers = await this.userService.getAllUsersExceptCurrent(decodedHttp.email);
        res.send(allUsers);
    }


    @Patch('/:id')
    @UseGuards(new RolesAuthGuard(Role.ADMIN))
    public async updateUser(
        @Param('id') id: string,
        @Body() updateUserDto: UpdateUserDto,
        @Res() res: Response
    ) {
        const result = await this.userService.updateUserDetails(id, updateUserDto);
        if (result === "Can't update something that not exists") return res.status(HttpStatus.NOT_FOUND).send(result);
        res.send(result);
    }

    @Patch("makeSuperAdmin/:id")
    @UseGuards(new RolesAuthGuard(Role.SUPER_ADMIN))
    public async makeSuperAdmin(
        @Param("id") id: string,
        @Res() response: Response
    ) {
        const result = await this.userService.makeUserAsSuperAdmin(id);
        if (result === "User is not found") response.status(HttpStatus.NOT_FOUND).send(result);
        return response.send("User is made to admin");
    }

    @Delete('/:id')
    @UseGuards(new RolesAuthGuard(Role.SUPER_ADMIN))
    public async deleteUser(
        @Param("id") id: string
    ) {
        return await this.userService.deleteUser([id]);
    }
}
