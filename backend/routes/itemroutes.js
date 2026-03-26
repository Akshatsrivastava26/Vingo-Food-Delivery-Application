import express from "express";
// import { createEditShop } from "../controllers/shop.controllers";
import isAuth from "../middleware/isAuth.js";
import { addItem } from "../controllers/item.controllers.js";
import { upload } from "../middleware/multer.js";
import { editItem } from "../controllers/item.controllers.js";
import { getItemById } from "../controllers/item.controllers.js";
import { deleteItem } from "../controllers/item.controllers.js";
import { getItemByCity } from "../controllers/item.controllers.js";
import { getItemsByShop } from "../controllers/item.controllers.js";



const itemRouter = express.Router();

itemRouter.post("/add-item",isAuth,upload.single("image"),addItem);
itemRouter.post("/edit-item/:itemId",isAuth,upload.single("image"),editItem);
itemRouter.get("/get-by-id/:itemId",isAuth,getItemById);
itemRouter.delete("/delete-item/:itemId",isAuth,deleteItem);
itemRouter.get("/get-by-city/:city",isAuth,getItemByCity);
itemRouter.get("/get-by-shop/:shopId",isAuth,getItemsByShop);



export default itemRouter;