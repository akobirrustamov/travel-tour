import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import { User } from "lucide-react";
import "../../../../src/main.css"


// Вспомогательный компонент времени
const LastMessageTime = ({ timestamp }) => {
  if (!timestamp) return null;
  const formatTime = (date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffInHours = (now - messageDate) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return messageDate.toLocaleTimeString("ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInHours < 168) {
      return messageDate.toLocaleDateString("ru-RU", { weekday: "short" });
    } else {
      return messageDate.toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "short",
      });
    }
  };
  return (
    <span className="text-xs text-gray-400 whitespace-nowrap">
      {formatTime(timestamp)}
    </span>
  );
};

// Аватар
const ChatAvatar = ({ name, unreadCount, isOnline }) => {
  const initials = useMemo(() => {
    return (
      name
        ?.split(" ")
        .map((w) => w.charAt(0))
        .join("")
        .toUpperCase()
        .slice(0, 2) || "??"
    );
  }, [name]);
  return (
    <div className="relative">
      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-sm">
        {initials}
      </div>
      {isOnline && (
        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
      )}
      {unreadCount > 0 && (
        <div className="absolute -top-1 -right-1 min-w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center px-1">
          {unreadCount > 99 ? "99+" : unreadCount}
        </div>
      )}
    </div>
  );
};

const ChatSkeleton = () => (
  <div className="p-3 border-b animate-pulse">
    <div className="flex items-center space-x-3">
      <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
      <div className="flex-1">
        <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>
  </div>
);

function ChatList({
  chats = [],
  onSelect,
  selectedChat,
  isLoading = false,
  onSearch,
  searchQuery = "",
  className = "",
  onChatCreated,
  user,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const roles = JSON.parse(localStorage.getItem("roles") || "[]");
  const role = roles.length > 0 ? roles[0].name : "ROLE_OTHER";

  const filteredChats = useMemo(() => {
    if (!searchQuery) return chats;
    const query = searchQuery.toLowerCase();
    return chats.filter(
      (chat) =>
        chat.name?.toLowerCase().includes(query) ||
        chat.lastMessage?.message?.toLowerCase().includes(query) ||
        chat.lastMessage?.content?.toLowerCase().includes(query)
    );
  }, [chats, searchQuery]);

  return (
    <>
      <div
        className={`bg-white border-r border-gray-200 flex flex-col shadow-sm ${className}`}
      >
        {/* Заголовок */}
        <div className="p-4 border-b border-gray-100 bg-white/95 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">Сообщения</h2>

            {/* 🔹 Кнопка профиля */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="p-2 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm hover:opacity-90 transition"
            >
              <User size={18} strokeWidth={2} />
            </button>
          </div>

          {/* Поиск */}
          {onSearch && (
            <div className="relative">
              <input
                type="text"
                placeholder="Поиск чатов..."
                value={searchQuery}
                onChange={(e) => onSearch(e.target.value)}
                className="w-full px-3 py-2 pl-10 bg-gray-100 border-0 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200 text-sm"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                🔍
              </div>
            </div>
          )}
        </div>

        {/* Список чатов */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, index) => (
              <ChatSkeleton key={index} />
            ))
          ) : filteredChats.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4">
                💬
              </div>
              <h3 className="text-gray-500 font-medium mb-2">
                {searchQuery ? "Чаты не найдены" : "Нет чатов"}
              </h3>
              <p className="text-gray-400 text-sm">
                {searchQuery
                  ? "Попробуйте изменить поисковый запрос"
                  : "Начните новый разговор"}
              </p>
            </div>
          ) : (
            filteredChats.map((chat) => {
              if (!chat?.id) return null;
              const isParticipant = chat.participants?.some(
                (p) => p.id === user?.id
              );
              if (!isParticipant) return null;

              const lastMsg = chat.lastMessage;

              const lastMessageTime =
                lastMsg?.createdAt ||
                lastMsg?.timestamp ||
                chat.lastMessageTime;
              const isSelected = selectedChat?.id === chat.id;
              const unreadCount = chat.unreadCount || 0;
              const isOnline = chat.isOnline || false;

              // === Формируем отображаемый текст последнего сообщения ===
              let lastMessageText = "";

              if (lastMsg?.file) {
                const fileName = lastMsg.file.name || "";
                const cleanName = fileName.includes("_")
                  ? fileName.split("_").slice(1).join("_")
                  : fileName;

                // ✂️ сокращаем длинные имена: начало и конец
                const maxLen = 22;
                const displayName =
                  cleanName.length > maxLen
                    ? `${cleanName.slice(0, 10)}...${cleanName.slice(-7)}`
                    : cleanName;

                lastMessageText = `📎 ${displayName}`;
              } else {
                lastMessageText =
                  typeof lastMsg === "string"
                    ? lastMsg
                    : lastMsg?.message ||
                      lastMsg?.content ||
                      lastMsg?.text ||
                      "Нет сообщений";
              }

              return (
                <div
                  key={chat.id}
                  onClick={() => onSelect?.(chat)}
                  className={`p-3 border-b border-gray-50 cursor-pointer transition-all duration-200 group ${
                    isSelected
                      ? "bg-gradient-to-r from-blue-50 to-blue-25 border-l-4 border-l-blue-500"
                      : "hover:bg-gray-50 hover:border-l-4 hover:border-l-gray-200"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <ChatAvatar
                      name={chat.name}
                      unreadCount={unreadCount}
                      isOnline={isOnline}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3
                          className={`font-semibold truncate ${
                            isSelected ? "text-blue-700" : "text-gray-800"
                          }`}
                        >
                          {chat.name || "Без названия"}
                        </h3>
                        <LastMessageTime timestamp={lastMessageTime} />
                      </div>

                      {/* === Текст или файл === */}
                      <p
                        className={`text-sm truncate flex-1 ${
                          unreadCount > 0
                            ? "text-gray-800 font-medium"
                            : "text-gray-500"
                        }`}
                        title={lastMsg?.file?.name || lastMessageText}
                      >
                        {lastMessageText}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Футер
        {role === "ROLE_ADMIN" && (
          <div className="p-3 border-t border-gray-100 bg-gray-50">
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              + Создать новый чат
            </button>
          </div>
        )} */}
      </div>
      {/* 🔹 Модалка профиля */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="stop fixed inset-0 bg-black/40 flex items-center justify-center z-50"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-lg p-6 px-10 max-w-sm relative"
            >
              <h3 className="flex items-center text-lg font-semibold text-gray-800 mb-3">
                <User size={25} strokeWidth={2} /> 
              </h3>

              <p className="text-gray-700">
                <strong>Имя:</strong> {user?.name || "—"}
              </p>
              <p className="text-gray-700 mt-1">
                <strong>Телефон:</strong> {user?.phone || "—"}
              </p>
              <p className="text-gray-700 mt-1">
                <strong>Роль:</strong> {role?.replace("ROLE_", "") || "OTHER"}
              </p>

              <button
                onClick={() => setIsModalOpen(false)}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
              >
                Закрыть
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default React.memo(ChatList);
