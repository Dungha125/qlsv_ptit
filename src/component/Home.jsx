import React, {  useState } from 'react';
import AddEvent from './sources/AddEvent.jsx';
import ListEvent from './sources/ListEvent.jsx';

const Home = () => {
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [refresh, setRefresh] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleTogglePopup = () => {
    setShowAddEvent(!showAddEvent);
  };

  const handleAddEvent = () => {
    setRefresh(!refresh); // Trigger refresh
    setShowAddEvent(false); // Close the popup
  };

  return (
    <div className='w-full h-full flex'>
      <button
        onClick={toggleSidebar}
        className="md:hidden p-4 text-white bg-gray-800 fixed top-0 left-0 z-50"
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
          <li className="mb-4 hover:bg-gray-700 p-2 rounded cursor-pointer">Tài khoản</li>
          <li className="mb-4 hover:bg-gray-700 p-2 rounded cursor-pointer">Sự kiện</li>
          <li className="mb-4 hover:bg-gray-700 p-2 rounded cursor-pointer">Học kỳ</li>
          <li className="mb-4 hover:bg-gray-700 p-2 rounded cursor-pointer">Tổ chức</li>
        </ul>
        <button
          onClick={handleTogglePopup}
          className='bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline'
        >
          Tạo sự kiện
        </button>
      </div>
        
      
    
      <div className="flex-1 p-4 md:ml-64">
        
        <ListEvent key={refresh}/>
        {showAddEvent && (
          <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white p-6 rounded-lg shadow-xl max-w-lg w-full relative py-[2rem]'>
            <h1 className='text-2xl font-bold mb-4 text-center'>Tạo sự kiện mới</h1>
            {/* Close Button */}
            <button
              onClick={handleTogglePopup}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
            {/* Popup Content */}
            <div className='overflow-auto max-h-[80vh]'>
              <AddEvent  onAddEvent={handleAddEvent} />
            </div>
          </div>
        </div>
        )}
        
      </div>
    </div>
  );
};

export default Home;
