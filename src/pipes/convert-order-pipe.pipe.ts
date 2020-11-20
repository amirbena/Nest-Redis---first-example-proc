import { Injectable, PipeTransform, Logger, ArgumentMetadata } from "@nestjs/common";

export class ConvertOrderPipe implements PipeTransform {
    private logger = new Logger("categoryAmountPipe");
    transform(value: any, metadata: ArgumentMetadata) {

        if (value.isPaid) value.isPaid = value.isPaid === "true" ? true : false;
        if (value.totalPrice) value.totalPrice = parseFloat(value.totalPrice);
        return value;
    }
}