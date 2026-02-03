import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ApiCall from "../../config";
import Sidebar from "./Sidebar";
import { ToastContainer, toast } from "react-toastify";

function ManageUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [newUser, setNewUser] = useState({
    name: "",
    phone: "",
    password: "",
    role: "",
  });
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    password: "",
  });

  // 👇 refs для свайпа
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // === свайп для открытия меню ===
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

  // === logout ===
  const handleLogout = () => {
    localStorage.clear();
    navigate("/admin/login");
  };

  // === загрузка данных ===
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [userRes, roleRes] = await Promise.all([
        ApiCall("/api/v1/admin/all-users", "GET"),
        ApiCall("/api/v1/role-management/roles", "GET"),
      ]);

      if (!userRes.error) setUsers(userRes.data || []);

      if (!roleRes.error) {
        let rolesArray = [];
        if (Array.isArray(roleRes.data)) rolesArray = roleRes.data;
        else if (Array.isArray(roleRes.data.data))
          rolesArray = roleRes.data.data;
        else if (Array.isArray(roleRes.data.roles))
          rolesArray = roleRes.data.roles;
        else if (typeof roleRes.data === "object" && roleRes.data.name)
          rolesArray = [roleRes.data];

        const filteredRoles = rolesArray.filter((r) => r.name !== "ROLE_ADMIN");
        setRoles(filteredRoles);
      }
    } catch (error) {
      console.error("Ошибка при загрузке:", error);
      toast.error("Ошибка при загрузке данных");
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async () => {
    const { name, phone, password, role } = newUser;
    if (!name || !phone || !password || !role) {
      toast.info("Заполните все поля!");
      return;
    }
    try {
      const userRes = await ApiCall("/api/v1/admin", "POST", {
        name,
        phone,
        password,
      });
      if (userRes.error) {
        toast.error("Ошибка при создании пользователя");
        return;
      }
      const userId = userRes.data.id;
      const roleAssignRes = await ApiCall(
        `/api/v1/role-management/assign/${userId}?role=${role}`,
        "PUT"
      );
      if (!roleAssignRes.error) {
        toast.success("Пользователь создан и роль назначена!");
        setNewUser({ name: "", phone: "", password: "", role: "" });
        loadData();
      } else {
        toast.error("Ошибка при назначении роли");
      }
    } catch (error) {
      console.error("Ошибка при создании:", error);
      toast.error("Ошибка при создании пользователя");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Удалить пользователя?")) return;
    try {
      const res = await ApiCall(`/api/v1/admin/${id}`, "DELETE");
      if (!res.error) {
        toast.success("Удалено");
        loadData();
      } else {
        toast.error("Ошибка при удалении");
      }
    } catch (error) {
      console.error("Ошибка при удалении:", error);
      toast.error("Ошибка при удалении");
    }
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setEditForm({ name: user.name, phone: user.phone, password: "" });
  };

  const handleEditSave = async () => {
    const { name, phone, password } = editForm;
    if (!name || !phone) {
      toast.warn("Имя и логин обязательны!");
      return;
    }
    try {
      const res = await ApiCall(`/api/v1/admin/${editingUser.id}`, "PUT", {
        name,
        phone,
        password: password || null,
      });
      if (!res.error) {
        toast.success("Изменения сохранены!");
        setEditingUser(null);
        loadData();
      } else {
        toast.error("Ошибка при сохранении");
      }
    } catch (error) {
      console.error("Ошибка при редактировании:", error);
      toast.error("Ошибка при редактировании");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 relative overflow-x-hidden">
      <ToastContainer position="top-right" autoClose={2000} />
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

      {/* === Основной контент === */}
      <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <div className="mt-8">
            <h1 className="mt-4 text-2xl text-center font-bold text-gray-900">
              Управление пользователями
            </h1>
            <p className="text-gray-600 mt-2 text-center">
              Создание, редактирование и удаление учетных записей
            </p>
          </div>

          {/* === Добавление пользователя === */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
            <h3 className="text-lg font-semibold mb-4">
              Добавить нового пользователя
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <input
                type="text"
                placeholder="ФИО"
                value={newUser.name}
                onChange={(e) =>
                  setNewUser({ ...newUser, name: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
              <input
                type="text"
                placeholder="Телефон / Логин"
                value={newUser.phone}
                onChange={(e) =>
                  setNewUser({ ...newUser, phone: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
              <input
                type="password"
                placeholder="Пароль"
                value={newUser.password}
                onChange={(e) =>
                  setNewUser({ ...newUser, password: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
              <select
                value={newUser.role}
                onChange={(e) =>
                  setNewUser({ ...newUser, role: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="">Выберите роль</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.name}>
                    {r.name.replace("ROLE_", "")}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-4">
              <button
                onClick={handleAddUser}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
              >
                Добавить пользователя
              </button>
            </div>
          </div>

          {/* === Таблица пользователей === */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
            <div className="px-4 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Список пользователей ({users.length})
              </h3>
            </div>

            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">№</th>
                  <th className="px-6 py-3 text-left">ФИО</th>
                  <th className="px-6 py-3 text-left">Логин</th>
                  <th className="px-6 py-3 text-left">Роль</th>
                  <th className="px-6 py-3 text-left">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((u, i) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{i + 1}</td>
                    <td className="px-6 py-4">{u.name}</td>
                    <td className="px-6 py-4">{u.phone}</td>
                    <td className="px-6 py-4">
                      {u.roles?.length
                        ? u.roles
                            .map((r) => r.name.replace("ROLE_", ""))
                            .join(", ")
                        : "—"}
                    </td>
                    <td className="px-6 py-4 space-x-2">
                      <button
                        onClick={() => openEditModal(u)}
                        className="bg-yellow-100 hover:bg-yellow-200 text-yellow-700 px-3 py-1 rounded-lg text-xs"
                      >
                        Редактировать
                      </button>
                      <button
                        onClick={() => handleDelete(u.id)}
                        className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded-lg text-xs"
                      >
                        Удалить
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {!users.length && (
              <div className="text-center py-8 text-gray-500">
                Пользователи не найдены
              </div>
            )}
          </div>
        </div>
      </div>

      {/* === Модалка редактирования === */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 shadow-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              Редактировать пользователя
            </h2>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Имя"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
                className="w-full border px-3 py-2 rounded-lg"
              />
              <input
                type="text"
                placeholder="Телефон / логин"
                value={editForm.phone}
                onChange={(e) =>
                  setEditForm({ ...editForm, phone: e.target.value })
                }
                className="w-full border px-3 py-2 rounded-lg"
              />
              <input
                type="password"
                placeholder="Новый пароль (необязательно)"
                value={editForm.password}
                onChange={(e) =>
                  setEditForm({ ...editForm, password: e.target.value })
                }
                className="w-full border px-3 py-2 rounded-lg"
              />
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Отмена
              </button>
              <button
                onClick={handleEditSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageUsers;
