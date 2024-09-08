import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { List, Spin, Pagination } from 'antd';
import { useNavigate } from 'react-router-dom';

const ListEvent = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null); 
  const [currentPage, setCurrentPage] = useState(1); 
  const [totalEvents, setTotalEvents] = useState(0); 
  const [totalPages, setTotalPages] = useState(0); 
  const token = localStorage.getItem('authToken');
  const navigate = useNavigate();


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('https://dtn-event-api.toiyeuptit.com/api/events', {
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
          setTotalPages(Math.ceil(total / 20));
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

    if (token) { 
      fetchData();
    } else {
      setError("No token found");
      setLoading(false);
    } 
    return () => {
     
    };
  }, [token, currentPage]);

  const handleEventClick = (eventId) => {
    navigate(`/events/${eventId}`);
  }

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  


  return (
    <div className="w-full h-screen flex">
      
      <div className="flex-1 p-4">
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
              <List.Item onClick={()=> handleEventClick(event.id)} className=' hover:bg-slate-100'>
                <List.Item.Meta
                  title={event.name}
                  description={`Start: ${event.start_at} - End: ${event.finish_at}`}
                />
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
    </div>
  );
};

export default ListEvent;
