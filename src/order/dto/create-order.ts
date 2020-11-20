import { IsArray, IsBoolean, IsDate, IsDateString, IsNotEmpty, IsNumber, Max, Min, min } from "class-validator";


export class CreateOrderDto {

    @IsNotEmpty()
    @IsArray()
    amounts: {
        productId: string,
        amount: number
    }[];

    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    @Max(100)
    totalPrice: number;

    @IsNotEmpty()
    @IsBoolean()
    isPaid: boolean;

    @IsNotEmpty()
    @IsDate()
    dateOfSupply: Date;
}