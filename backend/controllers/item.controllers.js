import Shop from "../models/shop.model.js";
import Item from "../models/item.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";



export const addItem=async (req,res)=>{
    try {
        const {name, category,foodType, price}=req.body;
        let image;
        if(req.file){
            image=await uploadOnCloudinary(req.file.path);
        }
        const shop=await Shop.findOne({owner:req.userId});
        if(!shop){
            return res.status(400).json({message:"Shop not found"});
        }
        const item = await Item.create({
            name, category,foodType, price, image, shop:shop._id
        })
        
        // Add item to shop's items array
        shop.items.push(item._id);
        await shop.save();
        
        // Populate and return the updated shop
        (await shop.populate('owner'))
        await shop.populate({
            path:"items",
            options:{sort:{updatedAt:-1}}
        })
        return res.status(201).json(shop);
    } catch (error) {
         return res.status(500).json({message:`Add item error ${error}`});
    }
}

export const editItem=async (req,res)=>{
    try {
        const itemId=req.params.itemId;
        const {name, category,foodType, price}=req.body;
        let image;
        if(req.file){
            image=await uploadOnCloudinary(req.file.path);
        }
        const item=await Item.findByIdAndUpdate(itemId,{
            name, category,foodType, price, image
        },{new:true})
        if(!item){
            return res.status(400).json({message:"Item not found"});
        }
        const shop=await Shop.findOne({owner:req.userId}).populate({
            path:"items",
            options:{sort:{updatedAt:-1}}
        })
        return res.status(200).json(item);
    } catch (error) {
         return res.status(500).json({message:`Edit item error ${error}`});
    }
}

export const getItemById=async (req,res)=>{
    try {
        const itemId = req.params.itemId;
        const item = await Item.findById(itemId);
        if (!item) {
            return res.status(400).json({ message: "Item not found" });
        }
        return res.status(200).json(item);
    } catch (error) {
        return res.status(500).json({ message: `Get item error ${error}` });
    }
}

export const deleteItem=async (req,res)=>{
    try {
        const itemId=req.params.itemId
        const item=await Item.findByIdAndDelete(itemId);
        if(!item){
            return res.status(400).json({message:"Item not found"});
        }
        const shop=await Shop.findOne({owner:req.userId});
        shop.items=shop.items.filter(i=>i._id.toString()!==itemId);
        await shop.save();
        await shop.populate({
            path:"items",
            options:{sort:{updatedAt:-1}}
        })
        return res.status(200).json(shop);
    } catch (error) {
        return res.status(500).json({message:`Delete item error ${error}`});
    }
}

export const getItemByCity=async (req,res)=>{
    try {
        const {city}=req.params;
        if(!city){
            return res.status(400).json({message:"City is required"});
        }
        const shops = await Shop.find({
            city:{$regex:new RegExp(`^${city}$`, "i")}
        }).populate('items')
        if(!shops || shops.length === 0){
           return res.status(404).json({message: "No shop found in this city"});
        }
        const shopIds=shops.map((shop)=>shop._id);

        const items=await Item.find({shop:{$in:shopIds}}).populate('shop');
        return res.status(200).json(items);
    } catch (error) {
        return res.status(500).json({message:`Get items by city error ${error}`});
    }
}

//items that belongs to particular shop
export const getItemsByShop=async (req,res)=>{
    try {
        const shopId=req.params.shopId;
        const shop=await Shop.findById(shopId).populate("items")
        if(!shop){
            return res.status(400).json({message:"Shop not found"});
        }
        return res.status(200).json({shop,items:shop.items});
    } catch (error) {
        return res.status(500).json({message:`Get items by shop error ${error}`});
        
    }
}