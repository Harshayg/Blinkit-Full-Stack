import React, { useState, useEffect } from 'react'; // Import useEffect
import toast from 'react-hot-toast';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import AxiosToastError from '../utils/AxiosToastError';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import { motion, AnimatePresence } from 'framer-motion';
import press from '../assets/press.webp'

const ForgotPassword = () => {
    const [data, setData] = useState({ email: "" });
    // State for the animation shown *after* submitting the form (the circular loader)
    const [showAnimation, setShowAnimation] = useState(false);
    // NEW State for the initial page loading animation (skeleton)
    const [pageLoading, setPageLoading] = useState(true); // Initialize to true

    const navigate = useNavigate();

    // NEW Effect to handle the initial page loading animation
    useEffect(() => {
        // Simulate a delay for page loading (0.5 seconds)
        const timer = setTimeout(() => {
            setPageLoading(false);
        }, 500); // Adjusted duration to 0.5 seconds

        // Cleanup function to clear the timeout
        return () => clearTimeout(timer);
    }, []); // Empty dependency array means this effect runs only once on mount

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData(prev => ({ ...prev, [name]: value }));
    };

    const validValue = Object.values(data).every(el => el);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await Axios({
                ...SummaryApi.forgot_password,
                data
            });

            if (!response.data.success) {
                toast.error(response.data.message);
                return;
            }

            toast.success(response.data.message);
            setShowAnimation(true); // Show the circular animation after successful submission

            setTimeout(() => {
                navigate("/verification-otp", { state: data });
                setData({ email: "" });
                setShowAnimation(false); // Hide the circular animation before navigating
            }, 2200); // matches animation time
        } catch (error) {
            AxiosToastError(error);
        }
    };

    return (
        <section 
        className='w-full min-h-screen flex items-center justify-center bg-cover bg-center px-4'
              style={{
                              backgroundImage: `url(${press})`, // Set the background image
                              backgroundSize: 'cover', // Make the image cover the entire area
                              backgroundPosition: 'center', // Center the background image
                              backgroundRepeat: 'no-repeat', // Prevent the image from repeating
                          }}
            >

            {/* Initial Page Loading Overlay with Skeleton */}
            {/* AnimatePresence handles exit animations */}
            <AnimatePresence>
                {pageLoading && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-sm p-6" // Added padding
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }} // Match exit transition to timeout
                    >
                        {/* Skeleton Loader mimicking the Forgot Password form structure */}
                        <div className="bg-white/50 backdrop-blur-xl border border-white/40 shadow-2xl rounded-3xl p-10 max-w-md w-full animate-pulse">
                            {/* Logo Placeholder */}
                            {/* Ensure logo exists or provide a fallback */}
                            <div className="mx-auto w-12 h-12 bg-gradient-to-r from-blue-100 to-blue-200 rounded-full mb-6"></div>

                            {/* Heading Placeholder */}
                            <div className="h-6 w-2/3 bg-gradient-to-r from-blue-100 to-blue-200 rounded-md mx-auto mb-6"></div>

                            {/* Input Field Placeholder */}
                            <div className="space-y-6">
                                <div>
                                    <div className="h-4 w-1/3 bg-gradient-to-r from-blue-100 to-blue-200 rounded-md mb-1"></div>
                                    <div className="h-12 w-full bg-gradient-to-r from-blue-100 to-blue-200 rounded-xl"></div>
                                </div>
                            </div>

                            {/* Button Placeholder */}
                            <div className="h-12 w-full bg-gradient-to-r from-blue-300 to-blue-400 rounded-xl mt-6"></div>

                            {/* Login Link Placeholder */}
                            <div className="h-4 w-2/3 bg-gradient-to-r from-blue-100 to-blue-200 rounded-md mx-auto mt-6"></div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Forgot Password Form - Only visible when pageLoading is false */}
            {!pageLoading && (
                <motion.div
                    initial={{ y: -80, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                    className="backdrop-blur-md bg-white/30 border border-white/50 shadow-xl rounded-3xl p-10 max-w-md w-full z-10"
                >
                    <div className='flex justify-center mb-6'>
                        {/* Ensure logo exists or provide a fallback */}
                        <img src={logo || 'placeholder.png'} alt='Logo' className='h-12' />
                    </div>
                    <h2 className='text-2xl font-bold text-center text-gray-800 mb-6'>Forgot Password</h2>
                    <form className='space-y-6' onSubmit={handleSubmit}>
                        <div>
                            <label className='block text-gray-700 mb-1'>Email Address</label>
                            <input
                                type='email'
                                name='email'
                                value={data.email}
                                onChange={handleChange}
                                className='w-full p-4 border rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-300'
                                placeholder='Enter your email'
                                required
                            />
                        </div>
                        <button
                            type='submit'
                            disabled={!validValue}
                            className={`w-full py-3 rounded-xl text-white font-semibold text-lg transition-all duration-300 ${
                                validValue ? "bg-green-600 hover:bg-green-700" : "bg-gray-400"
                            }`}
                        >
                            Send OTP
                        </button>
                    </form>
                    <p className='text-center text-gray-700 mt-6'>
                        Remember your password?{' '}
                        <Link to='/login' className='text-green-600 hover:underline'>
                            Login
                        </Link>
                    </p>
                </motion.div>
            )}


            {/* Clean Circular Loader Animation (This is the animation after form submission) */}
            <AnimatePresence>
                {showAnimation && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-white z-50"
                    >
                        <motion.div
                            initial={{ scale: 0, opacity: 0.6 }}
                            animate={{ scale: [0.8, 1.2, 2], opacity: [0.6, 0.4, 0] }}
                            transition={{ duration: 2, ease: "easeInOut" }}
                            className="w-24 h-24 rounded-full border-4 border-green-600"
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
};

export default ForgotPassword;
