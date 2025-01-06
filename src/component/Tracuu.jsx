import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { logologin, backlogin, logodoan } from '../assets'; 
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { List, Spin, Pagination } from 'antd';

const TracuuForm = () => {
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [name, setName] = useState(""); 
  const [errorMess, setErrorMess] = useState(''); 
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState([]); // Lưu các sự kiện người dùng đã tham gia
  const [user, setUser] = useState(null); // Lưu thông tin người dùng mới nhất
  const [currentPage, setCurrentPage] = useState(1); // Số trang hiện tại
  const [pageSize, setPageSize] = useState(10); // Số lượng sự kiện trên mỗi trang
  const [totalEvents, setTotalEvents] = useState(0); // Tổng số sự kiện
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  // Lấy dữ liệu khi thay đổi trang
  useEffect(() => {
    if (name) {
      fetchData();
    }
  }, [currentPage, pageSize]);

  const fetchData = async () => {
    setLoading(true);
    setErrorMess('');
    setEvents([]);
    setUser(null);

    if (!executeRecaptcha) {
      setErrorMess('ReCAPTCHA has not been loaded');
      setLoading(false);
      return;
    }

    try {
      const recaptchaToken = await executeRecaptcha('submit');

      const response = await axios.post(`${API_BASE_URL}/retrieve`, {
        username: name,
        s: null,
        with_trashed: true,
        only_trashed: false, 
        per_page: pageSize,
        page: currentPage, 
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
        setUser(response.data.user);
        setEvents(response.data.data); // Cập nhật sự kiện
        setTotalEvents(response.data.total); // Tổng số sự kiện từ API
      }
      
    } catch (err) {
      setErrorMess('Đã xảy ra lỗi khi lấy dữ liệu. Vui lòng thử lại');
      console.error('API Error:', err);
    } finally {
      setLoading(false); 
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset trang về 1 khi người dùng tra cứu
    fetchData(); // Gọi API ngay sau khi form được submit
  };

  const handlePageChange = (page, pageSize) => {
    setCurrentPage(page);
    setPageSize(pageSize); // Cập nhật số lượng sự kiện trên mỗi trang nếu thay đổi
  };

  return (
    <div className='w-full h-[100vh] flex flex-col items-center justify-center gap-4 p-[2rem] relative'>
      <div className='w-full bottom-0 absolute text-center text-xs my-1'>
        <span>Copyright@2025 Ver:2025.01.06 Đoàn thanh niên Học viện</span>
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
              className='hover:cursor-pointer py-1 px-2  bg-blue-500 hover:bg-blue-700 text-white font-bold rounded-lg'
            />
          </div>
        </form>
      </div>

      {loading ? (
        <Spin size="large" /> 
      ) : (
        <>
          {errorMess && (
            <div className='bg-white px-4 py-2 rounded-md shadow-lg'>
              <p className='text-red-600 text-center'>{errorMess}</p> 
            </div>
          )}

          {user && (
            <div className='w-full md:w-[80%] flex flex-col bg-white rounded-lg p-2 mb-4 overflow-y-auto'>
              <div className='w-full h-[80%] mt-4 px-4'>
                <p className='mb-2'><strong>Thông tin tra cứu:</strong></p>
                <p className='mb-2'>Họ và tên: {user?.last_name || ''} {user?.first_name || ''}</p>
                <p className='mb-2'>Đơn vị: {user?.organizations ? user.organizations.map(org => org.name).join(', ') : 'Sinh viên không tham gia đơn vị nào'}</p>
                <p className='mb-2'>Tổng số hoạt động đã tham gia: <strong>{totalEvents}</strong></p>
                
                {events.length === 0 && (
                  <p className='text-red-600'>Sinh viên chưa tham gia sự kiện nào</p>
                )}
              </div>

              {events.length > 0 && (
                <>
                  <List
                    itemLayout="horizontal"
                    dataSource={events}
                    renderItem={(event, index) => (
                      <List.Item className='hover:bg-slate-100 flex'>
                        <List.Item.Meta
                          className='px-4'
                          title={`${index + 1}. ${event.name}`} 
                          description={`Bắt đầu: ${event.start_at} - Kết thúc: ${event.finish_at}`}
                        />
                      </List.Item>
                    )}
                  />
                  
                </>
              )}
            
              <Pagination 
                    current={currentPage} 
                    pageSize={pageSize} 
                    total={totalEvents} 
                    onChange={handlePageChange} 
                    className='mt-4 text-center'
              />
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
