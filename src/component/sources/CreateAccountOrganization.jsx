import React, { useEffect, useState } from 'react';
import axios from 'axios';

const CreateAccountForm = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    status: '0',
    first_name: '',
    last_name: '',
    district: '',
    province: '',
    citizen_id: '',
    address: '',
    phone: '',
    about: '',
    class: '',
    gender: '0',
    sudo: '0',
    member_group: '',
    birthday: ''
  });
  const token = localStorage.getItem('authToken');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isMemberGroup6, setIsMemberGroup6] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
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
      const response = await axios.post('https://dtn-event-api.toiyeuptit.com/api/users', formData, {
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
            <span>Username</span>
            <input className='p-2 bg-slate-200' type="text" name="username" placeholder="Username" onChange={handleChange} />
          </div>
          <div className='mb-4 w-full flex flex-col'>
            <span>Email</span>
            <input className='p-2 bg-slate-200' type="email" name="email" placeholder="Email" onChange={handleChange} />
          </div>
          <div className='mb-4 w-full flex flex-col'>
            <span>Password</span>
            <input className='p-2 bg-slate-200' type="password" name="password" placeholder="Password" onChange={handleChange} />
          </div>
          <div className='mb-4 w-full flex flex-col'>
            <span>First Name</span>
            <input className='p-2 bg-slate-200' type="text" name="first_name" placeholder="First Name" onChange={handleChange} />
          </div>
          <div className='mb-4 w-full flex flex-col'>
            <span>Last Name</span>
            <input className='p-2 bg-slate-200' type="text" name="last_name" placeholder="Last Name" onChange={handleChange} />
          </div>
          <div className='mb-4 w-full flex flex-col'>
            <span>District</span>
            <input className='p-2 bg-slate-200' type="text" name="district" placeholder="District" onChange={handleChange} />
          </div>
          <div className='mb-4 w-full flex flex-col'>
            <span>Province</span>
            <input className='p-2 bg-slate-200' type="text" name="province" placeholder="Province" onChange={handleChange} />
          </div>
          <div className='mb-4 w-full flex flex-col'>
            <span>Citizen ID</span>
            <input className='p-2 bg-slate-200' type="number" name="citizen_id" placeholder="Citizen ID" onChange={handleChange} />
          </div>
          <div className='mb-4 w-full flex flex-col'>
            <span>Address</span>
            <input className='p-2 bg-slate-200' type="text" name="address" placeholder="Address" onChange={handleChange} />
          </div>
          <div className='mb-4 w-full flex flex-col'>
            <span>Phone</span>
            <input className='p-2 bg-slate-200' type="text" name="phone" placeholder="Phone" onChange={handleChange} />
          </div>
          <div className='mb-4 w-full flex flex-col'>
            <span>About</span>
            <input className='p-2 bg-slate-200' type="text" name="about" placeholder="About" onChange={handleChange} />
          </div>
          <div className='mb-4 w-full flex flex-col'>
            <span>Class</span>
            <input className='p-2 bg-slate-200' type="text" name="class" placeholder="Class" onChange={handleChange} />
          </div>
          <div className='mb-4 w-full flex flex-col'>
            <span>Birthday</span>
            <input className='p-2 bg-slate-200' type="text" name="birthday" placeholder="Birthday (YYYY-MM-DD)" onChange={handleChange} />
          </div>
          <div className='mb-4 w-full flex flex-col'>
            <span>Member Group</span>
            <input className='p-2 bg-slate-200' type="number" name="member_group" placeholder="Member Group" onChange={handleChange} />
          </div>
          <button className='bg-red-500 hover:bg-red-700 rounded-md p-2 text-white font-bold' type="submit">Tạo Tài Khoản</button>
        </form>
      )}
    </div>
  );
};

export default CreateAccountForm;
