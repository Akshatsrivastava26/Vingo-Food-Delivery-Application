import mongoose from "mongoose";

const shopOrderItemSchema=new mongoose.Schema({
    item:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Item",
        required:true,
    },
    name:String,
    price:Number,
    quantity:Number,

},{timestamps:true})

const shopOrderSchema=new mongoose.Schema({
    shop:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Shop",
        required:true,
    },
    owner:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
    },
    subTotal:Number,
    shopOrderItems:[shopOrderItemSchema],
    status:{
        type:String,
        enum:["pending","preparing","out for delivery","delivered"],
        default:"pending",
    },
    assignment:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"DeliveryAssignment",
        default:null,
    },
    assignedDeliveryBoy:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        default:null,  
    },
},{timestamps:true})
const orderSchema=new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    paymentMethod:{
        type:String,
        enum:["cod","online"],
        required:true,
    },
    deliveryAddress:{
        text:String,
        coordinates:{
            latitude:Number,
            longitude:Number,
        },
        totalAmount:{
            type:Number,
        },
        shopOrders:[shopOrderSchema],
    },
},{timestamps:true});

const Order= mongoose.model("Order", orderSchema);  
export default Order;