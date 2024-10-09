import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { List, Spin } from 'antd';

const SemesterDetail = () => {
    const { semesterId } = useParams(); // Get semester ID from the URL
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const token = localStorage.getItem('authToken'); // Get auth token from localStorage
    const navigate = useNavigate();

    useEffect(() => {
        if (!token) {
            // Handle missing token scenario
            setError('Token không tồn tại. Vui lòng đăng nhập lại.');
            setLoading(false);
            return;
        }

        const fetchEvents = async () => {
            try {
                const response = await axios.get('https://qldv-api.toiyeuptit.com/api/events', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: 'application/json',
                    },
                });

                // Filter events by semesterId (ensure both are integers)
                const filteredEvents = response.data.data.filter(
                    (event) => event.semester_id === parseInt(semesterId)
                );

                setEvents(filteredEvents); // Update state with filtered events
            } catch (err) {
                console.error('Error fetching events:', err.response ? err.response.data : err.message);
                setError('Không thể tải sự kiện. Vui lòng thử lại sau.');
            } finally {
                setLoading(false); // Ensure loading state is updated
            }
        };

        fetchEvents();
    }, [semesterId, token]);

    // Handle token absence
    if (!token) {
        return <p>Token không tồn tại. Vui lòng đăng nhập để tiếp tục.</p>;
    }


    const handleEventClick = () => {
        navigate(`/semester`);
      }
    return (
        <div className="w-full h-full p-4">
        <div className='w-full bg-red-500 fixed top-0 left-0 h-12'>
                <button className=' h-12 flex items-center mx-8 text-white font-bold' onClick={handleEventClick}>Quay lại</button>
        </div>
        
            <h1 className="text-4xl font-bold mb-4 mt-12">Danh sách sự kiện của học kỳ</h1>

            {loading ? (
                <Spin size="large" />
            ) : error ? (
                <p>{error}</p>
            ) : events.length === 0 ? (
                <p>Không có sự kiện nào cho học kỳ này.</p>
            ) : (
                <List
                    itemLayout="horizontal"
                    dataSource={events}
                    renderItem={(event) => (
                        <List.Item>
                            <List.Item.Meta
                                title={event.name}
                                description={`Thời gian bắt đầu: ${new Date(event.start_at).toLocaleString()} - Kết thúc: ${new Date(event.finish_at).toLocaleString()}`}
                            />
                        </List.Item>
                    )}
                />
            )}
        </div>
    );
};

export default SemesterDetail;
