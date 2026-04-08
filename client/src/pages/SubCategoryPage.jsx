import React, { useEffect, useState } from 'react'
import UploadSubCategoryModel from '../components/UploadSubCategoryModel'
import AxiosToastError from '../utils/AxiosToastError'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import DisplayTable from '../components/DisplayTable'
import { createColumnHelper } from '@tanstack/react-table'
import ViewImage from '../components/ViewImage'
import { MdDelete } from "react-icons/md"
import { HiPencil } from "react-icons/hi"
import EditSubCategory from '../components/EditSubCategory'
import CofirmBox from '../components/CofirmBox'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { FaCheckCircle } from 'react-icons/fa'

const SubCategoryPage = () => {
  const [openAddSubCategory, setOpenAddSubCategory] = useState(false)
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const columnHelper = createColumnHelper()
  const [ImageURL, setImageURL] = useState("")
  const [openEdit, setOpenEdit] = useState(false)
  const [editData, setEditData] = useState({ _id: "" })
  const [deleteSubCategory, setDeleteSubCategory] = useState({ _id: "" })
  const [openDeleteConfirmBox, setOpenDeleteConfirmBox] = useState(false)
  const [showSuccessPopup, setShowSuccessPopup] = useState({ visible: false, message: "" })

const fetchSubCategory = async (categoryId) => {
  try {
    setLoading(true)
    const response = await Axios({
      ...SummaryApi.getSubCategory,
      data: { categoryId },   // <-- send categoryId in body
    })

    const { data: responseData } = response
    if (responseData.success) {
      setData(responseData.data)
    }
  } catch (error) {
    AxiosToastError(error)
  } finally {
    setLoading(false)
  }
}


  useEffect(() => {
    fetchSubCategory()
  }, [])

  const column = [
    columnHelper.accessor('name', {
      header: "Name"
    }),
    columnHelper.accessor('image', {
      header: "Image",
      cell: ({ row }) => (
        <div className='flex justify-center items-center'>
          <img
            src={row.original.image}
            alt={row.original.name}
            className='w-10 h-10 rounded-md object-cover cursor-pointer transition hover:scale-105'
            onClick={() => setImageURL(row.original.image)}
          />
        </div>
      )
    }),
    columnHelper.accessor("category", {
      header: "Category",
      cell: ({ row }) => (
        <div className='flex flex-wrap gap-1'>
          {row.original.category.map((c, index) => (
            <span key={c._id + "table"} className='px-2 py-1 text-xs rounded bg-gray-100 shadow-sm'>
              {c.name}
            </span>
          ))}
        </div>
      )
    }),
    columnHelper.accessor("_id", {
      header: "Action",
      cell: ({ row }) => (
        <div className='flex items-center justify-center gap-2'>
          <button
            onClick={() => {
              setOpenEdit(true)
              setEditData(row.original)
            }}
            className='p-2 rounded-full bg-green-50 text-green-600 hover:bg-green-100 transition'
          >
            <HiPencil size={18} />
          </button>
          <button
            onClick={() => {
              setOpenDeleteConfirmBox(true)
              setDeleteSubCategory(row.original)
            }}
            className='p-2 rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition'
          >
            <MdDelete size={18} />
          </button>
        </div>
      )
    })
  ]

  const handleDeleteSubCategory = async () => {
    try {
      const response = await Axios({
        ...SummaryApi.deleteSubCategory,
        data: deleteSubCategory
      })

      const { data: responseData } = response
      if (responseData.success) {
        toast.success(responseData.message)
        fetchSubCategory()
        setOpenDeleteConfirmBox(false)
        setDeleteSubCategory({ _id: "" })
      }
    } catch (error) {
      AxiosToastError(error)
    }
  }

  const showPopup = (message) => {
    setShowSuccessPopup({ visible: true, message })
    setTimeout(() => setShowSuccessPopup({ visible: false, message: "" }), 2000)
  }

  return (
    <motion.section
      className='p-4'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className='bg-white rounded-xl shadow-md px-6 py-4 flex items-center justify-between'>
        <h2 className='text-xl font-semibold text-gray-800'>Sub Categories</h2>
        <button
          onClick={() => setOpenAddSubCategory(true)}
          className='border border-gray-300 px-4 py-1.5 rounded-md text-sm hover:bg-gray-100 transition'
        >
          + Add Sub Category
        </button>
      </div>

      <div className='mt-4 overflow-auto rounded-xl border border-gray-100 shadow-sm'>
        <DisplayTable data={data} column={column} loading={loading} />
      </div>

      <AnimatePresence>
        {openAddSubCategory && (
          <UploadSubCategoryModel
            close={() => setOpenAddSubCategory(false)}
            fetchData={() => {
              fetchSubCategory()
              showPopup("Subcategory uploaded successfully")
            }}
          />
        )}

        {ImageURL && (
          <ViewImage url={ImageURL} close={() => setImageURL("")} />
        )}

        {openEdit && (
          <EditSubCategory
            data={editData}
            close={() => setOpenEdit(false)}
            fetchData={() => {
              fetchSubCategory()
              showPopup("Subcategory updated successfully")
            }}
          />
        )}

        {openDeleteConfirmBox && (
          <CofirmBox
            cancel={() => setOpenDeleteConfirmBox(false)}
            close={() => setOpenDeleteConfirmBox(false)}
            confirm={handleDeleteSubCategory}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSuccessPopup.visible && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className='fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/30 backdrop-blur-md p-6 rounded-xl shadow-xl flex items-center gap-3 text-green-700 z-50 border border-green-200'
          >
            <FaCheckCircle size={24} className='text-green-500' />
            <span className='font-medium'>{showSuccessPopup.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  )
}

export default SubCategoryPage
