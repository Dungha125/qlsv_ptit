import React from 'react';

import { List, Spin } from 'antd';


const ListUserParticipate = ({ participants }) => {




  if (!participants) {
    return <Spin size="large" />;
  }

  


  return (
    <div className="w-full p-4">
        
          <List
            itemLayout="horizontal"
            dataSource={participants}
            renderItem={(participant) => (
              <List.Item className=' hover:bg-white rounded-md bg-slate-50'>
                <List.Item.Meta
                  className='px-4 rounded-md border-b-1 border-solid border-neutral-500 w-full'
                  title={`${participant.last_name} ${participant.first_name}`}
                  description={participant.username}
                />
              </List.Item>
            )}
          />
   
    </div>
  );
};

export default ListUserParticipate;
