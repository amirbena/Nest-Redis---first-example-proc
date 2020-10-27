import {
    IsNotEmpty, IsString, MinLength, MaxLength,
    IsObject, IsEmail, IsNumber, Min, Max, IsNumberString,
    IsBooleanString
} from 'class-validator';

class AddressDto {
    @IsNotEmpty()
    @IsString()
    @MinLength(4)
    @MaxLength(25)
    city: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(4)
    @MaxLength(25)
    street: string;

    @IsNotEmpty()
    @IsNumber({ allowInfinity: false, allowNaN: false })
    @Min(0)
    @Max(1000)
    building: number;

    @IsNotEmpty()
    @IsNumberString()
    @MinLength(5)
    @MaxLength(7)
    postalCode: string;

}

export class CreateUserDto {
    @IsNotEmpty()
    @IsEmail()
    @MinLength(8)
    @MaxLength(100)
    email: string;

    @IsNotEmpty()
    @MinLength(6)
    @MaxLength(25)
    password: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(4)
    @MaxLength(50)
    fullName: string;

    @IsNotEmpty()
    @IsObject()
    address: AddressDto

    @IsNotEmpty()
    @IsBooleanString()
    isAdmin: string;




}