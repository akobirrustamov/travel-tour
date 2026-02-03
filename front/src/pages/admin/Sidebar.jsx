import { useNavigate, useLocation } from "react-router-dom";

function Sidebar({ onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const getButtonClass = (path) => {
    const isActive = location.pathname === path;
    return `
      block w-full text-left px-4 py-2 rounded-lg font-medium transition-colors
      ${
        isActive
          ? "bg-blue-600 text-white shadow-md"
          : "text-gray-200 hover:bg-gray-700 hover:text-white"
      }
    `;
  };

  return (
    <aside className="w-64 bg-gray-800 text-white p-6 flex flex-col justify-between min-h-screen">
      <div>
        <h2 className="text-2xl font-bold mb-8">Admin Panel</h2>
        <nav className="space-y-2">
          <button
            onClick={() => navigate("/admin/dashboard")}
            className={getButtonClass("/admin/dashboard")}
          >
            🏠 Bosh sahifa
          </button>

          <button
            onClick={() => navigate("/admin/bookings")}
            className={getButtonClass("/admin/bookings")}
          >
            📅 Bookings
          </button>

          <button
            onClick={() => navigate("/admin/users")}
            className={getButtonClass("/admin/users")}
          >
            👥 Users
          </button>

          <button
            onClick={() => navigate("/admin/talk")}
            className={getButtonClass("/admin/talk")}
          >
            💬 Chats
          </button>
        </nav>
      </div>

      <button
        onClick={onLogout}
        className="mt-8 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg text-white font-semibold transition-all duration-200"
      >
        🚪 Выйти
      </button>
    </aside>
  );
}

export default Sidebar;
