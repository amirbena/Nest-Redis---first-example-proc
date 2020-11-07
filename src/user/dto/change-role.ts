import { IsIn, IsNotEmpty, IsString, IsUUID } from 'class-validator';


export class ChangeRoleDto {

    @IsNotEmpty()
    @IsString()
    @IsUUID("4")
    id: string;

    @IsNotEmpty()
    @IsIn(["MODERATOR", "USER", "ADMIN", "SUPER_ADMIN"])
    role: string
}