import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Award,
  Users,
  Map,
  Star,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import ApiCall, { baseUrl } from "../config";

function Partners() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const { t, i18n } = useTranslation();

  // === Fetch Partners ===
  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const res = await ApiCall(
        "/api/v1/travel-partners/website?page=0&size=20",
      );

      if (res && !res.error) {
        setPartners(res.data.content || []);
      }
    } catch (error) {
      console.error("Error fetching partners:", error);
    } finally {
      setLoading(false);
    }
  };

  // === Get current language ===
  const getCurrentLang = () => {
    const lang = i18n.language || "en";
    const langMap = {
      uz: "uz",
      ru: "ru",
      en: "en",
      tr: "turk",
      turk: "turk",
    };
    return langMap[lang] || "en";
  };

  // === Get partner name based on language ===
  const getPartnerName = (partner) => {
    const lang = getCurrentLang();
    return (
      partner[`name${lang.charAt(0).toUpperCase() + lang.slice(1)}`] ||
      partner.nameEn ||
      partner.nameUz ||
      "Partner"
    );
  };

  // === Static achievement cards data ===
  const achievements = [
    {
      id: 1,
      icon: <Award className="w-10 h-10 text-white" />,
      value: { uz: "8 yil", ru: "8 лет", en: "8 years", turk: "8 yıl" },
      label: {
        uz: "Ish tajribasi",
        ru: "Опыт работы",
        en: "Experience",
        turk: "Deneyim",
      },
      bgColor: "from-amber-500 to-orange-500",
      shadowColor: "amber-500/30",
    },
    {
      id: 2,
      icon: <Users className="w-10 h-10 text-white" />,
      value: {
        uz: "2000+ kishi",
        ru: "2000+ человек",
        en: "2000+ people",
        turk: "2000+ kişi",
      },
      label: {
        uz: "Ziyorat qilganlar",
        ru: "Отправлено в паломничество",
        en: "Sent to pilgrimage",
        turk: "Hac gönderilen",
      },
      bgColor: "from-emerald-500 to-teal-500",
      shadowColor: "emerald-500/30",
    },
    {
      id: 3,
      icon: <Map className="w-10 h-10 text-white" />,
      value: {
        uz: "10+ mintaqa",
        ru: "10+ регионов",
        en: "10+ regions",
        turk: "10+ bölge",
      },
      label: {
        uz: "Hamkorlik hududlari",
        ru: "Регионов сотрудничества",
        en: "Partner regions",
        turk: "İşbirliği bölgeleri",
      },
      bgColor: "from-blue-500 to-indigo-500",
      shadowColor: "blue-500/30",
    },
  ];

  // === Get localized achievement text ===
  const getLocalizedAchievement = (achievement, field) => {
    const lang = getCurrentLang();
    return achievement[field][lang] || achievement[field]["en"];
  };

  // === Partners carousel navigation ===
  const nextSlide = () => {
    if (partners.length <= 6) return;
    setCurrentSlide((prev) => (prev + 1) % Math.ceil(partners.length / 6));
  };

  const prevSlide = () => {
    if (partners.length <= 6) return;
    setCurrentSlide(
      (prev) =>
        (prev - 1 + Math.ceil(partners.length / 6)) %
        Math.ceil(partners.length / 6),
    );
  };

  // === Get current partners for carousel ===
  const getCurrentPartners = () => {
    const itemsPerSlide = 6;
    const start = currentSlide * itemsPerSlide;
    return partners.slice(start, start + itemsPerSlide);
  };

  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Title */}
        <div className="text-center mb-8 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            {t("partners.title", "Наши достижения")}
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 mx-auto rounded-full"></div>
        </div>

        {/* Achievement Cards - Larger and More Colorful */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {achievements.map((achievement, index) => (
            <div
              key={achievement.id}
              className="group relative bg-gray-200/50 rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 animate-slide-up"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {/* Gradient Background */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${achievement.bgColor} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
              ></div>

              {/* Content */}
              <div className="relative p-8 text-center">
                {/* Icon with colored background */}
                <div className="relative inline-block mb-2">
                  <div
                    className={`absolute inset-0 bg-gradient-to-r ${achievement.bgColor} rounded-full blur-xl group-hover:blur-2xl transition-all duration-500 opacity-50`}
                  ></div>
                  <div
                    className={`relative w-16 h-16 mx-auto bg-gradient-to-br ${achievement.bgColor} rounded-2xl flex items-center justify-center text-white transform group-hover:rotate-6 group-hover:scale-110 transition-all duration-500 shadow-lg group-hover:shadow-xl`}
                  >
                    {achievement.icon}
                  </div>
                </div>

                {/* Value */}
                <h3 className="text-3xl font-bold text-gray-800 mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-emerald-600 group-hover:to-teal-600 transition-all duration-300">
                  {getLocalizedAchievement(achievement, "value")}
                </h3>

                {/* Label */}
                <p className="text-gray-600 text-xl">
                  {getLocalizedAchievement(achievement, "label")}
                </p>

                {/* Decorative Line */}
                <div
                  className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 group-hover:w-24 h-1 bg-gradient-to-r ${achievement.bgColor} transition-all duration-500 rounded-full`}
                ></div>
              </div>

              {/* Glowing Effect */}
              <div
                className={`absolute -inset-0.5 bg-gradient-to-r ${achievement.bgColor} rounded-3xl opacity-0 group-hover:opacity-20 blur transition-all duration-500 -z-10`}
              ></div>
            </div>
          ))}
        </div>

        {/* Partners Section Title */}
        <div className="text-center mb-8">
          <h3 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            {t("partners.trusted", "Наши надежные партнеры")}
          </h3>
          <p className="text-xl text-gray-600">
            {t(
              "partners.subtitle",
              "Мы сотрудничаем с лучшими компаниями в отрасли",
            )}
          </p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-emerald-500"></div>
          </div>
        ) : partners.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-sm">
            <Star className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600">
              {t("partners.no_partners", "No partners available")}
            </p>
          </div>
        ) : (
          <>
            {/* Partners Carousel - Larger Logos */}
            <div className="relative">
              {/* Partners Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {getCurrentPartners().map((partner, index) => {
                  const name = getPartnerName(partner);
                  const logoUrl = partner.logo
                    ? `${baseUrl}/api/v1/file/getFile/${partner.logo.id}`
                    : null;

                  return (
                    <div
                      key={partner.id}
                      className="group relative bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 animate-fade-in"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      {/* Logo Container - Larger */}
                      <div className="relative  flex flex-col items-center justify-center p-2">
                        {/* Background Pattern */}
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                        {/* Logo - Larger */}
                        {logoUrl ? (
                          <div className="relative w-44 h-44 mb-4">
                            <img
                              src={logoUrl}
                              alt={name}
                              className="w-full h-full object-contain transform group-hover:scale-110 transition-transform duration-500"
                              onError={(e) => {
                                e.target.src =
                                  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150' viewBox='0 0 150 150'%3E%3Crect width='150' height='150' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='16' fill='%239ca3af' text-anchor='middle' dy='.3em'%3ELogo%3C/text%3E%3C/svg%3E";
                              }}
                            />
                          </div>
                        ) : (
                          <div className="w-32 h-32 mb-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
                            <Star className="text-gray-400" size={48} />
                          </div>
                        )}

                        {/* Partner Name - Larger */}
                        <p className="text-base font-semibold text-gray-700 text-center  line-clamp-2 group-hover:text-emerald-600 transition-colors duration-300">
                          {name}
                        </p>

                        {/* Hover Effect Line */}
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 group-hover:w-16 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500 rounded-full"></div>
                      </div>

                      {/* Decorative Border */}
                      <div className="absolute inset-0 border-2 border-transparent group-hover:border-emerald-500/30 rounded-2xl transition-all duration-500"></div>

                      {/* Glowing Effect */}
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl opacity-0 group-hover:opacity-20 blur transition-all duration-500 -z-10"></div>
                    </div>
                  );
                })}
              </div>

              {/* Carousel Navigation */}
              {partners.length > 6 && (
                <>
                  <button
                    onClick={prevSlide}
                    className="absolute -left-5 top-1/2 transform -translate-y-1/2 bg-white hover:bg-emerald-500 text-gray-600 hover:text-white rounded-full p-3 shadow-lg transition-all duration-300 z-10"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="absolute -right-5 top-1/2 transform -translate-y-1/2 bg-white hover:bg-emerald-500 text-gray-600 hover:text-white rounded-full p-3 shadow-lg transition-all duration-300 z-10"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>

                  {/* Slide Indicators */}
                  <div className="flex justify-center mt-10 space-x-2">
                    {[...Array(Math.ceil(partners.length / 6))].map(
                      (_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentSlide(idx)}
                          className={`h-2 rounded-full transition-all duration-300 ${
                            idx === currentSlide
                              ? "w-10 bg-emerald-500"
                              : "w-2 bg-gray-300 hover:bg-gray-400"
                          }`}
                        />
                      ),
                    )}
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>

      {/* Animation Styles */}
      <style>{`
                @keyframes fade-in {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }

                @keyframes slide-up {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .animate-fade-in {
                    animation: fade-in 0.8s ease-out;
                }

                .animate-slide-up {
                    animation: slide-up 0.6s ease-out forwards;
                    opacity: 0;
                }

                .line-clamp-2 {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
            `}</style>
    </section>
  );
}

export default Partners;
