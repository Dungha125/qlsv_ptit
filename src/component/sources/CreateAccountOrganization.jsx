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
          <input type="text" name="username" placeholder="Username" onChange={handleChange} />
          <input type="email" name="email" placeholder="Email" onChange={handleChange} />
          <input type="password" name="password" placeholder="Password" onChange={handleChange} />
          <input type="text" name="first_name" placeholder="First Name" onChange={handleChange} />
          <input type="text" name="last_name" placeholder="Last Name" onChange={handleChange} />
          <input type="text" name="district" placeholder="District" onChange={handleChange} />
          <input type="text" name="province" placeholder="Province" onChange={handleChange} />
          <input type="number" name="citizen_id" placeholder="Citizen ID" onChange={handleChange} />
          <input type="text" name="address" placeholder="Address" onChange={handleChange} />
          <input type="text" name="phone" placeholder="Phone" onChange={handleChange} />
          <input type="text" name="about" placeholder="About" onChange={handleChange} />
          <input type="text" name="class" placeholder="Class" onChange={handleChange} />
          <input type="text" name="birthday" placeholder="Birthday (YYYY-MM-DD)" onChange={handleChange} />
          <input type="number" name="member_group" placeholder="Member Group" onChange={handleChange} />
          <button type="submit">Tạo Tài Khoản</button>
        </form>
      )}
    </div>
  );
};

export default CreateAccountForm;
