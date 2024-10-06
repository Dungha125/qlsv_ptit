import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Papa from 'papaparse'; // Use this for CSV parsing
import * as XLSX from 'xlsx'; // Use this for Excel parsing

const Account = () => {
  const [refresh, setRefresh] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [account, setAccount] = useState([]);
  const token = localStorage.getItem('authToken');
  const [showUploadPopup, setShowUploadPopup] = useState(false);
  const [fileData, setFileData] = useState([]);
  const [fieldMapping, setFieldMapping] = useState({
    username_list: '',
    role_list: '',
  });
  const [selectedUnitId, setSelectedUnitId] = useState("");

  const toggleUploadPopup = () => {
    setShowUploadPopup(!showUploadPopup);
  };

  const handleUnitChange = (e) => {
    setSelectedUnitId(e.target.value); 
  };



  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('https://dtn-event-api.toiyeuptit.com/api/auth/profile', {
          headers: { 
            Authorization: `Bearer ${token}`,
            Accept: 'application/json' 
          }
        });
        const dataArray = response.data.data;
        setAccount(dataArray);
      } catch (error) {
        console.error('Error fetching account data:', error.response ? error.response.data : error.message);
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
  }, [token]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const fileExtension = file.name.split('.').pop();

    if (fileExtension === 'csv') {
      Papa.parse(file, {
        header: true,
        complete: (result) => setFileData(result.data),
        error: (error) => console.error('Error parsing CSV:', error),
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

  // Handle field mapping changes
  const handleMappingChange = (e) => {
    const { name, value } = e.target;
    setFieldMapping((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Submit mapped data to API
  const handleSubmit = async () => {
    const mappedUsers = fileData.map((row) => ({
      username_list: row[fieldMapping.username_list],
      role_list: row[fieldMapping.role_list]
    }));

    try {
      const response = await axios.post(
        `https://dtn-event-api.toiyeuptit.com/api/organizations/${selectedUnitId}/store_student`,
        { 
          username_list: mappedUsers.map(user => user.username_list),
          role_list: mappedUsers.map(user => user.role_list[0]) // Extract role list array properly
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        }
      );
      console.log('API Response:', response.data);
      setRefresh((prev) => !prev);
      toggleUploadPopup(); // Close the popup after success
    } catch (error) {
      console.error('Error uploading data:', error.response ? error.response.data : error.message);
    }
  };
  return (
    <div className='w-full h-full flex'>
      <Sidebar setRefresh={setRefresh} />

      <div className="flex-1 p-4 md:ml-64">
        <h1 className='text-4xl font-bold m-8'>Thông tin tài khoản</h1>
        {loading ? (
            <p>Loading...</p>
            ) : error ? (
              <p>Error: {error}</p>
            ) : (
        <>
        <div className='flex flex-col w-full gap-4 mx-8'>
          <span >Họ và tên: {account.last_name} {account.first_name}</span>
          <span >Username: {account.username}</span>
          <span >Email: {account.email}</span>
          <span> Quê quán: {account.citizen_id} </span>
          <span> Giới tính: {account.gender} </span>
          <span> Ngày sinh: {account.birthday} </span>
          <span> Địa chỉ: {account.address} </span>
          <span> Lớp: {account.class} </span>
          <span> Số điện thoại: {account.phone} </span>
        </div>
         {account.member_group === 6 && (
          <div className='mt-4 mx-8 '>
           
            <button
              onClick={toggleUploadPopup}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded  "
            >
              Upload File
            </button>
          </div>
        )}</>
            )}
            {showUploadPopup && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
      <div className='w-full flex justify-end'>
      <button
            onClick={toggleUploadPopup}
            className=" text-gray-500 hover:text-gray-700"
          >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
      </div>
      <h2 className="text-xl font-bold mb-4">Upload File</h2>
      <input
        type="file"
        accept=".csv,.xlsx"
        onChange={handleFileUpload}
        className="mb-4"
      />

      {/* Field Mapping */}
      {fileData.length > 0 && (
        <>
          <h3 className="text-lg font-bold mb-4">Map Fields</h3>
              <label className='block mb-2'>
                Đơn vị
              </label>
              <select 
                name="unit" 
                value={selectedUnitId}
                onChange={handleUnitChange}
                className='border rounded w-full p-2'
              >
                <option value="">Chọn đơn vị</option>
                  <option value="2">LCĐ KHOA CNTT1</option>
              </select>
          {Object.keys(fieldMapping).map((field) => (
            <div key={field} className="mb-4">
              
              <label className="block mb-2">{field}</label>
              <select
                name={field}
                value={fieldMapping[field]}
                onChange={handleMappingChange}
                className="border rounded w-full p-2"
              >
                <option value="">Select a field</option>
                {Object.keys(fileData[0]).map((fileField) => (
                  <option key={fileField} value={fileField}>
                    {fileField}
                  </option>
                ))}
              </select>
            </div>
          ))}
          <button
            onClick={handleSubmit}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            Submit
          </button>
            </>
          )}
                </div>
              </div>
            )}
      </div>
    </div>
  )
}

export default Account
