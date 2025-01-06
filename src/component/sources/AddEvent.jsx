import axios from 'axios';
import React, { useEffect, useState } from 'react';

const AddEvent = ({ onAddEvent, onClose }) => {
    const [eventName, setEventName] = useState('');
    const [eventStart, setEventStart] = useState('');
    const [eventFinish, setEventFinish] = useState('');
    const [eventOrganization, setEventOrganization] = useState('');
    const [eventAddress, setEventAddress] = useState('');
    const [eventSemester, setEventSemester] = useState('');
    const [eventDescription, setEventDescription] = useState('');
    const [message, setMessage] = useState('');
    const [semesters, setSemesters] = useState([]);
    const [loading, setLoading] = useState(false);

    const token = localStorage.getItem('authToken');
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

    // Fetch semesters
    useEffect(() => {
        const fetchSemesters = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/semesters`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: 'application/json',
                    },
                });
                setSemesters(response.data.data || []);
            } catch (error) {
                console.error('Error fetching semesters:', error);
                setMessage('Error fetching semesters.');
            }
        };
        fetchSemesters();
    }, [token, API_BASE_URL]);

    const handleCreateEvent = async (e) => {
        e.preventDefault();

        const formatDateTime = (date) => {
            const d = new Date(date);
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
        };

        const formattedStart = formatDateTime(eventStart);
        const formattedFinish = formatDateTime(eventFinish);

        const semesterId = parseInt(eventSemester, 10);
        if (isNaN(semesterId) || semesterId <= 0) {
            setMessage('Invalid semester ID. Please select a valid semester.');
            return;
        }

        setLoading(true);
        try {
            await axios.post(
                `${API_BASE_URL}/events`,
                {
                    name: eventName,
                    organization: eventOrganization,
                    description: eventDescription,
                    address: eventAddress,
                    semester_id: semesterId,
                    start_at: formattedStart,
                    finish_at: formattedFinish,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                    },
                }
            );
            setMessage('');
            setLoading(false);

            // Gọi hàm onAddEvent để thông báo sự kiện đã được thêm
            if (onAddEvent) onAddEvent();

            // Tắt popup và reload trang
            if (onClose) onClose();
            window.location.reload();
        } catch (error) {
            setLoading(false);
            if (error.response) {
                const { data } = error.response;
                let errorMessage = 'Error creating event: ';
                if (data.message) {
                    errorMessage += data.message;
                }
                if (data.errors) {
                    for (const [field, errors] of Object.entries(data.errors)) {
                        errorMessage += `\n${field}: ${errors.join(', ')}`;
                    }
                }
                setMessage(errorMessage);
            } else if (error.request) {
                setMessage('Error creating event: No response from server.');
            } else {
                setMessage('Error creating event: ' + error.message);
            }
        }
    };

    return (
        <div className='w-full flex flex-col items-center justify-center z-50'>
            <form onSubmit={handleCreateEvent} className='w-full max-w-sm'>
                <div className='mb-4'>
                    <label className='block text-gray-700 text-sm font-bold mb-2' htmlFor='eventName'>
                        Tên sự kiện
                    </label>
                    <input
                        id='eventName'
                        type='text'
                        value={eventName}
                        onChange={(e) => setEventName(e.target.value)}
                        className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
                        placeholder='Enter event name'
                    />
                </div>
                <div className='mb-4'>
                    <label className='block text-gray-700 text-sm font-bold mb-2' htmlFor='eventOrganization'>
                        Đơn vị tổ chức
                    </label>
                    <input
                        id='eventOrganization'
                        type='text'
                        value={eventOrganization}
                        onChange={(e) => setEventOrganization(e.target.value)}
                        className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
                        placeholder='Enter event organization'
                    />
                </div>
                <div className='mb-4'>
                    <label className='block text-gray-700 text-sm font-bold mb-2' htmlFor='eventDescription'>
                        Chi tiết
                    </label>
                    <textarea
                        id='eventDescription'
                        value={eventDescription}
                        onChange={(e) => setEventDescription(e.target.value)}
                        className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
                        placeholder='Enter event description'
                    />
                </div>
                <div className='mb-4'>
                    <label className='block text-gray-700 text-sm font-bold mb-2' htmlFor='eventAddress'>
                        Địa điểm
                    </label>
                    <input
                        id='eventAddress'
                        type='text'
                        value={eventAddress}
                        onChange={(e) => setEventAddress(e.target.value)}
                        className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
                        placeholder='Enter event address'
                    />
                </div>
                <div className='mb-4'>
                    <label className='block text-gray-700 text-sm font-bold mb-2' htmlFor='eventSemester'>
                        Học kỳ
                    </label>
                    <select
                        id='eventSemester'
                        value={eventSemester}
                        onChange={(e) => setEventSemester(e.target.value)}
                        className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
                    >
                        <option value=''>Chọn học kỳ đang học</option>
                        {semesters.map((semester) => (
                            <option key={semester.id} value={semester.id}>
                                {semester.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className='mb-4'>
                    <label className='block text-gray-700 text-sm font-bold mb-2' htmlFor='eventStart'>
                        Thời gian bắt đầu
                    </label>
                    <input
                        id='eventStart'
                        type='datetime-local'
                        value={eventStart}
                        onChange={(e) => setEventStart(e.target.value)}
                        className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
                    />
                </div>
                <div className='mb-4'>
                    <label className='block text-gray-700 text-sm font-bold mb-2' htmlFor='eventFinish'>
                        Thời gian kết thúc
                    </label>
                    <input
                        id='eventFinish'
                        type='datetime-local'
                        value={eventFinish}
                        onChange={(e) => setEventFinish(e.target.value)}
                        className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
                    />
                </div>
                <button
                    type='submit'
                    className='bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline'
                    disabled={loading}
                >
                    {loading ? 'Đang tạo...' : 'Tạo sự kiện'}
                </button>
                {message && <p className='mt-4 text-red-500'>{message}</p>}
            </form>
        </div>
    );
};

export default AddEvent;
