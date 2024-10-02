import { User } from "../models/user.model.js";
import ErrorHandler from "../utils/Error.Utility.js";
import { TryCatch } from "./error.js";

//middleware to make sure only admin is allowed
export const adminOnly = TryCatch(async (req, res, next) => {
    const { id } = req.query;

    if(!id) return next(new ErrorHandler(" login to karle pehle 🤨", 401));
    
    const user = await User.findById(id);
    if(!user) return next(new ErrorHandler(" Tu exist hi nahi karta h mere laal 🤺", 401));
    if(user.role != "admin") return next(new ErrorHandler(" Tu user h bae user ki haad me reh jada 3-5 kiya to paise kat lungi 🐷", 401));

    next();

})

// "/api/v1/user/itsId?key=24"
// req.query = key=24