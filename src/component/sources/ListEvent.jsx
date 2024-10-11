import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { List, Spin, Pagination, Modal } from 'antd';
import { useNavigate } from 'react-router-dom';
import EditEventForm from './EditEventForm';

const ListEvent = ({setUser}) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null); 
  const [currentPage, setCurrentPage] = useState(1); 
  const [totalEvents, setTotalEvents] = useState(0); 
  const [totalPages, setTotalPages] = useState(0); 
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const token = localStorage.getItem('authToken');
  const navigate = useNavigate();
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
  

  //số trang
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/events`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          Accept: 'application/json' 
        },
        params: {
          page: currentPage,
          per_page: 10 
        }
      });
      const { data, total } = response.data;
      if (Array.isArray(data)) {
        setEvents(data); 
        setTotalEvents(total);
        setTotalPages(Math.ceil(total / 10));
      } else {
        console.error("Expected 'data' to be an array but received:", data);
        setError("Unexpected data format");
      }
    } catch (error) {
      console.error('Error fetching events:', error.response ? error.response.data : error.message);
      setError(error.message); 
    } finally {
      setLoading(false); 
    }
  };

  useEffect(() => {
    if (token) { 
      fetchData();
    } else {
      setError("No token found");
      setLoading(false);
    } 
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, currentPage]);

  const handleEventClick = (eventId) => {
    navigate(`/events/${eventId}`);
  }

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  //xoá sự kiện
const handleDeleteEvent = async (eventId) => {
  try {
    setLoading(true); // Bắt đầu loading khi xóa
    await axios.delete(`${API_BASE_URL}/events/${eventId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // Sau khi xóa, lọc bỏ sự kiện bị xóa ra khỏi danh sách
    const updatedEvents = events.filter(event => event.id !== eventId);

    // Nếu số lượng sự kiện hiện tại ít hơn số lượng mục trên 1 trang, lấy thêm sự kiện từ trang tiếp theo
    if (updatedEvents.length < 10 && currentPage < totalPages) {
      const response = await axios.get(`${API_BASE_URL}/events`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          Accept: 'application/json' 
        },
        params: {
          page: currentPage + 1,
          per_page: 1  // Lấy thêm 1 sự kiện từ trang kế tiếp
        }
      });
      const { data } = response.data;
      setEvents([...updatedEvents, ...data]); // Thêm sự kiện mới vào danh sách hiện tại
    } else {
      setEvents(updatedEvents); // Cập nhật lại danh sách sự kiện
    }

    setTotalEvents(totalEvents - 1); // Giảm tổng số sự kiện
    setTotalPages(Math.ceil((totalEvents - 1) / 10)); // Cập nhật số trang
  } catch (error) {
    setError(error.message);
  } finally {
    setLoading(false); // Kết thúc loading
  }
};

  //sử sự kiện
  const handleEditEvent = (event) => {
    setSelectedEvent(event); // Lưu sự kiện đã chọn
    setIsEditModalVisible(true); // Mở popup
  };
  
  const handleEventUpdate = () => {
    setIsEditModalVisible(false);
    fetchData(); // Re-fetch the events list after editing
  };

  return (
    <div className="w-full h-screen flex">
      
      <div className="flex-1 p-8">
        <h1 className='w-full text-2xl font-bold mb-4'>Sự kiện</h1>
        {loading ? (
          <Spin size="large" /> 
        ) : error ? (
          <p>Error: {error}</p> 
        ) : (
          <div className='w-full flex flex-col '>
          <div className='w-full h-[80%]'>
          <List
            itemLayout="horizontal"
            dataSource={events}
            renderItem={(event) => (
              <List.Item  className=' hover:bg-slate-100 flex'>
                <List.Item.Meta 
                  onClick={()=> handleEventClick(event.id)}
                  title={event.name}
                  description={`Start: ${event.start_at} - End: ${event.finish_at}`}
                />  
                <span className='mx-4 flex gap-2'>
                  <button onClick={() => handleEditEvent(event)} className='p-2 bg-green-500 text-white rounded-md z-60'>Sửa</button>
                  <button onClick={() => handleDeleteEvent(event.id)} className='p-2 bg-red-500 text-white rounded-md z-60'>Xoá</button>
                 
                </span>
              </List.Item>
             
            )}
          />
         
          
          </div>
          <div className='w-full flex justify-center mb-6'>
            <Pagination
              current={currentPage}
              total={totalEvents}
              pageSize={10}
              onChange={handlePageChange}
              className="mt-4 "
            />
          </div>
          </div>
          
        )}
      </div>
      {isEditModalVisible && (
        <Modal
          visible={isEditModalVisible}
          onCancel={() => setIsEditModalVisible(false)}
          footer={null}
        >
          <EditEventForm event={selectedEvent} onClose={handleEventUpdate} />
        </Modal>
      )}
    </div>
  );
};

export default ListEvent;