import { MinLength, MaxLength, Min, Max, IsOptional } from 'class-validator';


export class UpdateCategoryDto{
    @IsOptional()
    @MinLength(4)
    @MaxLength(255)
    categoryName: string;

    @IsOptional()
    @Min(0)
    @Max(100000)
    amountToStoreInKg: number;
}