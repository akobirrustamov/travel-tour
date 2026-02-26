import React, { useEffect, useState } from "react";
import ApiCall, { baseUrl } from "../config";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Maximize2, Heart } from "lucide-react";

function Gallery() {
  const { t } = useTranslation();
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);
  const [likedImages, setLikedImages] = useState({});
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [videoIndex, setVideoIndex] = useState(0);

  // Responsive uchun items soni
  const getItemsPerView = () => {
    if (typeof window !== "undefined") {
      if (window.innerWidth < 640) return 1; // mobile
      if (window.innerWidth < 1024) return 2; // tablet
      return 3; // desktop
    }
    return 3;
  };

  const [itemsPerView, setItemsPerView] = useState(getItemsPerView());

  useEffect(() => {
    const handleResize = () => {
      setItemsPerView(getItemsPerView());
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const res = await ApiCall("/api/v1/youtube", "GET");

      const data = res?.data;

      if (Array.isArray(data)) {
        setVideos(data);
      } else if (Array.isArray(data?.content)) {
        setVideos(data.content);
      } else if (Array.isArray(data?.data)) {
        setVideos(data.data);
      } else {
        setVideos([]);
      }
    } catch (error) {
      console.error("Youtube error:", error);
      setVideos([]);
    }
  };

  useEffect(() => {
    let interval;
    if (videos.length > 0) {
      interval = setInterval(() => {
        if (videoIndex < videos.length - itemsPerView) {
          setVideoIndex(videoIndex + 1);
        } else {
          setVideoIndex(0);
        }
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [videoIndex, videos, itemsPerView]);

  const extractSrc = (iframeString) => {
    if (!iframeString) return null;
    const match = iframeString.match(/src="([^"]+)"/);
    return match ? match[1] : null;
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  useEffect(() => {
    let interval;
    if (isAutoPlay && gallery.length > 0) {
      interval = setInterval(() => {
        nextSlide();
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [gallery, currentIndex, isAutoPlay, itemsPerView]);

  const fetchGallery = async () => {
    try {
      const res = await ApiCall("/api/v1/gallery", "GET");
      setGallery(res.data || []);
    } catch (error) {
      console.error("Gallery error:", error);
    } finally {
      setLoading(false);
    }
  };

  const visibleImages = Array.isArray(gallery) ? gallery.slice(-10) : [];
  const nextSlide = () => {
    if (currentIndex < visibleImages.length - itemsPerView) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      setCurrentIndex(visibleImages.length - itemsPerView);
    }
  };

  const toggleLike = (imageId) => {
    setLikedImages((prev) => ({
      ...prev,
      [imageId]: !prev[imageId],
    }));
  };

  return (
    <section className="py-6 sm:py-10 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden ">
      {/* Murakkab Okean To'lqinlari Animatsiyasi */}
      <div className="absolute inset-0 overflow-hidden">
        {/* 1-qatlam: Chuqur okean to'lqinlari */}
        <div className="absolute inset-0">
          <div
            className="absolute w-[300%] h-[300%] -left-[100%] -top-[100%]"
            style={{
              background:
                "radial-gradient(circle at 20% 30%, rgba(16, 185, 129, 0.12) 0%, transparent 35%), radial-gradient(circle at 80% 70%, rgba(16, 185, 129, 0.08) 0%, transparent 35%)",
              animation: "deepOceanWave 25s ease-in-out infinite",
            }}
          />
        </div>

        {/* 2-qatlam: O'rta to'lqinlar */}
        <div className="absolute inset-0">
          <div
            className="absolute w-[250%] h-[250%] -left-[75%] -top-[75%]"
            style={{
              background:
                "radial-gradient(circle at 40% 50%, rgba(52, 211, 153, 0.1) 0%, transparent 40%), radial-gradient(circle at 60% 30%, rgba(52, 211, 153, 0.1) 0%, transparent 40%)",
              animation: "midOceanWave 18s ease-in-out infinite reverse",
            }}
          />
        </div>

        {/* 3-qatlam: Yuza to'lqinlar */}
        <div className="absolute inset-0">
          <div
            className="absolute w-[200%] h-[200%] -left-[50%] -top-[50%]"
            style={{
              background:
                "radial-gradient(circle at 30% 70%, rgba(110, 231, 183, 0.15) 0%, transparent 30%), radial-gradient(circle at 70% 40%, rgba(110, 231, 183, 0.15) 0%, transparent 30%)",
              animation: "surfaceWave 12s ease-in-out infinite",
            }}
          />
        </div>

        {/* 4-qatlam: Mayda to'lqinlar */}
        <div className="absolute inset-0">
          <div
            className="absolute w-[150%] h-[150%] -left-[25%] -top-[25%]"
            style={{
              background:
                "radial-gradient(circle at 50% 50%, rgba(167, 243, 208, 0.1) 0%, transparent 50%)",
              animation: "rippleWave 8s ease-in-out infinite",
            }}
          />
        </div>

        {/* Harakatlanuvchi to'lqin chiziqlari */}
        <div className="absolute inset-0">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute h-[1px] sm:h-[2px] bg-gradient-to-r from-transparent via-emerald-300/30 to-transparent"
              style={{
                top: `${20 + i * 15}%`,
                left: "-10%",
                width: "120%",
                animation: `waveLine${i + 1} ${10 + i * 2}s ease-in-out infinite`,
                filter: "blur(1px)",
              }}
            />
          ))}
        </div>

        {/* Aylanma to'lqinlar */}
        <div className="absolute inset-0">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="absolute border border-emerald-200/20 rounded-full"
              style={{
                width: `${200 + i * 100}px`,
                height: `${100 + i * 50}px`,
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                animation: `rotateWave ${20 + i * 5}s linear infinite`,
                borderColor: `rgba(16, 185, 129, ${0.1 - i * 0.02})`,
              }}
            />
          ))}
        </div>

        {/* Effektli nuqtalar (dengiz ko'piklari) */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={`bubble-${i}`}
              className="absolute bg-white/20 rounded-full blur-[2px] sm:blur-[3px]"
              style={{
                width: `${2 + Math.random() * 4}px`,
                height: `${2 + Math.random() * 4}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `bubbleFloat ${10 + Math.random() * 15}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 5}s`,
                opacity: 0.2 + Math.random() * 0.3,
              }}
            />
          ))}
        </div>

        {/* Yorug'lik akslari */}
        <div className="absolute inset-0">
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(125deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%)",
              animation: "lightGlide 8s ease-in-out infinite",
              backgroundSize: "200% 200%",
            }}
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Title with animation */}
        <div className="text-center mb-6 sm:mb-8 md:mb-12 relative">
          <div className="absolute inset-0 flex justify-center">
            <div className="w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-emerald-200/20 rounded-full blur-2xl sm:blur-3xl animate-pulse"></div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 relative">
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                {t("gallery.title")}
              </span>
            </h2>

            {/* Button */}
            <div className="text-center sm:text-right w-full sm:w-auto">
              <button
                onClick={() => navigate("/gallery")}
                className="group relative bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 sm:px-6 md:px-10 py-2 sm:py-3 md:py-4 rounded-lg sm:rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden text-sm sm:text-base"
              >
                <span className="relative z-10 flex items-center gap-1 sm:gap-2">
                  <span className="whitespace-nowrap">{t("gallery.more")}</span>
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-10 sm:py-16 md:py-20">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mb-4 sm:mb-5 md:mb-6">
              <div className="absolute inset-0 border-4 border-emerald-200 rounded-full animate-ping"></div>
              <div className="absolute inset-2 border-4 border-emerald-400 rounded-full animate-spin border-t-transparent"></div>
              <div className="absolute inset-4 bg-emerald-500 rounded-full animate-pulse"></div>
            </div>
            <p className="text-gray-500 text-base sm:text-lg animate-pulse">
              {t("gallery.loading")}
            </p>
          </div>
        ) : (
          <>
            {/* Navigation buttons */}
            <div className="relative">
              {/* SLIDER */}
              <div className="relative overflow-hidden rounded-xl sm:rounded-2xl md:rounded-3xl">
                <div
                  className="flex transition-transform duration-700 ease-out"
                  style={{
                    transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
                  }}
                >
                  {visibleImages.map((image, index) => (
                    <div
                      key={image.id}
                      className="flex-shrink-0 px-2 sm:px-3 group"
                      style={{ width: `${100 / itemsPerView}%` }}
                    >
                      <div className="relative overflow-hidden rounded-lg sm:rounded-xl md:rounded-2xl shadow-md hover:shadow-xl transition-all duration-500 transform">
                        <img
                          src={`${baseUrl}/api/v1/file/getFile/${image?.media.id}`}
                          alt="gallery"
                          className="w-full h-48 sm:h-56 md:h-64 lg:h-72 object-cover transition-all duration-700 group-hover:scale-110"
                          onError={(e) => {
                            e.target.src =
                              "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800";
                          }}
                        />

                        {/* Like button */}
                        <button
                          onClick={() => toggleLike(image.id)}
                          className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10 bg-white/80 hover:bg-white rounded-full p-1.5 sm:p-2 shadow-md transition-all backdrop-blur-sm"
                        >
                          <Heart
                            className={`w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 transition-colors ${
                              likedImages[image.id]
                                ? "fill-red-500 text-red-500"
                                : "text-gray-600"
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ================= VIDEO LAVHALAR ================= */}

            <div className="mt-8 sm:mt-10 md:mt-12">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 mb-6 sm:mb-8 md:mb-10">
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
                  {t("gallery.videoTitle")}
                </h2>
                <div className="text-center sm:text-right w-full sm:w-auto">
                  <button
                    onClick={() => navigate("/youtube")}
                    className="group relative bg-gradient-to-r from-red-500 to-rose-500 text-white px-4 sm:px-6 md:px-8 py-2 sm:py-3 rounded-lg sm:rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden text-sm sm:text-base"
                  >
                    <span className="relative z-10 flex items-center gap-1 sm:gap-2">
                      <span className="whitespace-nowrap">
                        {t("gallery.moreVideos")}
                      </span>
                      <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-rose-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </button>
                </div>
              </div>

              {/* Video Navigation */}
              <div className="relative">
                <div className="relative overflow-hidden rounded-xl sm:rounded-2xl md:rounded-3xl">
                  <div
                    className="flex transition-transform duration-700 ease-out"
                    style={{
                      transform: `translateX(-${videoIndex * (100 / itemsPerView)}%)`,
                    }}
                  >
                    {Array.isArray(videos) &&
                      videos.map((video) => {
                        let src = null;

                        if (!video?.iframe) return null;

                        const iframeString = video.iframe;

                        // 1️⃣ Agar to‘liq iframe bo‘lsa
                        const match = iframeString.match(/src="([^"]+)"/);
                        if (match) {
                          src = match[1];
                        }

                        // 2️⃣ Instagram reel oddiy link bo‘lsa
                        else if (iframeString.includes("instagram.com")) {
                          const reelMatch = iframeString.match(
                            /instagram\.com\/(reel|p)\/([^/?]+)/,
                          );
                          if (reelMatch) {
                            src = `https://www.instagram.com/${reelMatch[1]}/${reelMatch[2]}/embed`;
                          }
                        }

                        // 3️⃣ YouTube watch link bo‘lsa
                        else if (iframeString.includes("youtube.com/watch")) {
                          const ytMatch = iframeString.match(/v=([^&]+)/);
                          if (ytMatch) {
                            src = `https://www.youtube.com/embed/${ytMatch[1]}`;
                          }
                        }

                        // 4️⃣ youtu.be bo‘lsa
                        else if (iframeString.includes("youtu.be")) {
                          const shortMatch =
                            iframeString.match(/youtu\.be\/([^?]+)/);
                          if (shortMatch) {
                            src = `https://www.youtube.com/embed/${shortMatch[1]}`;
                          }
                        }

                        if (!src) return null;

                        return (
                          <div
                            key={video.id}
                            className="flex-shrink-0 px-2 sm:px-3"
                            style={{ width: `${100 / itemsPerView}%` }}
                          >
                            <div className="rounded-lg sm:rounded-xl md:rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-500 bg-black">
                              <div className="relative w-full pt-[56.25%] h-screen">
                                <iframe
                                  src={src}
                                  title="Video"
                                  className="absolute top-0 left-0 w-full h-full"
                                  frameBorder="0"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes deepOceanWave {
          0% {
            transform: translate(0, 0) rotate(0deg) scale(1);
          }
          25% {
            transform: translate(-3%, -4%) rotate(1deg) scale(1.02);
          }
          50% {
            transform: translate(3%, -6%) rotate(-1deg) scale(0.98);
          }
          75% {
            transform: translate(4%, -3%) rotate(1deg) scale(1.01);
          }
          100% {
            transform: translate(0, 0) rotate(0deg) scale(1);
          }
        }

        @keyframes midOceanWave {
          0% {
            transform: translate(0, 0) rotate(0deg);
          }
          33% {
            transform: translate(-4%, -2%) rotate(2deg);
          }
          66% {
            transform: translate(2%, -5%) rotate(-2deg);
          }
          100% {
            transform: translate(0, 0) rotate(0deg);
          }
        }

        @keyframes surfaceWave {
          0%,
          100% {
            transform: translate(0, 0) rotate(0deg);
          }
          25% {
            transform: translate(-2%, 3%) rotate(3deg);
          }
          50% {
            transform: translate(5%, -2%) rotate(-3deg);
          }
          75% {
            transform: translate(-3%, -4%) rotate(2deg);
          }
        }

        @keyframes rippleWave {
          0% {
            transform: scale(1) rotate(0deg);
            opacity: 0.1;
          }
          50% {
            transform: scale(1.5) rotate(180deg);
            opacity: 0.3;
          }
          100% {
            transform: scale(1) rotate(360deg);
            opacity: 0.1;
          }
        }

        @keyframes waveLine1 {
          0%,
          100% {
            transform: translateX(-20%) skewX(-10deg);
            opacity: 0.2;
          }
          50% {
            transform: translateX(20%) skewX(10deg);
            opacity: 0.5;
          }
        }

        @keyframes waveLine2 {
          0%,
          100% {
            transform: translateX(20%) skewX(5deg);
            opacity: 0.15;
          }
          50% {
            transform: translateX(-20%) skewX(-5deg);
            opacity: 0.4;
          }
        }

        @keyframes waveLine3 {
          0%,
          100% {
            transform: translateX(-10%) skewY(5deg);
            opacity: 0.1;
          }
          50% {
            transform: translateX(10%) skewY(-5deg);
            opacity: 0.3;
          }
        }

        @keyframes waveLine4 {
          0%,
          100% {
            transform: translateX(15%) skewX(-15deg);
            opacity: 0.2;
          }
          50% {
            transform: translateX(-15%) skewX(15deg);
            opacity: 0.4;
          }
        }

        @keyframes waveLine5 {
          0%,
          100% {
            transform: translateX(-5%) skewY(10deg);
            opacity: 0.15;
          }
          50% {
            transform: translateX(5%) skewY(-10deg);
            opacity: 0.35;
          }
        }

        @keyframes rotateWave {
          from {
            transform: translate(-50%, -50%) rotate(0deg);
          }
          to {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }

        @keyframes bubbleFloat {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 0.2;
          }
          25% {
            transform: translate(20px, -30px) scale(1.5);
            opacity: 0.4;
          }
          50% {
            transform: translate(-15px, -50px) scale(0.8);
            opacity: 0.3;
          }
          75% {
            transform: translate(-25px, -20px) scale(1.2);
            opacity: 0.5;
          }
          100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.2;
          }
        }

        @keyframes lightGlide {
          0% {
            background-position: 0% 0%;
          }
          50% {
            background-position: 100% 100%;
          }
          100% {
            background-position: 0% 0%;
          }
        }
      `}</style>
    </section>
  );
}

export default Gallery;
