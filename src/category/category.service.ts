import { UpdateCategoryUpdateDto } from './dto/category-update';
import { Injectable } from '@nestjs/common';
import { RedisService } from 'nestjs-redis';
import * as config from 'config';
import { Redis } from 'ioredis';
import ICategory from './category.interface';
import * as async from 'async';
import { v4 as uuid } from 'uuid';
import CategoryInterface from './category.interface';
import { CreateCategoryDto } from './dto/category-insert'
import { RedisPromisfy } from '../redisPromise/redis-promisfy.promisfy';
import { stat } from 'fs';


@Injectable()
export class CategoryService {
    private provider: Redis;
    constructor(
        private categoryProvider: RedisService
    ) {
        this.provider = this.categoryProvider.getClient(config.get("name"))
    }


    private async ifNameExistsInDB(name: string): Promise<boolean> {
        const items: Record<string, string> =
            await RedisPromisfy.getItems(this.provider, "categories");
        let found: boolean = false;
        await async.each(items, async item => {
            if (item.search('{') !== -1) {
                const category: ICategory = JSON.parse(item);
                const { categoryName } = category;
                if (categoryName === name) {
                    found = true;
                    return;
                }
            }

        })
        return found
    }
    public async createCategory(createCategoryDto: CreateCategoryDto): Promise<CreateCategoryDto | "Same category Name"> {
        const { categoryName } = createCategoryDto;
        try {
            const id = uuid();

            const ifCategoryNameExists: boolean = await this.ifNameExistsInDB(categoryName);
            if (!ifCategoryNameExists) return "Same category Name";
            const result = await RedisPromisfy.setOrInsertItemToDB(this.provider, "categories", id, createCategoryDto);
            if (result) {
                return createCategoryDto;
            }

        } catch (error) {
            throw error;
        }
    }
    public async getCategories(): Promise<Record<string, CategoryInterface>[]> {
        const { items, keys } = await RedisPromisfy.getItemsAndKeys(this.provider, "categories");
        const arr: Record<string, CategoryInterface>[] = [];
        await async.each(keys, async key => {
            const newValue: CategoryInterface = JSON.parse(items[key]);
            arr.push({
                [key]: newValue
            })
        })
        return arr;

    }

    public async getCategoryIdByName(categoryName: string): Promise<string> {
        const { items, keys } = await RedisPromisfy.getItemsAndKeys(this.provider, "categories");
        let foundId = "";
        await async.each(keys, async key => {
            const category: ICategory = JSON.parse(items[key]);
            const { categoryName: itemCategoryName } = category;
            if (itemCategoryName == categoryName) {
                foundId = key;
                return;
            }
        })
        return foundId;
    }

    public async updateCategory(id: string, updateCategoryDto: UpdateCategoryUpdateDto): Promise<boolean | "Can't update something that not exists"> {
        const exists = await RedisPromisfy.existsinHash(this.provider, "categories", id);
        if (!exists) return "Can't update something that not exists"
        const { items, keys } = await RedisPromisfy.getItemsAndKeys(this.provider, "categories")
        let status: boolean = false;
        await async.each(keys, async key => {
            if (key === id) {
                let category: ICategory = JSON.parse(items[key]);
                const { categoryName: updatedCategoryName, amountToStoreInKg: updatedAmount } = updateCategoryDto;
                if (updatedCategoryName) category.categoryName = updatedCategoryName;
                if (updatedAmount) category.amountToStoreInKg = updatedAmount;

                status = await RedisPromisfy.setOrInsertItemToDB(this.provider, "categories", id, category);
                return
            }
        })
        return status;


    }


}
