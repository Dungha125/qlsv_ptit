import React, { useState } from 'react';
import axios from 'axios';
import { logologin, backlogin, logodoan } from '../assets'; // Import logo
import { useNavigate } from 'react-router-dom';
import ReCAPTCHA from "react-google-recaptcha";

const Tracuu = () => {

  const key = '6LdGg1kqAAAAACjQRHCtqK71x9-NjCW4qAFCgssh'

  const [username, setUsername] = useState('');
  const [capcharCode, setCapCharCode] = useState(false);
  const [errorMess, setErrorMess] = useState(''); // Hiển thị lỗi
  const navigate = useNavigate();

  function onChange() {
    setCapCharCode(true);
  }




  return (
    <div className='w-full h-[100vh] flex flex-col items-center justify-center gap-4 p-[2rem] relative'>
      <span className='flex flex-row gap-5'>
        <img src={logologin} width={75} height={75} alt="logo ptit" className='mb-[2rem] object-contain' />
        <img src={logodoan} width={90} height={90} alt="logo doan" className='mb-[2rem] object-contain' />
      </span>
      
      <div className='md:w-[500px] w-full h-auto rounded-xl shadow-lg flex flex-col items-center justify-center bg-slate-100 p-4 md:p-12'>
        <h1 className='text-2xl w-full text-center font-bold text-neutral-800'>Tra cứu</h1>
        {errorMess && <p className='text-red-600 text-center mb-4'>{errorMess}</p>}
        
        <form className='w-full'>
          <div className='w-full p-2 gap-4'>
            <label htmlFor="username" className='block mb-2'>Username</label>
            <input 
              type="text" 
              name="username" 
              id="username" 
              className='w-full rounded-md p-2 border border-gray-300' 
              placeholder='Nhập username' 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required 
            />
          </div>


          <ReCAPTCHA
                sitekey={key}
                onChange={onChange}
            />

          <button 
            type='submit'
            className='bg-red-600 w-full px-4 py-2 text-white rounded-md mt-4'>
            Tra cứu
          </button>
        </form>
      </div>

      <img src={backlogin} alt="backlogin" className='absolute object-cover w-screen h-screen opacity-30 -z-[10]' />
    </div>
  );
};

export default Tracuu;
