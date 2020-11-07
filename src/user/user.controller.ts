import { IUserShow, IUserAdminShow } from './user.interface';

import { RolesAuthGuard } from './../guards/authGuard.guard';
import { Controller, UseGuards, Logger, Get, Patch, Param, Body,  Delete, Req, ValidationPipe, UsePipes } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/user-upadte';
import { Role } from 'src/enums/enums';
import { ChangeRoleDto } from './dto/change-role';

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
        @Req() req: any
    ) {
        const { decodedHttp } = req;
        const allUsers = await this.userService.getAllUsersExceptCurrent(decodedHttp.email);
        return allUsers;
    }


    @Patch('/:id')
    @UseGuards(new RolesAuthGuard(Role.ADMIN))
    public async updateUser(
        @Param('id') id: string,
        @Body() updateUserDto: UpdateUserDto
    ) {
        const result = await this.userService.updateUserDetails(id, updateUserDto);
        return `User Updated: ${result}`;
    }

    @Patch("changeRole")
    @UseGuards(new RolesAuthGuard(Role.SUPER_ADMIN))
    @UsePipes(ValidationPipe)
    public async changeRole(
        @Body() changeRoleDto: ChangeRoleDto
    ): Promise<boolean> {
        const result = await this.userService.changeRoleToUser(changeRoleDto);
        return result;
    }

    @Delete('/:id')
    @UseGuards(new RolesAuthGuard(Role.SUPER_ADMIN))
    public async deleteUser(
        @Param("id") id: string
    ) {
        return await this.userService.deleteUser([id]);
    }
}
