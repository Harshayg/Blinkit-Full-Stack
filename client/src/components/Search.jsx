import React, { useEffect, useState } from 'react';
import { IoSearch } from "react-icons/io5";
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaArrowLeft } from "react-icons/fa";
import useMobile from '../hooks/useMobile';

const scrollingTexts = [
    'Search "milk"',
    'Search "bread"',
    'Search "sugar"',
    'Search "paneer"',
    'Search "chocolate"',
    'Search "curd"',
    'Search "rice"',
    'Search "egg"',
    'Search "chips"'
];

// Sample suggestions data - This array is now empty as requested
const allSuggestions = [];

const Search = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isSearchPage, setIsSearchPage] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [currentTextIndex, setCurrentTextIndex] = useState(0);
    const [filteredSuggestions, setFilteredSuggestions] = useState([]); // State for filtered suggestions
    const isMobile = useMobile();

    useEffect(() => {
        // Check if the current path is the search page
        setIsSearchPage(location.pathname === "/search");
        // Extract the search query from the URL if present
        const queryParams = new URLSearchParams(location.search);
        setSearchText(queryParams.get("q") || "");
    }, [location]);

    useEffect(() => {
        // Effect for the scrolling placeholder text animation
        const interval = setInterval(() => {
            setCurrentTextIndex(prev => (prev + 1) % scrollingTexts.length);
        }, 2000);

        return () => clearInterval(interval); // Cleanup interval on component unmount
    }, []);

    // Effect to filter suggestions whenever searchText changes on the search page
    useEffect(() => {
        if (isSearchPage && searchText.length > 0) {
            // Filter suggestions based on the current search text
            // This will now always result in an empty array since allSuggestions is empty
            const filtered = allSuggestions.filter(suggestion =>
                suggestion.toLowerCase().includes(searchText.toLowerCase())
            );
            setFilteredSuggestions(filtered);
        } else {
            // Clear suggestions if search text is empty or not on search page
            setFilteredSuggestions([]);
        }
    }, [searchText, isSearchPage]); // Depend on searchText and isSearchPage

    // Function to redirect to the search page when the placeholder is clicked
    const redirectToSearchPage = () => {
        navigate("/search");
    };

    // Handler for input change
    const handleOnChange = (e) => {
        const value = e.target.value;
        setSearchText(value);
        // Only update the URL if we are on the search page to keep the query parameter in sync
        if (isSearchPage) {
            const url = `/search?q=${encodeURIComponent(value)}`;
            navigate(url, { replace: true }); // Use replace to avoid adding to history stack for every key stroke
        }
    };

    // Function to handle clicking on a suggestion
    const handleSuggestionClick = (suggestion) => {
        setSearchText(suggestion); // Set the input text to the clicked suggestion
        setFilteredSuggestions([]); // Clear suggestions after clicking
        // Navigate to the search results page with the selected suggestion as query parameter
        const url = `/search?q=${encodeURIComponent(suggestion)}`;
        navigate(url);
    };

    return (
        // Main container div with relative positioning for the absolute dropdown
        <div className='relative w-full min-w-[300px] lg:min-w-[420px] h-11 lg:h-12 rounded-xl border overflow-visible flex items-center text-neutral-500 bg-slate-50 group focus-within:border-gray-300'>
            {/* Left section: Search icon or Back arrow */}
            <div>
                {isMobile && isSearchPage ? (
                    // Back arrow on mobile search page
                    <Link to="/" className='flex justify-center items-center h-full p-2 m-1'>
                        <FaArrowLeft size={20} />
                    </Link>
                ) : (
                    // Search icon otherwise
                    <button className='flex justify-center items-center h-full p-3' type="button">
                        <IoSearch size={22} />
                    </button>
                )}
            </div>
            {/* Middle section: Input or Scrolling Placeholder */}
            <div className='w-full h-full overflow-hidden relative'>
                {!isSearchPage ? (
                    // Scrolling placeholder text when not on search page
                    <div onClick={redirectToSearchPage} className='w-full h-full flex items-center cursor-text px-2'>
                        <div className='relative h-full w-full flex items-center justify-start'>
                            <div className='absolute top-0 left-0 right-0 bottom-0 overflow-hidden flex items-center'>
                                <div className='w-full h-full relative flex items-center justify-start'>
                                    {scrollingTexts.map((text, index) => (
                                        <div
                                            key={index}
                                            className={`absolute left-2 w-full text-neutral-400 whitespace-nowrap transition-transform duration-[2000ms] ease-in-out ${index === currentTextIndex ? 'animate-slide-up-center' : 'opacity-0'}`}
                                        >
                                            {text}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    // Input field when on search page
                    <input
                        type='text'
                        placeholder='Search for atta, dal, and more.'
                        autoFocus // Automatically focus the input on search page
                        value={searchText}
                        className='bg-transparent w-full h-full outline-none px-2'
                        onChange={handleOnChange} // Handle input changes to filter suggestions
                    />
                )}
            </div>

            {/* Suggestions Dropdown - Appears only on search page and if there are filtered suggestions */}
            {/* This section will now not display any suggestions as allSuggestions is empty */}
            {isSearchPage && filteredSuggestions.length > 0 && (
                <div className='absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-b-xl shadow-lg z-10 mt-1'>
                    <ul className='py-1'>
                        {filteredSuggestions.map((suggestion, index) => (
                            <li
                                key={index}
                                className='px-4 py-2 cursor-pointer hover:bg-gray-100 text-neutral-700'
                                onClick={() => handleSuggestionClick(suggestion)} // Handle click on a suggestion
                            >
                                {suggestion}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* CSS for the scrolling text animation */}
            <style jsx>{`
                @keyframes slide-up-center {
                    0% {
                        transform: translateY(100%);
                        opacity: 0;
                    }
                    40% {
                        transform: translateY(0%);
                        opacity: 1;
                    }
                    60% {
                        transform: translateY(0%);
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(-100%);
                        opacity: 0;
                    }
                }

                .animate-slide-up-center {
                    animation: slide-up-center 2s ease-in-out forwards;
                }
            `}</style>
        </div>
    );
};

export default Search;
