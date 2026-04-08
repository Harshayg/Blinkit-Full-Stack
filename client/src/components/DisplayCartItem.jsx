import React, { useState, useEffect } from 'react';
import { IoClose, IoAdd } from 'react-icons/io5';
import { Link, useNavigate } from 'react-router-dom';
// Assuming these imports are correct relative to your project structure
import { useGlobalContext } from "../provider/GlobalProvider";
import { DisplayPriceInRupees } from "../utils/DisplayPriceInRupees";
import { FaCaretRight } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import AddToCartButton from "./AddToCartButton"; // Assuming this component exists
import { pricewithDiscount } from "../utils/PriceWithDiscount";
import imageEmpty from "../assets/empty_cart.webp"; // Ensure this path is correct
import toast from "react-hot-toast";
import { MdStickyNote2, MdDeliveryDining } from 'react-icons/md';
import { BsHandbagFill } from 'react-icons/bs';
import { RiTimerFill } from 'react-icons/ri';
import { motion, AnimatePresence } from 'framer-motion';
import { IoPerson } from 'react-icons/io5';
import { HiOutlineInformationCircle } from 'react-icons/hi';
import Divider from "../components/Divider"; // Assuming this component exists

// --- Skeleton Loader Component ---
// Displays a loading state while cart data is being fetched.
const SkeletonLoader = () => (
    <div className="p-4 space-y-4 animate-pulse">
        {/* Skeleton for Delivery Time */}
        <div className="bg-white rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gray-200 rounded-xl"></div>
                <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
            </div>
             {/* Skeleton for Cart Items (repeat a few times) */}
            {[1, 2].map((i) => (
                <div key={i} className="flex w-full gap-4 items-center pt-3">
                    <div className="w-16 h-16 min-h-16 min-w-16 bg-gray-200 rounded flex-shrink-0"></div>
                    <div className="flex-grow space-y-2 mr-2">
                        <div className="h-3 bg-gray-200 rounded w-full"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/3 mt-1"></div>
                    </div>
                    <div className="w-20 h-8 bg-gray-200 rounded-lg flex-shrink-0"></div>
                </div>
            ))}
        </div>

        {/* Skeleton for Bill Details */}
        <div className="bg-white rounded-2xl p-4 space-y-3">
            <div className="h-5 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="flex justify-between items-center">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
            <div className="flex justify-between items-center">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
             <div className="flex justify-between items-center">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
            <div className="border-t border-gray-200 my-2"></div> {/* Mimic Divider */}
             <div className="flex justify-between items-center">
                <div className="h-5 bg-gray-200 rounded w-1/4"></div>
                <div className="h-5 bg-gray-200 rounded w-1/3"></div>
            </div>
        </div>

         {/* Skeleton for Tip Section */}
         {/* This skeleton will be replaced by the new tabbed skeleton if needed */}
         <div className="bg-white rounded-2xl p-4 space-y-3">
            <div className="h-5 bg-gray-200 rounded w-1/3 mb-1"></div>
             <div className="h-3 bg-gray-200 rounded w-full mb-3"></div>
             <div className="flex gap-2">
                <div className="h-10 w-20 bg-gray-200 rounded-xl"></div>
                <div className="h-10 w-20 bg-gray-200 rounded-xl"></div>
                <div className="h-10 w-20 bg-gray-200 rounded-xl"></div>
                <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
             </div>
         </div>
    </div>
);

// --- SVG Icon for Tip Popup ---
// A simple SVG gift icon used in the custom tip popup.
const GiftIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 5a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);


// --- Main DisplayCartItem Component ---
// Renders the full cart display panel.
const DisplayCartItem = ({ close }) => {
    // State and hooks for managing cart data and UI state.
    const { notDiscountTotalPrice, totalPrice, totalQty } = useGlobalContext(); // Assuming GlobalProvider provides these totals
    const cartItem = useSelector((state) => state.cartItem.cart); // Get cart items from Redux store
    const user = useSelector((state) => state.user); // Get user info from Redux store
    const navigate = useNavigate(); // Hook for navigation
    const [isLoading, setIsLoading] = useState(true); // State for managing loading state
    // State to determine if the view is on a mobile screen.
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    // State for managing tip amount and related UI.
    const [tipAmount, setTipAmount] = useState(() => {
        // Initialize tip amount from localStorage or default to 0.
        const storedTip = localStorage.getItem("tipAmount");
        return storedTip ? parseInt(storedTip, 10) : 0;
    });
    const [floatingEmoji, setFloatingEmoji] = useState(null); // State for animating floating emojis
    const [showCustomTipPopup, setShowCustomTipPopup] = useState(false); // State for showing custom tip input popup
    const [customTipInput, setCustomTipInput] = useState(""); // State for custom tip input value
    const [customTipError, setCustomTipError] = useState(""); // State for custom tip input validation error

    // Predefined tip amounts displayed as buttons.
    const PREDEFINED_TIPS = [20, 30, 50];

    // New state for the tabbed section (Delivery Type, Tip, Instructions).
    const [activeTab, setActiveTab] = useState('delivery'); // Controls which tab is currently active
    // State for selected delivery type (e.g., 'standard', 'eco-saver').
    const [selectedDeliveryType, setSelectedDeliveryType] = useState('standard'); // Default to standard
    // State for selected delivery instructions (e.g., 'leave-at-door').
    const [selectedInstructions, setSelectedInstructions] = useState([]);
    // State for the 'Select All' instructions checkbox.
    const [selectAllInstructions, setSelectAllInstructions] = useState(false);

    // Example Data for the new section (Replace with your actual data source).
    const DELIVERY_TYPES = [
        { id: 'standard', name: 'Standard', description: 'Minimal order grouping', time: '10-15 mins', color: 'orange' },
        { id: 'eco-saver', name: 'Eco Saver', description: 'Lesser CO2 by order grouping', time: '15-25 mins', color: 'green' }, // Corrected color to green
    ];

    const INSTRUCTION_OPTIONS = [
        { id: 'leave-at-door', text: 'Leave at my door' },
        { id: 'ring-bell', text: 'Ring the bell' },
        { id: 'call-on-arrival', text: 'Call on arrival' },
    ];


    // State for managing visibility of information popups (Delivery and Handling charges).
    const [showDeliveryPopup, setShowDeliveryPopup] = useState(false);
    const [showHandlingPopup, setShowHandlingPopup] = useState(false);


    // --- Effects ---
    useEffect(() => {
        // Add overflow-hidden to body to prevent scrolling when the cart panel is open.
        document.body.classList.add('overflow-hidden');

        // Handle window resize to update the isMobile state.
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        window.addEventListener('resize', handleResize);

        // Cleanup function to remove the class and event listener when the component unmounts.
        return () => {
            document.body.classList.remove('overflow-hidden');
            window.removeEventListener('resize', handleResize); // Added cleanup
        };
    }, []); // Empty dependency array means this effect runs only once on mount and cleanup on unmount.

    useEffect(() => {
        // Simulate loading delay for the skeleton loader.
        if (Array.isArray(cartItem)) {
            const timer = setTimeout(() => {
                setIsLoading(false);
            }, 750); // Adjust delay as needed
            return () => clearTimeout(timer); // Cleanup the timer
        }
    }, [cartItem]); // Rerun effect if cartItem changes.

     useEffect(() => {
        // Store tip amount in localStorage whenever it changes.
        localStorage.setItem("tipAmount", tipAmount.toString());
    }, [tipAmount]); // Rerun effect if tipAmount changes.

    // --- Navigation and Tip Handling Functions ---
    // Redirects the user to the checkout page if logged in, otherwise prompts login.
    const redirectToCheckoutPage = () => {
        if (user?._id) {
            navigate("/checkout");
            if (close) close(); // Close the cart panel if a close function is provided.
        } else {
            toast("Please Login"); // Show a toast notification if the user is not logged in.
        }
    };

    // Handles the selection of a tip amount (predefined or custom).
    const handleTipSelection = (amount, emoji = "💰") => {
        // If the same predefined tip is clicked again, reset the tip to 0.
        if (PREDEFINED_TIPS.includes(amount) && tipAmount === amount) {
             setTipAmount(0);
             setFloatingEmoji(null); // Clear any floating emoji
        } else {
            setTipAmount(amount);
            // Only show floating emoji for predefined tips or custom tip with emoji.
            if (PREDEFINED_TIPS.includes(amount) || (emoji && amount > 0)) {
                setFloatingEmoji({ amount, emoji });
                // Animation duration matches the floating emoji transition duration.
                setTimeout(() => setFloatingEmoji(null), 1000); // Adjust timeout based on animation duration
            } else {
                 setFloatingEmoji(null); // Clear emoji if tip is 0 or custom tip without emoji
            }
        }
        setShowCustomTipPopup(false); // Close the custom tip popup.
        setCustomTipInput(""); // Clear the custom tip input field.
        setCustomTipError(""); // Clear any custom tip error messages.
    };

     // Function to remove the currently applied tip.
    const removeTip = () => {
        setTipAmount(0); // Set tip amount back to 0.
        setFloatingEmoji(null); // Clear any floating emoji.
    };

    // Opens the custom tip input popup.
    const openCustomTipPopup = () => {
        // If a custom tip is already active, pre-fill the input with the current amount.
        if (tipAmount > 0 && !PREDEFINED_TIPS.includes(tipAmount)) {
            setCustomTipInput(tipAmount.toString());
        } else {
            setCustomTipInput(""); // Otherwise, start with an empty input.
        }
        setCustomTipError(""); // Clear any previous error messages.
        setShowCustomTipPopup(true); // Show the custom tip popup.
    };

    // Handles the submission of the custom tip amount.
    const handleCustomTipSubmit = () => {
        const amount = parseInt(customTipInput, 10); // Parse the input value as an integer.
        // Validate the input amount.
        if (isNaN(amount) || amount <= 0) {
            setCustomTipError("Please enter a positive amount."); // Show error for invalid or non-positive input.
            return;
        }
        if (amount >= 3000) {
            setCustomTipError("Tip must be less than ₹3000."); // Show error if the amount is too high.
            return;
        }
        // Call the main tip selection handler with the custom amount and a default emoji.
        handleTipSelection(amount, '✨');
        // The popup is closed within handleTipSelection.
    };

    // --- New Handlers for the tabbed section ---
    // Handles the selection of a delivery type.
    const handleDeliveryTypeSelection = (typeId) => {
        setSelectedDeliveryType(typeId);
    };

    // Handles the selection/deselection of a delivery instruction.
    const handleInstructionSelection = (instructionId) => {
        setSelectedInstructions(prevSelected =>
            prevSelected.includes(instructionId)
                ? prevSelected.filter(id => id !== instructionId) // Deselect if already selected
                : [...prevSelected, instructionId] // Select if not already selected
        );
        // If 'select all' was checked, uncheck it if any option is deselected.
        if (selectAllInstructions && selectedInstructions.includes(instructionId)) {
             setSelectAllInstructions(false);
        }
    };

    // Handles the 'Select All' instructions checkbox.
    const handleSelectAllInstructions = () => {
        if (selectAllInstructions) {
            setSelectedInstructions([]); // Deselect all if 'Select All' is checked
        } else {
            setSelectedInstructions(INSTRUCTION_OPTIONS.map(option => option.id)); // Select all if 'Select All' is unchecked
        }
        setSelectAllInstructions(!selectAllInstructions); // Toggle the 'Select All' state.
    };
    // --- End New Handlers ---


    // --- Render Discount Price ---
    // Helper function to format the price with discount applied.
    const renderDiscountPrice = (item) => {
        if (!item?.productId) return DisplayPriceInRupees(0);
        const price = item.productId.price;
        const discount = item.productId.discount;
        const hasDiscount = typeof discount === 'number' && discount > 0;
        return (
            <>
                {hasDiscount && (
                    <span className="line-through text-neutral-400 mr-1">
                        {DisplayPriceInRupees(price)} {/* Display original price if discounted */}
                    </span>
                )}
                {DisplayPriceInRupees(pricewithDiscount(price, discount))} {/* Display price after discount */}
            </>
        );
    };

    // --- Calculate Totals ---
    // Calculate various total amounts for the bill details.
    const safeTotalPrice = typeof totalPrice === 'number' ? totalPrice : 0;
    const safeTotalQty = typeof totalQty === 'number' ? totalQty : 0;
    const safeTipAmount = typeof tipAmount === 'number' ? tipAmount : 0;
    // Calculate delivery charge based on total price.
    const deliveryCharge = (safeTotalPrice < 199 && safeTotalPrice > 0) ? 30 : 0;
    // Calculate handling charge based on total quantity.
    const handlingCharge = safeTotalQty * 2;
    // Calculate the grand total including items, handling, tip, and delivery charges.
    const grandTotal = safeTotalPrice + handlingCharge + safeTipAmount + deliveryCharge;
    const safeNotDiscountTotalPrice = typeof notDiscountTotalPrice === 'number' ? notDiscountTotalPrice : 0;
    // Calculate total savings from discounts.
    const totalSavings = safeNotDiscountTotalPrice - safeTotalPrice;
    // Check if a custom tip (not one of the predefined amounts) is currently active.
    const isCustomTipActive = tipAmount > 0 && !PREDEFINED_TIPS.includes(tipAmount);

    // Helper function to display price without decimals (used for tip buttons).
    const DisplayPriceInRupeesWithoutDecimals = (price) => {
        if (typeof price !== 'number') return '';
        return `₹${Math.floor(price)}`;
    };


    return (
        // Main container for the cart panel, with background overlay and animation.
        <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
             // Reverted background opacity
            className={`bg-neutral-900 fixed inset-0 bg-opacity-70 z-50 h-screen`}
            // Close the panel if the overlay background is clicked.
            onClick={(e) => { if (e.target === e.currentTarget) close?.(); }}
        >
            {/* --- Redesigned Custom Tip Popup (with responsive animation) --- */}
            {/* AnimatePresence manages the presence/absence animation of the popup. */}
            <AnimatePresence>
                {showCustomTipPopup && (
                    <motion.div
                        // Conditional animation based on screen size (slide up on mobile, scale/fade on desktop).
                        initial={{ opacity: 0, scale: isMobile ? 1 : 0.85, y: isMobile ? '100%' : 0 }} // Slide up from bottom on mobile
                        animate={{ opacity: 1, scale: 1, y: isMobile ? 0 : 0 }} // Stay at position 0 on mobile
                        exit={{ opacity: 0, scale: isMobile ? 1 : 0.85, y: isMobile ? '100%' : 0 }} // Slide down to bottom on mobile
                        transition={{ type: isMobile ? "tween" : "spring", damping: isMobile ? 0 : 15, stiffness: isMobile ? 0 : 200, duration: isMobile ? 0.3 : 0.4 }} // Use tween for mobile slide
                        className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none"
                    >
                        {/* Popup Content Card */}
                        <div
                            // Conditional positioning and rounding based on screen size.
                            className={`bg-gradient-to-br from-white via-gray-50 to-gray-100 rounded-2xl p-6 w-full max-w-sm pointer-events-auto shadow-2xl flex flex-col items-center text-center relative ${isMobile ? 'absolute bottom-0 left-0 right-0 rounded-b-none' : ''}`} // Position at bottom on mobile, remove bottom rounded corners
                            // Prevent closing the popup when clicking inside it.
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Close Button Top Right */}
                            <button
                                onClick={() => setShowCustomTipPopup(false)}
                                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
                                aria-label="Close custom tip popup"
                            >
                                <IoClose size={24} />
                            </button>

                            {/* Gift Icon */}
                            <GiftIcon />

                            {/* Title */}
                            <h3 className="font-semibold text-gray-800 text-xl mb-2">Add a Custom Tip</h3>
                            <p className="text-gray-500 text-sm mb-5 px-4">
                                Your generosity is appreciated! 100% goes to the delivery partner.
                            </p>

                            {/* Input Field */}
                            <div className="relative w-full max-w-xs mb-3">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-medium text-gray-500">₹</span>
                                <input
                                    type="number"
                                    value={customTipInput}
                                    onChange={(e) => {
                                        // Limit input length for safety.
                                        const value = e.target.value.slice(0, 4);
                                        setCustomTipInput(value);
                                        if (customTipError) setCustomTipError(""); // Clear error on input change.
                                    }}
                                    placeholder="Enter amount"
                                    // Prevent non-numeric keys more broadly.
                                    onKeyDown={(e) => {
                                        // Allow backspace, delete, tab, escape, enter, arrows.
                                        if ([46, 8, 9, 27, 13, 110].includes(e.keyCode) ||
                                            // Allow Ctrl+A, Cmd+A.
                                            (e.keyCode === 65 && (e.ctrlKey === true || e.metaKey === true)) ||
                                            // Allow home, end, left, right, down, up.
                                            (e.keyCode >= 35 && e.keyCode <= 40)) {
                                            return; // let it happen, don't do anything
                                        }
                                        // Ensure that it is a number and stop the keypress.
                                        if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
                                            e.preventDefault();
                                        }
                                    }}
                                    className={`w-full text-center text-lg font-medium pl-10 pr-4 py-2.5 rounded-xl border-2 ${customTipError ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'} focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:ring-opacity-50 outline-none transition-all duration-200`}
                                />
                            </div>

                            {/* Error Message */}
                            {customTipError && (
                                <p className="text-red-600 text-sm mb-3">{customTipError}</p>
                            )}

                            {/* Submit Button */}
                            <button
                                onClick={handleCustomTipSubmit}
                                className="w-full max-w-xs bg-green-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75 transition-all duration-200 shadow-md hover:shadow-lg text-base"
                            >
                                Add Custom Tip
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            {/* --- End Redesigned Custom Tip Popup --- */}


            {/* Delivery & Handling Popups (Reverted to original animation) */}
             <AnimatePresence>
                {showDeliveryPopup && (
                     <motion.div
                        // Animation for the delivery info popup.
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ type: "spring", duration: 0.4 }}
                        className="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none"
                    >
                         <div className={`bg-white rounded-2xl p-4 w-11/12 max-w-md mx-auto pointer-events-auto shadow-xl`}> {/* Reverted positioning */}
                            <div className="flex justify-between items-start mb-2">
                                <h2 className=" font-semibold text-gray-900 text-base">Delivery Charges</h2>
                                <button
                                    onClick={() => setShowDeliveryPopup(false)}
                                    className="text-gray-600 hover:text-gray-900"
                                >
                                    <IoClose size={20} />
                                </button>
                            </div>
                            <p className="text-gray-700 mb-2 text-sm">
                                ₹30 for orders below ₹199
                            </p>
                            <p className="text-gray-700 mb-4 text-sm">
                                ₹0 for orders ₹199 or above
                            </p>
                            <button
                                onClick={() => setShowDeliveryPopup(false)}
                                className="w-full bg-green-600 text-white font-semibold py-2 rounded-xl hover:bg-green-700 transition-colors text-sm"
                            >
                                Sounds good
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            <AnimatePresence>
                {showHandlingPopup && (
                    <motion.div
                         // Animation for the handling info popup.
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ type: "spring", duration: 0.4 }}
                        className="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none"
                    >
                         <div className={`bg-white rounded-2xl p-4 w-11/12 max-w-md mx-auto pointer-events-auto shadow-xl`}> {/* Reverted positioning */}
                            <div className="flex justify-between items-start mb-2">
                                <h2 className=" font-semibold text-gray-900 text-base">Handling Charge</h2>
                                <button
                                    onClick={() => setShowHandlingPopup(false)}
                                    className="text-gray-600 hover:text-gray-900"
                                >
                                    <IoClose size={20} />
                                </button>
                            </div>
                            <p className="text-gray-700 mb-4 text-sm">
                                This fee covers packaging and ensures the safe and secure delivery of your items.
                            </p>
                            <button
                                onClick={() => setShowHandlingPopup(false)}
                                className="w-full bg-green-600 text-white font-semibold py-2 rounded-xl hover:bg-green-700 transition-colors text-sm"
                            >
                                Sounds good
                            </button>

                        </div>
                    </motion.div>
                )}
            </AnimatePresence>


            {/* Main Cart Panel (Reverted to original animation) */}
            <motion.div
                 // Animation for the main cart panel sliding in from the right.
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", stiffness: 200, damping: 25 }}
                // Prevent closing the panel when clicking inside it.
                onClick={(e) => e.stopPropagation()}
                 // Positioning and styling for the cart panel.
                className={`bg-white w-full max-w-sm h-full ml-auto flex flex-col relative z-[55]`}
            >
                {/* Header with title and close button. */}
                <div className="p-4 border-b border-gray-200 flex justify-between items-center flex-shrink-0">
                    {/* Wrap the h1 with a Link to navigate to the home page */}
                    <Link to="/" className="cursor-pointer">
                        <h1 className="text-xl font-semibold text-gray-900">My Cart</h1>
                    </Link>
                    {/* Always show the close button */}
                     <button onClick={close} className="text-gray-600 hover:text-gray-900">
                        <IoClose size={24} />
                    </button>
                </div>

                {/* Body: Conditional Rendering (Skeleton or Content) */}
                <div className="flex-1 overflow-y-auto bg-slate-100">
                    {isLoading ? (
                        // Show skeleton loader while loading.
                        <SkeletonLoader />
                    ) : Array.isArray(cartItem) && cartItem.length > 0 ? (
                        // Render cart content if items are available.
                        <div className="p-2 flex flex-col gap-4 pb-4">
                            {/* Delivery Time & Item List */}
                             <motion.div
                                className="bg-white rounded-2xl p-4 grid gap-5"
                                initial={{ opacity: 0, scale: 0.97 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.1 }}
                            >
                                <div className="rounded-xl mx-2 mt-1 flex flex-col gap-1">
                                    <div className="flex items-center gap-2 text-black font-semibold text-base">
                                        <span className="bg-gray-100 rounded-xl p-2">
                                            <RiTimerFill className="text-green-600" size={25} />
                                        </span>
                                        <div className="flex flex-col">
                                            <span className="text-black font-semibold">
                                                Delivery in 13 min {/* Hardcoded delivery time */}
                                            </span>
                                            <span className="text-gray-500 text-xs">
                                                Shipment of {safeTotalQty} item{safeTotalQty !== 1 ? "s" : ""} {/* Display total item quantity */}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Map through cart items and display each item. */}
                                {cartItem.map((item) => (
                                    <motion.div
                                        layout // Enable layout animations for list items
                                        key={item?._id + "cartItemDisplay"}
                                        className="flex w-full gap-4 items-center pt-3 border-t border-gray-100 first:border-t-0 first:pt-0"
                                    >
                                        <div className="w-16 h-16 min-h-16 min-w-16 border border-gray-100 rounded bg-white flex-shrink-0 p-1">
                                            <img
                                                src={item?.productId?.image?.[0]} // Display product image
                                                className="object-contain w-full h-full"
                                                alt={item?.productId?.name || 'Product Image'}
                                                // Fallback image if the primary image fails to load.
                                                onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/64x64/f0f0f0/cccccc?text=N/A`; }}
                                            />
                                        </div>
                                        <div className="flex-grow text-xs mr-2">
                                            <p className="text-sm text-ellipsis line-clamp-2 font-medium text-gray-800 mb-0.5">
                                                {item?.productId?.name} {/* Display product name */}
                                            </p>
                                            <p className="text-neutral-400 text-xs">{item?.productId?.unit}</p> {/* Display product unit */}
                                            <p className="text-sm font-semibold text-gray-900 mt-1">
                                                {renderDiscountPrice(item)} {/* Display price with discount */}
                                            </p>
                                        </div>
                                        <div className="flex-shrink-0">
                                            {/* AddToCartButton component to manage item quantity in the cart. */}
                                            {item?.productId && <AddToCartButton data={item.productId} />}
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>

                            {/* Bill Section */}
                            <motion.div
                                className="bg-white rounded-2xl p-4"
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.15 }}
                            >
                                <h3 className="font-semibold text-gray-900 mb-4">Bill details</h3>
                                <div className="space-y-2.5 text-sm">
                                    {/* Item Total */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-gray-700">
                                            <MdStickyNote2 size={16} />
                                            <span>Items total</span>
                                            {totalSavings > 0 && (
                                                <span className="bg-green-100 text-green-700 text-xs font-semibold rounded px-1.5 py-0.5 select-none">
                                                    Saved {DisplayPriceInRupees(totalSavings)} {/* Display total savings */}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-900 font-medium">
                                            {totalSavings > 0 && (
                                                <span className="line-through text-neutral-400">
                                                    {DisplayPriceInRupees(safeNotDiscountTotalPrice)} {/* Display original total if saved */}
                                                </span>
                                            )}
                                            <span>{DisplayPriceInRupees(safeTotalPrice)}</span> {/* Display total price after discount */}
                                        </div>
                                    </div>

                                    {/* Delivery Charge */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-gray-700">
                                            <MdDeliveryDining size={16} />
                                            <span>Delivery charge</span>
                                            {/* Info icon to show delivery charge popup. */}
                                            <HiOutlineInformationCircle
                                                onClick={() => setShowDeliveryPopup(true)}
                                                className="cursor-pointer text-gray-500 hover:text-gray-700"
                                                size={16}
                                            />
                                        </div>
                                        {deliveryCharge > 0 ? (
                                            <span className="text-gray-900 font-medium">
                                                {DisplayPriceInRupees(deliveryCharge)} {/* Display delivery charge */}
                                            </span>
                                        ) : (
                                            <span className="text-green-600 font-medium">
                                                <span className="line-through text-gray-400 mr-1">₹30</span> FREE {/* Display FREE if delivery is free */}
                                            </span>
                                        )}
                                    </div>

                                    {/* Handling Charge */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-gray-700">
                                            <BsHandbagFill size={15} />
                                            <span>Handling charge</span>
                                            {/* Info icon to show handling charge popup. */}
                                            <HiOutlineInformationCircle
                                                onClick={() => setShowHandlingPopup(true)}
                                                className="cursor-pointer text-gray-500 hover:text-gray-700"
                                                size={16}
                                            />
                                        </div>
                                        <span className="text-gray-900 font-medium">
                                            {DisplayPriceInRupees(handlingCharge)} {/* Display handling charge */}
                                        </span>
                                    </div>

                                    {/* Tip Amount (Animated) with Remove Button */}
                                    {/* AnimatePresence manages the presence/absence animation of the tip row. */}
                                    <AnimatePresence>
                                        {safeTipAmount > 0 && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto', marginTop: '10px', marginBottom: '10px' }}
                                                exit={{ opacity: 0, height: 0, marginTop: '0px', marginBottom: '0px' }}
                                                transition={{ duration: 0.3 }}
                                                className="flex items-center justify-between overflow-hidden"
                                            >
                                                <div className="flex items-center gap-2 text-gray-700">
                                                    <IoPerson size={16} />
                                                    <span>Tip</span>
                                                </div>
                                                <div className="flex items-center gap-1 text-gray-900 font-medium"> {/* Added flex container for amount and remove button */}
                                                    <span>{DisplayPriceInRupees(safeTipAmount)}</span> {/* Display tip amount */}
                                                    {/* Remove Tip Button */}
                                                    <button
                                                        onClick={removeTip} // Call the removeTip function
                                                        className="text-gray-400 hover:text-red-600 transition-colors p-1 -mr-1" // Adjusted padding and margin for better click area
                                                        aria-label="Remove tip"
                                                    >
                                                        <IoClose size={16} />
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Divider component */}
                                    <Divider />

                                    {/* Grand Total */}
                                    <div className="flex items-center justify-between font-semibold text-gray-900">
                                        <span className="text-base">Grand Total</span>
                                        <span className="text-base">
                                            {DisplayPriceInRupees(grandTotal)} {/* Display grand total */}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Savings Banner */}
                             {totalSavings > 0 && (
                                <motion.div
                                    className="flex items-center justify-between px-4 py-2 bg-green-50 text-green-700 rounded-xl text-sm mb-4" // Added mb-4 for spacing
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                >
                                    <p><span className="font-semibold">Your total savings</span></p>
                                    <p className="font-semibold">{DisplayPriceInRupees(totalSavings)}</p> {/* Display total savings */}
                                </motion.div>
                            )}


                            {/* --- Start of Integrated Tabbed Section --- */}
                             <motion.div
                                className="bg-white rounded-2xl p-4"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                {/* Tab Navigation */}
                                <div className="flex bg-gray-200 rounded-full p-1 mb-4">
                                    {/* Button to switch to Delivery Type tab. */}
                                    <button
                                        className={`flex-1 py-2 text-sm font-medium rounded-full transition-colors duration-200 ${activeTab === 'delivery' ? 'bg-black text-white shadow' : 'text-gray-600 hover:text-gray-800'}`}
                                        onClick={() => setActiveTab('delivery')}
                                    >
                                        Delivery Type
                                    </button>
                                    {/* Button to switch to Tip tab. */}
                                    <button
                                        className={`flex-1 py-2 text-sm font-medium rounded-full transition-colors duration-200 ${activeTab === 'tip' ? 'bg-black text-white shadow' : 'text-gray-600 hover:text-gray-800'}`}
                                        onClick={() => setActiveTab('tip')}
                                    >
                                        Tip
                                    </button>
                                    {/* Button to switch to Instructions tab. */}
                                    <button
                                        className={`flex-1 py-2 text-sm font-medium rounded-full transition-colors duration-200 ${activeTab === 'instructions' ? 'bg-black text-white shadow' : 'text-gray-600 hover:text-gray-800'}`}
                                        onClick={() => setActiveTab('instructions')}
                                    >
                                        Instructions
                                    </button>
                                </div>

                                {/* Tab Content */}
                                <div>
                                    {/* Content for the Delivery Type tab. */}
                                    {activeTab === 'delivery' && (
                                        <div>
                                            {DELIVERY_TYPES.map((type, index) => {
                                                const isSelected = selectedDeliveryType === type.id;
                                                // Determine text color based on selection and delivery type.
                                                const nameColorClass = isSelected ? (type.id === 'standard' ? 'text-orange-500' : 'text-green-700') : 'text-gray-700';
                                                const timeColorClass = isSelected ? (type.id === 'standard' ? 'text-orange-500' : 'text-green-700') : 'text-gray-700';

                                                return (
                                                    <div
                                                        key={type.id}
                                                        // Add conditional border-b for separation between options.
                                                        className={`flex items-center justify-between p-3 cursor-pointer transition-colors duration-200 ${index < DELIVERY_TYPES.length - 1 ? 'border-b border-gray-200' : ''}`}
                                                        onClick={() => handleDeliveryTypeSelection(type.id)}
                                                    >
                                                        <div className="flex items-center">
                                                            {/* Radio button for selecting delivery type. */}
                                                            <input
                                                                type="radio"
                                                                name="deliveryType"
                                                                value={type.id}
                                                                checked={isSelected}
                                                                onChange={() => handleDeliveryTypeSelection(type.id)}
                                                                // Styling for the radio button.
                                                                className={`mr-3 h-4 w-4 ${isSelected ? (type.id === 'standard' ? 'text-orange-500 border-orange-500' : 'text-green-800 border-green-800') : 'text-gray-300 border-gray-300'} focus:ring-0 focus:ring-offset-0`} // Adjusted focus rings and border color
                                                                // Direct style for more control over checked color.
                                                                style={{ color: isSelected ? (type.id === 'standard' ? '#f97316' : '#22c55e') : '#d1d5db' }}
                                                            />
                                                            <div>
                                                                {/* Text color based on selection */}
                                                                <p className={`font-medium ${nameColorClass}`}>{type.name}</p>
                                                                <p className={`text-xs ${isSelected ? 'text-gray-500' : 'text-gray-500'}`}>{type.description}</p>
                                                            </div>
                                                        </div>
                                                        {/* Time text color based on selection */}
                                                        <span className={`text-sm font-medium ${timeColorClass}`}>{type.time}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* Content for the Tip tab. */}
                                    {activeTab === 'tip' && (
                                        <div>
                                            {/* Descriptive Text */}
                                            <p className="text-gray-700 text-sm mb-4">
                                                Day & night, our delivery partners bring your favourite meals. Thank them with a tip.
                                            </p>

                                            {/* Tip Options */}
                                            {/* Added overflow-x-auto and whitespace-nowrap for horizontal scrolling, added hide-scrollbar class */}
                                            <div className="flex gap-2 relative items-center overflow-x-auto whitespace-nowrap pb-2 hide-scrollbar"> {/* Added hide-scrollbar class */}
                                                {/* Removed "No Tip" Option */}

                                                {/* Map through predefined tip amounts and display buttons. */}
                                                {PREDEFINED_TIPS.map((amount) => {
                                                    const isSelected = tipAmount === amount && !isCustomTipActive;
                                                    // Determine emoji based on amount.
                                                    const emoji = amount === 20 ? "😊" : amount === 30 ? "👍" : "❤️";


                                                    return (
                                                        <div key={amount} className="relative flex flex-col items-center flex-shrink-0"> {/* Added flex-col and items-center */}
                                                            <motion.button
                                                                onClick={() => handleTipSelection(amount, emoji)} // Pass emoji to handler
                                                                // Adjusted sizing and styling to match the image
                                                                className={`w-20 h-12 px-2 py-2 rounded-lg flex items-center justify-center text-sm font-medium transition-all duration-200 border ${isSelected
                                                                        ? "bg-green-600 text-white border-green-600" // Selected state
                                                                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100" // Unselected state
                                                                    }`}
                                                                whileTap={{ scale: 0.95 }} // Tap animation
                                                            >
                                                                {/* Display price without decimals and emoji */}
                                                                <span className="font-sans text-base font-semibold">{DisplayPriceInRupeesWithoutDecimals(amount)} {emoji}</span> {/* Added emoji */}
                                                            </motion.button>
                                                            {/* Floating emoji animation for predefined tips. */}
                                                            <AnimatePresence>
                                                                {/* Modified animation for floating emoji */}
                                                                {floatingEmoji?.amount === amount && !isCustomTipActive && (
                                                                    <motion.div
                                                                        initial={{ opacity: 0, y: 0, scale: 0.8, x: 0, rotate: 0 }}
                                                                        animate={{ opacity: 1, y: -50, x: [0, 8, -8, 8, -8, 0], scale: [0.8, 2.0, 2.0, 2.0, 2.0, 0], rotate: [0, 7, -7, 7, -7, 0] }}
                                                                        exit={{ opacity: 0, y: -60, scale: 0 }}
                                                                        transition={{ duration: 1.0, ease: "easeInOut", times: [0, 0.2, 0.4, 0.6, 0.8, 1] }}
                                                                        className="absolute left-1/2 top-0 -translate-x-1/2 text-2xl pointer-events-none z-10"
                                                                    >
                                                                        {floatingEmoji.emoji}
                                                                    </motion.div>
                                                                )}
                                                            </AnimatePresence>
                                                        </div>
                                                    );
                                                })}
                                                {/* Other Option (Styled as input) */}
                                                <div className="relative flex flex-col items-center flex-shrink-0"> {/* Added flex-shrink-0 */}
                                                    <motion.button
                                                        onClick={openCustomTipPopup} // Open custom tip popup on click.
                                                        whileTap={{ scale: 0.95 }} // Tap animation
                                                        // Adjusted sizing and styling to match the image
                                                        className={`w-20 h-12 px-2 py-2 rounded-lg flex items-center justify-center text-sm font-medium transition-all duration-200 border ${isCustomTipActive
                                                                ? "bg-green-600 text-white border-green-600" // Selected state if custom tip is active
                                                                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100" // Unselected state
                                                            }`}
                                                    >
                                                        {isCustomTipActive ? (
                                                            // Display price without decimals for custom tip
                                                            <span className="font-sans text-base font-semibold">{DisplayPriceInRupeesWithoutDecimals(tipAmount)} ✨</span> // Added emoji for custom tip
                                                        ) : (
                                                            <span className="text-base font-semibold">Other</span> // Display "Other" text if no custom tip is active
                                                        )}
                                                    </motion.button>
                                                     {/* Floating emoji for custom tip */}
                                                     <AnimatePresence>
                                                         {floatingEmoji && floatingEmoji.amount === tipAmount && isCustomTipActive && (
                                                             <motion.div
                                                                 initial={{ opacity: 0, y: 0, scale: 0.8, x: 0, rotate: 0 }}
                                                                 animate={{ opacity: 1, y: -50, x: [0, 8, -8, 8, -8, 0], scale: [0.8, 2.0, 2.0, 2.0, 2.0, 0], rotate: [0, 7, -7, 7, -7, 0] }}
                                                                 exit={{ opacity: 0, y: -60, scale: 0 }}
                                                                 transition={{ duration: 1.0, ease: "easeInOut", times: [0, 0.2, 0.4, 0.6, 0.8, 1] }}
                                                                 className="absolute left-1/2 top-0 -translate-x-1/2 text-2xl pointer-events-none z-10"
                                                             >
                                                                 {floatingEmoji.emoji} {/* Corrected rendering of emoji */}
                                                             </motion.div>
                                                         )}
                                                     </AnimatePresence>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Content for the Instructions tab. */}
                                    {activeTab === 'instructions' && (
                                        <div>
                                            {/* Map through instruction options and display checkboxes. */}
                                            {INSTRUCTION_OPTIONS.map((instruction) => (
                                                <div
                                                    key={instruction.id}
                                                    className={`flex items-center p-3 rounded-xl cursor-pointer mb-2 last:mb-0 transition-colors duration-200 border ${selectedInstructions.includes(instruction.id) ? 'border-green-400 bg-green-50' : 'border-gray-200 hover:bg-gray-100'}`}
                                                    onClick={() => handleInstructionSelection(instruction.id)} // Toggle instruction selection on click.
                                                >
                                                    {/* Checkbox for selecting an instruction. */}
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedInstructions.includes(instruction.id)}
                                                        onChange={() => handleInstructionSelection(instruction.id)} // Toggle instruction selection on checkbox change.
                                                        className="mr-3 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                                    />
                                                    <p className={`font-medium ${selectedInstructions.includes(instruction.id) ? 'text-green-700' : 'text-gray-700'}`}>{instruction.text}</p> {/* Display instruction text. */}
                                                </div>
                                            ))}
                                            {/* Optional: Add a "Select All" checkbox here if needed */}
                                            {/* <div
                                                className={`flex items-center p-3 rounded-xl cursor-pointer mb-2 last:mb-0 transition-colors duration-200 border ${selectAllInstructions ? 'border-green-400 bg-green-50' : 'border-gray-200 hover:bg-gray-100'}`}
                                                onClick={handleSelectAllInstructions}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selectAllInstructions}
                                                    onChange={handleSelectAllInstructions}
                                                    className="mr-3 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                                />
                                                <p className={`font-medium ${selectAllInstructions ? 'text-green-700' : 'text-gray-700'}`}>Select All</p>
                                            </div> */}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                            {/* --- End of Integrated Tabbed Section --- */}


                            {/* Cancellation Policy */}
                            <motion.div
                                className="bg-white rounded-2xl p-4"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.25 }}
                            >
                                <h2 className="font-semibold text-gray-900 mb-1">Cancellation Policy</h2>
                                <p className="text-gray-500 text-xs text-ellipsis">
                                    Orders cannot be cancelled once packed. Refunds processed for unexpected delays where applicable.
                                </p>
                            </motion.div>
                        </div>
                    ) : (
                        // Empty Cart Message
                        <motion.div
                            className="flex-1 flex flex-col justify-center items-center text-center p-6"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ type: "spring", delay: 0.1 }}
                        >
                            <img src={imageEmpty} className="w-48 h-48 object-contain mb-5" alt="Empty Cart" /> {/* Empty cart image */}
                            <p className="text-lg font-semibold text-gray-700 mb-2">Your cart is empty</p>
                            <p className="text-sm text-gray-500 mb-6">Add items to get started!</p>
                            {/* Link to the home page to start shopping. */}
                            <Link
                                onClick={close} // Close the cart panel when clicking the link.
                                to={"/"}
                                className="block bg-green-600 px-6 py-2.5 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-md"
                            >
                                Start Shopping
                            </Link>
                        </motion.div>
                    )}
                </div>

                {/* Footer: Proceed Button */}
                {/* AnimatePresence manages the presence/absence animation of the footer button. */}
                <AnimatePresence>
                    {!isLoading && Array.isArray(cartItem) && cartItem.length > 0 && (
                        <motion.div
                            className="p-4 border-t border-gray-200 bg-white flex-shrink-0"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            transition={{ delay: 0.1 }}
                        >
                            {/* Button to proceed to checkout. */}
                            <button
                                onClick={redirectToCheckoutPage}
                                className="w-full bg-green-600 text-white px-4 font-bold text-base py-3 rounded-xl flex items-center gap-2 justify-between hover:bg-green-700 transition-colors shadow-lg active:bg-green-800"
                            >
                                <div className="flex flex-col items-start">
                                    {/* Display item count and grand total. */}
                                    <span className="text-xs font-normal">{safeTotalQty} Item{safeTotalQty !== 1 ? 's' : ''} | {DisplayPriceInRupees(grandTotal)}</span>
                                    <span className="text-sm font-medium -mt-0.5">Total</span>
                                                                </div>
                                <div className="flex items-center gap-1 font-semibold">
                                    Proceed <FaCaretRight /> {/* Proceed text and arrow icon. */}
                                </div>
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div> {/* End Main Cart Panel */}
        </motion.section>
    );
};
export default DisplayCartItem;
