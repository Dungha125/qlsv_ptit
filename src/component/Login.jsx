import React, { useState } from 'react';
import axios from 'axios';
import { logologin, backlogin, logodoan } from '../assets';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMess, setErrorMess] = useState('');
  const navigate = useNavigate();

  const submitForm = async (e) => {
    e.preventDefault();
    await fetchApiLogin();
    const trimmedPassword = password.replace(/\s+/g, ''); 
    if (trimmedPassword.length < 5) {
      setErrorMess('Password must be at least 5 characters long (excluding spaces)');
      return;
    }
  };

  const fetchApiLogin = async () => {
    try {
      const response = await axios.post(
        'https://dtn-event-api.toiyeuptit.com/api/auth/login',
        {
          username,
          password,
        }
      );
      
      if (response.data) {
        console.log('Login successful:', response.data);
        localStorage.setItem('authToken', response.data.access_token);
        navigate('/home');
      } else {
        setErrorMess('Invalid credentials');
      }
    } catch (error) {
      console.error('Login failed:', error);
      setErrorMess('Login failed. Please try again.');
    }
  };

  return (
    <div className='w-full h-[100vh] flex flex-col items-center justify-center gap-4 p-[2rem]'>
      <span className='flex flex-row gap-5'>
      <img src={logologin} width={75} height={75} alt="logoptit" className='mb-[2rem] object-contain' />
      <img src={logodoan} width={90} height={90} alt="logodoan" className='mb-[2rem] object-contain' />
      </span>
      <div className='md:w-[500px] w-full h-auto rounded-xl shadow-lg flex flex-col items-center justify-center bg-slate-100 p-4 md:p-12'>
        <h1 className='text-2xl w-full text-center font-bold text-neutral-800'>Đăng nhập</h1>
        {errorMess && <p className='text-red-600'>{errorMess}</p>}
        <form onSubmit={submitForm} className='w-full'>
          <div className='w-full p-2 gap-4'>
            <h3>Username</h3>
            <input 
              type="text" 
              name="username" 
              id="username" 
              className='w-full rounded-md p-2' 
              placeholder='username' 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required 
            />
          </div>
          <div className='w-full p-2 gap-4'>
            <h3>Password</h3>
            <input
              type="password" 
              name="password" 
              id="password" 
              className='w-full rounded-md p-2' 
              placeholder='password' 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          <button 
            type='submit'
            className='bg-red-600 px-4 py-2 text-white rounded-md m-4'>
            Đăng nhập
          </button>
        </form>
      </div>
      <img src={backlogin} alt="backlogin" className='absolute object-cover w-screen h-screen opacity-30 -z-[10]' />
    </div>
  );
}

export default Login;
