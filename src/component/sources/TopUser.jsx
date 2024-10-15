import React, { useState, useEffect } from 'react';
import { List, Spin, Select } from 'antd';
import axios from 'axios';
import moment from 'moment';

const { Option } = Select;

const TopUser = ({ className }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [semesters, setSemesters] = useState([]);
  const [semesterId, setSemesterId] = useState(null);
  const token = localStorage.getItem('authToken');
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    const fetchSemesters = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/semesters`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        });
        const semesterData = response.data.data;
        setSemesters(semesterData);
        const today = moment();
        const currentSemester = semesterData.find(
          (semester) => moment(semester.startDate).isBefore(today) && moment(semester.endDate).isAfter(today)
        );

        if (currentSemester) {
          setSemesterId(currentSemester.id);
        } else if (semesterData.length > 0) {
          setSemesterId(semesterData[0].id); // Default to the first semester (usually the latest)
        }
      } catch (error) {
        console.error('Error fetching semesters:', error);
        setError('Error fetching semesters.');
      }
    };

    fetchSemesters();
  }, [token]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/events/top_users`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        params: {
          page: 1,
          per_page: 10,
          semester_id: semesterId, // Use selected semester ID
        },
      });
      setUsers(response.data.data);
    } catch (error) {
      console.error('Error fetching top users:', error.response ? error.response.data : error.message);
      setError('Error fetching top users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && semesterId) {
      fetchData();
    }
  }, [token, semesterId]);

  const handleSemesterChange = (value) => {
    setSemesterId(value); 
  };

  return (
    <div className={`w-[300px] h-[40%] rounded-md border-slate-100 bg-white top-0 right-0 ${className}`}>
      <div className="p-2">
        <h2 className='font-bold text-blue-700 text-2xl my-4'>Top 10</h2>

        <Select
          style={{ width: '100%' }}
          placeholder="Lựa chọn học kỳ"
          onChange={handleSemesterChange}
          value={semesterId}
          className='my-2'
        >
          {semesters.map((semester) => (
            <Option key={semester.id} value={semester.id}>
              {semester.name}
            </Option>
          ))}
        </Select>

        {loading ? (
          <Spin size="large my-2" />
        ) : error ? (
          <p>Error: {error}</p>
        ) : (
          <div className="w-full flex flex-col mt-4">
            <div className="w-full h-[80%]">
              <List
                itemLayout="horizontal"
                dataSource={users}
                renderItem={(user) => (
                  <List.Item className="hover:bg-slate-100 flex items-center">
                    <List.Item.Meta
                      title={user.username}
                      description={`${user.last_name} ${user.first_name}`}
                    />
                    <span className='font-medium text-blue-500 px-4 text-xl'>{user.events_count}</span>
                  </List.Item>
                )}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopUser;
