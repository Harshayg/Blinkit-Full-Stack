import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import AxiosToastError from '../utils/AxiosToastError'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import CardLoading from './CardLoading'
import CardProduct from './CardProduct'
import { FaAngleLeft, FaAngleRight } from "react-icons/fa6";
import { useSelector } from 'react-redux'
import { valideURLConvert } from '../utils/valideURLConvert'

const CategoryWiseProductDisplay = ({ id, name }) => {
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(false)
    const [showLeftButton, setShowLeftButton] = useState(false)
    const containerRef = useRef()
    const subCategoryData = useSelector(state => state.product.allSubCategory)
    const loadingCardNumber = new Array(6).fill(null)

    const fetchCategoryWiseProduct = async () => {
        try {
            setLoading(true)
            const response = await Axios({
                ...SummaryApi.getProductByCategory,
                data: {
                    id: id
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
        fetchCategoryWiseProduct()
    }, [])

    const handleScrollRight = () => {
        containerRef.current.scrollBy({ left: 200, behavior: 'smooth' })
    }

    const handleScrollLeft = () => {
        containerRef.current.scrollBy({ left: -200, behavior: 'smooth' })
    }

    const checkScrollPosition = () => {
        const el = containerRef.current
        if (el) {
            setShowLeftButton(el.scrollLeft > 0)
        }
    }

    useEffect(() => {
        const el = containerRef.current
        if (el) {
            checkScrollPosition()
            el.addEventListener('scroll', checkScrollPosition)
        }

        return () => {
            if (el) {
                el.removeEventListener('scroll', checkScrollPosition)
            }
        }
    }, [])

    const handleRedirectProductListpage = () => {
        const subcategory = subCategoryData.find(sub => {
            return sub.category.some(c => c._id === id)
        })

        const url = `/${valideURLConvert(name)}-${id}/${valideURLConvert(subcategory?.name)}-${subcategory?._id}`
        return url
    }

    const redirectURL = handleRedirectProductListpage()

    return (
        <div>
            <div className='container mx-auto p-6 flex items-center justify-between gap-6'>
    <h3 className='font-bold text-black text-2xl md:text-43l'>{name}</h3>
    <Link to={redirectURL} className='text-green-600 hover:text-green-400 text-1xl md:text-2xl'>See All</Link>
</div>
            <div className='relative flex items-center'>
                {showLeftButton && (
                    <div className='absolute left-2 z-10 hidden lg:flex'>
                        <button onClick={handleScrollLeft} className='bg-white hover:bg-gray-100 shadow-lg text-lg p-2 rounded-full'>
                            <FaAngleLeft />
                        </button>
                    </div>
                )}
                <div
                    ref={containerRef}
                    className='flex gap-4 md:gap-6 lg:gap-5 container mx-auto px-4 overflow-x-scroll scrollbar-none scroll-smooth'
                >
                    {loading &&
                        loadingCardNumber.map((_, index) => (
                            <CardLoading key={"CategorywiseProductDisplay123" + index} />
                        ))
                    }

                    {data.map((p, index) => (
                        <CardProduct
                            data={p}
                            key={p._id + "CategorywiseProductDisplay" + index}
                        />
                    ))}
                </div>
                <div className='absolute right-2 z-10 hidden lg:flex'>
                    <button onClick={handleScrollRight} className='bg-white hover:bg-gray-100 shadow-lg text-lg p-2 rounded-full'>
                        <FaAngleRight />
                    </button>
                </div>
            </div>
        </div>
    )
}

export default CategoryWiseProductDisplay
