import React from 'react'
import UserMenu from '../components/UserMenu'
import { IoClose } from "react-icons/io5"

const UserMenuMobile = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black bg-opacity-40">
      <section className="bg-white w-full max-h-[70%] rounded-t-2xl p-4 animate-slideUp sm:max-w-md">
        <button 
          onClick={() => window.history.back()} 
          className="text-neutral-800 block w-fit ml-auto"
        >
          <IoClose size={25}/>
        </button>
        <div className="overflow-y-auto max-h-full px-2 pb-4">
          <UserMenu />
        </div>
      </section>
    </div>
  )
}

export default UserMenuMobile
