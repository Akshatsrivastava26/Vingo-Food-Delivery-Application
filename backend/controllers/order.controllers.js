import Shop from "../models/shop.model.js";
import Order from "../models/order.model.js";
import DeliveryAssignment from "../models/deliveryAssignment.model.js";

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
    // deliveryBoy assignment logic
    let deliveryBoysPayload=[]
    if(status=="out for delivery" || !shopOrder.assignment){
      const {longitude, latitude}=order.deliveryAddress
      const  nearByDeliveryBoys=await user.find({
        role:"deliveryBoy",
        location:{
          $near:{
            $geometry:{type:"Point",coordinates:[longitude, latitude],},
            $maxDistance:5000, // 5km ke andar wale delivery
          }
        }
      })

      const nearByIds=nearByDeliveryBoys.map(b=>b._id);
      const busyIds=await DeliveryAssignment.find({
        assignedTo:{$in:nearByIds},
        status:{$nin:["broascasted","completed"]},
      }).distinct("assignedTo");

      const busyIdSet=new Set(busyIds.map(id=>String(id)));

      const availableBoys=nearByDeliveryBoys.filter(b=>!busyIdSet.has(String(b._id)));
      const candidates= availableBoys.map(b=>b._id);

      if(candidates.length > 0){
        await order.save();
        return res.json({message:"order status updated, delivery assignment in progress"});
      }
      const DeliveryAssignment = await DeliveryAssignment.create({
        order:order._id,
        shop:shopOrder.shop,
        shopOrderId:shopOrder._id,
        brodcastedTo:candidates,

      })

      shopOrder.assignedDeliveryBoy=DeliveryAssignment.assignedTo;
      shopOrder.assignment=DeliveryAssignment._id;
      deliveryBoysPayload=availableBoys.map(b=>({
        id:b._id,
        fullname:b.fullName,
        longitude:b.location.coordinates?.[0],
        latitude:b.location.coordinates?.[1],
        mobile:b.mobile,
      }));
    }

    await shopOrder.save();
    await order.save();
    await order.populate("shopOrders.shop","name");
    await order.populate("shopOrders.assignedDeliveryBoy", "fullName email mobile");

    const updatedShopOrder=order.shopOrders.find(o=>o.shop==shopId);
    // await shopOrder.populate("shopOrderItems.item","name image price");
    return res.status(200).json({
      shopOrder:updatedShopOrder,
      assignedDeliveryBoy:updatedShopOrder.assignedDeliveryBoy,
      availableBoys:deliveryBoysPayload,
      assignment:updatedShopOrder.assignment._id,
    });
  } catch (error) {
    return res.status(500).json({message:`order status error ${error.message}`});
    
  }
}