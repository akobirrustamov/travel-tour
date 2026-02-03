import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ApiCall from "../../config";
import Sidebar from "./Sidebar";
import { ToastContainer, toast } from "react-toastify";
import { isTokenExpired } from "../../config/token";

function AdminDashboard() {
  const [bookings, setBookings] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bookingEnabled, setBookingEnabled] = useState(true);
  const navigate = useNavigate();

  // refs для свайпа
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // === Свайп открытия бокового меню ===
  useEffect(() => {
    const handleTouchStart = (e) => {
      touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = (e) => {
      touchEndX.current = e.changedTouches[0].clientX;
      const deltaX = touchEndX.current - touchStartX.current;
      if (touchStartX.current < 50 && deltaX > 80) {
        setSidebarOpen(true);
      }
    };

    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  // === Проверка токена ===
  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token || isTokenExpired(token)) {
      localStorage.clear();
      navigate("/admin/login");
    }
  }, [navigate]);

  // === Request with Refresh Token ===
  const requestWithRefresh = async (
    url,
    method = "GET",
    data = null,
    params = null
  ) => {
    let res = await ApiCall(url, method, data, params);

    if (res && res.error && (res.data === 401 || res.data === 403)) {
      const refreshRes = await ApiCall(
        "/api/auth/refresh",
        "POST",
        null,
        null,
        false,
        true
      );
      if (refreshRes && !refreshRes.error) {
        localStorage.setItem("access_token", refreshRes.data.accessToken);
        res = await ApiCall(url, method, data, params);
      } else {
        localStorage.removeItem("access_token");
        navigate("/admin/login");
      }
    }
    return res;
  };

  // === Загрузка заявок ===
  const loadBookings = async () => {
    const res = await requestWithRefresh("/api/v1/room-booking", "GET");
    if (res && !res.error) {
      const onlineOnly = res.data.filter(
        (b) => !b.manual && b.bookingStatus < 3
      );
      setBookings(onlineOnly);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  // === Загрузка текущего статуса бронирования ===
  useEffect(() => {
    requestWithRefresh("/api/v1/settings/booking-status", "GET").then((res) => {
      if (res && !res.error) {
        setBookingEnabled(res.data.enabled); // 🔥 теперь res.data = true/false
      }
    });
  }, []);

  // === Обновление статуса заявки ===
  const updateStatus = async (id, status) => {
    const res = await requestWithRefresh(
      `/api/v1/room-booking/status/${id}/${status}`,
      "PUT"
    );
    if (res && !res.error) {
      toast.info(res.data || "Статус обновлён");
      await loadBookings();
    } else {
      toast.error("Ошибка при обновлении статуса");
    }
  };

  // === Тоггл блокировки бронирования ===
  const toggleBooking = async () => {
    const newState = !bookingEnabled;
    console.log(newState);

    const res = await requestWithRefresh(
      "/api/v1/settings/booking-status",
      "PUT",
      null,
      { enabled: newState }
    );
    console.log(res);

    if (res && !res.error) {
      setBookingEnabled(res.data.enabled); // 🔥 res.data — уже boolean из back-end
      toast.success(
        res.data.enabled ? "Бронирование включено" : "Бронирование выключено"
      );
    } else {
      toast.error("Ошибка обновления");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/admin/login");
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 1:
        return (
          <span className="px-2 py-1 bg-blue-100 text-blue-900 rounded text-xs">
            Создана
          </span>
        );
      case 2:
        return (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-900 rounded text-xs">
            В обработке
          </span>
        );
      case 3:
        return (
          <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
            Подтверждена
          </span>
        );
      case 4:
        return (
          <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">
            Отклонена
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">
            Неизвестно
          </span>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100 overflow-hidden">
      <ToastContainer position="top-right" autoClose={2000} />

      {/* === Бургер меню === */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden fixed top-4 left-4 z-50 bg-blue-500 text-white p-2 rounded-md shadow-lg"
        >
          ☰
        </button>
      )}

      {/* === Sidebar === */}
      <div
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 w-64 transition-transform duration-300 ease-in-out bg-gray-800`}
      >
        <Sidebar onLogout={handleLogout} />
      </div>

      {/* === Overlay === */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* === Основной контент === */}
      <main className="flex-1 p-4 lg:p-6 bg-gray-100 overflow-hidden">
        <h1 className="text-2xl text-center font-bold mb-6 ml-8">
          📋 Онлайн-заявки с сайта
        </h1>

        {/* === Кнопка управления Booking === */}
        <div className="flex justify-center mb-6">
          <button
            onClick={toggleBooking}
            className={`px-6 py-3 rounded-xl font-semibold shadow-md transition-all ${
              bookingEnabled
                ? "bg-red-500 hover:bg-red-600 text-white"
                : "bg-green-500 hover:bg-green-600 text-white"
            }`}
          >
            {bookingEnabled
              ? "Выключить бронирование"
              : "Включить бронирование"}
          </button>
        </div>

        <div className="bg-white rounded-xl shadow p-4 h-[calc(100vh-120px)] lg:h-fit flex flex-col">
          <div className="flex-1 overflow-auto rounded-lg border border-gray-200">
            {bookings.length === 0 ? (
              <p className="text-gray-500 text-center p-4">Нет новых заявок.</p>
            ) : (
              <table className="min-w-full border border-gray-200 text-sm">
                <thead>
                  <tr className="bg-gray-100 text-gray-700">
                    <th className="border px-3 py-2">ID</th>
                    <th className="border px-3 py-2">Клиент</th>
                    <th className="border px-3 py-2">Email</th>
                    <th className="border px-3 py-2">Телефон</th>
                    <th className="border px-3 py-2">Тип комнаты</th>
                    <th className="border px-3 py-2">Заезд</th>
                    <th className="border px-3 py-2">Выезд</th>
                    <th className="border px-3 py-2">Завтрак</th>
                    <th className="border px-3 py-2">Статус</th>
                    <th className="border px-3 py-2">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-gray-50 transition">
                      <td className="border px-3 py-2">{b.bookingId}</td>
                      <td className="border px-3 py-2">
                        {b.client ? b.client.fullName : "—"}
                      </td>
                      <td className="border px-3 py-2">{b.client.email}</td>
                      <td className="border px-3 py-2">{b.client.phone}</td>
                      <td className="border px-3 py-2">
                        {b.room?.roomType?.name || b.roomType || "—"}
                      </td>
                      <td className="border px-3 py-2">
                        {b.checkInTime
                          ? new Date(b.checkInTime).toLocaleDateString()
                          : ""}
                      </td>
                      <td className="border px-3 py-2">
                        {b.checkOutTime
                          ? new Date(b.checkOutTime).toLocaleDateString()
                          : ""}
                      </td>
                      <td className="border px-3 py-2">
                        {b.breakfast ? "Да" : "Нет"}
                      </td>
                      <td className="border px-3 py-2 text-center">
                        {getStatusBadge(b.bookingStatus)}
                      </td>
                      <td className="border px-3 py-2 text-center space-y-1 md:space-x-2">
                        {b.bookingStatus === 1 && (
                          <>
                            <button
                              onClick={() => updateStatus(b.id, 2)}
                              className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1 rounded transition w-full md:w-auto"
                            >
                              Взять в обработку
                            </button>
                            <button
                              onClick={() => updateStatus(b.id, 4)}
                              className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1 rounded transition w-full md:w-auto"
                            >
                              Отклонить
                            </button>
                          </>
                        )}
                        {b.bookingStatus === 2 && (
                          <>
                            <button
                              onClick={() => updateStatus(b.id, 3)}
                              className="bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1 rounded transition w-full md:w-auto"
                            >
                              Принять заявку
                            </button>
                            <button
                              onClick={() => updateStatus(b.id, 4)}
                              className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1 rounded transition w-full md:w-auto"
                            >
                              Отклонить
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;
