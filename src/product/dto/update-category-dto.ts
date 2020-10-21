import { MinLength, MaxLength, Min, Max, IsNumber, IsOptional } from 'class-validator';
export class UpdateProductDto {

    @IsOptional()
    @MinLength(4)
    @MaxLength(255)
    productName: string;


    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(1000)

    priceForUnit: number;


    @IsOptional()
    @MinLength(4)
    @MaxLength(255)

    categoryName: string;





    @IsNumber()
    @Min(1)
    @Max(5000000)

    amountToStoreInKg: number;
}