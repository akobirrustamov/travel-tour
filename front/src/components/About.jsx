import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Award,
  Star,
  MapPin,
  Calendar,
  Users,
  Coffee,
  Wifi,
  Shield,
} from "lucide-react";
import logo from "../assets/images/logo.png";

function About() {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredFeature, setHoveredFeature] = useState(null);
  const sectionRef = useRef(null);

  // Qo'shimcha xususiyatlar
  const features = [
    {
      icon: <Coffee className="w-6 h-6" />,
      title: "about.features.breakfast",
      color: "from-amber-400 to-orange-400",
    },
    {
      icon: <Wifi className="w-6 h-6" />,
      title: "about.features.wifi",
      color: "from-blue-400 to-indigo-400",
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "about.features.guide",
      color: "from-green-400 to-emerald-400",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "about.features.safety",
      color: "from-purple-400 to-pink-400",
    },
  ];

  // Achievements
  const achievements = [
    { icon: <Award />, count: "15+", label: "about.achievements.experience" },
    { icon: <Star />, count: "5000+", label: "about.achievements.clients" },
    { icon: <MapPin />, count: "50+", label: "about.achievements.locations" },
    { icon: <Calendar />, count: "1000+", label: "about.achievements.tours" },
  ];

  // Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 },
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // CSS Animations
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes float {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        50% { transform: translateY(-20px) rotate(2deg); }
      }
      
      @keyframes pulse-glow {
        0%, 100% { opacity: 0.3; transform: scale(1); }
        50% { opacity: 0.6; transform: scale(1.1); }
      }
      
      @keyframes slideFromLeft {
        from {
          opacity: 0;
          transform: translateX(-100px) rotate(-5deg);
        }
        to {
          opacity: 1;
          transform: translateX(0) rotate(0);
        }
      }
      
      @keyframes slideFromRight {
        from {
          opacity: 0;
          transform: translateX(100px) rotate(5deg);
        }
        to {
          opacity: 1;
          transform: translateX(0) rotate(0);
        }
      }
      
      @keyframes scaleIn {
        from {
          opacity: 0;
          transform: scale(0.8);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }
      
      @keyframes rotateBorder {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      @keyframes shimmer {
        0% { background-position: -1000px 0; }
        100% { background-position: 1000px 0; }
      }
      
      .float {
        animation: float 6s ease-in-out infinite;
      }
      
      .pulse-glow {
        animation: pulse-glow 3s ease-in-out infinite;
      }
      
      .shimmer-bg {
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
        background-size: 1000px 100%;
        animation: shimmer 3s infinite;
      }
      
      .feature-card {
        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      }
      
      .feature-card:hover {
        transform: translateY(-10px) scale(1.05);
      }
      
      .stat-card {
        transition: all 0.3s ease;
      }
      
      .stat-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 20px 40px -15px rgba(0,0,0,0.3);
      }
    `;
    document.head.appendChild(style);

    return () => document.head.removeChild(style);
  }, []);

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative py-20 md:py-28 overflow-hidden"
      style={{
        background:
          "radial-gradient(circle at 10% 30%, #f8fafc 0%, #f1f5f9 100%)",
      }}
    >
      {/* Murakkab fon animatsiyalari */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient doiralar */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-gradient-to-br from-yellow-200/30 to-yellow-400/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-gradient-to-tl from-green-200/30 to-green-400/30 rounded-full blur-3xl animate-pulse delay-1000"></div>

        {/* Aylanma chiziqlar */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-yellow-400/10 rounded-full animate-spin"
          style={{ animationDuration: "60s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-yellow-400/20 rounded-full animate-spin"
          style={{ animationDuration: "40s", animationDirection: "reverse" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-yellow-400/30 rounded-full animate-spin"
          style={{ animationDuration: "20s" }}
        ></div>

        {/* Floating elementlar */}
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-yellow-400/20 rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `float ${5 + i * 2}s ease-in-out infinite`,
              animationDelay: `${i * 0.5}s`,
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Header qismi */}
        <div
          className="text-center mb-16"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "translateY(0)" : "translateY(50px)",
            transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 relative">
            <span className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent bg-[length:200%] animate-gradient">
              {t("about.title")}
            </span>
          </h2>

          <div className="flex justify-center gap-2">
            <div className="w-16 h-1 bg-yellow-400 rounded-full animate-pulse"></div>
            <div className="w-16 h-1 bg-green-400 rounded-full animate-pulse delay-300"></div>
            <div className="w-16 h-1 bg-blue-400 rounded-full animate-pulse delay-700"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Chap tomon - Rasm va statistika */}
          <div className="relative">
            {/* Asosiy rasm */}
            <div
              className="relative group"
              style={{
                animation: isVisible ? "slideFromLeft 0.8s ease-out" : "none",
              }}
            >
              {/* Glow effekti */}
              <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 rounded-3xl blur-lg opacity-30 group-hover:opacity-70 transition-all duration-500"></div>

              {/* Rasm */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl transform transition-all duration-700 group-hover:scale-[1.02]">
                <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-transparent z-10"></div>
                <img
                  src={logo}
                  alt="Hotel"
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />

                {/* Overlay animatsiya */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>

              {/* Yulduzcha badge */}
              <div className="absolute -bottom-6 -right-6 w-28 h-28 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-2xl flex items-center justify-center shadow-2xl transform group-hover:rotate-12 transition-all duration-500 float">
                <div className="text-center">
                  <span className="text-4xl block mb-1">⭐</span>
                  <span className="text-white font-bold">5.0</span>
                </div>
              </div>
            </div>
          </div>

          {/* O'ng tomon - Matn va xususiyatlar */}
          <div
            className="space-y-6"
            style={{
              animation: isVisible ? "slideFromRight 0.8s ease-out" : "none",
            }}
          >
            {/* Matn qismi */}
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/50">
              <p className="text-gray-700 leading-relaxed text-lg mb-4 hover:translate-x-1 transition-transform duration-300">
                {t("about.text")}
              </p>
              <p className="text-gray-700 leading-relaxed text-lg mb-4 hover:translate-x-1 transition-transform duration-300 delay-75">
                {t("about.text1")}
              </p>
              <p className="text-gray-700 leading-relaxed text-lg hover:translate-x-1 transition-transform duration-300 delay-100">
                {t("about.text2")}
              </p>

              {/* Dekorativ element */}
              <div className="mt-6 h-1 w-20 bg-gradient-to-r from-yellow-400 to-transparent rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;
