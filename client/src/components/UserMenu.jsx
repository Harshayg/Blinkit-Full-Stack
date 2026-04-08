import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Divider from './Divider'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import { logout } from '../store/userSlice'
import toast from 'react-hot-toast'
import AxiosToastError from '../utils/AxiosToastError'
import { HiOutlineExternalLink } from "react-icons/hi";
import isAdmin from '../utils/isAdmin'
import { motion, AnimatePresence } from 'framer-motion';
import QRcod from '../assets/QR.png'
import { FaCheckCircle } from 'react-icons/fa';

const UserMenu = ({ close }) => {
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogoutAnimation, setShowLogoutAnimation] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showLogoutSuccess, setShowLogoutSuccess] = useState(false);

  const handleLogout = async () => {
    setShowLogoutAnimation(true);
    try {
      const response = await Axios({ ...SummaryApi.logout });
      if (response.data.success) {
        setTimeout(() => {
          setShowLogoutSuccess(true);
          setShowLogoutAnimation(false);
        }, 3000);
        setTimeout(() => {
          if (close) close();
          dispatch(logout());
          localStorage.clear();
          toast.success(response.data.message);
          navigate("/");
        }, 6000);
      }
    } catch (error) {
      console.log(error);
      AxiosToastError(error);
      setShowLogoutAnimation(false);
    }
  };

  const handleClose = () => {
    if (close) close();
  };

  const getLinkClasses = (label, path) => {
    const isActive = location.pathname === path;
    const isHovered = hoveredItem === label;
    const isLogout = label === "Log Out";

    return `px-2 py-1 rounded-xl transition-all duration-200 flex items-start ${
      isLogout && isHovered
        ? 'bg-red-100 text-red-600 font-semibold'
        : isActive
        ? 'bg-green-100 text-green-600 font-semibold'
        : isHovered
        ? 'bg-gray-300 text-black font-medium'
        : 'hover:bg-gray-200'
    }`;
  };

  const renderMenuItem = (label, path, onClick = null) => (
    <Link
      to={path}
      onClick={onClick || handleClose}
      className={getLinkClasses(label, path)}
      onMouseEnter={() => setHoveredItem(label)}
      onMouseLeave={() => setHoveredItem(null)}
    >
      <motion.span
        animate={hoveredItem === label ? { y: -2 } : { y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="inline-block w-full"
      >
        {label}
      </motion.span>
    </Link>
  );

  return (
    <div>
      <div className='font-semibold'>My Account</div>
      <div className='text-sm flex items-center gap-2'>
        <span className='max-w-64 text-ellipsis line-clamp-1'>
          {user.name || user.mobile}{" "}
          <span className='text-medium text-red-600'>{user.role === "ADMIN" ? "(Admin)" : ""}</span>
        </span>
        <Link onClick={handleClose} to={"/dashboard/profile"} className='hover:text-green-600'>
          <HiOutlineExternalLink size={15} />
        </Link>
      </div>

      <Divider />

      <div className='text-sm grid gap-1'>
  {/* Admin-only items */}
  {isAdmin(user.role) && renderMenuItem("Orders", "/dashboard/AdminOrdersPage")}
  {isAdmin(user.role) && renderMenuItem("Category", "/dashboard/category")}
  {isAdmin(user.role) && renderMenuItem("Sub Category", "/dashboard/subcategory")}
  {isAdmin(user.role) && renderMenuItem("Upload Product", "/dashboard/upload-product")}
  {isAdmin(user.role) && renderMenuItem("Product", "/dashboard/product")}

  {/* Non-admin items */}
  {!isAdmin(user.role) && renderMenuItem("My Orders", "/dashboard/myorders")}
  {!isAdmin(user.role) && renderMenuItem("Save Address", "/dashboard/address")}
  {!isAdmin(user.role) && renderMenuItem("E-Gift Cards", "/dashboard/E_Gift_Cards")}
  {!isAdmin(user.role) && renderMenuItem("Account privacy", "/dashboard/Accountprivacy")}

  {/* Log Out is always shown */}
        <button
          onClick={() => setShowConfirmModal(true)}
          className={getLinkClasses("Log Out", "") + ' text-red-600 text-left'}
          onMouseEnter={() => setHoveredItem("Log Out")}
          onMouseLeave={() => setHoveredItem(null)}
        >
          <motion.span
            animate={hoveredItem === "Log Out" ? { y: -2 } : { y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="inline-block w-full"
          >
            Log Out
          </motion.span>
        </button>
      </div>

      <Divider className="my-4" />

      <div className="flex gap-2 items-start">
        <img src={QRcod} alt="QR Code" className="w-24 h-24" />
        <div className="text-sm">
          <div className="font-bold text-gray-800 leading-snug">Simple way to get groceries </div>
          <div className="font-bold text-blue-500">in minutes</div>
          <div className="text-gray-500 text-xs">Scan the QR code to download blinkit app </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="bg-white rounded-2xl shadow-xl p-6 w-80 text-center flex flex-col gap-4" initial={{ y: "100vh", opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: "100vh", opacity: 0 }} transition={{ type: "spring", stiffness: 100, damping: 15 }}>
              {!showLogoutAnimation && !showLogoutSuccess && (
                <>
                  <h2 className="text-lg font-bold text-gray-800">Are you sure you want to log out?</h2>
                  <div className="flex justify-between mt-4">
                    <button onClick={() => setShowConfirmModal(false)} className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium w-1/2 mr-2 transition-transform duration-200 hover:scale-105">
                      Cancel
                    </button>
                    <button onClick={handleLogout} className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold w-1/2 ml-2 transition-transform duration-200 hover:scale-105">
                      Yes, Logout
                    </button>
                  </div>
                </>
              )}

              {showLogoutAnimation && !showLogoutSuccess && (
                <motion.div className="flex flex-col items-center">
                  <motion.div className="relative w-24 h-24 mb-4">
                    <motion.div className="absolute inset-0 rounded-full border-8 border-red-500" initial={{ scale: 0 }} animate={{ scale: 1.2 }} transition={{ duration: 2, ease: "easeInOut" }} />
                    <motion.div className="absolute inset-4 rounded-full border-4 border-red-300" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} />
                  </motion.div>
                  <p className="text-red-500 font-semibold">Logging out...</p>
                </motion.div>
              )}

              {showLogoutSuccess && (
                <motion.div className="flex flex-col items-center">
                  <FaCheckCircle className="text-green-500 text-5xl mb-2 animate-bounce" />
                  <h3 className="text-green-600 font-bold text-lg">Logged out successfully!</h3>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserMenu;
