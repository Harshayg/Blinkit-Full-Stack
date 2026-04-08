import React, { useState } from 'react';
import { RiDeleteBin6Line } from "react-icons/ri";
import { GoChevronRight } from "react-icons/go";
import { IoClose } from "react-icons/io5";
import { motion, AnimatePresence } from "framer-motion";

const Accountprivacy = () => {
  const [showFeedbackPopup, setShowFeedbackPopup] = useState(false);
  const [showConfirmationPopup, setShowConfirmationPopup] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [isLoading, setIsLoading] = useState(false); // New state for loading

  const handleDeleteAccount = () => {
    setIsLoading(true); // Start loading

    // Simulate an asynchronous operation (e.g., API call to delete account)
    // Replace this with your actual API call
    setTimeout(() => {
      setIsLoading(false); // Stop loading
      setShowFeedbackPopup(false); // Close feedback popup
      setShowConfirmationPopup(true); // Show confirmation popup
    }, 2000); // Simulate a 2-second loading time
  };

  return (
    <div className='pl-4 pt-8 relative'>
      <div className='text-xl text-black font-semibold'>
        Account privacy and policy
      </div>
      <p className='text-sm pt-3'>
        We i.e. "Blink Commerce Private Limited", are committed to protecting the privacy and security of your personal information. Your privacy is important to us and maintaining your trust is paramount.
        This privacy policy explains how we collect, use, process and disclose information about you. By using our website/ app/ platform and affiliated services, you consent to the terms of our privacy policy (“Privacy Policy”) in addition to our ‘Terms of Use.’ We encourage you to read this privacy policy to understand the collection, use, and disclosure of your information from time to time, to keep yourself updated with the changes and updates that we make to this policy. This privacy policy describes our privacy practices for all websites, products and services that are linked to it. However this policy does not apply to those affiliates and partners that have their own privacy policy. In such situations, we recommend that you read the privacy policy on the applicable site. Should you have any clarifications regarding this privacy policy, please write to us at info@blinkit.com
      </p>

      <div
        className='flex items-center mt-6 border rounded-xl px-4 py-3 w-[95%] shadow-sm hover:shadow-md cursor-pointer'
        onClick={() => setShowFeedbackPopup(true)}
      >
        <div className='text-2xl text-black mr-4'><RiDeleteBin6Line /></div>
        <div>
          <div className='text-sm font-semibold text-black'>Request to delete account</div>
          <div className='text-xs text-gray-600'>Request to closure of your account</div>
        </div>
        <div className='ml-auto text-lg'><GoChevronRight size={24} /></div>
      </div>

      {/* Feedback Popup */}
      <AnimatePresence>
        {showFeedbackPopup && (
          <motion.div
            className='fixed inset-0 bg-black bg-opacity-30 flex justify-center items-end md:items-center z-50'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className='bg-white rounded-xl w-full md:w-[500px] p-6 shadow-xl relative'
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <button
                onClick={() => setShowFeedbackPopup(false)}
                className='absolute -top-12 right-5 bg-white rounded-full p-1 shadow-md z-10'
              >
                <IoClose size={28} className='text-black' />
              </button>
              <div className='text-md font-bold text-black mb-2'>I don't want to use Blinkit anymore</div>
              <p className='text-sm text-gray-600 mb-3'>Do you have any feedback for us? We would love to hear from you! (optional)</p>
              <textarea
                className='w-full h-24 border rounded-md p-3 text-sm mb-4'
                placeholder='Please share your feedback (Optional)'
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />
              <button
                className='bg-green-600 hover:bg-green-700 text-white w-full py-3 rounded-md font-semibold'
                onClick={handleDeleteAccount} // Call the new handler
                disabled={isLoading} // Disable button while loading
              >
                 {isLoading ? 'Processing...' : 'Delete my account'} {/* Button text changes */}
              </button>
              <p className='text-[11px] text-gray-600 mt-4'>
                Note* : All data associated with this account will be deleted in accordance with our privacy policy. You will not be able to retrieve this information once deleted.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Popup */}
      <AnimatePresence>
        {showConfirmationPopup && (
          <motion.div
            className='fixed inset-0 bg-black bg-opacity-30 flex justify-center items-end md:items-center z-50'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className='bg-white rounded-xl w-full md:w-[400px] p-6 text-center shadow-xl'
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <div className='text-md font-semibold text-black mb-3'>Your account will be deleted soon</div>
              <button
                className='mt-4 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md'
                onClick={() => setShowConfirmationPopup(false)}
              >
                OK
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            className='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[60]' // Higher z-index than popups
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Simple Spinner */}
            <div className='w-12 h-12 border-4 border-t-4 border-green-500 border-solid rounded-full animate-spin'></div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Accountprivacy;
