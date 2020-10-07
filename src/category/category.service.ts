import { Injectable } from '@nestjs/common';
import { RedisService } from 'nestjs-redis';
import * as config from 'config';
import { Redis } from 'ioredis';
import * as async from 'async';
import CategoryInterface from './category.interface';
import { CreateCategoryDto } from './dto/category-insert'
import { RedisPromisfy } from '../redisPromise/redis-promisfy.promisfy';
@Injectable()
export class CategoryService {
    private provider: Redis;
    constructor(
        private categoryProvider: RedisService
    ) {
        this.provider = this.categoryProvider.getClient(config.get("name"))
    }

    public async createCategory(createCategoryDto: CreateCategoryDto): Promise<CreateCategoryDto | string> {
        const { amountToStoreInKg, categoryName } = createCategoryDto;
        try {
            const ifCategoryNameExists: boolean = await RedisPromisfy.existsinHash(this.provider, "categories", categoryName);
            if (!ifCategoryNameExists) return "Same category";

            const valueToInsert = {
                amountToStoreInKg
            }
            const result = await RedisPromisfy.insertToItemToDB(this.provider, "categories", categoryName, valueToInsert);
            if (result) {
                return createCategoryDto;
            }

        } catch (error) {
            throw error;
        }
    }
    public async getCategories(): Promise<Record<string, CategoryInterface>[]> {
        const items = await RedisPromisfy.getItems(this.provider, "categories");
        const arr: Record<string, CategoryInterface>[] = [];
        await async.each(items, async item => {
            const newValue: CategoryInterface = JSON.parse(items[item]);
            arr.push({
                item: newValue
            })
        })
        return arr;


    }


}
