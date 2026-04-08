import React, { useState } from 'react'; // Import useState for loading state
import { useForm } from "react-hook-form";
import Axios from '../utils/Axios'; // Assuming this path is correct
import SummaryApi from '../common/SummaryApi'; // Assuming this path is correct
import toast from 'react-hot-toast'; // Assuming this is installed
import AxiosToastError from '../utils/AxiosToastError'; // Assuming this path is correct
import { IoClose } from "react-icons/io5"; // Assuming react-icons is installed
import { useGlobalContext } from '../provider/GlobalProvider'; // Assuming this path is correct
import { motion, AnimatePresence } from 'framer-motion'; // Import motion and AnimatePresence
import { FiMapPin, FiHome, FiNavigation, FiGlobe, FiPhone } from "react-icons/fi"; // Import icons

// Component for editing address details in a modal
const RedesignedEditAddressDetails = ({ close, data }) => {
    // Initialize react-hook-form with default values from the provided data
    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        defaultValues: {
            _id: data?._id || '', // Use optional chaining and default empty string
            userId: data?.userId || '', // Use optional chaining and default empty string
            address_line: data?.address_line || '', // Use optional chaining and default empty string
            city: data?.city || '', // Use optional chaining and default empty string
            state: data?.state || '', // Use optional chaining and default empty string
            country: data?.country || '', // Use optional chaining and default empty string
            pincode: data?.pincode || '', // Use optional chaining and default empty string
            mobile: data?.mobile || '' // Use optional chaining and default empty string
        }
    });

    // Get fetchAddress function from global context
    const { fetchAddress } = useGlobalContext();

    // State for loading indicator
    const [isLoading, setIsLoading] = useState(false);


    // Form submission handler
    const onSubmit = async (formData) => {
        setIsLoading(true); // Set loading to true on submit
        try {
            // Call API to update address
            const response = await Axios({
                ...SummaryApi.updateAddress, // Assuming SummaryApi.updateAddress contains method and url
                data: {
                    ...formData, // Send all form data
                    // Explicitly listing fields again, though ...formData should cover it
                    address_line: formData.address_line,
                    city: formData.city,
                    state: formData.state,
                    country: formData.country,
                    pincode: formData.pincode,
                    mobile: formData.mobile
                }
            });

            const { data: responseData } = response;

            // Handle successful update
            if (responseData.success) {
                toast.success(responseData.message);
                if (close) {
                    // Add a small delay before closing and resetting for better UX with loading state
                     setTimeout(() => {
                        close(); // Close the modal
                        reset(); // Reset form fields
                        fetchAddress(); // Refresh address list
                     }, 500); // Adjust delay as needed
                }
            }
        } catch (error) {
            // Handle API errors using AxiosToastError utility
            AxiosToastError(error);
        } finally {
            setIsLoading(false); // Set loading to false after request finishes
        }
    };

    return (
        // Modal backdrop and container with Framer Motion animation
        <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="fixed inset-0 z-50 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center p-4"
        >
            {/* Modal content area with Framer Motion animation */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-gray-100"
            >
                <div className="p-6 relative">
                    {/* Modal header */}
                    <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-800">Edit Address</h2>
                            <p className="text-sm text-gray-600">Update your delivery details</p> {/* Updated subtitle */}
                        </div>
                        {/* Close button */}
                        <button
                            onClick={close}
                            className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 ease-in-out focus:outline-none text-gray-500"
                            aria-label="Close modal"
                        >
                            <IoClose size={28} /> {/* Increased icon size */}
                        </button>
                    </div>

                    {/* Address edit form */}
                    {/* Using AnimatePresence to handle potential future animations, though not strictly needed for this version */}
                     <AnimatePresence mode="wait">
                        <motion.form
                            key="form" // Key for AnimatePresence
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.4 }}
                            className="space-y-4" // Changed gap-6 to space-y-4 for consistency with AddAddress
                            onSubmit={handleSubmit(onSubmit)}
                        >
                            <div className="space-y-4"> {/* Group inputs in a div with spacing */}
                                {/* Address Line Input */}
                                <div className="relative"> {/* Use relative for absolute positioning of icon */}
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                        <FiHome size={18} /> {/* Home icon */}
                                    </div>
                                    <input
                                        type="text"
                                        id="addressline"
                                        placeholder="Address Line" // Added placeholder
                                        className={`w-full pl-10 pr-4 py-3 bg-white text-gray-800 border ${errors.address_line ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ease-in-out`}
                                        {...register("address_line", { required: "Address line is required" })}
                                        aria-invalid={errors.address_line ? "true" : "false"}
                                    />
                                    {errors.address_line && (
                                         <motion.p
                                            initial={{ opacity: 0, y: -5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="text-xs text-red-500 mt-1 px-2"
                                        >
                                            {errors.address_line.message}
                                        </motion.p>
                                    )}
                                </div>

                                {/* City Input */}
                                <div className="relative"> {/* Use relative for absolute positioning of icon */}
                                     <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                        <FiMapPin size={18} /> {/* Map Pin icon */}
                                    </div>
                                    <input
                                        type="text"
                                        id="city"
                                        placeholder="City" // Added placeholder
                                        className={`w-full pl-10 pr-4 py-3 bg-white text-gray-800 border ${errors.city ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ease-in-out`}
                                        {...register("city", { required: "City is required" })}
                                        aria-invalid={errors.city ? "true" : "false"}
                                    />
                                     {errors.city && (
                                        <motion.p
                                            initial={{ opacity: 0, y: -5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="text-xs text-red-500 mt-1 px-2"
                                        >
                                            {errors.city.message}
                                        </motion.p>
                                    )}
                                </div>

                                {/* State Input */}
                                <div className="relative"> {/* Use relative for absolute positioning of icon */}
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                        <FiNavigation size={18} /> {/* Navigation icon */}
                                    </div>
                                    <input
                                        type="text"
                                        id="state"
                                        placeholder="State" // Added placeholder
                                        className={`w-full pl-10 pr-4 py-3 bg-white text-gray-800 border ${errors.state ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ease-in-out`}
                                        {...register("state", { required: "State is required" })}
                                        aria-invalid={errors.state ? "true" : "false"}
                                    />
                                     {errors.state && (
                                        <motion.p
                                            initial={{ opacity: 0, y: -5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="text-xs text-red-500 mt-1 px-2"
                                        >
                                            {errors.state.message}
                                        </motion.p>
                                    )}
                                </div>

                                {/* Pincode Input */}
                                <div className="relative"> {/* Use relative for absolute positioning of icon */}
                                     {/* No specific icon provided in AddAddress for pincode, keeping without icon */}
                                    <input
                                        type="text"
                                        id="pincode"
                                        placeholder="Postal Code" // Added placeholder
                                        className={`w-full px-4 py-3 bg-white text-gray-800 border ${errors.pincode ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ease-in-out`}
                                        {...register("pincode", {
                                            required: "Postal code is required",
                                            pattern: {
                                                value: /^[0-9]*$/,
                                                message: "Invalid postal code"
                                            }
                                        })}
                                        aria-invalid={errors.pincode ? "true" : "false"}
                                    />
                                     {errors.pincode && (
                                        <motion.p
                                            initial={{ opacity: 0, y: -5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="text-xs text-red-500 mt-1 px-2"
                                        >
                                            {errors.pincode.message}
                                        </motion.p>
                                    )}
                                </div>

                                {/* Country Input */}
                                <div className="relative"> {/* Use relative for absolute positioning of icon */}
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                        <FiGlobe size={18} /> {/* Globe icon */}
                                    </div>
                                    <input
                                        type="text"
                                        id="country"
                                        placeholder="Country" // Added placeholder
                                        className={`w-full pl-10 pr-4 py-3 bg-white text-gray-800 border ${errors.country ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ease-in-out`}
                                        {...register("country", { required: "Country is required" })}
                                         aria-invalid={errors.country ? "true" : "false"}
                                    />
                                     {errors.country && (
                                        <motion.p
                                            initial={{ opacity: 0, y: -5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="text-xs text-red-500 mt-1 px-2"
                                        >
                                            {errors.country.message}
                                        </motion.p>
                                    )}
                                </div>

                                {/* Mobile No. Input */}
                                <div className="relative"> {/* Use relative for absolute positioning of icon */}
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                        <FiPhone size={18} /> {/* Phone icon */}
                                    </div>
                                    <input
                                        type="tel" // Changed type to tel
                                        id="mobile"
                                        placeholder="Mobile Number" // Added placeholder
                                        className={`w-full pl-10 pr-4 py-3 bg-white text-gray-800 border ${errors.mobile ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ease-in-out`}
                                        {...register("mobile", {
                                            required: "Mobile number is required",
                                            pattern: {
                                                value: /^[0-9]{10,15}$/, // Added basic mobile number pattern
                                                message: "Invalid mobile number"
                                            }
                                        })}
                                         aria-invalid={errors.mobile ? "true" : "false"}
                                    />
                                     {errors.mobile && (
                                        <motion.p
                                            initial={{ opacity: 0, y: -5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="text-xs text-red-500 mt-1 px-2"
                                        >
                                            {errors.mobile.message}
                                        </motion.p>
                                    )}
                                </div>
                            </div>

                            {/* Save Changes Button */}
                            <div className="pt-2"> {/* Added padding top */}
                                <motion.button
                                    type="submit"
                                    whileTap={{ scale: 0.98 }} // Added tap animation
                                    whileHover={{ scale: 1.02 }} // Added hover animation
                                    disabled={isLoading} // Disable button when loading
                                    className={`w-full py-3 px-6 rounded-xl font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg hover:shadow-blue-500/20 transition-all ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                >
                                    {isLoading ? (
                                        <span className="flex items-center justify-center">
                                            {/* Loading spinner SVG */}
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Saving... {/* Loading text */}
                                        </span>
                                    ) : 'Save Changes'} {/* Default button text */}
                                </motion.button>
                            </div>
                        </motion.form>
                    </AnimatePresence>
                </div>
            </motion.div>
        </motion.section>
    );
};

export default RedesignedEditAddressDetails;
