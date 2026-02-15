import { useNavigate, useLocation } from "react-router-dom";

function Sidebar({ onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const getButtonClass = (path) => {
    const isActive = location.pathname === path;
    return `
      flex items-center w-full px-4 py-3 rounded-xl font-medium transition-all duration-300
      ${
        isActive
          ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform -translate-x-1"
          : "text-gray-300 hover:bg-gray-800 hover:text-white hover:shadow-md hover:translate-x-1"
      }
    `;
  };

  const menuItems = [
    { path: "/admin/dashboard", label: "Bosh sahifa", emoji: "🏠" },
    { path: "/admin/carusel", label: "Carusel", emoji: "🖼️" },
    { path: "/admin/gallery", label: "Gallery", emoji: "📸" },
    { path: "/admin/news", label: "News", emoji: "📰" },
    { path: "/admin/partner", label: "Travel Partner", emoji: "🤝" },
    { path: "/admin/tour", label: "Travel Tour", emoji: "✈️" },
    { path: "/admin/brons", label: "Brons", emoji: "📩" },
    { path: "/admin/youtube", label: "Youtube Videos", emoji: "▶️" },
  ];

  return (
    <aside className="w-72 fixed bg-gradient-to-b from-gray-900 to-gray-950 border-r border-gray-800 text-white p-6 flex flex-col justify-between">
      {/* Header */}
      <div className="flex flex-col">
        <div className="flex items-center space-x-3 mb-10 px-2">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-600 rounded-2xl flex items-center justify-center">
              <span className="text-2xl font-bold">A</span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900"></div>
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Admin Panel
            </h1>
            <p className="text-gray-400 text-sm">Welcome back!</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={getButtonClass(item.path)}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{item.emoji}</span>
                    <span className="font-medium">{item.label}</span>
                  </div>
                  {isActive && (
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  )}
                </div>
              </button>
            );
          })}
        </nav>

        {/* Stats */}
      </div>

      {/* Logout Button */}
      <div className="mt-8">
        <button
          onClick={onLogout}
          className="
            group relative flex items-center justify-center w-full
            px-4 py-3 rounded-xl font-semibold overflow-hidden
            bg-gradient-to-r from-gray-800 to-gray-900
            hover:from-red-900/30 hover:to-red-800/30
            text-gray-300 hover:text-red-300
            border border-gray-700 hover:border-red-700/50
            transition-all duration-500
            transform hover:-translate-y-0.5
          "
        >
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>

          {/* Content */}
          <div className="relative flex items-center">
            <span className="text-lg mr-3 group-hover:rotate-180 transition-transform duration-500">
              🚪
            </span>
            <span>Chiqish</span>
          </div>
        </button>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-800">
          <p className="text-gray-500 text-sm text-center">
            © 2024 Admin Panel
          </p>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
