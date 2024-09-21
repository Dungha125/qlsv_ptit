import React, { useState } from 'react';
import AddEvent from './sources/AddEvent.jsx';
import ListEvent from './sources/ListEvent.jsx';
import CreateAccountForm from './sources/CreateAccountOrganization.jsx';
import Sidebar from './Sidebar.jsx';

const Home = () => {
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [showCreateAccount, setShowCreateAccount] = useState(false);

  const [refresh, setRefresh] = useState(false);




  const handleTogglePopup = () => {
    setShowAddEvent(!showAddEvent);
  };

  const handleCreatePopup = () => {
    setShowCreateAccount(!showCreateAccount);
  };
  const handleCreateEvent = () => {
    setRefresh(!refresh);
    setShowCreateAccount(false);
  }
  const handleAddEvent = () => {
    setRefresh(!refresh); 
    setShowAddEvent(false); 
  };

  


  
  return (
    <div className='w-full h-full flex'>
      <Sidebar />

      <div className="flex-1 p-4 md:ml-64">
        
        <ListEvent key={refresh}/>
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
              <AddEvent  onAddEvent={handleAddEvent} />
            </div>
          </div>
        </div>
        )}
        {
  showCreateAccount && (
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
          <CreateAccountForm onAddEvent={handleCreateEvent} /> {/* Đảm bảo truyền tham số đúng */}
        </div>
      </div>
    </div>
  )
}
        
      </div>
    </div>
  );
};

export default Home;
