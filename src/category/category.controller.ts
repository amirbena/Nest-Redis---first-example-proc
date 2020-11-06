
import { CreateCategoryDto } from './dto/category-insert';
import { CategoryService } from './category.service';
import {  Response } from 'express';
import { Controller, Get, Post, UsePipes, ValidationPipe, Body, HttpCode, HttpStatus, Logger, Res, Param, Patch, Delete, UseGuards, Req, Inject } from '@nestjs/common';
import ICategory from './category.interface';
import { CategoryAmountPipe } from 'src/pipes/convert-category-pipe.pipe';
import { UpdateCategoryDto } from './dto/category-update';
import { RolesAuthGuard } from 'src/guards/authGuard.guard';
import { Role } from 'src/enums/enums';



@UseGuards(new RolesAuthGuard(Role.USER))
@Controller('categories')
export class CategoryController {
    private logger = new Logger("CategoryController");
    constructor(
        private categoryService: CategoryService,

    ) { }

    @Get()
    async GetCategories(@Req() request: any): Promise<Record<string, ICategory>[]> {
        this.logger.log(request.decodedHttp)
        return this.categoryService.getCategories()
    }

    @Post()
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
    @UseGuards(new RolesAuthGuard(Role.USER))
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
    @UseGuards(new RolesAuthGuard(Role.ADMIN))
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
    @UseGuards(new RolesAuthGuard(Role.ADMIN))
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
    @UseGuards(new RolesAuthGuard(Role.ADMIN))
    async DeleteCategoriesByNames(
        @Body('names') names: string[],
        @Res() res: Response
    ): Promise<Response<string>> {
        const result = await this.categoryService.deleteCategoriesByNames(names);
        if (!result) return res.status(HttpStatus.NOT_FOUND).send("Something failed in deleting id");
        return res.send("Delete all succeed");
    }
}
