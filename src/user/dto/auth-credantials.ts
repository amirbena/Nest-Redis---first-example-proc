import { IsNotEmpty, MinLength, MaxLength, IsString } from 'class-validator';


export class AuthCrediantls{
   
    @IsNotEmpty()
    @IsString()
    @MinLength(8)
    @MaxLength(16)
    email: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    @MaxLength(25)
    password: string;
}