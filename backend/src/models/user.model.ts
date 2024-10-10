import mongoose, { Document, Schema } from "mongoose";
import validator from "validator";

interface IUser extends Document {
    _id: string;
    name: string;
    photo: string;
    email: string;
    role: "admin" | "user";
    gender: "male" | "female";
    dob: Date;
    createdAt: Date;
    updatedAt: Date;

    // virtual Attribute
    age: number;
}

const userSchema = new Schema(
    {
        _id: {
            type: String,
            required: [true, "Plese enter ID"]
        },
        name: {
            type: String,
            required: [true, "Plese enter name"]
        },
        photo: {
            type: String,
            required: [true, "Plese enter Photo"]
        },
        role: {
            type: String,
            enum: ["admin" , "user"],
            default: "user"
        },
        gender: {
            type: String,
            enum: ["male" , "female"],
            required: [true, "Plese enter gender"]
        },
        email: {
            type: String,
            unique: [true, "email already exists"],
            required: [true, "Plese enter email"],
            validate: validator.default.isEmail,
        },
        dob: {
            type: Date,
            required: [true, "Plese enter Date of Birth"]
        }
    },{ timestamps: true }
);

userSchema.virtual("age").get(function() {
    const today = new Date();
    const dob = this.dob;
    let age = today.getFullYear() - dob.getFullYear();

    if(today.getMonth() < dob.getMonth() || today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate()) {
        age--;
    }

    return age;
});

export const User = mongoose.model<IUser>("User", userSchema);