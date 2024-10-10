import mongoose, { Schema } from "mongoose";

const productSchema = new Schema(
    {
        product: {
            type: String,
            required: [true, "Plese enter name"]
        },
        photo: {
            type: String,
            required: [true, "Plese enter photo"]
        },
        price: {
            type: Number,
            required: [true, "Plese enter price"]
        },
        stock: {
            type: Number,
            required: [true, "Plese enter quantity of item"]
        },
        category: {
            type: String,
            required: [true, "Plese enter category"],
            trim: true,
        }
    },{timestamps: true}
);

export const Product = mongoose.model("Product", productSchema);