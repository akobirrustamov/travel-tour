import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import ApiCall, { baseUrl } from "../config";
import { useTranslation } from 'react-i18next';

function Hero() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [carouselSlides, setCarouselSlides] = useState([]);
    const [loading, setLoading] = useState(true);
    const { t, i18n } = useTranslation();

    // === Fetch Carousel Slides ===
    useEffect(() => {
        fetchCarouselSlides();
    }, []);

    const fetchCarouselSlides = async () => {
        try {
            setLoading(true);
            // Fetch all carousel slides
            const res = await ApiCall("/api/v1/carousel", "GET");

            if (res && !res.error) {
                // Map backend data to frontend format
                const slides = res.data.map((slide, index) => ({
                    id: slide.id,
                    background: slide.media ? `${baseUrl}/api/v1/file/getFile/${slide.media.id}` : null,
                    title_uz: slide.title_uz || "Sayoxat ufqlarini kashf eting",
                    title_ru: slide.title_ru || "Откройте горизонты путешествий",
                    title_en: slide.title_en || "Discover Travel Horizons",
                    title_turk: slide.title_turk || "Seyahat Ufuklarını Keşfedin",
                    description_uz: slide.description_uz || "Biz bilan dunyoning eng go'zal joylarini kashf eting",
                    description_ru: slide.description_ru || "Откройте для себя самые красивые места мира с нами",
                    description_en: slide.description_en || "Discover the world's most beautiful places with us",
                    description_turk: slide.description_turk || "Dünyanın en güzel yerlerini bizimle keşfedin"
                }));

                setCarouselSlides(slides);
            } else {
                // Fallback slides if API fails
                setCarouselSlides([
                    {
                        id: 1,
                        background: "https://images.unsplash.com/photo-1469474968028-56623f02e42e",
                        title_uz: "Sayoxat ufqlarini kashf eting",
                        title_ru: "Откройте горизонты путешествий",
                        title_en: "Discover Travel Horizons",
                        title_turk: "Seyahat Ufuklarını Keşfedin",
                        description_uz: "Biz bilan dunyoning eng go'zal joylarini kashf eting",
                        description_ru: "Откройте для себя самые красивые места мира с нами",
                        description_en: "Discover the world's most beautiful places with us",
                        description_turk: "Dünyanın en güzel yerlerini bizimle keşfedin"
                    }
                ]);
            }
        } catch (error) {
            console.error("Error fetching carousel slides:", error);
            // Fallback slides
            setCarouselSlides([
                {
                    id: 1,
                    background: "https://images.unsplash.com/photo-1469474968028-56623f02e42e",
                    title_uz: "Sayoxat ufqlarini kashf eting",
                    title_ru: "Откройте горизонты путешествий",
                    title_en: "Discover Travel Horizons",
                    title_turk: "Seyahat Ufuklarını Keşfedin",
                    description_uz: "Biz bilan dunyoning eng go'zal joylarini kashf eting",
                    description_ru: "Откройте для себя самые красивые места мира с нами",
                    description_en: "Discover the world's most beautiful places with us",
                    description_turk: "Dünyanın en güzel yerlerini bizimle keşfedin"
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    // === Get current slide content based on language ===
    const getCurrentSlideContent = () => {
        if (carouselSlides.length === 0) return { title: "", description: "" };

        const slide = carouselSlides[currentSlide];
        const currentLang = i18n.language || 'en';

        // Map language codes
        const langMap = {
            'uz': 'uz',
            'ru': 'ru',
            'en': 'en',
            'tr': 'turk',
            'turk': 'turk'
        };

        const backendLang = langMap[currentLang] || 'en';

        return {
            title: slide[`title_${backendLang}`] || slide.title_en,
            description: slide[`description_${backendLang}`] || slide.description_en
        };
    };

    // === Navigation functions ===
    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + carouselSlides.length) % carouselSlides.length);
    };

    // === Auto play ===
    useEffect(() => {
        if (carouselSlides.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
        }, 5000); // Change slide every 5 seconds

        return () => clearInterval(interval);
    }, [carouselSlides.length]);

    // === Loading state ===
    if (loading) {
        return (
            <section className="relative h-[70vh] w-full flex items-center justify-center bg-gradient-to-r from-gray-900 to-gray-800">
                <div className="text-center text-white">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-yellow-400 mx-auto mb-4"></div>
                    <p className="text-xl">Loading...</p>
                </div>
            </section>
        );
    }

    // === No slides state ===
    if (carouselSlides.length === 0) {
        return (
            <section className="relative h-[100vh] w-full flex items-center justify-center bg-gradient-to-r from-gray-900 to-gray-800">
                <div className="text-center text-white">
                    <p className="text-xl">No carousel slides available</p>
                </div>
            </section>
        );
    }

    const currentContent = getCurrentSlideContent();

    return (
        <div>
            {/* ===== HERO SECTION ===== */}
            <section
                id="home"
                className="relative h-[90vh] w-full flex items-center justify-center overflow-hidden"
            >
                {/* Background Slides */}
                {carouselSlides.map((slide, index) => (
                    <div
                        key={slide.id || index}
                        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                            index === currentSlide ? "opacity-100" : "opacity-0"
                        }`}
                    >
                        {/* Background Image */}
                        <div
                            className="absolute inset-0 bg-cover bg-center"
                            style={{
                                backgroundImage: slide.background
                                    ? `url(${slide.background})`
                                    : 'url(https://images.unsplash.com/photo-1469474968028-56623f02e42e)',
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                            }}
                        />
                        {/* Overlay */}
                        {/*<div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/70" />*/}
                    </div>
                ))}

                {/* Content */}
                {/*<div className="relative z-10 text-center text-white max-w-6xl mx-auto px-6">*/}
                {/*    <div className="mb-8 animate-fade-in">*/}
                {/*        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]">*/}
                {/*            {currentContent.title}*/}
                {/*        </h1>*/}
                {/*        <h2 className="text-2xl md:text-3xl text-gray-50 font-light mb-8 leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]">*/}
                {/*            {currentContent.description}*/}
                {/*        </h2>*/}

                {/*        /!* CTA Buttons *!/*/}
                {/*        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">*/}
                {/*            <button className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-8 py-4 rounded-full font-semibold text-lg transition-all transform hover:scale-105 shadow-lg">*/}
                {/*                {t('home.cta.explore', 'Explore Tours')}*/}
                {/*            </button>*/}
                {/*            <button className="bg-white/20 hover:bg-white/30 text-white px-8 py-4 rounded-full font-semibold text-lg backdrop-blur-sm transition-all transform hover:scale-105 border border-white/30">*/}
                {/*                {t('home.cta.contact', 'Contact Us')}*/}
                {/*            </button>*/}
                {/*        </div>*/}
                {/*    </div>*/}

                {/*    /!* Slide Counter *!/*/}
                {/*    <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 text-white/80 text-sm font-medium">*/}
                {/*        {String(currentSlide + 1).padStart(2, '0')} / {String(carouselSlides.length).padStart(2, '0')}*/}
                {/*    </div>*/}
                {/*</div>*/}

                {/* Navigation Arrows */}
                {carouselSlides.length > 1 && (
                    <>
                        <button
                            onClick={prevSlide}
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white rounded-full p-3 transition-all z-20 backdrop-blur-sm border border-white/20"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button
                            onClick={nextSlide}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white rounded-full p-3 transition-all z-20 backdrop-blur-sm border border-white/20"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    </>
                )}

                {/* Slide Indicators */}
                {carouselSlides.length > 1 && (
                    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
                        {carouselSlides.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentSlide(index)}
                                className={`transition-all duration-300 ${
                                    index === currentSlide
                                        ? "w-8 h-3 bg-yellow-400 rounded-full"
                                        : "w-3 h-3 bg-white/60 hover:bg-white rounded-full"
                                }`}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                )}

                {/* Scroll Indicator */}
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce z-20">
                    <ChevronDown className="w-8 h-8 text-white" />
                </div>
            </section>

            {/* Add animation styles */}
            <style jsx>{`
                @keyframes fade-in {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fade-in {
                    animation: fade-in 0.8s ease-out;
                }
            `}</style>
        </div>
    );
}

export default Hero;