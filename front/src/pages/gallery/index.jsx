import React, { useEffect, useState } from "react";
import ApiCall, { baseUrl } from "../../config/index";
import { Eye, X } from "lucide-react";
import Footer from "../../components/Footer";

function Index() {
  const [gallery, setGallery] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(true);

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

  return (  
    <>
      <section className="py-24 bg-gradient-to-br from-gray-50 via-white to-gray-100 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          {/* HEADER */}
          <div className="text-center mb-4">
            <h2 className="text-5xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent mb-4">
              Galereya
            </h2>
            <p className="text-gray-600 text-lg">
              Sayohatlarimizdan eng yorqin lavhalar
            </p>
          </div>

          {loading ? (
            <div className="text-center py-20 text-gray-500">
              Yuklanmoqda...
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {gallery.map((image) => (
                <div
                  key={image.id}
                  className="relative group cursor-pointer overflow-hidden rounded-2xl shadow-lg"
                  onClick={() =>
                    setSelectedImage(
                      `${baseUrl}/api/v1/file/getFile/${image?.media?.id}`,
                    )
                  }
                >
                  <img
                    src={`${baseUrl}/api/v1/file/getFile/${image?.media?.id}`}
                    alt="gallery"
                    className="w-full h-72 object-cover rounded-2xl transition duration-700 group-hover:scale-110"
                    onError={(e) => {
                      e.target.src =
                        "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800";
                    }}
                  />

                  {/* Overlay */}
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
      {/* LIGHTBOX MODAL */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-6 right-6 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full transition"
          >
            <X size={24} />
          </button>

          <img
            src={selectedImage}
            alt="preview"
            className="max-h-[90vh] max-w-[90vw] rounded-xl shadow-2xl"
          />
        </div>
      )}
    </>
  );
}

export default Index;
