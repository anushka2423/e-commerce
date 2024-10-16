import { NextFunction, Request, Response } from "express";
import { User } from "../models/user.model.js";
import { NewUserRequestBody } from "../types/types.js";
import ErrorHandler from "../utils/Error.Utility.js";
import { TryCatch } from "../middlewares/error.js";
// import { Error } from "mongoose";

export const newUser = TryCatch(
    async(
        req:Request<{},{},NewUserRequestBody>, 
        res:Response, 
        next:NextFunction) => {
            // throw new Error(`while creating new user`);
            // return next(new ErrorHandler("Meri Error custom", 200));
            const {name, email, photo, gender, _id, dob} = req.body; 
            
            let user = await User.findById(_id);
            if(user) return res.status(200).json({
                success: true,
                message: `Welcome, ${name}`,
            })

            if(!_id || !name || !email || !photo || !gender || !dob) return next(new ErrorHandler("Please add all field", 400));

            user = await User.create({
                    name, 
                    email, 
                    photo, 
                    gender, 
                    _id,
                    dob: new Date(dob)
            });

            return res.status(201).json({
                success: true,
                message: `Welcome, ${user.name}`,
            });
        }
);

export const getAllUsers = TryCatch(async(req, res, next) => {
    const users = await User.find({});
    return res.status(200).json({
        success: true,
        message: "got all users",
        users
    })
});

export const getUser = TryCatch(async(req, res, next) => {
    const id = req.params.id;
    const user = await User.findById(id);

    if(!user) return next(new ErrorHandler("this user dosent exists", 400))

    return res.status(200).json({
        success: true,
        message: "get that user",
        user,
    })

});

export const deleteUser = TryCatch(async(req, res, next) => {
    const id = req.params.id;
    const user = await User.findById(id);

    if(!user) return next(new ErrorHandler("This user doesnt exists or invalid id name", 400));

    await User.deleteOne();

    return res.status(200).json({
        success: true,
        message: "User deleted Successfully",
    })
})