import axios from 'axios';
import React, { useEffect, useState } from 'react'
import Sidebar from './Sidebar';
import { List, Pagination, Spin } from 'antd';
import Papa from 'papaparse'; 
import * as XLSX from 'xlsx'; 
import { useMediaQuery } from 'react-responsive';

const Organization = () => {
  const [refresh, setRefresh] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [account, setAccount] = useState({});
  const [organization, setOrganization] = useState([]);
  const [listUser, setListUser] = useState([]);
  const token = localStorage.getItem('authToken');
  const idAuth = localStorage.getItem('authID');
  const [showUploadPopup, setShowUploadPopup] = useState(false);
  const [popup, setPopup] = useState({ show: false, type: '', text: '' });
  const [fileData, setFileData] = useState([]);
  const [fieldMapping, setFieldMapping] = useState({
    username: '',
    role_list: '',
  });
  const [currentOrganizationName, setCurrentOrganizationName] = useState("");
  const [selectedUnitId, setSelectedUnitId] = useState("");
  const [selectedOrga, setSelectedOrga] = useState("");
  const [showListUser, setShowListUser] = useState(false);
  const [currentPage, setCurrentPage] = useState(1); 
  const [totalEvents, setTotalEvents] = useState(0); 
  const [totalPages, setTotalPages] = useState(0);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;


  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });

  const [selectedOrgId, setSelectedOrgId] = useState(null); // State để lưu ID của đơn vị được chọn

  const handleSelectChange = (e) => {
    const selectedId = e.target.value;
    const selectedOrgName = organization.find(org => org.id === selectedId)?.name || ""; // Find the organization name based on selected ID
    setCurrentOrganizationName(selectedOrgName); // Update state with selected organization name
    setSelectedOrgId(selectedId);
    toggleShowListUser(selectedId, selectedOrgName); // Pass both selected ID and organization name
  };

  const handleButtonClick = () => {
    if (selectedOrgId) {
      toggleUploadPopup(selectedOrgId); // Gọi hàm upload với ID đã chọn
    }
  };


  const toggleUploadPopup = (id) => {
    setSelectedUnitId(id);
    setShowUploadPopup(!showUploadPopup);
  };

  const showPopup = (type, text) => {
    setPopup({ show: true, type, text });
    setTimeout(() => setPopup({ show: false, type: '', text: '' }), 3000);
};



  const handlePageChange = (page) => {
    setCurrentPage(page);
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

  useEffect(()=>{
    const fecthOrgani = async () => {
      try{
        const response = await axios.get(`${API_BASE_URL}/organizations`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/json'
            }
          }
        );
        const dataArray = response.data.data;
        setOrganization(dataArray);
        
      }
      catch (error){
        console.error('Error fetching account data:', error.response ? error.response.data : error.message);
        setError(error.message);
        
      }
      finally {
        setLoading(false);
      }
    };

    if(token){
      fecthOrgani();

    }else{
      setError("Lỗi thực thi");
      setLoading(false);
    }
    return ()=>{

    };
  }, [token]);



  const fetchList = async (organizationId) => {
    setLoading(true); // Set loading state while fetching data
    try {
      const response = await axios.get(`${API_BASE_URL}/organizations/${organizationId}/user_list`, {
        params: {
          page: currentPage,
          per_page: 10 
        },
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });
      const dataArray = response.data.data;
      if (Array.isArray(dataArray)) {
        setListUser(dataArray);
        
        // Assuming there's a total count of users in the API response
        const totalEvents = response.data.total || dataArray.length;
        
        setTotalEvents(totalEvents);
        setTotalPages(Math.ceil(totalEvents / 10));
        setShowListUser(true);
      } else {
        console.error("Expected 'data' to be an array but received:", dataArray);
        setError("Bạn không phải quản lý của đơn vị này");
      }
    } catch (error) {
      console.error('Error fetching user list:', error.response ? error.response.data : error.message);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedOrga) {
      fetchList(selectedOrga);
    }
  }, [currentPage, selectedOrga]);


  const toggleShowListUser = (organizationId, organizationName) => {
    setCurrentOrganizationName(organizationName);
    setSelectedOrga(organizationId); 
    setCurrentPage(1);  
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
    // Kiểm tra điều kiện để ẩn role_list
    const shouldHideRoleList =
      account.organizations &&
      account.organizations.some((org) => org.pivot.role === 1);
  
    const mappedUsers = fileData.map((row) => ({
      username_list: row[fieldMapping.username] || "", // Nếu không có thì để trống
      role_list: shouldHideRoleList ? "5" : row[fieldMapping.role_list] || "" // Nếu bị ẩn thì là "5"
    }));
  
    try {
      const response = await axios.post(
        `${API_BASE_URL}/organizations/${selectedUnitId}/store_student`,
        { 
          username_list: mappedUsers.map(user => user.username_list),
          role_list: mappedUsers.map(user => user.role_list) // Không dùng `[0]` vì role_list là string
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );
  
      showPopup('success', 'Đã thêm nhân sự thành công!');
      setTimeout(() => {
        setRefresh((prev) => !prev);
      toggleUploadPopup(); // Đóng popup sau khi thành công
    }, 1500);
      
    } catch (error) {
      console.error("Error uploading data:", error.response ? error.response.data : error.message);
      showPopup('error', errorMessage);
    }
  };
  

  const deleteOrganization = async (organizationId) => {
    setLoading(true); // Hiển thị trạng thái loading
    try {
      await axios.delete(`${API_BASE_URL}/organizations/${organizationId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });
      console.log(`Tổ chức ${organizationId} đã được xóa thành công.`);
      setRefresh((prev) => !prev); // Làm mới dữ liệu bằng cách thay đổi state
    } catch (error) {
      console.error('Error deleting organization:', error.response ? error.response.data : error.message);
      setError("Không thể xóa tổ chức này.");
    } finally {
      setLoading(false); // Kết thúc trạng thái loading
    }
  };

  const shouldHideRoleList =
    account.organizations &&
    account.organizations.some((org) => org.pivot.role === 1);

  useEffect(() => {
    if (shouldHideRoleList) {
      setFieldMapping((prev) => ({ ...prev, role_list: "5" }));
    }
  }, [account]);


  return (
    <div className='w-full h-screen flex'>
      <Sidebar setRefresh={setRefresh} />

      <div className="flex-1 p-4 h-screen md:ml-64">
      { idAuth == 1 ? (
  <div id='membergroup6'>
    <h1 className='text-4xl font-bold m-8'>Các đơn vị trực thuộc</h1>
    {loading ? (
      <p>Loading...</p>
    ) : error ? (
      <p>{error}</p>
    ) : (
      <div className='h-full flex flex-col md:flex-row w-full mb-4'>
        <div className='mt-4 w-full px-4 h-auto'>
          <div className='overflow-y-auto w-full max-h-screen'>
            {isMobile ? (
               <>
               <select 
                 className="border rounded w-full p-2"
                 onChange={handleSelectChange}
               >
                 <option value="">Chọn đơn vị</option>
                 {organization.map((org) => (
                   <option key={org.id} value={org.id}>
                     {org.name}
                   </option>
                 ))}
               </select>
               {selectedOrgId && ( // Chỉ hiển thị nút khi có đơn vị được chọn
                 <button
                   onClick={handleButtonClick}
                   className="bg-blue-500 hover:bg-blue-700 text-white font-bold my-2 py-2 px-4 rounded w-full"
                 >
                   Upload File
                 </button>
               )}
             </>
            ) : (
              <List
              itemLayout="horizontal"
              dataSource={organization}
              renderItem={(organizations) => (
                <List.Item
                  onClick={(e) => {
                    // Kiểm tra xem sự kiện có phải đến từ nút "Delete" không
                    if (e.target.tagName !== 'BUTTON') {
                      toggleShowListUser(organizations.id, organizations.name);
                    }
                  }}
                  className="hover:bg-white min-w-[300px] rounded-md bg-slate-100 my-2"
                >
                  <List.Item.Meta
                    className="px-4 rounded-md border-b-1 border-solid border-neutral-500 w-full"
                    title={organizations.name}
                    description={organizations.description || ""} // Fallback for description
                  />
                  <button
                    onClick={() => toggleUploadPopup(organizations.id)}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold mx-2 py-2 px-4 rounded"
                  >
                    Upload File
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Ngừng sự kiện tiếp tục khi nhấn vào nút "Delete"
                      if (window.confirm(`Are you sure you want to delete ${organizations.name}?`)) {
                        deleteOrganization(organizations.id); // Gọi hàm xóa tổ chức và làm mới dữ liệu
                      }
                    }}
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Delete
                  </button>
                </List.Item>
              )}
            />
            )}
          </div>
          
        </div>
        {showListUser && (
          <div className='h-full mx-4 mt-4 w-full rounded-xl bg-slate-50 p-4'>
            <h1 className='mb-4 text-xl font-bold'>Danh sách nhân sự của {currentOrganizationName}</h1>
            <List
              itemLayout="horizontal"
              dataSource={listUser}
              renderItem={(listUsers) => (
                <List.Item className='hover:bg-white rounded-md bg-slate-100 mt-2'>
                  <List.Item.Meta
                    className='px-4 rounded-md border-b-1 border-solid border-neutral-500 w-full'
                    title={`${listUsers.last_name} ${listUsers.first_name}`}
                    description={`${listUsers.username}`}
                  />
                </List.Item>
              )}
            />
            <div className='w-full flex justify-center mb-4'>
              <Pagination
                current={currentPage}
                total={totalEvents}
                pageSize={10}
                onChange={handlePageChange}
                className="my-4"
              />
            </div>
          </div>
        )}
      </div>
    )}
  </div>
) : (
  // Check if the user has organizations with role === 1
  account.organizations && account.organizations.some(org => org.pivot.role === 1) ? (
    <div>
      <h1 className='text-4xl font-bold m-8'>Danh sách đơn vị quản lý</h1>
      <List
        itemLayout="horizontal"
        dataSource={account.organizations.filter(org => org.pivot.role === 1)} 
        renderItem={(org) => (
          <List.Item  className='hover:bg-white rounded-md bg-slate-100 my-2'>
            <List.Item.Meta
              onClick={() => toggleShowListUser(org.id, org.name)}
              className='px-4 rounded-md border-b-1 border-solid border-neutral-500 w-full'
              title={org.name}
              description={org.description || ""} 
            />
          
          <button
          onClick={() => toggleUploadPopup(org.id)}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Upload File
          </button>
          </List.Item>
        )}
        
      />
      {showListUser && (
          <div className='h-full mx-4 mt-4 w-full rounded-xl bg-slate-50 p-4'>
            <h1 className='mb-4 text-xl font-bold'>Danh sách nhân sự của {currentOrganizationName}</h1>
            <List
              itemLayout="horizontal"
              dataSource={listUser}
              renderItem={(listUsers) => (
                <List.Item className='hover:bg-white rounded-md bg-slate-100 mt-2'>
                  <List.Item.Meta
                    className='px-4 rounded-md border-b-1 border-solid border-neutral-500 w-full'
                    title={`${listUsers.last_name} ${listUsers.first_name}`}
                    description={`${listUsers.username}`}
                  />
                </List.Item>
              )}
              
            />

            <div className='w-full flex justify-center mb-4'>
              <Pagination
                current={currentPage}
                total={totalEvents}
                pageSize={10}
                onChange={handlePageChange}
                className="my-4"
              />
            </div>
          </div>
        )}
    </div>
  ) : (
    <p className='text-center m-8'>Không có đơn vị quản lý nào.</p> // Fallback message if no organizations are found
  )
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
      <h2 className="text-xl font-bold mb-4">Thêm nhân sự</h2>
      <input
        type="file"
        accept=".csv,.xlsx"
        onChange={handleFileUpload}
        className="mb-4"
      />

        {popup.show && (
                <div className={`fixed top-10 right-10 p-4 rounded shadow-md text-white ${popup.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
                    {popup.text}
                </div>
            )}

      {/* Field Mapping */}
      {fileData.length > 0 && (
           <div>
           <h3 className="text-lg font-bold mb-4">Mapping</h3>
           {Object.keys(fieldMapping).map((field) => {
             // Ẩn trường role_list nếu điều kiện đúng
             if (
               field === 'role_list' &&
               account.organizations &&
               account.organizations.some(org => org.pivot.role === 1)
             ) {
               return null;
             }
 
             return (
               <div key={field} className="mb-4">
                 <label className="block mb-2">{field}</label>
                 <select
                   name={field}
                   value={fieldMapping[field]}
                   onChange={(e) =>
                     setFieldMapping({ ...fieldMapping, [field]: e.target.value })
                   }
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
             );
           })}
        
          <button
            onClick={handleSubmit}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            Submit
          </button>
            </div>
          )}
                </div>
              </div>
            )}
      </div>
    </div>
  )
}

export default Organization