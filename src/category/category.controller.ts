
import { CreateCategoryDto } from './dto/category-insert';
import { CategoryService } from './category.service';
import { Controller, Get, Post, UsePipes, ValidationPipe, Body,  Logger,  Param, Patch, Delete, UseGuards, NotFoundException } from '@nestjs/common';
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
    async GetCategories(): Promise<Record<string, ICategory>[]> {
        return this.categoryService.getCategories()
    }

    @Post()
    @UsePipes(CategoryAmountPipe, ValidationPipe)
    async createCategory(
        @Body() createCategoryDto: CreateCategoryDto,
    ) {
        this.logger.log(createCategoryDto.categoryName);
        const result = await this.categoryService.createCategory(createCategoryDto);
        return "Category Created";
    }

    @Get("/:id")
    @UseGuards(new RolesAuthGuard(Role.USER))
    async getCategoryById(
        @Param('id') id: string,
    ): Promise<ICategory> {
        const result = await this.categoryService.getCategoryById(id);
        return result
    }

    @Patch('/:id')
    @UseGuards(new RolesAuthGuard(Role.ADMIN))
    @UsePipes(CategoryAmountPipe, ValidationPipe)
    async updateCategoryById(
        @Param('id') id: string,
        @Body() updateCategoryDto: UpdateCategoryDto,
    ): Promise<string> {
        const result = await this.categoryService.updateCategory(id, updateCategoryDto);
        return `${id} isUpdated : ${result}`
    }


    @Delete('ids/:ids')
    @UseGuards(new RolesAuthGuard(Role.ADMIN))
    async DeleteCategoriesByIds(
        @Body('ids') ids: string[]
    ): Promise<string> {
        const result = await this.categoryService.deleteCategoriesByIds(ids);
        if (!result) throw new NotFoundException("Something failed in deleting id");
        return "Delete all succeed";
    }

    @Delete("names/:names")
    @UseGuards(new RolesAuthGuard(Role.ADMIN))
    async DeleteCategoriesByNames(
        @Body('names') names: string[],
    ): Promise<string> {
        const result = await this.categoryService.deleteCategoriesByNames(names);
        if (!result) throw new NotFoundException("Something failed in deleting id");
        return "Delete all succeed";
    }
}
