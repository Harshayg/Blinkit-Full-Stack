import React, { useState } from 'react'
import { useForm } from "react-hook-form"
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import toast from 'react-hot-toast'
import AxiosToastError from '../utils/AxiosToastError'
import { IoClose } from "react-icons/io5";
import { useGlobalContext } from '../provider/GlobalProvider'
import { motion, AnimatePresence } from 'framer-motion'
import { AiOutlineCheckCircle } from "react-icons/ai";
import { FiMapPin, FiHome, FiNavigation, FiGlobe, FiPhone } from "react-icons/fi";

const AddAddress = ({ close }) => {
    const { register, handleSubmit, reset, formState: { errors } } = useForm()
    const { fetchAddress } = useGlobalContext()

    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const onSubmit = async (data) => {
        setIsLoading(true);
        try {
            const response = await Axios({
                ...SummaryApi.createAddress,
                data: {
                    address_line: data.addressline,
                    city: data.city,
                    state: data.state,
                    country: data.country,
                    pincode: data.pincode,
                    mobile: data.mobile
                }
            })

            const { data: responseData } = response

            if (responseData.success) {
                setIsSubmitted(true)
                toast.success(responseData.message)
                setTimeout(() => {
                    if (close) {
                        close()
                        reset()
                        fetchAddress()
                    }
                }, 2000)
            }
        } catch (error) {
            AxiosToastError(error)
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex justify-center items-center p-4"
        >
            <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-gray-100"
            >
                <div className="p-6 relative">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-black">Add New Address</h2>
                            <p className="text-sm text-gray-600">Fill in your delivery details</p>
                        </div>
                        <button 
                            onClick={close} 
                            className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500"
                        >
                            <IoClose size={20} />
                        </button>
                    </div>

                    <AnimatePresence mode="wait">
                        {isSubmitted ? (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.4 }}
                                className="flex flex-col items-center justify-center py-10 space-y-4"
                            >
                                <div className="relative">
                                    <motion.div
                                        initial={{ scale: 0.8 }}
                                        animate={{ scale: 1 }}
                                        transition={{ 
                                            type: "spring",
                                            stiffness: 500,
                                            damping: 15
                                        }}
                                    >
                                        <AiOutlineCheckCircle className="text-green-500 text-5xl" />
                                    </motion.div>
                                    <motion.div 
                                        className="absolute inset-0 rounded-full bg-green-100/50"
                                        initial={{ scale: 1.5, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 0.6 }}
                                        transition={{ duration: 0.8 }}
                                    />
                                </div>
                                <h3 className="text-xl font-semibold text-black">Address Saved!</h3>
                                <p className="text-gray-600 text-center">Your address has been successfully added to your account.</p>
                            </motion.div>
                        ) : (
                            <motion.form
                                key="form"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.4 }}
                                className="space-y-4"
                                onSubmit={handleSubmit(onSubmit)}
                            >
                                <div className="space-y-4">
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                            <FiHome size={18} />
                                        </div>
                                        <input
                                            type="text"
                                            id="addressline"
                                            placeholder="Address Line"
                                            className="w-full pl-10 pr-4 py-3 bg-white text-black border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                                            {...register("addressline", { required: "Address is required" })}
                                        />
                                        {errors.addressline && (
                                            <motion.p 
                                                initial={{ opacity: 0, y: -5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="text-xs text-red-500 mt-1 px-2"
                                            >
                                                {errors.addressline.message}
                                            </motion.p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="relative">
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                                <FiMapPin size={18} />
                                            </div>
                                            <input
                                                type="text"
                                                id="city"
                                                placeholder="City"
                                                className="w-full pl-10 pr-4 py-3 bg-white text-black border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                                                {...register("city", { required: "City is required" })}
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

                                        <div className="relative">
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                                <FiNavigation size={18} />
                                            </div>
                                            <input
                                                type="text"
                                                id="state"
                                                placeholder="State"
                                                className="w-full pl-10 pr-4 py-3 bg-white text-black border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                                                {...register("state", { required: "State is required" })}
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
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="relative">
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                                <FiGlobe size={18} />
                                            </div>
                                            <input
                                                type="text"
                                                id="country"
                                                placeholder="Country"
                                                className="w-full pl-10 pr-4 py-3 bg-white text-black border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                                                {...register("country", { required: "Country is required" })}
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

                                        <div className="relative">
                                            <input
                                                type="text"
                                                id="pincode"
                                                placeholder="Postal Code"
                                                className="w-full px-4 py-3 bg-white text-black border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                                                {...register("pincode", { 
                                                    required: "Postal code is required",
                                                    pattern: {
                                                        value: /^[0-9]*$/,
                                                        message: "Invalid postal code"
                                                    }
                                                })}
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
                                    </div>

                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                            <FiPhone size={18} />
                                        </div>
                                        <input
                                            type="tel"
                                            id="mobile"
                                            placeholder="Mobile Number"
                                            className="w-full pl-10 pr-4 py-3 bg-white text-black border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                                            {...register("mobile", { 
                                                required: "Mobile number is required",
                                                pattern: {
                                                    value: /^[0-9]{10,15}$/,
                                                    message: "Invalid mobile number"
                                                }
                                            })}
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

                                <div className="pt-2">
                                    <motion.button
                                        type="submit"
                                        whileTap={{ scale: 0.98 }}
                                        whileHover={{ scale: 1.02 }}
                                        disabled={isLoading}
                                        className={`w-full py-3 px-6 rounded-xl font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg hover:shadow-blue-500/20 transition-all ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                    >
                                        {isLoading ? (
                                            <span className="flex items-center justify-center">
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Saving...
                                            </span>
                                        ) : 'Save Address'}
                                    </motion.button>
                                </div>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </motion.section>
    )
}

export default AddAddress
