import React, { useState, useEffect } from "react";
import {
  FiSend,
  FiPaperclip,
  FiX,
  FiFile,
  FiImage,
  FiEdit2,
} from "react-icons/fi";
import { baseUrl } from "../../../config";
import { toast } from "react-toastify";

function ChatInput({ onSend, editing, onSaveEdit, onCancelEdit, sending }) {
  const [message, setMessage] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (editing) setMessage(editing.message || editing.content || "");
    else setMessage("");
  }, [editing]);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      // Проверка размера файла (макс 10MB)
      if (selected.size > 10 * 1024 * 1024) {
        toast.error("Файл слишком большой. Максимальный размер: 10MB");
        return;
      }
      setFile(selected);
    }
  };

  const getFileIcon = (fileName) => {
    const ext = fileName.split(".").pop().toLowerCase();
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) {
      return <FiImage className="text-blue-500" />;
    }
    if (["pdf"].includes(ext)) {
      return <FiFile className="text-red-500" />;
    }
    if (["doc", "docx"].includes(ext)) {
      return <FiFile className="text-blue-600" />;
    }
    return <FiFile className="text-gray-500" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };
  const handleCancelEdit = () => {
    setMessage("");
    setFile(null);
    if (typeof onCancelEdit === "function") {
      onCancelEdit(); // уведомляем родителя (ChatWindow)
    }
  };

  const handleSend = async () => {
    const trimmed = message.trim();
    if (!trimmed && !file) {
      return toast.warn("Введите сообщение или выберите файл");
    }
    if (sending || uploading) return;

    let fileId = null;

    if (file) {
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("photo", file);
        formData.append("prefix", "chat");

        const response = await fetch(`${baseUrl}/api/v1/file/upload`, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) throw new Error("Ошибка при загрузке файла");
        const result = await response.json();
        fileId = result?.data?.id || result?.id || result;

        if (!fileId) throw new Error("Файл не получил ID");
        toast.success("✅ Файл успешно загружен");
      } catch (error) {
        console.error("Ошибка при загрузке файла:", error);
        toast.error("Ошибка при загрузке файла");
        setUploading(false);
        return;
      }
      setUploading(false);
    }

    if (editing) {
      onSaveEdit(trimmed);
    } else {
      onSend({ text: trimmed, fileId });
    }

    setMessage("");
    setFile(null);
  };

  return (
    <div className="w-full max-w-full px-3 sm:px-4 py-4 border-t bg-white shadow-sm overflow-x-hidden">
      {/* Баннер редактирования */}
      {editing && (
        <div className="mb-3 flex items-center justify-between bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2">
          <div className="flex items-center gap-2 text-yellow-800">
            <FiEdit2 size={16} />
            <span className="text-sm font-medium">
              Редактирование сообщения
            </span>
          </div>
          <button
            onClick={handleCancelEdit}
            className="text-yellow-600 hover:text-yellow-800 transition-colors"
          >
            <FiX size={18} />
          </button>
        </div>
      )}

      {/* Превью файла */}
      {file && (
        <div className="mb-3 flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-lg p-3 w-full max-w-full overflow-hidden">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="flex-shrink-0">{getFileIcon(file.name)}</div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 truncate break-all">
                {file.name}
              </p>
              <p className="text-xs text-gray-500">
                {formatFileSize(file.size)}
              </p>
            </div>
          </div>
          <button
            onClick={() => setFile(null)}
            className="flex-shrink-0 text-gray-400 hover:text-red-500 transition-colors p-1"
          >
            <FiX size={16} />
          </button>
        </div>
      )}

      {/* Основная область ввода */}
      <div className="flex items-center gap-2">
        {/* Кнопка прикрепления файла */}
        <label
          className={`
          flex-shrink-0 p-3 rounded-lg border cursor-pointer transition-all
          ${
            uploading
              ? "bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed"
              : "bg-white border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400"
          }
        `}
        >
          <FiPaperclip size={20} />
          <input
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.txt"
            className="hidden"
            onChange={handleFileChange}
            disabled={uploading}
          />
        </label>

        {/* Поле ввода */}
        <input
          type="text"
          placeholder={
            uploading ? "Загрузка файла..." : "Напишите сообщение..."
          }
          className="flex-1 border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          disabled={sending || uploading}
        />

        {/* Кнопка отправки */}
        <button
          onClick={handleSend}
          disabled={sending || uploading}
          className={`
            flex-shrink-0 flex items-center gap-2 rounded-lg px-1 lg:px-4 py-3 font-medium transition-all
            ${
              sending || uploading
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700 shadow-sm hover:shadow-md"
            }
          `}
        >
          {uploading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            </>
          ) : sending ? (
            "Отправка..."
          ) : editing ? (
            <>
              <FiEdit2 size={16} />
              Сохранить
            </>
          ) : (
            <>
              <FiSend size={16} />
              Send
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default ChatInput;
