import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Map from '../assets/Map1.png';
import { X } from 'lucide-react';
import { useSelector } from 'react-redux';

const formatDate = (dateString) => new Date(dateString).toDateString();
const formatTime = (dateString) =>
  new Date(dateString).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

const Success = () => {
  const location = useLocation();
  const message = location?.state?.text || 'Payment';

  const [showCheck, setShowCheck] = useState(false);
  const [showSuccessCard, setShowSuccessCard] = useState(false);
  const [showTrackOrder, setShowTrackOrder] = useState(false);
  const [statusStep, setStatusStep] = useState(0);
  const [showItemsPopup, setShowItemsPopup] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [orderedItems, setOrderedItems] = useState([]);
  const [showEmoji, setShowEmoji] = useState(false);

  const orders = useSelector((state) => state.orders?.order || []);
  const sortedOrders = [...orders].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
  const latestOrder = sortedOrders[0] || {};

  const {
    createdAt,
    delivery_address,
    products = [],
    totalAmt = 0,
    deliveryPartner = 'Delhivery',
    trackingNumber = 'DL123456789IN',
  } = latestOrder;

  const deliveryDate = createdAt ? formatDate(createdAt) : '';
  const deliveryTime = createdAt ? formatTime(createdAt) : '';

  const addressLine = delivery_address
    ? `${delivery_address.address_line}, ${delivery_address.street}, ${delivery_address.city}, ${delivery_address.state} - ${delivery_address.pincode}`
    : 'No address provided';

  useEffect(() => {
    const checkTimer = setTimeout(() => setShowCheck(true), 1500);
    const cardTimer = setTimeout(() => setShowSuccessCard(true), 3000);
    return () => {
      clearTimeout(checkTimer);
      clearTimeout(cardTimer);
    };
  }, []);

  useEffect(() => {
    if (showTrackOrder) {
      const interval = setInterval(() => {
        setStatusStep((prev) => (prev < 3 ? prev + 1 : prev));
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [showTrackOrder]);

  const statusLabels = ['Ordered', 'Packaging', 'Out for delivery', 'Delivered'];

  const popupVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: 'easeInOut' } },
    exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } },
  };

  const feedbackPopupVariants = {
    hidden: { y: '100%', opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.3, ease: 'easeOut' } },
    exit: { y: '100%', opacity: 0, transition: { duration: 0.2 } },
  };

  const getEmoji = () => {
    if (rating === 1) return '😞';
    if (rating === 2) return '🙂';
    if (rating === 3) return '😍';
    if (rating === 4) return '🥳';
    if (rating === 5) return '🎉';
    return '';
  };

  const submitFeedback = () => {
    console.log('Feedback submitted:', { rating, feedbackText });
    setShowEmoji(true);
    setTimeout(() => {
      setShowEmoji(false);
      setShowFeedback(false);
      setRating(0);
      setFeedbackText('');
    }, 2000);
  };

  const handleViewItems = () => {
    setOrderedItems(products);
    setShowItemsPopup(true);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-green-50 via-green-100 to-green-200 flex items-center justify-center">
      <div className="absolute w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="blob bg-green-300 top-[25%] left-[20%]" />
        <div className="blob bg-green-400 top-[65%] left-[70%]" />
        <div className="blob bg-green-200 top-[40%] left-[80%]" />
      </div>

      {!showSuccessCard ? (
        <div className="z-10 flex flex-col items-center gap-4 animate-fade-in">
          <svg className="w-28 h-28 text-green-600 animate-pop" viewBox="0 0 100 100" fill="none">
            <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="8" className="animate-circle-loader opacity-20" />
            {showCheck && (
              <path d="M30 53 L45 68 L72 40" stroke="currentColor" strokeWidth="8" fill="none" strokeLinecap="round" strokeLinejoin="round" className="animate-draw-check" />
            )}
          </svg>
          <p className="text-green-700 text-xl font-semibold tracking-wide">
            {showCheck ? 'Completing...' : 'Processing...'}
          </p>
        </div>
      ) : (
        <div className="z-10 w-[90%] max-w-md bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center gap-6 animate-popup-card">
          <svg className="w-20 h-20 text-green-600" viewBox="0 0 100 100" fill="none">
            <path d="M30 53 L45 68 L72 40" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <h2 className="text-3xl font-semibold text-green-800">{message} Successful!</h2>
          <p className="text-green-700 text-base">Everything went smoothly. You're good to go!</p>
          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
            <Link to="/" className="bg-green-600 text-white px-6 py-2.5 rounded-full shadow-md hover:bg-green-700 transition-all duration-300 w-full sm:w-auto">
              Go to Home
            </Link>
            <button onClick={() => setShowTrackOrder(true)} className="bg-green-600 text-white px-6 py-2.5 rounded-full shadow-md hover:bg-green-700 transition-all duration-300 w-full sm:w-auto">
              Track my Order
            </button>
          </div>
        </div>
      )}

      <AnimatePresence>
        {showTrackOrder && (
          <motion.div variants={popupVariants} initial="hidden" animate="visible" exit="exit" className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-2 sm:px-8">
            <div className="bg-white rounded-xl shadow-2xl p-4 sm:p-6 w-full max-w-5xl h-[90%] sm:h-[80%] flex flex-col md:flex-row overflow-auto">
              <div className="w-full md:w-1/2 flex items-center justify-center mb-4 md:mb-0">
                {statusStep === 3 ? (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-green-500 rounded-lg p-4">
                    <motion.svg className="w-20 h-20 text-white mb-4" viewBox="0 0 100 100" fill="none" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.5 }}>
                      <path d="M30 53 L45 68 L72 40" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
                    </motion.svg>
                    <p className="text-white text-xl font-bold text-center">Your order is delivered successfully</p>
                  </div>
                ) : (
                  <img src={Map} alt="Order Map" className="rounded-lg w-full h-full object-contain" />
                )}
              </div>
              <div className="w-full md:w-1/2 flex flex-col p-2 sm:p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">📦 Your Order Status</h2>
                  <button onClick={() => setShowTrackOrder(false)} className="bg-black text-white px-4 py-2 rounded-full shadow hover:bg-black/80 text-sm sm:text-base">
                    Cancel
                  </button>
                </div>

                <div className="space-y-3 mb-4 text-sm sm:text-base">
                  <p><strong>Total Price:</strong> ₹{totalAmt}</p>
                  <p><strong>Ordered On:</strong> {deliveryDate}, {deliveryTime}</p>
                  <p><strong>Delivery Address:</strong>  {addressLine}</p>
                  <p><strong>Delivery Partner:</strong> {deliveryPartner}</p>
                  <p><strong>Tracking Number:</strong> {trackingNumber}</p>
                </div>

                <button onClick={handleViewItems} className="bg-teal-600 text-white px-6 py-2.5 rounded-full shadow hover:bg-teal-700 transition-all duration-300 w-full sm:w-auto">
                  View Items
                </button>

                <div className="mt-6 space-y-6">
                  <div className="flex items-center justify-between relative text-xs sm:text-sm">
                    {statusLabels.map((label, index) => {
                      const isCurrentOrPrevious = index <= statusStep;
                      return (
                        <div key={index} className="flex flex-col items-center text-center w-1/4 relative">
                          <div className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full ${isCurrentOrPrevious ? 'bg-teal-500 text-white' : 'bg-gray-300 text-gray-600'}`}>
                            {isCurrentOrPrevious ? '✓' : ''}
                          </div>
                          <span className={`mt-2 ${index === statusStep ? 'font-bold text-black' : 'text-gray-700'}`}>{label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <button onClick={() => setShowFeedback(true)} className="mt-8 bg-yellow-500 text-white px-6 py-2.5 rounded-full shadow hover:bg-yellow-600 transition-all duration-300 w-full sm:w-auto">
                  Leave Feedback
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showItemsPopup && (
          <motion.div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-2 sm:px-4" initial="hidden" animate="visible" exit="exit" variants={popupVariants}>
            <div className="bg-white rounded-xl shadow-2xl p-4 sm:p-6 w-full max-w-lg h-auto overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Ordered Items</h3>
                <button onClick={() => setShowItemsPopup(false)} className="text-gray-600 hover:text-black">
                  <X size={24} />
                </button>
              </div>
              <ul className="space-y-2">
                {orderedItems.map((item, idx) => (
                  <li key={idx} className="flex justify-between items-center border-b py-2">
                    <span className="font-medium">{item.name}</span>
                    <span>Quantity: {item.quantity || 1}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showFeedback && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center px-2 sm:px-0"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={feedbackPopupVariants}
          >
            <div className="bg-white rounded-t-xl sm:rounded-xl shadow-2xl p-6 w-full max-w-md h-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Rate Your Experience</h3>
                <button onClick={() => setShowFeedback(false)} className="text-gray-600 hover:text-black">
                  <X size={24} />
                </button>
              </div>
              <div className="flex justify-center space-x-2 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className={`text-5xl ${rating >= star ? 'text-yellow-500' : 'text-gray-300'}`}
                  >
                    ★
                  </button>
                ))}
              </div>
              <textarea
                className="w-full border rounded-md p-2 mb-4"
                rows="4"
                placeholder="Leave a feedback..."
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
              />
              <button
                onClick={submitFeedback}
                className="w-full bg-green-600 text-white px-4 py-2 rounded-full hover:bg-green-700"
              >
                Submit Feedback
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>


      <AnimatePresence>
        {showEmoji && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1.2 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              className="text-7xl"
              animate={{ rotate: [0, 15, -15, 15, 0] }}
              transition={{ duration: 1 }}
            >
              {getEmoji()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Success;
