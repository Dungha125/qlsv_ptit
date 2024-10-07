import React, { useState, useEffect } from 'react';
import axios from 'axios';

const sanitizeAlphaSpaces = (text) => {
  // Keep letters, numbers, spaces, and common special characters
  return text.replace(/[^a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơạảấầẩẫậắằẵặẹẻẽềếểễệỉịọỏốồổỗộớờởỡợụưủứừửữựỳỵýỷỹĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂẾỆỈỊỌỎỐỒỔỖỘỚỜỞỬỮỰỲỴÝỶỸ\s0-9,;.!?(){}[\]'"-/_@#&*^%~`]/g, '');
};

const EditEventForm = ({ event, onClose }) => {
  const [formData, setFormData] = useState({
    name: sanitizeAlphaSpaces(event.name),
    start_at: event.start_at,
    finish_at: event.finish_at,
    organization: sanitizeAlphaSpaces(event.organization),
    description: sanitizeAlphaSpaces(event.description),
    address: sanitizeAlphaSpaces(event.address),
    semester_id: event.semester_id,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [semesters, setSemesters] = useState([]);
  const token = localStorage.getItem('authToken');

  // Fetch semesters from API
  useEffect(() => {
    const fetchSemesters = async () => {
      try {
        const response = await axios.get('https://dtn-event-api.toiyeuptit.com/api/semesters', {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        });
        setSemesters(response.data.data);
      } catch (error) {
        console.error('Error fetching semesters:', error);
      }
    };

    fetchSemesters();
  }, [token]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const sanitizedValue = name === 'name' || name === 'organization' || name === 'description' || name === 'address'
      ? sanitizeAlphaSpaces(value)
      : value; // Sanitize only specific fields
    setFormData({ ...formData, [name]: sanitizedValue });
  };

  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formattedFormData = {
      ...formData,
      start_at: formatDateTime(formData.start_at),
      finish_at: formatDateTime(formData.finish_at),
    };

    try {
      await axios.put(`https://dtn-event-api.toiyeuptit.com/api/events/${event.id}`, formattedFormData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      });
      onClose();
    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='w-full max-w-sm gap-4 flex flex-col bg-slate-100 rounded-md'>
      <h2 className='text-xl font-bold w-full text-center mt-2'>Chỉnh sửa sự kiện</h2>
      {error && <p className='text-red-500'>{error}</p>}
      <div className='w-full'>
        <label className='px-2 font-bold'>Tên sự kiện:</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          className='bg-white px-2 rounded-md py-1 text-base'
        />
      </div>
      <div className='w-full'>
        <label className='px-2 font-bold'>Đơn vị tổ chức:</label>
        <input
          type="text"
          name="organization"
          value={formData.organization}
          onChange={handleInputChange}
          className='bg-white px-2 rounded-md py-1 text-base'
        />
      </div>
      <div className='w-full'>
        <label className='px-2 font-bold'>Chi tiết:</label>
        <input
          type="text"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          className='bg-white px-2 rounded-md py-1 text-base'
        />
      </div>
      <div className='w-full'>
        <label className='px-2 font-bold'>Địa điểm:</label>
        <input
          type="text"
          name="address"
          value={formData.address}
          onChange={handleInputChange}
          className='bg-white px-2 rounded-md py-1 text-base'
        />
      </div>
      <div className='w-full'>
        <label className='px-2 font-bold'>Học kỳ:</label>
        <select
          name="semester_id"
          value={formData.semester_id}
          onChange={handleInputChange}
          className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
        >
          <option value="">Chọn học kỳ đang học</option>
          {Array.isArray(semesters) && semesters.length > 0 ? (
            semesters.map((semester) => (
              <option key={semester.id} value={semester.id}>
                {semester.name}
              </option>
            ))
          ) : (
            <option disabled>Không có học kỳ nào</option>
          )}
        </select>
      </div>
      <div>
        <label className='px-2 font-bold'>Ngày bắt đầu:</label>
        <input
          type="datetime-local"
          name="start_at"
          value={formData.start_at.replace(' ', 'T').slice(0, 16)}
          onChange={handleInputChange}
        />
      </div>
      <div>
        <label className='px-2 font-bold'>Ngày kết thúc:</label>
        <input
          type="datetime-local"
          name="finish_at"
          value={formData.finish_at.replace(' ', 'T').slice(0, 16)}
          onChange={handleInputChange}
        />
      </div>
      <button type="submit" disabled={loading} className='bg-green-500 hover:bg-green-700 text-white font-bold p-2 m-3 rounded-md'>
        {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
      </button>
    </form>
  );
};

export default EditEventForm;
