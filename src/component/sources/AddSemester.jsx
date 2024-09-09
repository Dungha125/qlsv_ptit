import axios from 'axios';
import React, { useEffect, useState } from 'react'

const AddSemester = () => {

    const [semesterName, setSemesterName] = useState('');
    const [semesterCode, setSemesterCode] = useState('');
    const [semesterAbout, setSemesterAbout] = useState('');
    const [semesterShortName, setSemesterShortName] = useState('');
    const [semesterStatus, setSemesterStatus] = useState(1);
    const [semesterStartAt, setSemesterStartAt] = useState('');
    const [semesterFinishAt, setSemesterFinishAt] = useState('');
    const [message, setMessage] = useState('');
    const token = localStorage.getItem('authToken');


    const handleCreateSemester = async (e) => {
        e.preventDefault();

        const formatDateTime = (date) => {
            const d = new Date(date);
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
        };

        const formattedStart = formatDateTime(semesterStartAt);
        const formattedFinish = formatDateTime(semesterFinishAt);
  
        const sanitizeAlphaSpaces = (text) => {
            return text.replace(/[^a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơạảấầẩẫậắằẳẵặẹẻẽềếểễệỉịọỏốồổỗộớờởỡợụưủứừửữựỳỵýỷỹĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂẾỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪỬỮỰỲỴÝỶỸ\s0-9]/g, ''); //chưa thêm dấu đặc biệt được
            
        };
      try{
        await axios.post('https://dtn-event-api.toiyeuptit.com/api/semesters',
          {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
            'Content-Type':'application/json'
          },
          {
            name: sanitizeAlphaSpaces(semesterName),
            code: semesterCode,
            about: sanitizeAlphaSpaces(semesterAbout),
            short_name: semesterShortName,
            status: semesterStatus,
            start_at: formattedStart,
            finish_at:formattedFinish,
          }
          )
      }
      catch(error)
      {
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
          console.error('Error response data:', data);
          console.error('Error response status:', error.response.status);
      } else if (error.request) {
          setMessage('Error creating event: No response from server');
          console.error('Error request:', error.request);
      } else {
          setMessage('Error creating event: ' + error.message);
          console.error('General error:', error.message);
      }
      }
    }
  
  



  return (
    <div className='w-full flex flex-col items-center justify-center z-50'>
    <form onSubmit={handleCreateSemester} className='w-full max-w-sm'>
        <div className='mb-4'>
            <label className='block text-gray-700 text-sm font-bold mb-2' htmlFor='eventName'>
                Học kỳ
            </label>
            <input
                id='eventName'
                type='text'
                value={semesterName}
                onChange={(e) => setSemesterName(e.target.value)}
                className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
                placeholder='Học kỳ x'
            />
        </div>

        <div className='mb-4'>
            <label className='block text-gray-700 text-sm font-bold mb-2' htmlFor='eventOrganization'>
                Code
            </label>
            <input
                id='eventOrganization'
                type='text'
                value={semesterCode}
                onChange={(e) => setSemesterCode(e.target.value)}
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
                value={semesterAbout}
                onChange={(e) => setSemesterAbout(e.target.value)}
                className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
                placeholder='Enter event description'
            />
        </div>

        <div className='mb-4'>
            <label className='block text-gray-700 text-sm font-bold mb-2' htmlFor='eventAddress'>
                Short Name
            </label>
            <input
                id='eventAddress'
                type='text'
                value={semesterShortName}
                onChange={(e) => setSemesterShortName(e.target.value)}
                className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
                placeholder='Enter event address'
            />
        </div>


        <div className='mb-4'>
            <label className='block text-gray-700 text-sm font-bold mb-2' htmlFor='eventStart'>
                Thời gian bắt đầu
            </label>
            <input
                id='eventStart'
                type='datetime-local'
                value={semesterStartAt}
                onChange={(e) => setSemesterStartAt(e.target.value)}
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
                value={semesterFinishAt}
                onChange={(e) => setSemesterFinishAt(e.target.value)}
                className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
            />
        </div>

        <button
            type='submit'
            className='bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline'
        >
            Tạo sự kiện
        </button>
    </form>

   
</div>
  )
}

export default AddSemester
