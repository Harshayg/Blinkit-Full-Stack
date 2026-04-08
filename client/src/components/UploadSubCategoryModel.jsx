import React, { useState } from 'react';
import { IoClose } from "react-icons/io5";
import uploadImage from '../utils/UploadImage';
import { useSelector } from 'react-redux';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import toast from 'react-hot-toast';
import AxiosToastError from '../utils/AxiosToastError';

const UploadSubCategoryModel = ({ close, fetchData }) => {
    const [subCategoryData, setSubCategoryData] = useState({
        name: "",
        image: "",
        category: []
    });
    const allCategory = useSelector(state => state.product.allCategory);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSubCategoryData(prev => ({ ...prev, [name]: value }));
    };

    const handleUploadSubCategoryImage = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const response = await uploadImage(file);
        const { data: ImageResponse } = response;

        setSubCategoryData(prev => ({
            ...prev,
            image: ImageResponse.data.url
        }));
    };

    const handleRemoveCategorySelected = (categoryId) => {
        const updatedCategories = subCategoryData.category.filter(cat => cat._id !== categoryId);
        setSubCategoryData(prev => ({
            ...prev,
            category: updatedCategories
        }));
    };

    const handleSubmitSubCategory = async (e) => {
        e.preventDefault();
        try {
            const response = await Axios({
                ...SummaryApi.createSubCategory,
                data: subCategoryData
            });

            const { data: responseData } = response;
            if (responseData.success) {
                toast.success(responseData.message);
                close && close();
                fetchData && fetchData();
            }
        } catch (error) {
            AxiosToastError(error);
        }
    };

    return (
        <section className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-3xl bg-white bg-opacity-90 backdrop-blur-xl p-6 rounded-2xl shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-bold text-gray-800">Add Sub Category</h1>
                    <button onClick={close} className="text-gray-500 hover:text-red-600 transition">
                        <IoClose size={28} />
                    </button>
                </div>
                <form className="grid gap-6" onSubmit={handleSubmitSubCategory}>
                    {/* Name Field */}
                    <div className="grid gap-2">
                        <label htmlFor="name" className="text-sm font-medium text-gray-700">Sub Category Name</label>
                        <input
                            id="name"
                            name="name"
                            value={subCategoryData.name}
                            onChange={handleChange}
                            className="p-3 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-green-500 outline-none transition"
                            placeholder="e.g. Smartwatches"
                        />
                    </div>

                    {/* Image Upload */}
                    <div className="grid gap-2">
                        <p className="text-sm font-medium text-gray-700">Upload Image</p>
                        <div className="flex flex-col lg:flex-row items-center gap-4">
                            <div className="w-full lg:w-36 h-36 bg-gray-100 border border-dashed rounded-xl flex items-center justify-center overflow-hidden">
                                {
                                    !subCategoryData.image ? (
                                        <p className="text-gray-400 text-sm">No Image</p>
                                    ) : (
                                        <img
                                            alt="Uploaded"
                                            src={subCategoryData.image}
                                            className="object-contain w-full h-full"
                                        />
                                    )
                                }
                            </div>
                            <label htmlFor="uploadSubCategoryImage">
                                <div className="px-5 py-2 text-sm border border-green-600 text-green-600 rounded-full hover:bg-green-600 hover:text-white transition cursor-pointer">
                                    Choose Image
                                </div>
                                <input
                                    type="file"
                                    id="uploadSubCategoryImage"
                                    className="hidden"
                                    onChange={handleUploadSubCategoryImage}
                                />
                            </label>
                        </div>
                    </div>

                    {/* Category Selection */}
                    <div className="grid gap-2">
                        <label htmlFor="categorySelect" className="text-sm font-medium text-gray-700">Select Category</label>
                        <div className="border rounded-xl p-2 bg-white space-y-2">
                            <div className="flex flex-wrap gap-2">
                                {
                                    subCategoryData.category.map(cat => (
                                        <span key={cat._id} className="bg-green-100 text-green-800 px-3 py-1 rounded-full flex items-center gap-2 text-sm shadow-sm">
                                            {cat.name}
                                            <IoClose
                                                size={16}
                                                className="cursor-pointer hover:text-red-600 transition"
                                                onClick={() => handleRemoveCategorySelected(cat._id)}
                                            />
                                        </span>
                                    ))
                                }
                            </div>
                            <select
                                id="categorySelect"
                                className="w-full p-2 bg-gray-50 border rounded-lg outline-none focus:ring-2 focus:ring-green-500 transition"
                                onChange={(e) => {
                                    const value = e.target.value;
                                    const categoryDetails = allCategory.find(el => el._id === value);
                                    if (categoryDetails && !subCategoryData.category.find(cat => cat._id === value)) {
                                        setSubCategoryData(prev => ({
                                            ...prev,
                                            category: [...prev.category, categoryDetails]
                                        }));
                                    }
                                }}
                            >
                                <option value="">-- Select a Category --</option>
                                {
                                    allCategory.map(category => (
                                        <option value={category._id} key={category._id}>
                                            {category.name}
                                        </option>
                                    ))
                                }
                            </select>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className={`py-3 text-sm rounded-full font-semibold transition-all duration-300 
                            ${subCategoryData.name && subCategoryData.image && subCategoryData.category.length
                                ? "bg-green-600 text-white hover:shadow-lg"
                                : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}
                        disabled={!(subCategoryData.name && subCategoryData.image && subCategoryData.category.length)}
                    >
                        Add Sub Category
                    </button>
                </form>
            </div>
        </section>
    );
};

export default UploadSubCategoryModel;
