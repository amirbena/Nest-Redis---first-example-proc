import { IsNotEmpty, MinLength, MaxLength, Min, Max, IsNumber } from 'class-validator';
export class CreateCategoryDto {

    @IsNotEmpty()
    @MinLength(4)
    @MaxLength(255)
    productName: string;

    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    @Max(1000)

    priceForUnit: number;


    @IsNotEmpty()
    @MinLength(4)
    @MaxLength(255)

    categoryName: string;

    


    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    @Max(5000000)

    amountToStoreInKg: number;
}