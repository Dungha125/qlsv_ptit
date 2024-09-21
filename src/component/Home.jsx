import React, {  useEffect, useState } from 'react';
import AddEvent from './sources/AddEvent.jsx';
import ListEvent from './sources/ListEvent.jsx';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import CreateAccountForm from './sources/CreateAccountOrganization.jsx';

const Home = () => {
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [account, setAccount] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem('authToken')

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleTogglePopup = () => {
    setShowAddEvent(!showAddEvent);
  };

  const handleCreatePopup = () => {
    setShowCreateAccount(!showCreateAccount);
  };
  const handleCreateEvent = () => {
    setRefresh(!refresh);
    setShowCreateAccount(false);
  }
  const handleAddEvent = () => {
    setRefresh(!refresh); 
    setShowAddEvent(false); 
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

  const handleClickAccount = () => {
    navigate('/account');
  };
  const handleClickSemester = () => {
    navigate('/semester');
  };

  
  return (
    <div className='w-full h-full flex'>
      <button
        onClick={toggleSidebar}
        className={`md:hidden p-4 md:text-white md:bg-gray-800 ${isSidebarOpen ? "text-white bg-transparent":"bg-transparent text-gray-800"} fixed top-0 left-0 z-50`}
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
          <li onClick={handleClickAccount} className={`mb-4 p-2 rounded cursor-pointer ${location.pathname==='/account' ? 'bg-white text-neutral-900 ':'bg-none hover:bg-gray-700'}`}>Tài khoản</li>
          <li className={`mb-4 p-2 rounded cursor-pointer ${location.pathname==='/home' ? 'bg-white text-neutral-900':'bg-none hover:bg-gray-700'}`}>Sự kiện</li>
          <li onClick={handleClickSemester} className={`mb-4 p-2 rounded cursor-pointer ${location.pathname==='/semester' ? 'bg-white text-neutral-900 ':'bg-none hover:bg-gray-700'}`}>Học kỳ</li>
        </ul>
        <button
          onClick={handleTogglePopup}
          className='bg-red-500 hover:bg-red-700 text-white font-bold w-full py-2 my-2 px-4 rounded focus:outline-none focus:shadow-outline'
        >
          Tạo sự kiện
        </button>
        <button
          onClick={handleCreatePopup}
          className='bg-red-500 hover:bg-red-700 text-white font-bold w-full py-2 my-2 px-4 rounded focus:outline-none focus:shadow-outline'
        >
          Tạo tài khoản
        </button>
        <div className='w-[90%] h-[52px] rounded-lg bg-slate-100 bottom-4 fixed justify-center items-center'>
            {loading ? (
            <p>Loading...</p>
            ) : error ? (
              <p>Error: {error}</p>
            ) : (
            <div className='w-full p-1 flex'>
              <span className='text-neutral-700 max-w-[60%]'>
                <p className='px-4 font-bold truncate'>{account.last_name} {account.first_name}</p>
                <p className='px-4 font-medium text-sm text-neutral-500'>{account.username}</p>
              </span>
              <button onClick={fetchLogout} className='bg-red-500 px-2 rounded-md'>Đăng xuất</button>
            </div>
            )}
        </div>
      </div>
        
      
    
      <div className="flex-1 p-4 md:ml-64">
        
        <ListEvent key={refresh}/>
        {showAddEvent && (
          <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white p-6 rounded-lg shadow-xl max-w-lg w-full relative py-[2rem]'>
            <h1 className='text-2xl font-bold mb-4 text-center'>Tạo sự kiện mới</h1>
            
            <button
              onClick={handleTogglePopup}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
         
            <div className='overflow-auto max-h-[80vh]'>
              <AddEvent  onAddEvent={handleAddEvent} />
            </div>
          </div>
        </div>
        )}
        {
  showCreateAccount && (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white p-6 rounded-lg shadow-xl max-w-lg w-full relative py-[2rem]'>
        <h1 className='text-2xl font-bold mb-4 text-center'>Tạo tài khoản mới</h1>
        
        <button
          onClick={handleCreatePopup} // Chỉnh sửa để gọi hàm đúng
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors duration-200"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      
        <div className='overflow-auto max-h-[80vh]'>
          <CreateAccountForm onAddEvent={handleCreateEvent} /> {/* Đảm bảo truyền tham số đúng */}
        </div>
      </div>
    </div>
  )
}
        
      </div>
    </div>
  );
};

export default Home;
