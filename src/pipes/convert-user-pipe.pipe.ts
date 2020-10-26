import { PipeTransform, Injectable, ArgumentMetadata, Logger } from '@nestjs/common';

@Injectable()
export class CategoryAmountPipe implements PipeTransform {
    private logger = new Logger("userPipe");
    transform(value: any, metadata: ArgumentMetadata) {
        if (value.address.building) value.address.building = parseInt(value.address.building);
        return value;
    }
}