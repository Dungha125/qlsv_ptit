import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Home = () => {
  const [profile, setProfile] = useState(null);
  const [errorMess, setErrorMess] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('authToken'); 
        if (!token) {
          setErrorMess('No authentication token found.');
          setLoading(false);
          return;
        }

        const response = await axios.get(
          'https://dtn-event-api.toiyeuptit.com/api/auth/profile',
          {
            headers: {
              'Accept': 'application/json',
       'Authorization': `Bearer ${token}`,
            },
            params: {
              with_trashed: false // Or true if needed
            }
          }
        );

        // Handle API response based on the provided structure
        if (response.data.code === 200) {
          setProfile(response.data.data);
        } else {
          setErrorMess(`Error: ${response.data.message || 'An error occurred'}`);
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        
        // Provide more detailed error handling
        if (error.response) {
          console.error('Server responded with an error:', error.response.data);
          setErrorMess(`Server error: ${error.response.data.message || 'An error occurred'}`);
        } else if (error.request) {
          console.error('No response received from server:', error.request);
          setErrorMess('No response received from server. Please try again.');
        } else {
          console.error('Error setting up the request:', error.message);
          setErrorMess('Error setting up the request. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return <p>Loading profile...</p>;
  }

  return (
    <div className='w-full h-screen flex flex-col items-center justify-center p-4'>
      <h1 className='text-2xl font-bold'>Welcome to Home Page</h1>
      {errorMess ? (
        <p className='text-red-600'>{errorMess}</p>
      ) : (
        profile && (
          <div className='mt-4'>
            <h2 className='text-xl'>User Profile</h2>
            <p><strong>Username:</strong> {profile.username}</p>
            <p><strong>Email:</strong> {profile.email}</p>
            {/* Display other profile information if needed */}
          </div>
        )
      )}
    </div>
  );
};

export default Home;
