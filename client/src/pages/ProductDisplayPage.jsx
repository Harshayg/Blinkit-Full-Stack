import React, { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import SummaryApi from '../common/SummaryApi'
import Axios from '../utils/Axios'
import AxiosToastError from '../utils/AxiosToastError'
import { FaAngleRight, FaAngleLeft } from "react-icons/fa6";
import { DisplayPriceInRupees } from '../utils/DisplayPriceInRupees'
import Divider from '../components/Divider'
import image1 from '../assets/minute_delivery.png'
import image2 from '../assets/Best_Prices_Offers.png'
import image3 from '../assets/Wide_Assortment.png'
import { pricewithDiscount } from '../utils/PriceWithDiscount'
import AddToCartButton from '../components/AddToCartButton'

const ProductDisplayPage = () => {
  const params = useParams()
  let productId = params?.product?.split("-")?.slice(-1)[0]
  const [data, setData] = useState({
    name: "",
    image: []
  })
  const [image, setImage] = useState(0)
  const [loading, setLoading] = useState(false)
  const imageContainer = useRef()

  const fetchProductDetails = async () => {
    try {
      const response = await Axios({
        ...SummaryApi.getProductDetails,
        data: {
          productId: productId
        }
      })

      const { data: responseData } = response

      if (responseData.success) {
        setData(responseData.data)
      }
    } catch (error) {
      AxiosToastError(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProductDetails()
  }, [params])

  // ✅ Scroll to top on productId change
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [productId])

  const handleScrollRight = () => imageContainer.current.scrollLeft += 100
  const handleScrollLeft = () => imageContainer.current.scrollLeft -= 100

  return (
    <section className='bg-white lg:px-24  mx-auto pr-5 p-6 gap-6 py-4 grid lg:grid-cols-2'>

      {/* Left Side - Product Images (With Border on Right) */}
      <div className='border-r border-gray-300 pr-6'>
        <div className='bg-white lg:min-h-[65vh] lg:max-h-[65vh] rounded min-h-56 max-h-56 h-full w-full'>
          <img src={data.image[image]} className='w-full h-full object-scale-down' />
        </div>

        <div className='flex items-center justify-center gap-3 my-2'>
          {data.image.map((img, index) => (
            <div key={img + index} className={`bg-slate-200 w-3 h-3 lg:w-5 lg:h-5 rounded-full ${index === image && "bg-slate-300"}`}></div>
          ))}
        </div>

        <div className='grid relative'>
          <div ref={imageContainer} className='flex gap-4 z-10 relative w-full overflow-x-auto scrollbar-none'>
            {data.image.map((img, index) => (
              <div className='w-20 h-20 min-h-20 min-w-20 rounded-xl cursor-pointer shadow-md' key={img + index}>
                <img src={img} alt='min-product' onClick={() => setImage(index)} className='w-full h-full object-scale-down' />
              </div>
            ))}
          </div>
          <div className='w-full -ml-3 h-full hidden lg:flex justify-between absolute items-center'>
            <button onClick={handleScrollLeft} className='z-10 bg-white relative p-1 rounded-full shadow-lg'><FaAngleLeft /></button>
            <button onClick={handleScrollRight} className='z-10 bg-white relative p-1 rounded-full shadow-lg'><FaAngleRight /></button>
          </div>
        </div>

        {/* Borderline Before Description */}
        <div className='border-t border-gray-300 pt-4 mt-4 hidden lg:grid gap-3'>
          <div>
            <p className='font-semibold'>Description</p>
            <p className='text-base'>{data.description}</p>
          </div>
          <div>
            <p className='font-semibold'>Unit</p>
            <p className='text-base'>{data.unit}</p>
          </div>
          {data?.more_details && Object.keys(data?.more_details).map((element) => (
            <div key={element}>
              <p className='font-semibold'>{element}</p>
              <p className='text-base'>{data?.more_details[element]}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right Side - Product Details (Sticky) */}
      <div className='p-5 lg:pl-5 text-base lg:sticky top-24 h-fit'>
        <h2 className='text-lg font-semibold lg:text-2xl'>{data.name}</h2>
        <p className='bg-gray-300 w-fit px-2 lg:text-base rounded-sm'>10 Min</p>
        <Divider />

        <div>
          <p className='text-base'>{data.unit}</p>
          <div className='flex gap-1 text-base items-center'>
            <div className='px-1 py-2 rounded w-fit'>
              <p className='font-semibold text-base lg:text-base'>
                {DisplayPriceInRupees(pricewithDiscount(data.price, data.discount))}
              </p>
            </div>
            <span className='px-1 py-2 text-gray-400 rounded w-fit'>MRP</span>
            {data.discount && <p className='text-gray-400 line-through'>{DisplayPriceInRupees(data.price)}</p>}
            {data.discount && <p className="border text-white border-blue-400 px-1 rounded bg-blue-400 w-fit">{data.discount}% OFF</p>}
          </div>
          <p className='text-base'>(Inclusive of all taxes)</p>
        </div>

        <div className="my-4 py-1">
          {data.stock === 0 ? <p className='text-lg text-red-500 my-2'>Out of Stock</p> : <AddToCartButton data={data} />}
        </div>

        <h2 className='font-semibold'>Why shop from binkeyit?</h2>
        <div>
          {[{ img: image1, title: "Superfast Delivery", desc: "Get your order delivered to your doorstep at the earliest from dark stores near you." },
          { img: image2, title: "Best Prices & Offers", desc: "Best price destination with offers directly from the manufacturers." },
          { img: image3, title: "Wide Assortment", desc: "Choose from 5000+ products across food, personal care, household & other categories." }
          ].map(({ img, title, desc }) => (
            <div className='flex items-center gap-4 my-4' key={title}>
              <img src={img} alt={title} className='w-20 h-20' />
              <div className='text-sm'>
                <div className='font-semibold'>{title}</div>
                <p>{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile View */}
        <div className='my-4 hidden max-md:grid gap-3'>
          <div>
            <p className='font-semibold'>Description</p>
            <p className='text-base'>{data.description}</p>
          </div>
          <div>
            <p className='font-semibold'>Unit</p>
            <p className='text-base'>{data.unit}</p>
          </div>
          {data?.more_details && Object.keys(data?.more_details).map((element) => (
            <div key={element}>
              <p className='font-semibold'>{element}</p>
              <p className='text-base'>{data?.more_details[element]}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ProductDisplayPage
