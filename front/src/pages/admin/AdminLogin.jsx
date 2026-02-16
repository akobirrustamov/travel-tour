import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiMail,
  FiLock,
  FiLogIn,
  FiMapPin,
  FiCompass,
  FiSun
} from "react-icons/fi";
import ApiCall from "../../config";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { isTokenExpired } from "../../config/token";

function AdminLogin() {
  const [loginData, setLoginData] = useState({ phone: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Background image for travel theme
  const backgroundImage = "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2021&q=80";

  // Auto-login check
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const roles = JSON.parse(localStorage.getItem("roles") || "[]");

    if (!token || roles.length === 0) return;

    if (!isTokenExpired(token)) {
      redirectByRole(roles[0].name);
    } else {
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
      toast.error("Unknown role");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    localStorage.clear();

    try {
      const response = await ApiCall("/api/v1/auth/login", "POST", loginData, null, false);

      if (response?.data?.access_token) {
        localStorage.setItem("access_token", response.data.access_token);
        if (response.data.refresh_token) {
          localStorage.setItem("refresh_token", response.data.refresh_token);
        }

        const roles = response.data.roles || [];
        localStorage.setItem("roles", JSON.stringify(roles));
        localStorage.setItem("phone", loginData.phone);

        if (roles.length > 0) {
          toast.success("Welcome back! Redirecting...");
          setTimeout(() => redirectByRole(roles[0].name), 1000);
        } else {
          toast.error("User role not found");
        }
      } else {
        toast.error("Invalid phone number or password");
      }
    } catch (err) {
      console.error("Login error:", err);
      toast.error(err.response?.data?.message || "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gray-900">
        {/* Background Image with Overlay */}
        <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${backgroundImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/70"></div>
        </div>

        {/* Animated Travel Icons */}
        <motion.div
            animate={{
              y: [0, -20, 0],
              rotate: [0, 5, 0]
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-20 left-20 text-white/20 hidden lg:block"
        >
          <FiCompass size={80} />
        </motion.div>

        <motion.div
            animate={{
              x: [0, 20, 0],
              rotate: [0, -5, 0]
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute bottom-20 right-20 text-white/20 hidden lg:block"
        >
          <FiMapPin size={80} />
        </motion.div>

        <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.3, 0.2]
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-40 right-40 text-yellow-500/30 hidden lg:block"
        >
          <FiSun size={60} />
        </motion.div>

        {/* Login Card */}
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative z-10 w-full max-w-md px-4"
        >
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
            {/* Logo and Title */}
            <motion.div
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-center mb-8"
            >
              <div className="inline-block p-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl mb-4">
                <FiLogIn className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
              <p className="text-white/60">Sign in to continue your journey</p>
            </motion.div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-5">
              {/* Phone Input */}
              <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
              >
                <label className="block text-white/80 text-sm font-medium mb-2 ml-1">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMail className="h-5 w-5 text-white/40" />
                  </div>
                  <input
                      type="text"
                      name="phone"
                      value={loginData.phone}
                      onChange={handleChange}
                      placeholder="+1 234 567 890"
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl
                           text-white placeholder-white/40 focus:outline-none focus:ring-2
                           focus:ring-yellow-400 focus:border-transparent transition-all"
                      required
                  />
                </div>
              </motion.div>

              {/* Password Input */}
              <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
              >
                <label className="block text-white/80 text-sm font-medium mb-2 ml-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="h-5 w-5 text-white/40" />
                  </div>
                  <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={loginData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl
                           text-white placeholder-white/40 focus:outline-none focus:ring-2
                           focus:ring-yellow-400 focus:border-transparent transition-all"
                      required
                  />
                  <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/40
                           hover:text-white/60 transition-colors"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </motion.div>

              {/* Remember Me & Forgot Password */}
              <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="flex items-center justify-between"
              >
                <label className="flex items-center">
                  <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-white/20 bg-white/10
                           text-yellow-400 focus:ring-yellow-400 focus:ring-offset-0"
                  />
                  <span className="ml-2 text-sm text-white/60">Remember me</span>
                </label>
                <button
                    type="button"
                    className="text-sm text-yellow-400 hover:text-yellow-300
                         transition-colors font-medium"
                >
                  Forgot password?
                </button>
              </motion.div>

              {/* Submit Button */}
              <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
              >
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-yellow-400 to-orange-500
                         hover:from-yellow-500 hover:to-orange-600 text-white
                         font-semibold py-3 px-4 rounded-xl transition-all
                         transform hover:scale-[1.02] active:scale-[0.98]
                         disabled:opacity-50 disabled:cursor-not-allowed
                         flex items-center justify-center space-x-2
                         shadow-lg shadow-yellow-500/25"
                >
                  {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent
                                  rounded-full animate-spin"></div>
                        <span>Signing in...</span>
                      </>
                  ) : (
                      <>
                        <FiLogIn className="w-5 h-5" />
                        <span>Sign In</span>
                      </>
                  )}
                </button>
              </motion.div>

              {/* Sign Up Link */}
              <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                  className="text-center text-white/60 text-sm mt-6"
              >
                Don't have an account?{" "}
                <button
                    type="button"
                    onClick={() => toast.info("Contact administrator for access")}
                    className="text-yellow-400 hover:text-yellow-300 font-medium
                         transition-colors"
                >
                  Contact Admin
                </button>
              </motion.p>
            </form>
          </div>

          {/* Footer */}
          <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="text-center text-white/40 text-xs mt-6"
          >
            © 2024 Tour Management System. All rights reserved.
          </motion.p>
        </motion.div>

        <ToastContainer
            position="top-right"
            theme="dark"
            autoClose={5000}
        />
      </div>
  );
}

export default AdminLogin;