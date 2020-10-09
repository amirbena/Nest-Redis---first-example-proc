import { Logger } from '@nestjs/common';
import { IsNotEmpty, MinLength,IsNumber ,MaxLength, Min, Max} from 'class-validator';


export class CreateCategoryDto {

    @IsNotEmpty()
    @MinLength(4)
    @MaxLength(255)
    categoryName: string;
     

    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    @Max(10000000)
    
    amountToStoreInKg: number;
}