import React, { useState } from 'react'; // Import useState
import { useSelector } from "react-redux";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';
import { PiThreadsLogoBold } from "react-icons/pi"; // Threads icon
import Google from '../assets/Googleplay.webp'
import App from '../assets/AppStore.webp'
import toast from 'react-hot-toast'; // Assuming you have react-hot-toast for notifications
import Divider from './Divider';

const Footer = () => {
  const categoryData = useSelector((state) => state.product.allCategory);
  const subCategoryData = useSelector((state) => state.product.allSubCategory);

  // State to manage the toggle for the small screen footer content
  const [isSmallScreenExpanded, setIsSmallScreenExpanded] = useState(false);

  // Function to toggle the small screen content
  const toggleSmallScreenExpand = () => {
    setIsSmallScreenExpanded(!isSmallScreenExpanded);
  };

  // Assuming handleRedirectProductListpage is defined elsewhere and available in scope
  const handleRedirectProductListpage = (categoryId, categoryName) => {
    // Your redirect logic here
    console.log(`Redirecting to product list for category: ${categoryName} (ID: ${categoryId})`);
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
    <>
      {/* Large Screen Footer (hidden on small screens) */}
      <footer className="bg-white hidden lg:flex py-19 pt-16"> {/* Reduced height from py-6 to py-4 */}
        <div className="container mx-auto max-w-7xl px-6">
          {/* Top Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4"> {/* Reduced gap */}
            {/* Useful Links */}
            <div>
              <h3 className="font-semibold text-lg text-black mb-1">Useful Links</h3> {/* Reduced margin */}
              <div className="grid grid-cols-3 text-gray-400 gap-1 text-sm">
                {[
                  { text: "About", url: "https://blinkit.com/aboutus" },
                  { text: "Careers", url: "https://blinkit.com/careers" },
                  { text: "Blog", url: "https://blinkit.com/blog" },
                  { text: "Press", url: "https://blinkit.com/press" },
                  { text: "Lead", url: "#" },
                  { text: "Value", url: "#" },
                  { text: "Privacy", url: "https://blinkit.com/privacy" },
                  { text: "Terms", url: "https://blinkit.com/terms" },
                  { text: "FAQs", url: "https://blinkit.com/faq" },
                  { text: "Security", url: "https://blinkit.com/security" },
                  { text: "Mobile", url: "#" },
                  { text: "Contact", url: "#" },
                  { text: "Partner", url: "https://blinkit.com/partner" },
                  { text: "Franchise", url: "https://blinkit.com/franchise" },
                  { text: "Seller", url: "https://seller.blinkit.com" },
                  { text: "Warehouse", url: "https://blinkit.com/warehouse-partner" },
                  { text: "Deliver", url: "#" },
                  { text: "Resources", url: "#" },
                ].map(({ text, url }) => (
                  <a
                    key={text}
                    href={url}
                    target={text === "About" ? "_blank" : undefined}
                    rel={text === "About" ? "noopener noreferrer" : undefined}
                    className="block hover:text-black"
                  >
                    {text}
                  </a>
                ))}
              </div>

            </div>

            {/* Categories */}
            <div>
              <h3 className="font-semibold text-lg text-black mb-1">
                Categories <a href="#" className="text-green-600 text-sm">see all</a>
              </h3>
              <div className="grid grid-cols-3 text-gray-400  gap-x-60 gap-y-2 text-sm">
                {[
                  "Vegetables & Fruits", "Cold Drinks & Juices", "Bakery & Biscuits",
                  "Dry Fruits, Masala ", "Paan Corner", "Pharma & Wellness",
                  "Ice Creams", "Beauty & Cosmetics", "Stationery Needs",
                  "Print Store", "Dairy & Breakfast", "Instant & Frozen Food", "Sweet Tooth",
                  "Sauces & Spreads", "Organic & Premium", "Cleaning Essentials",
                  "Personal Care", "Fashion & Accessories", "Books", "E-Gift Cards",
                  "Munchies", "Tea,Coffee & Health", "Atta, Rice & Dal",
                  "Chicken, Meat & Fish", "Baby Care", "Home & Office", "Pet Care",
                  "Electronics&Electricals", "Toys & Games"
                ].map((category) => (
                  <a key={category} href="#" className="block hover:text-black whitespace-nowrap">{category}</a>
                ))}
              </div>

            </div>
          </div>

          {/* Bottom Section */}
          <div className="mt-4 border-t pt-2 flex flex-col md:flex-row justify-between items-center text-sm">
            <p>© Blink Commerce Private Limited, 2016-2025</p>
            <div className="p-4 flex gap-4 items-center ">
              <p className='font-bold text-center'>Download App</p>
              <a href="https://apps.apple.com/in/app/blinkit-grocery-in-10-minutes/id960335206" target="_blank" rel="noopener noreferrer">
                <img src={App} className="h-8 rounded shadow" alt="App" />
              </a>
              <a href="https://play.google.com/store/apps/details?id=com.grofers.customerapp&hl=en_IN&gl=US&pli=1" target="_blank" rel="noopener noreferrer">
                <img src={Google} className=" h-8 rounded shadow" alt="Google" />
              </a>
            </div>


            {/* Social Media Icons */}
            <div className="flex gap-3 text-3xl"> {/* Reduced gap and icon size */}
              <a href="https://www.facebook.com/blinkit.india/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600"><FaFacebook /></a>
              <a href="https://x.com/letsblinkit/" target="_blank" rel="noopener noreferrer" className="hover:text-black"><FaTwitter /></a>
              <a href="https://www.instagram.com/letsblinkit/" target="_blank" rel="noopener noreferrer" className="hover:text-pink-500"><FaInstagram /></a>
              <a href="https://in.linkedin.com/company/letsblinkit" target="_blank" rel="noopener noreferrer" className="hover:text-blue-500"><FaLinkedin /></a>
              <a href="https://www.threads.net/@letsblinkit" target="_blank" rel="noopener noreferrer" className="hover:text-black"><PiThreadsLogoBold /></a>
            </div>
          </div>

          {/* Legal Notice */}
          <p className="text-base text-gray-500 mt-2 text-center py-8 leading-tight">
            “Blinkit” is owned & managed by "Blink Commerce Private Limited" and is not related, linked, or interconnected in whatsoever manner or nature, to “GROFFR.COM” which is a real estate services business operated by “Redstone Consultancy Services Private Limited”.
          </p>
        </div>
      </footer>

      {/* Small Screen Footer (hidden on large screens) */}
      <footer className="bg-white lg:hidden py-6">
        <div className="container mx-auto px-6 flex flex-col items-center justify-center">
          <p className="text-gray-300 text-5xl font-bold">India's last minute app ❤️</p>
        </div>
        <Divider />
        <p className="text-gray-300 text-xl p-6 mt-1">blinkit</p>
        <Divider />

        {/* Toggle Button for Small Screen */}
        <div
          className="text-black text-xl pl-6 mt-1 flex justify-between items-center cursor-pointer"
          onClick={toggleSmallScreenExpand} // Add onClick handler
        >
          <div className="flex justify-between items-center pr-4 w-full">
            <span>India's last minute app - blinkit</span>
            <span>{isSmallScreenExpanded ? '-' : '+'}</span>
          </div>

        </div>
        <Divider />

        {/* Collapsible Content for Small Screen */}
        {isSmallScreenExpanded && ( // Conditionally render based on state
          <div className="container mx-auto px-6 mt-4">
            {/* Useful Links (adapted for small screen) */}
            <div>
              <h3 className="font-semibold text-lg text-black mb-2">Useful Links</h3>
              <div className="grid grid-cols-2 text-gray-400 gap-2 text-sm"> {/* Adjusted grid for small screen */}
                {[
                  { text: "About", url: "https://blinkit.com/aboutus" },
                  { text: "Careers", url: "https://blinkit.com/careers" },
                  { text: "Blog", url: "https://blinkit.com/blog" },
                  { text: "Press", url: "https://blinkit.com/press" },
                  { text: "Lead", url: "#" },
                  { text: "Value", url: "#" },
                  { text: "Privacy", url: "https://blinkit.com/privacy" },
                  { text: "Terms", url: "https://blinkit.com/terms" },
                  { text: "FAQs", url: "https://blinkit.com/faq" },
                  { text: "Security", url: "https://blinkit.com/security" },
                  { text: "Mobile", url: "#" },
                  { text: "Contact", url: "#" },
                  { text: "Partner", url: "https://blinkit.com/partner" },
                  { text: "Franchise", url: "https://blinkit.com/franchise" },
                  { text: "Seller", url: "https://seller.blinkit.com" },
                  { text: "Warehouse", url: "https://blinkit.com/warehouse-partner" },
                  { text: "Deliver", url: "#" },
                  { text: "Resources", url: "#" },
                ].map(({ text, url }) => (
                  <a
                    key={text}
                    href={url}
                    target={text === "About" ? "_blank" : undefined}
                    rel={text === "About" ? "noopener noreferrer" : undefined}
                    className="block hover:text-black"
                  >
                    {text}
                  </a>
                ))}
              </div>
            </div>

            {/* Categories (adapted for small screen) */}
            <div className="mt-6"> {/* Added margin top */}
              <h3 className="font-semibold text-lg text-black mb-2">
                Categories <a href="#" className="text-green-600 text-sm">see all</a>
              </h3>
              <div className="grid grid-cols-2 text-gray-400 gap-2 text-sm"> {/* Adjusted grid for small screen */}
                {[
                  "Vegetables & Fruits", "Cold Drinks & Juices", "Bakery & Biscuits",
                  "Dry Fruits, Masala ", "Paan Corner", "Pharma & Wellness",
                  "Ice Creams", "Beauty & Cosmetics", "Stationery Needs",
                  "Print Store", "Dairy & Breakfast", "Instant & Frozen Food", "Sweet Tooth",
                  "Sauces & Spreads", "Organic & Premium", "Cleaning Essentials",
                  "Personal Care", "Fashion & Accessories", "Books", "E-Gift Cards",
                  "Munchies", "Tea,Coffee & Health", "Atta, Rice & Dal",
                  "Chicken, Meat & Fish", "Baby Care", "Home & Office", "Pet Care",
                  "Electronics&Electricals", "Toys & Games"
                ].map((category) => (
                  <a key={category} href="#" className="block hover:text-black">{category}</a>
                ))}
              </div>
            </div>

            {/* Download App and Social Media Icons (adapted for small screen) */}
            <div className="mt-6 border-t pt-4 flex flex-col items-center text-sm"> {/* Added margin top and border/padding */}
              <p className='font-bold text-center mb-4'>Download App</p> {/* Added margin bottom */}
              <div className="flex gap-4 items-center mb-6"> {/* Added margin bottom */}
                <a href="https://apps.apple.com/in/app/blinkit-grocery-in-10-minutes/id960335206" target="_blank" rel="noopener noreferrer">
                  <img src={App} className="h-8 rounded shadow" alt="App" />
                </a>
                <a href="https://play.google.com/store/apps/details?id=com.grofers.customerapp&hl=en_IN&gl=US&pli=1" target="_blank" rel="noopener noreferrer">
                  <img src={Google} className=" h-8 rounded shadow" alt="Google" />
                </a>
              </div>

              {/* Social Media Icons */}
              <div className="flex gap-4 text-3xl"> {/* Adjusted gap */}
                <a href="https://www.facebook.com/blinkit.india/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600"><FaFacebook /></a>
                <a href="https://x.com/letsblinkit/" target="_blank" rel="noopener noreferrer" className="hover:text-black"><FaTwitter /></a>
                <a href="https://www.instagram.com/letsblinkit/" target="_blank" rel="noopener noreferrer" className="hover:text-pink-500"><FaInstagram /></a>
                <a href="https://in.linkedin.com/company/letsblinkit" target="_blank" rel="noopener noreferrer" className="hover:text-blue-500"><FaLinkedin /></a>
                <a href="https://www.threads.net/@letsblinkit" target="_blank" rel="noopener noreferrer" className="hover:text-black"><PiThreadsLogoBold /></a>
              </div>
              <p className="text-xs text-gray-500 mt-4 text-center px-6 py-4 leading-tight"> {/* Adjusted text size and padding */}
                “Blinkit” is owned & managed by "Blink Commerce Private Limited" and is not related, linked, or interconnected in whatsoever manner or nature, to “GROFFR.COM” which is a real estate services business operated by “Redstone Consultancy Services Private Limited”.
              </p>
            </div>
          </div>
        )}
      </footer>
    </>
  );
};

export default Footer;
