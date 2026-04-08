import React from 'react'
import UserMenu from '../components/UserMenu'
import { Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { motion } from 'framer-motion'

const Dashboard = () => {
  const user = useSelector(state => state.user)

  console.log("user dashboard", user)

  return (
    <section className="bg-gradient-to-t  from-[#f5f7fa] via-[#ffffff] to-[#e8eff2] min-h-screen">
      <div className="container mx-auto p-5 grid lg:grid-cols-[250px,1fr] gap-6">
        
        {/* Left: Menu */}
        <motion.div
          className="py-4 pl-4 pr-4 sticky top-24 max-h-[calc(100vh-96px)] hidden lg:block border-r border-gray-200 bg-white shadow-lg rounded-xl hover:shadow-2xl transition-shadow duration-300"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          <UserMenu />
        </motion.div>

        {/* Right: Content */}
        <motion.div
          className="bg-white min-h-[75vh] rounded-xl shadow-xl p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Outlet />
        </motion.div>
      </div>
    </section>
  )
}

export default Dashboard
