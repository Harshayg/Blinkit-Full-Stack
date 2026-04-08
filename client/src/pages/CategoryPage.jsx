import React, { useEffect, useState } from 'react';
import UploadCategoryModel from '../components/UploadCategoryModel';
import Loading from '../components/Loading';
import NoData from '../components/NoData';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import EditCategory from '../components/EditCategory';
import CofirmBox from '../components/CofirmBox';
import toast from 'react-hot-toast';
import AxiosToastError from '../utils/AxiosToastError';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2 } from 'lucide-react';

const CategoryPage = () => {
    const [openUploadCategory, setOpenUploadCategory] = useState(false);
    const [loading, setLoading] = useState(false);
    const [categoryData, setCategoryData] = useState([]);
    const [openEdit, setOpenEdit] = useState(false);
    const [editData, setEditData] = useState({ name: '', image: '' });
    const [openConfimBoxDelete, setOpenConfirmBoxDelete] = useState(false);
    const [deleteCategory, setDeleteCategory] = useState({ _id: '' });
    const allCategory = useSelector(state => state.product.allCategory);

    useEffect(() => {
        setCategoryData(allCategory);
    }, [allCategory]);

    const fetchCategory = async () => {
        try {
            setLoading(true);
            const response = await Axios({ ...SummaryApi.getCategory });
            const { data: responseData } = response;
            if (responseData.success) {
                setCategoryData(responseData.data);
            }
        } catch (error) {
            AxiosToastError(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategory();
    }, []);

    const handleDeleteCategory = async () => {
        try {
            const response = await Axios({
                ...SummaryApi.deleteCategory,
                data: deleteCategory,
            });

            const { data: responseData } = response;
            if (responseData.success) {
                toast.success(responseData.message);
                fetchCategory();
                setOpenConfirmBoxDelete(false);
            }
        } catch (error) {
            AxiosToastError(error);
        }
    };

    return (
        <section className="p-6 min-h-screen bg-white relative overflow-hidden">
            <motion.div
                initial={{ y: -30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="flex items-center justify-between rounded-xl bg-white shadow-xl px-6 py-4 mb-6 border border-gray-200"
            >
                <h2 className="text-2xl font-extrabold tracking-wide text-gray-800">⚙️ Manage Categories</h2>
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setOpenUploadCategory(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-blue-500 text-blue-600 bg-white hover:bg-blue-50 shadow-sm transition"
                >
                    <Plus size={16} /> Add Category
                </motion.button>
            </motion.div>

            {(!categoryData[0] && !loading) && <NoData />}

            <motion.div 
                layout
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6"
            >
                {categoryData.map(category => (
                    <motion.div
                        key={category._id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                        className="rounded-2xl border border-gray-200 bg-white shadow-md p-4 hover:shadow-lg transition-all duration-300"
                    >
                        <motion.div 
                            className="h-36 flex items-center justify-center bg-gray-50 rounded-xl overflow-hidden"
                            whileHover={{ scale: 1.03 }}
                        >
                            <img
                                alt={category.name}
                                src={category.image}
                                className="max-h-full object-contain"
                            />
                        </motion.div>
                        <p className="text-center text-lg font-semibold text-gray-700 mt-3 truncate">{category.name}</p>
                        <div className="flex gap-3 mt-4">
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                className="flex-1 flex items-center justify-center gap-1 bg-green-100 text-green-700 hover:bg-green-200 px-3 py-2 rounded-xl text-sm"
                                onClick={() => {
                                    setOpenEdit(true);
                                    setEditData(category);
                                }}
                            >
                                <Edit2 size={14} /> Edit
                            </motion.button>
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                className="flex-1 flex items-center justify-center gap-1 bg-red-100 text-red-600 hover:bg-red-200 px-3 py-2 rounded-xl text-sm"
                                onClick={() => {
                                    setOpenConfirmBoxDelete(true);
                                    setDeleteCategory(category);
                                }}
                            >
                                <Trash2 size={14} /> Delete
                            </motion.button>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            {loading && <Loading />}

            {openUploadCategory && (
                <UploadCategoryModel fetchData={fetchCategory} close={() => setOpenUploadCategory(false)} />
            )}

            {openEdit && (
                <EditCategory data={editData} close={() => setOpenEdit(false)} fetchData={fetchCategory} />
            )}

            {openConfimBoxDelete && (
                <CofirmBox close={() => setOpenConfirmBoxDelete(false)} cancel={() => setOpenConfirmBoxDelete(false)} confirm={handleDeleteCategory} />
            )}
        </section>
    );
};

export default CategoryPage;
