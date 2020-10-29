import { CreateCategoryDto } from './dto/category-insert';
import { CategoryService } from './category.service';
import { Response } from 'express';
import { Controller, Get, Post, UsePipes, ValidationPipe, Body, HttpCode, HttpStatus, Logger, Res, Param, Patch, Delete, UseGuards } from '@nestjs/common';
import ICategory from './category.interface';
import { CategoryAmountPipe } from 'src/pipes/convert-category-pipe.pipe';
import { UpdateCategoryDto } from './dto/category-update';
import { AuthGuard } from '@nestjs/passport';


@Controller('categories')
@UseGuards(AuthGuard('jwt'))
export class CategoryController {
    private logger = new Logger("CategoryController");
    constructor(
        private categoryService: CategoryService,
    ) { }

    @Get()
    async GetCategories(): Promise<Record<string, ICategory>[]> {
        return this.categoryService.getCategories()
    }

    @Post()
    @UseGuards(AuthGuard("admin"))
    @UsePipes(CategoryAmountPipe, ValidationPipe)
    @HttpCode(HttpStatus.CREATED)
    async createCategory(

        @Body() createCategoryDto: CreateCategoryDto,
        @Res() res: Response
    ) {
        this.logger.log(createCategoryDto.categoryName);
        const result = await this.categoryService.createCategory(createCategoryDto);
        if (result === "Same category Name") return res.status(HttpStatus.CONFLICT).send(result);
        this.logger.log(result);
        return res.status(HttpStatus.CREATED).send("Item created");
    }

    @Get("/:id")
    async getCategoryById(
        @Param('id') id: string,
        @Res() res: Response
    ): Promise<Response<ICategory>> {
        this.logger.log(id)
        const result = await this.categoryService.getCategoryById(id);
        if (!result) return res.status(HttpStatus.NOT_FOUND).send("No Category Found");
        return res.send(result);
    }

    @Patch('/:id')
    @UseGuards(AuthGuard("admin"))
    @UsePipes(CategoryAmountPipe, ValidationPipe)
    async updateCategoryById(
        @Param('id') id: string,
        @Body() updateCategoryDto: UpdateCategoryDto,
        @Res() res: Response
    ): Promise<Response<string>> {
        this.logger.log("Update category dto")
        const result = await this.categoryService.updateCategory(id, updateCategoryDto);
        if (result === "Can't update something that not exists") res.status(HttpStatus.NOT_FOUND).send(result);
        return res.send(`${id} isUpdated : ${result}`);
    }


    @Delete('ids/:ids')
    @UseGuards(AuthGuard("admin"))
    async DeleteCategoriesByIds(
        @Body('ids') ids: string[],
        @Res() res: Response
    ): Promise<Response<string>> {
        this.logger.log(ids);
        const result = await this.categoryService.deleteCategoriesByIds(ids);
        if (!result) return res.status(HttpStatus.NOT_FOUND).send("Something failed in deleting id");
        return res.send("Delete all succeed");
    }

    @Delete("names/:names")
    async DeleteCategoriesByNames(
        @Body('names') names: string[],
        @Res() res: Response
    ): Promise<Response<string>> {
        const result = await this.categoryService.deleteCategoriesByNames(names);
        if (!result) return res.status(HttpStatus.NOT_FOUND).send("Something failed in deleting id");
        return res.send("Delete all succeed");
    }
}
