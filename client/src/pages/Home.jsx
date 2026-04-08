import React, { useState, useEffect } from "react";
import banner from "../assets/banner.jpg";
import bannerMobile from "../assets/banner-mobile.jpg";
import { useSelector } from "react-redux";
import { valideURLConvert } from "../utils/valideURLConvert";
import { useNavigate } from "react-router-dom";
import CategoryWiseProductDisplay from "../components/CategoryWiseProductDisplay";
import pharmacy from "../assets/pharmacy.jpg";
import Petcare from "../assets/PetCare.jpg";
import babycare from "../assets/babycare.jpg";
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
      toast.error("Paan Corner category not found");
      return;
    }

    handleRedirectProductListpage(category._id, category.name);
  };

  const handleBannerGroupClick = (categoryKeyword) => {
    const targetCategory = categoryData.find((cat) =>
      cat.name.toLowerCase().includes(categoryKeyword.toLowerCase())
    );

    if (!targetCategory) {
      toast.error(`Category "${categoryKeyword}" not found`);
      return;
    }

    handleRedirectProductListpage(targetCategory._id, targetCategory.name);
  };

  return (
    <section className="bg-white py-1 lg:px-32">
      <div className="container mx-auto">
        <div
          className={`w-full h-full min-h-48 bg-blue-100 rounded-xl cursor-pointer ${
            !banner && "animate-pulse my-2"
          }`}
          onClick={handleBannerClick}
        >
          {isLoading ? (
            <div className="w-full h-full bg-gray-300 rounded-xl animate-pulse"/>
          ) : (
            <>
              <img
                src={banner}
                className="w-full h-full hidden lg:block"
                alt="banner"
              />
              <img
                src={bannerMobile}
                className="w-full h-full lg:hidden"
                alt="banner"
              />
            </>
          )}
        </div>

        <div className="p-4 flex gap-4">
          {isLoading ? (
            <>
              <div className="h-48 w-1/3 hidden lg:block bg-gray-300 rounded-xl animate-pulse"/>
              <div className="h-48 w-1/3 hidden lg:block bg-gray-300 rounded-xl animate-pulse"/>
              <div className="h-48 w-1/3 hidden lg:block bg-gray-300 rounded-xl animate-pulse"/>
            </>
          ) : (
            <>
              <div
                className="h-48 hidden lg:block cursor-pointer "
                onClick={() => handleBannerGroupClick("Pharma & Wellness")}
              >
                <img src={pharmacy} className="h-full rounded shadow" alt="pharmacy" />
              </div>
              <div
                className="h-48 hidden lg:block cursor-pointer "
                onClick={() => handleBannerGroupClick("pet")}
              >
                <img src={Petcare} className="h-full rounded shadow" alt="petcare" />
              </div>
              <div
                className="h-48 hidden lg:block cursor-pointer "
                onClick={() => handleBannerGroupClick("baby")}
              >
                <img src={babycare} className="h-full rounded shadow" alt="babycare" />
              </div>
            </>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 my-2 grid grid-cols-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-10 gap-4">
        {isLoading || loadingCategory ? (
          new Array(12).fill(null).map((_, index) => (
            <div key={index + "loadingcategory"} className="bg-white rounded p-4 min-h-36 grid gap-2 shadow animate-pulse">
              <div className="h-24 w-full rounded bg-gray-300 animate-pulse"/>
              <div className="h-8 w-full rounded bg-gray-300 animate-pulse"/>
            </div>
          ))
        ) : (
          categoryData.map((cat) => (
            <div
              key={cat._id + "displayCategory"}
              className="w-full h-full cursor-pointer"
              onClick={() => handleRedirectProductListpage(cat._id, cat.name)}
            >
              <img
                src={cat.image}
                className="w-full h-24 sm:h-32 lg:h-44 object-contain"
                alt={cat.name}
              />
            </div>
          ))
        )}
      </div>

      {!isLoading && categoryData?.slice(0, 6).map((c) => (
        <CategoryWiseProductDisplay
          key={c?._id + "CategorywiseProduct"}
          id={c?._id}
          name={c?.name}
        />
      ))}
    </section>
  );
};

export default Home;
