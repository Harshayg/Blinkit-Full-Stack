import React, { useEffect, useState } from 'react'
import { useGlobalContext } from '../provider/GlobalProvider'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import toast from 'react-hot-toast'
import AxiosToastError from '../utils/AxiosToastError'
import { useSelector } from 'react-redux'
import { FaMinus, FaPlus } from "react-icons/fa6";

const AddToCartButton = ({ data }) => {
    const { fetchCartItem, updateCartItem, deleteCartItem } = useGlobalContext()
    const cartItem = useSelector(state => state.cartItem.cart)

    const [loading, setLoading] = useState(false)
    const [isAvailableCart, setIsAvailableCart] = useState(false)
    const [qty, setQty] = useState(0)
    const [cartItemDetails, setCartItemsDetails] = useState(null)

    const handleAddToCart = async (e) => {
        e.preventDefault()
        e.stopPropagation()

        try {
            setLoading(true)

            const response = await Axios({
                ...SummaryApi.addTocart,
                data: {
                    productId: data?._id
                }
            })

            const { data: responseData } = response

            if (responseData.success) {
                toast.success(responseData.message)
                fetchCartItem?.()
            }
        } catch (error) {
            AxiosToastError(error)
        } finally {
            setLoading(false)
        }
    }

    const increaseQty = async (e) => {
        e.preventDefault()
        e.stopPropagation()

        try {
            await updateCartItem(cartItemDetails?._id, qty + 1)
            fetchCartItem?.()
        } catch (error) {
            AxiosToastError(error)
        }
    }

    const decreaseQty = async (e) => {
        e.preventDefault()
        e.stopPropagation()

        try {
            if (qty === 1) {
                await deleteCartItem(cartItemDetails?._id)
            } else {
                await updateCartItem(cartItemDetails?._id, qty - 1)
            }
            fetchCartItem?.()
        } catch (error) {
            AxiosToastError(error)
        }
    }

    useEffect(() => {
        if (!data || !data._id) return

        const item = cartItem.find(item => item.productId._id === data._id)
        setIsAvailableCart(!!item)
        setQty(item?.quantity || 0)
        setCartItemsDetails(item)
    }, [data, cartItem])

    return (
        <div className='w-full max-w-[150px]'>
            {
                isAvailableCart ? (
                    <div className='flex w-full py-1 rounded bg-gradient-to-r from-green-400 to-green-600 text-white hover:brightness-110 shadow-lg'>
                        <button
                            onClick={decreaseQty}
                            disabled={loading}
                            className='flex-1 w-full text-white p-1 rounded flex items-center justify-center'
                        >
                            <FaMinus />
                        </button>

                        <p className='flex-1 w-full font-semibold px-1 flex items-center text-white justify-center'>
                            {qty}
                        </p>

                        <button
                            onClick={increaseQty}
                            disabled={loading}
                            className='flex-1 w-full text-white p-1 rounded flex items-center justify-center'
                        >
                            <FaPlus />
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={handleAddToCart}
                        disabled={loading}
                        className='bg-green-50 border border-green-700 text-green-700 px-2 lg:px-4 py-1 rounded-lg'
                    >
                        { 'ADD'}
                    </button>
                )
            }
        </div>
    )
}

export default AddToCartButton