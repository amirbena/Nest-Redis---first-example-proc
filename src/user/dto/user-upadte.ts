import {
    IsString, MinLength, MaxLength,
    IsObject, IsEmail, IsNumber, Min, Max, IsNumberString,
    IsBooleanString,
    IsOptional,
    IsIn
} from 'class-validator';
import { Role } from 'src/enums/enums';

class AddressDto {
    @IsOptional()
    @IsString()
    @MinLength(4)
    @MaxLength(25)
    city: string;

    @IsOptional()
    @IsString()
    @MinLength(4)
    @MaxLength(25)
    street: string;

    @IsOptional()
    @IsNumber({ allowInfinity: false, allowNaN: false })
    @Min(0)
    @Max(1000)
    building: number;

    @IsOptional()
    @IsNumberString()
    @MinLength(5)
    @MaxLength(7)
    postalCode: string;

}

export class UpdateUserDto {
    @IsOptional()
    @IsEmail()
    @MinLength(8)
    @MaxLength(100)
    email: string;

    @IsOptional()
    @MinLength(6)
    @MaxLength(25)
    password: string;

    @IsOptional()
    @IsString()
    @MinLength(4)
    @MaxLength(50)
    fullName: string;

    @IsOptional()
    @IsObject()
    address: AddressDto


    @IsOptional()
    @IsIn([Role.USER, Role.MODERATOR, Role.ADMIN, Role.SUPER_ADMIN])

    role: Role;




}