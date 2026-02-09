import { useState, useEffect } from "react";
import { Menu, X, Globe } from "lucide-react";
import { useLocation } from "react-router-dom";
import icon from "../assets/images/logo.png";
import { useTranslation } from "react-i18next";

function Header() {
  const location = useLocation();
  const { t, i18n } = useTranslation();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [language, setLanguage] = useState(i18n.language || "ru");

  // ✅ Обновляем язык
  useEffect(() => {
    if (i18n.changeLanguage) {
      i18n.changeLanguage(language);
      localStorage.setItem("appLang", language);
    }
  }, [language, i18n]);

  // ✅ Слежение за активным разделом при скролле
  useEffect(() => {
    const handleScroll = () => {
      const sections = ["home", "rooms", "about", "contacts"];
      const scrollY = window.scrollY + window.innerHeight / 3;
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i]);
        if (section && section.offsetTop <= scrollY) {
          setActiveSection(sections[i]);
          break;
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleScroll = (id) => {
    setIsMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => setActiveSection(id), 600);
    } else {
      setActiveSection(id);
    }
    if (location.pathname !== "/") {
      window.location.href = `/#${id}`;
    }
  };

  // ✅ Навигационные пункты — всё через i18next
  const navItems = [
    { label: t("header.home"), id: "home" },
    { label: t("header.rooms"), id: "rooms" },
    { label: t("header.about"), id: "about" },
    { label: t("header.contacts"), id: "contacts" },
  ];

  return (
    <header className="w-full fixed top-0 left-0 z-50">


      {/* Основной блок */}
      <div className="bg-green-950/80 relative z-50 backdrop-blur-md border-b border-green-800 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 py-3">
          {/* 🔹 Логотип */}
          <div
            onClick={() => {
              handleScroll("home");
              setIsMobileMenuOpen(false);
            }}
            className="flex items-center hover:scale-105 gap-3 cursor-pointer hover:opacity-90 transition"
          >
            <img
              className="w-12 h-12 rounded-full shadow-xl object-cover"
              src={icon}
              alt="Miniature Hotel"
            />
            <div className="md:flex gap-2 hidden ">
              <span className="text-xl font-bold text-gray-300 leading-tight">
                 DIYAR EL-SALAM
              </span>
              <span className="text-yellow-500 font-semibold text-xl leading-tight">
                TRAVEL
              </span>
            </div>
          </div>



          {/* 🔹 Правый блок (язык и кнопка) */}
          <div className="hidden lg:flex items-center gap-4">


            {/* 🔹 Навигация */}
            <nav className="hidden lg:flex items-center space-x-8">
              {navItems.map((item) => (
                  <button
                      key={item.id}
                      onClick={() => handleScroll(item.id)}
                      className={`relative font-medium px-1 py-2 transition-all duration-300 ${
                          activeSection === item.id
                              ? "text-yellow-400 font-semibold"
                              : "text-gray-300 hover:text-yellow-400"
                      }`}
                  >
                    {item.label}
                    <span
                        className={`absolute bottom-0 left-0 w-full h-0.5 bg-yellow-400 transition-opacity duration-500 ${
                            activeSection === item.id ? "opacity-100" : "opacity-0"
                        }`}
                    ></span>
                  </button>
              ))}
            </nav>

            {/* 🌐 Выбор языка */}
            <div className="relative">
              <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-full border border-yellow-400/40 shadow-sm hover:border-yellow-400 transition-all cursor-pointer">
                <Globe className="w-4 h-4 text-yellow-400" />
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="bg-transparent text-yellow-300 font-medium focus:outline-none cursor-pointer"
                >
                  <option value="ru">RU</option>
                  <option value="en">EN</option>
                </select>
              </div>
            </div>



          </div>

          {/* Мобильное меню */}
          <button
            className="lg:hidden p-2 rounded-lg bg-gray-100 hover:bg-gray-200 relative z-50 transition"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          >
            {isMobileMenuOpen ? (
              <X size={24} className="text-gray-700" />
            ) : (
              <Menu size={24} className="text-gray-700" />
            )}
          </button>
        </div>
      </div>

      {/* 🔹 Мобильное меню */}
      <div
        className={`lg:hidden fixed inset-0 z-40 transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="absolute w-full top-32 min-[417px]:top-[106px] px-6 bg-green-950/90 py-4 backdrop-blur-md">
          <nav className="flex flex-col space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleScroll(item.id)}
                className={`text-lg font-medium py-4 px-4 rounded-xl text-left transition-all duration-200 ${
                  activeSection === item.id
                    ? "bg-yellow-50 text-yellow-600 border-l-4 border-yellow-600"
                    : "text-gray-100 hover:text-yellow-400"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* 🌐 Язык в мобильном меню */}
          <div className="mt-6 flex items-center gap-2 bg-white/10 px-3 py-2 rounded-full border border-yellow-400/40 shadow-sm">
            <Globe className="w-4 h-4 text-yellow-400" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-transparent text-yellow-300 font-medium focus:outline-none cursor-pointer w-full"
            >
              <option value="ru">RU</option>
              <option value="en">EN</option>
            </select>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
