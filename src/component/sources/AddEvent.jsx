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
    const [popup, setPopup] = useState({ show: false, type: '', text: '' });

    const token = localStorage.getItem('authToken');
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

    const handleCancel = () => {
        showPopup('false', 'Đã huỷ tạo sự kiện!'); // Huỷ hàm tạo sự kiện
        setTimeout(() => {
            if (onClose) onClose();
            window.location.reload();
        }, 1500);
    };

    // Fetch semesters
    useEffect(() => {
        const fetchSemesters = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/semesters`, {
                    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
                });
                setSemesters(response.data.data || []);
            } catch (error) {
                console.error('Error fetching semesters:', error);
                showPopup('error', 'Không thể tải danh sách học kỳ.');
            }
        };
        fetchSemesters();
    }, [token, API_BASE_URL]);

    const formatDateTime = (date) => {
        const d = new Date(date);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
    };
    

    const showPopup = (type, text) => {
        setPopup({ show: true, type, text });
        setTimeout(() => setPopup({ show: false, type: '', text: '' }), 3000);
    };

    const handleCreateEvent = async (e) => {
        e.preventDefault();

        if (!eventName || !eventStart || !eventFinish || !eventOrganization || !eventAddress || !eventSemester) {
            showPopup('error', 'Vui lòng điền đầy đủ thông tin!');
            return;
        }

        if (new Date(eventFinish) <= new Date(eventStart)) {
            showPopup('error', 'Thời gian kết thúc phải sau thời gian bắt đầu!');
            return;
        }

        const semesterId = parseInt(eventSemester, 10);
        if (isNaN(semesterId) || semesterId <= 0) {
            showPopup('error', 'Vui lòng chọn học kỳ hợp lệ!');
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
                    start_at: formatDateTime(eventStart),
                    finish_at: formatDateTime(eventFinish),
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                    },
                }
            );

            showPopup('success', 'Sự kiện đã được tạo thành công!');
            if (onAddEvent) onAddEvent();
            setTimeout(() => {
                if (onClose) onClose();
                window.location.reload();
            }, 1500);
        } catch (error) {
            setLoading(false);
            let errorMessage = 'Lỗi khi tạo sự kiện!';
            if (error.response?.data?.message) errorMessage += ` ${error.response.data.message}`;
            showPopup('error', errorMessage);
        }
    };

    return (
        <div className='fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50'>
            {/* Form Container */}
            <div className='bg-white p-6 rounded-lg shadow-lg w-full max-w-lg'>
                <h2 className='text-xl font-bold mb-4 text-gray-800 text-center'>Thêm Sự Kiện</h2>
                <form onSubmit={handleCreateEvent} className='space-y-4'>

                    {/* Event Name */}
                    <input
                        type='text'
                        placeholder='Tên sự kiện'
                        value={eventName}
                        onChange={(e) => setEventName(e.target.value)}
                        className='w-full border px-3 py-2 rounded focus:ring focus:ring-blue-300'
                    />

                    {/* Organization */}
                    <input
                        type='text'
                        placeholder='Đơn vị tổ chức'
                        value={eventOrganization}
                        onChange={(e) => setEventOrganization(e.target.value)}
                        className='w-full border px-3 py-2 rounded focus:ring focus:ring-blue-300'
                    />

                    {/* Address */}
                    <input
                        type='text'
                        placeholder='Địa điểm'
                        value={eventAddress}
                        onChange={(e) => setEventAddress(e.target.value)}
                        className='w-full border px-3 py-2 rounded focus:ring focus:ring-blue-300'
                    />

                    {/* Semester */}
                    <select
                        value={eventSemester}
                        onChange={(e) => setEventSemester(e.target.value)}
                        className='w-full border px-3 py-2 rounded focus:ring focus:ring-blue-300'
                    >
                        <option value=''>Chọn học kỳ</option>
                        {semesters.map((semester) => (
                            <option key={semester.id} value={semester.id}>{semester.name}</option>
                        ))}
                    </select>

                    {/* Start Time */}
                    <input
                        type='datetime-local'
                        value={eventStart}
                        onChange={(e) => setEventStart(e.target.value)}
                        className='w-full border px-3 py-2 rounded focus:ring focus:ring-blue-300'
                    />

                    {/* Finish Time */}
                    <input
                        type='datetime-local'
                        value={eventFinish}
                        onChange={(e) => setEventFinish(e.target.value)}
                        className='w-full border px-3 py-2 rounded focus:ring focus:ring-blue-300'
                    />

                    {/* Description */}
                    <textarea
                        placeholder='Mô tả sự kiện'
                        value={eventDescription}
                        onChange={(e) => setEventDescription(e.target.value)}
                        className='w-full border px-3 py-2 rounded focus:ring focus:ring-blue-300'
                    ></textarea>

                    {/* Buttons */}
                    <div className='flex justify-end space-x-2'>
                        <button type='button' onClick={handleCancel} className='px-4 py-2 bg-gray-500 text-white rounded'>Hủy</button>
                        <button type='submit' className='px-4 py-2 bg-blue-600 text-white rounded' disabled={loading}>
                            {loading ? 'Đang tạo...' : 'Tạo sự kiện'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Popup Notification */}
            {popup.show && (
                <div className={`fixed top-10 right-10 p-4 rounded shadow-md text-white ${popup.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
                    {popup.text}
                </div>
            )}
        </div>
    );
};

export default AddEvent;
