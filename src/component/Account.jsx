import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';

const Account = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [account, setAccount] = useState([]);
  const token = localStorage.getItem('authToken')

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  

  const fetchLogout = async () => {
    try {
      await axios.post('https://dtn-event-api.toiyeuptit.com/api/auth/logout', {}, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });
      localStorage.removeItem('authToken'); 
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Error logging out:', error.response ? error.response.data : error.message);
      setError(error.message);
    }
  };

  const handleClickHome = () => {
    navigate('/home');
  };
  const handleClickSemester = () => {
    navigate('/semester');
  };


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('https://dtn-event-api.toiyeuptit.com/api/auth/profile', {
          headers: { 
            Authorization: `Bearer ${token}`,
            Accept: 'application/json' 
          }
        });
        const dataArray = response.data.data;
        setAccount(dataArray);
      } catch (error) {
        console.error('Error fetching account data:', error.response ? error.response.data : error.message);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) { 
      fetchData();
    } else {
      setError("No token found");
      setLoading(false);
    } 
    return () => {
     
    };
  }, [token]);


  return (
    <div className='w-full h-full flex'>
      <button
        onClick={toggleSidebar}
        className="md:hidden p-4 text-white bg-gray-800 fixed top-0 left-0 z-50"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
        </svg>
      </button>
      <div
        className={`fixed top-0 left-0 w-64 h-screen bg-gray-800 text-white p-4 z-40 transition-transform transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 md:w-64 md:flex md:flex-col`}
      >
        <h2 className="text-xl font-bold mb-6 ml-[3rem] md:ml-0">Menu</h2>
        <ul>
          <li className={`mb-4 p-2 rounded cursor-pointer ${location.pathname==='/account' ? 'bg-white text-neutral-900 ':'bg-none hover:bg-gray-700'}`}>Tài khoản</li>
          <li onClick={handleClickHome} className={`mb-4 p-2 rounded cursor-pointer ${location.pathname==='/home' ? 'bg-white text-neutral-900':'bg-none hover:bg-gray-700'}`}>Sự kiện</li>
          <li onClick={handleClickSemester} className={`mb-4 p-2 rounded cursor-pointer ${location.pathname==='/semester' ? 'bg-white text-neutral-900 ':'bg-none hover:bg-gray-700'}`}>Học kỳ</li>
        </ul>
      
        <div className='w-[90%] h-[52px] rounded-lg bg-slate-100 bottom-4 fixed '>
            {loading ? (
            <p>Loading...</p>
            ) : error ? (
              <p>Error: {error}</p>
            ) : (
            <div className='w-full p-1 flex'>
              <span className='text-neutral-700'>
              <p className='px-4 font-bold truncate'>{account.last_name} {account.first_name}</p>
              <p className='px-4 font-medium text-sm text-neutral-500'>{account.username}</p>
              </span>
              <button onClick={fetchLogout} className='bg-red-500 px-2 rounded-md'>Đăng xuất</button>
            </div>
            )}
        </div>
      </div>

      <div className="flex-1 p-4 md:ml-64">
        <h1 className='text-4xl font-bold m-8'>Thông tin tài khoản</h1>
        {loading ? (
            <p>Loading...</p>
            ) : error ? (
              <p>Error: {error}</p>
            ) : (
        
        <div className='flex flex-col w-full gap-4 mx-8'>
          <span >Họ và tên: {account.last_name} {account.first_name}</span>
          <span >Username: {account.username}</span>
          <span >Email: {account.email}</span>
          <span> Quê quán: {account.citizen_id} </span>
          <span> Giới tính: {account.gender} </span>
          <span> Ngày sinh: {account.birthday} </span>
          <span> Địa chỉ: {account.address} </span>
          <span> Lớp: {account.class} </span>
          <span> Số điện thoại: {account.phone} </span>
        </div>
            )}
      </div>
    </div>
  )
}

export default Account
