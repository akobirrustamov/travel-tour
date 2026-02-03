import React, { useEffect, useState, useRef } from "react";
import ChatList from "./ChatList";
import Sidebar from "../Sidebar";
import ChatWindow from "./ChatWindow";
import ApiCall, { baseUrl } from "../../../config";
import { useNavigate } from "react-router-dom";
import { StompSessionProvider } from "react-stomp-hooks";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function AdminMessenger() {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const phone = localStorage.getItem("phone");

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const roles = JSON.parse(localStorage.getItem("roles") || "[]");
  const role = roles.length > 0 ? roles[0].name : "ROLE_OTHER";

  // === Свайп: начало ===
  useEffect(() => {
    const handleTouchStart = (e) => {
      touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = (e) => {
      touchEndX.current = e.changedTouches[0].clientX;
      const deltaX = touchEndX.current - touchStartX.current;

      // свайп должен быть от левого края и длиннее 80px
      if (touchStartX.current < 50 && deltaX > 80) {
        if (selectedChat) {
          setSelectedChat(null); // назад к списку
        } else {
          setSidebarOpen(true); // открыть админ-панель
        }
      }
    };

    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [selectedChat]);
  // === Свайп: конец ===

  // === Получаем текущего пользователя ===
  const fetchUser = async () => {
    try {
      const res = await ApiCall("/api/v1/admin/all-users", "GET");
      const allUsers = Array.isArray(res.data) ? res.data : [];
      const found = allUsers.find((u) => u.phone === phone);
      if (found) {
        setCurrentUser({ id: found.id, name: found.name });
        localStorage.setItem("user", JSON.stringify(found));
      }
    } catch (err) {
      console.error("Ошибка при загрузке пользователей:", err);
    }
  };

  // === Удаление чата ===
  const handleChatDeleted = (deletedChatId) => {
    setChats((prev) => prev.filter((c) => c.id !== deletedChatId));
    setSelectedChat(null);
  };

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) navigate("/admin/login");
  }, []);

  useEffect(() => {
    fetchChats();
    fetchUser();
  }, []);

  // === Загрузка списка чатов ===
  const fetchChats = async () => {
    try {
      const res = await ApiCall("/api/v1/chats", "GET");
      const data = Array.isArray(res.data) ? res.data : [];

      const chatsWithLast = await Promise.all(
        data.map(async (chat) => {
          try {
            const resMsg = await ApiCall(
              `/api/v1/chats/${chat.id}/messages`,
              "GET"
            );
            const messages = resMsg.data || [];
            if (messages.length > 0) {
              const last = messages[messages.length - 1];
              return {
                ...chat,
                lastMessage: {
                  message: last.message || last.content || "",
                  createdAt: last.createdAt,
                  userId: last.userId || last.sender?.id,
                  file: last.file
                    ? {
                        id: last.file.id,
                        name: last.file.name,
                        prefix: last.file.prefix,
                      }
                    : null,
                },
              };
            }
          } catch (e) {
            console.warn("⚠️ Ошибка при получении сообщений:", chat.id, e);
          }
          return chat;
        })
      );

      setChats(chatsWithLast);
    } catch (err) {
      console.error("Ошибка при загрузке чатов:", err);
    }
  };

  const handleSelectChat = (chat) => setSelectedChat(chat);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/admin/login");
  };

  const handleTopButtonClick = () => {
    if (selectedChat) {
      setSelectedChat(null);
    } else {
      setSidebarOpen(!sidebarOpen);
    }
  };

  return (
    <StompSessionProvider
      url={`${baseUrl.replace("http", "ws")}/ws`}
      reconnectDelay={5000}
    >
      <div className="flex min-h-screen w-full max-w-full bg-gray-50 relative overflow-x-hidden">
        {/* === Бургер / Назад === */}
        {!sidebarOpen && (
          <button
            onClick={handleTopButtonClick}
            className="lg:hidden fixed top-9 left-1 font-black text-xl z-50 text-blue-700"
          >
            {selectedChat ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 320 512"
                className="w-4 h-6 fill-current text-blue-700 transition-transform duration-200 hover:scale-110"
              >
                <path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l192 192c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256 246.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-192 192z" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 448 512"
                className="w-6 h-6 fill-current text-blue-700 transition-transform duration-200 hover:scale-110"
              >
                <path d="M0 88a24 24 0 0 1 24-24h400a24 24 0 0 1 0 48H24A24 24 0 0 1 0 88zm0 160a24 24 0 0 1 24-24h400a24 24 0 0 1 0 48H24a24 24 0 0 1-24-24zm24 136a24 24 0 0 0 0 48h400a24 24 0 0 0 0-48H24z" />
              </svg>
            )}
          </button>
        )}

        {/* === Sidebar === */}
        <div
          className={`${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 transition-transform duration-300 ease-in-out bg-gray-800`}
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

        {/* === Основная часть === */}
        <div className="flex-1 flex flex-col lg:flex-row h-screen w-full max-w-full overflow-x-hidden">
          {/* Список чатов */}
          <div
            className={`${
              selectedChat ? "hidden" : "block"
            } lg:block w-full lg:w-1/4 border-r bg-white p-4 overflow-y-auto`}
          >
            <ChatList
              chats={chats}
              onSelect={handleSelectChat}
              role={role}
              user={currentUser}
              onChatCreated={(newChat) => {
                if (newChat?.id) {
                  setChats((prev) => [...prev, newChat]);
                  setSelectedChat(newChat);
                }
              }}
            />
          </div>

          {/* Окно чата */}
          {selectedChat ? (
            <div className="flex-1 relative bg-white">
              <ChatWindow
                chat={selectedChat}
                role={role}
                user={currentUser}
                onChatDeleted={handleChatDeleted}
                onLastMessageUpdate={(data) => {
                  setChats((prevChats) =>
                    prevChats.map((c) =>
                      c.id === data.chatId
                        ? {
                            ...c,
                            lastMessage: {
                              message: data.lastMessage,
                              createdAt: data.createdAt,
                            },
                          }
                        : c
                    )
                  );
                }}
              />
            </div>
          ) : (
            <div className="hidden lg:flex flex-1 items-center justify-center text-gray-400">
              Выберите чат, чтобы начать переписку
            </div>
          )}
        </div>

        <ToastContainer position="top-right" autoClose={2000} />
      </div>
    </StompSessionProvider>
  );
}

export default AdminMessenger;
