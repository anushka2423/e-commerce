import mongoose from "mongoose";

const couponShema = new mongoose.Schema({
    code: {
        type: String,
        required: [true, "Please enter the coupon Code"],
        unique: true,
    },
    amount: {
        type: Number,
        required: [true, "Please enter the Discount amount"],
    }
})

export const Coupon = mongoose.model("Coupon", couponShema);