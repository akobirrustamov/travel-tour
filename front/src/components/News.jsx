import React, { useState, useEffect } from 'react';
import icon from "../assets/images/logo.png";
import ApiCall, { baseUrl } from "../config";
import { useTranslation } from "react-i18next";
import bg from "../assets/images/bgNew.png"

function News() {
    const { t, i18n } = useTranslation();
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeNewsIndex, setActiveNewsIndex] = useState(0);
    const [roomImageIndexes, setRoomImageIndexes] = useState({});

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

                // Initialize image indexes for each news item
                const initialIndexes = {};
                res.data.content.forEach((item, index) => {
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

    // === Get current language ===
    const getCurrentLang = () => {
        const lang = i18n.language || 'en';
        const langMap = {
            'uz': 'uz',
            'ru': 'ru',
            'en': 'en',
            'tr': 'turk',
            'turk': 'turk'
        };
        return langMap[lang] || 'en';
    };

    // === Map news items to room format ===
    const newsToRoomFormat = () => {
        return news.map(item => {
            const lang = getCurrentLang();
            const title = item[`title_${lang}`] || item.title_uz || item.title_en || "News";
            const description = item[`description_${lang}`] || item.description_uz || item.description_en || "";

            // Get main photo URL
            const mainPhotoUrl = item.mainPhoto
                ? `${baseUrl}/api/v1/file/getFile/${item.mainPhoto.id}`
                : icon;

            // Get all photos for carousel
            const photos = [mainPhotoUrl];
            if (item.photos && item.photos.length > 0) {
                item.photos.forEach(photo => {
                    photos.push(`${baseUrl}/api/v1/file/getFile/${photo.id}`);
                });
            }

            return {
                id: item.id,
                key: item.id,
                title: title,
                subtitle: description.substring(0, 80) + (description.length > 100 ? '...' : ''),
                mainImage: mainPhotoUrl,
                images: photos,
                createdAt: item.createdAt
            };
        });
    };

    const roomTypes = newsToRoomFormat();

    // === Handle image rotation for center card ===
    useEffect(() => {
        if (roomTypes.length === 0) return;

        const interval = setInterval(() => {
            const activeId = roomTypes[activeNewsIndex]?.id;
            if (!activeId) return;

            setRoomImageIndexes(prev => {
                const currentIndex = prev[activeId] || 0;
                const imagesCount = roomTypes[activeNewsIndex]?.images?.length || 1;
                return {
                    ...prev,
                    [activeId]: (currentIndex + 1) % imagesCount
                };
            });
        }, 3000); // Change image every 3 seconds

        return () => clearInterval(interval);
    }, [activeNewsIndex, roomTypes]);

    // === Touch handlers for mobile swipe ===
    const handleTouchStart = (e) => {
        window.touchStartX = e.touches[0].clientX;
    };

    const handleTouchEnd = (e) => {
        const deltaX = e.changedTouches[0].clientX - window.touchStartX;
        if (Math.abs(deltaX) > 60) {
            if (deltaX > 0) {
                setActiveNewsIndex((prev) => (prev - 1 + roomTypes.length) % roomTypes.length);
            } else {
                setActiveNewsIndex((prev) => (prev + 1) % roomTypes.length);
            }
        }
    };

    // === Handle booking (you can modify this for your needs) ===
    const handleNewsReadMore = (newsId) => {
        console.log("Read more about news:", newsId);
        // Add your logic here, e.g., open modal or navigate to news detail page
    };

    // === Loading State ===
    if (loading) {
        return (
            <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
                <div className="max-w-6xl mx-auto px-6 text-center">
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
                        {t("home.news.title", "News & Updates")}
                    </h2>
                    <p className="text-lg text-gray-600 mb-16">
                        {t("home.news.subtitle", "Stay updated with our latest news")}
                    </p>
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-emerald-500"></div>
                    </div>
                </div>
            </section>
        );
    }

    // === Empty State ===
    if (roomTypes.length === 0) {
        return (
            <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
                <div className="max-w-6xl mx-auto px-6 text-center">
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
                        {t("home.news.title", "News & Updates")}
                    </h2>
                    <p className="text-lg text-gray-600 mb-16">
                        {t("home.news.subtitle", "Stay updated with our latest news")}
                    </p>
                    <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
                        <svg className="mx-auto text-gray-400 mb-4" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M2 12h20" />
                            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                        </svg>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">
                            {t("home.news.no_news", "No news available")}
                        </h3>
                        <p className="text-gray-600">
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
            className="py-20 bg-white object-cover"
        >
            <div className="max-w-6xl mx-auto px-6 text-center text-white">
                <h2 className="text-4xl md:text-5xl font-bold mb-4">
                    {t("home.news.title", "News & Updates")}
                </h2>
                <p className="text-lg mb-16">
                    {t("home.news.subtitle", "Stay updated with our latest news")}
                </p>

                <div
                    className="relative flex justify-center items-center h-[520px] md:h-[580px]"
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                >
                    {roomTypes.map((room, index) => {
                        const total = roomTypes.length;
                        let offset = (index - activeNewsIndex + total) % total;
                        if (offset > total / 2) offset -= total;
                        const isCenter = offset === 0;
                        const isMobile = window.innerWidth < 768;
                        const baseShift = isMobile ? 180 : 320;
                        const transformStyle = {
                            transform: `translateX(${offset * baseShift}px) scale(${
                                isCenter ? 1.1 : 0.85
                            }) rotateY(${offset * -20}deg)`,
                            zIndex: isCenter ? 30 : 10 - Math.abs(offset),
                            opacity: isCenter ? 1 : 0.6,
                            transition: "all 0.6s ease",
                        };

                        return (
                            <div
                                key={room.id}
                                className="absolute top-0 cursor-pointer w-76 md:w-[420px] h-[460px] bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 hover:shadow-3xl"
                                style={transformStyle}
                                onClick={() => setActiveNewsIndex(index)}
                            >
                                <div className="relative h-64 w-full overflow-hidden">
                                    <img
                                        key={`${room.id}-${roomImageIndexes[room.id] || 0}`}
                                        src={room.images[roomImageIndexes[room.id] || 0] || room.mainImage}
                                        alt={room.title}
                                        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[1500ms] ease-in-out ${
                                            isCenter ? "opacity-100" : "opacity-80"
                                        }`}
                                        onError={(e) => {
                                            e.target.src = icon;
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

                                    {/* Date badge */}
                                    {room.createdAt && (
                                        <div className="absolute top-4 left-4 bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                                            {new Date(room.createdAt).toLocaleDateString()}
                                        </div>
                                    )}
                                </div>

                                <div className="p-2 justify-between h-[200px]">
                                    <div className="p-0 md:p-2">
                                        <h3 className="text-xl md:text-xl font-bold text-gray-800 mb-2">
                                            {room.title}
                                        </h3>
                                        <div
                                            className="text-gray-600 text-base leading-relaxed line-clamp-3 prose prose-sm max-w-none"
                                            dangerouslySetInnerHTML={{ __html: room.subtitle }}
                                        />
                                    </div>

                                    {isCenter && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleNewsReadMore(room.id);
                                            }}
                                            className="mt-4 w-4/5 px-8 py-3 bg-yellow-400 text-black font-semibold rounded-xl hover:bg-yellow-500 transition-all shadow-md hover:shadow-lg"
                                        >
                                            {t("home.news.read_more", "Read More")}
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Navigation Dots */}
                <div className="flex justify-center mt-8 space-x-2">
                    {roomTypes.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setActiveNewsIndex(index)}
                            className={`h-2 rounded-full transition-all duration-300 ${
                                index === activeNewsIndex
                                    ? 'w-8 bg-yellow-400'
                                    : 'w-2 bg-white/50 hover:bg-white'
                            }`}
                        />
                    ))}
                </div>
            </div>

            {/* Add styles for line-clamp */}
            <style jsx>{`
                .line-clamp-3 {
                    display: -webkit-box;
                    -webkit-line-clamp: 3;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
            `}</style>
        </section>
    );
}

export default News;