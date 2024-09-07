import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { List, Spin } from 'antd';
import { useParams } from 'react-router-dom';

const ListUserParticipate = () => {
    const { eventId } = useParams();
  const [user, setUser] = useState([]);
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null); 
  const token = localStorage.getItem('authToken');



  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`https://dtn-event-api.toiyeuptit.com/api/events/${eventId}/user`, {
          headers: { 
            Authorization: `Bearer ${token}`,
            Accept: 'application/json' 
          }
        });
        const dataArray = response.data.data;
        if (Array.isArray(dataArray)) {
          setUser(dataArray); 
        } else {
          console.error("Expected 'data' to be an array but received:", dataArray);
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
  }, [eventId,token]);

  


  return (
    <div className="w-full p-4">
        {loading ? (
          <Spin size="large" /> 
        ) : error ? (
          <p>Error: {error}</p> 
        ) : (
          <List
            itemLayout="horizontal"
            dataSource={user}
            renderItem={(user) => (
              <List.Item className=' hover:bg-white rounded-md bg-slate-50'>
                <List.Item.Meta
                  className='px-4 rounded-md border-b-1 border-solid border-neutral-500 w-full'
                  title={`${user.last_name} ${user.first_name}`}
                  description={user.username}
                />
              </List.Item>
            )}
          />
        )}
    </div>
  );
};

export default ListUserParticipate;
