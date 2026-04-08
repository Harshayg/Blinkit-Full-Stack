// Orders.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

const Orders = () => {
  const [unacceptedOrders, setUnacceptedOrders] = useState([]);
  const [acceptedOrders, setAcceptedOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("unaccepted");
  const [productStatus, setProductStatus] = useState({});

  axios.defaults.withCredentials = true;

  const fetchUnacceptedOrders = async () => {
    try {
      const res = await axios.get(
        "http://localhost:8080/api/order-admin/unaccepted-orders"
      );
      if (res.data.success && Array.isArray(res.data.data)) {
        setUnacceptedOrders(res.data.data);

        const statusInit = {};
        res.data.data.forEach((order) => {
          statusInit[order._id] = order.products.map(() => null);
        });
        setProductStatus(statusInit);
      }
    } catch (error) {
      console.error("Error fetching unaccepted orders", error);
    }
  };

  const fetchAcceptedOrders = async () => {
    try {
      const res = await axios.get(
        "http://localhost:8080/api/order-admin/accepted-orders"
      );
      if (res.data.success && Array.isArray(res.data.data)) {
        setAcceptedOrders(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching accepted orders", error);
    }
  };

  const acceptOrder = async (orderId) => {
    try {
      const res = await axios.post(
        "http://localhost:8080/api/order-admin/accept-order",
        { orderIds: [orderId] }
      );
      if (res.data.success) {
        fetchUnacceptedOrders();
        fetchAcceptedOrders();
      }
    } catch (error) {
      console.error("Error accepting order", error);
    }
  };

  const markReadyForDispatch = async (orderId) => {
    try {
      const res = await axios.post(
        "http://localhost:8080/api/order-admin/ready-for-dispatch",
        { orderIds: [orderId] }
      );
      if (res.data.success) {
        fetchAcceptedOrders();
      }
    } catch (error) {
      console.error("Error marking order ready for dispatch", error);
    }
  };

  useEffect(() => {
    fetchUnacceptedOrders();
    fetchAcceptedOrders();
  }, []);

  const ordersToDisplay = activeTab === "unaccepted" ? unacceptedOrders : acceptedOrders;

  const handleProductStatusChange = (orderId, idx, status) => {
    const updated = [...productStatus[orderId]];
    updated[idx] = status;
    setProductStatus({ ...productStatus, [orderId]: updated });
  };

  const markAllProducts = (orderId, status) => {
    const updated = productStatus[orderId].map(() => status);
    setProductStatus({ ...productStatus, [orderId]: updated });
  };

  const canAcceptOrder = (orderId) => {
    const statuses = productStatus[orderId];
    return statuses.every((s) => s !== null);
  };

  return (
    <div className="p-6 bg-white min-h-screen font-sans text-gray-800">
      {/* Capsule Toggle */}
      <div className="flex justify-center mb-8 rounded-full p-1 w-max mx-auto bg-gray-100">
        <button
          onClick={() => setActiveTab("unaccepted")}
          className={`px-6 py-2 rounded-full font-semibold transition-all ${
            activeTab === "unaccepted"
              ? "bg-black text-white"
              : "text-gray-500 hover:text-black"
          }`}
        >
          Unassigned Orders
        </button>
        <button
          onClick={() => setActiveTab("accepted")}
          className={`px-6 py-2 rounded-full font-semibold transition-all ${
            activeTab === "accepted"
              ? "bg-black text-white"
              : "text-gray-500 hover:text-black"
          }`}
        >
          Accepted Orders
        </button>
      </div>

      {/* Orders Display */}
      {ordersToDisplay.length === 0 ? (
        <p className="text-gray-500 text-center italic">
          No {activeTab === "unaccepted" ? "unassigned" : "accepted"} orders.
        </p>
      ) : (
        <div className="flex flex-col gap-8">
          {ordersToDisplay.map((order) => (
            <div
              key={order._id}
              className="bg-white/50 border border-gray-300 rounded-3xl p-6"
            >
              {/* Order Header */}
              <div className="flex justify-between items-center mb-4">
                <p className="font-bold text-lg">{order.orderId}</p>
                <p
                  className={`px-3 py-1 rounded-full font-semibold text-sm ${
                    order.delivery_status === "Ready to Dispatch"
                      ? "bg-gray-300 text-black"
                      : order.delivery_status === "Accepted"
                      ? "bg-gray-700 text-white"
                      : "bg-gray-200 text-black"
                  }`}
                >
                  {order.delivery_status}
                </p>
              </div>

              {/* Customer Info */}
              <p className="mb-1">
                <span className="font-semibold">Customer:</span> {order.userId?.name}
              </p>
              <p className="mb-4 text-sm">
                <span className="font-semibold">Address:</span> {order.delivery_address?.address_line}, {order.delivery_address?.city}, {order.delivery_address?.state} - {order.delivery_address?.pincode}
              </p>

              {/* Product List */}
              {activeTab === "unaccepted" && (
                <div className="mb-4 flex justify-end gap-2">
                  <button
                    className="px-3 py-1 bg-green-100 text-green-800 rounded-md text-sm font-semibold hover:bg-green-200"
                    onClick={() => markAllProducts(order._id, true)}
                  >
                    Mark All ✅
                  </button>
                  <button
                    className="px-3 py-1 bg-red-100 text-red-800 rounded-md text-sm font-semibold hover:bg-red-200"
                    onClick={() => markAllProducts(order._id, false)}
                  >
                    Mark All ❌
                  </button>
                </div>
              )}

              <div className="flex flex-col gap-4 mb-4">
                {order.products.map((p, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center bg-white/30 border border-gray-200 rounded-xl p-4 gap-3"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={p.image[0]}
                        alt={p.name}
                        className="w-16 h-16 object-cover rounded-md border border-gray-200"
                      />
                      <div>
                        <p className="font-semibold text-sm">{p.name}</p>
                        <p className="text-gray-600 text-sm">
                          Quantity: {p.quantity} | ₹{p.price}
                        </p>
                      </div>
                    </div>
                    {activeTab === "unaccepted" && (
                      <div className="flex gap-2 mt-2 sm:mt-0">
                        <button
                          onClick={() => handleProductStatusChange(order._id, idx, true)}
                          className={`px-3 py-1 rounded-md text-sm font-semibold ${
                            productStatus[order._id]?.[idx] === true
                              ? "bg-green-600 text-white"
                              : "bg-green-100 text-green-800 hover:bg-green-200"
                          }`}
                        >
                          ✅
                        </button>
                        <button
                          onClick={() => handleProductStatusChange(order._id, idx, false)}
                          className={`px-3 py-1 rounded-md text-sm font-semibold ${
                            productStatus[order._id]?.[idx] === false
                              ? "bg-red-600 text-white"
                              : "bg-red-100 text-red-800 hover:bg-red-200"
                          }`}
                        >
                          ❌
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Payment & Total */}
              <div className="flex justify-between mb-4 text-sm text-gray-700">
                <p>
                  <span className="font-semibold">Payment:</span> {order.payment_status}
                </p>
                <p>
                  <span className="font-semibold">Total:</span> ₹{order.totalAmt}
                </p>
              </div>

              {/* Action Button */}
              {activeTab === "unaccepted" ? (
                <button
                  disabled={!canAcceptOrder(order._id)}
                  className={`w-full py-2 rounded-lg font-bold text-sm transition-colors ${
                    canAcceptOrder(order._id)
                      ? "bg-black text-white hover:bg-gray-800"
                      : "bg-gray-200 text-gray-500 cursor-not-allowed"
                  }`}
                  onClick={() => acceptOrder(order._id)}
                >
                  Accept Order
                </button>
              ) : (
                order.delivery_status === "Accepted" && (
                  <button
                    className="w-full py-2 bg-black text-white rounded-lg font-bold text-sm hover:bg-gray-800 transition-colors"
                    onClick={() => markReadyForDispatch(order._id)}
                  >
                    Mark Ready for Dispatch
                  </button>
                )
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
