import { CreateCategoryDto } from './dto/category-insert';
import { CategoryService } from './category.service';
import { Response } from 'express';
import { Controller, Get, Post, UsePipes, ValidationPipe, Body, HttpCode, HttpStatus, Logger, Res, ParseIntPipe } from '@nestjs/common';
import ICategory from './category.interface';
import { CategoryAmountPipe } from 'src/pipes/convert-category-pipe.pipe';

@Controller('categories')
export class CategoryController {
    private logger = new Logger("CategoryController");
    constructor(
        private categoryService: CategoryService
    ) { }

    @Get()
    async GetCategories(): Promise<Record<string, ICategory>[]> {
        return this.categoryService.getCategories()
    }

    @Post()
    @UsePipes(CategoryAmountPipe,ValidationPipe)
    @HttpCode(HttpStatus.CREATED)
    async createCategory(
       
        @Body() createCategoryDto: CreateCategoryDto,
        @Res() res: Response
    ) {
        const result = await this.categoryService.createCategory(createCategoryDto);
        if (result === "Same category Name") return res.status(HttpStatus.CONFLICT).send(result);
        return "item created"
    }
}
