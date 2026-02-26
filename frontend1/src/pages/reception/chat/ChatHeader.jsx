import React, { useState, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import Select from "react-select";
import ApiCall from "../../../config";

// Компонент карточки участника
const ParticipantCard = React.memo(
  ({ participant, onRemove, isAdmin, currentUserId }) => {
    const isCurrentUser = participant.id === currentUserId;
    const isOnline = participant.online || participant.role === "ROLE_ADMIN";

    return (
      <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 bg-white">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          {/* Аватар участника */}
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              {participant.name?.charAt(0).toUpperCase() || "U"}
            </div>
            {/* Индикатор онлайн статуса */}
            <div
              className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                isOnline ? "bg-green-500" : "bg-gray-400"
              }`}
            ></div>
          </div>

          {/* Информация об участнике */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-800 truncate">
                {participant.name || "Без имени"}
              </span>
              {participant.role === "ROLE_ADMIN" && (
                <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full font-medium">
                  ADMIN
                </span>
              )}
              {isCurrentUser && (
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                  Вы
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 truncate">
              {participant.email || participant.phone || "Контакт не указан"}
            </p>
          </div>
        </div>

        {/* Кнопка удаления */}
        {isAdmin && !isCurrentUser && (
          <button
            onClick={() => onRemove(participant.id)}
            className="ml-2 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
            title="Удалить из чата"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        )}
      </div>
    );
  }
);

// Модалка управления участниками
const ParticipantsModal = React.memo(
  ({
    isOpen,
    onClose,
    chat,
    participants,
    onAddUser,
    onRemoveUser,
    isAdmin,
    availableUsers,
    currentUserId,
  }) => {
    const [selectedUser, setSelectedUser] = useState(null);
    const [isAdding, setIsAdding] = useState(false);

    // Опции для Select
    const userOptions = useMemo(
      () =>
        availableUsers.map((user) => ({
          value: user.id,
          label: `${user.name || "Без имени"} • ${
            user.email || user.phone || "нет контакта"
          }`,
          user: user,
        })),
      [availableUsers]
    );

    const handleAddUser = async () => {
      if (!selectedUser) {
        toast.warn("Выберите пользователя для добавления");
        return;
      }

      setIsAdding(true);
      try {
        await onAddUser(selectedUser.value);
        setSelectedUser(null);
        toast.success("✅ Участник добавлен в чат");
      } catch (error) {
        console.error("Ошибка при добавлении:", error);
      } finally {
        setIsAdding(false);
      }
    };

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
          {/* Заголовок */}
          <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-1">
                  Участники чата
                </h3>
                <p className="text-sm text-gray-600">
                  {chat.name} • {participants.length} участников
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-all duration-200"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Список участников */}
          <div className="flex-1 overflow-y-auto p-6 space-y-3">
            {participants.length > 0 ? (
              participants.map((participant) => (
                <ParticipantCard
                  key={participant.id}
                  participant={participant}
                  onRemove={onRemoveUser}
                  isAdmin={isAdmin}
                  currentUserId={currentUserId}
                />
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mx-auto mb-4">
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                    />
                  </svg>
                </div>
                <p className="font-medium text-gray-600">Нет участников</p>
                <p className="text-sm mt-1">Добавьте участников в чат</p>
              </div>
            )}
          </div>

          {/* Секция добавления участника */}
          {isAdmin && (
            <div className="p-6 border-t border-gray-100 bg-gray-50 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Добавить участника
                </label>
                <Select
                  value={selectedUser}
                  onChange={setSelectedUser}
                  options={userOptions}
                  placeholder="Выберите пользователя..."
                  isSearchable
                  isClearable
                  menuPosition="fixed"
                  menuPortalTarget={document.body}
                  styles={{
                    control: (base) => ({
                      ...base,
                      borderRadius: "0.5rem",
                      borderColor: "#D1D5DB",
                      "&:hover": { borderColor: "#9CA3AF" },
                    }),
                    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                    menu: (base) => ({ ...base, zIndex: 9999 }),
                  }}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleAddUser}
                  disabled={!selectedUser || isAdding}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isAdding ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Добавление...</span>
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      <span>Добавить</span>
                    </>
                  )}
                </button>

                <button
                  onClick={onClose}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all duration-200"
                >
                  Закрыть
                </button>
              </div>
            </div>
          )}

          {!isAdmin && (
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button
                onClick={onClose}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all duration-200"
              >
                Закрыть
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }
);

function ChatHeader({ chat, role, connected, user, onChatDeleted }) {
  const [showModal, setShowModal] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const isAdmin = role === "ROLE_ADMIN";

  // Загрузка участников чата
  const fetchParticipants = async () => {
    if (!chat?.id) return;

    try {
      const res = await ApiCall(`/api/v1/chats/${chat.id}`, "GET");
      const participantsList =
        res?.data?.participants || res?.data?.data?.participants || [];
      setParticipants(participantsList);
    } catch (err) {
      console.error("Ошибка при загрузке участников:", err);
      toast.error("Не удалось загрузить участников");
      setParticipants([]);
    }
  };
  useEffect(() => {
    if (!chat?.id) return;
    setParticipants([]);
    fetchParticipants();

    // Админ видит всех пользователей — обновляем список при открытии
    if (isAdmin && showModal) fetchAllUsers();
  }, [chat?.id, showModal]);

  // Загрузка всех пользователей
  const fetchAllUsers = async () => {
    try {
      const res = await ApiCall(`/api/v1/admin/all-users`, "GET");
      const users = Array.isArray(res.data) ? res.data : [];
      setAllUsers(users);
    } catch (err) {
      console.error("Ошибка при загрузке пользователей:", err);
      toast.error("Не удалось загрузить пользователей");
      setAllUsers([]);
    }
  };

  // Удаление чата
  const handleDeleteChat = async () => {
    if (!chat?.id) return;
    if (!window.confirm("Удалить этот чат?")) return;

    try {
      await ApiCall(`/api/v1/chats/${chat.id}`, "DELETE");
      toast.success("Чат удалён");

      if (onChatDeleted) onChatDeleted(chat.id); // 👈 уведомляем родителя
    } catch (err) {
      console.error("Ошибка при удалении чата:", err);
      toast.error("Не удалось удалить чат");
    }
  };

  // Добавление участника
  const handleAddUser = async (userId) => {
    try {
      await ApiCall(`/api/v1/chats/participants/${chat.id}/${userId}`, "POST");
      await fetchParticipants(); // Обновляем список участников
      await fetchAllUsers(); // Обновляем список доступных пользователей
    } catch (err) {
      console.error("Ошибка при добавлении участника:", err);
      throw err;
    }
  };

  // Удаление участника
  const handleRemoveUser = async (userId) => {
    if (!window.confirm("Удалить участника из чата?")) return;

    try {
      await ApiCall(
        `/api/v1/chats/participants/${chat.id}/${userId}`,
        "DELETE"
      );
      toast.success("✅ Участник удалён из чата");
      await fetchParticipants();
      await fetchAllUsers();
    } catch (err) {
      console.error("Ошибка при удалении участника:", err);
      toast.error("Ошибка при удалении участника");
    }
  };

  // Открытие модалки
  const openModal = async () => {
    setIsLoading(true);
    try {
      await Promise.all([fetchParticipants(), fetchAllUsers()]);
      setShowModal(true);
    } catch (err) {
      console.error("Ошибка при открытии модалки:", err);
      toast.error("Не удалось загрузить данные");
    } finally {
      setIsLoading(false);
    }
  };

  // Доступные для добавления пользователи
  const availableUsers = useMemo(
    () =>
      allUsers.filter(
        (u) =>
          !participants.some((p) => p.id === u.id) &&
          !u.roles?.some((r) => r.name === "ROLE_ADMIN") &&
          u.id !== user?.id
      ),
    [allUsers, participants, user?.id]
  );

  // Статистика онлайн участников
  const onlineCount = useMemo(
    () =>
      participants.filter((p) => p.online || p.role === "ROLE_ADMIN").length,
    [participants]
  );

  return (
    <>
      {/* Шапка чата */}
      <div className="pl-8 flex justify-between items-center p-4 border-b border-gray-200 bg-white shadow-sm">
        <div className="flex px-1 items-center space-x-4 flex-1 min-w-0">
          {/* Информация о чате */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3">
              <h2
                className="text-xl font-bold text-gray-800 cursor-pointer hover:text-blue-600 transition-colors duration-200 truncate"
                onClick={openModal}
                title="Управление участниками"
              >
                {chat.name}
              </h2>

              {/* Индикатор соединения */}
              <div className="flex items-center space-x-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    connected || isAdmin
                      ? "bg-green-500 animate-pulse"
                      : "bg-gray-400"
                  }`}
                ></div>
              </div>
            </div>

            <div className="flex items-center space-x-4 mt-1">
              <span className="text-sm text-gray-600">
                👥 {participants.length} участников
              </span>
              {onlineCount > 0 && (
                <span className="text-sm text-green-600">
                  🟢 {onlineCount} онлайн
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Кнопки администратора */}
        {isAdmin && (
          <div className="flex items-center space-x-2">
            <button
              onClick={openModal}
              disabled={isLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                  />
                </svg>
              )}
              <span className="font-medium">Участники</span>
            </button>

            <button
              onClick={handleDeleteChat}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
              title="Удалить чат"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Модалка управления участниками */}
      <ParticipantsModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        chat={chat}
        participants={participants}
        onAddUser={handleAddUser}
        onRemoveUser={handleRemoveUser}
        isAdmin={isAdmin}
        availableUsers={availableUsers}
        currentUserId={user?.id}
      />
    </>
  );
}

export default React.memo(ChatHeader);
