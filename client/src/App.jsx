import { Outlet, useLocation } from 'react-router-dom'
import './App.css'
import Header from './components/Header'
import Footer from './components/Footer'
import toast, { Toaster } from 'react-hot-toast';
import fetchUserDetails from './utils/fetchUserDetails';
import { useEffect } from 'react';
import { setUserDetails } from './store/userSlice';
import { setAllCategory,setAllSubCategory } from './store/productSlice';
import { useDispatch } from 'react-redux';
import Axios from './utils/Axios';
import SummaryApi from './common/SummaryApi';
import { handleAddItemCart } from './store/cartProduct';
import GlobalProvider from './provider/GlobalProvider';
import CartMobileLink from './components/CartMobile';

function App() {
  const dispatch = useDispatch()
  const location = useLocation()

  const fetchUser = async()=>{
    const userData = await fetchUserDetails()
    dispatch(setUserDetails(userData.data))
}

const fetchCategory = async()=>{
  try {
      const response = await Axios({
          ...SummaryApi.getCategory
      })
      const { data : responseData } = response

      if(responseData.success){
         dispatch(setAllCategory(responseData.data))
      }
  } catch (error) {
      
  }finally{
  }
}

const fetchSubCategory = async()=>{
  try {
      const response = await Axios({
          ...SummaryApi.getSubCategory
      })
      const { data : responseData } = response

      if(responseData.success){
         dispatch(setAllSubCategory(responseData.data.sort((a, b) => a.name.localeCompare(b.name)))) 
      }
  } catch (error) {
      
  }finally{
  }
}



  useEffect(()=>{
    fetchUser()
    fetchCategory()
    fetchSubCategory()
   //fetchCartItem()
  },[])

  return (
    <GlobalProvider>
        <Header/>
        <main className='min-h-[78vh]'>
            <Outlet/>
        </main>
        <Footer/>
        <Toaster/>
        {
        location.pathname !== '/checkout' && (
          <CartMobileLink/>
        )
      }
    </GlobalProvider>
  )
}

export default App
