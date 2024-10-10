import express from "express";
import { adminOnly } from "../middlewares/auth.js";
import { allOrders, deleteOrder, getSingleOrder, myOrders, newOrder, processOrder } from "../controllers/order.controller.js";

const app = express.Router();

app.post("/new", newOrder);
app.get("/myOrder", myOrders);
app.get("/allOrder",adminOnly, allOrders);

app
  .route("/:id")
  .get(getSingleOrder)
  .put(adminOnly, processOrder)
  .delete(deleteOrder);

export default app;
