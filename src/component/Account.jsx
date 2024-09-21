import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';

const Account = () => {

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [account, setAccount] = useState([]);
  const token = localStorage.getItem('authToken')




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
      <Sidebar />

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
