import React, { useState } from 'react';
import axios from 'axios';
import { logologin, backlogin, logodoan } from '../assets'; 
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { List, Spin } from 'antd';
import TopUser from './sources/TopUser';

const TracuuForm = () => {
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [name, setName] = useState(""); 
  const [errorMess, setErrorMess] = useState(''); 
  const [error, setError] = useState(null); 
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState([]); // Lưu các sự kiện người dùng đã tham gia
  const [user, setUser] = useState(null); // Lưu thông tin người dùng mới nhất
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMess('');
    setEvents([]); // Clear previous results
    setUser(null); // Clear previous user info

    if (!executeRecaptcha) {
      setErrorMess('ReCAPTCHA has not been loaded');
      setLoading(false);
      return;
    }

    try {
      const recaptchaToken = await executeRecaptcha('submit');

      const response = await axios.post(`${API_BASE_URL}/retrieve`, {
        username: name,
        s: null, // Optional search query, can be modified based on user input
        with_trashed: true,
        only_trashed: false, // Change this if you want to retrieve only trashed events
        per_page: "10",
        page: 1,
        "g-recaptcha-response": recaptchaToken,
      }, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });

      if (!response.data.data) {
        setErrorMess('Sai mã sinh viên'); 
      } else {
        const eventsList = response.data.data;
        setUser(response.data.user); // Lấy thông tin người dùng mới nhất
        
          setEvents(eventsList); 
        
      }
      
    } catch (err) {
      setErrorMess('Đã xảy ra lỗi khi lấy dữ liệu. Vui lòng thử lại');
      console.error('API Error:', err);
    } finally {
      setLoading(false); 
    }
  };

  return (
    <div className='w-full h-[100vh] flex flex-col items-center justify-center gap-4 p-[2rem] relative'>
      <div className='w-full bottom-0 absolute text-center text-xs my-1'>
        <span>Copyright@2024 Ver:2024.10.16 Đoàn thanh niên Học viện</span>
        <br />
        <span>Created by Liên chi Đoàn Khoa CNTT1-PTIT</span>
      </div>
      <span className='flex flex-row gap-5'>
        <img src={logologin} width={50} height={50} alt="logo ptit" className='mb-[2rem] object-contain' />
        <img src={logodoan} width={60} height={60} alt="logo doan" className='mb-[2rem] object-contain' />
      </span>

      <div className='md:w-[500px] w-full h-auto rounded-xl shadow-lg flex flex-col items-center justify-center bg-slate-100 p-4'>
        <h1 className='text-2xl w-full text-center font-bold text-neutral-800 mb-4'>Tra cứu hoạt động Đoàn</h1>
        <form onSubmit={handleSubmit} className='flex justify-center items-center w-[70%]'>
          <div className='flex items-center flex-col w-full'> 
            <input
              type="text"
              id="name"
              placeholder="Nhập mã sinh viên"
              name="name"
              value={name}
              onChange={e => setName(e.target.value)}
              className='p-2 w-full mb-2'
              required
            />

            <input
              type="submit"
              value="Tra cứu"
              disabled={loading} 
              className='hover:cursor-pointer py-1 px-2  bg-red-500 hover:bg-red-700 text-white font-bold rounded-lg'
            />
          </div>
        </form>
      </div>

      {loading ? (
        <Spin size="large" /> 
      ) : error ? (
        <p>Error: {error}</p> 
      ) : (
        <>
          {errorMess && (
            <div className='bg-white px-4 py-2 rounded-md shadow-lg'>
              <p className='text-red-600 text-center'>{errorMess}</p> 
            </div>
          )}

          {user && (
            <div className='w-[90%] flex flex-col bg-white rounded-lg p-2 mb-4 overflow-y-auto'>
              <div className='w-full h-[80%] mt-4 px-4'>
                <p className='mb-2'><strong>Thông tin tra cứu:</strong></p>
                <p className='mb-2'>Họ và tên: {user?.last_name || ''} {user?.first_name || ''}</p>
                <p className='mb-2'>Đơn vị: {user?.organizations ? user.organizations.map(org => org.name).join(', ') : 'Sinh viên không tham gia đơn vị nào'}</p>
                <p className='mb-2'>Tổng số hoạt động đã tham gia: <strong>{events.length}</strong></p>
                
                {events.length === 0 && (
                  <p className='text-red-600'>Sinh viên chưa tham gia sự kiện nào</p>
                )}
              </div>

              {events.length > 0 && (
                <List
                  itemLayout="horizontal"
                  dataSource={events}
                  renderItem={(event) => (
                    <List.Item className='hover:bg-slate-100 flex'>
                      <List.Item.Meta
                        className='px-4'
                        title={event.name}
                        description={`Bắt đầu: ${event.start_at} - Kết thúc: ${event.finish_at}`}
                      />
                    </List.Item>
                  )}
                />
              )}
            </div>
          )}
        </>
      )}

      <img src={backlogin} alt="backlogin" className='absolute object-fill w-full h-full opacity-30 -z-[10]' />
    </div>
  );
};

const Tracuu = () => {
  return (
    <GoogleReCaptchaProvider reCaptchaKey="6LdGg1kqAAAAACjQRHCtqK71x9-NjCW4qAFCgssh">
      <TracuuForm />
    </GoogleReCaptchaProvider>
  );
};

export default Tracuu;
