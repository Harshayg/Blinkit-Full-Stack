import React from 'react'
import { useGlobalContext } from '../provider/GlobalProvider'
import { FaCartShopping } from 'react-icons/fa6'
import { DisplayPriceInRupees } from '../utils/DisplayPriceInRupees'
import { Link, useLocation } from 'react-router-dom'
import { FaCaretRight } from "react-icons/fa"
import { useSelector } from 'react-redux'

const CartMobileLink = () => {
  const { totalPrice, totalQty } = useGlobalContext()
  const cartItem = useSelector(state => state.cartItem.cart)
  const location = useLocation()

  const showOnRoutes = ['/', '/search', '/product']
  const excludedRoutes = ['/cart', '/myorders', '/user']

  const shouldDisplay =
    showOnRoutes.some(path => location.pathname.startsWith(path)) &&
    !excludedRoutes.some(path => location.pathname.startsWith(path))

  return (
    <>
      {shouldDisplay && cartItem[0] && (
        <div className='sticky bottom-2 z-50 px-4'>
          <div className='backdrop-blur-md bg-green-800/80 px-4 py-3 rounded-2xl text-white shadow-lg flex items-center justify-between gap-4 transition-all duration-300 ease-in-out lg:hidden'>
            <div className='flex items-center gap-3'>
              <div className='p-1 '>
                <FaCartShopping size={18} />
              </div>
              <div className='text-sm font-medium'>
                <p className='leading-none'>{totalQty} items</p>
                <p className='text-xs opacity-90'>{DisplayPriceInRupees(totalPrice)}</p>
              </div>
            </div>

            <Link to={"/cart"} className='flex items-center gap-1'>
                        <span className='text-sm'>View Cart</span>
                        <FaCaretRight/>
                    </Link>
          </div>
        </div>
      )}
    </>
  )
}

export default CartMobileLink
