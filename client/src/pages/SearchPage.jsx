import React, { useEffect, useState } from 'react';
import SummaryApi from '../common/SummaryApi';
import Axios from '../utils/Axios';
import AxiosToastError from '../utils/AxiosToastError';
import CardProduct from '../components/CardProduct';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useLocation } from 'react-router-dom';
import noDataImage from '../assets/nothing here yet.webp';

const SearchPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialDelay, setInitialDelay] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const params = useLocation();
  const searchText = params?.search?.slice(3);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await Axios({
        ...SummaryApi.searchProduct,
        data: {
          search: searchText,
          page: page,
        },
      });

      const { data: responseData } = response;

      if (responseData.success) {
        if (responseData.page === 1) {
          setData(responseData.data);
        } else {
          setData((prev) => [...prev, ...responseData.data]);
        }
        setTotalPage(responseData.totalPage);
      }
    } catch (error) {
      AxiosToastError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [searchText]);

  useEffect(() => {
    const delay = setTimeout(() => {
      setInitialDelay(false);
      fetchData();
    }, 1000);

    return () => clearTimeout(delay);
  }, [page, searchText]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleFetchMore = () => {
    if (totalPage > page) {
      setPage((prev) => prev + 1);
    }
  };

  return (
    <section className="min-h-screen bg-gradient-to-br lg:px-28 from-white to-gray-100 py-8">
      <div className="container mx-auto px-4 overflow-x-hidden">
        {initialDelay ? (
          <div className="flex justify-center items-center h-96">
            <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <InfiniteScroll
            dataLength={data.length}
            hasMore={page < totalPage}
            next={handleFetchMore}
            loader={<div className="text-center py-4 text-gray-500">Loading more...</div>}
          >
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-6 gap-6 overflow-x-hidden">
              {data.map((p, index) => (
                <CardProduct data={p} key={p?._id + 'searchProduct' + index} />
              ))}

              {loading && page === 1 &&
                Array(12).fill(null).map((_, index) => (
                  <div className="border py-3 px-4 lg:p-6 grid gap-2 lg:gap-4 min-w-40 lg:min-w-56 rounded-2xl shadow-lg cursor-pointer bg-white animate-pulse transition-all duration-300">
      <div className="min-h-28 bg-gradient-to-r from-blue-100 to-blue-200 rounded-xl" />

      <div className="h-4 w-24 bg-gradient-to-r from-blue-100 to-blue-200 rounded-md" />
      <div className="h-4 w-36 bg-gradient-to-r from-blue-100 to-blue-200 rounded-md" />
      <div className="h-4 w-16 bg-gradient-to-r from-blue-100 to-blue-200 rounded-md" />

      <div className="flex items-center justify-between gap-4">
        <div className="h-4 w-20 bg-gradient-to-r from-blue-100 to-blue-200 rounded-md" />
        <div className="h-4 w-20 bg-gradient-to-r from-blue-100 to-blue-200 rounded-md" />
      </div>
    </div>
                ))
              }
            </div>
          </InfiniteScroll>
        )}

        {!data[0] && !loading && !initialDelay && (
          <div className="flex flex-col justify-center items-center w-full mt-16">
            <img
              src={noDataImage}
              alt="No data"
              className="w-full max-w-xs h-auto opacity-80"
            />
            <p className="text-lg font-medium text-gray-600 mt-4">No results found</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default SearchPage;
