import express from "express";
import { placeOrder, getMyOrders } from "../controllers/order.controllers.js";

import isAuth from "../middleware/isAuth.js";


const orderRouter = express.Router();

orderRouter.post("/place-order", isAuth, placeOrder);
orderRouter.get("/my-orders", isAuth, getMyOrders);
export default orderRouter;