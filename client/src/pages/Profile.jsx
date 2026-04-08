import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { FaRegUserCircle } from "react-icons/fa";
import { motion, AnimatePresence } from 'framer-motion';
import UserProfileAvatarEdit from '../components/UserProfileAvatarEdit';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import AxiosToastError from '../utils/AxiosToastError';
import toast from 'react-hot-toast';
import { setUserDetails } from '../store/userSlice';
import fetchUserDetails from '../utils/fetchUserDetails';

const Profile = () => {
    const user = useSelector(state => state.user)
    const [openProfileAvatarEdit, setProfileAvatarEdit] = useState(false)
    const [userData, setUserData] = useState({
        name: user.name,
        email: user.email,
        mobile: user.mobile,
    })
    const [loading, setLoading] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)
    const dispatch = useDispatch()

    useEffect(() => {
        setUserData({
            name: user.name,
            email: user.email,
            mobile: user.mobile,
        })
    }, [user])

    const handleOnChange = (e) => {
        const { name, value } = e.target
        setUserData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            setLoading(true)
            const response = await Axios({
                ...SummaryApi.updateUserDetails,
                data: userData
            })
            const { data: responseData } = response
            if (responseData.success) {
                toast.success(responseData.message)
                const userData = await fetchUserDetails()
                dispatch(setUserDetails(userData.data))
                setShowSuccess(true)
                setTimeout(() => setShowSuccess(false), 2000)
            }
        } catch (error) {
            AxiosToastError(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <motion.div
            className="p-6 max-w-2xl mx-auto bg-white rounded-3xl shadow-xl border border-gray-100 relative"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
        >
            <div className="flex items-center gap-6">
                <motion.div
                    className="w-28 h-28 rounded-full overflow-hidden bg-gray-100 shadow-inner flex items-center justify-center"
                    whileHover={{ scale: 1.05 }}
                >
                    {user.avatar ? (
                        <img alt={user.name} src={user.avatar} className="w-full h-full object-cover" />
                    ) : (
                        <FaRegUserCircle size={90} className="text-gray-400" />
                    )}
                </motion.div>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setProfileAvatarEdit(true)}
                    className="text-sm border border-indigo-300 px-5 py-2 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-600 shadow-sm"
                >
                    Edit Avatar
                </motion.button>
            </div>

            {openProfileAvatarEdit && (
                <UserProfileAvatarEdit close={() => setProfileAvatarEdit(false)} />
            )}

            <motion.form
                onSubmit={handleSubmit}
                className="mt-8 grid gap-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
            >
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                        type="text"
                        name="name"
                        value={userData.name}
                        onChange={handleOnChange}
                        className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition duration-300"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                        type="email"
                        name="email"
                        value={userData.email}
                        onChange={handleOnChange}
                        className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition duration-300"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mobile</label>
                    <input
                        type="text"
                        name="mobile"
                        value={userData.mobile}
                        onChange={handleOnChange}
                        className="w-full border border-gray-300 rounded-xl px-4 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition duration-300"
                        required
                    />
                </div>
                <motion.button
                    type="submit"
                    className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 rounded-xl shadow-md transition duration-300"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    {loading ? "Updating..." : "Save Changes"}
                </motion.button>
            </motion.form>

            <AnimatePresence>
                {showSuccess && (
                    <motion.div
                        className="fixed inset-0 flex items-center justify-center z-50"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        transition={{ duration: 0.4 }}
                    >
                        <div className="bg-white px-6 py-4 rounded-2xl shadow-2xl text-green-600 font-semibold text-lg border border-green-300">
                            ✅ Changes saved successfully!
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}

export default Profile
