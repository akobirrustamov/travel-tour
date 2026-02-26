import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ApiCall from "../../config";
import Sidebar from "./Sidebar";

function Dashboard() {
  const [bookings, setBookings] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const navigate = useNavigate();

  // ✅ Проверка токена
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) navigate("/admin/login");
  }, [navigate]);

  // ✅ Свайп для открытия меню (как в BookingsPage)
  useEffect(() => {
    const handleTouchStart = (e) => {
      touchStartX.current = e.touches[0].clientX;
    };
    const handleTouchEnd = (e) => {
      touchEndX.current = e.changedTouches[0].clientX;
      const deltaX = touchEndX.current - touchStartX.current;
      if (touchStartX.current < 50 && deltaX > 80) setSidebarOpen(true);
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
      today.setHours(0, 0, 0, 0);

      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      const dayAfterTomorrow = new Date(today);
      dayAfterTomorrow.setDate(today.getDate() + 2);

      // ✅ фильтр:
      //  - bookingStatus === 3
      //  - breakfast === true
      //  - заезды сегодня или завтра
      //  - или проживание охватывает завтрашний день
      const filtered = res.data.filter((b) => {
        if (b.bookingStatus !== 3 || !b.breakfast) return false;
        if (!b.checkInTime || !b.checkOutTime) return false;

        const checkIn = new Date(b.checkInTime);
        const checkOut = new Date(b.checkOutTime);

        // заселились сегодня или завтра
        const arrivesTodayOrTomorrow =
          checkIn >= today && checkIn < dayAfterTomorrow;

        // или уже заселились ранее, но ещё не выехали завтра
        const staysOverTomorrow = checkOut >= tomorrow;

        return arrivesTodayOrTomorrow || staysOverTomorrow;
      });
      setBookings(filtered);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/admin/login");
  };

  // ✅ функция подсчёта количества человек
  const getPeopleCount = (booking) => {
    const { guestsCount } = booking;
    const roomTypeName = booking.room?.roomType?.name?.toLowerCase() || "";   

    // Если guestsCount указан — берём его напрямую
    if (guestsCount && guestsCount > 0) {
      return guestsCount;
    }

    // Если guestsCount нет — определяем по типу комнаты
    if (roomTypeName.includes("double") || roomTypeName.includes("twin"))
      return 2;
    if (roomTypeName.includes("triple")) return 3;

    return 1;
  };

  // ✅ общее количество человек
  const totalPeople = bookings.reduce((acc, booking) => {
    return acc + getPeopleCount(booking);
  }, 0);

  return (
    <div className="flex min-h-screen bg-gray-100 overflow-hidden">
      {/* === Бургер === */}
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

      {/* === Контент === */}
      <main className="flex-1 p-4 lg:p-6 bg-gray-100 overflow-hidden">
        <h1 className="text-2xl font-bold mb-4 text-center">
          ☀️ Завтраки — Заезды сегодня и завтра
        </h1>

        <div className="bg-white rounded-xl shadow p-4 h-[calc(100vh-120px)] lg:h-fit flex flex-col">
          <div className="flex-1 overflow-auto rounded-lg border border-gray-200">
            {bookings.length === 0 ? (
              <p className="p-4 text-center text-gray-500">
                Пока нет подходящих бронирований.
              </p>
            ) : (
              <table className="min-w-full border border-gray-200 text-sm text-center">
                <thead>
                  <tr className="bg-gray-100 text-gray-700">
                    <th className="border px-4 py-2">Комната</th>
                    <th className="border px-4 py-2">Кол-во человек</th>
                    <th className="border px-4 py-2">Комментарий повару</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => {
                    const roomName = b.room?.roomName || "—";
                    const peopleCount = getPeopleCount(b);
                    return (
                      <tr key={b.id} className="hover:bg-gray-50 transition">
                        <td className="border px-4 py-2 font-semibold text-slate-800">
                          {roomName}
                        </td>
                        <td className="border px-4 py-2">{peopleCount}</td>
                        <td className="border px-4 py-2 text-left">
                          {b.toCook || "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* === Общее количество человек === */}
          <div className="pt-4 border-t border-gray-200 text-right font-semibold text-slate-700">
            Общее количество человек:{" "}
            <span className="text-blue-600">{totalPeople}</span>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
