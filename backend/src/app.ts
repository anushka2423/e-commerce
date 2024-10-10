import express from "express";
import { connectDB } from "./utils/dbConnection.js";
import { errorMiddleware } from "./middlewares/error.js";
import NodeCache from "node-cache";
import {config} from "dotenv"
import morgon from "morgan";

config({
        path:"./.env"
});

const app = express();
const port = process.env.PORT || 3000;
const mongo_uri = process.env.MONGO_URI || "";

connectDB(mongo_uri);

export const myCache = new NodeCache();

app.use(express.json());
app.use(morgon("dev"));

// Importing Routes
import userRoute from "./routes/user.route.js";
import productRoute from "./routes/product.route.js";
import orderRoute from "./routes/order.route.js";
import paymentRoute from "./routes/payment.route.js"

// Using Routes
app.get("/", (req, res) => {
    res.send("API working with /api/v1")
})

app.use("/api/v1/user", userRoute);
app.use("/api/v1/product", productRoute);
app.use("/api/v1/order", orderRoute);
app.use("/api/v1/payment", paymentRoute);

app.use("/uploads", express.static("uploads"));
app.use(errorMiddleware as any);

app.listen(port, () => {
    console.log(`Server is working on http://localhost:${port}`);
})