import express from "express";
import { placeOrder, getMyOrders, getDeliveryBoyAssignment, updateOrderStatus, acceptOrder, getCurrentOrder, getOrderById, sendDeliveryOtp, verifyDeliveryOtp, verifyPayment } from "../controllers/order.controllers.js";

import isAuth from "../middleware/isAuth.js";


const orderRouter = express.Router();

orderRouter.post("/place-order", isAuth, placeOrder);
orderRouter.post("/verify-payment",isAuth,verifyPayment)
orderRouter.get("/my-orders", isAuth, getMyOrders);
orderRouter.get("/get-assignment", isAuth, getDeliveryBoyAssignment);
orderRouter.get("/get-current-order",isAuth, getCurrentOrder);
orderRouter.post("/send-delivery-otp", isAuth, sendDeliveryOtp);
orderRouter.post("/verify-delivery-otp", isAuth, verifyDeliveryOtp);
orderRouter.post("/update-status/:orderId/:shopId", isAuth, updateOrderStatus);
orderRouter.get("/accept-order/:assignmentId", isAuth, acceptOrder);
orderRouter.get("/get-order-by-id/:orderId", isAuth, getOrderById);
export default orderRouter;