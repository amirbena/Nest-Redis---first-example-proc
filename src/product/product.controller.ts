import { Response } from 'express';
import { CreateProductDto } from './dto/create-product-dto';
import { ConvertProductPriceForUnit } from './../pipes/convert-product-pipe.pipe';
import { ProductService } from './product.service';

import { Controller, Logger, Get, Post, UsePipes, ValidationPipe, HttpCode, HttpStatus, Body, Res } from '@nestjs/common';

@Controller('products')
export class ProductController {
    private logger: Logger = new Logger("ProductController");
    constructor(
        private productService: ProductService
      
    ) {}

    @Get()
    async getProducts(){
        return await this.productService.getProducts();
    }
    
    @Post()
    @UsePipes(ConvertProductPriceForUnit,ValidationPipe)
    @HttpCode(HttpStatus.CREATED)
    async createProduct(
        @Body() createProductDto: CreateProductDto,
        @Res() res: Response
    ){
        
    }
}
