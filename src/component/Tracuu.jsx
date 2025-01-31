import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { logodoan, logoptit, backlogin } from '../assets';
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { List, Spin, Pagination } from 'antd';

const TracuuForm = () => {
  const {executeRecaptcha} = useGoogleReCaptcha();
  const [name, setName] = useState("");
  const [errorMess, setErrorMess] = useState(''); 
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState([]);
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalEvents, setTotalEvents] = useState(0);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  useEffect(()=>{
    if(name){
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
    /* TRANG TRA CUU */
    <div className='w-full h-screen flex items-center justify-start flex-col md:flex-row gap-4'>
      <div className='max-w-[550px] h-full flex justify-center items-center left-0 px-4 z-20'>
        <div className='w-full md:w-[500px] h-[250px] rounded-2xl border-2 border-gray-400 flex flex-col justify-center items-center bg-[#faf7f7] shadow-lg'>
            <h1 className='text-[#333333] text-xl font-bold mt-4 w-full text-center'>TRA CỨU THAM GIA CÔNG TÁC ĐOÀN</h1>
            <form onSubmit={handleSubmit} className='w-full px-4 mt-4 flex flex-col items-center'>
                <input 
                  type="text" 
                  placeholder='Mã sinh viên' 
                  className='w-full px-4 py-1 bg-white border-2 border-gray-400 rounded-md text-[#333333]' 
                  id="name"
                  name="name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  />
              <input
                type='submit'
                value="Tra cứu"
                disabled={loading}
                className='rounded-md bg-blue-600 w-[6rem] h-[2rem] mt-4 text-[#ffffff] font-medium hover:bg-blue-700'/>
            </form>
        </div>
        
      </div>

      {!user && !loading && !errorMess && (
        <div className='w-full md:w-[60%] h-screen flex flex-col justify-between items-center bg-[#eeeeee] p-4'>
          <div className='text-center z-10'>
            <h2 className='text-xs md:text-xl font-bold text-blue-500'>HỌC VIỆN CÔNG NGHỆ BƯU CHÍNH VIỄN THÔNG</h2>
            <p className='text-xs md:text-xl font-bold text-blue-500'>ĐOÀN THANH NIÊN CỘNG SẢN HỒ CHÍ MINH HỌC VIỆN</p>
          </div>
          <div className='text-center z-10'>
            <span className='w-full h-[40px] flex gap-5 justify-center items-center mb-4'>
                <img src={logoptit} width={40} alt="logoptit" />
                <img src={logodoan} width={45} alt="logodoan" />
            </span>
            <h2 className='text-base md:text-2xl font-semibold text-gray-700'>Nhập mã sinh viên để tra cứu</h2>
            <p className='text-gray-500 mt-2'>Bạn có thể tra cứu thông tin về hoạt động đoàn mà mình đã tham gia.</p>
          </div>
          <div className='text-center z-10'>
            <h2 className='text-xs md:text-sm font-base text-gray-700'>Copyright@2025 Ver:2025.01.20 Đoàn thanh niên Học viện</h2>
            <p className='text-xs md:text-sm font-base text-gray-700'>Created by Liên chi Đoàn Khoa CNTT1-PTIT</p>
          </div>
          
        </div>
      )}
      <img src={backlogin} alt="Tra cứu thông tin" className='object-cover absolute -z-5 h-screen w-full scale-x-[-1]' />
      
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
            <div className='w-full h-screen flex flex-col bg-white p-2 my-4 overflow-y-auto z-30 border-l-2'>
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
export default Tracuu
