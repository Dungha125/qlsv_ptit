import React, { useState, useEffect } from "react";
import axios from "axios";

// API base URL
const API_BASE_URL = "https://qldv-api.toiyeuptit.com/api";

const Vanphongdoan = () => {
  const [token, setToken] = useState(localStorage.getItem("authToken"));
  const [userInfo, setUserInfo] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(!!token);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMess, setErrorMess] = useState(""); // To handle error message
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [selectedShifts, setSelectedShifts] = useState({}); // Lưu các ca làm việc đã chọn

  const days = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6"];
  const shifts = [
    "7h00-9h30",
    "9h30-12h00",
    "14h00-16h00",
    "16h00-17h30",
  ];

  const getCurrentWeek = () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - dayOfWeek + 1);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    return {
      startOfWeek,
      endOfWeek,
    };
  };

  const { startOfWeek, endOfWeek } = getCurrentWeek();

  useEffect(() => {
    if (token) {
      fetchUserInfo();
    }
  }, [token]);

  const fetchUserInfo = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.code === 200) {
        setUserInfo(response.data.data);
      } else {
        alert("Không thể lấy thông tin người dùng.");
      }
    } catch (error) {
      alert("Lỗi kết nối khi lấy thông tin người dùng.");
    }
  };

  const handleLogin = async () => {
    setIsSubmitting(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/login`,
        { username, password }
      );

      if (response.data) {
        const token = response.data.access_token;
        const AuthId = response.data.user.id;
        localStorage.setItem('authToken', token); 
        localStorage.setItem('authID', AuthId);
        window.location.reload(); 
      } else {
        setErrorMess('Invalid credentials');
      }
    } catch (error) {
      console.error('Login failed:', error);
      setErrorMess('Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async () => {
    if (!isLoggedIn) {
      setShowLoginPopup(true);
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/register-shift`, // Thay đổi đường dẫn API nếu cần
        { shifts: selectedShifts }, // Gửi các ca làm việc đã chọn
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.code === 200) {
        alert("Đăng ký lịch trực thành công!");
      } else {
        alert("Đăng ký lịch trực thất bại. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Đăng ký thất bại:", error);
      alert("Có lỗi xảy ra trong quá trình đăng ký.");
    }
  };

  const handleShiftChange = (day, shift) => {
    setSelectedShifts((prevState) => {
      const dayShifts = prevState[day] || [];
      if (dayShifts.includes(shift)) {
        return {
          ...prevState,
          [day]: dayShifts.filter((s) => s !== shift),
        };
      } else {
        return {
          ...prevState,
          [day]: [...dayShifts, shift],
        };
      }
    });
  };

  return (
    <div className="p-4">
      {!isLoggedIn ? (
        <button onClick={() => setShowLoginPopup(true)} className="bg-blue-500 text-white px-4 py-2 rounded">
          Đăng nhập
        </button>
      ) : (
        <div>
          <h1 className="text-xl font-bold mb-4">Xin chào, {userInfo?.last_name} {userInfo?.first_name}</h1>
          {userInfo?.id === 1 ? (
            <div>
              <h2>Chọn tuần để đăng ký:</h2>
              <p>Từ: {startOfWeek.toDateString()} đến {endOfWeek.toDateString()}</p>
            </div>
          ) : (
            <div>
              <h2 className="bg-green-500 text-white px-4 py-2 rounded">Đăng ký lịch trực tuần {startOfWeek.toDateString()} - {endOfWeek.toDateString()}</h2>
            </div>
          )}
        </div>
      )}

      {showLoginPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <h2 className="text-lg font-bold">Đăng nhập</h2>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Tên người dùng"
              className="border p-2 my-2 w-full"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mật khẩu"
              className="border p-2 my-2 w-full"
            />
            <button
              onClick={handleLogin}
              disabled={isSubmitting}
              className="bg-blue-500 text-white px-4 py-2 mt-2 rounded"
            >
              {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
            <button
              onClick={() => setShowLoginPopup(false)}
              className="bg-gray-500 text-white px-4 py-2 mt-2 rounded"
            >
              Đóng
            </button>
            {errorMess && <p className="text-red-500">{errorMess}</p>}
          </div>
        </div>
      )}

      <div className="overflow-x-auto mt-4">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="border p-2">Ngày</th>
              {shifts.map((shift) => (
                <th key={shift} className="border p-2">{shift}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {days.map((day) => (
              <tr key={day}>
                <td className="border p-2">{day}</td>
                {shifts.map((shift) => (
                  <td key={shift} className="border p-2 text-center">
                    <input
                      type="checkbox"
                      onChange={() => handleShiftChange(day, shift)}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
        onClick={handleRegister}
      >
        Xác nhận đăng ký
      </button>
    </div>
  );
};

export default Vanphongdoan;
