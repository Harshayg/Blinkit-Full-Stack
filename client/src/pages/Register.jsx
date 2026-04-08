import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import AxiosToastError from '../utils/AxiosToastError';
import press from '../assets/press.webp';
import logo from '../assets/logo.png';
import { Eye, EyeOff, X, ArrowLeft } from 'lucide-react';

const Register = () => {
    const [step, setStep] = useState(1);
    const [data, setData] = useState({ name: '', email: '', mobileNumber: '', password: '', confirmPassword: '', avatar: '' });
    const [avatarPreview, setAvatarPreview] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [registered, setRegistered] = useState(false);
    const [timeLeft, setTimeLeft] = useState(120);
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 1500);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (!registered) return;
        const interval = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [registered]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60).toString().padStart(1, '0');
        const s = (seconds % 60).toString().padStart(1, '0');
        return `${m}:${s}`;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData((prev) => ({ ...prev, [name]: value }));
    };

    const handleAvatar = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setData((prev) => ({ ...prev, avatar: reader.result }));
                setAvatarPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeAvatar = () => {
        setData((prev) => ({ ...prev, avatar: '' }));
        setAvatarPreview('');
    };

    const handleSubmit = async () => {
        if (data.password !== data.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }
        try {
            setSubmitting(true);
            const res = await Axios({ ...SummaryApi.register, data });
            if (res.data.success) {
                toast.success(res.data.message);
                setRegistered(true);
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            AxiosToastError(error);
        } finally {
            setSubmitting(false);
        }
    };

    const isStep1Valid = data.name && data.email && data.mobileNumber;
    const isStep2Valid = !!data.avatar;
    const isStep3Valid = data.password && data.confirmPassword;

    return (
        <div className="min-h-screen flex items-center justify-center relative bg-white">
            <img src={press} alt="bg" className="absolute w-full h-full object-cover z-0" />

            {loading ? (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-sm p-6"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="bg-white/50 backdrop-blur-xl border border-white/40 shadow-2xl rounded-3xl p-10 w-full max-w-md animate-pulse">
                        <div className="mx-auto w-28 h-28 bg-gradient-to-r from-blue-100 to-blue-200 rounded-full mb-6"></div>
                        <div className="h-6 w-3/4 bg-gradient-to-r from-blue-100 to-blue-200 rounded-md mx-auto mb-2"></div>
                        <div className="h-4 w-1/2 bg-gradient-to-r from-blue-100 to-blue-200 rounded-md mx-auto mb-8"></div>
                        <div className="space-y-5">
                            <div>
                                <div className="h-4 w-1/4 bg-gradient-to-r from-blue-100 to-blue-200 rounded-md mb-1"></div>
                                <div className="h-12 w-full bg-gradient-to-r from-blue-100 to-blue-200 rounded-xl"></div>
                            </div>
                            <div>
                                <div className="h-4 w-1/4 bg-gradient-to-r from-blue-100 to-blue-200 rounded-md mb-1"></div>
                                <div className="h-12 w-full bg-gradient-to-r from-blue-100 to-blue-200 rounded-xl"></div>
                            </div>
                            <div>
                                <div className="h-4 w-1/4 bg-gradient-to-r from-blue-100 to-blue-200 rounded-md mb-1"></div>
                                <div className="h-12 w-full bg-gradient-to-r from-blue-100 to-blue-200 rounded-xl"></div>
                            </div>
                        </div>
                        <div className="h-12 w-full bg-gradient-to-r from-green-300 to-green-400 rounded-xl mt-6"></div>
                        <div className="h-4 w-2/3 bg-gradient-to-r from-blue-100 to-blue-200 rounded-md mx-auto mt-4"></div>
                    </div>
                </motion.div>
            ) : registered ? (
                <motion.div
    key="registered"
    className="bg-white/50 backdrop-blur-xl border border-white/40 shadow-2xl rounded-3xl p-10 w-full max-w-md text-center"
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    transition={{ duration: 0.6 }}
>
    <h2 className="text-2xl font-bold mb-4 text-green-700">Verification Email Sent!</h2>
    <p className="text-gray-700 mb-6">Please check your inbox to verify your email. You can login from there.</p>
    <div className="relative w-full h-20 flex flex-col items-center justify-center">
        <div className="text-4xl font-mono text-blue-800 mb-4">{formatTime(timeLeft)}</div>
        <div className="relative w-64 h-2 bg-gray-300 rounded-full overflow-hidden">
            <motion.div
                className="absolute top-0 left-0 h-full bg-green-500 rounded-full"
                style={{ width: `${((120 - timeLeft) / 120) * 100}%` }}
                initial={{ width: 0 }}
                animate={{ width: `${((120 - timeLeft) / 120) * 100}%` }}
                transition={{ ease: "linear", duration: 0.5 }}
            />
            <motion.div
                className="absolute -top-4"
                initial={false}
                animate={{ left: `${((120 - timeLeft) / 120) * 100}%` }}
                transition={{ ease: "linear", duration: 0.5 }}
            >
            </motion.div>
        </div>
    </div>
    <button
        onClick={() => window.location.href = "mailto:"}
        className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition duration-300"
    >
        Open Email App
    </button>
</motion.div>
            ) : (
                <div className="bg-white/50 backdrop-blur-xl border border-white/40 shadow-2xl rounded-3xl p-10 w-full max-w-md relative">
                    <div className="text-center mb-6">
                        <img src={logo || 'placeholder.png'} alt="Logo" className="mx-auto w-28 mb-2" />
                    </div>
                    {(step === 2 || step === 3) && (
                        <button onClick={() => setStep(step - 1)} className="absolute top-3 left-4 p-2">
                            <ArrowLeft className="text-black" size={28} />
                        </button>
                    )}
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.6 }}
                            >
                                <h2 className="text-3xl font-bold text-gray-800 text-center">Welcome Back</h2>
                                <p className="text-gray-600 text-center mb-6">Register to continue your journey</p>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Name</label>
                                <input name="name" placeholder="Full Name" value={data.name} onChange={handleChange} className="w-full mb-4 p-3 rounded-xl bg-white " />
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                                <input name="email" placeholder="Email" type="email" value={data.email} onChange={handleChange} className="w-full mb-4 p-3 rounded-xl bg-white " />
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Phone Number</label>
                                <input name="mobileNumber" placeholder="Phone Number" value={data.mobileNumber} onChange={handleChange} className="w-full mb-6 p-3 rounded-xl bg-white " />
                                <button onClick={() => setStep(2)} disabled={!isStep1Valid} className={`w-full py-3 rounded-xl ${isStep1Valid ? 'bg-green-600 hover:bg-green-700' : 'bg-green-300 cursor-not-allowed'}`}>Next</button>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -50 }}
                                transition={{ duration: 0.6 }}
                            >
                                <h2 className="text-2xl font-bold text-center mb-6">Choose Your Avatar</h2>
                                <div className="flex flex-col items-center gap-4 relative">
                                    <label htmlFor="avatar-upload" className="w-32 h-32 rounded-2xl bg-white/40 backdrop-blur-md border-2 border-dashed border-black flex items-center justify-center cursor-pointer hover:scale-105 transition-transform overflow-hidden">
                                        {avatarPreview ? (
                                            <motion.img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" initial={{ scale: 0 }} animate={{ scale: 1 }} />
                                        ) : (
                                            <span className="text-sm font-semibold text-black">Upload Photo</span>
                                        )}
                                    </label>
                                    {avatarPreview && (
                                        <button onClick={removeAvatar} className="absolute top-0 right-10 bg-white p-1 rounded-full shadow">
                                            <X size={18} />
                                        </button>
                                    )}
                                    <input id="avatar-upload" type="file" accept="image/*" onChange={handleAvatar} className="hidden" />
                                </div>
                                <div className="flex flex-col gap-3 mt-6">
                                    <button onClick={() => setStep(3)} disabled={!isStep2Valid} className={`w-full py-3 rounded-xl ${isStep2Valid ? 'bg-green-600 hover:bg-green-700' : 'bg-green-300 cursor-not-allowed'}`}>Next</button>
                                    {!avatarPreview && (
                                        <button onClick={() => setStep(3)} className="w-full py-3 rounded-xl bg-gray-300 hover:bg-gray-400">Skip</button>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.6 }}
                            >
                                <h2 className="text-2xl font-bold mb-6 text-center">Set Your Password</h2>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                                <div className="relative mb-4">
                                    <input
                                        name="password"
                                        placeholder="Password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={data.password}
                                        onChange={handleChange}
                                        className="w-full p-3 rounded-xl bg-white bg-opacity-20 pr-10"
                                    />
                                    <button type="button" onClick={() => setShowPassword((prev) => !prev)} className="absolute top-1/2 right-3 transform -translate-y-1/2">
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Confirm Password</label>
                                <div className="relative mb-6">
                                    <input
                                        name="confirmPassword"
                                        placeholder="Confirm Password"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={data.confirmPassword}
                                        onChange={handleChange}
                                        className="w-full p-3 rounded-xl bg-white bg-opacity-20 pr-10"
                                    />
                                    <button type="button" onClick={() => setShowConfirmPassword((prev) => !prev)} className="absolute top-1/2 right-3 transform -translate-y-1/2">
                                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                <button onClick={handleSubmit} disabled={!isStep3Valid || submitting} className={`w-full py-3 rounded-xl ${isStep3Valid && !submitting ? 'bg-green-600 hover:bg-green-700' : 'bg-green-300 cursor-not-allowed'}`}>
                                    {submitting ? "Submitting..." : "Submit"}
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <p className="text-center mt-4 text-sm text-gray-700">
                        If the account already exists? <Link to="/login" className="text-green-600 hover:underline font-medium">login</Link>
                    </p>
                </div>
            )}
        </div>
    );
};

export default Register;