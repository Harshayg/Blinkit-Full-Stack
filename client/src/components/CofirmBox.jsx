import React from 'react'
import { IoClose } from "react-icons/io5"
import { motion } from 'framer-motion'

const ConfirmBox = ({ cancel, confirm, close }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.95 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="bg-white w-full max-w-md p-6 rounded-2xl shadow-2xl border border-gray-100"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">Delete Confirmation</h2>
        </div>
        <p className="text-gray-600 mb-6">Are you absolutely sure you want to permanently delete this item?</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={cancel}
            className="px-5 py-2 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            onClick={confirm}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold shadow-md hover:from-red-600 hover:to-red-700 transition"
          >
            Confirm
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default ConfirmBox
