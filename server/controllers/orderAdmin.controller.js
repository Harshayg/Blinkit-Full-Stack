import OrderModel from "../models/order.model.js"

export const getLiveOrdersController = async (req,res)=>{

try{

const orders = await OrderModel.find({

order_status:{ $nin:["Cancelled","Returned"] }

})

.populate("userId","name phone")
.populate("deliveryPartner","name phone")
.populate("delivery_address")

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

export default OrderModel