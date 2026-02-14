import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ChevronLeft,
    ChevronRight,
    MapPin,
    Calendar,
    Clock,
    DollarSign,
    Star,
    Info,
    Send
} from "lucide-react";
import ApiCall, { baseUrl } from "../config";

function Tours() {
    const [tours, setTours] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [currentSlide, setCurrentSlide] = useState({});
    const { t, i18n } = useTranslation();

    // === Fetch Tours ===
    useEffect(() => {
        fetchTours();
    }, [currentPage]);

    const fetchTours = async () => {
        try {
            setLoading(true);
            const res = await ApiCall(`/api/v1/travel-tours/website?page=${currentPage}&size=6`);

            if (res && !res.error) {
                setTours(res.data.content || []);
                setTotalPages(res.data.totalPages || 0);

                // Initialize current slide for each tour
                const initialSlide = {};
                res.data.content.forEach((tour) => {
                    initialSlide[tour.id] = 0;
                });
                setCurrentSlide(initialSlide);
            }
        } catch (error) {
            console.error("Error fetching tours:", error);
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

    // === Get title based on language ===
    const getTitle = (tour) => {
        const lang = getCurrentLang();
        return tour[`title_${lang}`] || tour.title_uz || tour.title_en || "Tour";
    };

    // === Format date based on language ===
    const formatDateRange = (startDate, endDate) => {
        if (!startDate || !endDate) return "";

        const start = new Date(startDate);
        const end = new Date(endDate);

        const dayStart = start.getDate();
        const dayEnd = end.getDate();

        const lang = getCurrentLang();

        // Custom month names for Uzbek
        const uzMonths = [
            'yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun',
            'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'
        ];

        // Get month names based on language
        const getMonthName = (date) => {
            const monthIndex = date.getMonth();

            switch(lang) {
                case 'uz':
                    return uzMonths[monthIndex];
                case 'ru':
                    return date.toLocaleDateString('ru-RU', { month: 'long' });
                case 'turk':
                    return date.toLocaleDateString('tr-TR', { month: 'long' });
                case 'en':
                default:
                    return date.toLocaleDateString('en-US', { month: 'long' });
            }
        };

        const monthStart = getMonthName(start);
        const monthEnd = getMonthName(end);

        // Format based on language with proper suffixes
        switch(lang) {
            case 'ru':
                return `с ${dayStart} ${monthStart} по ${dayEnd} ${monthEnd}`;

            case 'uz':
                // Format: "13-yanvardan 20-yanvargacha"
                return `${dayStart}-${monthStart}dan ${dayEnd}-${monthEnd}gacha`;

            case 'turk':
                return `${dayStart} ${monthStart} - ${dayEnd} ${monthEnd} arasında`;

            case 'en':
            default:
                return `from ${monthStart} ${dayStart} to ${monthEnd} ${dayEnd}`;
        }
    };

    // === Calculate duration ===
    const calculateDuration = (start, end) => {
        if (!start || !end) return 0;
        const startDate = new Date(start);
        const endDate = new Date(end);
        const diffTime = Math.abs(endDate - startDate);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    // === Next slide ===
    const nextSlide = (tourId, imageCount) => {
        setCurrentSlide(prev => ({
            ...prev,
            [tourId]: (prev[tourId] + 1) % imageCount
        }));
    };

    // === Previous slide ===
    const prevSlide = (tourId, imageCount) => {
        setCurrentSlide(prev => ({
            ...prev,
            [tourId]: (prev[tourId] - 1 + imageCount) % imageCount
        }));
    };

    // === Loading State ===
    if (loading) {
        return (
            <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
                            {t('tours.title', 'Travel Tours')}
                        </h2>
                        <p className="text-xl text-gray-600">
                            {t('tours.subtitle', 'Discover our amazing travel packages')}
                        </p>
                    </div>
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-emerald-500"></div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-10 bg-gradient-to-b from-gray-50 to-white">
            <div className="container mx-auto px-4">
                {/* Section Header */}
                <div className="text-center mb-12">
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
                        {t('tours.title', 'Travel Tours')}
                    </h2>
                    <p className="text-xl text-gray-600">
                        {t('tours.subtitle', 'Discover our amazing travel packages')}
                    </p>
                </div>

                {/* Tours Carousel Grid - 3 per row */}
                {tours.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
                        <svg className="mx-auto text-gray-400 mb-4" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M2 12h20" />
                            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                        </svg>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">
                            {t('tours.no_tours', 'No tours available')}
                        </h3>
                        <p className="text-gray-600">
                            {t('tours.check_back', 'Please check back later for new tours')}
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {tours.map((tour) => {
                                const title = getTitle(tour);
                                const duration = calculateDuration(tour.startDate, tour.endDate);
                                const dateRange = formatDateRange(tour.startDate, tour.endDate);
                                const imageCount = tour.images?.length || 0;
                                const currentImageIndex = currentSlide[tour.id] || 0;

                                return (
                                    <div
                                        key={tour.id}
                                        className="group relative bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                                    >
                                        {/* Image Carousel */}
                                        <div className="relative h-48 overflow-hidden">
                                            {/* Background Images */}
                                            {tour.images && tour.images.length > 0 ? (
                                                <>
                                                    {tour.images.map((image, idx) => (
                                                        <div
                                                            key={idx}
                                                            className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
                                                                idx === currentImageIndex ? 'opacity-100' : 'opacity-0'
                                                            }`}
                                                        >
                                                            <div
                                                                className="absolute inset-0 bg-cover bg-center"
                                                                style={{
                                                                    backgroundImage: `url(${baseUrl}/api/v1/file/getFile/${image.id})`,
                                                                }}
                                                            />
                                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                                        </div>
                                                    ))}
                                                </>
                                            ) : (
                                                <div
                                                    className="absolute inset-0 bg-cover bg-center"
                                                    style={{
                                                        backgroundImage: 'url(https://images.unsplash.com/photo-1469854523086-cc02fe5d8800)',
                                                    }}
                                                >
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                                </div>
                                            )}

                                            {/* Navigation Arrows */}
                                            {imageCount > 1 && (
                                                <>
                                                    <button
                                                        onClick={() => prevSlide(tour.id, imageCount)}
                                                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/30 hover:bg-white/50 text-white rounded-full p-1 transition-all z-20 backdrop-blur-sm"
                                                    >
                                                        <ChevronLeft className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => nextSlide(tour.id, imageCount)}
                                                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/30 hover:bg-white/50 text-white rounded-full p-1 transition-all z-20 backdrop-blur-sm"
                                                    >
                                                        <ChevronRight className="w-4 h-4" />
                                                    </button>
                                                </>
                                            )}

                                            {/* Image Counter */}
                                            {imageCount > 1 && (
                                                <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-0.5 rounded-full text-xs backdrop-blur-sm">
                                                    {currentImageIndex + 1}/{imageCount}
                                                </div>
                                            )}

                                            {/* Badge */}
                                            {duration >= 7 && (
                                                <div className="absolute top-2 left-2 bg-yellow-400 text-gray-900 px-2 py-0.5 rounded-full text-xs font-medium shadow-lg">
                                                    ⭐ {t('tours.best_seller', 'Best Seller')}
                                                </div>
                                            )}

                                            {/* Title Overlay */}
                                            <div className="absolute bottom-2 left-2 right-2">
                                                <h3 className="text-white font-bold text-lg drop-shadow-lg">
                                                    {title}
                                                </h3>
                                            </div>
                                        </div>

                                        {/* Content - Compact */}
                                        <div className="p-4">
                                            {/* Cities */}
                                            <div className="flex items-center text-gray-600 mb-2">
                                                <MapPin className="w-3 h-3 mr-1 text-emerald-500 flex-shrink-0" />
                                                <span className="text-xs truncate">
                                                    {tour.cities?.join(' • ')}
                                                </span>
                                            </div>

                                            {/* Date Range - Full width with Calendar icon */}
                                            <div className="flex items-center text-gray-600 mb-3">
                                                <Calendar className="w-3 h-3 mr-1 text-emerald-500 flex-shrink-0" />
                                                <span className="text-xs">
                                                    {dateRange}
                                                </span>
                                            </div>

                                            {/* Tour Info - 3 columns */}
                                            <div className="grid grid-cols-3 gap-2 mb-3">
                                                {/* Duration */}
                                                <div className="text-center">
                                                    <Clock className="w-3 h-3 mx-auto text-emerald-500 mb-1" />
                                                    <span className="text-xs text-gray-600">
                                                        {duration} {t('tours.days', 'd')}
                                                    </span>
                                                </div>

                                                {/* Price */}
                                                <div className="text-center">
                                                    <DollarSign className="w-3 h-3 mx-auto text-emerald-500 mb-1" />
                                                    <span className="text-xs font-semibold text-gray-800">
                                                        {tour.price?.toLocaleString()} {tour.currency}
                                                    </span>
                                                </div>

                                                {/* Price per person */}
                                                <div className="text-center">
                                                    <span className="text-xs text-gray-500">
                                                        /{t('tours.per_person', 'person')}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Itinerary Badge (if exists) */}
                                            {tour.itineraryDetails && (
                                                <div className="mb-3 p-2 bg-emerald-50 rounded-lg border border-emerald-100">
                                                    <div className="flex items-center">
                                                        <Star className="w-3 h-3 text-emerald-600 mr-1 flex-shrink-0" />
                                                        <span className="text-xs text-emerald-700 truncate">
                                                            {t('tours.itinerary_available', 'Itinerary available')}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Two Buttons */}
                                            <div className="grid grid-cols-2 gap-2">
                                                <button className="flex items-center justify-center bg-emerald-100 hover:bg-emerald-200 text-emerald-700 py-2 rounded-lg text-xs font-medium transition-all">
                                                    <Info className="w-3 h-3 mr-1" />
                                                    {t('tours.read_more', 'Read more')}
                                                </button>
                                                <button className="flex items-center justify-center bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white py-2 rounded-lg text-xs font-medium transition-all shadow-md hover:shadow-lg">
                                                    <Send className="w-3 h-3 mr-1" />
                                                    {t('tours.leave_request', 'Leave request')}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center space-x-4 mt-12">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                                    disabled={currentPage === 0}
                                    className="p-2 border-2 border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>

                                <div className="flex space-x-2">
                                    {[...Array(totalPages)].map((_, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setCurrentPage(idx)}
                                            className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors
                                                ${currentPage === idx
                                                ? 'bg-emerald-500 text-white'
                                                : 'border-2 border-gray-300 text-gray-600 hover:bg-gray-50'
                                            }`}
                                        >
                                            {idx + 1}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                                    disabled={currentPage === totalPages - 1}
                                    className="p-2 border-2 border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </section>
    );
}

export default Tours;