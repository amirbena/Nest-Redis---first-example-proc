import { Injectable, PipeTransform,Logger,ArgumentMetadata } from "@nestjs/common";

@Injectable()
export class ConvertProductPriceForUnit implements PipeTransform{
    private logger = new Logger("categoryAmountPipe");
    transform(value: any, metadata: ArgumentMetadata) {
        if (value.priceForUnit) value.priceForUnit = parseInt(value.priceForUnit);
        return value;
    }
    
}