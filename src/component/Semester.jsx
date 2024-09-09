import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import AddEvent from './sources/AddEvent';
import { List, Spin, Modal } from 'antd';
import AddSemester from './sources/AddSemester';

const Semester = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const token = localStorage.getItem('authToken');
    const [account, setAccount] = useState([]);
    const [semester, setSemester] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddEvent, setShowAddEvent] = useState(false);
    const [showAddSemes, setShowAddSemes] = useState(false);
    const [refresh, setRefresh] = useState(false);
    const [message, setMessage] = useState('');







    const toggleSidebar = () => {
      setIsSidebarOpen(!isSidebarOpen);
    };
  
    const handleAddEvent = () => {
        setRefresh(!refresh); 
        setShowAddEvent(false); 
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
        navigate('/');
      } catch (error) {
        console.error('Error logging out:', error.response ? error.response.data : error.message);
        setError(error.message);
      }
    };
  
    const handleClickHome = () => {
      navigate('/home');
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


    useEffect(()=>{
      const fetchSemes = async () => {
        try{
          const response = await axios.get('https://dtn-event-api.toiyeuptit.com/api/semesters',
          {
            headers:{
              Authorization: `Bearer ${token}`,
              Accept: 'application/json',
            }
          }
          );
          const dataArray = response.data.data;
          setSemester(dataArray);
        }
        
        catch(error)
        {
          console.error('Error fetching account data:', error.response ? error.response.data : error.message);
        setError(error.message);
        } finally {
          setLoading(false);
        }
      };
      if (token) { 
        fetchSemes();
      } else {
        setError("No token found");
        setLoading(false);
      } 
      return () => {
       
      };
    }, [token]);

      const handleTogglePopup = () => {
            setShowAddEvent(!showAddEvent);
      };
      const handleShowPopupSemes = () => {
        setShowAddSemes(!showAddSemes);
      };
      const handleClickAccount = () => {
        navigate('/account');
      };
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
            <li onClick={handleClickAccount} className={`mb-4 p-2 rounded cursor-pointer ${location.pathname==='/account' ? 'bg-white text-neutral-900 ':'bg-none hover:bg-gray-700'}`}>Tài khoản</li>
            <li onClick={handleClickHome} className={`mb-4 p-2 rounded cursor-pointer ${location.pathname==='/home' ? 'bg-white text-neutral-900':'bg-none hover:bg-gray-700'}`}>Sự kiện</li>
            <li className={`mb-4 p-2 rounded cursor-pointer ${location.pathname==='/semester' ? 'bg-white text-neutral-900 ':'bg-none hover:bg-gray-700'}`}>Học kỳ</li>
            <li className={`mb-4 p-2 rounded cursor-pointer ${location.pathname==='/organization' ? 'bg-white text-neutral-900 ':'bg-none hover:bg-gray-700'}`}>Tổ chức</li>
            </ul>
            <button
            onClick={handleTogglePopup}
            className='bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline'
            >
            Tạo sự kiện
            </button>
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
        <div className='flex-1 p-4 md:ml-64'>
            <div className="flex-1 p-4">
              <h1 className='text-4xl font-bold mb-4'>Học kỳ</h1>
              <button
                        onClick={handleShowPopupSemes}
                        className='bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline'
                    >
                        Tạo học kỳ
                    </button>
                    {showAddSemes && (
                        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
                            <div className='bg-white p-6 rounded-lg shadow-xl max-w-lg w-full relative py-[2rem]'>
                                <h1 className='text-2xl font-bold mb-4 text-center'>Tạo học kỳ mới</h1>
                                <button
                                    onClick={handleShowPopupSemes}
                                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                    </svg>
                                </button>
                                <div className='overflow-auto max-h-[80vh]'>
                                    <AddSemester />
                                </div>
                            </div>
                        </div>
                    )}
              {loading ? (
                <Spin size="large" /> 
              ) : error ? (
                <p>Error: {error}</p> 
              ) : (
                <div className='w-full flex flex-col'>
                <div className='w-full h-[80%]'>
                <List
                  itemLayout="horizontal"
                  dataSource={semester}
                  renderItem={(semesters) => (
                    <List.Item  className=' hover:bg-slate-100 flex'>
                      <List.Item.Meta 
                        //onClick={()=> handleEventClick(semesters.id)}
                        title={semesters.name}
                        description={`Start: ${semesters.start_at} - End: ${semesters.finish_at}`}
                      />  
                      <span className='mx-4 flex gap-2'>
                        <button  className='p-2 bg-green-500 text-white rounded-md z-60'>Sửa</button>
                        <button  className='p-2 bg-red-500 text-white rounded-md z-60'>Xoá</button>
                      
                      </span>
                    </List.Item>
                  
                  )}
                />
                </div>
                </div>
              )}
            </div>
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

        </div>
    </div>
  )
}

export default Semester
