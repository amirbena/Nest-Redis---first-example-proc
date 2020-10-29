import { UpdateProductDto } from './dto/update-category-dto';
import { IDetailedProduct } from './product.detailed.interface';
import { RedisPromisfy } from './../redisPromise/redis-promisfy.promisfy';
import { CreateProductDto } from './dto/create-product-dto';
import { IProduct } from './product.interface';
import { CategoryService } from './../category/category.service';
import { Injectable, Logger } from '@nestjs/common';
import { Redis } from 'ioredis';
import { RedisService } from 'nestjs-redis';
import * as config from 'config';
import { v4 as uuid } from 'uuid';
import async from 'async';

import ICategory from 'src/category/category.interface';
import { TABLE_NAMES } from 'src/tableNames/names.table';


@Injectable()
export class ProductService {
    private provider: Redis;
    private logger = new Logger("ProductService");
    private categoryService: CategoryService;
    constructor(
        productProvider: RedisService,
        categoryService: CategoryService
    ) {
        const dbConfig = config.get("db");
        const name: string = dbConfig["name"];
        this.provider = productProvider.getClient(name);
        this.categoryService = categoryService;
    }
    private async isProductHasFoundIntoDB(productName: string, categoryId: string): Promise<boolean> {
        let isFound = false;
        const items = await RedisPromisfy.getItems(this.provider, TABLE_NAMES.PRODUCTS);
        await async.each(items, async item => {
            const product: IProduct = JSON.parse(item);
            const { name, categoryId: itemCategory } = product;
            if (name === productName && categoryId === itemCategory) {
                isFound = true;
                return;
            }
        })
        return isFound;
    }
    private async destroyAllNotAssociatedProudcts(items = {}, keys = []): Promise<Record<string, string>> {
        if (!Object.keys(items).length) {
            const newItems = await RedisPromisfy.getItems(this.provider, TABLE_NAMES.PRODUCTS);
            items = newItems;
            if (!keys.length) keys = Object.keys(newItems);
        }
        if (!keys.length) keys = Object.keys(items);
        const ids = [], categoryKeys = [];
        const deletedIds: string[] = this.categoryService.getDeletedIds();
        await async.each(keys, async key => {
            const product: IProduct = JSON.parse(items[key]);
            if (deletedIds.includes(product.categoryId)) {
                ids.push(key);
                categoryKeys.push(product.categoryId);
            }
        })
        if (!ids.length) return items;
        await RedisPromisfy.deleteItemsAccordingHashName(this.provider, TABLE_NAMES.PRODUCTS, ids);
        const newItems = {};
        await async.each(keys, async key => {
            if (!categoryKeys.includes(key)) {
                newItems[key] = items[key];
            }
        })
        return newItems;
    }
    public async createProduct(createProductDto: CreateProductDto): Promise<IProduct | "Category isn't found into DB"
        | "Same product in same category" | "Amount of entered category is bigger than capcity amount"> {


        const { categoryName, priceForUnit, productName, amountToStoreInKg } = createProductDto;
        const categoryObj = await this.categoryService.getCategoryObjByName(categoryName);

        if (!categoryObj) { await this.destroyAllNotAssociatedProudcts(); return "Category isn't found into DB"; }

        const categoryId = Object.keys(categoryObj)[0];
        const foundCategory = categoryObj[categoryId];


        const isFound = await this.isProductHasFoundIntoDB(productName, categoryId);
        if (isFound) return "Same product in same category";
        if (foundCategory.amountToStoreInKg < amountToStoreInKg) return "Amount of entered category is bigger than capcity amount"
        const id = uuid();
        const product: IProduct = {
            name: productName,
            priceForUnit,
            categoryId,
            amountToStoreInKg
        }
        const result = await RedisPromisfy.setOrInsertItemToDB(this.provider, TABLE_NAMES.PRODUCTS, id, product);
        if (result) {
            foundCategory.amountToStoreInKg = foundCategory.amountToStoreInKg - amountToStoreInKg;
            await this.categoryService.updateCategory(categoryId, foundCategory);
            return product;
        }
    }

    public async getProducts(): Promise<Record<string, IProduct>[]> {
        const { items, keys } = await RedisPromisfy.getItemsAndKeys(this.provider, TABLE_NAMES.PRODUCTS);
        const products: Record<string, IProduct>[] = await async.map(keys, async key => {
            const newItem: IProduct = JSON.parse(items[key]);
            return {
                [key]: newItem
            }
        })
        return products;
    }

    public async getDetailedProducts(): Promise<Record<string, IDetailedProduct>[]> {
        const object = await RedisPromisfy.getItemsAndKeys(this.provider, TABLE_NAMES.PRODUCTS);
        const products = [];
        await async.each(object.keys, async key => {
            this.logger.log(object.items[key]);
            const product: IProduct = JSON.parse(object.items[key]);
            const category = await this.categoryService.getCategoryById(product.categoryId);
            if (!category) { object.items = await this.destroyAllNotAssociatedProudcts(); }
            const detailedProduct: IDetailedProduct = {
                categoryName: category.categoryName,
                name: product.name,
                amountToStoreInKg: product.amountToStoreInKg,
                priceForUnit: product.priceForUnit
            }
            products.push({
                [key]: detailedProduct
            })
        })
        return products;
    }

    public async updateProduct(id: string, updateProductDto: UpdateProductDto): Promise<string | boolean> {
        const exists = await RedisPromisfy.existsinHash(this.provider, TABLE_NAMES.PRODUCTS, id);
        if (!exists) return "Can't update something that not exists";
        let textFailure = "";
        const itemsAndKeys = await RedisPromisfy.getItemsAndKeys(this.provider, TABLE_NAMES.PRODUCTS)
        this.logger.log(id);
        this.logger.log(updateProductDto);
        let status: boolean = false;
        await async.each(itemsAndKeys.keys, async key => {
            if (key === id) {
                let product: IProduct = JSON.parse(itemsAndKeys.items[key]);
                const category: ICategory = await this.categoryService.getCategoryById(product.categoryId);
                if (!category) {
                    itemsAndKeys.items = await this.destroyAllNotAssociatedProudcts(itemsAndKeys.items, itemsAndKeys.keys);
                    textFailure = "Category Is not Found"; return
                }
                const { amountToStoreInKg, priceForUnit, productName } = updateProductDto;
                if (amountToStoreInKg && amountToStoreInKg > product.amountToStoreInKg) { textFailure = "Can't update- change amount"; return; }
                else {
                    product.amountToStoreInKg = amountToStoreInKg;
                    category.amountToStoreInKg -= amountToStoreInKg;
                    await this.categoryService.updateCategory(product.categoryId, category);
                }
                if (priceForUnit) product.priceForUnit = priceForUnit;
                if (productName) product.name = productName;

                status = await RedisPromisfy.setOrInsertItemToDB(this.provider, TABLE_NAMES.PRODUCTS, id, product);
                return
            }
        })
        return textFailure !== "" ? textFailure : status
    }

    public async getProductById(id: string): Promise<IProduct> {
        let foundProduct: IProduct = null;
        const productString = await RedisPromisfy.getItemByKey(this.provider, TABLE_NAMES.PRODUCTS, id);
        if (productString !== "" && productString !== "nill") foundProduct = JSON.parse(productString);
        return foundProduct
    }


    public async deleteProductsByIds(ids: string[]): Promise<number> {
        let countDeleted: number = 0;
        const { items, keys } = await RedisPromisfy.getItemsAndKeys(this.provider, TABLE_NAMES.PRODUCTS);
        await async.each(keys, async key => {
            if (ids.indexOf(key) !== -1) {
                countDeleted += 1;
                const product: IProduct = JSON.parse(items[key]);
                const category: ICategory = await this.categoryService.getCategoryById(product.categoryId);
                if (!category) return;
                category.amountToStoreInKg += product.amountToStoreInKg;
                await this.categoryService.updateCategory(product.categoryId, category);
            }
        })
        await RedisPromisfy.deleteItemsAccordingHashName(this.provider, TABLE_NAMES.PRODUCTS, ids);
        return countDeleted;
    }







}
