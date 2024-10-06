import React from 'react'
import { useNavigate } from 'react-router-dom';

const Organization = () => {
    const navigate = useNavigate();
    const handleBackClick = () => {
        navigate(`/home`);
      };
  return (
    <div className="p-4">
      <div className="w-full bg-red-500 fixed top-0 left-0 h-12 z-20">
        <button className="h-12 flex items-center mx-8 text-white font-bold" onClick={handleBackClick}>
          Quay lại
        </button>
      </div>
    </div>
  )
}

export default Organization
