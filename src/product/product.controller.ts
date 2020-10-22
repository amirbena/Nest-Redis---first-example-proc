import { UpdateProductDto } from './dto/update-category-dto';
import { Response } from 'express';
import { CreateProductDto } from './dto/create-product-dto';
import { ConvertProductPriceForUnit } from './../pipes/convert-product-pipe.pipe';
import { ProductService } from './product.service';

import { Controller, Logger, Get, Post, UsePipes, ValidationPipe, HttpCode, HttpStatus, Body, Res, Patch, Param } from '@nestjs/common';
import { IProduct } from './product.interface';
import { IDetailedProduct } from './product.detailed.interface';

@Controller('products')
export class ProductController {
    private logger: Logger = new Logger("ProductController");
    constructor(
        private productService: ProductService

    ) { }

    @Get()
    async getProducts(): Promise<Record<string, IProduct>[]> {
        return await this.productService.getProducts();
    }

    @Post()
    @UsePipes(ConvertProductPriceForUnit, ValidationPipe)
    @HttpCode(HttpStatus.CREATED)
    async createProduct(
        @Body() createProductDto: CreateProductDto,
        @Res() res: Response
    ): Promise<Response<string>> {
        const result = await this.productService.createProduct(createProductDto);
        switch (result) {
            case "Same product in same category":
                res = res.status(HttpStatus.CONFLICT);
                break;

            case "Category isn't found into DB":
                res = res.status(HttpStatus.NOT_FOUND);
                break;

            case "Amount of entered category is bigger than capcity amount":
                res = res.status(HttpStatus.NOT_ACCEPTABLE);
            default:
                return res.status(HttpStatus.CREATED).send("Product added successfully");

        }
        return res.send(result);

    }


    @Get("detailed")
    async getDetailedProducts(): Promise<Record<string, IDetailedProduct>[]> {
        return this.productService.getDetailedProducts();
    }

    @Patch("/:id")
    async updateProduct(
        @Param("id") id: string,
        @Body() updateProductDto: UpdateProductDto,
        @Res() res: Response
    ) {
        const result = await this.productService.updateProduct(id, updateProductDto);
        this.logger.log(result);
        switch (result) {
            case "Can't update something that not exists":
            case "Category Is not Found":
                res = res.status(HttpStatus.NOT_FOUND)
                break;
            case "Can't update- change amount":
                res = res.status(HttpStatus.NOT_ACCEPTABLE);
                break;
            default:
                return res.send(`Product updated: ${result}`);


        }
        return res.send(result);
    }

}

