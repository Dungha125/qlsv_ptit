import React, { useState } from 'react';
import axios from 'axios';
import { logologin, backlogin, logodoan } from '../assets'; // Import logo
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMess, setErrorMess] = useState(''); // Hiển thị lỗi
  const navigate = useNavigate();
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  const submitForm = async (e) => {
    e.preventDefault();
    const trimmedPassword = password.replace(/\s+/g, ''); // Loại bỏ khoảng trắng
    if (trimmedPassword.length < 5) {
      setErrorMess('Password must be at least 5 characters long (excluding spaces)');
      return;
    }
    await fetchApiLogin(); // Gọi API nếu hợp lệ
  };

  const fetchApiLogin = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/login`,
        { username, password }
      );

      if (response.data){
        const token = response.data.access_token;
        const AuthId = response.data.user.id;
        localStorage.setItem('authToken', token);  // Lưu token
        localStorage.setItem('authID', AuthId);
        navigate('/quanly/home');
      } else {
        setErrorMess('Lỗi xác thực');
      }
    } catch (error) {
      console.error('Lỗi đăng nhập:', error);
      setErrorMess('Đăng nhập thất bại. Vui lòng thử lại!');
    }
  };

  return (
    <div className='w-full h-[100vh] flex flex-col items-center justify-center gap-4 p-[2rem] relative'>
          <div className='w-full bottom-0 right-0 absolute text-center text-xs mb-2'>
      <span>Copyright@2025 Ver:2025.02.04 Đoàn thanh niên Học viện</span>
      <br></br>
      <span>Created by Liên chi Đoàn Khoa CNTT1-PTIT</span>
    </div>
      <span className='flex flex-row gap-5'>
        <img src={logologin} width={50} height={50} alt="logo ptit" className='mb-[2rem] object-contain' />
        <img src={logodoan} width={60} height={60} alt="logo doan" className='mb-[2rem] object-contain' />
      </span>
      
      <div className='md:w-[500px] w-full h-auto rounded-xl shadow-lg flex flex-col items-center justify-center bg-slate-100 p-4 md:p-12'>
      <h1 className='text-[#333333] text-xl font-bold mt-4 w-full text-center'>ĐĂNG NHẬP</h1>
        {errorMess && <p className='text-red-600 text-center mb-4'>{errorMess}</p>}
        
        <form onSubmit={submitForm} className='w-full'>
          <div className='w-full p-2 gap-4'>
            <label htmlFor="username" className='block mb-2'>Username</label>
            <input 
              type="text" 
              name="username" 
              id="username" 
              className='w-full rounded-md p-2 border border-gray-300' 
              placeholder='Nhập mã sinh viên' 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required 
            />
          </div>

          <div className='w-full p-2 gap-4'>
            <label htmlFor="password" className='block mb-2'>Password</label>
            <input
              type="password" 
              name="password" 
              id="password" 
              className='w-full rounded-md p-2 border border-gray-300' 
              placeholder='Nhập password' 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          <button 
            type='submit'
            className='bg-blue-600 w-full px-4 py-2 text-white rounded-md mt-4'>
            Đăng nhập
          </button>
        </form>
      </div>
    <img src={backlogin} alt="Tra cứu thông tin" className='object-cover absolute -z-50 h-screen w-full' />
    </div>
  );
};

export default Login;
