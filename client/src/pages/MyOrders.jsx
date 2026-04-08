import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import NoData from '../components/NoData';
import { CheckCircle2, ArrowRight, Copy } from 'lucide-react';
import { DisplayPriceInRupees } from "../utils/DisplayPriceInRupees";

const formatDate = (dateString) => new Date(dateString).toDateString();
const formatTime = (dateString) =>
  new Date(dateString).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

const MyOrders = () => {
  const orders = useSelector((state) => state.orders?.order || []);
  const [activeDate, setActiveDate] = useState(null);
  const [selectedTimeGroup, setSelectedTimeGroup] = useState(null);
  const [showTimePopup, setShowTimePopup] = useState(false);

  const groupedByDate = orders.reduce((acc, order) => {
    const date = formatDate(order.createdAt);
    if (!acc[date]) acc[date] = [];
    acc[date].push(order);
    return acc;
  }, {});

  const groupedByTime = (orders) => {
    return orders.reduce((acc, order) => {
      const time = formatTime(order.createdAt);
      if (!acc[time]) acc[time] = [];
      acc[time].push(order);
      return acc;
    }, {});
  };

  const handleDateClick = (date) => {
    setActiveDate(date);
    setShowTimePopup(true);
  };

  const handleCloseTimePopup = () => {
    setShowTimePopup(false);
    setActiveDate(null);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-[#f9fafb] text-black p-4 sm:p-8 overflow-hidden">
      {orders.length === 0 ? (
        <NoData />
      ) : (
        <div className="space-y-4 sm:block">
          <div className="hidden sm:block space-y-6">
            {Object.entries(groupedByDate).map(([date, dateOrders]) => {
              const timeGrouped = groupedByTime(dateOrders);
              return Object.entries(timeGrouped).map(([time, group]) => {
                const { totalAmt } = group[0];
                const diffInMinutes = group[0]?.deliveryTimeInMinutes || 12;

                return (
                  <div
                    key={date + time}
                    onClick={() => setSelectedTimeGroup({ date, time, orders: group })}
                    className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 cursor-pointer hover:shadow-md transition"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-2">
                        <div className="bg-green-100 p-1 rounded">
                          <CheckCircle2 className="w-8 h-8 text-green-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-lg">Arrived in {diffInMinutes} minutes</p>
                          <p className="text-sm text-gray-600">
                            ₹{totalAmt} • {date}, {time}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="text-black" />
                    </div>
                    <hr className="border-spacing-1 border-gray-300 my-4" />
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {group.flatMap((order) => order.products).map((product, idx) => (
                        <div
                          key={product._id + idx}
                          className="w-20 h-20 border rounded-lg overflow-hidden shrink-0"
                        >
                          <img
                            src={product.image[0]}
                            alt={product.name}
                            className="object-cover w-full h-full"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              });
            })}
          </div>

          <div className="sm:hidden space-y-2">
            {Object.keys(groupedByDate).map((date) => (
              <div
                key={date}
                className="bg-white border p-4 rounded-xl shadow-sm text-center font-medium text-sm"
                onClick={() => handleDateClick(date)}
              >
                {date}
              </div>
            ))}
          </div>
        </div>
      )}

      <AnimatePresence>
        {showTimePopup && (
          <motion.div
            className="fixed inset-0 bg-black/60 z-40"
            onClick={handleCloseTimePopup}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}

        {activeDate && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-transparent z-50 sm:hidden"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
          >
            <div className="bg-white rounded-2xl shadow-2xl p-4 w-[90%] max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Select Time</h2>
                <button onClick={handleCloseTimePopup} className="text-sm rounded-full px-4 py-1 bg-black text-white">
                  Cancel
                </button>
              </div>
              <div className="space-y-3">
                {Object.entries(groupedByTime(groupedByDate[activeDate])).map(([time, group]) => (
                  <motion.div
                    key={time}
                    className="border p-3 rounded-lg hover:bg-gray-100 cursor-pointer"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setSelectedTimeGroup({ date: activeDate, time, orders: group });
                      setShowTimePopup(false);
                    }}
                  >
                    {time}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {selectedTimeGroup && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/60 z-40"
              onClick={() => setSelectedTimeGroup(null)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            <motion.div
              className="fixed right-0 top-0 bottom-0 w-full sm:w-[30%] bg-white/70 backdrop-blur-xl z-50 overflow-y-auto p-4 sm:p-6 shadow-2xl rounded-none border-l border-gray-300"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', ease: 'easeInOut', duration: 0.3 }}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">🧾 Order Details</h2>
                <button onClick={() => setSelectedTimeGroup(null)} className="text-sm rounded-full px-4 py-1 bg-black text-white">Cancel</button>
              </div>

              <div className="bg-white rounded-xl p-4 mt-6 shadow-md space-y-2">
                {selectedTimeGroup.orders.flatMap((order) => order.products).map((product, index) => (
                  <div key={product._id + index} className="flex items-center gap-4 bg-white p-3 shadow-sm">
                    <img src={product?.image?.[0]} alt={product.name} className="w-16 h-16 object-cover rounded-lg" />
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{product.name}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-xl p-4 mt-6 shadow-md space-y-2">
                <h2 className="font-semibold text-gray-800 text-lg">Bill Details</h2>
                {(() => {
                  const subTotal = selectedTimeGroup.orders.reduce(
                    (sum, order) => order.subTotalAmt,
                    0
                  );
                  const handling = selectedTimeGroup.orders.reduce(
                    (sum, order) => sum + (order.totalItems * 2 || 0),
                    0
                  );
                  const total = subTotal + handling;

                  const deliveryCharge = subTotal < 199 ? 30 : 0;
                  return (
                    <>
                      <div className="flex justify-between text-sm text-gray-700">
                        <span>MRP</span>
                        <span>₹{subTotal}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-700">
                        <span>Handling charge</span>
                        <span>+₹{handling}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Delivery charges</span>
                        {deliveryCharge > 0 ? (
                          <span className="text-gray-900 font-medium text-sm">
                            {DisplayPriceInRupees(deliveryCharge)}
                          </span>
                        ) : (
                          <span className="text-blue-400 font-medium text-sm">
                            <span className="line-through text-gray-300">₹30</span> FREE
                          </span>
                        )}
                      </div>
                      <div className="flex justify-between font-bold text-gray-900">
                        <span>Total</span>
                        <span>₹{total}</span>
                      </div>
                    </>
                  );
                })()}
              </div>

              <div className="bg-white rounded-xl p-4 mt-6 shadow-md space-y-2">
                <h2 className="font-semibold text-gray-800 text-lg">Order Info</h2>
                <div className="text-sm text-gray-700 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Order ID</span>
                    <button onClick={() => copyToClipboard(selectedTimeGroup.orders[0]?.orderId)} className="text-blue-600">
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="break-all">{selectedTimeGroup.orders[0]?.orderId}</p>
                  <p className="text-gray-500 mt-1">Payment: {selectedTimeGroup.orders[0]?.payment_status}</p>
                  <p className="text-gray-500">Order placed: {selectedTimeGroup.date}, {selectedTimeGroup.time}</p>
                  <p className="text-gray-500">Address :{`${selectedTimeGroup.orders[0]?.delivery_address?.address_line}, ${selectedTimeGroup.orders[0]?.delivery_address?.city}, ${selectedTimeGroup.orders[0]?.delivery_address?.state}, ${selectedTimeGroup.orders[0]?.delivery_address?.country}, ${selectedTimeGroup.orders[0]?.delivery_address?.pincode} , ${selectedTimeGroup.orders[0]?.delivery_address?.mobile}`}</p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MyOrders;
