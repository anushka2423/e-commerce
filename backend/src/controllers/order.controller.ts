import { Request } from "express";
import { TryCatch } from "../middlewares/error.js";
import { NewOrderRequestBody } from "../types/types.js";
import { Order } from "../models/order.model.js";
import { invalidateChache, reduceStock } from "../utils/features.js";
import ErrorHandler from "../utils/Error.Utility.js";
import { myCache } from "../app.js";


export const newOrder = TryCatch(async(req:Request<{},{},NewOrderRequestBody>, res, next) => {
    const {
            shippingInfo, 
            orderItems, 
            user, 
            subtotal, 
            tax, 
            shippingCharges, 
            discount, 
            total
        } = req.body;

        if (!shippingInfo || !orderItems || !user || !subtotal || !tax || !total) return next(new ErrorHandler("Yarr kuch bhi place karega kya kuch daal to thaile me", 400));


    const order = await Order.create(
        {
            shippingInfo, 
            orderItems, 
            user, 
            subtotal, 
            tax,
            shippingCharges, 
            discount, 
            total
        }
    );

    await reduceStock(orderItems);

    invalidateChache({ product: true, order: true, admin: true, userId: user, productId: String(order.orderItems.map(i => i.productId)) });

    return res.status(201).json({
        success: true,
        message: "Order Placed Successfully"
    })
});


export const myOrders = TryCatch(async(req, res, next) => {

    const { id: user } = req.query;
    const key = `my-orders-${user}`

    let orders = [];

    if(myCache.has(key)) orders = JSON.parse(myCache.get(key) as string);
    else {
        orders = await Order.find({user});
        myCache.set(key,JSON.stringify(orders));
    }

    return res.status(201).json({
        success: true,
        message: "Your orders fetched successfully",
        orders
    })
});


export const allOrders = TryCatch(async(req, res, next) => {

    const key = `all-orders`

    let orders = [];

    if(myCache.has(key)) orders = JSON.parse(myCache.get(key) as string);
    else {
        orders = await Order.find().populate("user", "name");
        myCache.set(key,JSON.stringify(orders));
    }

    return res.status(201).json({
        success: true,
        message: "Your orders fetched successfully",
        orders
    })
});

export const getSingleOrder = TryCatch(async(req, res, next) => {

    const { id } = req.params;
    const key = `order-${id}`

    let order;

    if(myCache.has(key)) order = JSON.parse(myCache.get(key) as string);
    else {
        order = await Order.findById(id).populate("user", "name");
        if(!order) return next(new ErrorHandler("order hi nahi kiya tune 🙂", 404))
        myCache.set(key,JSON.stringify(order));
    }

    return res.status(201).json({
        success: true,
        message: "Your orders fetched successfully",
        order
    })
});


export const processOrder = TryCatch(async(req, res, next) => {
    const { id } = req.params;
    const order = await Order.findById(id);

    if(!order) return next(new ErrorHandler("Order Not Found", 404));

    switch(order.status) {
        case "Processing":
            order.status = "Shipped";
            break;
        case "Shipped":
            order.status = "Delivered";
            break;
        default:
            order.status = "Delivered";
            break;
    }

    await order.save();

    invalidateChache({ product: true, order: true, admin: true, userId: order.user , orderId: String(order._id)});

    return res.status(200).json({
        success: true,
        message: "Your Processed successfully",
    })
});


export const deleteOrder = TryCatch(async(req, res, next) => {
    const { id } = req.params;
    const order = await Order.findById(id);

    if(!order) return next(new ErrorHandler("Order Not Found", 404));

    await order.deleteOne();

    invalidateChache({ product: true, order: true, admin: true, userId: order.user , orderId: String(order._id)});

    return res.status(200).json({
        success: true,
        message: "You Deleted successfully",
    });
});