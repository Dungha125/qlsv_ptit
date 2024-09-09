import React, { useState } from 'react';
import axios from 'axios';

const sanitizeAlphaSpaces = (text) => {
    return text.replace(/[^a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơạảấầẩẫậắằẳẵặẹẻẽềếểễệỉịọỏốồổỗộớờởỡợụưủứừửữựỳỵýỷỹĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂẾỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪỬỮỰỲỴÝỶỸ\s]/g, ''); 
  };
  

const EditEventForm = ({ event, onClose }) => {
  const [formData, setFormData] = useState({
    name: sanitizeAlphaSpaces(event.name),
    start_at: event.start_at,
    finish_at: event.finish_at,
    organization: sanitizeAlphaSpaces(event.organization),
    description: sanitizeAlphaSpaces(event.description),
    address: sanitizeAlphaSpaces(event.address),
    semester_id:event.semester_id
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const token = localStorage.getItem('authToken');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put(`https://dtn-event-api.toiyeuptit.com/api/events/${event.id}`, formData, {
        headers: { 
            Authorization: `Bearer ${token}` },
            'Content-Type': 'application/json',
            Accept: 'application/json',
      });
      onClose(); // Đóng popup sau khi sửa xong
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='w-full max-w-sm gap-4 flex flex-col bg-slate-100 rounded-md'>
      <h2 className='text-xl font-bold w-full text-center mt-2'>Chỉnh sửa sự kiện</h2>
      {error && <p>Error: {error}</p>}
      <div className='w-full'>
        <label className='px-2 font-bold'>Tên sự kiện:</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          className='bg-white px-2 rounded-md py-1 text-base '
        />
      </div>
      <div className='w-full'>
        <label className='px-2 font-bold'>Đơn vị tổ chức:</label>
        <input
          type="text"
          name="organization"
          value={formData.organization}
          onChange={handleInputChange}
          className='bg-white px-2 rounded-md py-1 text-base '
        />
      </div>
      <div className='w-full'>
        <label className='px-2 font-bold'>Chi tiết:</label>
        <input
          type="text"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          className='bg-white px-2 rounded-md py-1 text-base '
        />
      </div>
      <div className='w-full'>
        <label className='px-2 font-bold'>Địa điểm:</label>
        <input
          type="text"
          name="address"
          value={formData.address}
          onChange={handleInputChange}
          className='bg-white px-2 rounded-md py-1 text-base '
        />
      </div>
      <div className='w-full'>
        <label className='px-2 font-bold'>Học kỳ:</label>
        <select 
          id='eventSemester'
          name="semester_id"
          value={formData.semester_id}
          onChange={handleInputChange}
          className='bg-white px-2 rounded-md py-1 text-base '>
            <option value="">Chọn học kỳ</option>
            <option value="1">Học kỳ 1</option>
            <option value="2">Học kỳ 2</option>
        </select>
      </div>
      <div>
        <label className='px-2 font-bold'>Ngày bắt đầu:</label>
        <input
          type="datetime-local"
          name="start_at"
          value={formData.start_at}
          onChange={handleInputChange}
        />
      </div>
      <div>
        <label className='px-2 font-bold'>Ngày kết thúc:</label>
        <input
          type="datetime-local"
          name="finish_at"
          value={formData.finish_at}
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