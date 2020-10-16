import { MinLength, MaxLength, Min, Max, IsNumber } from 'class-validator';
export class UpdateProductDto {


    @MinLength(4)
    @MaxLength(255)
    productName: string;


    @IsNumber()
    @Min(1)
    @Max(1000)

    priceForUnit: number;



    @MinLength(4)
    @MaxLength(255)

    categoryName: string;





    @IsNumber()
    @Min(1)
    @Max(5000000)

    amountToStoreInKg: number;
}