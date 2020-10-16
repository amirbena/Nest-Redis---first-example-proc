import { UpdateCategoryDto } from './dto/category-update';
import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from 'nestjs-redis';
import * as config from 'config';
import { Redis } from 'ioredis';
import ICategory from './category.interface';
import * as async from 'async';
import { v4 as uuid, } from 'uuid';
import CategoryInterface from './category.interface';
import { CreateCategoryDto } from './dto/category-insert'
import { RedisPromisfy } from '../redisPromise/redis-promisfy.promisfy';


@Injectable()
export class CategoryService {
    private provider: Redis;
    private logger: Logger = new Logger("CategoryService");
    private deletedIds: string[] = [];
    constructor(
        private categoryProvider: RedisService
    ) {
        const dbConfig = config.get("db");

        const name: string = dbConfig["name"];
        this.provider = this.categoryProvider.getClient(name);
    }


    private async ifNameExistsInDB(name: string): Promise<boolean> {
        const items: Record<string, string> =
            await RedisPromisfy.getItems(this.provider, "categories");
        let found: boolean = false;
        await async.each(items, async item => {
            const category: ICategory = JSON.parse(item);
            const { categoryName } = category;
            if (categoryName === name) {
                found = true;
                return;
            }

        })
        return found
    }
    public async ifCategoryIdExistsInDB(id: string): Promise<boolean> {
        let isFound = false;
        const { keys } = await RedisPromisfy.getItemsAndKeys(this.provider, "categories");
        await async.each(keys, async key => {
            if (id === key) {
                isFound = true;
                return;
            }
        })
        return isFound;

    }
    public async createCategory(createCategoryDto: CreateCategoryDto): Promise<CreateCategoryDto | "Same category Name"> {
        const { categoryName } = createCategoryDto;
        try {
            const id = uuid();

            const ifCategoryNameExists: boolean = await this.ifNameExistsInDB(categoryName);
            if (ifCategoryNameExists) return "Same category Name";
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

    public async getCategoryContentByName(categoryName: string): Promise<ICategory> {
        const { items, keys } = await RedisPromisfy.getItemsAndKeys(this.provider, "categories");
        let foundCategory = null;
        await async.each(keys, async key => {
            const category: ICategory = JSON.parse(items[key]);
            const { categoryName: itemCategoryName } = category;
            if (itemCategoryName == categoryName) {
                foundCategory = category
                return;
            }
        })
        return foundCategory;
    }
    public async getCategoryObjByName(categoryName: string): Promise<Record<string, ICategory>> {
        const { items, keys } = await RedisPromisfy.getItemsAndKeys(this.provider, "categories");
        let foundCategory = null;
        await async.each(keys, async key => {
            const category: ICategory = JSON.parse(items[key]);
            const { categoryName: itemCategoryName } = category;
            if (itemCategoryName == categoryName) {
                foundCategory = {
                    [key]: category
                }
                return;
            }
        })
        return foundCategory;
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

    public async getCategoryById(id: string): Promise<ICategory> {
        const { items, keys } = await RedisPromisfy.getItemsAndKeys(this.provider, "categories");
        let foundCategory: ICategory = null;
        await async.each(keys, async key => {
            if (key == id) {
                foundCategory = JSON.parse(items[key]);
                return;
            }
        })
        return foundCategory;
    }
    public async updateCategory(id: string, updateCategoryDto: UpdateCategoryDto): Promise<boolean | "Can't update something that not exists"> {
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


    private async
    public async deleteCategoriesByNames(categoryNames: string[]): Promise<boolean> {
        const ids = []
        const { items: categoriesRecords, keys: keyRecords } = await RedisPromisfy.getItemsAndKeys(this.provider, "categories");
        await async.each(categoriesRecords, async categoryRecord => {
            const category: ICategory = JSON.parse(categoryRecord);
            if (categoryNames.indexOf(category.categoryName) !== -1) {
                /**
                 * @this Finding find if the fited id of all category records
                 */
                const id = await async.find(keyRecords, async key => {
                    const categoryRecord: ICategory = JSON.parse(categoriesRecords[key]);
                    return categoryRecord.categoryName === category.categoryName;
                })
                ids.push(id);

            }
        })
        return await this.deleteCategoriesByIds(ids);

    }

    public getDeletedIds(): string[] {
        return this.deletedIds;
    }

    public async deleteCategoriesByIds(ids: string[]): Promise<boolean> {
        this.deletedIds.concat(ids);
        return await RedisPromisfy.deleteItemsAccordingHashName(this.provider, "categories", ids);

    }


}
