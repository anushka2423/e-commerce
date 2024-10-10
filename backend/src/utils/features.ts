import { myCache } from "../app.js";
import { Product } from "../models/product.model.js";
import { InvalidateCacheProps, OrderItemType } from "../types/types.js";

export const invalidateChache = async({product, order, admin, userId, orderId, productId}: InvalidateCacheProps) => {
    if(product) {
        const productKeys: string[] = ["latest-product", "categories", "products"];

        if(typeof productId === "string"){
            productKeys.push(`product-${productId}`);
            // console.log("LOL");
        }

        if(typeof productId === "object"){
            productId.forEach((i) => productKeys.push(`product-${i}`));
        }
        myCache.del(productKeys);
    }

    if(order) {
        const orderKeys: string[] = ["all-orders", `my-orders-${userId}`, `order-${orderId}`];

        myCache.del(orderKeys);
    }

    if(admin) {
    }
};

export const reduceStock = async(orderItems: OrderItemType[]) => {

    for(let order = 0; order < orderItems.length; order++) {
        const orderItem = orderItems[order];
        const product = await Product.findById(orderItem.productId);

        if(!product) throw new Error("Product not Found");
        product.stock -= orderItem.quantity;
        await product.save();
    }
}