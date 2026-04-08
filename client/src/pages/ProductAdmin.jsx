import React, { useEffect, useState } from 'react';
import SummaryApi from '../common/SummaryApi';
import AxiosToastError from '../utils/AxiosToastError';
import Axios from '../utils/Axios';
import Loading from '../components/Loading';
import ProductCardAdmin from '../components/ProductCardAdmin';
import { IoSearchOutline } from "react-icons/io5";

const ProductAdmin = () => {
  const [productData, setProductData] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [totalPageCount, setTotalPageCount] = useState(1);
  const [search, setSearch] = useState('');

  const fetchProductData = async () => {
    try {
      setLoading(true);
      const response = await Axios({
        ...SummaryApi.getProduct,
        data: {
          page: page,
          limit: 12,
          search: search,
        },
      });

      const { data: responseData } = response;

      if (responseData.success) {
        setTotalPageCount(responseData.totalNoPage);
        setProductData(responseData.data);
      }
    } catch (error) {
      AxiosToastError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductData();
  }, [page]);

  const handleNext = () => {
    if (page !== totalPageCount) {
      setPage(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (page > 1) {
      setPage(prev => prev - 1);
    }
  };

  const handleOnChange = (e) => {
    const { value } = e.target;
    setSearch(value);
    setPage(1);
  };

  useEffect(() => {
    let flag = true;
    const interval = setTimeout(() => {
      if (flag) {
        fetchProductData();
        flag = false;
      }
    }, 300);

    return () => clearTimeout(interval);
  }, [search]);

  return (
    <section className="p-4">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur-md shadow-lg rounded-2xl p-4 flex items-center justify-between flex-wrap gap-4 mb-6">
        <h2 className="text-xl font-bold text-gray-800">🛍️ Product Categories</h2>
        <div className="flex items-center gap-3 w-full sm:w-auto bg-blue-100 px-4 py-2 rounded-full shadow-inner focus-within:ring-2 ring-green-400">
          <IoSearchOutline size={22} className="text-gray-500" />
          <input
            type="text"
            placeholder="Search product here..."
            className="bg-transparent outline-none w-full text-sm placeholder:text-gray-500"
            value={search}
            onChange={handleOnChange}
          />
        </div>
      </div>

      {/* Loading State */}
      {loading && <Loading />}

      {/* Product Grid */}
      <div className="bg-gradient-to-tr from-blue-50 to-white rounded-xl p-6 shadow-inner min-h-[60vh]">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {productData.map((p, index) => (
            <ProductCardAdmin key={index} data={p} fetchProductData={fetchProductData} />
          ))}
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-6">
        <button
          onClick={handlePrevious}
          className="px-5 py-2 rounded-full bg-white text-green-700 border border-green-600 shadow hover:bg-green-100 transition-all"
        >
          ⬅️ Previous
        </button>
        <div className="text-center text-sm px-6 py-2 rounded-full bg-gray-100 shadow-inner font-medium">
          Page {page} of {totalPageCount}
        </div>
        <button
          onClick={handleNext}
          className="px-5 py-2 rounded-full bg-white text-green-700 border border-green-600 shadow hover:bg-green-100 transition-all"
        >
          Next ➡️
        </button>
      </div>
    </section>
  );
};

export default ProductAdmin;
