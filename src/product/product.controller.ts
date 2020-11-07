import { UpdateProductDto } from './dto/update-category-dto';
import { CreateProductDto } from './dto/create-product-dto';
import { ConvertProductPriceForUnit } from './../pipes/convert-product-pipe.pipe';
import { ProductService } from './product.service';

import { Controller, Logger, Get, Post, UsePipes, ValidationPipe, HttpCode, HttpStatus, Body,  Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { IProduct } from './product.interface';
import { IDetailedProduct } from './product.detailed.interface';
import { RolesAuthGuard } from '../guards/authGuard.guard';
import { Role } from '../enums/enums';

@Controller('products')
@UseGuards(new RolesAuthGuard(Role.USER))
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
    @UseGuards(new RolesAuthGuard(Role.ADMIN))
    @HttpCode(HttpStatus.CREATED)
    async createProduct(
        @Body() createProductDto: CreateProductDto,
    ): Promise<string> {
        const result = await this.productService.createProduct(createProductDto);
        return "Prdouct Added Successfully";
    }


    @Get("detailed")
    async getDetailedProducts(): Promise<Record<string, IDetailedProduct>[]> {
        return this.productService.getDetailedProducts();
    }

    @Patch("/:id")
    @UseGuards(new RolesAuthGuard(Role.ADMIN))
    async updateProduct(
        @Param("id") id: string,
        @Body() updateProductDto: UpdateProductDto,
    ): Promise<string> {
        const result = await this.productService.updateProduct(id, updateProductDto);
        return `Product updated successfully: ${result}`;
    }

    @Delete()
    @UseGuards(new RolesAuthGuard(Role.ADMIN))
    async deleteProductsByIds(
        @Body("ids") ids: string[]
    ) {
        return await this.productService.deleteProductsByIds(ids);
    }

    @Get('/:id')
    async getProductById(
        @Param("id") id: string,
    ): Promise<IProduct> {
        const product = await this.productService.getProductById(id);
        return product;
    }

}

