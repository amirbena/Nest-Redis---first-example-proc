import { MinLength, MaxLength, Min, Max } from 'class-validator';


export class UpdateCategoryDto{
    @MinLength(4)
    @MaxLength(255)
    categoryName: string;

    @Min(0)
    @Max(10000000)
    amountToStoreInKg: number;
}