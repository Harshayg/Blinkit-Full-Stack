import OrderModel from "../models/order.model.js";
import DeliveryPartnerModel from "../models/deliveryPartner.model.js";

export const getTodayOrders = async (req,res)=>{

try{

const startOfDay = new Date()
startOfDay.setHours(0,0,0,0)

const orders = await OrderModel.find({
createdAt:{ $gte:startOfDay }
})
.select("orderId totalAmt createdAt delivery_status deliveryPartner")

.sort({createdAt:-1})

res.json({
success:true,
orders
})

}catch(error){

res.status(500).json({
message:error.message
})

}

}

export const getOrderDetails = async (req,res)=>{

try{

const {id} = req.params

const order = await OrderModel.findById(id)
.populate("deliveryPartner","name phone")
.populate("delivery_address")

if(!order){

return res.status(404).json({
message:"Order not found"
})

}

res.json({
success:true,
order
})

}catch(error){

res.status(500).json({
message:error.message
})

}

}