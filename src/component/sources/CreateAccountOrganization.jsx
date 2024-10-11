import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Descriptions } from 'antd';

const CreateAccountForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    about: '',
    description: '',
    parent_id: 1,
  });
  const token = localStorage.getItem('authToken');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isMemberGroup6, setIsMemberGroup6] = useState(false);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
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
        if (dataArray.member_group === 6) {
          setIsMemberGroup6(true);
        } else {
          setError('Bạn không có quyền tạo tài khoản.');
        }
      } catch (error) {
        console.error('Error fetching account data:', error.response ? error.response.data : error.message);
        setError(error.message);
      }
    };

    if (token) { 
      fetchData();
    } else {
      setError("No token found");
    } 
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isMemberGroup6) return; // Ngăn không cho gửi form nếu không phải member group 6

    try {
      const response = await axios.post(`${API_BASE_URL}/organizations`, formData, {
        headers: {
           Authorization: `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      if (response.status === 200) {
        setSuccess('Tạo tài khoản thành công!');
        setError('');
      }
    } catch (err) {
      setError('Đã xảy ra lỗi khi tạo tài khoản.');
      setSuccess('');
    }
  };

  return (
    <div>
      
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
      {isMemberGroup6 && (
        <form className='gap-4 flex flex-col' onSubmit={handleSubmit}>
          <div className='mb-4 w-full flex flex-col'>
            <span>Name</span>
            <input className='p-2 bg-slate-200' type="text" name="name" placeholder="Name" onChange={handleChange} />
          </div>
          <div className='mb-4 w-full flex flex-col'>
            <span>Code</span>
            <input className='p-2 bg-slate-200' type="text" name="code" placeholder="Code" onChange={handleChange} />
          </div>
          <div className='mb-4 w-full flex flex-col'>
            <span>About</span>
            <input className='p-2 bg-slate-200' type="text" name="about" placeholder="about" onChange={handleChange} />
          </div>
          <div className='mb-4 w-full flex flex-col'>
            <span>Description</span>
            <input className='p-2 bg-slate-200' type="text" name="description" placeholder="Description" onChange={handleChange} />
          </div>
          <button className='bg-red-500 hover:bg-red-700 rounded-md p-2 text-white font-bold' type="submit">Tạo tổ chức</button>
        </form>
      )}
    </div>
  );
};

export default CreateAccountForm;
