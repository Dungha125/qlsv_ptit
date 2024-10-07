import React, { useState } from 'react';
import axios from 'axios';
import { logologin, backlogin, logodoan } from '../assets'; 
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { List, Spin} from 'antd';

const TracuuForm = () => {
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [name, setName] = useState(""); 
  const [errorMess, setErrorMess] = useState(''); 
  const [error, setError] = useState(null); 
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState([]); // Lưu các sự kiện người dùng đã tham gia

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMess('');
    setEvents([]); // Clear previous results

    if (!executeRecaptcha) {
      setErrorMess('ReCAPTCHA has not been loaded');
      setLoading(false);
      return;
    }

    try {
      const recaptchaToken = await executeRecaptcha('submit');

      const response = await axios.post('https://dtn-event-api.toiyeuptit.com/api/retrieve', {
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

      setEvents(response.data.data); 
      
    } catch (err) {
      setErrorMess('An error occurred while fetching data. Please try again.');
      console.error('API Error:', err);
    } finally {
      setLoading(false); 
    }
  };

  return (
    <div className='w-full h-[100vh] flex flex-col items-center justify-center gap-4 p-[2rem] relative'>
          <div className='w-full bottom-0 right-0 absolute text-center text-xs mb-1'>
      <span>Copyright@2024 Ver:2024.10.07 Đoàn thanh niên Học viện</span>
      <br></br>
      <span>Created by Liên chi Đoàn Khoa CNTT1-PTIT</span>
    </div>
      <span className='flex flex-row gap-5'>
        <img src={logologin} width={75} height={75} alt="logo ptit" className='mb-[2rem] object-contain' />
        <img src={logodoan} width={90} height={90} alt="logo doan" className='mb-[2rem] object-contain' />
      </span>
      
      <div className='md:w-[500px] w-full h-auto rounded-xl shadow-lg flex flex-col items-center justify-center bg-slate-100 md:p-12'>
        <h1 className='text-2xl w-full text-center font-bold text-neutral-800 mb-4'>Tra cứu hoạt động</h1>
        {errorMess && <p className='text-red-600 text-center mb-4'>{errorMess}</p>}
        
        <form onSubmit={handleSubmit} className='flex justify-center items-center gap-4'>
        {errorMess && <p className="error-message">{errorMess}</p>} 
        <div> 
          <label htmlFor="name" className='mx-2 font-bold'>Username:</label>
          <input
            type="text"
            id="name"
            placeholder="Enter your username"
            name="name"
            value={name}
            onChange={e => setName(e.target.value)}
            className='p-2'
            required
          />
        </div>

        <div>
          <input
            type="submit"
            value="Tìm kiếm"
            disabled={loading} 
            className='hover:cursor-pointer p-1 bg-red-500 hover:bg-red-700 text-white font-bold rounded-lg'
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
          {events.length > 0 && (
            
            <div className='w-[80%] flex flex-col bg-white rounded-lg p-4'>
          <div className='w-full h-[80%]'>
            <p className='mb-4'>Tổng số hoạt động đã tham gia: <strong>{events.length}</strong></p>
            <List
            itemLayout="horizontal"
            dataSource={events}
            renderItem={(event) => (
              <List.Item  className=' hover:bg-slate-100 flex '>
                <List.Item.Meta 
                 className='px-4'
                  title={event.name}
                  description={`Bắt đầu: ${event.start_at} - Kết thúc: ${event.finish_at}`}
                />  
              </List.Item>
             
            )}
          />
          </div>
          </div>)}
          </>
        )
      }
      {/*{events.length > 0 && (
        <div className="result-section">
          <h2>Sự kiện {name} đã tham gia</h2>
          <ul>
            {events.map((event, index) => (
              <li key={index}>
                <strong>{event.name}</strong> 
                - Thời gian bắt đầu: {event.start_at} 
                - Thời gian kết thúc: {event.finish_at}
              </li>
            ))}
          </ul>
        </div>
      )}*/}

      

      <img src={backlogin} alt="backlogin" className='absolute object-cover w-screen h-screen opacity-30 -z-[10]' />
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
