import React, { useEffect, useState } from "react";
import ApiCall, { baseUrl } from "../../config/index";
import { Eye, X } from "lucide-react";
import Footer from "../../components/Footer";
import { useTranslation } from "react-i18next";

function Index() {
  const [gallery, setGallery] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  // Swipe states
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // Animation direction
  const [direction, setDirection] = useState(0); // 1 = next, -1 = prev

  const minSwipeDistance = 50;

  useEffect(() => {
    fetchGallery();
  }, []);

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

  // =========================
  // Swipe handlers
  // =========================

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;

    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) nextImage();
    if (isRightSwipe) prevImage();
  };

  // =========================
  // Navigation functions
  // =========================

  const nextImage = () => {
    setDirection(1);
    setSelectedIndex((prev) => (prev === gallery.length - 1 ? 0 : prev + 1));
  };

  const prevImage = () => {
    setDirection(-1);
    setSelectedIndex((prev) => (prev === 0 ? gallery.length - 1 : prev - 1));
  };

  const closeModal = () => {
    setSelectedIndex(null);
  };

  return (
    <>
      <section className="py-24 bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-4">
            <h2 className="text-5xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent mb-4">
              {t("galleryPage.title")}
            </h2>
            <p className="text-gray-600 text-lg">{t("galleryPage.subtitle")}</p>
          </div>

          {loading ? (
            <div className="text-center py-20 text-gray-500">
              {t("galleryPage.loading")}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {gallery.map((image, index) => (
                <div
                  key={image.id}
                  className="relative group cursor-pointer overflow-hidden rounded-2xl shadow-lg"
                  onClick={() => {
                    setDirection(0);
                    setSelectedIndex(index);
                  }}
                >
                  <img
                    src={`${baseUrl}/api/v1/file/getFile/${image?.media?.id}`}
                    alt="gallery"
                    className="w-full h-72 object-cover rounded-2xl transition duration-700 group-hover:scale-110"
                  />

                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition duration-500 flex items-center justify-center">
                    <div className="bg-white/20 backdrop-blur-md p-4 rounded-full border border-white/40 shadow-lg transform scale-75 group-hover:scale-100 transition duration-300">
                      <Eye className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />

      {/* =========================
           LIGHTBOX MODAL
      ========================== */}
      {selectedIndex !== null && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 overflow-hidden"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {/* CLOSE */}
          <button
            onClick={closeModal}
            className="absolute top-6 right-6 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full transition"
          >
            <X size={24} />
          </button>

          {/* PREV */}
          <button
            onClick={prevImage}
            className="absolute left-6 text-white text-5xl font-light hover:scale-125 transition"
          >
            ‹
          </button>

          {/* IMAGE WITH SMOOTH SLIDE */}
          <div className="relative w-full max-w-[90vw] max-h-[90vh] overflow-hidden flex items-center justify-center">
            <img
              key={selectedIndex}
              src={`${baseUrl}/api/v1/file/getFile/${gallery[selectedIndex]?.media?.id}`}
              alt="preview"
              className={`
                max-h-[90vh] max-w-[90vw] rounded-xl shadow-2xl
                transition-all duration-500 ease-in-out
                ${direction === 1 ? "animate-slide-left" : ""}
                ${direction === -1 ? "animate-slide-right" : ""}
              `}
            />
          </div>

          {/* NEXT */}
          <button
            onClick={nextImage}
            className="absolute right-6 text-white text-5xl font-light hover:scale-125 transition"
          >
            ›
          </button>
        </div>
      )}

      {/* ANIMATIONS */}
      <style>{`
        @keyframes slideLeft {
          from { transform: translateX(80px); opacity: 0.6; }
          to { transform: translateX(0); opacity: 1; }
        }

        @keyframes slideRight {
          from { transform: translateX(-80px); opacity: 0.6; }
          to { transform: translateX(0); opacity: 1; }
        }

        .animate-slide-left {
          animation: slideLeft 0.4s ease;
        }

        .animate-slide-right {
          animation: slideRight 0.4s ease;
        }
      `}</style>
    </>
  );
}

export default Index;
