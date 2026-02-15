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
  Heart,
  Camera,
  Compass,
  Sun,
  Moon,
  Wind,
  Sparkles,
} from "lucide-react";
import logo from "../assets/images/logo.png";

function About() {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const [activeParagraph, setActiveParagraph] = useState(null);
  const sectionRef = useRef(null);

  // Qo'shimcha xususiyatlar
  const features = [
    {
      icon: <Coffee className="w-6 h-6" />,
      title: "about.features.breakfast",
      color: "from-amber-400 to-orange-400",
      delay: 0,
    },
    {
      icon: <Wifi className="w-6 h-6" />,
      title: "about.features.wifi",
      color: "from-blue-400 to-indigo-400",
      delay: 100,
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "about.features.guide",
      color: "from-green-400 to-emerald-400",
      delay: 200,
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "about.features.safety",
      color: "from-purple-400 to-pink-400",
      delay: 300,
    },
  ];

  // Achievements
  const achievements = [
    {
      icon: <Award />,
      count: "15+",
      label: "about.achievements.experience",
      color: "from-yellow-400 to-amber-500",
    },
    {
      icon: <Star />,
      count: "5000+",
      label: "about.achievements.clients",
      color: "from-blue-400 to-indigo-500",
    },
    {
      icon: <MapPin />,
      count: "50+",
      label: "about.achievements.locations",
      color: "from-green-400 to-emerald-500",
    },
    {
      icon: <Calendar />,
      count: "1000+",
      label: "about.achievements.tours",
      color: "from-purple-400 to-pink-500",
    },
  ];

  // Paragraflar uchun ma'lumotlar
  const paragraphs = [
    {
      id: 1,
      icon: <Compass className="w-5 h-5" />,
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      delay: 0,
      position: "left",
    },
    {
      id: 2,
      icon: <Camera className="w-5 h-5" />,
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      delay: 100,
      position: "right",
    },
    {
      id: 3,
      icon: <Heart className="w-5 h-5" />,
      color: "from-red-500 to-pink-500",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      delay: 200,
      position: "center",
    },
    {
      id: 5,
      icon: <Wind className="w-5 h-5" />,
      color: "from-purple-500 to-violet-500",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      delay: 400,
      position: "right",
    },
  ];

  const paragra = [
    {
      id: 4,
      icon: <Sun className="w-5 h-5" />,
      color: "from-yellow-500 to-orange-500",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
      delay: 300,
      position: "left",
    },
  ];

  // Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 },
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
        50% { transform: translateY(-15px) rotate(2deg); }
      }
      
      @keyframes pulse-glow {
        0%, 100% { opacity: 0.2; transform: scale(1); }
        50% { opacity: 0.5; transform: scale(1.05); }
      }
      
      @keyframes slideFromLeft {
        from {
          opacity: 0;
          transform: translateX(-50px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
      
      @keyframes slideFromRight {
        from {
          opacity: 0;
          transform: translateX(50px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
      
      @keyframes slideFromBottom {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      @keyframes rotateIn {
        from {
          opacity: 0;
          transform: rotate(-10deg) scale(0.9);
        }
        to {
          opacity: 1;
          transform: rotate(0) scale(1);
        }
      }
      
      @keyframes shimmer {
        0% { background-position: -1000px 0; }
        100% { background-position: 1000px 0; }
      }
      
      @keyframes wave {
        0%, 100% { transform: translateY(0); }
        25% { transform: translateY(-5px); }
        75% { transform: translateY(5px); }
      }
      
      .float {
        animation: float 6s ease-in-out infinite;
      }
      
      .pulse-glow {
        animation: pulse-glow 3s ease-in-out infinite;
      }
      
      .wave {
        animation: wave 3s ease-in-out infinite;
      }
      
      .paragraph-card {
        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        backdrop-filter: blur(8px);
      }
      
      .paragraph-card:hover {
        transform: translateY(-5px) scale(1.02);
        box-shadow: 0 20px 40px -15px rgba(0,0,0,0.2);
      }
      
      .paragraph-card.active {
        transform: scale(1.03);
        box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
      }
      
      .stat-card {
        transition: all 0.3s ease;
      }
      
      .stat-card:hover {
        transform: translateY(-8px) scale(1.05);
      }
      
      .feature-icon {
        transition: all 0.3s ease;
      }
      
      .feature-icon:hover {
        transform: rotate(15deg) scale(1.2);
      }
      
      .gradient-border {
        position: relative;
        border: double 1px transparent;
        background-image: linear-gradient(white, white), 
          linear-gradient(to right, #fbbf24, #f59e0b);
        background-origin: border-box;
        background-clip: padding-box, border-box;
      }
    `;
    document.head.appendChild(style);

    return () => document.head.removeChild(style);
  }, []);

  // Paragrafni bosganda aktiv qilish
  const handleParagraphClick = (id) => {
    setActiveParagraph(activeParagraph === id ? null : id);
  };

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative py-16 overflow-hidden min-h-screen flex items-center"
      style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      }}
    >
      {/* Murakkab fon animatsiyalari */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient doiralar */}
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-gradient-to-br from-purple-300/30 to-pink-300/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-[700px] h-[700px] bg-gradient-to-tl from-blue-300/30 to-cyan-300/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-yellow-300/20 to-orange-300/20 rounded-full blur-3xl animate-pulse delay-500"></div>

        {/* Aylanma chiziqlar */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] border border-white/10 rounded-full animate-spin"
          style={{ animationDuration: "80s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] border border-white/15 rounded-full animate-spin"
          style={{ animationDuration: "60s", animationDirection: "reverse" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-white/20 rounded-full animate-spin"
          style={{ animationDuration: "40s" }}
        ></div>

        {/* Floating elementlar */}
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-3 h-3 bg-white/20 rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `float ${4 + (i % 5) * 2}s ease-in-out infinite`,
              animationDelay: `${i * 0.3}s`,
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
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 bg-clip-text text-transparent">
              {t("about.title")}
            </span>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-transparent mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Chap tomon - Rasm va statistika */}
          <div className="relative space-y-8">
            {/* Asosiy rasm */}
            <div
              className="relative group"
              style={{
                animation: isVisible ? "slideFromLeft 0.8s ease-out" : "none",
              }}
            >
              <div className="group relative rounded-3xl overflow-hidden transform transition-all duration-700">
                <img
                  src={logo}
                  alt="Hotel"
                  className="w-[80%] h-[80%] scale-105 object-cover transition-transform duration-1000 group-hover:scale-110"
                />
              </div>
              {/* Yulduzcha badge */}
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center shadow-2xl transform group-hover:rotate-12 transition-all duration-500 float">
                <div className="text-center">
                  <Sparkles className="w-8 h-8 text-white mx-auto mb-1" />
                  <span className="text-white font-bold text-xl">5.0</span>
                </div>
              </div>
            </div>
            {paragra.map((para) => (
              <div
                key={para.id}
                className={`paragraph-card ${para.bgColor} border-2 ${para.borderColor} rounded-xl p-5 shadow-lg cursor-pointer transition-all duration-300 ${
                  activeParagraph === para.id ? "active" : ""
                }`}
                style={{
                  marginLeft:
                    para.position === "left"
                      ? "0"
                      : para.position === "right"
                        ? "2rem"
                        : "1rem",
                  marginRight: para.position === "left" ? "2rem" : "0",
                  animation: isVisible
                    ? `${
                        para.position === "left"
                          ? "slideFromLeft"
                          : para.position === "right"
                            ? "slideFromRight"
                            : "rotateIn"
                      } 0.6s ease-out ${para.delay * 0.001}s both`
                    : "none",
                }}
                // onClick={() => handleParagraphClick(para.id)}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r ${para.color} flex items-center justify-center text-white feature-icon`}
                  >
                    {para.icon}
                  </div>
                  <div className="flex-1">
                    <p
                      className={`text-gray-800 leading-relaxed ${
                        activeParagraph === para.id
                          ? "text-lg font-medium"
                          : "text-base"
                      }`}
                    >
                      {t(`about.text${para.id}`)}
                    </p>

                    {/* Aktiv bo'lganda qo'shimcha ma'lumot */}
                    {activeParagraph === para.id && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Heart className="w-4 h-4 text-red-500" />
                          <span>Read more about this experience</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* O'ng tomon - Matnlar turli xil joylashgan */}
          <div
            className="space-y-6"
            style={{
              animation: isVisible ? "slideFromRight 0.8s ease-out" : "none",
            }}
          >
            {/* Paragraflarni turli xil joylashtirish */}
            <div className="grid grid-cols-1 gap-4">
              {paragraphs.map((para) => (
                <div
                  key={para.id}
                  className={`paragraph-card ${para.bgColor} border-2 ${para.borderColor} rounded-xl p-5 shadow-lg cursor-pointer transition-all duration-300 ${
                    activeParagraph === para.id ? "active" : ""
                  }`}
                  style={{
                    marginLeft:
                      para.position === "left"
                        ? "0"
                        : para.position === "right"
                          ? "2rem"
                          : "1rem",
                    marginRight: para.position === "left" ? "2rem" : "0",
                    animation: isVisible
                      ? `${
                          para.position === "left"
                            ? "slideFromLeft"
                            : para.position === "right"
                              ? "slideFromRight"
                              : "rotateIn"
                        } 0.6s ease-out ${para.delay * 0.001}s both`
                      : "none",
                  }}
                  // onClick={() => handleParagraphClick(para.id)}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r ${para.color} flex items-center justify-center text-white feature-icon`}
                    >
                      {para.icon}
                    </div>
                    <div className="flex-1">
                      <p
                        className={`text-gray-800 leading-relaxed ${
                          activeParagraph === para.id
                            ? "text-lg font-medium"
                            : "text-base"
                        }`}
                      >
                        {t(`about.text${para.id}`)}
                      </p>

                      {/* Aktiv bo'lganda qo'shimcha ma'lumot */}
                      {activeParagraph === para.id && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Heart className="w-4 h-4 text-red-500" />
                            <span>Read more about this experience</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Dekorativ element */}
            <div className="flex justify-center gap-2 mt-6">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-500 wave"
                  style={{ animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;
