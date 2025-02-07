import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { List, Spin, Pagination, Modal } from 'antd';
import { useNavigate } from 'react-router-dom';
import EditEventForm from './EditEventForm';

const ListEvent = ({ setUser }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalEvents, setTotalEvents] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const token = localStorage.getItem('authToken');
  const UserId = localStorage.getItem('authID');
  const navigate = useNavigate();
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  const apiUrl =
    `${UserId}` === '1'
      ? `${API_BASE_URL}/events`
      : `${API_BASE_URL}/users/${UserId}/event`;

  // Fetch data
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        params: {
          page: currentPage,
          per_page: 10,
        },
      });
      const { data, total } = response.data;
      if (Array.isArray(data)) {
        setEvents(data);
        setTotalEvents(total);
        setTotalPages(Math.ceil(total / 10));
      } else {
        console.error("Expected 'data' to be an array but received:", data);
        setError('Unexpected data format');
      }
    } catch (error) {
      console.error(
        'Error fetching events:',
        error.response ? error.response.data : error.message
      );
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchData();
    } else {
      setError('No token found');
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, currentPage]);

  const handleEventClick = (eventId) => {
    navigate(`events/${eventId}`);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Delete event
  const handleDeleteEvent = async (eventId) => {
    try {
      setLoading(true);
      await axios.delete(`${API_BASE_URL}/events/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Reload data after deleting
      fetchData();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Edit event
  const handleEditEvent = (event) => {
    setSelectedEvent(event);
    setIsEditModalVisible(true);
  };

  const handleEventUpdate = () => {
    setIsEditModalVisible(false);
    fetchData(); // Re-fetch the events list after editing
  };

  return (
    <div className="w-full h-screen flex border-r-2">
      <div className="flex-1 p-8">
        <h1 className="w-full text-2xl font-bold mb-4">Sự kiện</h1>
        {loading ? (
          <Spin size="large" />
        ) : error ? (
          <p>Error: {error}</p>
        ) : (
          <div className="w-full flex flex-col">
            <div className="w-full">
              <List
                itemLayout="horizontal"
                dataSource={events}
                renderItem={(event) => (
                  <List.Item className="hover:bg-slate-100 flex">
                    <List.Item.Meta
                      onClick={() => handleEventClick(event.id)}
                      title={event.name}
                      description={`Start: ${event.start_at} - End: ${event.finish_at}`}
                    />
                    <span
                      className={`mx-4 gap-2 ${
                        UserId === '1' ? 'flex' : 'hidden'
                      }`}
                    >
                      <button
                        onClick={() => handleEditEvent(event)}
                        className="p-2 bg-green-500 text-white rounded-md z-60"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(event.id)}
                        className="p-2 bg-red-500 text-white rounded-md z-60"
                      >
                        Xoá
                      </button>
                    </span>
                  </List.Item>
                )}
              />
            </div>
            <div className="w-full flex justify-center mb-6">
              <Pagination
                current={currentPage}
                total={totalEvents}
                pageSize={10}
                onChange={handlePageChange}
                className="mt-4"
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
          <EditEventForm event={selectedEvent} onClose={handleEventUpdate} />
        </Modal>
      )}
    </div>
  );
};

export default ListEvent;
