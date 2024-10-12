import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Papa from 'papaparse'; // Use this for CSV parsing
import * as XLSX from 'xlsx'; // Use this for Excel parsing
import { AppConfigContext } from 'antd/es/app/context';

const Account = () => {
  const [refresh, setRefresh] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [account, setAccount] = useState([]);
  const token = localStorage.getItem('authToken');
  const [showUploadPopup, setShowUploadPopup] = useState(false);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const[oldPassword, setOldPassword] = useState('');
  const[newPassword, setNewPassword] = useState('');

  const toggleUploadPopup = () => {
    setShowUploadPopup(!showUploadPopup);
  };





  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/auth/profile`, {
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





  // Submit mapped data to API
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        `${API_BASE_URL}/users/change_password`,
        { 
          old: oldPassword,
          password: newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        }
      );
      setRefresh((prev) => !prev);
      toggleUploadPopup(); // Close the popup after success
    } catch (error) {
      console.error('Error uploading data:', error.response ? error.response.data : error.message);
    }
  };
  return (
    <div className='w-full h-full flex'>
      <Sidebar setRefresh={setRefresh} />

      <div className="flex-1 p-4 md:ml-64">
        <h1 className='text-4xl font-bold m-8'>Thông tin tài khoản</h1>
        {loading ? (
            <p>Loading...</p>
            ) : error ? (
              <p>Error: {error}</p>
            ) : (
        <>
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
        </>)
      }
        <button onClick={toggleUploadPopup} className='px-2 py-2 bg-blue-500 hover:bg-blue-700 m-8 rounded-md text-white font-bold'>
          Đổi mật khẩu
        </button>
        
        {showUploadPopup && (
          <form onSubmit={handleSubmit} className='max-w-[500px] mx-8 bg-slate-100 p-4 rounded-md'>
            <div className='mb-4'>
              <label>Mật khẩu cũ</label>
              <input type="text"
              value={oldPassword}
              onChange={(e)=>setOldPassword(e.target.value)}
              className='w-full p-2 border-slate-200'
              placeholder='Nhập mật khẩu cũ' />
            </div>
            <div className='mb-4'>
              <label>Mật khẩu mới</label>
              <input type="text"
              value={newPassword}
              onChange={(e)=>setNewPassword(e.target.value)}
              className='w-full p-2 border-slate-200'
              placeholder='Nhập mật khẩu mới' />
            </div>
            <button type='submit'
            className='bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline'>Xác nhận</button>
          </form>
        )}</div>
    </div>
        
  )
}

export default Account
