import React, { useState, useEffect } from "react";
import icon from "../assets/images/logo.png";
import ApiCall, { baseUrl } from "../config";
import { useTranslation } from "react-i18next";
import bg from "../assets/images/bgNew.png";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

function News() {
  const { t, i18n } = useTranslation();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeNewsIndex, setActiveNewsIndex] = useState(0);
  const [roomImageIndexes, setRoomImageIndexes] = useState({});
  const [touchStart, setTouchStart] = useState(null);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 0,
  );
  const navigate = useNavigate();

  // Window size tracker
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Responsive parameters
  const getCardWidth = () => {
    if (windowWidth < 640) return 280; // mobile
    if (windowWidth < 768) return 320; // small tablet
    if (windowWidth < 1024) return 380; // tablet
    return 420; // desktop
  };

  const getCardHeight = () => {
    if (windowWidth < 640) return 380; // mobile
    if (windowWidth < 768) return 420; // small tablet
    if (windowWidth < 1024) return 440; // tablet
    return 460; // desktop
  };

  const getImageHeight = () => {
    if (windowWidth < 640) return 200; // mobile
    if (windowWidth < 768) return 220; // small tablet
    if (windowWidth < 1024) return 240; // tablet
    return 256; // desktop
  };

  const getBaseShift = () => {
    if (windowWidth < 640) return 140; // mobile
    if (windowWidth < 768) return 160; // small tablet
    if (windowWidth < 1024) return 220; // tablet
    return 320; // desktop
  };

  const getContainerHeight = () => {
    if (windowWidth < 640) return 420; // mobile
    if (windowWidth < 768) return 460; // small tablet
    if (windowWidth < 1024) return 500; // tablet
    return 580; // desktop
  };

  // === Fetch News ===
  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const res = await ApiCall("/api/v1/news/page?page=0&size=10");

      if (res && !res.error) {
        setNews(res.data.content || []);

        const initialIndexes = {};
        res.data.content.forEach((item) => {
          initialIndexes[item.id] = 0;
        });
        setRoomImageIndexes(initialIndexes);
      }
    } catch (error) {
      console.error("Error fetching news:", error);
    } finally {
      setLoading(false);
    }
  };

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

  const newsToRoomFormat = () => {
    return news.map((item) => {
      const lang = getCurrentLang();
      const title =
        item[`title_${lang}`] || item.title_uz || item.title_en || "News";
      const description =
        item[`description_${lang}`] ||
        item.description_uz ||
        item.description_en ||
        "";

      const mainPhotoUrl = item.mainPhoto
        ? `${baseUrl}/api/v1/file/getFile/${item.mainPhoto.id}`
        : icon;

      const photos = [mainPhotoUrl];
      if (item.photos && item.photos.length > 0) {
        item.photos.forEach((photo) => {
          photos.push(`${baseUrl}/api/v1/file/getFile/${photo.id}`);
        });
      }

      return {
        id: item.id,
        key: item.id,
        title: title,
        subtitle:
          description.substring(0, 80) + (description.length > 80 ? "..." : ""),
        mainImage: mainPhotoUrl,
        images: photos,
        createdAt: item.createdAt,
        description: description,
      };
    });
  };

  const roomTypes = newsToRoomFormat();

  useEffect(() => {
    if (roomTypes.length === 0) return;

    const interval = setInterval(() => {
      const activeId = roomTypes[activeNewsIndex]?.id;
      if (!activeId) return;

      setRoomImageIndexes((prev) => {
        const currentIndex = prev[activeId] || 0;
        const imagesCount = roomTypes[activeNewsIndex]?.images?.length || 1;
        return {
          ...prev,
          [activeId]: (currentIndex + 1) % imagesCount,
        };
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [activeNewsIndex, roomTypes]);

  // Touch handlers
  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    if (!touchStart) return;
    const touchEnd = e.changedTouches[0].clientX;
    const deltaX = touchEnd - touchStart;

    if (Math.abs(deltaX) > 50) {
      if (deltaX > 0) {
        // Swipe right - previous
        setActiveNewsIndex((prev) =>
          prev === 0 ? roomTypes.length - 1 : prev - 1,
        );
      } else {
        // Swipe left - next
        setActiveNewsIndex((prev) => (prev + 1) % roomTypes.length);
      }
    }
    setTouchStart(null);
  };

  const nextNews = () => {
    setActiveNewsIndex((prev) => (prev + 1) % roomTypes.length);
  };

  const prevNews = () => {
    setActiveNewsIndex((prev) =>
      prev === 0 ? roomTypes.length - 1 : prev - 1,
    );
  };

  if (loading) {
    return (
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-2 sm:mb-4">
            {t("home.news.title", "News & Updates")}
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 mb-8 sm:mb-12 md:mb-16">
            {t("home.news.subtitle", "Stay updated with our latest news")}
          </p>
          <div className="flex justify-center items-center h-48 sm:h-56 md:h-64">
            <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-t-4 border-b-4 border-emerald-500"></div>
          </div>
        </div>
      </section>
    );
  }

  if (roomTypes.length === 0) {
    return (
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-2 sm:mb-4">
            {t("home.news.title", "News & Updates")}
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 mb-8 sm:mb-12 md:mb-16">
            {t("home.news.subtitle", "Stay updated with our latest news")}
          </p>
          <div className="text-center py-12 sm:py-16 bg-white rounded-xl sm:rounded-2xl shadow-sm px-4">
            <svg
              className="mx-auto text-gray-400 mb-4 w-12 h-12 sm:w-16 sm:h-16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
              {t("home.news.no_news", "No news available")}
            </h3>
            <p className="text-sm sm:text-base text-gray-600">
              {t("home.news.check_back", "Please check back later for updates")}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="news"
      style={{
        backgroundImage: `url(${bg})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      className="py-12  bg-white object-cover relative"
    >
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/30"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center text-white relative z-10">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-4">
          {t("home.news.title", "News & Updates")}
        </h2>
        <p className="text-sm sm:text-base md:text-lg mb-6">
          {t("home.news.subtitle", "Stay updated with our latest news")}
        </p>

        <div
          className="relative flex justify-center items-center"
          style={{ height: getContainerHeight() }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {roomTypes.map((room, index) => {
            const total = roomTypes.length;
            let offset = (index - activeNewsIndex + total) % total;
            if (offset > total / 2) offset -= total;

            const isCenter = offset === 0;
            const baseShift = getBaseShift();
            const cardWidth = getCardWidth();
            const cardHeight = getCardHeight();
            const imageHeight = getImageHeight();

            const transformStyle = {
              transform: `translateX(${offset * baseShift}px) scale(${
                isCenter ? 1 : windowWidth < 640 ? 0.8 : 0.85
              })`,
              zIndex: isCenter ? 30 : 10 - Math.abs(offset),
              opacity: isCenter ? 1 : windowWidth < 640 ? 0 : 0.6,
              transition: "all 0.5s ease",
              width: cardWidth,
              height: cardHeight,
              left: `calc(50% - ${cardWidth / 2}px)`,
            };

            return (
              <div
                key={room.id}
                className="absolute top-0 cursor-pointer bg-white rounded-xl sm:rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden hover:shadow-3xl"
                style={transformStyle}
                onClick={() => setActiveNewsIndex(index)}
              >
                <div
                  className="relative w-full overflow-hidden"
                  style={{ height: imageHeight }}
                >
                  <img
                    key={`${room.id}-${roomImageIndexes[room.id] || 0}`}
                    src={
                      room.images[roomImageIndexes[room.id] || 0] ||
                      room.mainImage
                    }
                    alt={room.title}
                    className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
                    onError={(e) => {
                      e.target.src = icon;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

                  {/* Date badge */}
                  {room.createdAt && (
                    <div className="absolute top-2 sm:top-3 left-2 sm:left-3 bg-emerald-500 text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-medium flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(room.createdAt).toLocaleDateString()}
                    </div>
                  )}
                </div>

                <div className="p-3 sm:p-4 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 mb-1 sm:mb-2 line-clamp-2">
                      {room.title}
                    </h3>
                    <div
                      className="text-xs sm:text-sm text-gray-600 leading-relaxed line-clamp-2 sm:line-clamp-3"
                      dangerouslySetInnerHTML={{ __html: room.subtitle }}
                    />
                  </div>

                  {isCenter && (
                    <button
                      onClick={() => navigate("/news/" + room.id)}
                      className="mt-3 sm:mt-4 w-full px-4 sm:px-6 py-2 sm:py-2.5 bg-yellow-400 text-black text-sm sm:text-base font-semibold rounded-lg hover:bg-yellow-500 transition-all shadow-md hover:shadow-lg"
                    >
                      {t("home.news.read_more", "Read More")}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex justify-center">
        <button
          onClick={() => navigate("/news")}
          className="bg-yellow-500 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-yellow-600 transition-all duration-300 ease-in-out transform hover:scale-105"
        >
          {t("gallery.more")}
        </button>
      </div>
      <style>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        @media (max-width: 640px) {
          .line-clamp-2 {
            -webkit-line-clamp: 2;
          }
          .line-clamp-3 {
            -webkit-line-clamp: 2;
          }
        }
      `}</style>
    </section>
  );
}

export default News;
