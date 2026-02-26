import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from "react";
import ChatHeader from "./ChatHeader";
import ChatInput from "./ChatInput";
import ApiCall, { baseUrl } from "../../../config";
import { toast } from "react-toastify";
import { useSubscription, useStompClient } from "react-stomp-hooks";
import {
  FiEdit3,
  FiTrash2,
  FiMoreVertical,
  FiCheck,
  FiClock,
  FiImage,
  FiFile,
  FiDownload,
  FiX,
} from "react-icons/fi";

// Custom hook for WebSocket connection management
const useWebSocketConnection = (stompClient) => {
  useEffect(() => {
    if (!stompClient) return;
    return () => {
      if (stompClient) {
        stompClient.onConnect = null;
        stompClient.onDisconnect = null;
        stompClient.onWebSocketClose = null;
        stompClient.onStompError = null;
      }
    };
  }, [stompClient]);
};

// Custom hook for message management
const useMessageManager = (chat, user, stompClient, onLastMessageUpdate) => {
  const [messages, setMessages] = useState([]);
  const [pendingMessages, setPendingMessages] = useState(new Map());

  const processIncomingMessage = useCallback(
    (rawMessage) => {
      try {
        const message =
          typeof rawMessage.body === "string"
            ? JSON.parse(rawMessage.body)
            : rawMessage;

        const messageChatId = message.chatRoom?.id || message.chatId;
        if (!messageChatId || messageChatId !== chat?.id) return;

        if (message.fileId && !message.file) {
          message.file = {
            id: message.fileId,
            name: `uploaded_file_${message.fileId}.bin`,
          };
        }

        setPendingMessages((prev) => {
          const newPending = new Map(prev);
          for (const [tempId, pendingMsg] of newPending.entries()) {
            const sameUser =
              pendingMsg.userId === message.userId ||
              pendingMsg.sender?.id === message.userId ||
              pendingMsg.userId === message.sender?.id;

            const sameFile =
              pendingMsg.fileId &&
              (message.file?.id === pendingMsg.fileId ||
                message.fileId === pendingMsg.fileId);

            const sameText =
              (pendingMsg.message || pendingMsg.content || "") ===
              (message.message || message.content || "");

            if (sameUser && (sameFile || sameText)) {
              newPending.delete(tempId);
            }
          }
          return newPending;
        });

        setMessages((prev) => {
          const existingIndex = prev.findIndex((m) => m.id === message.id);
          if (existingIndex !== -1) {
            const updated = [...prev];
            updated[existingIndex] = { ...updated[existingIndex], ...message };
            return updated;
          }
          return [...prev, message];
        });

        if (message && typeof onLastMessageUpdate === "function") {
          const previewText =
            message.message || message.content || message.file?.name || "";
          onLastMessageUpdate({
            chatId: messageChatId,
            lastMessage: previewText,
            createdAt: message.createdAt,
          });
        }
      } catch (error) {
        console.error("Error processing incoming message:", error);
      }
    },
    [chat?.id, onLastMessageUpdate]
  );

  const addPendingMessage = useCallback((message) => {
    setPendingMessages((prev) => new Map(prev).set(message.tempId, message));
  }, []);

  const removePendingMessage = useCallback((tempId) => {
    setPendingMessages((prev) => {
      const newPending = new Map(prev);
      newPending.delete(tempId);
      return newPending;
    });
  }, []);

  const clearPendingMessages = useCallback(() => {
    setPendingMessages(new Map());
  }, []);

  return {
    messages,
    pendingMessages: Array.from(pendingMessages.values()),
    setMessages,
    processIncomingMessage,
    addPendingMessage,
    removePendingMessage,
    clearPendingMessages,
  };
};

// 🖼️ Модалка для увеличения изображения
const ImageModal = ({ src, onClose }) => {
  if (!src) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div className="relative max-h-[95vh] max-w-[95vw]">
        <img
          src={src}
          alt="full-view"
          className="max-h-[85vh] max-w-full rounded-lg shadow-2xl object-contain"
          onClick={(e) => e.stopPropagation()}
        />
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors p-2"
        >
          <FiX size={24} />
        </button>
        <a
          href={src}
          download
          className="absolute -top-12 right-12 text-white hover:text-gray-300 transition-colors p-2"
          title="Download image"
        >
          <FiDownload size={20} />
        </a>
      </div>
    </div>
  );
};

// Компонент для отображения файлов
const FileAttachment = ({ file, isAuthor, onPreview }) => {
  const isImage = /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(file.name || "");
  const fileName = file.name?.includes("_")
    ? file.name.split("_").slice(1).join("_")
    : file.name;

  return (
    <div
      className={`mt-2 rounded-lg border overflow-hidden ${
        isAuthor ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-gray-200"
      }`}
    >
      {isImage ? (
        <div className="cursor-pointer" onClick={() => onPreview(file)}>
          <img
            src={`${baseUrl}/api/v1/file/getFile/${file.id}?${Date.now()}`}
            alt="attachment"
            className="w-full max-w-xs object-cover transition-transform hover:scale-105"
          />
        </div>
      ) : (
        <a
          href={`${baseUrl}/api/v1/file/getFile/${file.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 p-3 hover:bg-opacity-80 transition-colors no-underline"
        >
          <div
            className={`p-2 rounded-lg ${
              isAuthor
                ? "bg-blue-100 text-blue-600"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            <FiFile size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {fileName}
            </p>
            <p className="text-xs text-gray-500">
              {file.size ? formatFileSize(file.size) : "File"}
            </p>
          </div>
          <FiDownload size={16} className="text-gray-400" />
        </a>
      )}
    </div>
  );
};

// Вспомогательная функция для форматирования размера файла
const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const MessageItem = React.memo(
  ({ message, isAuthor, onEdit, onDelete, currentUserId }) => {
    const {
      id,
      tempId,
      message: content,
      content: altContent,
      sender,
      userId,
      createdAt,
      edited,
      pending,
      file,
      fileId,
    } = message;

    const [modalSrc, setModalSrc] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);
    const text = content || altContent || "";

    // useEffect(() => {}, []);
    const roles = JSON.parse(localStorage.getItem("roles") || "[]");
    const role = roles.length > 0 ? roles[0].name : "ROLE_OTHER";

    // Определяем имя отправителя
    const senderName = useMemo(() => {
      if (
        isAuthor ||
        userId === currentUserId ||
        sender?.id === currentUserId
      ) {
        return "You";
      } else if (sender?.name) {
        return sender.name;
      } else if (sender?.phone) {
        return sender.phone;
      }
      return "Unknown";
    }, [isAuthor, userId, sender, currentUserId]);

    const messageTime = useMemo(() => {
      return new Date(createdAt || Date.now()).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }, [createdAt]);

    // Обработчики действий
    const handleEdit = useCallback(() => {
      setMenuOpen(false);
      if (!pending) onEdit(message);
    }, [pending, onEdit, message]);

    const handleDelete = useCallback(() => {
      setMenuOpen(false);
      if (id) onDelete(id);
    }, [id, onDelete]);

    const handleFilePreview = useCallback((fileData) => {
      if (/\.(jpg|jpeg|png|gif|webp)$/i.test(fileData.name || "")) {
        setModalSrc(`${baseUrl}/api/v1/file/getFile/${fileData.id}`);
      }
    }, []);

    // Данные файла
    const fileData = useMemo(() => {
      return file ? file : fileId ? { id: fileId, name: "attachment" } : null;
    }, [file, fileId]);

    // Закрытие меню при клике вне его
    useEffect(() => {
      const handleClickOutside = (e) => {
        if (menuRef.current && !menuRef.current.contains(e.target)) {
          setMenuOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
      <>
        <div
          className={`flex ${
            isAuthor ? "justify-end" : "justify-start"
          } px-2 sm:px-4`}
        >
          <div
            className={`relative w-fit max-w-full sm:max-w-[85%] md:max-w-[80%] lg:max-w-[70%] group ${
              pending ? "opacity-70" : ""
            }`}
            style={{ wordBreak: "break-word" }}
          >
            {/* Сообщение */}
            <div
              className={`relative p-4 rounded-2xl transition-all duration-200 ${
                pending
                  ? "bg-gray-200 text-gray-600 animate-pulse"
                  : isAuthor
                  ? "bg-blue-500 text-white shadow-lg"
                  : "bg-white text-gray-800 shadow-sm border border-gray-100"
              }`}
            >
              {/* Header */}
              {!isAuthor && (
                <div className="text-xs font-medium text-gray-600 mb-1">
                  {senderName}
                </div>
              )}

              {/* Текст сообщения */}
              {text && (
                <div className="whitespace-pre-wrap break-words leading-relaxed">
                  {text}
                </div>
              )}

              {/* Файл */}
              {fileData && (
                <FileAttachment
                  file={fileData}
                  isAuthor={isAuthor}
                  onPreview={handleFilePreview}
                />
              )}

              {/* Footer */}
              <div
                className={`flex items-center justify-end gap-2 mt-2 ${
                  isAuthor ? "text-blue-100" : "text-gray-500"
                }`}
              >
                {edited && <span className="text-xs italic">edited</span>}
                {pending ? (
                  <FiClock size={12} className="animate-pulse" />
                ) : (
                  <FiCheck size={12} />
                )}
                <span className="text-xs">{messageTime}</span>
              </div>

              {/* Кнопка меню действий */}
              {(isAuthor || role === "ROLE_ADMIN") && !pending && (
                <div
                  ref={menuRef}
                  className={`absolute top-2 ${
                    isAuthor ? "left-2" : "right-2"
                  } opacity-0 group-hover:opacity-100 transition-opacity`}
                >
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className={`p-1 rounded-full ${
                      isAuthor
                        ? "bg-blue-400 hover:bg-blue-300 text-white"
                        : "bg-gray-200 hover:bg-gray-300 text-gray-600"
                    } transition-colors`}
                  >
                    <FiMoreVertical size={14} />
                  </button>

                  {/* Выпадающее меню */}
                  {menuOpen && (
                    <div
                      className={`absolute ${
                        isAuthor ? "right-0" : "left-0"
                      } bottom-0 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-32 z-10`}
                    >
                      <button
                        onClick={handleEdit}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <FiEdit3 size={14} />
                        Edit
                      </button>
                      <button
                        onClick={handleDelete}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <FiTrash2 size={14} />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Модалка для изображений */}
        {modalSrc && (
          <ImageModal src={modalSrc} onClose={() => setModalSrc(null)} />
        )}
      </>
    );
  }
);

function ChatWindow({ chat, role, user, onLastMessageUpdate, onChatDeleted }) {
  const stompClient = useStompClient();
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [editing, setEditing] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Custom hooks
  useWebSocketConnection(stompClient);
  const {
    messages,
    pendingMessages,
    setMessages,
    processIncomingMessage,
    addPendingMessage,
    removePendingMessage,
    clearPendingMessages,
  } = useMessageManager(chat, user, stompClient, onLastMessageUpdate);

  // Subscribe to messages
  useSubscription(`/topic/chat/${chat?.id}`, processIncomingMessage);

  // Memoized combined messages
  const allMessages = useMemo(
    () =>
      [...messages, ...pendingMessages].sort(
        (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
      ),
    [messages, pendingMessages]
  );

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, []);

  // Обработчик скролла для показа/скрытия кнопки "Прокрутить вниз"
  const handleScroll = useCallback(() => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        messagesContainerRef.current;
      setIsScrolled(scrollHeight - scrollTop - clientHeight > 100);
    }
  }, []);

  // Загрузка сообщений
  const loadMessages = useCallback(async () => {
    if (!chat?.id) return;

    setIsLoading(true);
    try {
      const res = await ApiCall(`/api/v1/chats/${chat.id}/messages`, "GET");
      setMessages(res.data || []);
    } catch (error) {
      toast.error("Failed to load messages");
    } finally {
      setIsLoading(false);
    }
  }, [chat?.id, setMessages]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    if (!isScrolled) {
      scrollToBottom();
    }
  }, [allMessages.length, scrollToBottom, isScrolled]);

  const handleSend = useCallback(
    async (data) => {
      const text = typeof data === "string" ? data : data.text;
      const fileId = data.fileId || null;

      const trimmedText = text?.trim();
      if (
        !stompClient?.connected ||
        !chat?.id ||
        !user?.id ||
        (!trimmedText && !fileId)
      ) {
        toast.warn("⚠️ Сообщение или файл не могут быть пустыми");
        return;
      }

      const tempMessage = {
        tempId: Date.now(),
        chatId: chat.id,
        userId: user.id,
        message: trimmedText || "",
        createdAt: new Date().toISOString(),
        pending: true,
        fileId: fileId || null,
      };

      addPendingMessage(tempMessage);

      try {
        stompClient.publish({
          destination: "/app/chat.send",
          body: JSON.stringify(tempMessage),
        });
      } catch (error) {
        console.error("Failed to send message:", error);
        toast.error("Ошибка при отправке сообщения");
        removePendingMessage(tempMessage.tempId);
      }
    },
    [stompClient, chat?.id, user?.id, addPendingMessage, removePendingMessage]
  );

  // Edit message
  const startEdit = useCallback((message) => {
    if (message.pending) return;
    setEditing(message);
  }, []);

  const saveEdit = useCallback(
    async (newText) => {
      if (!editing?.id || !chat?.id) {
        toast.error("Cannot edit unsent message");
        return;
      }

      const trimmedText = newText.trim();
      if (!trimmedText) {
        toast.warn("Message cannot be empty");
        return;
      }

      try {
        await ApiCall(
          `/api/v1/chats/${chat.id}/messages/${editing.id}`,
          "PUT",
          {
            message: trimmedText,
          }
        );

        const editedMessage = {
          id: editing.id,
          chatId: chat.id,
          userId: user.id,
          message: trimmedText,
          edited: true,
        };

        stompClient.publish({
          destination: "/app/chat.edit",
          body: JSON.stringify(editedMessage),
        });

        setMessages((prev) =>
          prev.map((m) =>
            m.id === editing.id
              ? { ...m, message: trimmedText, edited: true }
              : m
          )
        );
        setEditing(null);
      } catch (error) {
        console.error("Edit error:", error);
        toast.error("Failed to edit message");
      }
    },
    [editing, chat?.id, user?.id, stompClient, setMessages]
  );

  // Delete message
  const deleteMessage = useCallback(
    async (messageId) => {
      if (!messageId) return;

      try {
        await ApiCall(
          `/api/v1/chats/${chat.id}/messages/${messageId}`,
          "DELETE"
        );
        setMessages((prev) => prev.filter((m) => m.id !== messageId));
      } catch (error) {
        console.error("Delete error:", error);
        toast.error("Failed to delete message");
      }
    },
    [chat?.id, setMessages]
  );

  // Check if user is author of a message
  const isUserAuthor = useCallback(
    (message) => message.userId === user?.id || message.sender?.id === user?.id,
    [user?.id]
  );

  if (!chat) {
    return (
      <div className="flex flex-col flex-1 h-screen bg-gradient-to-br from-gray-50 to-gray-100 items-center justify-center p-8">
        <div className="text-center">
          <div className="text-gray-400 mb-4 text-6xl">💬</div>
          <div className="text-gray-500 text-lg font-medium mb-2">
            Select a chat to start messaging
          </div>
          <div className="text-gray-400 text-sm">
            Choose a conversation from the list to begin
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <ChatHeader
        chat={chat}
        role={role}
        connected={stompClient?.connected}
        user={user}
        onChatDeleted={onChatDeleted}
      />

      {/* Messages area */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 space-y-3 scroll-smooth"
        onScroll={handleScroll}
      >
        {isLoading ? (
          <div className="flex justify-center items-center h-20">
            <div className="flex items-center gap-3 text-gray-500">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-300 border-t-blue-500"></div>
              Loading messages...
            </div>
          </div>
        ) : allMessages.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-full text-center">
            <div className="text-gray-400 mb-4 text-6xl">👋</div>
            <div className="text-gray-500 text-lg font-medium mb-2">
              No messages yet
            </div>
            <div className="text-gray-400 text-sm max-w-md">
              Start a conversation by sending a message or sharing a file
            </div>
          </div>
        ) : (
          allMessages.map((message) => (
            <MessageItem
              key={message.id || message.tempId}
              message={message}
              isAuthor={isUserAuthor(message)}
              onEdit={startEdit}
              onDelete={deleteMessage}
              currentUserId={user?.id}
              role={role}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Кнопка прокрутки вниз */}
      {isScrolled && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-20 right-6 bg-blue-500 text-white p-3 rounded-full shadow-lg hover:bg-blue-600 transition-colors z-10"
        >
          <FiDownload size={20} className="rotate-180" />
        </button>
      )}

      {/* Input area */}
      <ChatInput
        onSend={handleSend}
        editing={editing}
        onSaveEdit={saveEdit}
        onCancelEdit={() => setEditing(null)}
        disabled={!stompClient?.connected}
      />
    </div>
  );
}

export default React.memo(ChatWindow);
