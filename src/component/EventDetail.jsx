import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import ListUserParticipate from './sources/ListUserParticipate';
import { useNavigate } from 'react-router-dom';

const EventDetail = () => {
  const { eventId } = useParams(); 
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem('authToken');

  const handleShowPopup = () => {
    setShowPopup(!showPopup);
  }


  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const response = await axios.get(`https://dtn-event-api.toiyeuptit.com/api/events/${eventId}`,
            {   
            headers: { 
                Authorization: `Bearer ${token}`,
                Accept: 'application/json' 
              }}
        );
        setEvent(response.data.data);
      } catch (error) {
        console.error('Error fetching event details:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    if (token) {
        fetchEventDetails();
      } else {
        setError("No token found");
        setLoading(false);
      }
    }, [eventId, token]);

    const handleAddParticipant = async (user) => {
        try {
          await axios.post(
            `https://dtn-event-api.toiyeuptit.com/api/events/import`,
            {
              event_id: eventId, 
              users: [
                {
                  username: `${user.username}`,  
                  last_name: `${user.last_name}`,
                  first_name: `${user.first_name}`,
                },
              ],
            },
            {
              headers: {
                Authorization: `Bearer ${token}`, 
                Accept: 'application/json',
                'Content-Type': 'application/json',
              },
            }
          );
          alert('Participant added successfully');
        } catch (error) {
          console.error('Error adding participant:', error);
          alert('Error adding participant');
        }
      };
      

  useEffect(() => {
    const fetchUsers = async () => {
      if (searchQuery.trim() === '') {
        setSearchResults([]);
        return;
      }

      try {
        const response = await axios.get(`https://dtn-event-api.toiyeuptit.com/api/users?search=${searchQuery}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          }
        });
        setSearchResults(response.data.data);
      } catch (error) {
        console.error('Error fetching users:', error);
        setSearchResults([]);
      }
    };

    
    const debounceTimeout = setTimeout(() => {
      fetchUsers();
    }, 500);

    return () => clearTimeout(debounceTimeout); 
  }, [searchQuery, token]);

  const handleEventClick = () => {
    navigate(`/home`);
  }



  return (
    <div className="p-4">
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>Error: {error}</p>
      ) : (
        <div className='w-full h-full p-4'>
            <div className='w-full bg-red-500 fixed top-0 left-0 h-12'>
                <button className=' h-12 flex items-center mx-8 text-white font-bold' onClick={handleEventClick}>Quay lại</button>
            </div>
            <div className='w-full mb-4 mt-8'>
                <h1 className='w-full text-2xl font-bold'>{event.name}</h1>
                <h2 className='w-full text-xl text-neutral-900'>{event.description}</h2>
                <span className='text-neutral-900'>Địa điểm: {event.address}</span>
                <p className='text-gray-900'>Start: {event.start_at}</p>
                <p>End: {event.finish_at}</p>
            </div>
          
          <button onClick={handleShowPopup} className='p-3 rounded-lg font-bold text-white bg-red-500 hover:bg-red-700' >Thêm nhân sự</button>

          <div className='w-full bg-slate-200 rounded-md mt-2'>
            <h1 className='w-full text-center text-xl font-bold p-4'>Danh sách nhân sự</h1>
            <ListUserParticipate />
          </div>
          {
            showPopup && (
                <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
                    <div className='bg-white p-6 rounded-lg shadow-xl max-w-lg w-full relative py-[2rem]'>
                        <h1 className='w-full font-bold text-xl'>Thêm nhân sự</h1>
                        <button
                            onClick={handleShowPopup}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                            >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                        <input
                            type="text"
                            className="w-full p-2 border rounded"
                            placeholder="Tìm kiếm nhân sự..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)} 
                            />

                            <button
                            onClick={handleShowPopup}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                            >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                            </button>

                            {searchResults.length > 0 && (
                            <div className="mt-4">
                                <ul className="w-full">
                                {searchResults.map((user) => (
                                    <li key={user.id} className="p-2 border-b hover:bg-slate-100" onClick={() => handleAddParticipant(user)}>
                                    {user.last_name} {user.first_name}
                                    </li>
                                ))}
                                </ul>
                            </div>
                            )}
                            {searchResults.length === 0 && searchQuery && (
                            <p className="text-gray-500 mt-4">No results found for "{searchQuery}"</p>
                            )}
                    </div>
                </div>
            )
          }
        </div>
      )}
    </div>
  );
};

export default EventDetail;
