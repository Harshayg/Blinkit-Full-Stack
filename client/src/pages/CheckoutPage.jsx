import React, { useState, useEffect } from 'react';
import { useGlobalContext } from '../provider/GlobalProvider';
import { DisplayPriceInRupees } from '../utils/DisplayPriceInRupees';
import AddAddress from '../components/AddAddress';
import { useSelector } from 'react-redux';
import AxiosToastError from '../utils/AxiosToastError';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
// Importing icons
import { MdStickyNote2, MdDeliveryDining } from "react-icons/md";
import { BsHandbagFill } from "react-icons/bs";
import { FaIndianRupeeSign } from "react-icons/fa6";
import { FaCreditCard } from 'react-icons/fa';
import { IoPerson, IoLocationSharp } from "react-icons/io5"; // Added IoLocationSharp for address
import { IoMdInformationCircleOutline } from "react-icons/io";
import { RiSecurePaymentLine } from "react-icons/ri";
import { GiReceiveMoney } from 'react-icons/gi'; // Icon for cash on delivery
import { MdOutlineAddLocationAlt } from "react-icons/md"; // Icon for add address
import { FaCheckCircle } from "react-icons/fa"; // Icon for selected address
import { FaGift, FaMoneyBillWave } from "react-icons/fa"; // Added icons for savings pop-up
import { MdOutlineDiscount } from "react-icons/md"; // Icon for coupon
import { RiCoupon3Fill } from "react-icons/ri"; // Another coupon icon
import { FaTag } from "react-icons/fa"; // Tag icon for coupon
import { IoCloseCircleOutline } from "react-icons/io5"; // Close icon for popup
import { IoCardOutline } from "react-icons/io5"; // Card outline icon
import { FaCreditCard as FaCreditCardSolid } from "react-icons/fa"; // Solid credit card icon


// Importing framer-motion for animations
// Importing framer-motion for animations
import { motion, AnimatePresence } from 'framer-motion';


const CheckoutPage = () => {
  // Destructuring context and state variables
  const { notDiscountTotalPrice, totalPrice, totalQty, fetchCartItem, fetchOrder } = useGlobalContext();
  const [openAddress, setOpenAddress] = useState(false);
  const addressList = useSelector(state => state.addresses.addressList);
  const [selectAddress, setSelectAddress] = useState(null);
  const [showAddressPopup, setShowAddressPopup] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showTipPopup, setShowTipPopup] = useState(false);
  const cartItemsList = useSelector(state => state.cartItem.cart);
  const navigate = useNavigate();

  // Ensure total prices are numbers, default to 0 if not
  const safeTotalPrice = typeof totalPrice === 'number' ? totalPrice : 0;
  const safeNotDiscountTotalPrice = typeof notDiscountTotalPrice === 'number' ? notDiscountTotalPrice : 0;

  // State for tip amount, initialized from localStorage
  const [tipAmount, setTipAmount] = useState(() => {
    const storedTip = localStorage.getItem("tipAmount");
    return storedTip ? parseInt(storedTip, 10) : 0;
  });

  // New state for initial page loading
  const [isPageLoading, setIsPageLoading] = useState(true);

  // NEW STATE: State to control the visibility of the savings pop-up
  const [showSavingsPopup, setShowSavingsPopup] = useState(false);

  // NEW STATE: State for applied coupon discount amount
  const [couponDiscount, setCouponDiscount] = useState(0);
  // NEW STATE: State for coupon error message
  const [couponError, setCouponError] = useState('');
  // NEW STATE: State to store the successfully applied coupon code for display
  const [appliedCoupon, setAppliedCoupon] = useState('');

  // NEW STATE: State to control the visibility of the coupon popup
  const [showCouponPopup, setShowCouponPopup] = useState(false);

  // NEW STATE: Simulate first-time customer status (In a real app, this would come from user authentication/profile)
  const [isFirstTimeCustomer, setIsFirstTimeCustomer] = useState(true); // Set to true for demonstration

  // NEW STATE: State for credit card number input
  const [cardNumber, setCardNumber] = useState('');
  // NEW STATE: State to store detected card type
  const [detectedCardType, setDetectedCardType] = useState('');


  // Define valid coupon codes, their discounts, minimum order requirements, descriptions, and card type requirement
  const validCoupons = {
    COUPON15: { discount: 15, minOrder: 100, description: 'Get ₹15 off!' },
    COUPON25: { discount: 25, minOrder: 150, description: 'Get ₹25 off!' },
    COUPON50: { discount: 50, minOrder: 200, description: 'Get ₹50 off!' },
    FIRST100: { discount: 100, minOrder: 299, description: 'First order special: ₹100 off!', isFirstTime: true }, // First-time customer coupon
    UPIPAY: { discount: 50, description: 'Flat ₹50 cashback on UPI payments', minOrder: 300, paymentMethod: 'UPI' },
    COUPON100: { discount: 100, minOrder: 500, description: 'Save ₹100 on orders over ₹500!' },
    COUPON125: { discount: 125, minOrder: 650, description: 'Biggest savings! ₹125 off on orders over ₹650!' },
    SAVE10PERCENT: { discount: '10%', minOrder: 1000, description: 'Get 10% off on orders over ₹1000!' }, // Percentage coupon
    VISACARD: { discount: 75, minOrder: 300, description: '₹75 off with Visa Card!', cardType: 'Visa' }, // Visa coupon
    MASTERCARD: { discount: 75, minOrder: 300, description: '₹75 off with Mastercard!', cardType: 'Mastercard' }, // Mastercard coupon
    AMEXOFFER: { discount: 100, description: 'Flat ₹100 off on American Express cards', minOrder: 500, cardType: 'American Express' },
    VISA : { discount: 80, minOrder: 300, description: '₹75 off with Visa credit card!', cardType: 'Visa' },
  };

  // Function to detect card type based on number prefix (basic check)
  const detectCardType = (number) => {
    // Remove non-digit characters from the input number
    const cleanedNumber = number.replace(/\D/g, '');
  
    // Define typical lengths for different card types
    // We will only return a type once the number reaches one of these lengths
    const visaLengths = [15, 16]; // Visa cards are typically 13 or 16 digits
    const mastercardLength = 16; // Mastercard cards are typically 16 digits
    const amexLength = 15; // American Express cards are typically 15 digits
  
    const currentLength = cleanedNumber.length;
  
    // Check for Visa
    // Visa starts with 4 and must be 13 or 16 digits long to be identified
    if (cleanedNumber.startsWith('4') && visaLengths.includes(currentLength)) {
      return 'Visa';
    }
  
    // Check for Mastercard
    // Mastercard starts with 51-55 and must be 16 digits long to be identified
    if (currentLength === mastercardLength) {
      const prefix = parseInt(cleanedNumber.substring(0, 2), 10);
      if (prefix >= 51 && prefix <= 55) {
        return 'Mastercard';
      }
    }
  
    // Check for American Express
    // American Express starts with 34 or 37 and must be 15 digits long to be identified
    if ((cleanedNumber.startsWith('34') || cleanedNumber.startsWith('37')) && currentLength === amexLength) {
      return 'American Express';
    }
  
    // If none of the above conditions are met (either not enough digits, wrong prefix,
    // or not a recognized type/length combination), return an empty string.
    return '';
  };
  

  // Effect to load applied coupon from localStorage on mount
  useEffect(() => {
    const savedCouponCode = localStorage.getItem('appliedCouponCode');
    if (savedCouponCode && validCoupons[savedCouponCode]) {
      const coupon = validCoupons[savedCouponCode];
      // Re-check applicability on load (important if cart contents changed or card type matters)
      const currentCardNumber = localStorage.getItem('cardNumber') || '';
      const currentCardType = detectCardType(currentCardNumber); // Get saved card type
      const isCardApplicable = !coupon.cardType || coupon.cardType === currentCardType;

      if (safeTotalPrice >= coupon.minOrder && (!coupon.isFirstTime || isFirstTimeCustomer) && isCardApplicable) {
        let discountAmount = 0;
        if (typeof coupon.discount === 'number') {
          discountAmount = coupon.discount;
        } else if (typeof coupon.discount === 'string' && coupon.discount.endsWith('%')) {
          const percentage = parseFloat(coupon.discount);
          discountAmount = (safeTotalPrice * percentage) / 100;
        }

        if (discountAmount <= safeTotalPrice) {
          setCouponDiscount(discountAmount);
          setAppliedCoupon(savedCouponCode);
          setCardNumber(currentCardNumber); // Restore card number
          setDetectedCardType(currentCardType); // Restore detected card type
        } else {
          // If coupon is no longer fully applicable, remove it from storage
          localStorage.removeItem('appliedCouponCode');
          localStorage.removeItem('couponDiscount');
          localStorage.removeItem('cardNumber'); // Also remove card number
          setCouponDiscount(0);
          setAppliedCoupon('');
          setCardNumber('');
          setDetectedCardType('');
        }
      } else {
        // If coupon is no longer applicable, remove it from storage
        localStorage.removeItem('appliedCouponCode');
        localStorage.removeItem('couponDiscount');
        localStorage.removeItem('cardNumber'); // Also remove card number
        setCouponDiscount(0);
        setAppliedCoupon('');
        setCardNumber('');
        setDetectedCardType('');
      }
    }
  }, [safeTotalPrice, isFirstTimeCustomer]); // Re-run if total price or customer status changes

  // Effect to update detected card type when card number changes
  useEffect(() => {
    setDetectedCardType(detectCardType(cardNumber));
  }, [cardNumber]);


  // Calculate delivery charge based on total price (before coupon)
  const deliveryCharge = safeTotalPrice < 199 ? 30 : 0;

  // Calculate the total price after applying coupon discount
  const discountedTotalPrice = safeTotalPrice - couponDiscount;

  // Calculate the final grand total including all charges and discounts
  const grandTotal = discountedTotalPrice + deliveryCharge + totalQty * 2 + tipAmount;

  // Calculate total savings including original discount and coupon discount
  const totalSavings = (safeNotDiscountTotalPrice - safeTotalPrice) + couponDiscount;


  // Effect to scroll to the top on component mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []); // Empty dependency array ensures this runs only once on mount

  // Effect to simulate initial page loading time and show savings popup
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoading(false);
      // Show the savings pop-up after loading if there are savings
      if (totalSavings > 0) {
        setShowSavingsPopup(true);
      }
    }, 1500); // Simulate 1.5 seconds of loading

    return () => clearTimeout(timer); // Cleanup the timer
  }, [totalSavings]); // Dependency array includes totalSavings so popup shows if savings are calculated after mount

  // Effect to listen for tip updates (from other components or storage)
  useEffect(() => {
    const updateTip = () => {
      const storedTip = localStorage.getItem("tipAmount");
      setTipAmount(storedTip ? parseInt(storedTip, 10) : 0);
    };
    window.addEventListener("tipUpdated", updateTip);
    window.addEventListener("storage", updateTip); // Listen for storage changes as well
    return () => {
      window.removeEventListener("tipUpdated", updateTip);
      window.removeEventListener("storage", updateTip);
    };
  }, []);

  // NEW FUNCTION: Handle coupon click in the popup
  const handleCouponClick = (code) => {
    const coupon = validCoupons[code];

    if (coupon) {
      // Check if it's a first-time customer coupon and if the user is a first-time customer
      if (coupon.isFirstTime && !isFirstTimeCustomer) {
        setCouponError(`Coupon "${code}" is only for first-time customers.`);
        toast.error(`Coupon "${code}" is only for first-time customers.`);
        return; // Stop here if not eligible
      }

      // Check if it's a card-specific coupon and if a card number is entered and matches
      if (coupon.cardType) {
        if (!cardNumber) {
          setCouponError(`Please enter your card number to apply the "${code}" coupon.`);
          toast.error(`Please enter your card number to apply the "${code}" coupon.`);
          return; // Stop if card number is required but not entered
        }
        if (detectedCardType !== coupon.cardType) {
          setCouponError(`Coupon "${code}" is only for ${coupon.cardType}. Detected card type: ${detectedCardType || 'Unknown'}.`);
          toast.error(`Coupon "${code}" is only for ${coupon.cardType}.`);
          return; // Stop if card type doesn't match
        }
      }


      // Check if the minimum order requirement is met
      if (safeTotalPrice >= coupon.minOrder) {
        let discountAmount = 0;
        if (typeof coupon.discount === 'number') {
          discountAmount = coupon.discount;
        } else if (typeof coupon.discount === 'string' && coupon.discount.endsWith('%')) {
          const percentage = parseFloat(coupon.discount);
          discountAmount = (safeTotalPrice * percentage) / 100;
          // Optional: Cap percentage discount to a max amount if needed
          // if (discountAmount > maxCap) discountAmount = maxCap;
        }

        // Ensure the discount is not more than the current total price
        if (discountAmount <= safeTotalPrice) {
          setCouponDiscount(discountAmount);
          setCouponError('');
          setAppliedCoupon(code);
          // Save to localStorage on successful application
          localStorage.setItem('appliedCouponCode', code);
          localStorage.setItem('couponDiscount', discountAmount);
          localStorage.setItem('cardNumber', cardNumber); // Save card number if applicable

          setShowCouponPopup(false); // Close popup on success
          toast.success(`Coupon "${code}" applied successfully!`);
        } else {
          setCouponError('Discount cannot be more than the total price.');
          setCouponDiscount(0);
          setAppliedCoupon('');
          localStorage.removeItem('appliedCouponCode'); // Remove from storage on failure
          localStorage.removeItem('couponDiscount');
          localStorage.removeItem('cardNumber'); // Also remove card number
          toast.error('Discount cannot be more than the total price.');
        }
      } else {
        const neededAmount = coupon.minOrder - safeTotalPrice;
        setCouponError(`Add items worth ${DisplayPriceInRupees(neededAmount)} more to apply this coupon.`);
        // Don't close popup if minimum order not met
        toast.error(`Minimum order of ${DisplayPriceInRupees(coupon.minOrder)} required.`);
      }
    } else {
      // This case should ideally not happen if the UI only shows valid coupons
      setCouponError('Invalid coupon code.');
      setCouponDiscount(0);
      setAppliedCoupon('');
      localStorage.removeItem('appliedCouponCode'); // Remove from storage on failure
      localStorage.removeItem('couponDiscount');
      localStorage.removeItem('cardNumber'); // Also remove card number
      toast.error('Invalid coupon code.');
    }
  };

  // NEW FUNCTION: Handle coupon cancellation
  const handleCancelCoupon = () => {
    setCouponDiscount(0);
    setCouponError('');
    setAppliedCoupon('');
    setCardNumber(''); // Clear card number on cancellation
    setDetectedCardType(''); // Clear detected card type on cancellation
    // Remove from localStorage on cancellation
    localStorage.removeItem('appliedCouponCode');
    localStorage.removeItem('couponDiscount');
    localStorage.removeItem('cardNumber'); // Also remove card number
    toast.success("Coupon removed.");
  };


  // Handle Cash on Delivery payment
  const handleCashOnDelivery = async () => {
    // Check if an address is selected before proceeding
    if (selectAddress === null || !addressList[selectAddress]) {
      setShowAddressPopup(true); // Show address selection popup if no address is selected
      toast.error("Please select a delivery address."); // Inform the user
      return; // Stop the function execution
    }

    try {
      const response = await Axios({
        ...SummaryApi.CashOnDeliveryOrder,
        data: {
          list_items: cartItemsList,
          addressId: addressList[selectAddress]?._id,
          // Pass the discounted total price and the grand total
          subTotalAmt: discountedTotalPrice + tipAmount, // Subtotal before delivery/handling, includes tip
          totalAmt: grandTotal, // Final amount including everything
          tipAmount: tipAmount,
          couponCode: appliedCoupon, // Pass the applied coupon code
          couponDiscount: couponDiscount, // Pass the coupon discount amount
          cardNumber: cardNumber // Pass card number for COD if needed for records
        },
      });
      const { data: responseData } = response;
      if (responseData.success) {
        toast.success(responseData.message);
        fetchCartItem?.(); // Fetch updated cart items
        fetchOrder?.(); // Fetch updated orders
        // Clear coupon and card from localStorage after successful order
        localStorage.removeItem('appliedCouponCode');
        localStorage.removeItem('couponDiscount');
        localStorage.removeItem('cardNumber');
        navigate('/success', { state: { text: "Order" } }); // Navigate to success page
      }
    } catch (error) {
      AxiosToastError(error); // Display error toast
    }
  };

  // Handle Online Payment
  const handleOnlinePayment = async () => {
    // Check if an address is selected before proceeding
    if (selectAddress === null || !addressList[selectAddress]) {
      setShowAddressPopup(true); // Show address selection popup if no address is selected
      toast.error("Please select a delivery address."); // Inform the user
      return; // Stop the function execution
    }

    try {
      setIsProcessingPayment(true); // Set processing state to true
      const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
      const stripePromise = await loadStripe(stripePublicKey); // Load Stripe
      const response = await Axios({
        ...SummaryApi.payment_url,
        data: {
          list_items: cartItemsList,
          addressId: addressList[selectAddress]?._id,
          // Pass the discounted total price and the grand total
          subTotalAmt: discountedTotalPrice + tipAmount, // Subtotal before delivery/handling, includes tip
          totalAmt: grandTotal, // Final amount including everything - THIS IS THE VALUE YOUR BACKEND SHOULD USE
          tipAmount: tipAmount,
          couponCode: appliedCoupon, // Pass the applied coupon code
          couponDiscount: couponDiscount, // Pass the coupon discount amount
          cardNumber: cardNumber // Pass card number to backend
        },
      });
      const { data: responseData } = response;
      // Simulate a slight delay before redirecting for better UX
      setTimeout(async () => {
        setIsProcessingPayment(false); // Set processing state to false
        // Clear coupon and card from localStorage after successful payment initiation (before redirect)
        localStorage.removeItem('appliedCouponCode');
        localStorage.removeItem('couponDiscount');
        localStorage.removeItem('cardNumber');
        await stripePromise.redirectToCheckout({ sessionId: responseData.id }); // Redirect to Stripe checkout
        fetchCartItem?.(); // Fetch updated cart items
        fetchOrder?.(); // Fetch updated orders
      }, 1500); // Reduced delay slightly
    } catch (error) {
      setIsProcessingPayment(false); // Set processing state to false on error
      AxiosToastError(error); // Display error toast
    }
  };

  // Component for displaying a summary item with icon and value
  const SummaryItem = ({ label, icon, value }) => (
    <motion.div // Add motion for animation
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex justify-between"
    >
      <span className="flex items-center gap-2 text-gray-600">{icon} {label}</span>
      <span className="text-gray-900 font-semibold">{value}</span>
    </motion.div>
  );

  // Render skeleton loading screen if page is loading
  if (isPageLoading) {
    return (
      <section className="min-h-screen lg:px-28 bg-gradient-to-b from-blue-100 to-white py-6 px-4 flex items-center justify-center">
        {/* Skeleton Checkout Layout */}
        <div className="max-w-5xl w-full mx-auto bg-white rounded-3xl shadow-2xl p-6 space-y-8 animate-pulse">
          {/* Header Skeleton */}
          <div className="h-8 bg-gray-200 rounded-md w-1/3 mx-auto"></div>

          <div className="grid md:grid-cols-2 gap-10">
            {/* Left Side Skeleton */}
            <div className="space-y-6">
              {/* Address Section Skeleton */}
              <div className="space-y-2">
                <div className="h-6 bg-gray-200 rounded-md w-1/2"></div>
                <div className="h-16 bg-gray-200 rounded-xl w-full"></div>
              </div>

              {/* Order Details Skeleton */}
              <div className="bg-gray-100 p-6 rounded-2xl space-y-4">
                <div className="h-6 bg-gray-200 rounded-md w-2/3 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded-md w-full"></div>
                <div className="h-4 bg-gray-200 rounded-md w-full"></div>
                <div className="h-4 bg-gray-200 rounded-md w-full"></div>
                <div className="h-4 bg-gray-200 rounded-md w-1/4 mt-4"></div> {/* Tip button placeholder */}
              </div>
            </div>

            {/* Right Side Skeleton */}
            <div className="flex flex-col justify-between">
              {/* Total Summary Skeleton */}
              <div className="bg-blue-100 rounded-2xl p-6 space-y-6">
                <div className="h-6 bg-gray-200 rounded-md w-2/3 mb-4"></div>
                <div className="h-6 bg-gray-200 rounded-md w-full"></div>
                <div className="h-4 bg-gray-200 rounded-md w-1/2 mt-2"></div>
              </div>

              {/* Payment Buttons Skeleton */}
              <div className="flex flex-col gap-4 mt-8">
                <div className="h-12 bg-green-200 rounded-full w-full"></div>
                <div className="h-12 bg-gray-200 rounded-full w-full"></div>
              </div>
              {/* Cancellation Policy Skeleton */}
              <div className="bg-gray-100 rounded-2xl p-6 space-y-4 mt-6">
                <div className="h-6 bg-gray-200 rounded-md w-2/3"></div>
                <div className="h-4 bg-gray-200 rounded-md w-full"></div>
                <div className="h-4 bg-gray-200 rounded-md w-full"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Render main checkout page content once loading is complete
  return (
    <section className="min-h-screen lg:px-28 bg-gradient-to-b from-green-100 to-white py-6 px-4">
      {/* Main container with entrance animation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-5xl mx-auto bg-white rounded-3xl shadow-2xl p-6 space-y-8"
      >
        <h2 className="text-3xl font-bold text-center">Select Payment Method</h2> {/* Added emoji */}

        <div className="grid md:grid-cols-2 gap-10">
          {/* Left Side - Delivery Address and Summary */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-xl font-semibold mb-2">Delivery Address </h3> {/* Added emoji */}
              {/* Button to select address with hover effect */}
              <motion.button
                whileHover={{ scale: 1.02 }} // Scale effect on hover
                whileTap={{ scale: 0.98 }} // Press effect on tap
                onClick={() => setShowAddressPopup(true)}
                className="w-full border-2 border-green-400 rounded-xl p-4 text-left hover:bg-green-50 transition-colors duration-200" // Added transition
              >
                {selectAddress !== null && addressList[selectAddress]
                  ? `${addressList[selectAddress]?.address_line}, ${addressList[selectAddress]?.city}, ${addressList[selectAddress]?.state}, ${addressList[selectAddress]?.country}, ${addressList[selectAddress]?.pincode} , ${addressList[selectAddress]?.mobile}`
                  : 'Select Address'}
              </motion.button>
            </div>

            {/* Order Summary Details */}
            <div className="bg-green-50 p-6 rounded-2xl space-y-4">
              <h4 className="text-xl font-semibold mb-2">Order Details </h4> {/* Added emoji */}
              <SummaryItem label="Items Total" icon={<MdStickyNote2 />} value={DisplayPriceInRupees(safeTotalPrice)} /> {/* Use safeTotalPrice */}
              <SummaryItem label="Delivery" icon={<MdDeliveryDining />} value={deliveryCharge > 0 ? `₹${deliveryCharge}` : <span className="text-green-600 font-medium">
                <span className="line-through text-gray-400 mr-1">₹30</span> FREE
              </span>} />
              <SummaryItem label="Handling" icon={<BsHandbagFill />} value={DisplayPriceInRupees(totalQty * 2)} />
              {tipAmount > 0 && <SummaryItem label="Tip" icon={<IoPerson />} value={DisplayPriceInRupees(tipAmount)} />}
              {/* Button to add tip */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowTipPopup(true)}
                className="w-full text-center py-2 border-dashed border-2 rounded-lg text-black mt-4 cursor-pointer hover:bg-green-50 transition-colors duration-200"
              >
                 Add Tip
              </motion.button>
            </div>
          </motion.div>

          {/* Right Side - Total Summary, Payment Options, Coupon */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col justify-between"
          >
            {/* Total Summary Box */}
            <div className="bg-green-50 rounded-2xl p-6 space-y-4"> {/* Adjusted space-y */}
              <h4 className="text-xl font-semibold">Total Summary </h4> {/* Added emoji */}

              {/* Display original total if coupon is applied - NO STRIKETHROUGH */}
              {appliedCoupon && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-between text-gray-600 text-base" // Adjusted text size
                >
                  <span>Items Total (before coupon)</span>
                  <span>{DisplayPriceInRupees(safeTotalPrice + (totalQty * 2) )}</span> {/* Removed line-through */}
                </motion.div>
              )}
              {/* Display coupon discount if applied */}
              {appliedCoupon && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-between items-center text-green-600 font-semibold text-base" // Added items-center for vertical alignment
                >
                  <span className="flex items-center gap-2">
                    <MdOutlineDiscount className="text-xl" /> Coupon "{appliedCoupon}" Discount:
                  </span>
                  <span className="flex items-center gap-2">
                    - {DisplayPriceInRupees(couponDiscount)}
                    {/* Cancel Button beside the applied coupon */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleCancelCoupon}
                      className="text-red-500 hover:text-red-700 text-lg transition-colors duration-200 p-1 rounded-full" // Styled cancel button
                      title="Cancel Coupon"
                    >
                      <IoCloseCircleOutline />
                    </motion.button>
                  </span>
                </motion.div>
              )}

              {/* Separator line */}
              {appliedCoupon && <hr className="border-gray-300 my-2" />} {/* Add separator */}

              <div className="flex justify-between text-xl font-bold"> {/* Increased font size */}
                <span>Grand Total</span> {/* Changed label to Grand Total */}
                <motion.span
                  key={DisplayPriceInRupees(safeTotalPrice)} // Use grandTotal as key for re-render animation
                  initial={{ opacity: 0, y: -10 }} // Initial state for animation
                  animate={{ opacity: 1, y: 0 }} // Animation state
                  transition={{ duration: 0.5 }} // Animation duration
                >
                  {DisplayPriceInRupees(grandTotal)} {/* Display calculated grandTotal */}
                </motion.span>
              </div>
              {/* Savings Banner */}
              {totalSavings > 0 && (
                <motion.div
                  className="flex items-center justify-between px-4 py-2 border-2 border-green-700  bg-green-50 text-green-700 rounded-xl text-sm"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <p><span className="font-semibold">Your total savings</span></p>
                  <p className="font-semibold">{DisplayPriceInRupees(totalSavings)}</p> {/* Display calculated totalSavings */}
                </motion.div>
              )}
              <p className="text-xs text-gray-500 flex items-center gap-1"><IoMdInformationCircleOutline /> * Includes all taxes and additional charges</p> {/* Added icon */}
            </div>

            {/* Payment Buttons with hover effects */}
            <div className="flex flex-col md:flex-row gap-4 px-4 py-6">
              {/* Button 1: Pay Online */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleOnlinePayment}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-full text-lg font-semibold flex items-center justify-center gap-2 transition-colors duration-200"
              >
                <RiSecurePaymentLine className="text-xl" /> Pay Online
              </motion.button>

              {/* Button 2: Cash on Delivery */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCashOnDelivery}
                className="flex-1 border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white py-3 rounded-full text-lg font-semibold flex items-center justify-center gap-2 transition-colors duration-200"
              >
                <GiReceiveMoney className="text-xl" /> Cash on Delivery
              </motion.button>
            </div>

            {/* NEW SECTION: Apply Coupon Button - Conditional Rendering */}
            {/* This entire div is now conditionally rendered */}
            <AnimatePresence mode="wait">
              {!appliedCoupon && ( // Only render this div if no coupon is applied
                <motion.div
                  key="apply-coupon-section" // Key for animation
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-gray-50 rounded-2xl p-6 space-y-4 text-center"
                >
                  <h4 className="text-xl font-semibold flex items-center justify-center gap-2"><RiCoupon3Fill /> Coupon</h4>
                  {/* The button inside this div is always the "Apply Coupon" button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowCouponPopup(true)}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    <MdOutlineDiscount className="text-xl" /> Apply Coupon
                  </motion.button>
                  {couponError && <p className="text-red-500 text-sm mt-2">{couponError}</p>}
                </motion.div>
              )}
            </AnimatePresence>

          </motion.div>
        </div>

        {/* Modals */}
        {/* Payment Processing Modal */}
        <AnimatePresence>
          {isProcessingPayment && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white p-8 rounded-3xl shadow-2xl text-center flex flex-col items-center" // Added flex for centering
              >
                {/* Modern Spinner Loading Animation */}
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent border-solid rounded-full animate-spin mb-4"></div>
                <h3 className="text-xl font-bold">Processing Payment...</h3>
                <p className="text-gray-500 mt-2">Redirecting to payment gateway</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tip Selection Modal */}
        <AnimatePresence>
          {showTipPopup && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white p-6 rounded-2xl w-80 text-center"
              >
                <h2 className="text-xl font-bold mb-6">Choose Tip 🤝</h2> {/* Added emoji */}
                <div className="grid grid-cols-2 gap-4">
                  {[10, 20, 30, 50].map(amount => (
                    <motion.button // Add motion for button animation
                      key={amount}
                      whileHover={{ scale: 1.05 }} // Scale on hover
                      whileTap={{ scale: 0.95 }} // Press on tap
                      onClick={() => {
                        setTipAmount(amount);
                        localStorage.setItem("tipAmount", amount);
                        window.dispatchEvent(new Event("tipUpdated"));
                        setShowTipPopup(false);
                      }}
                      className="bg-green-100 hover:bg-green-200 text-green-700 py-2 rounded-full font-semibold transition-colors duration-200"
                    >
                      ₹{amount}
                    </motion.button>
                  ))}
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowTipPopup(false)}
                  className="mt-6 w-full py-2 bg-gray-200 hover:bg-gray-300 rounded-full transition-colors duration-200"
                >
                  Cancel
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Address Selection Popup - Redesigned and Scrollbar Hidden */}
        <AnimatePresence>
          {showAddressPopup && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.4 }}
                // Added 'hide-scrollbar' class here
                className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-y-auto space-y-4 hide-scrollbar" // Increased padding, larger shadow, added space-y
              >
                <h3 className="text-2xl font-bold mb-4 text-center text-blue-700">Select Delivery Address <IoLocationSharp className="inline-block text-blue-600" /></h3> {/* Larger title, changed color */}

                {addressList.filter(addr => addr.status).map((addr, index) => (
                  <motion.div // Add motion for animation and hover effect
                    key={addr._id}
                    whileHover={{ scale: 1.02, backgroundColor: '#e0f2f7' }} // Scale and background change on hover
                    whileTap={{ scale: 0.98 }} // Press effect
                    className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${selectAddress === index ? 'border-green-500 bg-green-50 shadow-md' : 'border-gray-300'}`} // Conditional styling for selected address
                    onClick={() => {
                      setSelectAddress(index)
                      setShowAddressPopup(false)
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">{addr.address_line}</p>
                        <p className="text-gray-700 text-sm">{addr.city}, {addr.state}, {addr.country} - {addr.pincode}</p>
                        <p className="text-sm text-gray-600 mt-1">Mobile: {addr.mobile}</p>
                      </div>
                      {selectAddress === index && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="text-green-600 text-2xl"
                        >
                          <FaCheckCircle /> {/* Check icon for selected */}
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                ))}

                {/* Button to add new address */}
                <motion.div
                  whileHover={{ scale: 1.02, backgroundColor: '#e0f7e0' }} // Different hover color
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setOpenAddress(true);
                    setShowAddressPopup(false); // Close the selection popup when adding new address
                  }}
                  className="w-full text-center py-3 border-dashed border-2 border-blue-400 rounded-lg text-blue-600 mt-4 cursor-pointer flex items-center justify-center gap-2 font-semibold hover:bg-blue-50 transition-colors duration-200" // Enhanced styling
                >
                  <MdOutlineAddLocationAlt className="text-xl" /> + Add New Address
                </motion.div>

                {/* Close button for address popup */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowAddressPopup(false)}
                  className="mt-4 w-full text-center py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-full font-semibold transition-colors duration-200" // Enhanced styling
                >
                  Close
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add Address Modal - Renders only when openAddress is true */}
        {openAddress && <AddAddress close={() => setOpenAddress(false)} />}

        {/* NEW POPUP: Coupon Selection Popup (Modern UI) */}
        <AnimatePresence>
      {showCouponPopup && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" // Darker overlay
        >
          <motion.div
            initial={{ scale: 0.7, opacity: 0, y: 50 }} // Initial state: smaller, hidden, slightly below
            animate={{ scale: 1, opacity: 1, y: 0 }} // Animate to: normal size, visible, original position
            exit={{ scale: 0.7, opacity: 0, y: 50 }} // Exit animation
            transition={{ duration: 0.4, ease: "easeOut" }} // Animation duration and easing
            className="bg-white p-8 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto relative hide-scrollbar" // Increased max-width
          >
            {/* Close Button */}
            <button
              onClick={() => setShowCouponPopup(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors duration-200"
            >
              <IoCloseCircleOutline className="text-3xl" />
            </button>

            <h3 className="text-2xl font-bold mb-6 text-center text-blue-700">Available Coupons ✨</h3> {/* Title with emoji */}

            {/* Two-Column Layout for Coupons - Adjusted to sm:grid-cols-2 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6"> {/* Changed md:grid-cols-2 to sm:grid-cols-2 */}

              {/* Left Column: Card-Specific Coupons */}
              <div className="space-y-4">
                <h4 className="text-xl font-semibold flex items-center gap-2 text-gray-800"><FaCreditCardSolid /> Card Offers</h4>

                {/* Card Number Input Section */}
                <div className="space-y-2 bg-gray-100 p-4 rounded-lg"> {/* Added background and padding */}
                  <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 text-left">Enter Card Number to see offers</label>
                  <input
                    type="text"
                    id="cardNumber"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="e.g., 4111..."
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
                  />
                  {detectedCardType && (
                    <p className="text-sm text-gray-600 mt-1 text-left">Detected Card Type: <span className="font-semibold text-blue-700">{detectedCardType}</span></p>
                  )}
                </div>

                {/* List of Card-Specific Coupons */}
                <div className="space-y-4">
                  {Object.keys(validCoupons)
                    .filter(code => validCoupons[code].cardType) // Filter for coupons WITH a cardType
                    .map(code => {
                      const coupon = validCoupons[code];
                      // Check applicability based on total price, first-time status, AND card type
                      const isCardApplicable = cardNumber && detectedCardType === coupon.cardType;
                      const isApplicable = safeTotalPrice >= coupon.minOrder && (!coupon.isFirstTime || isFirstTimeCustomer) && isCardApplicable;

                      const isApplied = appliedCoupon === code;
                      const neededAmount = coupon.minOrder - safeTotalPrice;

                      return (
                        <motion.div
                          key={code}
                          whileHover={isApplicable ? { scale: 1.02, backgroundColor: '#e0f2f7' } : {}}
                          whileTap={isApplicable ? { scale: 0.98 } : {}}
                          onClick={() => isApplicable && handleCouponClick(code)}
                          className={`
                            p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 flex items-center gap-4
                            ${isApplied
                              ? 'border-green-500 bg-green-100 shadow-md'
                              : isApplicable
                                ? 'border-green-400 bg-green-50 hover:bg-green-100'
                                : 'border-gray-300 bg-gray-200 text-gray-500 cursor-not-allowed opacity-70'
                            }
                          `}
                        >
                          <div className={`text-3xl ${isApplicable ? 'text-green-600' : 'text-gray-400'}`}>
                            <IoCardOutline /> {/* Card outline icon */}
                          </div>
                          <div className="flex-grow">
                            <div className="font-bold text-base">{code}</div>
                            <div className="text-sm">{coupon.description}</div>
                            {!isApplicable && (
                              <div className="text-red-500 text-xs mt-1">
                                {coupon.minOrder > safeTotalPrice && `Add ${DisplayPriceInRupees(neededAmount)} more`}
                                {coupon.cardType && !cardNumber && `Enter card number`}
                                {coupon.cardType && cardNumber && detectedCardType !== coupon.cardType && `Requires ${coupon.cardType}`}
                              </div>
                            )}
                          </div>
                          {isApplied && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="text-green-600 text-2xl"
                            >
                              <FaCheckCircle />
                            </motion.div>
                          )}
                        </motion.div>
                      );
                    })}
                </div>
              </div>

              {/* Right Column: General Coupons */}
              <div className="space-y-4">
                <h4 className="text-xl font-semibold flex items-center gap-2 text-gray-800"><FaTag /> General Offers</h4>
                <div className="space-y-4">
                  {Object.keys(validCoupons)
                    .filter(code => !validCoupons[code].cardType) // Filter for coupons WITHOUT a cardType
                    .map(code => {
                      const coupon = validCoupons[code];
                      // Check applicability based on total price and first-time status
                      const isApplicable = safeTotalPrice >= coupon.minOrder && (!coupon.isFirstTime || isFirstTimeCustomer);

                      const isApplied = appliedCoupon === code;
                      const neededAmount = coupon.minOrder - safeTotalPrice;

                      return (
                        <motion.div
                          key={code}
                          whileHover={isApplicable ? { scale: 1.02, backgroundColor: '#e0f2f7' } : {}}
                          whileTap={isApplicable ? { scale: 0.98 } : {}}
                          onClick={() => isApplicable && handleCouponClick(code)}
                          className={`
                            p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 flex items-center gap-4
                            ${isApplied
                                ? 'border-green-500 bg-green-100 shadow-md'
                                : isApplicable
                                  ? 'border-green-400 bg-green-50 hover:bg-green-100'
                                  : 'border-gray-300 bg-gray-200 text-gray-500 cursor-not-allowed opacity-70'
                              }
                          `}
                        >
                          <div className={`text-3xl ${isApplicable ? 'text-green-300' : 'text-gray-400'}`}>
                            <FaTag /> {/* Tag icon */}
                          </div>
                          <div className="flex-grow">
                            <div className="font-bold text-base">{code}</div>
                            <div className="text-sm">{coupon.description}</div>
                            {!isApplicable && (
                              <div className="text-red-500 text-xs mt-1">
                                {coupon.minOrder > safeTotalPrice && `Add ${DisplayPriceInRupees(neededAmount)} more`}
                                {coupon.isFirstTime && !isFirstTimeCustomer && `First-time customers only`}
                              </div>
                            )}
                          </div>
                          {isApplied && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="text-green-600 text-2xl"
                            >
                              <FaCheckCircle />
                            </motion.div>
                          )}
                        </motion.div>
                      );
                    })}
                </div>
              </div>
            </div>
            {couponError && <p className="text-red-500 text-sm mt-4 text-center sm:col-span-2">{couponError}</p>} {/* Center error text across columns */}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>


        {/* Savings Pop-up */}
        <AnimatePresence>
          {showSavingsPopup && totalSavings > 0 && ( // Only show if popup state is true AND there are savings
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-10 flex items-center justify-center z-50 p-4" // Added padding for small screens
            >
              <motion.div
                initial={{ scale: 0.7, opacity: 0, y: 50 }} // Initial state: smaller, hidden, slightly below
                animate={{ scale: 1, opacity: 1, y: 0 }} // Animate to: normal size, visible, original position
                exit={{ scale: 0.7, opacity: 0, y: 50 }} // Exit animation
                transition={{ duration: 0.4, ease: "easeOut" }} // Animation duration and easing
                className="bg-gradient-to-br from-green-100 to-blue-100 p-8 rounded-3xl shadow-2xl text-center max-w-sm w-full space-y-6 border border-green-300" // Enhanced styling
              >
                {/* Pop-up Content */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                  className="flex flex-col items-center"
                >
                  <FaGift className="text-6xl text-green-500 mb-4 animate-bounce" /> {/* Gift icon with bounce animation */}
                  <h3 className="text-2xl font-bold text-green-800 mb-3">Congratulations! 🎉</h3> {/* Title with emoji */}
                  <p className="text-gray-700 text-lg">
                    You've saved a total of
                  </p>
                  <p className="text-4xl font-extrabold text-black mt-2 flex items-center">
                    {DisplayPriceInRupees(totalSavings)} {/* Savings amount with icon */}
                  </p>
                </motion.div>

                {/* Continue Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }} // Scale on hover
                  whileTap={{ scale: 0.95 }} // Press on tap
                  onClick={() => setShowSavingsPopup(false)} // Close pop-up on click
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-full text-lg font-semibold transition-colors duration-200 shadow-md" // Styled button
                >
                  Continue
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>
    </section>
  );
};

export default CheckoutPage;