import React, { useEffect, useState } from "react"
import axios from "axios"
import { X, Clock, User, Package } from "lucide-react"

const TodayOrdersDrawer = ({ open, onClose }) => {

const [orders, setOrders] = useState([])
const [selectedOrder, setSelectedOrder] = useState(null)

useEffect(() => {

if(open){
fetchOrders()
}

},[open])

const fetchOrders = async ()=>{

const res = await axios.get(
"http://localhost:8080/api/dashboard/today-orders"
)

setOrders(res.data.orders)

}

const fetchOrderDetails = async(id)=>{

const res = await axios.get(
`http://localhost:8080/api/dashboard/order/${id}`
)

setSelectedOrder(res.data.order)

}

if(!open) return null

return(

<div className="fixed inset-0 bg-black/10 backdrop-blur-[2px] flex justify-end z-50">

<div className="w-[420px] bg-white h-[calc(100vh-70px)] mt-[70px] shadow-2xl rounded-l-3xl overflow-hidden">

{/* HEADER */}

<div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-green-50 to-white">

<h2 className="font-semibold text-lg flex items-center gap-2">
📦 Today's Orders
</h2>

<button
onClick={onClose}
className="p-2 rounded-full hover:bg-gray-100 transition"
>
<X size={18}/>
</button>

</div>

<div className="p-5 overflow-y-auto h-full">

{/* ORDER LIST */}

{!selectedOrder && orders.map(order=>(

<div
key={order._id}
className="border rounded-xl p-4 mb-3 cursor-pointer hover:shadow-md hover:border-green-400 transition"
onClick={()=>fetchOrderDetails(order._id)}
>

<div className="flex justify-between items-center">

<p className="font-medium text-sm flex items-center gap-2">
<Package size={14}/> #{order.orderId}
</p>

<p className="text-green-600 font-semibold text-sm">
₹{order.totalAmt}
</p>

</div>

<div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
<Clock size={14}/>
{new Date(order.createdAt).toLocaleTimeString()}
</div>

<div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
<User size={14}/>
{order.user?.name || "Unknown Customer"}
</div>

</div>

))}


{/* ORDER DETAILS */}

{selectedOrder && (

<div>

<button
className="text-sm text-green-600 mb-4"
onClick={()=>setSelectedOrder(null)}
>
← Back
</button>

<h3 className="font-semibold text-lg mb-3">
📦 Order #{selectedOrder.orderId}
</h3>

{/* Customer */}

<div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4">

<p className="text-sm flex items-center gap-2">
<User size={16}/>
{selectedOrder.user?.name || "Unknown Customer"}
</p>

</div>

{/* Items */}

<div className="bg-gray-50 rounded-xl p-3">

<p className="text-sm font-medium mb-2">
Items
</p>

{selectedOrder.products.map(item=>(

<div
key={item.productId}
className="flex justify-between text-sm py-1"
>

<span>{item.name}</span>
<span>× {item.quantity}</span>

</div>

))}

</div>

<div className="mt-4 text-xs text-gray-500 flex items-center gap-2">

<Clock size={14}/>
{new Date(selectedOrder.createdAt).toLocaleString()}

</div>

</div>

)}

</div>

</div>

</div>

)

}

export default TodayOrdersDrawer