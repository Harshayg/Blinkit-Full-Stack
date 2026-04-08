import React, { useState } from 'react';
import Empty from '../assets/Empty.avif';

const E_Gift_Cards = () => {
  const [selectedTab, setSelectedTab] = useState('Received');
  const [isLoading, setIsLoading] = useState(false);

  const handleTabPress = (tab) => {
    setIsLoading(true);
    setTimeout(() => {
      setSelectedTab(tab);
      setIsLoading(false);
    }, 1000); // 1 seconds delay
  };

  return (
    <div className='p-4 space-y-6'>

      {/* Tab Buttons */}
      <div className='flex bg-white rounded-2xl overflow-hidden shadow-md'>
        <button
          onClick={() => handleTabPress('Sent')}
          className={`w-1/2 py-2 text-center font-medium transition-colors duration-300 ${
            selectedTab === 'Sent' ? 'text-green-600 border-b-4 border-green-600' : 'text-gray-600'
          }`}
        >
          Sent
        </button>
        <button
          onClick={() => handleTabPress('Received')}
          className={`w-1/2 py-2 text-center font-medium transition-colors duration-300 ${
            selectedTab === 'Received' ? 'text-green-600 border-b-4 border-green-600' : 'text-gray-600'
          }`}
        >
          Received
        </button>
      </div>

      {/* Content */}
      <div className='flex flex-col items-center justify-center h-[400px] bg-white rounded-2xl shadow-md'>
        {isLoading ? (
          <span className='w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin'></span>
        ) : (
          <>
            <img src={Empty} alt='Empty' className='w-68 h-68 mb-4' />
            <p className='text-lg font-medium text-gray-600'>
              No e-gift cards to show here!
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default E_Gift_Cards;
