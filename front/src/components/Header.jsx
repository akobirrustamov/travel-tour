import { useState, useEffect } from "react";
import { Menu, X, Globe, ChevronDown } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import icon from "../assets/images/logo.png";
import { useTranslation } from "react-i18next";

function Header() {
  const location = useLocation();
  const { t, i18n } = useTranslation();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [language, setLanguage] = useState(
    localStorage.getItem("appLang") || "uz",
  );
  const [scrolled, setScrolled] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const navigate = useNavigate();
  // Fon rasmi uchun gradient animatsiyasi
  const backgroundStyle = {
    background: `linear-gradient(135deg, 
      rgba(2, 48, 32, 0.95) 0%, 
      rgba(4, 84, 56, 0.92) 25%, 
      rgba(2, 62, 42, 0.96) 50%, 
      rgba(4, 94, 64, 0.94) 75%, 
      rgba(2, 48, 32, 0.95) 100%)`,
    backgroundSize: "400% 400%",
    animation: "gradientShift 15s ease infinite",
    backdropFilter: scrolled ? "blur(12px)" : "blur(8px)",
    borderBottom: scrolled
      ? "1px solid rgba(234, 179, 8, 0.3)"
      : "1px solid rgba(234, 179, 8, 0.2)",
    boxShadow: scrolled
      ? "0 10px 30px -10px rgba(0, 0, 0, 0.5)"
      : "0 4px 20px -8px rgba(0, 0, 0, 0.3)",
    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
  };

  // CSS animatsiyalarni qo'shish
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes gradientShift {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      
      @keyframes float {
        0% { transform: translateY(0px); }
        50% { transform: translateY(-5px); }
        100% { transform: translateY(0px); }
      }
      
      @keyframes glowPulse {
        0% { box-shadow: 0 0 5px rgba(234, 179, 8, 0.3); }
        50% { box-shadow: 0 0 20px rgba(234, 179, 8, 0.6); }
        100% { box-shadow: 0 0 5px rgba(234, 179, 8, 0.3); }
      }
      
      @keyframes slideDown {
        from {
          opacity: 0;
          transform: translateY(-20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      .nav-item-hover {
        position: relative;
        overflow: hidden;
      }
      
      .nav-item-hover::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 0;
        height: 0;
        border-radius: 50%;
        background: rgba(234, 179, 8, 0.2);
        transform: translate(-50%, -50%);
        transition: width 0.6s ease, height 0.6s ease;
      }
      
      .nav-item-hover:hover::before {
        width: 200%;
        height: 200%;
      }
      
      .logo-glow {
        animation: glowPulse 3s infinite;
      }
      
      .float-animation {
        animation: float 3s ease-in-out infinite;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Scroll effekti
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      setIsMobileMenuOpen(false);
      const sections = ["home", "about", "tours", "media", "contacts"];
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

  useEffect(() => {
    if (i18n.changeLanguage) {
      i18n.changeLanguage(language);
      localStorage.setItem("appLang", language);
    }
  }, [language, i18n]);

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

  const navItems = [
    { label: t("header.home"), id: "home" },
    { label: t("header.about"), id: "about" },
    { label: t("header.tours"), id: "tours" },
    { label: t("header.media"), id: "media" },
    { label: t("header.contacts"), id: "contacts" },
  ];

  const languages = [
    { code: "uz", label: "O'zbek" },
    { code: "ru", label: "Русский" },
    { code: "en", label: "English" },
    { code: "turk", label: "Türkçe" },
  ];

  return (
    <header className="w-full fixed top-0 left-0 z-50">
      {/* Asosiy header */}
      <div
        className="relative z-50 transition-all duration-500"
        style={backgroundStyle}
      >
        {/* Dekorativ elementlar */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-yellow-400/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-green-400/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 py-3 relative">
          {/* Logo */}
          <div
            onClick={() => navigate("/")}
            className="flex items-center gap-3 cursor-pointer group relative"
          >
            {/* Glow effekti */}
            <div className="absolute -inset-2 bg-yellow-400/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <div className="relative">
              <img
                className="w-14 h-14 rounded-full shadow-2xl object-cover border-2 border-yellow-400/50 group-hover:border-yellow-400 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 logo-glow"
                src={icon}
                alt="Miniature Hotel"
              />
              <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-green-400 rounded-full opacity-0 group-hover:opacity-30 blur transition-opacity duration-500"></div>
            </div>

            <div className="hidden md:block overflow-hidden relative">
              <div className="flex flex-col">
                <span className="text-xl font-bold text-white/90 leading-tight transform transition-transform duration-500 group-hover:translate-y-[-2px]">
                  DIYAR EL-SALAM
                </span>
                <span className="text-yellow-400 font-semibold text-xl leading-tight transform transition-all duration-500 group-hover:translate-y-[2px] group-hover:text-yellow-300">
                  TRAVEL
                </span>
              </div>
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-yellow-400 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
            </div>
          </div>

          {/* Desktop navigatsiya */}
          <div className="hidden lg:flex items-center gap-6">
            <nav className="flex items-center space-x-2">
              {navItems.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => handleScroll(item.id)}
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className="relative group nav-item-hover"
                  style={{
                    animation: `slideDown 0.5s ease ${index * 0.1}s both`,
                  }}
                >
                  <div
                    className={`
                    relative px-4 py-2.5 font-medium transition-all duration-300 flex text-gray-300 hover:text-yellow-400`}
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <span className="text-lg opacity-100 group-hover:opacity-100 transition-opacity duration-300">
                        {item.icon}
                      </span>
                      {item.label}
                    </span>

                    {/* Hover effekti */}
                    <div
                      className={`
                      absolute inset-0 bg-gradient-to-r from-yellow-400/0 via-yellow-400/10 to-yellow-400/0
                      transition-transform duration-500
                      ${hoveredItem === item.id ? "translate-x-full" : "-translate-x-full"}
                    `}
                    ></div>
                  </div>
                </button>
              ))}
            </nav>

            {/* Language Selector */}
            <div className="relative group">
              <div className="flex items-center gap-2 bg-black/30 backdrop-blur-md px-4 py-2.5 rounded-xl border border-yellow-400/30 hover:border-yellow-400 transition-all duration-300 cursor-pointer group-hover:scale-105">
                <Globe className="w-4 h-4 text-yellow-400 group-hover:rotate-12 transition-transform duration-300" />
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="bg-transparent text-yellow-300 font-medium focus:outline-none cursor-pointer appearance-none pr-6"
                  style={{ backgroundImage: "none" }}
                >
                  {languages.map((lang) => (
                    <option
                      key={lang.code}
                      value={lang.code}
                      className="bg-green-900 text-white"
                    >
                      {lang.flag} {lang.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-yellow-400 group-hover:rotate-180 transition-transform duration-300" />
              </div>

              {/* Tooltip */}
              <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                Tilni tanlang
              </div>
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            className="lg:hidden relative w-12 h-12 rounded-xl bg-gradient-to-r from-yellow-400/20 to-green-400/20 hover:from-yellow-400/30 hover:to-green-400/30 border border-yellow-400/30 hover:border-yellow-400 transition-all duration-300 group"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          >
            <div className="absolute inset-0 bg-white/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            {isMobileMenuOpen ? (
              <X
                size={24}
                className="text-yellow-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 group-hover:rotate-90 transition-transform duration-500"
              />
            ) : (
              <Menu
                size={24}
                className="text-yellow-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform duration-300"
              />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`
          lg:hidden fixed inset-0 z-40 transition-all duration-500 ease-in-out
          ${isMobileMenuOpen ? "visible" : "invisible"}
        `}
      >
        {/* Overlay */}
        <div
          className={`
            absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-500
            ${isMobileMenuOpen ? "opacity-100" : "opacity-0"}
          `}
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>

        {/* Menu panel */}
        <div
          className={`
            absolute right-0 top-0 h-full w-full max-w-sm bg-gradient-to-b from-green-900 to-green-950
            shadow-2xl transform transition-transform duration-500 ease-out
            ${isMobileMenuOpen ? "translate-x-0" : "translate-x-full"}
          `}
          style={{
            background:
              "linear-gradient(145deg, #0a4d3a 0%, #064e3b 50%, #0a4d3a 100%)",
          }}
        >
          {/* Dekorativ elementlar */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-yellow-400/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-400/10 rounded-full blur-3xl"></div>
          </div>

          <div className="relative h-full p-6 pt-24 overflow-y-auto">
            {/* Logo in menu */}
            <div className="flex justify-center mb-8 animate-pulse">
              <img
                className="w-20 h-20 rounded-full border-4 border-yellow-400/50 shadow-2xl float-animation"
                src={icon}
                alt="Logo"
              />
            </div>

            {/* Navigation items */}
            <nav className="flex flex-col space-y-3">
              {navItems.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => handleScroll(item.id)}
                  className={`
                    group relative overflow-hidden text-lg font-medium py-4 px-6 rounded-2xl text-left
                    transition-all duration-300 transform hover:scale-105
                        text-gray-100 hover:text-yellow-400 bg-white/5 hover:bg-white/10
                  `}
                  style={{
                    animation: `slideDown 0.5s ease ${index * 0.1}s both`,
                  }}
                >
                  <span className="relative z-10 flex items-center gap-3">
                    <span className="text-2xl">{item.icon}</span>
                    {item.label}
                  </span>

                  {/* Hover effekti */}
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/0 via-yellow-400/10 to-yellow-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                </button>
              ))}
            </nav>

            {/* Language in mobile */}
            <div className="mt-8">
              <div className="bg-black/30 backdrop-blur-md rounded-2xl p-4 border border-yellow-400/30">
                <label className="text-yellow-400/70 text-sm mb-2 block">
                  Tilni tanlang
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setLanguage(lang.code)}
                      className={`
                        flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300
                        ${
                          language === lang.code
                            ? "bg-yellow-400/20 border border-yellow-400 text-yellow-400"
                            : "bg-white/5 hover:bg-white/10 text-gray-300 hover:text-yellow-400"
                        }
                      `}
                    >
                      <span className="text-lg">{lang.flag}</span>
                      <span className="text-sm">{lang.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Decorative line */}
            <div className="mt-8 h-px bg-gradient-to-r from-transparent via-yellow-400/30 to-transparent"></div>

            {/* Additional info */}
            <div className="mt-6 text-center text-gray-400 text-sm">
              <p>© 2024 DIYAR EL-SALAM TRAVEL</p>
              <p className="text-yellow-400/60 mt-1">Sayohat qulaylik bilan</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
