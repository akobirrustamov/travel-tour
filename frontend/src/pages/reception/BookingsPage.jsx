import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { ToastContainer } from "react-toastify";
import Sidebar from "./Sidebar";
import BookingsTable from "./BookingsTable";

function BookingsPage() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/admin/login");
  };

  // ✅ проверка токена
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) navigate("/admin/login");
  }, []);

  // ✅ свайп для открытия меню
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

  return (
    <div className="flex min-h-screen bg-gray-100 overflow-hidden">
      {/* === Бургер (только если меню закрыто) === */}
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
        <ToastContainer position="top-right" autoClose={2000} />
        <h1 className="text-2xl font-bold mb-4 text-center">
          Таблица бронирований
        </h1>

        {/* === Контейнер таблицы с изолированным скроллом === */}
        <div className="bg-white rounded-xl shadow p-4 h-[calc(100vh-120px)] lg:h-fit flex flex-col">
          <div className="flex-1 overflow-auto rounded-lg border border-gray-200">
            <BookingsTable />
          </div>
        </div>
      </main>
    </div>
  );
}

export default BookingsPage;
