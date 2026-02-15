import React, { useEffect, useState } from "react";
import ApiCall, { baseUrl } from "../../config";
import Footer from "../../components/Footer";
import { Calendar, ChevronRight, Clock, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Index() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedNews, setExpandedNews] = useState(null);
  const navigate = useNavigate();
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 0,
  );

  useEffect(() => {
    fetchNews();

    // Window size tracker
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchNews = async () => {
    try {
      const res = await ApiCall("/api/v1/news", "GET");
      // Sort by date (newest first)
      const sortedData = (res.data || []).sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      );
      setNews(sortedData);
    } catch (error) {
      console.error("News error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Get title based on language
  const getTitle = (item) => {
    return item.title_uz || item.title_ru || item.title_en || "Yangilik";
  };

  // Get description based on language
  const getDescription = (item, full = false) => {
    const desc =
      item.description_uz || item.description_ru || item.description_en || "";
    if (full) return desc;

    // Truncate description for preview
    const words = desc.split(" ");
    if (words.length > 30) {
      return words.slice(0, 30).join(" ") + "...";
    }
    return desc;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("uz-UZ", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Get grid columns based on screen size
  const getGridCols = () => {
    if (windowWidth < 640) return 1; // mobile
    if (windowWidth < 1024) return 2; // tablet
    return 3; // desktop
  };

  const toggleExpand = (id) => {
    setExpandedNews(expandedNews === id ? null : id);
  };

  if (loading) {
    return (
      <>
        <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
          <div className="text-center">
            <div className="relative w-16 h-16 mx-auto mb-4">
              <div className="absolute inset-0 border-4 border-emerald-200 rounded-full animate-ping"></div>
              <div className="absolute inset-2 border-4 border-emerald-500 rounded-full animate-spin border-t-transparent"></div>
            </div>
            <p className="text-gray-500 text-lg">Yuklanmoqda...</p>
          </div>
        </section>
        <Footer />
      </>
    );
  }

  return (
    <>
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8 ">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-2 sm:mb-3">
              Yangiliklar
            </h2>

            <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
              Eng so'nggi yangiliklar va e'lonlar bilan tanishing
            </p>
          </div>

          {news.length === 0 ? (
            <div className="text-center py-16 sm:py-20">
              <div className="text-gray-300 mb-4">
                <svg
                  className="w-16 h-16 sm:w-20 sm:h-20 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                  />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-2">
                Hozircha yangiliklar mavjud emas
              </h3>
              <p className="text-sm sm:text-base text-gray-500">
                Tez orada yangiliklar qo'shiladi
              </p>
            </div>
          ) : (
            <div
              className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 lg:gap-8`}
            >
              {news.map((item, index) => {
                const isExpanded = expandedNews === item.id;
                const title = getTitle(item);
                const previewDesc = getDescription(item, false);
                const fullDesc = getDescription(item, true);

                return (
                  <div
                    key={item.id}
                    className="group bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-emerald-200 flex flex-col"
                    style={{
                      animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`,
                    }}
                  >
                    {/* Image */}
                    {item.mainPhoto?.id && (
                      <div className="relative overflow-hidden aspect-[16/9]">
                        <img
                          src={`${baseUrl}/api/v1/file/getFile/${item.mainPhoto.id}`}
                          alt={title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          onError={(e) => {
                            e.target.src =
                              "https://via.placeholder.com/600x400?text=Image+not+found";
                          }}
                        />

                        {/* Date badge */}
                        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 sm:px-3 py-1 rounded-full text-xs font-medium text-gray-700 flex items-center gap-1 shadow-sm">
                          <Calendar className="w-3 h-3 text-emerald-500" />
                          {formatDate(item.createdAt)}
                        </div>
                      </div>
                    )}

                    {/* Content */}
                    <div className="p-4 sm:p-5 md:p-6 flex-1 flex flex-col">
                      <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                        {title}
                      </h3>

                      <div
                        className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-3 sm:mb-4 line-clamp-3"
                        dangerouslySetInnerHTML={{
                          __html: isExpanded ? fullDesc : previewDesc,
                        }}
                      />

                      {/* Read more button */}
                      <button
                        onClick={() => navigate("/news/" + item.id)}
                        className="mt-auto inline-flex items-center gap-1 text-xs sm:text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors group/btn"
                      >
                        {isExpanded ? "Yopish" : "Batafsil"}
                        <ChevronRight
                          className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform duration-300 ${
                            isExpanded
                              ? "rotate-90"
                              : "group-hover/btn:translate-x-1"
                          }`}
                        />
                      </button>
                    </div>

                    {/* Photos preview */}
                    {item.photos?.length > 0 && !isExpanded && (
                      <div className="px-4 sm:px-5 md:px-6 pb-4 sm:pb-5 md:pb-6">
                        <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-hide">
                          {item.photos.slice(0, 3).map((photo) => (
                            <div
                              key={photo.id}
                              className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden border border-gray-200 hover:border-emerald-400 transition-colors cursor-pointer"
                              onClick={() =>
                                window.open(
                                  `${baseUrl}/api/v1/file/getFile/${photo.id}`,
                                  "_blank",
                                )
                              }
                            >
                              <img
                                src={`${baseUrl}/api/v1/file/getFile/${photo.id}`}
                                alt=""
                                className="w-full h-full object-cover hover:scale-110 transition-transform"
                              />
                            </div>
                          ))}
                          {item.photos.length > 3 && (
                            <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-600 font-medium border border-gray-200">
                              +{item.photos.length - 3}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <Footer />

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

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
      `}</style>
    </>
  );
}

export default Index;
