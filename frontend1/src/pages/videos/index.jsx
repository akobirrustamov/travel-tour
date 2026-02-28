import React, { useEffect, useState } from "react";
import ApiCall from "../../config/index";
import { X, Play } from "lucide-react";
import Footer from "../../components/Footer";
import { useTranslation } from "react-i18next";

function Index() {
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();
  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const res = await ApiCall("/api/v1/youtube", "GET");
      setVideos(res.data || []);
    } catch (error) {
      console.error("Video error:", error);
    } finally {
      setLoading(false);
    }
  };

  const extractSrc = (iframeString) => {
    if (!iframeString) return null;
    const match = iframeString.match(/src="([^"]+)"/);
    return match ? match[1] : null;
  };

  const extractVideoId = (src) => {
    if (!src) return null;
    const match = src.match(/embed\/([^?&]+)/);
    return match ? match[1] : null;
  };

  const closeModal = () => {
    setSelectedVideo(null);
  };

  return (
    <>
      <section className="py-20 bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          {/* HEADER */}
          <div className="text-center mb-10">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent mb-4">
              {t("videoPage.title")}
            </h2>
            <p className="text-gray-600 text-lg">{t("videoPage.subtitle")}</p>
          </div>

          {loading ? (
            <div className="text-center py-20 text-gray-500">
              {t("videoPage.loading")}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.isArray(videos) &&
                videos.map((video) => {
                  let src = null;

                  if (!video?.iframe) return null;

                  const iframeString = video.iframe.trim();

                  // 1️⃣ Agar to‘liq iframe bo‘lsa
                  const match = iframeString.match(/src="([^"]+)"/);
                  if (match) {
                    src = match[1];
                  }

                  // 2️⃣ Instagram reel yoki post link
                  else if (iframeString.includes("instagram.com")) {
                    const reelMatch = iframeString.match(
                      /instagram\.com\/(reel|p)\/([^/?]+)/,
                    );
                    if (reelMatch) {
                      src = `https://www.instagram.com/${reelMatch[1]}/${reelMatch[2]}/embed`;
                    }
                  }

                  // 3️⃣ YouTube watch link
                  else if (iframeString.includes("youtube.com/watch")) {
                    const ytMatch = iframeString.match(/v=([^&]+)/);
                    if (ytMatch) {
                      src = `https://www.youtube.com/embed/${ytMatch[1]}`;
                    }
                  }

                  // 4️⃣ youtu.be short link
                  else if (iframeString.includes("youtu.be")) {
                    const shortMatch = iframeString.match(/youtu\.be\/([^?]+)/);
                    if (shortMatch) {
                      src = `https://www.youtube.com/embed/${shortMatch[1]}`;
                    }
                  }

                  if (!src) return null;

                  const isInstagram = src.includes("instagram.com");
                  const aspectRatioClass = isInstagram
                    ? "pt-[177.78%]" // 9:16
                    : "pt-[56.25%]"; // 16:9

                  return (
                    <div
                      key={video.id}
                      className="rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 bg-black"
                    >
                      <div className={`relative w-full ${aspectRatioClass}`}>
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
                  );
                })}
            </div>
          )}
        </div>
      </section>

      <Footer />

      {/* MODAL */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4">
          <button
            onClick={closeModal}
            className="absolute top-6 right-6 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition"
          >
            <X size={24} />
          </button>
          <div className="relative w-full max-w-5xl aspect-video">
            <iframe
              src={`${selectedVideo}?autoplay=1`}
              title="YouTube video player"
              className="absolute top-0 left-0 w-full h-full rounded-xl shadow-2xl"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </>
  );
}

export default Index;
