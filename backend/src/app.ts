import express from "express";
import { connectDB } from "./utils/dbConnection.js";
import { errorMiddleware } from "./middlewares/error.js";
import NodeCache from "node-cache";
import {config} from "dotenv"
import morgan from "morgan";
import Stripe from "stripe";
import cors from "cors";

config({
        path:"./.env"
});

const app = express();
const port = process.env.PORT || 3000;
const mongo_uri = process.env.MONGO_URI || "";
const stripeKey = process.env.STRIPE_KEY || "";

connectDB(mongo_uri);

export const stripe = new Stripe(stripeKey);
export const myCache = new NodeCache();

app.use(express.json());
app.use(morgan("dev"));
app.use(cors());

// Default Cross-Origin-Opener-Policy
app.use((req, res, next) => {
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
    next();
  });

// Importing Routes
import userRoute from "./routes/user.route.js";
import productRoute from "./routes/product.route.js";
import orderRoute from "./routes/order.route.js";
import paymentRoute from "./routes/payment.route.js";
import dashboardRoute from "./routes/stats.route.js";

// Removing COOP for specific OAuth-related routes (e.g., user login)
app.use("/api/v1/user", (req, res, next) => {
    res.removeHeader("Cross-Origin-Opener-Policy"); // Remove COOP for user routes
    next();
  }, userRoute);

// Using Routes
app.get("/", (req, res) => {
    res.send("API working with /api/v1")
})

app.use("/api/v1/user", userRoute);
app.use("/api/v1/product", productRoute);
app.use("/api/v1/order", orderRoute);
app.use("/api/v1/payment", paymentRoute);
app.use("/api/v1/dashboard", dashboardRoute);

app.use("/uploads", express.static("uploads"));
app.use(errorMiddleware as any);

app.listen(port, () => {
    console.log(`Server is working on http://localhost:${port}`);
})