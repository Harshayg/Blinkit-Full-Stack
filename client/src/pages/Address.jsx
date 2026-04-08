import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import AddAddress from '../components/AddAddress';
import EditAddressDetails from '../components/EditAddressDetails';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import toast from 'react-hot-toast';
import AxiosToastError from '../utils/AxiosToastError';
import { useGlobalContext } from '../provider/GlobalProvider';
import { motion } from 'framer-motion';
import { Trash2, Pencil, X, CheckCircle2 } from 'lucide-react';


const Address = () => {
  const addressList = useSelector(state => state.addresses.addressList);
  const [openAddress, setOpenAddress] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [editData, setEditData] = useState({});
  const { fetchAddress } = useGlobalContext();

  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [addressToDeleteId, setAddressToDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleDisableAddress = async (id) => {
    try {
      const response = await Axios({
        ...SummaryApi.disableAddress,
        data: { _id: id }
      });
      if (response.data.success) {
        toast.success('Address Removed');
        if (fetchAddress) fetchAddress();
      }
    } catch (error) {
      AxiosToastError(error);
    }
  };

  const handleDeleteClick = (id) => {
    setAddressToDeleteId(id);
    setShowConfirmPopup(true);
    setDeleteSuccess(false);
  };

  const confirmDelete = async () => {
    setDeleting(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    await handleDisableAddress(addressToDeleteId);
    setDeleting(false);
    setDeleteSuccess(true);
    setAddressToDeleteId(null);
  };

  const closePopup = () => {
    setShowConfirmPopup(false);
    setDeleteSuccess(false);
  };

  return (
    <div className='p-4 space-y-6'>
      <div className='flex items-center justify-between bg-white px-4 py-3 rounded-2xl shadow-md'>
        <h2 className='text-xl font-semibold text-gray-800'>Manage Addresses</h2>
        <button
          onClick={() => setOpenAddress(true)}
          className='px-4 py-2 text-sm rounded-full border border-green-600 text-green-600 hover:bg-green-50 transition'
        >
          + Add Address
        </button>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4'>
        {addressList.filter(address => address.status).map((address, index) => (
          <motion.div
            key={address._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className='flex justify-between items-start gap-4 p-4 bg-white rounded-2xl shadow hover:shadow-lg transition'
          >
            <div className='space-y-1 text-gray-700'>
              <p className='font-medium'>{address.address_line}</p>
              <p>{address.city}</p>
              <p>{address.state}</p>
              <p>{address.country} - {address.pincode}</p>
              <p className='text-sm text-gray-500'>📞 {address.mobile}</p>
            </div>
            <div className='flex flex-col gap-3'>
              <button
                onClick={() => {
                  setOpenEdit(true);
                  setEditData(address);
                }}
                className='p-2 bg-green-100 text-green-700 hover:bg-green-200 rounded-full transition'
              >
                <Pencil size={18} />
              </button>
              <button
                onClick={() => handleDeleteClick(address._id)}
                className='p-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-full transition'
              >
                <Trash2 size={18} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {openAddress && <AddAddress close={() => setOpenAddress(false)} />}
      {openEdit && <EditAddressDetails data={editData} close={() => setOpenEdit(false)} />}

      {showConfirmPopup && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="bg-white w-full max-w-md p-6 rounded-2xl shadow-2xl border border-gray-100 relative"
          >
            <button onClick={closePopup} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>

            {!deleteSuccess ? (
              <>
                <h2 className="text-xl font-bold text-gray-800 mb-4">Delete Confirmation</h2>
                {!deleting ? (
                  <>
                    <p className='mb-6 text-gray-600'>Are you sure you want to delete this address?</p>
                    <div className='flex justify-end'>
                      <button
                        onClick={confirmDelete}
                        className=" w-full px-5 py-2 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold shadow-md hover:from-red-600 hover:to-red-700 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-center py-8">
                    <div className="w-12 h-12 border-4 border-red-400 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center text-center py-6">
                <CheckCircle2 className="text-green-500 mb-3" size={40} />
                <h3 className="text-lg font-semibold text-gray-800">Address has been deleted permanently</h3>
                <p className="text-sm text-gray-600 mb-6">You can add another address if you want.</p>
                <button
                  onClick={() => {
                    closePopup();
                    setOpenAddress(true);
                  }}
                  className="px-5 py-2 rounded-xl bg-green-600 text-white font-semibold shadow-md hover:bg-green-700 transition"
                >
                  + Add Address
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Address;
