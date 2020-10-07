import { IsNotEmpty, MinLength, MaxLength, Min, Max } from 'class-validator';


export class CreateCategoryDto {

    @IsNotEmpty()
    @MinLength(4)
    @MaxLength(255)
    categoryName: string;

    @IsNotEmpty()
    @Min(1)
    @Max(10000000)

    amountToStoreInKg: number;
}