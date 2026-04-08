import React, { useState } from 'react';
import { IoClose } from "react-icons/io5";
import uploadImage from '../utils/UploadImage';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import toast from 'react-hot-toast';
import AxiosToastError from '../utils/AxiosToastError';

const EditCategory = ({ close, fetchData, data: CategoryData }) => {
    const [data, setData] = useState({
        _id: CategoryData._id,
        name: CategoryData.name,
        image: CategoryData.image
    });

    const [loading, setLoading] = useState(false);

    const handleOnChange = (e) => {
        const { name, value } = e.target;
        setData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const response = await Axios({ ...SummaryApi.updateCategory, data });
            const { data: responseData } = response;

            if (responseData.success) {
                toast.success(responseData.message);
                close();
                fetchData();
            }
        } catch (error) {
            AxiosToastError(error);
        } finally {
            setLoading(false);
        }
    };

    const handleUploadCategoryImage = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setLoading(true);
            const response = await uploadImage(file);
            const { data: ImageResponse } = response;

            setData(prev => ({
                ...prev,
                image: ImageResponse.data.url
            }));
        } catch (error) {
            toast.error("Image upload failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className='fixed inset-0 z-50 bg-black/30 backdrop-blur-md flex items-center justify-center p-4'>
            <div className='w-full max-w-2xl bg-white/80 backdrop-blur-2xl border border-gray-200 rounded-3xl shadow-2xl p-6 animate-fadeIn'>
                <div className='flex justify-between items-center mb-6'>
                    <h2 className='text-2xl font-bold text-gray-800 tracking-wide'>✏️ Edit Category</h2>
                    <button
                        onClick={close}
                        className='text-gray-600 hover:text-red-500 transition duration-150 p-2 rounded-full bg-white/60 shadow hover:scale-105'
                        aria-label="Close Modal"
                    >
                        <IoClose size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className='space-y-6'>
                    <div>
                        <label htmlFor='categoryName' className='block text-gray-700 font-medium mb-1'>
                            Category Name
                        </label>
                        <input
                            id='categoryName'
                            name='name'
                            type='text'
                            value={data.name}
                            onChange={handleOnChange}
                            placeholder='Enter category name'
                            className='w-full p-3 rounded-xl bg-white/70 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 transition placeholder:text-gray-400'
                        />
                    </div>

                    <div className='space-y-2'>
                        <label className='block text-gray-700 font-medium'>Category Image</label>
                        <div className='flex flex-col lg:flex-row items-center gap-5'>
                            <div className='h-36 w-full lg:w-36 flex items-center justify-center bg-white/60 border border-dashed border-gray-400 rounded-xl overflow-hidden'>
                                {
                                    data.image ? (
                                        <img src={data.image} alt='category' className='w-full h-full object-contain' />
                                    ) : (
                                        <span className='text-gray-400'>No Image</span>
                                    )
                                }
                            </div>

                            <label htmlFor='uploadCategoryImage' className='cursor-pointer group'>
                                <div className={`
                                    px-5 py-2 rounded-xl border transition duration-200 font-medium
                                    ${!data.name
                                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                        : "bg-gradient-to-r from-green-400 to-green-600 text-white hover:brightness-110 shadow-lg"
                                    }
                                `}>
                                    {loading ? "Uploading..." : "Change Image"}
                                </div>
                                <input
                                    type='file'
                                    id='uploadCategoryImage'
                                    disabled={!data.name}
                                    onChange={handleUploadCategoryImage}
                                    className='hidden'
                                />
                            </label>
                        </div>
                    </div>

                    <button
                        type='submit'
                        disabled={!data.name || !data.image || loading}
                        className={`
                            w-full py-3 rounded-xl text-lg font-semibold transition
                            ${data.name && data.image
                                ? "bg-green-600 text-white hover:bg-green-700 shadow-md"
                                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                            }
                        `}
                    >
                        {loading ? "Updating..." : "Update Category"}
                    </button>
                </form>
            </div>
        </section>
    );
};

export default EditCategory;
