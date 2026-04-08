import React, { useState } from 'react'
import { IoClose } from "react-icons/io5"
import uploadImage from '../utils/UploadImage'
import { useSelector } from 'react-redux'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import toast from 'react-hot-toast'
import AxiosToastError from '../utils/AxiosToastError'
import { motion, AnimatePresence } from 'framer-motion'

const EditSubCategory = ({ close, data, fetchData }) => {
  const [subCategoryData, setSubCategoryData] = useState({
    _id: data._id,
    name: data.name,
    image: data.image,
    category: data.category || []
  })

  const [showSuccess, setShowSuccess] = useState(false)

  const allCategory = useSelector(state => state.product.allCategory)

  const handleChange = (e) => {
    const { name, value } = e.target
    setSubCategoryData(prev => ({ ...prev, [name]: value }))
  }

  const handleUploadSubCategoryImage = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const response = await uploadImage(file)
    const { data: imageRes } = response
    setSubCategoryData(prev => ({ ...prev, image: imageRes.data.url }))
  }

  const handleRemoveCategorySelected = (categoryId) => {
    const filtered = subCategoryData.category.filter(cat => cat._id !== categoryId)
    setSubCategoryData(prev => ({ ...prev, category: filtered }))
  }

  const handleSubmitSubCategory = async (e) => {
    e.preventDefault()
    try {
      const response = await Axios({
        ...SummaryApi.updateSubCategory,
        data: subCategoryData
      })
      const { data: responseData } = response
      if (responseData.success) {
        toast.success(responseData.message)
        setShowSuccess(true)
        setTimeout(() => {
          setShowSuccess(false)
          close?.()
          fetchData?.()
        }, 2000)
      }
    } catch (error) {
      AxiosToastError(error)
    }
  }

  return (
    <div className='fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center px-4'>
      <div className='bg-white w-full max-w-3xl rounded-2xl shadow-xl p-6 relative'>

        {/* Success Animation */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className='absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-50 rounded-2xl'
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className='text-green-600 text-4xl font-bold'
              >
                ✅ Saved!
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-lg font-semibold text-gray-800'>Edit Subcategory</h2>
          <button onClick={close} className='text-gray-500 hover:text-red-500'>
            <IoClose size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmitSubCategory} className='space-y-5'>

          <div>
            <label className='block mb-1 text-sm font-medium text-gray-700'>Name</label>
            <input
              type='text'
              name='name'
              value={subCategoryData.name}
              onChange={handleChange}
              className='w-full px-4 py-2 border rounded-lg bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400'
            />
          </div>

          <div>
            <label className='block mb-1 text-sm font-medium text-gray-700'>Image</label>
            <div className='flex flex-col sm:flex-row items-center gap-4'>
              <div className='w-32 h-32 bg-gray-100 border flex items-center justify-center rounded-lg overflow-hidden'>
                {subCategoryData.image ? (
                  <img src={subCategoryData.image} alt='SubCategory' className='object-contain w-full h-full' />
                ) : (
                  <p className='text-sm text-gray-400'>No Image</p>
                )}
              </div>
              <label htmlFor='uploadSubCategoryImage' className='cursor-pointer'>
                <div className='px-4 py-2 border border-blue-500 text-blue-600 rounded-lg hover:bg-blue-500 hover:text-white transition'>
                  Upload Image
                </div>
                <input
                  type='file'
                  id='uploadSubCategoryImage'
                  onChange={handleUploadSubCategoryImage}
                  className='hidden'
                />
              </label>
            </div>
          </div>

          <div>
            <label className='block mb-1 text-sm font-medium text-gray-700'>Select Category</label>
            <div className='border rounded-lg p-2'>
              <div className='flex flex-wrap gap-2 mb-2'>
                {subCategoryData.category.map(cat => (
                  <div key={cat._id} className='bg-gray-200 text-sm px-2 py-1 rounded flex items-center gap-1'>
                    {cat.name}
                    <IoClose
                      size={16}
                      className='cursor-pointer text-red-500'
                      onClick={() => handleRemoveCategorySelected(cat._id)}
                    />
                  </div>
                ))}
              </div>
              <select
                onChange={(e) => {
                  const value = e.target.value
                  const selectedCat = allCategory.find(cat => cat._id === value)
                  if (selectedCat && !subCategoryData.category.some(c => c._id === selectedCat._id)) {
                    setSubCategoryData(prev => ({
                      ...prev,
                      category: [...prev.category, selectedCat]
                    }))
                  }
                }}
                className='w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400'
              >
                <option value=''>Select Category</option>
                {allCategory.map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Full-width Submit Button */}
          <div className='pt-4'>
            <button
              type='submit'
              disabled={!(subCategoryData.name && subCategoryData.image && subCategoryData.category.length)}
              className={`w-full py-3 rounded-xl font-semibold transition text-white text-center
                ${subCategoryData.name && subCategoryData.image && subCategoryData.category.length
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-gray-300 cursor-not-allowed'}
              `}
            >
              Submit
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}

export default EditSubCategory
