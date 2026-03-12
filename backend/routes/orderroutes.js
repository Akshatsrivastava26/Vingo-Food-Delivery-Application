import express from "express";
import { placeOrder } from "../controllers/order.controllers.js";
import isAuth from "../middleware/isAuth.js";






const orderRouter = express.Router();

orderRouter.post("/place-order", isAuth, placeOrder);
export default orderRouter;