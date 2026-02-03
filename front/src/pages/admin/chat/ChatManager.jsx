import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ApiCall from "../../../config";
import { toast } from "react-toastify";

const UserCard = React.memo(({ user, isSelected, onToggle }) => {
  const roles = user.roles || [];

  const getRoleColor = (roleName) => {
    switch (roleName) {
      case "ROLE_ADMIN":
        return "bg-orange-100 text-orange-700";
      case "ROLE_COOK":
        return "bg-green-100 text-green-700";
      case "ROLE_RECEPTION":
        return "bg-blue-100 text-blue-700";
      case "ROLE_OTHER":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div
      onClick={() => onToggle(user.id)}
      className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
        isSelected
          ? "bg-blue-50 border-blue-200 shadow-sm"
          : "bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
            {user.name?.charAt(0).toUpperCase() || "U"}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center flex-wrap gap-1">
              <span className="font-medium text-gray-800 truncate">
                {user.name || "Без имени"}
              </span>

              {/* 🏷️ Роли */}
              {roles.map((r, idx) => (
                <span
                  key={idx}
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${getRoleColor(
                    r.name
                  )}`}
                >
                  {r.name.replace("ROLE_", "")}
                </span>
              ))}
            </div>

            <p className="text-sm text-gray-500 truncate">
              {user.phone || "Нет телефона"}
            </p>
          </div>
        </div>

        <div
          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
            isSelected
              ? "bg-blue-500 border-blue-500"
              : "bg-white border-gray-300"
          }`}
        >
          {isSelected && (
            <svg
              className="w-3 h-3 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
        </div>
      </div>
    </div>
  );
});

function ChatManager({ isOpen, onClose, onChatCreated }) {
  const [chatName, setChatName] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      const escHandler = (e) => e.key === "Escape" && onClose?.();
      window.addEventListener("keydown", escHandler);
      return () => {
        document.body.style.overflow = "auto";
        window.removeEventListener("keydown", escHandler);
      };
    }
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) loadUsers();
  }, [isOpen]);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const res = await ApiCall("/api/v1/admin/all-users", "GET");
      const data = Array.isArray(res.data) ? res.data : [];

      // Исключаем админов
      const filtered = data.filter(
        (u) => !u.roles?.some((r) => r.name === "ROLE_ADMIN")
      );
      setUsers(filtered);

      // Определяем текущего пользователя по номеру
      const phone = localStorage.getItem("phone");
      const found = data.find((u) => u.phone === phone);
      if (found) {
        console.log("✅ Текущий пользователь найден:", found);
        setCurrentUser(found);
      } else {
        console.warn("⚠️ Пользователь с таким номером не найден:", phone);
      }
    } catch (err) {
      console.error("Ошибка загрузки пользователей:", err);
      toast.error("Не удалось загрузить пользователей");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    if (!searchQuery) return users;
    const query = searchQuery.toLowerCase();
    return users.filter(
      (u) =>
        u.name?.toLowerCase().includes(query) ||
        u.phone?.toLowerCase().includes(query) ||
        u.roles?.some((r) =>
          r.name?.toLowerCase().includes(query.replace("role_", ""))
        )
    );
  }, [users, searchQuery]);

  const toggleUser = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleCreateChat = async () => {
    const trimmed = chatName.trim();
    if (!trimmed) return toast.warn("Введите название чата");
    if (selectedUsers.length === 0)
      return toast.warn("Выберите хотя бы одного участника");
    if (!currentUser) return toast.error("Текущий пользователь не найден");

    setIsCreating(true);
    try {
      const data = {
        name: trimmed,
        creatorId: currentUser.id,
        members: selectedUsers,
      };

      console.log("📤 Создание чата:", data);

      const res = await ApiCall("/api/v1/chats", "POST", data);
      console.log("✅ Ответ от сервера:", res.data);

      if (!res.data?.id) {
        toast.error("Сервер не вернул корректный объект чата");
        onClose?.();
        return;
      }

      console.log("📦 Ответ сервера:", res);
      console.log("📨 Перед отправкой в onChatCreated:", res.data);

      toast.success(`✅ Чат "${res.data.name}" создан!`);
      onChatCreated?.(res.data); // безопасный вызов
      onClose?.();
    } catch (err) {
      console.error("❌ Ошибка при создании чата:", err);
      toast.error("Ошибка при создании чата");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => e.target === e.currentTarget && onClose?.()}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 150, damping: 20 }}
            className="relative bg-white rounded-2xl shadow-2xl w-[90%] max-w-3xl max-h-[90vh] overflow-y-auto"
          >
            <button
              onClick={onClose}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-2xl font-bold"
            >
              ×
            </button>

            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
              <h2 className="text-xl font-bold text-gray-800 mb-1">
                Создать новый чат
              </h2>
              <p className="text-sm text-gray-600">
                Добавьте участников и задайте название
              </p>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Название чата *
                </label>
                <input
                  type="text"
                  placeholder="Введите название чата..."
                  value={chatName}
                  onChange={(e) => setChatName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Поиск участников
                </label>
                <input
                  type="text"
                  placeholder="Поиск по имени или телефону..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>

              <div className="h-64 overflow-y-auto border border-gray-300 rounded-lg p-4 space-y-2 bg-gray-50">
                {isLoading ? (
                  <div className="text-center text-gray-400">Загрузка...</div>
                ) : filteredUsers.length === 0 ? (
                  <div className="text-center text-gray-400">
                    👥 Пользователи не найдены
                  </div>
                ) : (
                  filteredUsers.map((u) => (
                    <UserCard
                      key={u.id}
                      user={u}
                      isSelected={selectedUsers.includes(u.id)}
                      onToggle={toggleUser}
                    />
                  ))
                )}
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                >
                  Отмена
                </button>
                <button
                  onClick={handleCreateChat}
                  disabled={
                    isCreating || !chatName.trim() || selectedUsers.length === 0
                  }
                  className="px-5 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isCreating ? "Создание..." : "Создать чат"}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default React.memo(ChatManager);
