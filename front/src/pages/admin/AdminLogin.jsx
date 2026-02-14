import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ApiCall from "../../config";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { isTokenExpired } from "../../config/token";

function AdminLogin() {
  const [loginData, setLoginData] = useState({ phone: "", password: "" });
  const navigate = useNavigate();

  // 🔹 Если токен уже есть — автологин
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const roles = JSON.parse(localStorage.getItem("roles") || "[]");

    if (!token || roles.length === 0) return;

    if (!isTokenExpired(token)) {
      // токен рабочий → редиректим
      redirectByRole(roles[0].name);
    } else {
      // токен истёк → очищаем
      localStorage.clear();
    }
  }, []);

  const redirectByRole = (role) => {
    if (role === "ROLE_ADMIN") {
      navigate("/admin/dashboard");
    } else if (role === "ROLE_RECEPTION") {
      navigate("/reception/dashboard");
    } else if (role === "ROLE_COOK") {
      navigate("/cook/dashboard");
    } else if (role === "ROLE_OTHER") {
      navigate("/other/dashboard");
    } else {
      toast.error("Неизвестная роль");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    localStorage.clear();

    try {
      const response = await toast.promise(
        ApiCall("/api/v1/auth/login", "POST", loginData, null, false),
        {
          pending: "Авторизация...",
          error: "Ошибка входа",
        }
      );

      if (response?.data?.access_token) {
        localStorage.setItem("access_token", response.data.access_token);
        if (response.data.refresh_token) {
          localStorage.setItem("refresh_token", response.data.refresh_token);
        }

        // сохраняем роли
        const roles = response.data.roles || [];

        localStorage.setItem("roles", JSON.stringify(roles));
        localStorage.setItem("phone", loginData.phone);

        if (roles.length > 0) {
          redirectByRole(roles[0].name);
        } else {
          toast.error("Роль пользователя не найдена");
        }
      } else {
        toast.error("Неверный логин или пароль");
      }
    } catch (err) {
      console.error("Ошибка входа:", err);
      toast.error("Ошибка авторизации");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">Система входа</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2">Логин </label>
            <input
              type="text"
              name="phone"
              value={loginData.phone}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Пароль</label>
            <input
              type="password"
              name="password"
              value={loginData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-400"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-2 px-4 rounded-lg transition"
          >
            Войти
          </button>
        </form>
      </div>
      <ToastContainer />
    </div>
  );
}

export default AdminLogin;
