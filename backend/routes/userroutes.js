import express from "express";
import { getCurrentUser } from "../controllers/user.controllers.js";
import { updateUserLocation } from "../controllers/user.controllers.js";
import isAuth from "../middleware/isAuth.js";
const userRouter = express.Router();

userRouter.get("/current-user",isAuth,getCurrentUser);
userRouter.post("/update-location",isAuth,updateUserLocation);

export default userRouter;