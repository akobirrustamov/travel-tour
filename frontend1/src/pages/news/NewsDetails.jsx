import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ApiCall, { baseUrl } from "../../config";
import { useTranslation } from "react-i18next";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Calendar,
  DollarSign,
  Share2,
  MapPin,
  Clock,
  Info,
  X,
  Camera,
  CheckCircle,
  Sparkles,
  Phone,
  MessageCircle,
  Navigation,
  Check,
  HelpCircle,
  MessageSquareMoreIcon,
} from "lucide-react";
import Footer from "../../components/Footer";

function Details() {
  const [tourDays, setTourDays] = useState([]);
  const { id } = useParams();
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [activeDay, setActiveDay] = useState(1);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bron, setBron] = useState({
    phone: "",
    email: "",
    name: "",
  });
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const handleBookingSubmit = async () => {
    if (!tour) return;

    const bronData = {
      phone: bron.phone,
      email: bron.email,
      name: bron.name,
      travelTourId: tour.id,
    };

    try {
      const res = await ApiCall("/api/v1/bron", "POST", bronData);
      console.log(res.data);

      if (res && !res.error) {
        alert("Booking created successfully");
        setShowBookingModal(false);
        setBron({ phone: "", email: "", name: "" });
      }
    } catch (err) {
      console.error(err);
      alert("Booking error");
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
      turk: "turk",
    };
    return langMap[lang] || "uz";
  };

  // Get title based on language
  const getTitle = (tour) => {
    if (!tour) return "";
    const lang = getCurrentLang();
    return tour[`title_${lang}`] || tour.title_uz || "Sayohat";
  };

  useEffect(() => {
    const fetchTourDetails = async () => {
      try {
        setLoading(true);

        const response = await ApiCall(`/api/v1/travel-tours/${id}`);

        if (response && !response.error) {
          setTour(response.data);

          // 🔥 TOUR DAYS FETCH
          const daysRes = await ApiCall(`/api/v1/tour-days/by-tour/${id}`);

          if (daysRes && !daysRes.error) {
            setTourDays(daysRes.data || []);
          }
        }
      } catch (error) {
        console.error("Error fetching tour details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTourDetails();
  }, [id]);

  // Get description based on language
  const getDescription = (tour) => {
    if (!tour) return "";
    const lang = getCurrentLang();

    return tour?.[`description_${lang}`] || tour?.description_uz || "";
  };

  // Translations
  const translations = {
    loading: t("tours.loading"),
    no_tours: t("tours.no_tours"),
    from: t("tours.from"),
    to: t("tours.to"),
    participants: t("tours.participants"),
    price: t("tours.price"),
    per_person: t("tours.per_person"),
    book_now: t("tours.book_now"),
    back_to_list: t("tours.back_to_list"),
    share: t("tours.share"),
    copy_link: t("tours.copy_link"),
    copied: t("tours.copied"),
    overview: t("tours.overview"),
    itinerary: t("tours.itinerary"),
    gallery: t("tours.gallery"),
    duration: t("tours.duration"),
    days: t("tours.days"),
    nights: t("tours.nights"),
    cities: t("tours.cities"),
    contact: t("tours.contact"),
    call: t("tours.call"),
    telegram: t("tours.telegram"),
    whatsapp: t("tours.whatsapp"),
    read_more: t("tours.read_more"),
    hide: t("tours.hide"),
    share_tour: t("tours.share_tour"),
  };

  // Fetch tour details
  useEffect(() => {
    const fetchTourDetails = async () => {
      try {
        setLoading(true);
        const response = await ApiCall(`/api/v1/travel-tours/${id}`);
        console.log(response.data);
        if (response && !response.error) {
          setTour(response.data);
        } else {
          console.error("Failed to fetch tour details");
        }
      } catch (error) {
        console.error("Error fetching tour details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTourDetails();
  }, [id]);

  // Format date
  const formatDate = (date) => {
    if (!date) return "";

    const lang = i18n.language;

    const langMap = {
      uz: "uz-UZ",
      ru: "ru-RU",
      en: "en-US",
      turk: "tr-TR",
    };

    const locale = langMap[lang] || "uz-UZ";

    return new Date(date).toLocaleDateString(locale, {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Calculate duration
  const calculateDuration = (start, end) => {
    if (!start || !end) return 0;
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate - startDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Format price
  const formatPrice = (price) => {
    if (!price) return "0";

    const langMap = {
      uz: "uz-UZ",
      ru: "ru-RU",
      en: "en-US",
      turk: "tr-TR",
    };

    const locale = langMap[i18n.language] || "uz-UZ";

    return new Intl.NumberFormat(locale).format(price);
  };
  // Toggle like
  const toggleLike = () => {
    setLiked(!liked);
  };

  // Image modal functions
  const openModal = (index) => {
    setCurrentImageIndex(index);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const nextImage = () => {
    if (tour?.images) {
      setCurrentImageIndex((prev) => (prev + 1) % tour.images.length);
    }
  };

  const prevImage = () => {
    if (tour?.images) {
      setCurrentImageIndex(
        (prev) => (prev - 1 + tour.images.length) % tour.images.length,
      );
    }
  };

  // Share functions
  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const shareToTelegram = () => {
    const title = getTitle(tour);
    const text = `${title}\n${window.location.href}`;
    const url = `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(title)}`;
    window.open(url, "_blank");
  };

  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
    window.open(url, "_blank");
  };

  const shareToWhatsApp = () => {
    const title = getTitle(tour);
    const text = `${title}\n${window.location.href}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const getCities = (tour) => {
    if (!tour) return [];

    const lang = getCurrentLang();
    return tour?.[`cities_${lang}`] || tour?.cities_uz || [];
  };

  // Handle book now
  const handleBookNow = () => {
    setShowBookingModal(true);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          {/* Animated loader */}
          <div className="relative w-32 h-32 mx-auto mb-8">
            <div className="absolute inset-0 border-4 border-emerald-200 rounded-full animate-ping"></div>
            <div className="absolute inset-2 border-4 border-emerald-400 rounded-full animate-spin border-t-transparent"></div>
            <div className="absolute inset-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full animate-pulse"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Navigation className="w-8 h-8 text-white animate-bounce" />
            </div>
          </div>

          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            {translations.loading}
          </h3>
          <p className="text-gray-500">Bir zumda...</p>
        </div>
      </div>
    );
  }

  // Not found state
  if (!tour) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="relative w-40 h-40 mx-auto mb-8">
            <div className="absolute inset-0 bg-emerald-100 rounded-full animate-pulse"></div>
            <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center">
              <HelpCircle className="w-16 h-16 text-emerald-500" />
            </div>
          </div>

          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            {translations.no_tours}
          </h2>

          <p className="text-gray-600 mb-8">
            Kechirasiz, siz izlagan sayohat topilmadi. Boshqa sayohatlarni
            ko'ring.
          </p>

          <button
            onClick={() => navigate("/tours")}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-8 py-4 rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg hover:shadow-xl"
          >
            <ChevronLeft className="w-5 h-5" />
            {translations.back_to_list}
          </button>
        </div>
      </div>
    );
  }

  const duration = calculateDuration(tour.startDate, tour.endDate);
  const title = getTitle(tour);
  const mainImage = tour.images?.[0]
    ? `${baseUrl}/api/v1/file/getFile/${tour.images[0].id}`
    : "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Hero Section - Minimal and elegant */}
      <div className="relative h-[60vh] md:h-[70vh] overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <img
            src={mainImage}
            alt={title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30"></div>
        </div>

        {/* Top Navigation */}
        <div className="absolute top-8 left-0 right-0 p-6 z-20">
          <div className="container mx-auto flex justify-between items-center">
            <button
              onClick={() => navigate("/tours")}
              className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/20 transition-all border border-white/20"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>

            <div className="flex gap-3">
              <button
                onClick={toggleLike}
                className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/20 transition-all border border-white/20"
              >
                <Heart
                  className={`w-5 h-5 transition-colors ${
                    liked ? "fill-red-500 text-red-500" : "text-white"
                  }`}
                />
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/20 transition-all border border-white/20"
                >
                  <Share2 className="w-5 h-5 text-white" />
                </button>

                {/* Share Menu */}
                {showShareMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl z-30 py-2 border border-gray-100">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-700">
                        {translations.share_tour}
                      </p>
                    </div>

                    <button
                      onClick={shareToTelegram}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors"
                    >
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <MessageSquareMoreIcon className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="text-sm font-medium">
                        {translations.telegram}
                      </span>
                    </button>

                    <button
                      onClick={shareToWhatsApp}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors"
                    >
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <MessageCircle className="w-4 h-4 text-green-600" />
                      </div>
                      <span className="text-sm font-medium">
                        {translations.whatsapp}
                      </span>
                    </button>

                    <button
                      onClick={shareToFacebook}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors"
                    >
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Share2 className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="text-sm font-medium">
                        {translations.whatsapp}
                      </span>
                    </button>

                    <button
                      onClick={copyToClipboard}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors relative"
                    >
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        {copySuccess ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <CheckCircle className="w-4 h-4 text-gray-600" />
                        )}
                      </div>
                      <span className="text-sm font-medium">
                        {copySuccess
                          ? translations.copied
                          : translations.copy_link}
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tour Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 text-white z-10">
          <div className="container mx-auto">
            {/* Cities */}
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-emerald-400" />
              <div className="flex flex-wrap gap-2">
                {getCities(tour).map((city, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-600"
                  >
                    {city}
                  </span>
                ))}
              </div>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 max-w-4xl">
              {translations.title}
            </h1>

            {/* Quick Info Chips */}
            <div className="flex flex-wrap gap-3">
              <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span className="text-sm">{formatDate(tour.startDate)}</span>
              </div>

              <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span className="text-sm">
                  {duration} {translations.days}
                </span>
              </div>

              <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span className="text-sm">
                  {formatPrice(tour.price)} {tour.currency}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Clean and modern */}
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent mb-6">
          {getTitle(tour)}
        </h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Overview Card */}
            <div className="bg-white rounded-3xl shadow-sm p-8 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Info className="w-6 h-6 text-emerald-500" />
                {translations.overview}
              </h2>
              <p className="text-gray-600 leading-relaxed">
                <div className="prose prose-lg prose-indigo max-w-none text-gray-600 leading-relaxed">
                  <div
                    dangerouslySetInnerHTML={{ __html: getDescription(tour) }}
                  />
                </div>
              </p>
            </div>

            {/* Itinerary Card */}
            <div className="bg-white rounded-3xl shadow-sm p-8 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <MapPin className="w-6 h-6 text-emerald-500" />
                {translations.itinerary}
              </h2>

              {/* Timeline */}
              {tourDays.map((day, index) => {
                const lang = getCurrentLang();

                return (
                  <div
                    key={day.id}
                    className={`relative pl-8 pb-4 border-l-2 ${
                      activeDay === index
                        ? "border-emerald-500"
                        : "border-gray-200"
                    } last:pb-0`}
                    onClick={() => setActiveDay(index)}
                  >
                    <div
                      className={`absolute left-[-9px] top-0 w-4 h-4 rounded-full ${
                        activeDay === index
                          ? "bg-emerald-500 ring-4 ring-emerald-100"
                          : "bg-gray-300"
                      }`}
                    ></div>

                    <div className="mb-1 flex items-center gap-2">
                      <span className="text-sm font-medium text-emerald-600">
                        {index + 1}-{t("tours.days")}
                      </span>
                    </div>

                    <h3 className="font-semibold text-gray-800 mb-1">
                      {day[`title_${lang}`] || day.title_uz}
                    </h3>

                    <div
                      className="text-sm text-gray-600"
                      dangerouslySetInnerHTML={{
                        __html:
                          day[`description_${lang}`] ||
                          day.description_uz ||
                          "",
                      }}
                    />
                  </div>
                );
              })}
            </div>

            {/* Gallery Card */}
            {tour.images && tour.images.length > 0 && (
              <div className="bg-white rounded-3xl shadow-sm p-8 border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <Camera className="w-6 h-6 text-emerald-500" />
                  {translations.gallery}
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {tour.images.map((image, index) => (
                    <div
                      key={image.id}
                      onClick={() => openModal(index)}
                      className="relative aspect-square rounded-2xl overflow-hidden cursor-pointer group"
                    >
                      <img
                        src={`${baseUrl}/api/v1/file/getFile/${image.id}`}
                        alt={`${title} ${index + 1}`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => {
                          e.target.src =
                            "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800";
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-xl p-6 sticky top-24 border border-gray-100">
              {/* Price */}
              <div className="text-center mb-6">
                <span className="text-4xl font-bold text-emerald-600">
                  {formatPrice(tour.price)}
                </span>
                <span className="text-gray-500 ml-2">{tour.currency}</span>
                {/* <p className="text-sm text-gray-500 mt-1">
                  / {translations.per_person}
                </p> */}
              </div>

              {/* Quick Info */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm text-gray-600">
                      {translations.from}
                    </span>
                  </div>
                  <span className="text-sm font-medium">
                    {formatDate(tour.startDate)}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm text-gray-600">
                      {translations.to}
                    </span>
                  </div>
                  <span className="text-sm font-medium">
                    {formatDate(tour.endDate)}
                  </span>
                </div>

                {/* <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm text-gray-600">
                      {translations.participants}
                    </span>
                  </div>
                  <span className="text-sm font-medium">1-20 kishi</span>
                </div> */}

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm text-gray-600">
                      {translations.duration}
                    </span>
                  </div>
                  <span className="text-sm font-medium">
                    {duration} {translations.days}
                  </span>
                </div>
              </div>

              {/* Book Button */}
              {/* <button
                onClick={handleBookNow}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-4 rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg hover:shadow-xl mb-4 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                {translations.book_now}
              </button> */}

              {/* Contact Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <a
                  href="tel:+998992724994"
                  className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl transition-all"
                >
                  <Phone className="w-4 h-4" />
                  <span className="text-sm">{translations.call}</span>
                </a>

                <a
                  href="https://t.me/+gnFA3UzwI5o4OWMy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 py-3 rounded-xl transition-all"
                >
                  <MessageSquareMoreIcon className="w-4 h-4" />

                  <span className="text-sm">{translations.telegram}</span>
                </a>
              </div>

              {/* Cities */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm font-medium text-gray-700">
                    {translations.cities}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <div className="flex flex-wrap gap-2">
                    {getCities(tour).map((city, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-600"
                      >
                        {city}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showBookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden">
            {/* Header */}
            <div className="relative h-48">
              <img
                src={
                  tour.images?.[0]
                    ? `${baseUrl}/api/v1/file/getFile/${tour.images[0].id}`
                    : "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800"
                }
                className="w-full h-full object-cover"
                alt=""
              />
              <button
                onClick={() => setShowBookingModal(false)}
                className="absolute top-3 right-3 bg-white p-2 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <h3 className="text-xl font-bold mb-4">{getTitle(tour)}</h3>

              <div className="space-y-4">
                <input
                  type="text"
                  placeholder={t("tours.enter_name")}
                  value={bron.name}
                  onChange={(e) => setBron({ ...bron, name: e.target.value })}
                  className="w-full border p-3 rounded-lg"
                />

                <input
                  type="email"
                  placeholder={t("tours.enter_email")}
                  value={bron.email}
                  onChange={(e) => setBron({ ...bron, email: e.target.value })}
                  className="w-full border p-3 rounded-lg"
                />

                <input
                  type="text"
                  placeholder={t("tours.enter_phone")}
                  value={bron.phone}
                  onChange={(e) => setBron({ ...bron, phone: e.target.value })}
                  className="w-full border p-3 rounded-lg"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="flex-1 border py-3 rounded-lg"
                >
                  {t("tours.cancel")}
                </button>

                <button
                  onClick={handleBookingSubmit}
                  className="flex-1 bg-emerald-500 text-white py-3 rounded-lg"
                >
                  {t("tours.confirm_booking")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {isModalOpen && tour?.images && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
          {/* Close button */}
          <button
            onClick={closeModal}
            className="absolute top-6 right-6 text-white/70 hover:text-white z-20 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Navigation */}
          <button
            onClick={prevImage}
            className="absolute left-6 top-1/2 -translate-y-1/2 text-white/70 hover:text-white z-20 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={nextImage}
            className="absolute right-6 top-1/2 -translate-y-1/2 text-white/70 hover:text-white z-20 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Image */}
          <img
            src={`${baseUrl}/api/v1/file/getFile/${tour.images[currentImageIndex]?.id}`}
            alt={`${title} ${currentImageIndex + 1}`}
            className="max-w-full max-h-[90vh] object-contain px-4"
            onError={(e) => {
              e.target.src =
                "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800";
            }}
          />

          {/* Counter */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm">
            {currentImageIndex + 1} / {tour.images.length}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default Details;
