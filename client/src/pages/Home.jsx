import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { valideURLConvert } from "../utils/valideURLConvert";
import { useNavigate } from "react-router-dom";
import CategoryWiseProductDisplay from "../components/CategoryWiseProductDisplay";
import toast from "react-hot-toast";

const Home = () => {
  const [isLoading, setIsLoading] = useState(true);
  const loadingCategory = useSelector((state) => state.product.loadingCategory);
  const categoryData = useSelector((state) => state.product.allCategory);
  const subCategoryData = useSelector((state) => state.product.allSubCategory);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  const handleRedirectProductListpage = (id, cat) => {
    const subcategory = subCategoryData.find((sub) =>
      sub.category.some((c) => c._id === id)
    );

    if (!subcategory) {
      toast.error("Subcategory not found");
      return;
    }

    const url = `/${valideURLConvert(cat)}-${id}/${valideURLConvert(
      subcategory.name
    )}-${subcategory._id}`;

    navigate(url);
  };

  const handleBannerClick = () => {
    const category = categoryData.find(
      (cat) => cat.name.toLowerCase() === "paan corner"
    );

    if (!category) {
      toast.error("Category not found");
      return;
    }

    handleRedirectProductListpage(category._id, category.name);
  };

  return (
    <section className="bg-white py-4 lg:px-32">
      <div className="container mx-auto">

        {/* Banner Placeholder */}
        <div
          className="w-full min-h-48 bg-blue-100 rounded-xl cursor-pointer flex items-center justify-center text-xl font-semibold"
          onClick={handleBannerClick}
        >
          {isLoading ? "Loading Banner..." : "Banner Section"}
        </div>

        {/* Cards Placeholder */}
        <div className="p-4 flex gap-4">
          {isLoading ? (
            <>
              <div className="h-48 w-1/3 bg-gray-300 rounded-xl animate-pulse"/>
              <div className="h-48 w-1/3 bg-gray-300 rounded-xl animate-pulse"/>
              <div className="h-48 w-1/3 bg-gray-300 rounded-xl animate-pulse"/>
            </>
          ) : (
            <>
              <div className="h-48 w-1/3 bg-blue-200 rounded-xl flex items-center justify-center">
                Pharma
              </div>
              <div className="h-48 w-1/3 bg-green-200 rounded-xl flex items-center justify-center">
                Petcare
              </div>
              <div className="h-48 w-1/3 bg-pink-200 rounded-xl flex items-center justify-center">
                Babycare
              </div>
            </>
          )}
        </div>
      </div>

      {/* Categories */}
      <div className="container mx-auto px-4 my-2 grid grid-cols-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-10 gap-4">
        {isLoading || loadingCategory ? (
          new Array(12).fill(null).map((_, index) => (
            <div key={index} className="bg-white rounded p-4 min-h-36 grid gap-2 shadow animate-pulse">
              <div className="h-24 w-full bg-gray-300 rounded"/>
              <div className="h-8 w-full bg-gray-300 rounded"/>
            </div>
          ))
        ) : (
          categoryData.map((cat) => (
            <div
              key={cat._id}
              className="w-full h-full cursor-pointer bg-gray-100 rounded flex items-center justify-center text-sm text-center p-2"
              onClick={() => handleRedirectProductListpage(cat._id, cat.name)}
            >
              {cat.name}
            </div>
          ))
        )}
      </div>

      {/* Category Wise Products */}
      {!isLoading && categoryData?.slice(0, 6).map((c) => (
        <CategoryWiseProductDisplay
          key={c?._id}
          id={c?._id}
          name={c?.name}
        />
      ))}
    </section>
  );
};

export default Home;