import React, { useState } from 'react';
import axios from 'axios';

const sanitizeAlphaSpaces = (text) => {
  // Giữ lại các ký tự chữ cái, số, khoảng trắng và các dấu đặc biệt phổ biến
  return text.replace(/[^a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơạảấầẩẫậắằẵặẹẻẽềếểễệỉịọỏốồổỗộớờởỡợụưủứừửữựỳỵýỷỹĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂẾỆỈỊỌỎỐỒỔỖỘỚỜỞỬỮỰỲỴÝỶỸ\s0-9,;.!?(){}[\]'"-/_@#&*^%~`]/g, '');
};

const EditSemesForm = ({ semester, onClose }) => {
  // Hàm định dạng lại datetime thành yyyy-MM-dd HH:mm:ss
  const formatDateTime = (date) => {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
  };

  const formattedStart = formatDateTime(semester.start_at);
  const formattedFinish = formatDateTime(semester.finish_at);

  const [formData, setFormData] = useState({
    name: sanitizeAlphaSpaces(semester.name),
    start_at: formattedStart,
    finish_at: formattedFinish,
    about: sanitizeAlphaSpaces(semester.about),
    code: semester.code,
    short_name: semester.short_name,
    status: semester.status,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const token = localStorage.getItem('authToken');

  // Hàm xử lý thay đổi input
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === 'start_at' || name === 'finish_at') {
      const date = new Date(value);
      const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
      setFormData({ ...formData, [name]: formattedDate });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Hàm xử lý khi submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put(`http://dtn-event-api.toiyeuptit.com/api/semesters/${semester.id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
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
      <h2 className='text-xl font-bold w-full text-center mt-2'>Chỉnh sửa học kỳ</h2>
      {error && <p>Error: {error}</p>}
      <div className='w-full'>
        <label className='px-2 font-bold'>Tên của học kỳ:</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          className='bg-white px-2 rounded-md py-1 text-base'
        />
      </div>
      <div className='w-full'>
        <label className='px-2 font-bold'>Code:</label>
        <input
          type="text"
          name="code"
          value={formData.code}
          onChange={handleInputChange}
          className='bg-white px-2 rounded-md py-1 text-base'
        />
      </div>
      <div className='w-full'>
        <label className='px-2 font-bold'>Chi tiết:</label>
        <input
          type="text"
          name="about"
          value={formData.about}
          onChange={handleInputChange}
          className='bg-white px-2 rounded-md py-1 text-base'
        />
      </div>
      <div className='w-full'>
        <label className='px-2 font-bold'>Short name:</label>
        <input
          type="text"
          name="short_name"
          value={formData.short_name}
          onChange={handleInputChange}
          className='bg-white px-2 rounded-md py-1 text-base'
        />
      </div>
      <div>
        <label className='px-2 font-bold'>Thời gian bắt đầu:</label>
        <input
          type="datetime-local"
          name="start_at"
          value={formData.start_at.replace(' ', 'T').slice(0, 16)} // Chuyển thành dạng yyyy-MM-ddTHH:mm cho input
          onChange={handleInputChange}
        />
      </div>
      <div>
        <label className='px-2 font-bold'>Thời gian kết thúc:</label>
        <input
          type="datetime-local"
          name="finish_at"
          value={formData.finish_at.replace(' ', 'T').slice(0, 16)} // Chuyển thành dạng yyyy-MM-ddTHH:mm cho input
          onChange={handleInputChange}
        />
      </div>
      <button type="submit" disabled={loading} className='bg-green-500 hover:bg-green-700 text-white font-bold p-2 m-3 rounded-md'>
        {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
      </button>
    </form>
  );
};

export default EditSemesForm;
