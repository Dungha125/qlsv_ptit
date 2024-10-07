import axios from 'axios';
import React, { useEffect, useState } from 'react'
import Sidebar from './Sidebar';
import { List, Pagination, Spin } from 'antd';
import Papa from 'papaparse'; 
import * as XLSX from 'xlsx'; 

const Organization = () => {
  const [refresh, setRefresh] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [organization, setOrganization] = useState([]);
  const [listUser, setListUser] = useState([]);
  const token = localStorage.getItem('authToken');
  const [showUploadPopup, setShowUploadPopup] = useState(false);
  const [fileData, setFileData] = useState([]);
  const [fieldMapping, setFieldMapping] = useState({
    username_list: '',
    role_list: '',
  });
  const [selectedUnitId, setSelectedUnitId] = useState("");
  const [selectedOrga, setSelectedOrga] = useState("");
  const [showListUser, setShowListUser] = useState(false);
  const [currentPage, setCurrentPage] = useState(1); 
  const [totalEvents, setTotalEvents] = useState(0); 
  const [totalPages, setTotalPages] = useState(0);


  const toggleUploadPopup = () => {
    setShowUploadPopup(!showUploadPopup);
  };

  const handleUnitChange = (e) => {
    setSelectedUnitId(e.target.value); 
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  useEffect(()=>{
    const fecthOrgani = async () => {
      try{
        const response = await axios.get('https://dtn-event-api.toiyeuptit.com/api/organizations',
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
      setError("No token found");
      setLoading(false);
    }
    return ()=>{

    };
  }, [token]);



  const fetchList = async (organizationId) => {
    setLoading(true); // Set loading state while fetching data
    try {
      const response = await axios.get(`https://dtn-event-api.toiyeuptit.com/api/organizations/${organizationId}/user_list`, {
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
        setError("Unexpected data format");
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


  const toggleShowListUser = (organizationId) => {
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
        <h1 className='text-4xl font-bold m-8'>Các đơn vị trực thuộc</h1>
        {loading ? (
            <p>Loading...</p>
            ) : error ? (
              <p>Error: {error}</p>
            ) : (
        
            <div className='h-full flex flex-col md:flex-row w-full '>
         
          <div className='mt-4 md:max-w-[30%] w-full px-4'>
            <List
              itemLayout="horizontal"
              dataSource={organization}
              renderItem={(organizations) => (
                <List.Item onClick={() => toggleShowListUser(organizations.id)} className=' hover:bg-white rounded-md bg-slate-100 my-2'>
                  <List.Item.Meta
                    className='px-4 rounded-md border-b-1 border-solid border-neutral-500 w-full'
                    title={`${organizations.name}`}
                    description={organizations.description}
                  />
                </List.Item>
              )}/>
              <button
                onClick={toggleUploadPopup}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded  "
              >
                Upload File
              </button>
          </div>
          {showListUser && (
            <div className='h-full mx-4 mt-4 w-full rounded-xl bg-slate-50 p-4'>
              <h1 className='mb-4 text-xl font-bold'>Danh sách nhân sự của đơn vị</h1>
              <List
              itemLayout="horizontal"
              dataSource={listUser}
              renderItem={(listUsers) => (
                <List.Item onClick={toggleShowListUser} className=' hover:bg-white rounded-md bg-slate-100 mt-2'>
                  <List.Item.Meta
                    className='px-4 rounded-md border-b-1 border-solid border-neutral-500 w-full'
                    title={`${listUsers.last_name} ${listUsers.first_name}`}
                    description = {`${listUsers.username}`}
                  />
                </List.Item>
              )}/>
              <div className='w-full flex justify-center'>
                <Pagination
                  current={currentPage}
                  total={totalEvents}
                  pageSize={10}
                  onChange={handlePageChange}
                  className="mt-4 "
                />
          </div>
            </div>
          )          }
       </div>
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

      {/* Field Mapping */}
      {fileData.length > 0 && (
          <div>
          <h3 className="text-lg font-bold mb-4">Mapping</h3>
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
                  <option value="2">LCĐ Công nghệ thông tin 1</option>
                  <option value="3">LCĐ Kỹ thuật Điện tử 1</option>
                  <option value="4">LCĐ Viễn thông 1</option>
                  <option value="2699">LCĐ Quản trị kinh doanh 1</option>
                  <option value="2700">LCĐ Tài chính kế toán 1</option>
                  <option value="5">LCĐ Viện kinh tế Bưu điện</option>
                  <option value="2702">LCĐ Viện KHKTBD</option>


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
