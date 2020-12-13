import { RolesGuard } from '../guards/roles-guard.guard';
import { IUserShow, IUserAdminShow } from './user.interface';
import { Controller, UseGuards, Logger, Get, Patch, Param, Body, Delete, Req, ValidationPipe, UsePipes, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/user-upadte';
import { Role } from 'src/enums/enums';
import { ChangeRoleDto } from './dto/change-role';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtPayload } from 'src/auth/jwt-payload.interface';

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


    @Get("ExeceptAdmin")
    @Roles(Role.ADMIN)
    @UseGuards(RolesGuard)
    public async getAllExceptAdmin(
        @Query("user") userToken: JwtPayload
    ) {
        const allUsers = await this.userService.getAllUsersExceptCurrent(userToken.email);
        return allUsers;
    }


    @Patch('/:id')
    @Roles(Role.ADMIN)
    @UseGuards(RolesGuard)
    public async updateUser(
        @Param('id') id: string,
        @Body() updateUserDto: UpdateUserDto
    ) {
        const result = await this.userService.updateUserDetails(id, updateUserDto);
        return `User Updated: ${result}`;
    }

    @Patch("changeRole")
    @UsePipes(ValidationPipe)
    @Roles(Role.SUPER_ADMIN)
    @UseGuards(RolesGuard)
    public async changeRole(
        @Body() changeRoleDto: ChangeRoleDto
    ): Promise<boolean> {
        const result = await this.userService.changeRoleToUser(changeRoleDto);
        return result;
    }

    @Delete('/:id')
    @Roles(Role.SUPER_ADMIN)
    @UseGuards(RolesGuard)
    public async deleteUser(
        @Param("id") id: string
    ) {
        return await this.userService.deleteUser([id]);
    }
}
