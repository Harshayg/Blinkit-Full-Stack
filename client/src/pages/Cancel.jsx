import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const Cancel = () => {
  const [showCancel, setShowCancel] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowCancel(true);
    }, 10000); // 10 seconds

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-[#ffebeb] via-[#ffd6d6] to-[#ffecec] flex items-center justify-center">
      
      {/* 🎈 Floating Blobs (background animation) */}
      <div className="absolute w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="blob bg-red-300 top-[20%] left-[30%]" />
        <div className="blob bg-red-400 top-[60%] left-[60%]" />
        <div className="blob bg-red-200 top-[40%] left-[80%]" />
      </div>

      {!showCancel ? (
        // ❌ Centered Animated X
        <div className="z-10 flex flex-col items-center gap-4 animate-fade-in">
          <svg
            className="w-28 h-28 text-red-600 animate-pop"
            viewBox="0 0 100 100"
            fill="none"
          >
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="currentColor"
              strokeWidth="8"
              className="opacity-20"
            />
            <path
              d="M35 35 L65 65 M65 35 L35 65"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              className="animate-draw-x"
            />
          </svg>
          <p className="text-red-700 text-xl font-semibold tracking-wide">Cancelling...</p>
        </div>
      ) : (
        // ❌ Final Cancel Card
        <div className="z-10 w-[90%] max-w-md bg-white/80 backdrop-blur-xl rounded-3xl p-10 shadow-2xl flex flex-col items-center gap-6 text-center animate-popup-card">
          <svg
            className="w-20 h-20 text-red-600"
            viewBox="0 0 100 100"
            fill="none"
          >
            <path
              d="M35 35 L65 65 M65 35 L35 65"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinecap="round"
            />
          </svg>

          <h2 className="text-3xl font-semibold text-red-800">Order Cancelled</h2>

          <p className="text-red-700 text-base">
            Your action didn’t complete. Try again or return to the homepage.
          </p>

          <Link
            to="/"
            className="mt-4 bg-red-600 text-white px-6 py-2.5 rounded-full shadow-md hover:bg-red-700 transition-all duration-300"
          >
            Back to Home
          </Link>
        </div>
      )}
    </div>
  );
};

export default Cancel;
