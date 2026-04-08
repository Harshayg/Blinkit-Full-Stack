import React, { useEffect, useState } from 'react'
import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa6'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import SummaryApi from '../common/SummaryApi'
import toast from 'react-hot-toast'
import AxiosToastError from '../utils/AxiosToastError'
import Axios from '../utils/Axios'
import { motion, AnimatePresence } from 'framer-motion'
import logo from '../assets/logo.png'
import press from '../assets/press.webp';

const ResetPassword = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [data, setData] = useState({
    email: "",
    newPassword: "",
    confirmPassword: ""
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showSuccessPopup, setShowSuccessPopup] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState("")

  const isStrongPassword = (value) => {
    const hasUpperCase = /[A-Z]/.test(value)
    const hasNumber = /[0-9]/.test(value)
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(value)
    const lengthValid = value.length >= 8
    return hasUpperCase && hasNumber && hasSymbol && lengthValid
  }

  const isFormValid =
    data.email &&
    isStrongPassword(data.newPassword) &&
    data.newPassword === data.confirmPassword

  useEffect(() => {
    if (!(location?.state?.data?.success)) {
      navigate("/")
    }

    if (location?.state?.email) {
      setData((preve) => {
        return {
          ...preve,
          email: location?.state?.email
        }
      })
    }
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target

    setData((preve) => {
      return {
        ...preve,
        [name]: value
      }
    })

    if (name === 'newPassword') {
      const hasUpperCase = /[A-Z]/.test(value)
      const hasNumber = /[0-9]/.test(value)
      const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(value)
      const lengthValid = value.length >= 8

      if (!value) {
        setPasswordStrength("")
      } else if (!lengthValid) {
        setPasswordStrength("❌ Too short (min 8 characters)")
      } else if (!hasUpperCase || !hasNumber || !hasSymbol) {
        setPasswordStrength("⚠️ Weak: Add uppercase, number & symbol")
      } else {
        setPasswordStrength("✅ Strong password")
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const response = await Axios({
        ...SummaryApi.resetPassword,
        data: data
      })

      if (response.data.error) {
        toast.error(response.data.message)
      }

      if (response.data.success) {
        setShowSuccessPopup(true)
        setTimeout(() => {
          navigate("/login")
        }, 2500)
        setData({
          email: "",
          newPassword: "",
          confirmPassword: ""
        })
      }

    } catch (error) {
      AxiosToastError(error)
    }
  }

  return (
    <section className='w-full min-h-screen flex items-center justify-center bg-cover bg-center px-4'
      style={{
        backgroundImage: `url(${press})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}>
      <div className="bg-white/50 backdrop-blur-xl border border-white/40 shadow-2xl rounded-3xl p-10 w-full max-w-md">
        <div className='flex justify-center mb-6'>
          <img src={logo} alt='Logo' className='h-14' />
        </div>
        <h2 className='text-2xl font-bold text-center text-gray-800 mb-6'>Reset Your Password</h2>
        <form className='grid gap-6' onSubmit={handleSubmit}>
          <div className='grid gap-2'>
            <label htmlFor='newPassword' className='text-sm font-medium'>New Password</label>
            <div className='bg-gray-100 p-3 rounded-xl flex items-center border border-gray-300 focus-within:border-green-500'>
              <input
                type={showPassword ? "text" : "password"}
                id='password'
                className='w-full outline-none bg-transparent'
                name='newPassword'
                value={data.newPassword}
                onChange={handleChange}
                placeholder='Enter your new password'
              />
              <div onClick={() => setShowPassword(prev => !prev)} className='cursor-pointer'>
                {showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
              </div>
            </div>
            {passwordStrength && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className={`text-xs mt-2 px-3 py-2 rounded-xl backdrop-blur-md bg-white/60 border ${passwordStrength.includes('Strong') ? 'border-green-400 text-green-700' : passwordStrength.includes('Weak') ? 'border-yellow-400 text-yellow-700' : 'border-red-400 text-red-600'}`}
              >
                {passwordStrength}
              </motion.div>
            )}
          </div>

          <div className='grid gap-2'>
            <label htmlFor='confirmPassword' className='text-sm font-medium'>Confirm Password</label>
            <div className='bg-gray-100 p-3 rounded-xl flex items-center border border-gray-300 focus-within:border-blue-500'>
              <input
                type={showConfirmPassword ? "text" : "password"}
                id='confirmPassword'
                className='w-full outline-none bg-transparent'
                name='confirmPassword'
                value={data.confirmPassword}
                onChange={handleChange}
                placeholder='Confirm your password'
              />
              <div onClick={() => setShowConfirmPassword(prev => !prev)} className='cursor-pointer'>
                {showConfirmPassword ? <FaRegEye /> : <FaRegEyeSlash />}
              </div>
            </div>
          </div>

          <button disabled={!isFormValid} className={`w-full py-3 rounded-xl font-semibold transition-colors duration-300 text-white ${isFormValid ? "bg-green-600 hover:bg-green-700" : "bg-gray-400 cursor-not-allowed"}`}>Change Password</button>
        </form>

        <p className='text-center mt-6 text-sm text-gray-600'>Already have an account? <Link to='/login' className='text-green-600 hover:underline'>Login</Link></p>
      </div>

      <AnimatePresence>
        {showSuccessPopup && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className='fixed inset-0 flex items-center justify-center bg-black/40 z-50'
          >
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className='bg-white rounded-3xl shadow-2xl p-10 text-center max-w-sm mx-auto'
            >
              <h3 className='text-xl font-bold text-green-600 mb-2'>Password Changed Successfully</h3>
              <p className='text-gray-600'>You can now continue to login.</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

export default ResetPassword
