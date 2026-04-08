import React, { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import AxiosToastError from '../utils/AxiosToastError';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import press from '../assets/press.webp';

const OtpVerification = () => {
    const [data, setData] = useState(['', '', '', '', '', '']);
    const [resendLoading, setResendLoading] = useState(false);
    const [timer, setTimer] = useState(0);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const navigate = useNavigate();
    const inputRef = useRef([]);
    const location = useLocation();

    useEffect(() => {
        if (!location?.state?.email) {
            navigate('/forgot-password');
        }

        if (isInitialLoad) {
            setTimer(30);
            setIsInitialLoad(false);
        }
    }, [location?.state?.email, navigate, isInitialLoad]);

    useEffect(() => {
        let interval;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer(prevTimer => prevTimer - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const isValid = data.every((el) => el);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isValid) return;

        try {
            const response = await Axios({
                ...SummaryApi.forgot_password_otp_verification,
                data: {
                    otp: data.join(''),
                    email: location?.state?.email,
                },
            });

            if (response.data.error) {
                toast.error(response.data.message);
            }

            if (response.data.success) {
                toast.success(response.data.message);
                setData(['', '', '', '', '', '']);
                navigate('/reset-password', {
                    state: {
                        data: response.data,
                        email: location?.state?.email,
                    },
                });
            }
        } catch (error) {
            AxiosToastError(error);
        }
    };

    const handleResend = async () => {
        if (timer > 0) return;

        // Reset OTP input fields when Resend Email is clicked
        setData(['', '', '', '', '', '']);
        
        setResendLoading(true);
        setTimer(30);
        try {
            const response = await Axios({
                ...SummaryApi.forgot_password,
                data: {
                    email: location?.state?.email,
                },
            });

            if (response.data.error) {
                toast.error(response.data.message);
            } else {
                toast.success(response.data.message);
            }

        } catch (error) {
            AxiosToastError(error);
        } finally {
            setResendLoading(false);
        }
    };

    const handleInputChange = (e, index) => {
        const value = e.target.value;
        const newData = [...data];
        newData[index] = value;
        setData(newData);

        // Move focus to the next input when a digit is entered
        if (value && index < 5) {
            inputRef.current[index + 1].focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace' && !data[index] && index > 0) {
            // Move focus to the previous input when backspace is pressed and current input is empty
            inputRef.current[index - 1].focus();
        }
    };

    return (
        <section className="w-full min-h-screen flex items-center justify-center bg-cover bg-center px-4 py-4 sm:px-6 lg:px-8"
            style={{
                backgroundImage: `url(${press})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
            }}
        >
            <div className="bg-white/50 backdrop-blur-xl border border-white/40 shadow-2xl rounded-3xl p-6 sm:p-8 w-full max-w-md">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 sm:mb-6 text-center">OTP Verification</h2>
                <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="otp" className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
                            Enter the 6-digit OTP sent to your email:
                        </label>
                        <div className="flex justify-between gap-2 sm:gap-3">
                            {data.map((digit, index) => (
                                <input
                                    key={index}
                                    type="text"
                                    maxLength={1}
                                    value={digit}
                                    ref={(ref) => (inputRef.current[index] = ref)}
                                    onChange={(e) => handleInputChange(e, index)}
                                    onKeyDown={(e) => handleKeyDown(e, index)}
                                    className="w-12 sm:w-14 h-12 sm:h-14 border border-gray-300 rounded-xl text-center text-xl sm:text-2xl font-semibold focus:outline-none focus:ring-2 focus:ring-green-600"
                                />
                            ))}
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={!isValid}
                        className={`w-full py-3 rounded-xl font-semibold text-white transition-all duration-200 ${
                            isValid ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'
                        }`}
                    >
                        Verify OTP
                    </button>
                </form>
                <button
                    onClick={handleResend}
                    disabled={resendLoading || timer > 0}
                    className="w-full mt-4 py-3 rounded-xl font-semibold text-white transition-all duration-200 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {resendLoading ? 'Sending...' : timer > 0 ? `Resend in ${timer}s` : 'Resend Email'}
                </button>
                <p className="text-sm text-center mt-4">
                    Already have an account?{' '}
                    <Link to="/login" className="text-green-700 font-medium hover:underline">
                        Login
                    </Link>
                </p>
            </div>
        </section>
    );
};

export default OtpVerification;
