import React from "react";
import { createPortal } from "react-dom";
import { MdLogin } from "react-icons/md";
import { IoClose } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

const LoginPopup = ({ show, onClose }) => {
  const navigate = useNavigate();
  if (!show) return null;

  const popup = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      onClick={onClose}
    >
      {/* Background */}
      <div className="absolute inset-0 backdrop-blur-md bg-[rgba(0,0,0,0.55)]"></div>

      {/* Popup Card */}
      <div
        className="relative w-[92%] sm:max-w-md bg-white text-gray-900 rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.4)] border border-gray-200 p-8 flex flex-col items-center justify-center animate-slideUp pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cancel Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition-colors duration-200"
        >
          <IoClose className="text-2xl" />
        </button>

        {/* Icon */}
        <div className="flex items-center justify-center mb-5">
          <MdLogin className="text-green-600 text-6xl" />
        </div>

        {/* Text */}
        <h3 className="text-2xl font-semibold mb-2 text-center">
          You are not logged in
        </h3>
        <p className="text-gray-600 text-sm mb-6 text-center">
          Please log in to continue shopping
        </p>

        {/* Login Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
            navigate("/Login");
          }}
          className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-700 hover:brightness-110 text-white rounded-xl font-semibold tracking-wide shadow-md transition-all duration-200"
        >
          Login
        </button>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slideUp {
          animation: slideUp 0.6s cubic-bezier(0.25, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );

  // ✅ Render outside DOM tree
  return createPortal(popup, document.body);
};

export default LoginPopup;
