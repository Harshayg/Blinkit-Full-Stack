import React, { useState, useEffect } from 'react';
import { FaRegEyeSlash, FaRegEye } from 'react-icons/fa6';
import toast from 'react-hot-toast';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import AxiosToastError from '../utils/AxiosToastError';
import { Link, useNavigate } from 'react-router-dom';
import fetchUserDetails from '../utils/fetchUserDetails';
import { useDispatch } from 'react-redux';
import { setUserDetails } from '../store/userSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheck } from 'react-icons/fa';
import logo from '../assets/logo.png';
import press from '../assets/press.webp';

const Login = () => {
    const [data, setData] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);

    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        window.scrollTo(0, 0);
        const timer = setTimeout(() => {
            setPageLoading(false);
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData((prev) => ({ ...prev, [name]: value.trimStart() }));
    };

    const isFormValid = Object.values(data).every(el => el);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await Axios({ ...SummaryApi.login, data });
            if (response.data.error) {
                toast.error(response.data.message);
            } else if (response.data.success) {
                toast.success(response.data.message);
                localStorage.setItem('accesstoken', response.data.data.accesstoken);
                localStorage.setItem('refreshToken', response.data.data.refreshToken);
                const userDetails = await fetchUserDetails();
                dispatch(setUserDetails(userDetails.data));
                setShowSuccess(true);
                setTimeout(() => navigate('/'), 3000);
            }
        } catch (error) {
            AxiosToastError(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section
            className="relative min-h-screen flex items-center justify-center px-4 sm:px-6"
            style={{
                backgroundImage: `url(${press})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
            }}
        >
            <AnimatePresence>
                {pageLoading && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-sm p-6"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="bg-white/50 backdrop-blur-xl border border-white/40 shadow-2xl rounded-3xl p-6 w-full max-w-md animate-pulse">
                            <div className="mx-auto w-24 h-24 bg-gradient-to-r from-blue-100 to-blue-200 rounded-full mb-4"></div>
                            <div className="h-5 w-3/4 bg-gradient-to-r from-blue-100 to-blue-200 rounded-md mx-auto mb-1"></div>
                            <div className="h-4 w-1/2 bg-gradient-to-r from-blue-100 to-blue-200 rounded-md mx-auto mb-6"></div>
                            <div className="space-y-4">
                                <div>
                                    <div className="h-3 w-1/4 bg-gradient-to-r from-blue-100 to-blue-200 rounded-md mb-1"></div>
                                    <div className="h-10 w-full bg-gradient-to-r from-blue-100 to-blue-200 rounded-xl"></div>
                                </div>
                                <div>
                                    <div className="h-3 w-1/4 bg-gradient-to-r from-blue-100 to-blue-200 rounded-md mb-1"></div>
                                    <div className="h-10 w-full bg-gradient-to-r from-blue-100 to-blue-200 rounded-xl"></div>
                                </div>
                            </div>
                            <div className="flex justify-end text-sm text-gray-600 mt-4">
                                <div className="h-3 w-1/3 bg-gradient-to-r from-blue-100 to-blue-200 rounded-md"></div>
                            </div>
                            <div className="h-10 w-full bg-gradient-to-r from-green-300 to-green-400 rounded-xl mt-4"></div>
                            <div className="h-3 w-2/3 bg-gradient-to-r from-blue-100 to-blue-200 rounded-md mx-auto mt-4"></div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {!pageLoading && (
                <div className="relative z-10 w-full max-w-md">
                    <motion.div
                        initial={{ y: -100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 100, damping: 15 }}
                        className="bg-white/50 backdrop-blur-xl border border-white/40 shadow-2xl rounded-3xl p-6 sm:p-10"
                    >
                        <div className="text-center mb-4 sm:mb-6">
                            <img src={logo} alt="Logo" className="mx-auto w-20 sm:w-28 mb-2" />
                            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Welcome Back</h2>
                            <p className="text-sm sm:text-base text-gray-600">Log in to continue your journey</p>
                        </div>
                        <form className="space-y-4 sm:space-y-5" onSubmit={handleSubmit}>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    className="mt-1 p-3 w-full rounded-xl bg-white/80 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                                    placeholder="Enter your email"
                                    value={data.email}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="password"
                                        name="password"
                                        className="mt-1 p-3 w-full rounded-xl bg-white/80 text-gray-800 placeholder-gray-500 pr-10 focus:outline-none focus:ring-2 focus:ring-green-500"
                                        placeholder="Enter your password"
                                        value={data.password}
                                        onChange={handleChange}
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-3 flex items-center text-gray-600"
                                        onClick={() => setShowPassword(prev => !prev)}
                                    >
                                        {showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
                                    </button>
                                </div>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600">
                                <Link to="/forgot-password" className="hover:underline">Forgot password?</Link>
                            </div>
                            <button
                                disabled={!isFormValid || loading}
                                className={`w-full p-3 rounded-xl font-semibold transition duration-300 ${isFormValid && !loading
                                    ? 'bg-green-500 text-white hover:bg-green-600'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    }`}
                            >
                                {loading ? 'Logging in...' : 'Login'}
                            </button>
                        </form>
                        <p className="text-center mt-4 text-sm text-gray-700">
                            Don't have an account? <Link to="/register" className="text-green-600 hover:underline font-medium">Register</Link>
                        </p>
                    </motion.div>
                </div>
            )}

            <AnimatePresence>
                {showSuccess && (
                    <motion.div
                        className="absolute inset-0 flex items-center justify-center bg-white/80 z-50"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                    >
                        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-2xl flex flex-col items-center">
                            <div className="bg-green-500 rounded-full p-3 mb-4">
                                <FaCheck className="text-white text-2xl sm:text-3xl" />
                            </div>
                            <p className="text-gray-800 text-base sm:text-lg font-semibold">You've logged in successfully</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
};

export default Login;
