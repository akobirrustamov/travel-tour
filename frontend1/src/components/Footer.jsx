import React, { useEffect, useRef, useState } from "react";
import icon from "../assets/images/miniAture.jpg";
import { useTranslation } from "react-i18next";
import logo from "../assets/images/logo.png";
import {
  Phone,
  Mail,
  MapPin,
  ArrowUp,
  Send,
  ChevronRight,
  Facebook,
  Instagram,
  Youtube,
} from "lucide-react";

function Footer() {
  const { t } = useTranslation();
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [hoveredSocial, setHoveredSocial] = useState(null);
  const footerRef = useRef(null);

  // Scroll effect for back to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Intersection Observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-in");
          }
        });
      },
      { threshold: 0.1 },
    );

    const elements = document.querySelectorAll(".animate-on-scroll");
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  // CSS Animations (simplified for performance)
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-5px); }
      }
      
      @keyframes slideInUp {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      .float {
        animation: float 6s ease-in-out infinite;
      }
      
      .animate-on-scroll {
        opacity: 0;
        transform: translateY(30px);
        transition: all 0.6s ease-out;
      }
      
      .animate-on-scroll.animate-in {
        opacity: 1;
        transform: translateY(0);
      }
      
      .delay-1 { transition-delay: 0.1s; }
      .delay-2 { transition-delay: 0.2s; }
      .delay-3 { transition-delay: 0.3s; }
      
      .social-icon {
        transition: all 0.3s ease;
      }
      
      .social-icon:hover {
        transform: translateY(-3px);
      }
      
      .contact-item {
        transition: all 0.3s ease;
      }
      
      .contact-item:hover {
        transform: translateX(5px);
      }
      
      .back-to-top {
        transition: all 0.3s ease;
      }
      
      .back-to-top:hover {
        transform: translateY(-3px);
      }
      
      .map-container {
        position: relative;
        overflow: hidden;
        border-radius: 1rem;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const socialLinks = [
    {
      name: "Instagram",
      url: "https://www.instagram.com/diyarelselamtravel?igsh=MW93a2xtY3gwdml1Yg==",
      icon: <Instagram className="w-4 h-4 sm:w-5 sm:h-5" />,
      color: "hover:bg-pink-600",
    },
    {
      name: "Facebook",
      url: "https://www.facebook.com/share/24H7BTXagNWw5imu/?mibextid=LQQJ4d",
      icon: <Facebook className="w-4 h-4 sm:w-5 sm:h-5" />,
      color: "hover:bg-blue-600",
    },
    {
      name: "Telegram",
      url: "https://t.me/+gnFA3UzwI5o4OWMy",
      icon: <Send className="w-4 h-4 sm:w-5 sm:h-5" />,
      color: "hover:bg-sky-500",
    },
  ];

  const contacts = [
    { icon: <Phone />, value: "+998 99 272 49 94", href: "tel:+998992724994" },
    { icon: <Phone />, value: "+998 99 951 33 77", href: "tel:+998999513377" },
    { icon: <Phone />, value: "+90 537 716 27 22", href: "tel:+905377162722" },
    { icon: <Phone />, value: "+90 541 184 02 04", href: "tel:+905411840204" },
    {
      icon: <Mail />,
      value: "diyarelselamtravel@gmail.com",
      href: "mailto:diyarelselamtravel@gmail.com",
    },
  ];

  return (
    <footer
      id="contacts"
      ref={footerRef}
      className="relative bg-gradient-to-b from-[#1b2a24] to-[#0f1a16] text-gray-300 pt-12 sm:pt-16 md:pt-20 overflow-hidden"
    >
      {/* Simplified background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 sm:w-48 md:w-64 h-32 sm:h-48 md:h-64 bg-yellow-500/5 rounded-full blur-2xl sm:blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-40 sm:w-60 md:w-80 h-40 sm:h-60 md:h-80 bg-emerald-500/5 rounded-full blur-2xl sm:blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12">
          {/* ===== LOGO & DESCRIPTION ===== */}
          <div className="lg:col-span-4 animate-on-scroll">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className="relative">
                <img
                  className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full shadow-xl object-cover border-2 border-yellow-400/50 hover:border-yellow-400 transition-all duration-300"
                  src={logo}
                  alt="Miniature Hotel"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-lg sm:text-xl font-bold text-white leading-tight">
                  DIYAR
                </span>
                <span className="text-yellow-400 font-semibold text-base sm:text-xl leading-tight">
                  EL-SALAM
                </span>
              </div>
            </div>

            <p className="text-sm sm:text-base text-gray-400 leading-relaxed mb-4 sm:mb-6 max-w-md">
              {t("home.footer.desc")}
            </p>

            {/* ===== SOCIAL MEDIA ===== */}
            <div className="flex gap-2 sm:gap-3">
              {socialLinks.map((social, index) => (
                <a
                  key={social.name}
                  href={social.url}
                  className="group"
                  target="_blank"
                  rel="noreferrer"
                  onMouseEnter={() => setHoveredSocial(index)}
                  onMouseLeave={() => setHoveredSocial(null)}
                >
                  <div
                    className={`w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-yellow-400/10 hover:bg-yellow-400 transition-all duration-300 social-icon ${
                      hoveredSocial === index ? "text-white" : "text-yellow-400"
                    }`}
                  >
                    {social.icon}
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* ===== CONTACT INFO ===== */}
          <div className="lg:col-span-3 animate-on-scroll delay-1">
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-yellow-400 mb-4 sm:mb-6 relative inline-block">
              {t("home.footer.contacts")}
              <span className="absolute -bottom-2 left-0 w-8 sm:w-10 md:w-12 h-0.5 bg-yellow-400 rounded-full"></span>
            </h3>

            <ul className="space-y-2 sm:space-y-3 text-gray-400">
              {contacts.map((contact, index) => (
                <li key={index} className="contact-item">
                  <a
                    href={contact.href}
                    className="flex items-center gap-2 sm:gap-3 group"
                  >
                    <span className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 flex items-center justify-center rounded-lg bg-yellow-400/10 group-hover:bg-yellow-400 transition-all duration-300">
                      {React.cloneElement(contact.icon, {
                        className:
                          "w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-yellow-400 group-hover:text-white transition-colors",
                      })}
                    </span>
                    <span className="text-xs sm:text-sm md:text-base group-hover:text-yellow-400 transition-colors break-all">
                      {contact.value}
                    </span>
                  </a>
                </li>
              ))}

              <li className="flex items-start gap-2 sm:gap-3">
                <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-yellow-400 mt-1 flex-shrink-0" />
                <span className="text-xs sm:text-sm md:text-base text-gray-400">
                  {t("home.footer.manzil")}
                </span>
              </li>
            </ul>
          </div>

          {/* ===== MAP ===== */}
          <div className="lg:col-span-5 animate-on-scroll delay-2">
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-yellow-400 mb-4 sm:mb-6 relative inline-block">
              {t("home.footer.address")}
              <span className="absolute -bottom-2 left-0 w-8 sm:w-10 md:w-12 h-0.5 bg-yellow-400 rounded-full"></span>
            </h3>

            <div className="map-container group">
              <div className="relative rounded-lg sm:rounded-xl md:rounded-2xl overflow-hidden shadow-xl border border-yellow-400/20 h-40 sm:h-44 md:h-48 lg:h-52">
                <iframe
                  src="https://yandex.ru/map-widget/v1/-/CPeWQD4j"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  title="Diyarel Selam Travel Map"
                  className="transition-transform duration-500 group-hover:scale-105"
                ></iframe>
              </div>

              {/* Map overlay - hidden on mobile, shown on hover on desktop */}
              <div className="hidden sm:block absolute bottom-2 left-2 right-2 bg-black/60 backdrop-blur-sm rounded-lg p-1.5 sm:p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <p className="text-xs text-white flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-yellow-400" />
                  DIYAR EL-SALAM
                </p>
              </div>
            </div>

            {/* Direction button */}
            <a
              href="https://yandex.com.tr/maps/-/CPeWQD4j"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 sm:mt-3 md:mt-4 inline-flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-yellow-400 hover:text-yellow-300 transition-colors group"
            >
              <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
              <span>
                {t("home.footer.get_directions", "Yo'nalishni olish")}
              </span>
              <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>

        {/* ===== COPYRIGHT ===== */}
        <div className="relative mt-10 sm:mt-12 md:mt-16 pt-6 sm:pt-8 border-t border-green-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3 sm:gap-4">
            <p className="text-xs sm:text-sm text-gray-500 text-center md:text-left">
              © {new Date().getFullYear()} DIYAR EL-SALAM.{" "}
              {t("home.footer.rights")}
            </p>
          </div>
        </div>
      </div>

      {/* Back to Top Button */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-4 sm:bottom-6 md:bottom-8 right-4 sm:right-6 md:right-8 z-50 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gradient-to-r from-yellow-400 to-amber-500 text-gray-900 rounded-full shadow-xl back-to-top flex items-center justify-center ${
          showBackToTop
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-10 sm:translate-y-16 pointer-events-none"
        }`}
      >
        <ArrowUp className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
      </button>

      {/* Bottom gradient line */}
      <div className="h-0.5 sm:h-1 bg-gradient-to-r from-yellow-400 via-emerald-400 to-yellow-400"></div>
    </footer>
  );
}

export default Footer;
