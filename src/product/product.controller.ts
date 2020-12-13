import { AuthGuard } from './../decorators/auth-guard.guard';
import { UpdateProductDto } from './dto/update-category-dto';
import { CreateProductDto } from './dto/create-product-dto';
import { ConvertProductPriceForUnit } from './../pipes/convert-product-pipe.pipe';
import { ProductService } from './product.service';
import { Controller, Logger, Get, Post, UsePipes, ValidationPipe, HttpCode, HttpStatus, Body,  Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { IProduct } from './product.interface';
import { IDetailedProduct } from './product.detailed.interface';
import { Role } from '../enums/enums';
import { Roles } from 'src/decorators/roles.decorator'
import { RolesGuard } from 'src/guards/roles-guard.guard';

@Controller('products')
@UseGuards(AuthGuard)
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
    @Roles(Role.ADMIN)
    @UseGuards(RolesGuard)
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
    @Roles(Role.ADMIN)
    @UseGuards(RolesGuard)
    async updateProduct(
        @Param("id") id: string,
        @Body() updateProductDto: UpdateProductDto,
    ): Promise<string> {
        const result = await this.productService.updateProduct(id, updateProductDto);
        return `Product updated successfully: ${result}`;
    }

    @Delete()
    @Roles(Role.ADMIN)
    @UseGuards(RolesGuard)
    async deleteProductsByIds(
        @Body("ids") ids: string[]
    ) {
        return await this.productService.deleteProductsByIds(ids);
    }

    @Get('/:id')
    @Roles(Role.USER)
    @UseGuards(RolesGuard)
    async getProductById(
        @Param("id") id: string,
    ): Promise<IProduct> {
        const product = await this.productService.getProductById(id);
        return product;
    }

}

