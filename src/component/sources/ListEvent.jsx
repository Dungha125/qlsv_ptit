import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { List, Spin } from 'antd';

const ListEvent = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true); // Thêm state cho loading
  const [error, setError] = useState(null); // Thêm state cho error
  const token = localStorage.getItem('authToken');


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('https://dtn-event-api.toiyeuptit.com/api/events', {
          headers: { 
            Authorization: `Bearer ${token}`,
            Accept: 'application/json' 
          }
        });
        const dataArray = response.data.data;
        if (Array.isArray(dataArray)) {
          setEvents(dataArray); // Sửa thành setEvents
        } else {
          console.error("Expected 'data' to be an array but received:", dataArray);
          setError("Unexpected data format");
        }
      } catch (error) {
        console.error('Error fetching events:', error.response ? error.response.data : error.message);
        setError(error.message); // Lưu lỗi vào state
      } finally {
        setLoading(false); // Tắt loading
      }
    };

    if (token) { // Ensure token is present before calling API
      fetchData();
    } else {
      setError("No token found");
      setLoading(false);
    } 
    return () => {
      // Cleanup if needed, e.g., aborting ongoing requests
    };
  }, [token]);

  return (
    <div className="w-full h-screen flex">
      
      <div className="flex-1 p-4">
        {loading ? (
          <Spin size="large" /> // Hiển thị loading spinner khi đang tải
        ) : error ? (
          <p>Error: {error}</p> // Hiển thị lỗi nếu có lỗi xảy ra
        ) : (
          <List
            itemLayout="horizontal"
            dataSource={events}
            renderItem={(event) => (
              <List.Item>
                <List.Item.Meta
                  title={event.name}
                  description={`Start: ${event.start_at} - End: ${event.finish_at}`}
                />
              </List.Item>
            )}
          />
        )}
      </div>
    </div>
  );
};

export default ListEvent;
