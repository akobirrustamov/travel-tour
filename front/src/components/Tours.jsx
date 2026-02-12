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
    Users,
    Globe
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
                res.data.content.forEach((tour, index) => {
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

    // === Get description based on language ===
    const getDescription = (tour) => {
        const lang = getCurrentLang();
        return tour[`description_${lang}`] || tour.description_uz || tour.description_en || "";
    };

    // === Format date ===
    const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'long'
        });
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
        <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
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

                {/* Tours Grid */}
                {tours.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
                        <Globe className="mx-auto text-gray-400 mb-4" size={64} />
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">
                            {t('tours.no_tours', 'No tours available')}
                        </h3>
                        <p className="text-gray-600">
                            {t('tours.check_back', 'Please check back later for new tours')}
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {tours.map((tour) => {
                                const title = getTitle(tour);
                                const description = getDescription(tour);
                                const duration = calculateDuration(tour.startDate, tour.endDate);
                                const startDate = formatDate(tour.startDate);
                                const endDate = formatDate(tour.endDate);
                                const imageCount = tour.images?.length || 0;
                                const currentImageIndex = currentSlide[tour.id] || 0;
                                const currentImage = tour.images?.[currentImageIndex];

                                return (
                                    <div
                                        key={tour.id}
                                        className="group relative bg-white rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
                                    >
                                        {/* Image Carousel */}
                                        <div className="relative h-80 overflow-hidden">
                                            {/* Background Images */}
                                            {tour.images && tour.images.length > 0 ? (
                                                <>
                                                    {tour.images.map((image, idx) => (
                                                        <div
                                                            key={idx}
                                                            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                                                                idx === currentImageIndex ? 'opacity-100' : 'opacity-0'
                                                            }`}
                                                        >
                                                            <div
                                                                className="absolute inset-0 bg-cover bg-center"
                                                                style={{
                                                                    backgroundImage: `url(${baseUrl}/api/v1/file/getFile/${image.id})`,
                                                                }}
                                                            />
                                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
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
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                                                </div>
                                            )}

                                            {/* Navigation Arrows */}
                                            {imageCount > 1 && (
                                                <>
                                                    <button
                                                        onClick={() => prevSlide(tour.id, imageCount)}
                                                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white rounded-full p-2 transition-all z-20 backdrop-blur-sm"
                                                    >
                                                        <ChevronLeft className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => nextSlide(tour.id, imageCount)}
                                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white rounded-full p-2 transition-all z-20 backdrop-blur-sm"
                                                    >
                                                        <ChevronRight className="w-5 h-5" />
                                                    </button>
                                                </>
                                            )}

                                            {/* Image Counter */}
                                            {imageCount > 1 && (
                                                <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                                                    {currentImageIndex + 1} / {imageCount}
                                                </div>
                                            )}

                                            {/* Badges */}
                                            <div className="absolute top-4 left-4 flex gap-2">
                                                {tour.active && (
                                                    <span className="bg-emerald-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
                                                        {t('tours.available', 'Available')}
                                                    </span>
                                                )}
                                                {duration >= 7 && (
                                                    <span className="bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-sm font-medium shadow-lg">
                                                        {t('tours.best_seller', 'Best Seller')}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="p-6">
                                            {/* Title and Price */}
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h3 className="text-2xl font-bold text-gray-800 mb-2">
                                                        {title}
                                                    </h3>

                                                    {/* Cities */}
                                                    <div className="flex items-center text-gray-600 mb-3">
                                                        <MapPin className="w-4 h-4 mr-1 text-emerald-500" />
                                                        <span className="text-sm">
                                                            {tour.cities?.join(' • ')}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Price */}
                                                <div className="text-right">
                                                    <div className="flex items-center">
                                                        <DollarSign className="w-5 h-5 text-emerald-600" />
                                                        <span className="text-2xl font-bold text-gray-800">
                                                            {tour.price?.toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <span className="text-sm text-gray-500">
                                                        {tour.currency} / {t('tours.per_person', 'person')}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Description */}
                                            <p className="text-gray-600 mb-6 line-clamp-3">
                                                {description || t('tours.no_description', 'No description available')}
                                            </p>

                                            {/* Tour Info */}
                                            <div className="grid grid-cols-3 gap-4 mb-6">
                                                {/* Dates */}
                                                <div className="text-center p-3 bg-gray-50 rounded-xl">
                                                    <Calendar className="w-5 h-5 mx-auto text-emerald-500 mb-1" />
                                                    <span className="text-sm font-medium text-gray-700">
                                                        {startDate} - {endDate}
                                                    </span>
                                                </div>

                                                {/* Duration */}
                                                <div className="text-center p-3 bg-gray-50 rounded-xl">
                                                    <Clock className="w-5 h-5 mx-auto text-emerald-500 mb-1" />
                                                    <span className="text-sm font-medium text-gray-700">
                                                        {duration} {t('tours.days', 'days')}
                                                    </span>
                                                </div>

                                                {/* Images Count */}
                                                <div className="text-center p-3 bg-gray-50 rounded-xl">
                                                    <svg
                                                        className="w-5 h-5 mx-auto text-emerald-500 mb-1"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                        />
                                                    </svg>
                                                    <span className="text-sm font-medium text-gray-700">
                                                        {imageCount} {t('tours.photos', 'photos')}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Itinerary Preview */}
                                            {tour.itineraryDetails && (
                                                <div className="mb-6 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
                                                    <div className="flex items-start">
                                                        <Star className="w-5 h-5 text-emerald-600 mr-2 flex-shrink-0 mt-0.5" />
                                                        <div>
                                                            <h4 className="font-semibold text-gray-800 mb-1">
                                                                {t('tours.itinerary', 'Tour Itinerary')}
                                                            </h4>
                                                            <div
                                                                className="text-sm text-gray-600 line-clamp-2"
                                                                dangerouslySetInnerHTML={{
                                                                    __html: tour.itineraryDetails.replace(/<[^>]*>/g, '').substring(0, 100) + '...'
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Book Button */}
                                            <button className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-[1.02] shadow-lg hover:shadow-xl">
                                                {t('tours.book_now', 'Book Now')}
                                            </button>
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
                                    className="p-3 border-2 border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>

                                <div className="flex space-x-2">
                                    {[...Array(totalPages)].map((_, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setCurrentPage(idx)}
                                            className={`w-10 h-10 rounded-xl text-sm font-medium transition-colors
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
                                    className="p-3 border-2 border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Add styles for line-clamp */}
            <style jsx>{`
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
        </section>
    );
}

export default Tours;