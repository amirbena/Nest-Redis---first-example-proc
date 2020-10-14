import { CreateCategoryDto } from './dto/category-insert';
import { CategoryService } from './category.service';
import { Response } from 'express';
import { Controller, Get, Post, UsePipes, ValidationPipe, Body, HttpCode, HttpStatus, Logger, Res, Param, Patch, Delete } from '@nestjs/common';
import ICategory from './category.interface';
import { CategoryAmountPipe } from 'src/pipes/convert-category-pipe.pipe';
import { UpdateCategoryDto } from './dto/category-update';

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
    @UsePipes(CategoryAmountPipe, ValidationPipe)
    @HttpCode(HttpStatus.CREATED)
    async createCategory(

        @Body() createCategoryDto: CreateCategoryDto,
        @Res() res: Response
    ) {
        const result = await this.categoryService.createCategory(createCategoryDto);
        if (result === "Same category Name") return res.status(HttpStatus.CONFLICT).send(result);
        return "item created"
    }

    @Get("/:id")
    async getCategoryById(
        @Param('id') id: string,
        @Res() res: Response
    ) {
        const result = await this.categoryService.getCategoryById(id);
        if (!result) return res.status(HttpStatus.NOT_FOUND).send("No Category Found");
        return result;
    }

    @Patch('/:id')
    @UsePipes(ValidationPipe)
    async updateCategoryById(
        @Param('id') id: string,
        @Body('status') updateCategoryDto: UpdateCategoryDto,
        @Res() res: Response
    ) {
        const result = await this.categoryService.updateCategory(id, updateCategoryDto);
        if (result === "Can't update something that not exists") res.status(HttpStatus.NOT_FOUND).send(result);
        return `${id} isUpdated : true`
    }


    @Delete('ids/:ids')
    async DeleteCategoriesByIds(
        @Param('ids') ids: string[],
        @Res() res: Response
    ) {
        const result= await this.categoryService.deleteCategoriesByIds(ids);
        if(!result) return res.status(HttpStatus.NOT_FOUND).send("Something failed in deleting id");
        return "Delete all succeed";
    }

    @Delete("names/:names")
    async DeleteCategoriesByNames(
        @Param('names') names: string[],
        @Res() res: Response
    ){
        const result= await this.categoryService.deleteCategoriesByNames(names);
        if(!result) return res.status(HttpStatus.NOT_FOUND).send("Something failed in deleting id");
        return "Delete all succeed";
    }
}
