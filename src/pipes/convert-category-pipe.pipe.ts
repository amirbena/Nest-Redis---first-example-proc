import { PipeTransform, Injectable, ArgumentMetadata, Logger } from '@nestjs/common';

@Injectable()
export class CategoryAmountPipe implements PipeTransform {
    private logger = new Logger("categoryAmountPipe");
    transform(value: any, metadata: ArgumentMetadata) {
        if (value.amountToStoreInKg) value.amountToStoreInKg = parseInt(value.amountToStoreInKg);
        return value;
    }
}