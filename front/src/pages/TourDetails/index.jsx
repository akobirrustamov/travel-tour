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
  X,
} from "lucide-react";
import ApiCall, { baseUrl } from "../../config/index";
import { useNavigate } from "react-router-dom";

function Tours() {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
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
    name: "",
  });

  const handleBookingSubmit = async () => {
    if (!selectedTour) return;

    const bronData = {
      phone: bron.phone,
      email: bron.email,
      name: bron.name,
      travelTourId: selectedTour.id,
    };

    try {
      const res = await ApiCall("/api/v1/bron", "POST", bronData);
      if (res && !res.error) {
        alert("Booking created successfully");
        setShowModal(false);
        setBron({ phone: "", email: "", name: "" });
      }
    } catch (err) {
      console.error(err);
      alert("Booking error");
    }
  };

  // Show tour details modal
  const showTourDetails = (id) => {
    navigate("/tours/" + id);
  };

  // Translation keys with default values
  const translations = {
    title: t("tours.title", "Sayohat Paketlari"),
    subtitle: t("tours.subtitle", "Eng yaxshi sayohat paketlarini kashf eting"),
    no_tours: t("tours.no_tours", "Hozircha sayohatlar mavjud emas"),
    check_back: t(
      "tours.check_back",
      "Yangi sayohatlar uchun keyinroq tekshiring",
    ),
    best_seller: t("tours.best_seller", "Eng Sotiladigan"),
    days: t("tours.days", "kun"),
    max: t("tours.max", "max"),
    per_person: t("tours.per_person", "kishi"),
    itinerary_available: t(
      "tours.itinerary_available",
      "Batafsil marshrut mavjud",
    ),
    read_more: t("tours.read_more", "Batafsil"),
    book_now: t("tours.book_now", "Bron qilish"),
    from: t("tours.from", "dan"),
    to: t("tours.to", "gacha"),
    participants: t("tours.participants", "ishtirokchilar"),
    share: t("tours.share", "Ulashish"),
    details: t("tours.details", "Tafsilotlar"),
    close: t("tours.close", "Yopish"),
    loading: t("tours.loading", "Sayohatlar yuklanmoqda..."),
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

  // Share to Telegram
  const shareToTelegram = (title, description, url) => {
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title + "\n" + description)}`;
    window.open(telegramUrl, "_blank");
  };

  // Fetch Tours
  useEffect(() => {
    fetchTours();
  }, [currentPage]);

  const fetchTours = async () => {
    try {
      setLoading(true);
      const res = await ApiCall(
        `/api/v1/travel-tours/website?page=${currentPage}&size=6`,
      );
      if (res && !res.error) {
        setTours(res.data.content || []);
      }
    } catch (error) {
      console.error("Error fetching tours:", error);
    } finally {
      setLoading(false);
    }
  };

  // Get current language
  const getCurrentLang = () => {
    const lang = i18n.language || "uz";
    const langMap = {
      uz: "uz",
      ru: "ru",
      en: "en",
      tr: "turk",
    };
    return langMap[lang] || "uz";
  };

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

  const calculateDuration = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return Math.ceil(Math.abs(endDate - startDate) / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-br from-gray-50 via-white to-gray-50 relative min-h-screen">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-emerald-500"></div>
          <p className="mt-6 text-xl text-gray-500">{translations.loading}</p>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      className="py-20 bg-gradient-to-br from-gray-50 via-white to-gray-50 relative"
    >
      <div className="container mx-auto px-4">
        <h2 className="text-center text-5xl font-bold mb-6">
          {translations.title}
        </h2>
        <p className="text-center text-xl text-gray-600 mb-6">
          {translations.subtitle}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tours.length === 0 ? (
            <div className="col-span-full text-center py-20">
              <Camera className="w-16 h-16 text-gray-400 mx-auto mb-6" />
              <p className="text-2xl text-gray-800">{translations.no_tours}</p>
              <p className="text-gray-600">{translations.check_back}</p>
            </div>
          ) : (
            tours.map((tour, index) => {
              const title = getTitle(tour);
              const description = getDescription(tour);
              const duration = calculateDuration(tour.startDate, tour.endDate);
              const imageCount = tour.images?.length || 0;
              const currentImageIndex = currentSlide[tour.id] || 0;
              const isHovered = hoveredTour === tour.id;

              return (
                <div
                  key={tour.id}
                  className="group relative bg-white rounded-lg shadow-lg overflow-hidden transition-transform transform hover:-translate-y-2"
                >
                  <div className="relative h-64 overflow-hidden">
                    {tour.images && tour.images.length > 0 ? (
                      tour.images.map((image, idx) => (
                        <div
                          key={idx}
                          className={`absolute inset-0 transition-all duration-700 ease-in-out ${idx === currentImageIndex ? "opacity-100 scale-100" : "opacity-0 scale-110"}`}
                        >
                          <img
                            src={`${baseUrl}/api/v1/file/getFile/${image.id}`}
                            alt={title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))
                    ) : (
                      <div className="absolute inset-0">
                        <img
                          src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800"
                          alt="Default tour"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Image Navigation Arrows */}
                    {imageCount > 1 && (
                      <>
                        <button
                          onClick={() => prevSlide(tour.id, imageCount)}
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-white text-emerald-500 p-2 rounded-full"
                        >
                          <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button
                          onClick={() => nextSlide(tour.id, imageCount)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-white text-emerald-500 p-2 rounded-full"
                        >
                          <ChevronRight className="w-6 h-6" />
                        </button>
                      </>
                    )}

                    {/* Like Button */}
                    <button
                      onClick={() => toggleLike(tour.id)}
                      className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm p-2 rounded-full hover:scale-110 transition-transform duration-300"
                    >
                      <Heart
                        className={`w-5 h-5 ${likedTours[tour.id] ? "fill-red-500 text-red-500" : "text-gray-600"}`}
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
                      className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-full transform hover:scale-110 transition-all duration-300"
                    >
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="p-4">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      {title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {description}
                    </p>
                    <div className="flex items-center mb-3 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-1 text-emerald-500" />
                      <span>{tour.cities?.join(" • ")}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 mb-4">
                      <Calendar className="w-4 h-4 mr-1 text-emerald-500" />
                      <span>{`${new Date(tour.startDate).toLocaleDateString()} - ${new Date(tour.endDate).toLocaleDateString()}`}</span>
                    </div>

                    <div className="flex justify-between text-sm text-gray-600 mb-4">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 text-emerald-500 mr-1" />
                        {duration} {translations.days}
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 text-emerald-500 mr-1" />
                        <span>
                          {tour.price?.toLocaleString()} {tour.currency}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <button
                        onClick={() => showTourDetails(tour.id)}
                        className="bg-emerald-500 text-white px-6 py-2 rounded-lg hover:bg-emerald-600 transition-all"
                      >
                        {translations.read_more}
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setSelectedTour(tour);
                          setShowModal(true);
                        }}
                        className="bg-teal-500 text-white px-6 py-2 rounded-lg hover:bg-teal-600 transition-all"
                      >
                        {translations.book_now}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {showModal && selectedTour && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden">
              {/* HEADER IMAGE */}
              <div className="relative h-48">
                <img
                  src={
                    selectedTour.images?.[0]
                      ? `${baseUrl}/api/v1/file/getFile/${selectedTour.images[0].id}`
                      : "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800"
                  }
                  className="w-full h-full object-cover"
                  alt=""
                />
                <button
                  onClick={() => setShowModal(false)}
                  className="absolute top-3 right-3 bg-white p-2 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold mb-4">
                  {getTitle(selectedTour)}
                </h3>

                {/* FORM */}
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Full name"
                    value={bron.name}
                    onChange={(e) => setBron({ ...bron, name: e.target.value })}
                    className="w-full border p-3 rounded-lg"
                  />

                  <input
                    type="email"
                    placeholder="Email"
                    value={bron.email}
                    onChange={(e) =>
                      setBron({ ...bron, email: e.target.value })
                    }
                    className="w-full border p-3 rounded-lg"
                  />

                  <input
                    type="text"
                    placeholder="Phone"
                    value={bron.phone}
                    onChange={(e) =>
                      setBron({ ...bron, phone: e.target.value })
                    }
                    className="w-full border p-3 rounded-lg"
                  />
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 border py-3 rounded-lg"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleBookingSubmit}
                    className="flex-1 bg-emerald-500 text-white py-3 rounded-lg"
                  >
                    Confirm Booking
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default Tours;
