import React, { useEffect, useState, useRef } from 'react';
import logo from '../assets/logo.png';
import Search from './Search';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaRegCircleUser } from "react-icons/fa6";
import useMobile from '../hooks/useMobile';
import { LiaShoppingCartSolid } from "react-icons/lia";
import { useSelector } from 'react-redux';
import { GoTriangleDown, GoTriangleUp } from "react-icons/go";
import UserMenu from './UserMenu';
import { DisplayPriceInRupees } from '../utils/DisplayPriceInRupees';
import DisplayCartItem from './DisplayCartItem';
import { IoArrowBackOutline } from "react-icons/io5";
import { CiSearch } from "react-icons/ci";

const Header = () => {
    const [isMobile] = useMobile();
    const location = useLocation();
    const isSearchPage = location.pathname === "/search";
    const isHomePage = location.pathname === "/";
    const navigate = useNavigate();
    const user = useSelector((state) => state?.user);
    const [openUserMenu, setOpenUserMenu] = useState(false);
    const cartItem = useSelector(state => state.cartItem.cart);
    const [totalPrice, setTotalPrice] = useState(0);
    const [totalQty, setTotalQty] = useState(0);
    const [openCartSection, setOpenCartSection] = useState(false);
    const [locationData, setLocationData] = useState({ city: '', pincode: '', area: '' });
    const menuRef = useRef(null);

    const redirectToLoginPage = () => navigate("/login");

    const handleMobileUser = () => {
        if (!user._id) return navigate("/login");
        navigate("/user");
    };

    const handleLogoClick = () => {
        navigate('/');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCartClick = () => {
        if (cartItem.length > 0) setOpenCartSection(true);
    };

    const handleBackClick = () => navigate(-1);
    const handleMobileSearchClick = () => navigate('/search');

    useEffect(() => {
        const qty = cartItem.reduce((p, c) => p + c.quantity, 0);
        const tPrice = cartItem.reduce((p, c) => p + (c.productId.price * c.quantity), 0);
        setTotalQty(qty);
        setTotalPrice(tPrice);
    }, [cartItem]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setOpenUserMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        fetchLocation();
    }, []);

    const fetchLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
                    const data = await response.json();
                    const address = data?.address || {};
                    setLocationData({
                        city: address.city || address.town || '',
                        pincode: address.postcode || '',
                        area: address.suburb || address.neighbourhood || ''
                    });
                } catch (error) {
                    console.error("Failed to get location:", error);
                }
            });
        }
    };

    const headerHeightClass = isMobile ? (isHomePage ? 'h-24' : 'h-16') : 'h-20';

    return (
        <header className={`lg:px-5 lg:shadow-sm sticky top-0 z-40 flex flex-col justify-center gap-1 bg-white ${headerHeightClass}`}>
            <div className='container mx-auto flex items-center px-2 justify-between relative z-50'>
                <div className='h-full'>
                    <button onClick={handleLogoClick} className='h-full flex justify-center items-center'>
                        <img src={logo} width={120} height={50} alt='logo' className='hidden lg:block' />
                        {isMobile && isHomePage && <img src={logo} width={110} height={50} alt='logo' className='lg:hidden' />}
                    </button>
                </div>

                {/* Address Location Section */}
                <div className='hidden lg:flex flex-col justify-center ml-5 text-sm'>
                    <p className='font-bold text-lg'>Delivery in 16 minutes</p>
                    <div className='flex items-center gap-1 text-gray-700'>
                        <span>{`${locationData?.area} ${locationData?.city} ${locationData?.pincode}`}</span>
                    </div>
                </div>

                <div className={`hidden lg:block rounded-xl transition-all duration-700 ${isSearchPage ? 'w-[calc(100%-450px)]' : 'w-[600px]'}`}>
                    <Search />
                </div>

                <div>
                    {isMobile && isHomePage && (
                        <button className='text-gray-900 lg:hidden' onClick={handleMobileUser}>
                            <FaRegCircleUser size={30} />
                        </button>
                    )}
                    <div className='hidden lg:flex items-center gap-10'>
                        {!isSearchPage && user?._id ? (
                            <div className='relative' ref={menuRef}>
                                <div onClick={() => setOpenUserMenu(prev => !prev)} className='flex text-xl select-none items-center gap-1 cursor-pointer'>
                                    <p>Account</p>
                                    {openUserMenu ? <GoTriangleUp size={25} /> : <GoTriangleDown size={25} />}
                                </div>
                                {openUserMenu && (
                                    <>
                                        <div className="fixed inset-x-0 top-[80px] bottom-0 bg-black bg-opacity-40 z-30"></div>
                                        <div className='absolute right-0 top-12 z-40'>
                                            <div className='bg-white rounded-b-2xl p-4 min-w-64 lg:shadow-lg'>
                                                <UserMenu close={() => setOpenUserMenu(false)} />
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : !isSearchPage && (
                            <button onClick={redirectToLoginPage} className='text-lg px-2'>Login</button>
                        )}
                        <button
                            onClick={handleCartClick}
                            className={`flex items-center gap-2 px-3 py-2 rounded-xl font-semibold text-sm transition-all duration-300 ${cartItem.length > 0 ? 'bg-green-700 text-white cursor-pointer' : 'bg-gray-300 text-white cursor-not-allowed'}`}
                            disabled={cartItem.length === 0}
                        >
                            <LiaShoppingCartSolid size={36} />
                            <div>
                                {cartItem.length > 0 ? (
                                    <>
                                        <p>{totalQty} Items</p>
                                        <p>{DisplayPriceInRupees(totalPrice)}</p>
                                    </>
                                ) : <p>My Cart</p>}
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            {isMobile && (
                <div className='container mx-auto px-2 flex items-center justify-between'>
                    {isHomePage ? (
                        <div className='w-full'>
                            <Search />
                        </div>
                    ) : isSearchPage ? (
                        <div className='flex items-center gap-2 w-full'>
                            <div className='flex-grow'>
                                <Search />
                            </div>
                        </div>
                    ) : (
                        <div className='flex items-center justify-between w-full'>
                            <button onClick={handleBackClick} className='text-gray-900'>
                                <IoArrowBackOutline size={30} />
                            </button>
                            <button onClick={handleLogoClick} className='h-full flex justify-center items-center mx-2'>
                                <img src={logo} width={110} height={50} alt='logo' className='lg:hidden' />
                            </button>
                            <div className="flex items-center gap-4">
                                <button onClick={handleMobileSearchClick} className='text-gray-900'>
                                    <CiSearch size={30} />
                                </button>
                                <button className='text-gray-900' onClick={handleMobileUser}>
                                    <FaRegCircleUser size={30} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {openCartSection && (
                <DisplayCartItem close={() => setOpenCartSection(false)} />
            )}
        </header>
    );
};

export default Header;
