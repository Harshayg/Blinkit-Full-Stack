import React, { useState } from 'react'
import { DisplayPriceInRupees } from '../utils/DisplayPriceInRupees'
import { pricewithDiscount } from '../utils/PriceWithDiscount'
import { Link } from 'react-router-dom'
import { valideURLConvert } from '../utils/valideURLConvert'
import AddToCartButton from './AddToCartButton'
import { PiTimerDuotone } from "react-icons/pi";

const CardProduct = ({ data }) => {
  // Construct the URL for the product details page
  const url = `/product/${valideURLConvert(data.name)}-${data._id}`
  // State to manage loading state (though not used in this snippet)
  const [loading, setLoading] = useState(false)

  // Calculate the discounted price
  const discountedPrice = pricewithDiscount(data.price, data.discount);
  // Check if the product has a discount
  const hasDiscount = data.discount > 0;
  // Check if the product is out of stock
  const isOutOfStock = data.stock === 0;

  return (
    // Link component wrapping the card for navigation
    // Added opacity for out of stock items
    <Link to={url} className={`relative border py-1 lg:p-3 grid gap-0.5 lg:gap-3 min-w-36 lg:min-w-44 rounded-xl shadow-md cursor-pointer bg-white ${isOutOfStock ? 'opacity-50' : ''}`}>
      {/* Out of stock overlay */}
      {isOutOfStock && (
        <div className="absolute top-0 left-0 w-full bg-black bg-opacity-80 text-white text-center text-xs font-semibold py-1 rounded-t-xl z-20">
          Out of stock
        </div>
      )}

      {/* Discount badge */}
      {hasDiscount && (
        <div className="absolute top-1 left-1 z-10 w-[28px] h-[26px] bg-[#2585f7] rounded-tl-md rounded-br-md flex items-center justify-center shadow-md">
          <span className="text-[8px] text-white font-bold leading-3 text-center">
            {data.discount}%<br />OFF
          </span>
        </div>
      )}

      {/* Image container - Adjusted max height for small screens */}
      <div className='min-h-20 w-full max-h-16 lg:max-h-1 rounded overflow-hidden'>
        <img
          src={data.image[0]}
          className='w-full h-full object-scale-down lg:scale-150'
          alt={data.name} // Added alt text for accessibility
        />
      </div>

      {/* Delivery time - Adjusted padding for small screens */}
      <div className='flex pt-1 p-1 lg:p-0 items-center gap-1'>
        <div className='rounded text-xs w-fit p-[1px] px-2 flex font-bold items-center gap- bg-green-50'>
          <PiTimerDuotone />
          <span>10 min</span>
        </div>
      </div>

      {/* Product name - Uses line-clamp-2 to limit to two lines with ellipsis */}
      {/* Adjusted padding for small screens */}
      <div className='text-[14px] p-1 lg:p-0 font-semibold text-[#1A1A1A] leading-[18px] line-clamp-2'>
        {data.name}
      </div>

      {/* Product unit - Adjusted padding for small screens */}
      <div className='text-[13px] p-1 lg:p-0 text-[#6F6F6F] leading-[16px]'>
        {data.unit}
      </div>

      {/* Price and Add to Cart - Adjusted padding and margin for small screens */}
      <div className='flex p-1 lg:p-0 items-center justify-between mt-[2px]'>
        <div className='text-[14px] font-semibold text-[#1A1A1A]'>
          {/* Original price with strikethrough if discounted */}
          {hasDiscount && (
            <div className='text-[12px] text-[#6F6F6F] line-through'>
              {DisplayPriceInRupees(data.price)}
            </div>
          )}
          {/* Discounted price */}
          {DisplayPriceInRupees(discountedPrice)}
        </div>
        <div>
          {/* Add to cart button or Out of stock message */}
          {
            isOutOfStock ? (
              <p className='text-red-500 text-sm text-center'>Out of stock</p>
            ) : (
              <AddToCartButton data={data} />
            )
          }
        </div>
      </div>
    </Link>
  )
}

export default CardProduct
