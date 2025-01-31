import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ListUserParticipate from './sources/ListUserParticipate';
import Papa from 'papaparse'; // CSV parsing
import * as XLSX from 'xlsx'; 
import { Alert } from 'antd';

const EventDetail = () => {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [showUploadPopup, setShowUploadPopup] = useState(false);
  const [fileData, setFileData] = useState([]);
  const [fieldMapping, setFieldMapping] = useState({
    username: '',
    last_name: '',
    first_name: '',
  });
  const token = localStorage.getItem('authToken');
  const UserId = localStorage.getItem('authID');
  const navigate = useNavigate();
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const [showPopupStatus, setShowPopupStatus] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/events/${eventId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        });
        setEvent(response.data.data);
        await fetchParticipants(); // Fetch participants when event details are fetched
      } catch (err) {
        setError('Error fetching event details');
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchEventDetails();
    else setError("No token found");
  }, [eventId, token]);

  const fetchParticipants = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/events/${eventId}/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },});
        if (Array.isArray(response.data.data)) {
          setParticipants(response.data.data);
      } else {
        setError('Unexpected data format');
      }
    } catch (err) {
      setError('Error fetching participants');
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const fileExtension = file.name.split('.').pop();
    if (fileExtension === 'csv') {
      Papa.parse(file, {
        header: true,
        complete: (result) => setFileData(result.data),
        error: (err) => console.error('Error parsing CSV:', err),
      });
    } else if (fileExtension === 'xlsx') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        setFileData(jsonData);
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const handleMappingChange = (e) => {
    const { name, value } = e.target;
    setFieldMapping((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    // Map the file data to match the required structure for the API
    const mappedUsers = fileData.map((row) => ({
      username: row[fieldMapping.username],
      last_name: row[fieldMapping.last_name],
      first_name: row[fieldMapping.first_name],
    }));
  
    console.log("Mapped Users:", mappedUsers); // Log the data being sent to the API
  
    try {
      const response = await axios.post(
        `${API_BASE_URL}/events/import`,
        { 
          event_id: Number(eventId), 
          users: mappedUsers,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, 
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        }
      );
      
      console.log("Response from API:", response.data); // Log the response
      setPopupMessage("Tải danh sách thành công!");
      setIsSuccess(true);
      setShowPopup(true);
      setShowUploadPopup(false);

      // Refetch participants after successfully uploading
      setTimeout(() => {
        fetchParticipants();
      }, 500); // Optional delay to ensure the backend updates

    } catch (err) {
      console.error('Error uploading data:', err.response ? err.response.data : err.message);
  
      if (err.response) {
        console.error('Full error response:', err.response);
      } else {
        console.error("No response from server");
      }
      setPopupMessage("Tải danh sách không thành công, vui lòng xem lại data");
      setIsSuccess(false);
      setShowPopup(true);
    }
  };

  const togglePopup = () => {
    setShowUploadPopup(!showUploadPopup);
  };

  const handleBackClick = () => {
    navigate(`/quanly/home`);
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  if (showPopup) {
    setTimeout(() => {
      setShowPopup(false);
    }, 3000); // Close after 3 seconds
  }

  return (
    <div className="p-4">
      <div className="w-full bg-red-500 fixed top-0 left-0 h-12 z-20">
        <button className="h-12 flex items-center mx-8 text-white font-bold" onClick={handleBackClick}>
          Quay lại
        </button>
      </div>

      <div className="w-full mb-4 mt-12">
        <h1 className="text-2xl font-bold">{event.name}</h1>
        <p>{event.description}</p>
        <p>Địa điểm tổ chức: {event.address}</p>
        <p>Bắt đầu: {event.start_at}</p>
        <p>Kết thúc: {event.finish_at}</p>
      </div>

      <button onClick={togglePopup} className={`p-3 rounded-lg ${UserId == 1 ? '':'hidden'} font-bold text-white bg-red-500 hover:bg-red-700`}>
        Thêm nhân sự
      </button>

      <div className="w-full bg-slate-200 rounded-md mt-2">
        <h1 className="w-full text-center text-xl font-bold p-4">Danh sách nhân sự</h1>
        <ListUserParticipate participants={participants} />
      </div>

      {showUploadPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
            <div className='w-full flex justify-end '>
            <button onClick={togglePopup} className="text-gray-500 hover:text-gray-700">
              <span className="text-3xl">&times;</span> {/* This is the "X" character */}
            </button></div>
            <h2 className="text-xl font-bold mb-4">Tải file</h2>
            <input type="file" accept=".csv,.xlsx" onChange={handleFileUpload} className="mb-4" />

            {fileData.length > 0 && (
              <>
                <h3 className="text-lg font-bold mb-4">Lựa chọn trường</h3>
                {Object.keys(fieldMapping).map((field) => (
                  <div key={field} className="mb-4">
                    <label className="block mb-2">{field}</label>
                    <select
                      name={field}
                      value={fieldMapping[field]}
                      onChange={handleMappingChange}
                      className="border rounded w-full p-2"
                    >
                      <option value="">Lựa chọn trường</option>
                      {Object.keys(fileData[0]).map((fileField) => (
                        <option key={fileField} value={fileField}>
                          {fileField}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
                <button onClick={handleSubmit} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                  Submit
                </button>
              </>
            )}
            </div>
        </div>
      )}
      {showPopup && (
        <div
          className={`fixed top-5 right-5 bg-opacity-100 p-5 rounded-lg text-white text-center z-50 ${
            isSuccess ? 'bg-green-500' : 'bg-red-500'
          }`}
          onClick={() => setShowPopup(false)} // Close on click
        >
          <div className="popup-content">
            <p>{popupMessage}</p>
          </div>
        </div>
      )}



    </div>
  );
};

export default EventDetail;
