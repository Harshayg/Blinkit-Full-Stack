import React, { useEffect, useState, useRef } from 'react';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import { Link, useParams } from 'react-router-dom';
import AxiosToastError from '../utils/AxiosToastError';
import Loading from '../components/Loading';
import CardProduct from '../components/CardProduct';
import { useSelector } from 'react-redux';
import { valideURLConvert } from '../utils/valideURLConvert';
import { motion } from 'framer-motion';
import { ChevronUp, ChevronDown, MoreVertical, X } from 'lucide-react'; // Added MoreVertical and X icons

const ProductListPage = () => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [totalPage, setTotalPage] = useState(1);
  const [initialLoading, setInitialLoading] = useState(true);
  const params = useParams();
  const AllSubCategory = useSelector(state => state.product.allSubCategory);
  const [DisplaySubCategory, setDisplaySubCategory] = useState([]);
  const horizontalScrollRef = useRef(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // State for the dropdown visibility
  const dropdownRef = useRef(null); // Ref for the dropdown menu
  const dropdownButtonRef = useRef(null); // Ref for the dropdown toggle button

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [params]);

  // Simulate initial loading time
  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      // Check if the click is outside the dropdown menu AND outside the dropdown toggle button
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          dropdownButtonRef.current && !dropdownButtonRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef, dropdownButtonRef]); // Added dropdownButtonRef to dependency array


  // Extract category and subcategory info from URL params
  const subCategory = params?.subCategory ? params?.subCategory.split("-") : [];
  // Get subcategory name by removing the ID part
  const subCategoryName = subCategory?.length > 1 ? subCategory?.slice(0, subCategory?.length - 1)?.join(" ") : 'Select Subcategory';
  const categoryId = params?.category ? params.category.split("-").slice(-1)[0] : null;
  const subCategoryId = subCategory?.length ? subCategory?.slice(-1)[0] : null;

  // Fetch product data based on category and subcategory
  const fetchProductdata = async () => {
    try {
      setLoading(true);
      const response = await Axios({
        ...SummaryApi.getProductByCategoryAndSubCategory,
        data: {
          categoryId: categoryId,
          subCategoryId: subCategoryId,
          page: page,
          limit: 8, // Limit products per page
        }
      });
      const { data: responseData } = response;
      if (responseData.success) {
        // Append or replace data based on page number
        if (responseData.page === 1) {
          setData(responseData.data);
        } else {
          setData(prev => [...prev, ...responseData.data]);
        }
        setTotalPage(responseData.totalCount); // Set total product count
      }
    } catch (error) {
      AxiosToastError(error); // Handle API errors
    } finally {
      setLoading(false); // End loading
    }
  };

  // Fetch products when category or subcategory changes
  useEffect(() => {
    if (categoryId && subCategoryId) {
      fetchProductdata();
    }
  }, [categoryId, subCategoryId]);

  // Filter subcategories based on the current category
  useEffect(() => {
    const sub = AllSubCategory.filter(s => {
      // Check if any category in the subcategory matches the current categoryId
      const filterData = s.category.some(el => el._id === categoryId);
      return filterData;
    });
    setDisplaySubCategory(sub); // Set subcategories to display
  }, [params.category, AllSubCategory]);

  // Function to scroll the vertical subcategory sidebar (large screens)
  const scrollVerticalSubcategory = (direction) => {
    const container = document.getElementById("subcategory-scroll-vertical");
    if (container) {
      container.scrollBy({
        top: direction === 'up' ? -100 : 100,
        behavior: 'smooth'
      });
    }
  };

  // Toggle the dropdown visibility
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Close dropdown when a subcategory is selected
  const handleSubcategorySelect = () => {
    setIsDropdownOpen(false);
  };


  // Loading state JSX
  if (initialLoading) {
    return (
      <div className="h-screen w-full bg-white flex flex-col sm:flex-row gap-4 px-4 md:px-6 lg:px-24 py-6 bg-gradient-to-br from-white to-white">
        {/* Sidebar Loading (hidden on small, flex on medium+) */}
        <div className="hidden sm:flex w-[80px] bg-white shadow-md rounded-lg px-2 py-4 h-[82vh] flex-col gap-4 overflow-y-auto scrollbar-hide border border-gray-200 relative sm:ml-0 ml-[-16px]">
          <div className="w-[80px] flex flex-col gap-4 animate-pulse">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-gradient-to-r from-blue-100 to-blue-200 rounded-xl h-20 w-16"
              />
            ))}
          </div>
        </div>

        {/* Small Screen Loading Bar (shown on small, hidden on medium+) */}
        <div className="sm:hidden w-full bg-gradient-to-r from-blue-100 to-blue-200 rounded-xl h-12 mb-4 animate-pulse"></div>

        {/* Card Grid Loading */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 flex-1">
          {Array.from({ length: 10 }).map((_, idx) => (
            <div
              key={idx}
              className="border py-3 px-4 lg:p-6 grid gap-2 lg:gap-4 min-w-40 lg:min-w-56 rounded-2xl shadow-lg cursor-pointer bg-white animate-pulse transition-all duration-300"
            >
              <div className="min-h-28 bg-gradient-to-r from-blue-100 to-blue-200 rounded-xl" />
              <div className="h-4 w-24 bg-gradient-to-r from-blue-100 to-blue-200 rounded-md" />
              <div className="h-4 w-36 bg-gradient-to-r from-blue-100 to-blue-200 rounded-md" />
              <div className="h-4 w-16 bg-gradient-to-r from-blue-100 to-blue-200 rounded-md" />
              <div className="flex items-center justify-between gap-4">
                <div className="h-4 w-20 bg-gradient-to-r from-blue-100 to-blue-200 rounded-md" />
                <div className="h-4 w-20 bg-gradient-to-r from-blue-100 to-blue-200 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }


  // Main component JSX
  return (
    <section className="bg-white px-4 md:px-6 lg:px-24 py-6">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Subcategory Sidebar (hidden on small, flex on medium+) */}
        <div className="hidden sm:flex w-[80px] bg-white shadow-md rounded-lg px-2 py-4 h-[82vh] flex-col gap-4 overflow-y-auto scrollbar-hide border border-gray-200 relative sm:ml-0 ml-[-16px]">
          {/* Scroll Up Button */}
          <button
            className="flex items-center justify-center absolute top-1 left-1/2 transform -translate-x-1/2 bg-white p-1 rounded-full shadow-md z-10"
            onClick={() => scrollVerticalSubcategory('up')}
          >
            <ChevronUp size={28} />
          </button>

          {/* Subcategory List (scrollable) */}
          <div id="subcategory-scroll-vertical" className="flex flex-col gap-4 overflow-y-auto scrollbar-hide py-6">
            {DisplaySubCategory.map((s) => {
              const link = `/${valideURLConvert(s?.category[0]?.name)}-${s?.category[0]?._id}/${valideURLConvert(s.name)}-${s._id}`;
              const isActive = subCategoryId === s._id;
              return (
                <motion.div
                  key={s._id}
                  whileHover={{ y: -4 }}
                  className="min-w-[60px]"
                >
                  <Link
                    to={link}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl w-full transition-all duration-300 ${
                      isActive ? 'bg-[#ebf5eb] border-2 border-green-500 shadow-md' : 'hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    {/* Subcategory Image */}
                    <img
                      src={s.image}
                      alt={s.name}
                      className="w-8 h-12 object-contain mb-1"
                    />
                    {/* Subcategory Name */}
                    <p className="text-[10px] text-center font-medium text-gray-800 leading-tight truncate w-full">
                      {s.name}
                    </p>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {/* Scroll Down Button */}
          <button
            className="flex items-center justify-center absolute bottom-1 left-1/2 transform -translate-x-1/2 bg-white p-1 rounded-full shadow-md z-10"
            onClick={() => scrollVerticalSubcategory('down')}
          >
            <ChevronDown size={28} />
          </button>
        </div>

        {/* Product Grid Area */}
        <div className="flex-1">
           {/* Full Width Subcategory Title Bar (hidden on small, shown on medium+) */}
           {subCategoryName && (
              <div className="hidden sm:block w-full bg-green-100 text-green-800 text-lg font-semibold px-6 py-3 rounded-xl shadow-inner border border-green-300 mb-6 text-center">
               {subCategoryName}
              </div>
            )}

          {/* Small Screen Horizontal Subcategory Bar with Integrated Dropdown Toggle (shown on small, hidden on medium+) */}
          <div className="sm:hidden relative mb-6 z-20 flex items-center"> {/* Added flex items-center */}
             {/* Dropdown Toggle Button (Three-dot menu icon) */}
             <button
              ref={dropdownButtonRef} // Attach ref to the button
              className="flex-shrink-0 bg-gray-200 text-gray-700 p-2 rounded-md shadow-md focus:outline-none mr-3" // Added margin-right
              onClick={toggleDropdown}
              aria-label="Toggle Subcategory Menu"
            >
              {isDropdownOpen ? <X size={24} /> : <MoreVertical size={24} />}
            </button>

            {/* Horizontal Subcategory Bar */}
            <div
              ref={horizontalScrollRef} // Attach ref for scrolling
              className="flex gap-3 overflow-x-auto scrollbar-hide py-2 flex-grow" // Added flex-grow
            >
              {DisplaySubCategory.map((s) => {
                const link = `/${valideURLConvert(s?.category[0]?.name)}-${s?.category[0]?._id}/${valideURLConvert(s.name)}-${s._id}`;
                const isActive = subCategoryId === s._id;
                return (
                  <Link
                    key={s._id}
                    to={link}
                    className={`flex-shrink-0 px-4 py-2 rounded-full border transition-colors duration-200 text-sm font-medium ${
                      isActive ? 'bg-green-500 text-white border-green-500 shadow-md' : 'bg-gray-200 text-gray-700 border-gray-300 hover:bg-gray-300'
                    }`}
                    onClick={handleSubcategorySelect} // Close dropdown if open when clicking a subcategory link
                  >
                    {s.name}
                  </Link>
                );
              })}
            </div>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <motion.div
                ref={dropdownRef} // Attach ref to the dropdown
                initial={{ opacity: 0, y: 10 }} // Adjusted initial animation slightly
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }} // Adjusted exit animation slightly
                transition={{ duration: 0.2 }}
                // Positioned absolutely relative to the parent flex container
                className="absolute top-full left-0 mt-2 w-60 bg-white shadow-lg rounded-lg border border-gray-200 max-h-60 overflow-y-auto z-30" // Adjusted width and positioning
              >
                <div className="p-2">
                  {DisplaySubCategory.map((s) => {
                    const link = `/${valideURLConvert(s?.category[0]?.name)}-${s?.category[0]?._id}/${valideURLConvert(s.name)}-${s._id}`;
                    const isActive = subCategoryId === s._id;
                    return (
                      <Link
                        key={s._id}
                        to={link}
                        className={`flex items-center px-3 py-2 text-gray-800 hover:bg-gray-100 transition-colors duration-200 rounded-md ${isActive ? 'bg-green-50 font-semibold' : ''}`}
                        onClick={handleSubcategorySelect} // Close dropdown on click
                      >
                         {/* Subcategory Image in Dropdown */}
                        <img
                          src={s.image}
                          alt={s.name}
                          className="w-6 h-6 object-contain mr-2"
                        />
                        {/* Subcategory Name in Dropdown */}
                        <span className="flex-1 truncate text-sm">{s.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </div>


          {/* Product Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {data.map((p) => (
              <motion.div
                key={p._id}
                className="rounded-xl transition duration-200 w-full flex"
                whileHover={{ scale: 1.02 }}
              >
                <div className="w-full h-full">
                  <CardProduct data={p} />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Loading spinner at the bottom */}
          {loading && <div className="mt-6"><Loading /></div>}
        </div>
      </div>
    </section>
  );
};

export default ProductListPage;
