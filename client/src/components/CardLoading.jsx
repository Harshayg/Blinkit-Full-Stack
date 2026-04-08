import React from 'react';

const CardLoading = () => {
  return (
    <div className="border py-3 px-4 lg:p-6 grid gap-2 lg:gap-4 min-w-40 lg:min-w-56 rounded-2xl shadow-lg cursor-pointer bg-white animate-pulse transition-all duration-300">
      <div className="min-h-28 bg-gradient-to-r from-blue-100 to-blue-200 rounded-xl" />

      <div className="h-4 w-24 bg-gradient-to-r from-blue-100 to-blue-200 rounded-md" />
      <div className="h-4 w-36 bg-gradient-to-r from-blue-100 to-blue-200 rounded-md" />
      <div className="h-4 w-16 bg-gradient-to-r from-blue-100 to-blue-200 rounded-md" />

      <div className="flex items-center justify-between gap-4">
        <div className="h-4 w-20 bg-gradient-to-r from-blue-100 to-blue-200 rounded-md" />
        <div className="h-4 w-20 bg-gradient-to-r from-blue-100 to-blue-200 rounded-md" />
      </div>
    </div>
  );
};

export default CardLoading;
