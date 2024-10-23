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
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  const handleClickAccount = () => {
    navigate('/quanly/account');
  };

  const handleClickSemester = () => {
    navigate('/quanly/semester');
  };

  const handleClickHome = () => {
    navigate('/quanly/home');
  };

  const handleClickOrganization = () => {
    navigate('/quanly/organization');
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
        const response = await axios.get(`${API_BASE_URL}/auth/profile`, {
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
    return () => {};
  }, [token]);

  const fetchLogout = async () => {
    try {
      await axios.post(`${API_BASE_URL}/auth/logout`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });
      localStorage.removeItem('authToken'); 
      localStorage.removeItem('authID');
      navigate('/quanly', { replace: true });
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

  const handleMappingChange = (e) => {
    const { name, value } = e.target;
    setFieldMapping((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

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
        `${API_BASE_URL}/users/import`,
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
          <li onClick={handleClickAccount} className={`mb-4 p-2 rounded cursor-pointer ${location.pathname === '/quanly/account' ? 'bg-white text-neutral-900 ' : 'bg-none hover:bg-gray-700'}`}>
            Tài khoản
          </li>
          <li onClick={handleClickHome} className={`mb-4 p-2 rounded cursor-pointer ${location.pathname === '/quanly/home' ? 'bg-white text-neutral-900' : 'bg-none hover:bg-gray-700'}`}>
            {account.member_group === 6 ? 'Sự kiện' : 'Sự kiện đã tham gia'}
          </li>

          {/* Nếu account group === 6 thì hiển thị thêm menu học kỳ */}
          {account.member_group === 6 && (
            <>
            <li onClick={handleClickSemester} className={`mb-4 p-2 rounded cursor-pointer ${location.pathname === '/quanly/semester' ? 'bg-white text-neutral-900 ' : 'bg-none hover:bg-gray-700'}`}>
              Học kỳ
            </li>
            </>
          )}

          {/* Hiển thị "Tổ chức" nếu role id === 1 */}
          {account.organizations && (account.organizations.some(org => org.pivot.role === 1) || account.member_group === 6) && (
            <li onClick={handleClickOrganization} className={`mb-4 p-2 rounded cursor-pointer ${location.pathname === '/quanly/organization' ? 'bg-white text-neutral-900 ' : 'bg-none hover:bg-gray-700'}`}>
              {account.organizations.some(org => org.pivot.role === 1) ? 'Đơn vị quản lý' : 'Tổ chức'}
            </li>
          )}

          {/* Tạo sự kiện và tổ chức chỉ hiển thị khi account group === 6 */}
          {account.member_group === 6 && (
            <>
              <button
                onClick={handleTogglePopup}
                className='bg-blue-500 hover:bg-blue-700 text-white font-bold w-full py-2 my-2 px-4 rounded focus:outline-none focus:shadow-outline'
              >
                Tạo sự kiện
              </button>
              <button
                onClick={handleCreatePopup}
                className='bg-blue-500 hover:bg-blue-700 text-white font-bold w-full py-2 my-2 px-4 rounded focus:outline-none focus:shadow-outline'
              >
                Tạo tổ chức
              </button>
              <button
                onClick={toggleUploadPopup}
                className='bg-blue-500 hover:bg-blue-700 text-white font-bold w-full py-2 my-2 px-4 rounded focus:outline-none focus:shadow-outline'
              >
                Tải file tài khoản
              </button>
            </>
          )}
        </ul>
        <div className="absolute bottom-0 left-0 w-full mb-4 px-4">
          <button
            onClick={fetchLogout}
            className="w-full bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Đăng xuất
          </button>
        </div>
      </div>

      {showAddEvent && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div className="relative bg-white rounded-lg p-6 w-full max-w-lg">
      <button
        onClick={handleAddEvent}
        className="absolute top-2 right-2 text-gray-700 font-bold"
      >
        X
      </button>
      <AddEvent closePopup={handleAddEvent} />
    </div>
  </div>
)}

{showCreateAccount && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div className="relative bg-white rounded-lg p-6 w-full max-w-lg">
      <button
        onClick={handleCreateEvent}
        className="absolute top-2 right-2 text-gray-700 font-bold"
      >
        X
      </button>
      <CreateAccountForm closePopup={handleCreateEvent} />
    </div>
  </div>
)}

{showUploadPopup && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div className="relative bg-white rounded-lg p-6 w-full max-w-lg h-[70%] overflow-y-auto">
      <button
        onClick={toggleUploadPopup}
        className="absolute top-2 right-2 text-gray-700 font-bold"
      >
        X
      </button>
      <h2 className="text-lg font-bold mb-4">Tải file tài khoản</h2>
      <input type="file" accept=".csv,.xlsx" onChange={handleFileUpload} />
      <div className="mt-4">
        {Object.keys(fieldMapping).map((field) => (
          <div key={field} className="mb-2">
            <label className="block mb-1">{field}:</label>
            <input
              type="text"
              name={field}
              value={fieldMapping[field]}
              onChange={handleMappingChange}
              className="border rounded w-full p-2"
            />
          </div>
        ))}
      </div>
      <div className="mt-6">
        <button
          onClick={handleSubmit}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-4"
        >
          Submit
        </button>
        <button
          onClick={toggleUploadPopup}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Hủy
        </button>
      </div>
    </div>
  </div>
)}
    </>
  );
};

export default Sidebar;