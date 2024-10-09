import axios from 'axios';
import React, { useEffect, useState, useCallback } from 'react'; // Added useCallback
import { useNavigate } from 'react-router-dom';
import AddEvent from './sources/AddEvent';
import { List, Spin, Modal } from 'antd';
import AddSemester from './sources/AddSemester';
import EditSemesForm from './sources/EditSemesterForm';
import Sidebar from './Sidebar';

const Semester = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('authToken');
  const [semester, setSemester] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [showAddSemes, setShowAddSemes] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedSemes, setSelectedSemes] = useState(null);

  const handleClickSemesDetail = (semesterId) => {
    navigate(`/semester/${semesterId}`);
  };

  const handleAddEvent = () => {
    setRefresh(!refresh);
    setShowAddEvent(false);
  };

  const handleDeleteSemester = async (semesterId) => {
    try {
      setLoading(true); // Start loading when deleting
      await axios.delete(`https://qldv-api.toiyeuptit.com/api/semesters/${semesterId}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          Accept: 'application/json'},
      });
      fetchSemes(); // Refetch the semesters list after deletion
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false); // End loading
    }
  };

  const handleEditSemes = (semester) => {
    setSelectedSemes(semester); // Set the selected semester
    setIsEditModalVisible(true); // Open the modal
  };

  const handleSemesUpdate = () => {
    setIsEditModalVisible(false);
    fetchSemes(); // Re-fetch the semesters list after editing
  };

  const fetchSemes = useCallback(async () => {
    try {
      const response = await axios.get('https://qldv-api.toiyeuptit.com/api/semesters', {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });
      const dataArray = response.data.data;
      setSemester(dataArray);
    } catch (error) {
      console.error('Error fetching semester data:', error.response ? error.response.data : error.message);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [token]); // Added token as a dependency

  useEffect(() => {
    if (token) {
      fetchSemes();
    } else {
      setError("No token found");
      setLoading(false);
    }
  }, [token, fetchSemes]); // Added fetchSemes to the dependency array

  const handleTogglePopup = () => {
    setShowAddEvent(!showAddEvent);
  };

  const handleShowPopupSemes = () => {
    setShowAddSemes(!showAddSemes);
  };

  return (
    <div className='w-full h-full flex'>
      <Sidebar setRefresh={setRefresh} />
      <div className='flex-1 p-4 md:ml-64'>
        <div className="flex-1 p-4">
          <h1 className='text-4xl font-bold mb-4'>Học kỳ</h1>
          <button
            onClick={handleShowPopupSemes}
            className='bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline'
          >
            Tạo học kỳ
          </button>
          {showAddSemes && (
            <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
              <div className='bg-white p-6 rounded-lg shadow-xl max-w-lg w-full relative py-[2rem]'>
                <h1 className='text-2xl font-bold mb-4 text-center'>Tạo học kỳ mới</h1>
                <button
                  onClick={handleShowPopupSemes}
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
                <div className='overflow-auto max-h-[80vh]'>
                  <AddSemester />
                </div>
              </div>
            </div>
          )}
          {loading ? (
            <Spin size="large" />
          ) : error ? (
            <p>Error: {error}</p>
          ) : (
            <div className='w-full flex flex-col mt-4'>
              <div className='w-full h-[80%]'>
                <List
                  itemLayout="horizontal"
                  dataSource={semester}
                  renderItem={(semesters) => (
                    <List.Item className='hover:bg-slate-100 flex'>
                      <List.Item.Meta
                        onClick={() => handleClickSemesDetail(semesters.id)}
                        title={semesters.name}
                        description={`Start: ${semesters.start_at} - End: ${semesters.finish_at}`}
                      />
                      <span className='mx-4 flex gap-2'>
                        <button onClick={() => handleEditSemes(semesters)} className='p-2 bg-green-500 text-white rounded-md z-60'>Sửa</button>
                        <button onClick={() => handleDeleteSemester(semesters.id)} className='p-2 bg-red-500 text-white rounded-md z-60'>Xoá</button>
                      </span>
                    </List.Item>
                  )}
                />
              </div>
            </div>
          )}
        </div>
        {isEditModalVisible && (
          <Modal
            visible={isEditModalVisible}
            onCancel={() => setIsEditModalVisible(false)}
            footer={null}
          >
            <EditSemesForm semester={selectedSemes} onClose={handleSemesUpdate} />
          </Modal>
        )}
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
      </div>
    </div>
  );
}

export default Semester;
