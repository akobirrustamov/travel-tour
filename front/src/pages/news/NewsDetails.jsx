import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ApiCall, { baseUrl } from "../../config";
import {
  Calendar,
  ArrowLeft,
  Share2,
  Download,
  Image as ImageIcon,
  X,
} from "lucide-react";
import Footer from "../../components/Footer";

function NewsDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNewsDetails();
  }, [id]);

  const fetchNewsDetails = async () => {
    try {
      setLoading(true);
      const res = await ApiCall(`/api/v1/news/${id}`, "GET");

      if (res && !res.error) {
        setNews(res.data);
      } else {
        setError("Yangilik topilmadi");
      }
    } catch (error) {
      console.error("News details error:", error);
      setError("Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  // Get title based on language
  const getTitle = () => {
    if (!news) return "";
    return news.title_uz || news.title_ru || news.title_en || "Yangilik";
  };

  // Get description based on language
  const getDescription = () => {
    if (!news) return "";
    return (
      news.description_uz || news.description_ru || news.description_en || ""
    );
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("uz-UZ", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Handle image click
  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
  };

  // Handle share
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: getTitle(),
          text: getDescription().substring(0, 100),
          url: window.location.href,
        });
      } catch (error) {
        console.log("Sharing cancelled");
      }
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  // Handle download image
  const handleDownload = async (imageUrl, index) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `news-image-${index + 1}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
    }
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

  if (error || !news) {
    return (
      <>
        <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="text-gray-300 mb-4">
              <svg
                className="w-20 h-20 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-2">
              {error || "Yangilik topilmadi"}
            </h3>
            <button
              onClick={() => navigate("/news")}
              className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Yangiliklar sahifasiga qaytish
            </button>
          </div>
        </section>
        <Footer />
      </>
    );
  }

  const mainImage = news.mainPhoto?.id
    ? `${baseUrl}/api/v1/file/getFile/${news.mainPhoto.id}`
    : null;

  const allImages = [
    ...(mainImage ? [{ id: "main", url: mainImage, isMain: true }] : []),
    ...(news.photos?.map((photo) => ({
      id: photo.id,
      url: `${baseUrl}/api/v1/file/getFile/${photo.id}`,
      isMain: false,
    })) || []),
  ];

  return (
    <>
      <section className="py-12 md:py-16 bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back button */}
          <button
            onClick={() => navigate("/news")}
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-emerald-600 transition-colors mb-4 sm:mb-6 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Barcha yangiliklar
          </button>

          {/* Main content */}
          <article className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden">
            {/* Header with actions */}
            <div className="p-4 sm:p-6 md:p-8 border-b border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4">
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
                  {getTitle()}
                </h1>

                <button
                  onClick={handleShare}
                  className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-sm bg-gray-100 hover:bg-emerald-100 text-gray-700 hover:text-emerald-700 rounded-lg transition-colors self-start sm:self-center"
                >
                  <Share2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Ulashish</span>
                </button>
              </div>

              {/* Date */}
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                {formatDate(news.createdAt)}
              </div>
            </div>

            {/* Main image */}
            {mainImage && (
              <div className="relative group">
                <img
                  src={mainImage}
                  alt={getTitle()}
                  className="w-full h-auto max-h-[500px] object-cover cursor-pointer"
                  onClick={() => handleImageClick(mainImage)}
                />
              </div>
            )}

            {/* Description */}
            <div className="p-4 sm:p-6 md:p-8">
              <div
                className="prose prose-sm sm:prose-base max-w-none text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: getDescription() }}
              />

              {/* Additional images gallery */}
              {allImages.length > 1 && (
                <div className="mt-8 sm:mt-10 md:mt-12">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-emerald-500" />
                    Galereya ({allImages.length})
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                    {allImages.map((image, index) => (
                      <div
                        key={image.id}
                        className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100 cursor-pointer"
                        onClick={() => handleImageClick(image.url)}
                      >
                        <img
                          src={image.url}
                          alt={`Gallery ${index + 1}`}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />

                        {/* Overlay with download button */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownload(image.url, index);
                            }}
                            className="bg-white/90 hover:bg-white p-2 rounded-full transition-transform hover:scale-110"
                          >
                            <Download className="w-4 h-4 text-gray-700" />
                          </button>
                        </div>

                        {/* Main badge */}
                        {image.isMain && (
                          <div className="absolute top-2 left-2 bg-emerald-500 text-white text-xs px-2 py-1 rounded-full">
                            Asosiy
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </article>
        </div>
      </section>

      {/* Lightbox modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4">
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition z-10"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          <img
            src={selectedImage}
            alt="Preview"
            className="max-h-[90vh] max-w-[95vw] rounded-lg shadow-2xl object-contain"
          />

          {/* Image counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-sm px-3 py-1.5 rounded-full">
            {allImages.findIndex((img) => img.url === selectedImage) + 1} /{" "}
            {allImages.length}
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}

export default NewsDetails;
