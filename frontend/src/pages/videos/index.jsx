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
              {videos.map((video) => {
                const src = extractSrc(video.iframe);
                const videoId = extractVideoId(src);

                return (
                  <div
                    key={video.id}
                    className="relative group cursor-pointer overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 aspect-video bg-black"
                    onClick={() => setSelectedVideo(src)}
                  >
                    {videoId ? (
                      <img
                        src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
                        alt="Video thumbnail"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          e.target.src = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-400">
                        {t("videoPage.notAvailable")}
                      </div>
                    )}

                    {/* Play overlay */}
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40 transition-colors">
                      <div className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-xl">
                        <Play className="w-6 h-6 text-white fill-white ml-1" />
                      </div>
                    </div>

                    <div className="absolute bottom-3 right-3 bg-black/80 text-white text-xs px-2 py-1 rounded">
                      YouTube
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
