import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ApiCall from "../../config";
import Sidebar from "./Sidebar";

function AdminDashboard() {
  const [bookings, setBookings] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const navigate = useNavigate();

  // ✅ Проверка токена
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) navigate("/admin/login");
  }, []);

  // ✅ Свайп для открытия меню (как в BookingsPage)
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

  // ✅ API-запрос с refresh
  const requestWithRefresh = async (
    url,
    method = "GET",
    data = null,
    params = null
  ) => {
    let res = await ApiCall(url, method, data, params);

    if (res && res.error && (res.data === 401 || res.data === 403)) {
      const refreshRes = await ApiCall(
        "/api/admin/refresh",
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

  useEffect(() => {
    loadBookings();
  }, [navigate]);

  const loadBookings = async () => {
    const res = await requestWithRefresh("/api/v1/room-booking", "GET");
    if (res && !res.error) {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // начало сегодняшнего дня

      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1); // завтрашний день для сравнения диапазона

      // ✅ фильтруем все брони, у которых статус = 3 и дата заезда = сегодня
      const todayBookings = res.data.filter((b) => {
        if (!b.checkInTime) return false;

        const checkIn = new Date(b.checkInTime);
        return (
          b.bookingStatus === 3 && checkIn >= today && checkIn < tomorrow // только сегодняшние заезды
        );
      });

      setBookings(todayBookings);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/admin/login");
  };

  return (
    <div className="flex min-h-screen bg-gray-100 overflow-hidden">
      {/* === Бургер (если меню закрыто) === */}
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

      {/* === Overlay (фон при открытии) === */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* === Основной контент === */}
      <main className="flex-1 p-4 lg:p-6 bg-gray-100 overflow-hidden">
        <h1 className="text-2xl font-bold mb-4 text-center">
          Новые бронирования
        </h1>

        <div className="bg-white rounded-xl shadow p-4 h-[calc(100vh-120px)] lg:h-fit flex flex-col">
          <div className="flex-1 overflow-auto rounded-lg border border-gray-200">
            {bookings.length === 0 ? (
              <p className="p-4 text-center text-gray-500">
                Пока нет бронирований.
              </p>
            ) : (
              <table className="min-w-full border border-gray-200 text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border px-4 py-2">ID</th>
                    <th className="border px-4 py-2">Комната</th>
                    <th className="border px-4 py-2">Клиент</th>
                    <th className="border px-4 py-2">Заезд</th>
                    <th className="border px-4 py-2">Выезд</th>
                    <th className="border px-4 py-2">Завтрак</th>
                    <th className="border px-4 py-2">Статус</th>
                    <th className="border px-4 py-2">Цена</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b.id}>
                      <td className="border px-4 py-2">{b.bookingId}</td>
                      <td className="border px-4 py-2">
                        {b.room ? b.room.id : "—"}
                      </td>
                      <td className="border px-4 py-2">
                        {b.client ? b.client.fullName : "—"}
                      </td>
                      <td className="border px-4 py-2">
                        {b.checkInTime
                          ? new Date(b.checkInTime).toLocaleDateString()
                          : ""}
                      </td>
                      <td className="border px-4 py-2">
                        {b.checkOutTime
                          ? new Date(b.checkOutTime).toLocaleDateString()
                          : ""}
                      </td>
                      <td className="border px-4 py-2">
                        {b.breakfast ? "Да" : "Нет"}
                      </td>
                      <td className="border px-4 py-2">
                        {b.status ? "Активен" : "Отменён"}
                      </td>
                      <td className="border px-4 py-2">{b.price} UZS</td>
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
