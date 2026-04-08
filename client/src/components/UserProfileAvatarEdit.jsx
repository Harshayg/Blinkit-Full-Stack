import React, { useState } from 'react'
import { FaRegUserCircle } from 'react-icons/fa'
import { useDispatch, useSelector } from 'react-redux'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import AxiosToastError from '../utils/AxiosToastError'
import { updatedAvatar } from '../store/userSlice'
import { IoClose } from 'react-icons/io5'
import { motion, AnimatePresence } from 'framer-motion'

const UserProfileAvatarEdit = ({ close }) => {
  const user = useSelector(state => state.user)
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
  }

  const handleUploadAvatarImage = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append('avatar', file)

    try {
      setLoading(true)
      const response = await Axios({
        ...SummaryApi.uploadAvatar,
        data: formData
      })
      const { data: responseData } = response
      dispatch(updatedAvatar(responseData.data.avatar))
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 2000)
    } catch (error) {
      AxiosToastError(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.7, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-xl relative flex flex-col items-center"
      >
        <button onClick={close} className="absolute top-3 right-3 text-gray-600 hover:text-red-500">
          <IoClose size={24} />
        </button>

        <div className="w-24 h-24 bg-gray-200 rounded-full overflow-hidden shadow-inner flex items-center justify-center">
          {user.avatar ? (
            <img alt={user.name} src={user.avatar} className="w-full h-full object-cover" />
          ) : (
            <FaRegUserCircle size={65} className="text-gray-500" />
          )}
        </div>

        <form onSubmit={handleSubmit} className="mt-6 w-full text-center">
          <label htmlFor='uploadProfile'>
            <div className='inline-block bg-indigo-500 text-white px-5 py-2 rounded-full cursor-pointer hover:bg-indigo-600 transition duration-300'>
              {loading ? "Uploading..." : "Upload"}
            </div>
            <input onChange={handleUploadAvatarImage} type='file' id='uploadProfile' className='hidden' />
          </label>
        </form>
      </motion.div>

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
              ✅ Avatar updated successfully!
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

export default UserProfileAvatarEdit