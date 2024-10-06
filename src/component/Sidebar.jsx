import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AddEvent from './sources/AddEvent';
import CreateAccountForm from './sources/CreateAccountOrganization';
import Papa from 'papaparse'; // Use this for CSV parsing
import * as XLSX from 'xlsx'; // Use this for Excel parsing

const Sidebar = ({setRefresh}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [account, setAccount] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem('authToken');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [showUploadPopup, setShowUploadPopup] = useState(false);
  const [fileData, setFileData] = useState([]);
  const [fieldMapping, setFieldMapping] = useState({
    last_name: '',
    first_name: '',
    username: '',
    birthday: '',
    class: '',
    email: '',
    password: '',
    member_group: ''
  });

  const handleClickAccount = () => {
    navigate('/account');
  };

  const handleClickSemester = () => {
    navigate('/semester');
  };

  const handleClickHome = () => {
    navigate('/home');
  };

  const handleClickOrganization = () => {
    navigate('/organization');
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  const handleTogglePopup = () => {
    setShowAddEvent(!showAddEvent);
  };

  const handleCreatePopup = () => {
    setShowCreateAccount(!showCreateAccount);
  };

  const handleCreateEvent = () => {
    setShowCreateAccount(false);
  }
  const handleAddEvent = () => {
    setRefresh(prev => !prev);
    setShowAddEvent(false); 
  };
  const toggleUploadPopup = () => {
    setShowUploadPopup(!showUploadPopup);
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

  const fetchLogout = async () => {
    try {
      await axios.post('https://dtn-event-api.toiyeuptit.com/api/auth/logout', {}, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });
      localStorage.removeItem('authToken'); 
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Error logging out:', error.response ? error.response.data : error.message);
      setError(error.message);
    }
  };


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
      last_name: row[fieldMapping.last_name],
      first_name: row[fieldMapping.first_name],
      username: row[fieldMapping.username],
      birthday: row[fieldMapping.birthday],
      class: row[fieldMapping.class],
      email: row[fieldMapping.email],
      password: row[fieldMapping.password],
      member_group: row[fieldMapping.member_group],
    }));

    try {
      const response = await axios.post(
        'https://dtn-event-api.toiyeuptit.com/api/users/import',
        {
          force_update_password: true,
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
      console.log('API Response:', response.data);
      setRefresh((prev) => !prev);
      toggleUploadPopup(); // Close the popup after success
    } catch (error) {
      console.error('Error uploading data:', error.response ? error.response.data : error.message);
    }
  };

  

  return (
    <>
      <button
        onClick={toggleSidebar}
        className={`md:hidden p-4 md:text-white md:bg-gray-800 ${isSidebarOpen ? "text-white bg-transparent" : "bg-transparent text-gray-800"} fixed top-0 left-0 z-50`}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
        </svg>
      </button>

      <div
        className={`fixed top-0 left-0 w-64 h-screen bg-gray-800 text-white p-4 z-40 transition-transform transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 md:w-64 md:flex md:flex-col`}
      >
        <h2 className="text-xl font-bold mb-6 ml-[3rem] md:ml-0">Menu</h2>
        <ul>
          {/* Hiển thị tài khoản và home cho tất cả mọi người */}
          <li onClick={handleClickAccount} className={`mb-4 p-2 rounded cursor-pointer ${location.pathname === '/account' ? 'bg-white text-neutral-900 ' : 'bg-none hover:bg-gray-700'}`}>
            Tài khoản
          </li>
          <li onClick={handleClickHome} className={`mb-4 p-2 rounded cursor-pointer ${location.pathname === '/home' ? 'bg-white text-neutral-900' : 'bg-none hover:bg-gray-700'}`}>
            Sự kiện
          </li>

          {/* Nếu account group === 6 thì hiển thị thêm menu học kỳ */}
          {account.member_group === 6 && (
            <>
            <li onClick={handleClickSemester} className={`mb-4 p-2 rounded cursor-pointer ${location.pathname === '/semester' ? 'bg-white text-neutral-900 ' : 'bg-none hover:bg-gray-700'}`}>
              Học kỳ
            </li>
            <li onClick={handleClickOrganization} className={`mb-4 p-2 rounded cursor-pointer ${location.pathname === '/organization' ? 'bg-white text-neutral-900 ' : 'bg-none hover:bg-gray-700'}`}>
            Tổ chức
          </li></>
          )}
        </ul>

        {/* Các button tạo sự kiện và tạo tài khoản chỉ hiển thị khi account group === 6 */}
        {account.member_group === 6 && (
          <>
            <button
              onClick={handleTogglePopup}
              className='bg-red-500 hover:bg-red-700 text-white font-bold w-full py-2 my-2 px-4 rounded focus:outline-none focus:shadow-outline'
            >
              Tạo sự kiện
            </button>
            <button
              onClick={handleCreatePopup}
              className='bg-red-500 hover:bg-red-700 text-white font-bold w-full py-2 my-2 px-4 rounded focus:outline-none focus:shadow-outline'
            >
              Tạo tổ chức
            </button>
            <button
              onClick={toggleUploadPopup}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Upload File
            </button>
          </>
        )}
        

        <div className='w-[90%] h-[52px] rounded-lg bg-slate-100 bottom-4 fixed justify-center items-center'>
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p>Error: {error}</p>
          ) : (
            <div className='w-full h-full p-1 flex'>
              <button onClick={fetchLogout} className='bg-red-500 w-full h-full rounded-md'>Đăng xuất</button>
            </div>
          )}
        </div>
      </div>

      {/* Add Event Popup */}
      {showAddEvent && (
          <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white p-6 rounded-lg shadow-xl max-w-lg w-full relative py-[2rem]'>
            <h1 className='text-2xl font-bold mb-4 text-center'>Tạo sự kiện mới</h1>
            
            <button
              onClick={handleTogglePopup}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
         
            <div className='overflow-auto max-h-[80vh]'>
              <AddEvent onAddEvent={handleAddEvent} />
            </div>
          </div>
        </div>
        )}

      {/* Create Account Popup */}
      {showCreateAccount && (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white p-6 rounded-lg shadow-xl max-w-lg w-full relative py-[2rem]'>
        <h1 className='text-2xl font-bold mb-4 text-center'>Tạo tài khoản mới</h1>
        
        <button
          onClick={handleCreatePopup} // Chỉnh sửa để gọi hàm đúng
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors duration-200"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
     
        <div className='overflow-auto max-h-[80vh]'>
          <CreateAccountForm onCreateAccount={handleCreateEvent} />
        </div>
      </div>
    </div>
)}

      {/*Upload */}
      {showUploadPopup && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
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

          <button
            onClick={toggleUploadPopup}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
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
              </div>
            )}

            {/*UploadList*/}
          

    </>
  );
};

export default Sidebar;
