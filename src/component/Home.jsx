import React, { useState } from 'react';
import ListEvent from './sources/ListEvent.jsx';
import Sidebar from './Sidebar.jsx';
import TopUser from './sources/TopUser.jsx';

const Home = () => {
  const [refresh, setRefresh] = useState(false);
  const userId = localStorage.getItem('authID');
  

  return (
    <div className='w-full h-full flex'>
      <Sidebar setRefresh={setRefresh} /> {/* Pass setRefresh as a prop */}
      
      <div className="flex-1 p-4 md:ml-64">
        <div className='flex flex-col md:flex-row'>
          <ListEvent key={refresh} /> {/* Refresh when refresh state changes */}
          {userId == 1 && (
          <TopUser className='relative hidden md:block'/>
          )}
        </div>
        
      </div>
      
      
    </div>
  );
};

export default Home;
