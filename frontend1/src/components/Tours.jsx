import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  Star,
  Info,
  Send,
  Heart,
  Share2,
  Compass,
  Camera,
  Users,
  Award,
  X, // 🔥 SHU YERGA QO‘SHING
} from "lucide-react";
import ApiCall, { baseUrl } from "../config";
import { useNavigate } from "react-router-dom";

function Tours() {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentSlide, setCurrentSlide] = useState({});
  const [hoveredTour, setHoveredTour] = useState(null);
  const [likedTours, setLikedTours] = useState({});
  const [selectedTour, setSelectedTour] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [bron, setBron] = useState({
    phone: "",
    email: "",
    travelTour: "",
    name: "",
    id: 0,
  });

  // Show tour details modal
  const showTourDetails = (id) => {
    navigate("/tours/" + id);
  };

  // Translation keys with default values
  const translations = {
    title: t("tours.title"),
    subtitle: t("tours.subtitle"),
    no_tours: t("tours.no_tours"),
    check_back: t("tours.check_back"),
    best_seller: t("tours.best_seller"),
    days: t("tours.days"),
    max: t("tours.max"),
    per_person: t("tours.per_person"),
    itinerary_available: t("tours.itinerary_available"),
    read_more: t("tours.read_more"),
    book_now: t("tours.book_now"),
    from: t("tours.from", "dan"),
    to: t("tours.to", "gacha"),
    participants: t("tours.participants"),
    share: t("tours.share"),
    details: t("tours.details"),
    close: t("tours.close"),
    loading: t("tours.loading"),
  };

  // Intersection Observer for section animation
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

  const handleBookingSubmit = async () => {
    const bronData = {
      phone: bron.phone,
      email: bron.email,
      name: bron.name,
      travelTourId: selectedTour.id, // Send the selected tour ID
    };

    try {
      const res = await ApiCall("/api/v1/bron", "POST", bronData);
      if (res && !res.error) {
        alert("Booking created successfully.");
        setShowModal(false); // Close the modal after success
        navigate("/tours"); // Optionally navigate back to the tours page
      }
    } catch (error) {
      console.error("Error creating booking:", error);
      alert("An error occurred while creating the booking.");
    }
  };

  // Share to Telegram
  const shareToTelegram = (title, description, url) => {
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title + "\n" + description)}`;
    window.open(telegramUrl, "_blank");
  };

  // CSS Animations
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes float {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        50% { transform: translateY(-10px) rotate(1deg); }
      }
      
      @keyframes pulse-glow {
        0%, 100% { opacity: 0.5; transform: scale(1); }
        50% { opacity: 0.8; transform: scale(1.05); }
      }
      
      @keyframes slideInUp {
        from {
          opacity: 0;
          transform: translateY(50px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      @keyframes shimmer {
        0% { background-position: -1000px 0; }
        100% { background-position: 1000px 0; }
      }
      
      @keyframes rotate {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      
      @keyframes cardAppear {
        0% {
          opacity: 0;
          transform: scale(0.8) translateY(30px);
        }
        100% {
          opacity: 1;
          transform: scale(1) translateY(0);
        }
      }
      
      @keyframes modalFadeIn {
        from {
          opacity: 0;
          transform: scale(0.9);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }
      
      .float {
        animation: float 6s ease-in-out infinite;
      }
      
      .pulse-glow {
        animation: pulse-glow 3s ease-in-out infinite;
      }
      
      .shimmer-bg {
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
        background-size: 1000px 100%;
        animation: shimmer 3s infinite;
      }
      
      .rotate-slow {
        animation: rotate 20s linear infinite;
      }
      
      .tour-card {
        animation: cardAppear 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        opacity: 0;
      }
      
      .image-zoom {
        transition: transform 8s cubic-bezier(0.4, 0, 0.2, 1);
      }
      
      .image-zoom:hover {
        transform: scale(1.1);
      }
      
      .glass-effect {
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
      }
      
      .modal-animation {
        animation: modalFadeIn 0.3s ease-out;
      }
    `;
    document.head.appendChild(style);

    return () => document.head.removeChild(style);
  }, []);

  // === Fetch Tours ===
  useEffect(() => {
    fetchTours();
  }, [currentPage]);

  const fetchTours = async () => {
    try {
      setLoading(true);
      const res = await ApiCall(
        `/api/v1/travel-tours/page?page=${currentPage}&size=6`,
      );

      if (res && !res.error) {
        setTours(res.data.content || []);
        setTotalPages(res.data.totalPages || 0);

        // Initialize current slide for each tour
        const initialSlide = {};
        res.data.content.forEach((tour) => {
          initialSlide[tour.id] = 0;
        });
        setCurrentSlide(initialSlide);
      }
    } catch (error) {
      console.error("Error fetching tours:", error);
    } finally {
      setLoading(false);
    }
  };

  // === Get current language ===
  const getCurrentLang = () => {
    const lang = i18n.language || "uz";
    const langMap = {
      uz: "uz",
      ru: "ru",
      en: "en",
      tr: "turk",
      turk: "turk",
    };
    return langMap[lang] || "uz";
  };

  // === Get title based on language ===
  const getTitle = (tour) => {
    const lang = getCurrentLang();

    return (
      tour[`title_${lang}`] ||
      tour.title_uz ||
      tour.title_en ||
      translations.title
    );
  };

  const getDescription = (tour) => {
    const lang = getCurrentLang();
    const description =
      tour[`description_${lang}`] || tour.description_uz || "";
    return description.replace(/<\/?[^>]+(>|$)/g, "");
  };

  // === Format date based on language ===
  const formatDateRange = (startDate, endDate) => {
    if (!startDate || !endDate) return "";

    const start = new Date(startDate);
    const end = new Date(endDate);

    const dayStart = start.getDate();
    const dayEnd = end.getDate();

    const lang = getCurrentLang();

    const uzMonths = [
      "yanvar",
      "fevral",
      "mart",
      "aprel",
      "may",
      "iyun",
      "iyul",
      "avgust",
      "sentabr",
      "oktabr",
      "noyabr",
      "dekabr",
    ];

    const ruMonths = [
      "января",
      "февраля",
      "марта",
      "апреля",
      "мая",
      "июня",
      "июля",
      "августа",
      "сентября",
      "октября",
      "ноября",
      "декабря",
    ];

    const enMonths = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const trMonths = [
      "Ocak",
      "Şubat",
      "Mart",
      "Nisan",
      "Mayıs",
      "Haziran",
      "Temmuz",
      "Ağustos",
      "Eylül",
      "Ekim",
      "Kasım",
      "Aralık",
    ];

    const getMonthName = (date) => {
      const monthIndex = date.getMonth();
      switch (lang) {
        case "uz":
          return uzMonths[monthIndex];
        case "ru":
          return ruMonths[monthIndex];
        case "turk":
          return trMonths[monthIndex];
        default:
          return enMonths[monthIndex];
      }
    };

    const monthStart = getMonthName(start);
    const monthEnd = getMonthName(end);

    switch (lang) {
      case "ru":
        return `${dayStart} ${monthStart} - ${dayEnd} ${monthEnd}`;
      case "uz":
        return `${dayStart}-${monthStart} - ${dayEnd}-${monthEnd}`;
      case "turk":
        return `${dayStart} ${monthStart} - ${dayEnd} ${monthEnd}`;
      default:
        return `${monthStart} ${dayStart} - ${monthEnd} ${dayEnd}`;
    }
  };

  // === Calculate duration ===
  const calculateDuration = (start, end) => {
    if (!start || !end) return 0;
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate - startDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // === Next slide ===
  const nextSlide = (tourId, imageCount) => {
    setCurrentSlide((prev) => ({
      ...prev,
      [tourId]: (prev[tourId] + 1) % imageCount,
    }));
  };

  // === Previous slide ===
  const prevSlide = (tourId, imageCount) => {
    setCurrentSlide((prev) => ({
      ...prev,
      [tourId]: (prev[tourId] - 1 + imageCount) % imageCount,
    }));
  };

  // === Toggle like ===
  const toggleLike = (tourId) => {
    setLikedTours((prev) => ({
      ...prev,
      [tourId]: !prev[tourId],
    }));
  };

  // === Loading State ===
  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-br from-gray-50 via-white to-gray-50 relative overflow-hidden min-h-screen">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <div className="inline-block p-3 bg-emerald-100 rounded-full mb-4 animate-bounce">
              <Compass className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              {translations.title}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {translations.subtitle}
            </p>
          </div>

          <div className="flex flex-col items-center justify-center h-64">
            <div className="relative">
              <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-emerald-500"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-10 bg-emerald-500 rounded-full animate-pulse"></div>
              </div>
            </div>
            <p className="mt-6 text-gray-500 animate-pulse">
              {translations.loading}
            </p>
          </div>
        </div>
      </section>
    );
  }

  const getCities = (tour) => {
    const lang = getCurrentLang();
    return tour?.[`cities_${lang}`] || tour?.cities_uz || [];
  };

  return (
    <>
      <section
        ref={sectionRef}
        className="py-10 bg-gradient-to-br from-gray-50 via-white to-gray-50 relative overflow-hidden"
      >
        {/* Background Decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-72 h-72 bg-emerald-200/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-yellow-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-emerald-200/30 rounded-full rotate-slow"></div>

          {/* Floating Icons */}
          <div className="absolute top-40 left-[15%] text-emerald-300/20 rotate-slow">
            <Compass size={60} />
          </div>
          <div
            className="absolute bottom-40 right-[15%] text-yellow-300/20 rotate-slow"
            style={{ animationDirection: "reverse" }}
          >
            <MapPin size={60} />
          </div>

          {/* Particles */}
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1.5 h-1.5 bg-emerald-400/20 rounded-full"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animation: `float ${5 + Math.random() * 10}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 5}s`,
              }}
            />
          ))}
        </div>

        <div className="container mx-auto px-4 relative z-10">
          {/* Section Header with Animation */}
          <div
            className={`text-center mb-4 transition-all duration-1000 transform`}
          >
            <div className="inline-block mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-400 rounded-full blur-lg opacity-50 animate-ping"></div>
                <div className="relative bg-gradient-to-r from-emerald-400 to-teal-400 p-4 rounded-full">
                  <Award className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>

            <h2 className="text-5xl md:text-6xl font-bold mb-4">
              <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 bg-clip-text text-transparent bg-[length:200%] animate-gradient">
                {translations.title}
              </span>
            </h2>

            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {translations.subtitle}
            </p>

            <div className="flex justify-center gap-2 mt-4">
              <div className="w-16 h-1 bg-emerald-400 rounded-full animate-pulse"></div>
              <div className="w-16 h-1 bg-yellow-400 rounded-full animate-pulse delay-300"></div>
              <div className="w-16 h-1 bg-teal-400 rounded-full animate-pulse delay-700"></div>
            </div>
          </div>

          {/* Tours Grid */}
          {tours.length === 0 ? (
            <div className="text-center py-20">
              <div className="inline-block p-6 bg-white rounded-full shadow-xl mb-6">
                <Camera className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-3xl font-bold text-gray-800 mb-2">
                {translations.no_tours}
              </h3>
              <p className="text-gray-600 text-lg">{translations.check_back}</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {tours.map((tour, index) => {
                  const title = getTitle(tour);
                  const description = getDescription(tour);
                  const duration = calculateDuration(
                    tour.startDate,
                    tour.endDate,
                  );
                  const dateRange = formatDateRange(
                    tour.startDate,
                    tour.endDate,
                  );
                  const imageCount = tour.images?.length || 0;
                  const currentImageIndex = currentSlide[tour.id] || 0;
                  const isHovered = hoveredTour === tour.id;

                  return (
                    <div
                      key={tour.id}
                      className="tour-card group relative"
                      style={{ animationDelay: `${index * 0.1}s` }}
                      onMouseEnter={() => setHoveredTour(tour.id)}
                      onMouseLeave={() => setHoveredTour(null)}
                    >
                      {/* Card Glow Effect */}
                      <div
                        className={`absolute -inset-0.5 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-3xl blur opacity-0 group-hover:opacity-30 transition-all duration-500 ${
                          isHovered ? "opacity-30" : ""
                        }`}
                      ></div>

                      <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all duration-500 hover:-translate-y-2">
                        {/* Image Section */}
                        <div className="relative h-64 overflow-hidden">
                          {/* Images */}
                          {tour.images && tour.images.length > 0 ? (
                            <>
                              {tour.images.map((image, idx) => (
                                <div
                                  key={idx}
                                  className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                                    idx === currentImageIndex
                                      ? "opacity-100 scale-100"
                                      : "opacity-0 scale-110"
                                  }`}
                                >
                                  <img
                                    src={`${baseUrl}/api/v1/file/getFile/${image.id}`}
                                    alt={title}
                                    className="w-full h-full "
                                    onError={(e) => {
                                      e.target.src =
                                        "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800";
                                    }}
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                                </div>
                              ))}
                            </>
                          ) : (
                            <div className="absolute inset-0">
                              <img
                                src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800"
                                alt="Default tour"
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                            </div>
                          )}

                          {/* Navigation Arrows */}
                          {imageCount > 1 && (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  prevSlide(tour.id, imageCount);
                                }}
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-emerald-600 rounded-full p-2 transition-all z-20 opacity-0 group-hover:opacity-100 translate-x-[-10px] group-hover:translate-x-0 duration-300"
                              >
                                <ChevronLeft className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  nextSlide(tour.id, imageCount);
                                }}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-emerald-600 rounded-full p-2 transition-all z-20 opacity-0 group-hover:opacity-100 translate-x-[10px] group-hover:translate-x-0 duration-300"
                              >
                                <ChevronRight className="w-4 h-4" />
                              </button>
                            </>
                          )}

                          {/* Image Counter */}
                          {imageCount > 1 && (
                            <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs z-10">
                              {currentImageIndex + 1} / {imageCount}
                            </div>
                          )}

                          {/* Like Button */}
                          <button
                            onClick={() => toggleLike(tour.id)}
                            className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm p-2 rounded-full z-10 hover:scale-110 transition-transform duration-300"
                          >
                            <Heart
                              className={`w-4 h-4 transition-colors ${
                                likedTours[tour.id]
                                  ? "fill-red-500 text-red-500"
                                  : "text-gray-600"
                              }`}
                            />
                          </button>
                          {/* Share Button */}
                          <button
                            onClick={() =>
                              shareToTelegram(
                                title,
                                description,
                                window.location.href,
                              )
                            }
                            className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-full  transition-all duration-300 hover:bg-emerald-500 hover:text-white transform hover:scale-110"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                          {/* Badge */}
                          {duration >= 7 && (
                            <div className="absolute top-3 left-14 bg-gradient-to-r from-yellow-400 to-amber-400 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg z-10 flex items-center gap-1">
                              <Star className="w-3 h-3 fill-white" />
                              {translations.best_seller}
                            </div>
                          )}

                          {/* Shimmer Effect on Hover */}
                          <div
                            className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000`}
                          ></div>
                        </div>

                        {/* Content Section */}
                        <div className="p-5">
                          {/* Cities */}
                          <div className="flex items-center text-gray-600 mb-2">
                            <MapPin className="w-4 h-4 mr-1.5 text-emerald-500 flex-shrink-0" />
                            <span className="text-sm truncate">
                              {getCities(tour)?.slice(0, 3).join(" • ")}
                              {getCities(tour)?.length > 3 && " • ..."}
                            </span>
                          </div>

                          {/* Description (if available) */}
                          {/* Title Overlay */}
                          <div className=" my-1">
                            <h3 className=" font-bold text-md drop-shadow-lg ">
                              {title}
                            </h3>
                          </div>

                          {/* Date Range */}
                          <div className="flex items-center text-gray-600 mb-3 bg-gray-50 p-2 rounded-lg">
                            <Calendar className="w-4 h-4 mr-2 text-emerald-500 flex-shrink-0" />
                            <span className="text-xs font-medium">
                              {dateRange}
                            </span>
                          </div>

                          {/* Tour Info Grid */}
                          <div className="grid grid-cols-2  gap-2 mb-4">
                            {/* Duration */}
                            <div className="text-center bg-gradient-to-b from-gray-50 to-white p-2 rounded-lg">
                              <Clock className="w-4 h-4 mx-auto text-emerald-500 mb-1" />
                              <span className="text-xs font-medium text-gray-700">
                                {duration+1} {translations.days}
                              </span>
                            </div>

                            {/* Price */}
                            <div className="text-center bg-gradient-to-b from-emerald-50 to-white p-2 rounded-lg">
                              <DollarSign className="w-4 h-4 mx-auto text-emerald-500 mb-1" />
                              <span className="text-xs font-bold text-gray-800">
                                {tour.price?.toLocaleString()}
                              </span>
                              <span className="text-xs text-gray-500 block">
                                {tour.currency}
                              </span>
                            </div>

                            {/* Capacity */}
                            {/* <div className="text-center bg-gradient-to-b from-gray-50 to-white p-2 rounded-lg">
                              <Users className="w-4 h-4 mx-auto text-emerald-500 mb-1" />
                              <span className="text-xs font-medium text-gray-700">
                                {50} 
                              </span>
                            </div> */}
                          </div>

                          {/* Itinerary Badge */}
                          {tour.itineraryDetails && (
                            <div className="mb-4 p-2 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-100">
                              <div className="flex items-center">
                                <Star className="w-4 h-4 text-emerald-600 mr-2 flex-shrink-0" />
                                <span className="text-xs text-emerald-700 font-medium">
                                  {translations.itinerary_available}
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              onClick={() => showTourDetails(tour.id)}
                              className="group/btn relative overflow-hidden bg-gradient-to-r from-gray-100 to-gray-50 hover:from-gray-200 hover:to-gray-100 text-gray-700  group-hover:border-2 py-3 rounded-xl text-sm font-medium transition-all shadow-md hover:shadow-lg"
                            >
                              <span className="relative z-10 flex items-center justify-center gap-1">
                                <Info className="w-4 h-4" />
                                {translations.read_more}
                              </span>
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700"></div>
                            </button>

                            <button
                              onClick={(e) => {
                                setSelectedTour(tour);
                                setShowModal(true);
                              }}
                              className="group/btn relative overflow-hidden bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white py-3 rounded-xl text-sm font-medium transition-all shadow-lg hover:shadow-xl"
                            >
                              <span className="relative z-10 flex items-center justify-center gap-1">
                                <Send className="w-4 h-4" />
                                {translations.book_now}
                              </span>
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700"></div>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Bottom Wave */}
        <div className="absolute bottom-0 left-0 w-full">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1440 120"
            className="w-full h-auto opacity-5"
          >
            <path
              fill="#10b981"
              fillOpacity="1"
              d="M0,64L48,80C96,96,192,128,288,128C384,128,480,96,576,85.3C672,75,768,85,864,90.7C960,96,1056,96,1152,80C1248,64,1344,32,1392,16L1440,0L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"
            ></path>
          </svg>
        </div>

        <div className="flex justify-center mt-8 relative z-10">
          <button
            onClick={() => navigate("/tours")}
            className="bg-emerald-500 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-emerald-600 transition-all duration-300 ease-in-out transform hover:scale-105"
          >
            {t("gallery.more")}
          </button>
        </div>
      </section>

      {/* Tour Details Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="modal-animation bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="relative">
              {/* Modal Header with Image */}
              <div className="relative h-64">
                <img
                  src={
                    selectedTour.images?.[0]
                      ? `${baseUrl}/api/v1/file/getFile/${selectedTour.images[0].id}`
                      : "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800"
                  }
                  alt={getTitle(selectedTour)}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>

                {/* Close Button */}
                <button
                  onClick={() => setShowModal(false)} // Close the modal when clicking the close button
                  className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-all"
                >
                  <X className="w-5 h-5 text-gray-700" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-3">
                  {getTitle(selectedTour)} {/* Display the title */}
                </h3>

                {/* Cities */}
                <div className="flex items-center text-gray-600 mb-3">
                  <MapPin className="w-4 h-4 mr-2 text-emerald-500" />
                  <span>{getCities(selectedTour)?.join(" → ")}</span>
                </div>

                {/* Description */}
                <p className="text-gray-600 mb-4">
                  <div
                    className="prose max-w-none text-gray-600 mb-4"
                    dangerouslySetInnerHTML={{
                      __html:
                        selectedTour[`description_${getCurrentLang()}`] ||
                        selectedTour.description_uz ||
                        "",
                    }}
                  />
                  {/* Display the description */}
                </p>

                {/* Booking Form */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-800 mb-2">
                    {t("tours.book_details")}
                  </h4>
                  <form>
                    <div className="mb-4">
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700"
                      >
                        {t("tours.name")}
                      </label>
                      <input
                        type="text"
                        id="name"
                        value={bron.name}
                        onChange={(e) =>
                          setBron({ ...bron, name: e.target.value })
                        }
                        className="w-full p-3 mt-1 border border-gray-300 rounded-lg"
                        placeholder={t("tours.enter_name")}
                      />
                    </div>

                    <div className="mb-4">
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700"
                      >
                        {t("tours.email")}
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={bron.email}
                        onChange={(e) =>
                          setBron({ ...bron, email: e.target.value })
                        }
                        className="w-full p-3 mt-1 border border-gray-300 rounded-lg"
                        placeholder={t("tours.enter_email")}
                      />
                    </div>

                    <div className="mb-4">
                      <label
                        htmlFor="phone"
                        className="block text-sm font-medium text-gray-700"
                      >
                        {t("tours.phone")}
                      </label>
                      <input
                        type="text"
                        id="phone"
                        value={bron.phone}
                        onChange={(e) =>
                          setBron({ ...bron, phone: e.target.value })
                        }
                        className="w-full p-3 mt-1 border border-gray-300 rounded-lg"
                        placeholder={t("tours.enter_phone")}
                      />
                    </div>
                  </form>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setShowModal(false)} // Close the modal
                    className="py-3 px-4 border-2 border-gray-200 rounded-xl text-gray-600 font-medium hover:bg-gray-50 transition-all"
                  >
                    {translations.close}
                  </button>

                  <button
                    onClick={handleBookingSubmit} // Call the booking handler
                    className="py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg"
                  >
                    {translations.book_now}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Tours;
