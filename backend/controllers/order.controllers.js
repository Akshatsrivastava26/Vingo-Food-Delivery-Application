import Shop from "../models/shop.model.js";
import Order from "../models/order.model.js";

export const placeOrder = async (req, res) => {
  try {
    const { cartItems, paymentMethod, deliveryAddress, totalAmount } = req.body;
    if (!cartItems || cartItems.length == 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }
    if (
      !deliveryAddress ||
      !deliveryAddress.text ||
      deliveryAddress.latitude === undefined ||
      deliveryAddress.longitude === undefined
    ) {
      return res.status(400).json({ message: "Invalid delivery address" });
    }

    const groupItemsByShop = {}

cartItems.forEach((item) => {

    const shopId = item.shop?._id || item.shop;   // FIX

    if(!groupItemsByShop[shopId]){
        groupItemsByShop[shopId] = []
    }

    groupItemsByShop[shopId].push(item)

});
    const shopOrders = await Promise.all(Object.keys(groupItemsByShop).map(async (shopId) => {
        const shop = await Shop.findById(shopId).populate("owner");
        if (!shop) {
          return res.status(404).json({ message: `Shop with id ${shopId} not found` });
        }
        const items = groupItemsByShop[shopId];
        const subtotal = items.reduce((sum, i) => sum + Number(i.price) * Number(i.quantity),0  );
        return {
          shop: shop._id,
          shopOwner: shop.owner._id,
          subtotal,
          shopOrderItems: items.map((i) => ({
            item: i.id,
            price: i.price,
            quantity: i.quantity,
            name: i.name,
          })),
        };
      }),
    );

    const newOrder = await Order.create({
      user: req.userId,
      paymentMethod,
      deliveryAddress,
      totalAmount,
      shopOrders,
    });
     
    await newOrder.populate("shopOrders.shopOrderItems.item","name image price");
    await newOrder.populate("shopOrders.shop","name");
     

    return res.status(201).json({ message: "Order placed successfully", order: newOrder });
  } catch (error) {
    console.error("ORDER ERROR:", error);
    res.status(500).json({message: "Error placing order",error: error.message});
  }
};

//User ke saare Orders ko get karne ke liye controllers
export const getMyOrders= async (req,res) => {
  try {
    const user=await UserActivation.findById(req.userId);
    if(user.role == "user"){
      const orders=(await Order.find({user:req.userId}))
    .sort({createdAt:-1})
    .populate("shopOrders.shop","name")
    .populate("shopOrders.owner", "name email mobile")
    .populate("shopOrders.shopOrdersItems.item", "name image price")

    return res.status(200).json({orders});
    } else if(user.role == "owner"){
      const orders=(await Order.find({"shopOrders.owner":req.userId}))
    .sort({createdAt:-1})
    .populate("shopOrders.shop","name")
    .populate("user")
    .populate("shopOrders.shopOrdersItems.item", "name image price")

    const filteredOrder=orders.map((order) => ({
      _id: order._id,
      paymentMethod: order.paymentMethod,
      user: order.user,
      shopOrders: order.shopOrders.find(o=>o.owner._id==req.userId),
      createdAt: order.createdAt,
      deliveryAddress: order.deliveryAddress,
    }))

    return res.status(200).json({filteredOrder});

    }
    
  } catch (error) {
    console.error("ORDER ERROR:", error);
    res.status(500).json({message: "get user order error ", error: error.message});
  }
}

// controller for owner to update the status of order
export const updateOrderStatus= async (req,res) => {
  try {
    const {orderId, shopId}=req.params;
    const {status}=req.body;
    const order= await Order.findById(orderId);

    const shopOrder=await order.shopOrders.find(o=>o.shop==shopId)
    if(!shopOrder){
      return res.status(400).json({message:"Shop order not found"});
    }
    shopOrder.status=status;
    await shopOrder.save();
    await order.save();
    // await shopOrder.populate("shopOrderItems.item","name image price");
    return res.status(200).json(shopOrder.status);
  } catch (error) {
    return res.status(500).json({message:`order status error ${error.message}`});
    
  }
}