import { Request } from "express";
import { TryCatch } from "../middlewares/error.js";
import { BaseQuery, NewProductRequestBody, SearchRequestQuery } from "../types/types.js";
import { Product } from "../models/product.model.js";
import ErrorHandler from "../utils/Error.Utility.js";
import { rm } from "fs";
import { myCache } from "../app.js";
import { invalidateChache } from "../utils/features.js";
// import {faker} from "@faker-js/faker"

//revalidate on new update or delete product and on new order
export const getLatestProducts = TryCatch(async(req, res, next) => {

    let products = [];

    if(myCache.has("latest-product")){
        products = JSON.parse(myCache.get("latest-product") as string);
    }else {
        products = await Product.find({}).sort({createdAt: -1}).limit(5);
        myCache.set("latest-product", JSON.stringify(products));
    }


    return res.status(201).json({
        status: true,
        message: "Product is created Successfully",
        products
    })
});

//revalidate on new update or delete product and on new order
export const getAllCategories = TryCatch(async(req, res, next) => {

    let categories;

    if(myCache.has("categories")){
        categories = JSON.parse(myCache.get("categories") as string);
    }else {
        categories = await Product.distinct("category");
        myCache.set("categories", JSON.stringify(categories));
    }

    return res.status(201).json({
        status: true,
        message: "Product is created Successfully",
        categories
    })
});

//revalidate on new update or delete product and on new order
export const getAdminProducts = TryCatch(async(req, res, next) => {

    let products;

    if(myCache.has("products")) {
        products = JSON.parse(myCache.get("products") as string);
    }else {
        products = await Product.find({});
        myCache.set("products", JSON.stringify(products));
    }

    return res.status(200).json({
        status: true,
        message: "Product is created Successfully",
        products
    });
});

export const getSingleProduct = TryCatch(async(req, res, next) => {
    let product;
    const { id } = req.params;
    if(myCache.has(`product-${id}`)) {
        product = JSON.parse(myCache.get(`product-${id}`) as string);
    }else {
        product = await Product.findById(id);
        myCache.set(`product-${id}`, JSON.stringify(product));
    }

    return res.status(201).json({
        status: true,
        message: "Product is created Successfully",
        product
    })
});

export const newProduct = TryCatch(async(req: Request<{}, {}, NewProductRequestBody>, res, next) => {
    const {product, price, stock, category} = req.body;
    const photo = req.file;

    if(!photo) return next(new ErrorHandler("Photo field is required", 400));

    if(!product || !price || !stock || !category){
        rm(photo.path, () => {
            console.log("Deleted");
        })
        return next(new ErrorHandler("All fields are required", 400));
    }

    await Product.create({
        product, 
        price, 
        stock, 
        category:category.toLowerCase(),
        photo: photo.path,
    });

    invalidateChache({ product: true, admin: true });

    return res.status(201).json({
        status: true,
        message: "Product is created Successfully"
    })

});

export const updateProduct = TryCatch(async(req, res, next) => {
    const {id} = req.params;
    const {product, price, stock, category} = req.body;
    const photo = req.file;

    const product_name = await Product.findById(id);

    if(!product_name) return next(new ErrorHandler("Invalid Product Id", 404));

    if(photo){
        rm(product_name.photo, () => {
            console.log("Old Photo Deleted");
        });
        product_name.photo = photo.path;
        return next(new ErrorHandler("All fields are required", 400));
    }

    if(product) product_name.product = product;
    if(price) product_name.price = price;
    if(stock) product_name.stock = stock;
    if(category) product_name.category = category;

    await product_name.save();

    invalidateChache({ product: true, admin: true, productId: String(product._id) });

    return res.status(200).json({
        status: true,
        message: "Product is Updated Successfully"
    })

});

export const deleteProduct = TryCatch(async(req, res, next) => {

    const { id } = req.params;
    const product = await Product.findById(id);

    if(!product) return next(new ErrorHandler("Product Not FOUND", 404));

    rm(product.photo!, () => {
        console.log("Product Photo Delete");
    })

    await Product.deleteOne();

    invalidateChache({ product: true,admin: true, productId: String(product._id) });

    return res.status(201).json({
        status: true,
        message: "Product is deleted Successfully"
    })
});

export const getAllProducts = TryCatch(async(req:Request<{},{},{},SearchRequestQuery>, res, next) => {
    const {search, sort, category, price} = req.query

    const page = Number(req.query.page) || 1;
    const limit = Number(process.env.PRODUCT_PER_PAGE) || 8;
    const skip = limit*(page-1);

    const baseQuery:BaseQuery = {};

    if(search) baseQuery.product = {
        $regex: search, //find patterns
        $options: "i",
    };

    if(price) baseQuery.price = {
        $lte: Number(price),
    };

    if(category) baseQuery.category = category;

    const [products, filteredOnlyProducts] = await Promise.all([
        Product.find(baseQuery)
            .sort( sort && {price:sort==="asc" ?  1 : -1})
            .limit(limit)
            .skip(skip),  
        Product.find(baseQuery),
    ]);

    const totalPage = Math.ceil(filteredOnlyProducts.length / limit);

    return res.status(201).json({
        status: true,
        products,
        totalPage
    });
});

// const generateRandomProducts = async(count: number = 10) => {
//     const products = [];

//     for (let i = 0; i < count; i++) {
//         const product = {
//             product: faker.commerce.productName(),
//             photo: "uploads/6cc75c8e-9f0b-4cc3-978b-2095074509c5.jpg", // Changed backslashes to forward slashes
//             price: faker.commerce.price(1500, 80000, 0), // Adjusted to use positional arguments
//             stock: faker.commerce.price(0, 100, 0), // Adjusted to use positional arguments
//             category: faker.commerce.department(),
//             createdAt: new Date(faker.date.past()),
//             updatedAt: new Date(faker.date.recent()),
//             _v: 0,
//         };
//         products.push(product);
//     }

//     await Product.insertMany(products); // Use insertMany for bulk creation
//     console.log({ success: true });
// }

// generateRandomProducts(40);


// const deleteRandomsProducts = async (count: number = 10) => {
//     const products = await Product.find({}).skip(4);

//     for(let i = 0; i < products.length; i++) {
//         const product = products[i];
//         await product.deleteOne();
//     }

//     console.log({success: true});
// }

// deleteRandomsProducts(38);

