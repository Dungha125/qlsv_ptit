import React, { useState } from 'react';
import ListEvent from './sources/ListEvent.jsx';
import Sidebar from './Sidebar.jsx';
import TopUser from './sources/TopUser.jsx';

const Home = () => {
  const [refresh, setRefresh] = useState(false);
  

  return (
    <div className='w-full h-full flex'>
      <Sidebar setRefresh={setRefresh} /> {/* Pass setRefresh as a prop */}
      
      <div className="flex-1 p-4 md:ml-64">
        <ListEvent key={refresh} /> {/* Refresh when refresh state changes */}
        
      </div><TopUser className='relative'/>
    </div>
  );
};

export default Home;
