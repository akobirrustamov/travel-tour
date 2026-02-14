import { useState, useEffect, useMemo } from "react";

import { useNavigate } from "react-router-dom";
import icon from "../assets/images/miniAture.jpg";
import bg from "../assets/images/bgNew.png";
import twin from "../assets/images/twin.jpg";
import twin1 from "../assets/images/twin1.jpg";
import twin2 from "../assets/images/twin2.jpg";
import double from "../assets/images/double.jpg";
import double1 from "../assets/images/double1.jpg";
import double2 from "../assets/images/double2.jpg";
import triple from "../assets/images/triple.jpg";
import triple1 from "../assets/images/triple1.jpg";
import triple2 from "../assets/images/triple2.jpg";
import newEntry from "../assets/images/NEWentry.jpg";
import newGallery from "../assets/images/NEWgallery.jpg";
import newReception from "../assets/images/NEWreception.jpg";
import newterrace from "../assets/images/NEWterrace.jpg";
import { ToastContainer, toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import ApiCall, { baseUrl } from "../config";
import Hero from "../components/Hero.jsx";
import About from "../components/About.jsx";
import Tours from "../components/Tours.jsx";
import Gallery from "../components/Gallery.jsx";
import Partners from "../components/Partners.jsx";
import News from "../components/News.jsx";

function Home() {
  const [rooms, setRooms] = useState([
    { roomType: "", guestsCount: 1, checkIn: "", checkOut: "" },
  ]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeRoomCarousel, setActiveRoomCarousel] = useState(null);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeRoomIndex, setActiveRoomIndex] = useState(1); // по центру — второй тип (DOUBLE)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [bookingEnabled, setBookingEnabled] = useState(true);

  useEffect(() => {
    loadBookingStatus();
  }, []);

  const loadBookingStatus = async () => {
    try {
      const response = await fetch(baseUrl + "/api/v1/settings/booking-status");
      const json = await response.json();

      console.log("📌 FETCH JSON:", json);

      setBookingEnabled(json.enabled);
    } catch (e) {
      console.error("❌ Exception while loading booking status:", e);
      setBookingEnabled(true);
    }
  };

  // 🔹 Индекс текущего изображения для каждой комнаты
  const [roomImageIndexes, setRoomImageIndexes] = useState({
    TWIN: 0,
    DOUBLE: 0,
    TRIPLE: 0,
  });
  const roomImages = {
    TWIN: [twin, twin1, twin2],
    DOUBLE: [double, double1, double2],
    TRIPLE: [triple, triple1, triple2],
  };
  // 🔹 Инициализация roomTypes (только первый снимок)
  const roomTypes = useMemo(
    () => [
      {
        key: "TWIN",
        title: t("home.rooms.types.TWIN.title"),
        subtitle: t("home.rooms.types.TWIN.desc"),
        image: roomImages.TWIN[0],
      },
      {
        key: "DOUBLE",
        title: t("home.rooms.types.DOUBLE.title"),
        subtitle: t("home.rooms.types.DOUBLE.desc"),
        image: roomImages.DOUBLE[0],
      },
      {
        key: "TRIPLE",
        title: t("home.rooms.types.TRIPLE.title"),
        subtitle: t("home.rooms.types.TRIPLE.desc"),
        image: roomImages.TRIPLE[0],
      },
    ],
    [roomImages, t]
  );

  const mainCarouselSlides = [
    {
      background: `${newGallery}`,
      title: t("home.rooms.types.TWIN.title"),
      subtitle: t("home.rooms.types.TWIN.desc"),
    },
    {
      background: `${newReception}`,
      title: t("home.rooms.types.DOUBLE.title"),
      subtitle: t("home.rooms.types.DOUBLE.desc"),
    },
    {
      background: `${newterrace}`,
      title: t("home.rooms.types.TRIPLE.title"),
      subtitle: t("home.rooms.types.TRIPLE.desc"),
    },
    {
      background: `${newEntry}`,
      title: t("home.rooms.types.TRIPLE.title"),
      subtitle: t("home.rooms.types.TRIPLE.desc"),
    },
  ];

  useEffect(() => {
    const activeRoomKey = roomTypes[activeRoomIndex]?.key;
    if (!activeRoomKey) return;

    // Таймер смены фото только у активной комнаты
    const interval = setInterval(() => {
      setRoomImageIndexes((prev) => ({
        ...prev,
        [activeRoomKey]:
          (prev[activeRoomKey] + 1) % roomImages[activeRoomKey].length,
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, [activeRoomIndex]);

  // Автопрокрутка главной карусели
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % mainCarouselSlides.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [mainCarouselSlides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % mainCarouselSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) =>
        (prev - 1 + mainCarouselSlides.length) % mainCarouselSlides.length
    );
  };

  const addRoom = () => {
    setRooms([
      ...rooms,
      { roomType: "", guestsCount: 1, checkIn: "", checkOut: "" },
    ]);
  };

  const updateRoom = (index, field, value) => {
    const newRooms = [...rooms];
    newRooms[index][field] = value;
    setRooms(newRooms);
  };

  const guestOptions = (roomType) => {
    if (roomType === "TRIPLE") return [1, 2, 3];
    if (roomType === "DOUBLE" || roomType === "TWIN") return [1, 2];
    return [1];
  };

  const handleBooking = () => {
    for (let r of rooms) {
      if (!r.roomType || !r.checkIn || !r.checkOut) {
        toast.info(t("home.booking.error"));
        return;
      }
    }
    localStorage.setItem("selectedRooms", JSON.stringify(rooms));
    navigate("/booking");
  };
  const handleRoomBookingPrefill = (roomType) => {
    // Определяем максимальное число гостей
    let maxGuests = 1;
    if (roomType === "DOUBLE" || roomType === "TWIN") maxGuests = 2;
    if (roomType === "TRIPLE") maxGuests = 3;

    // Заполняем первую комнату выбранными значениями
    setRooms([{ roomType, guestsCount: maxGuests, checkIn: "", checkOut: "" }]);

    // Прокручиваем страницу к секции бронирования
    const bookingSection = document.getElementById("booking");
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    // Закрываем активную карусель (если она открыта)
    setActiveRoomCarousel(null);
  };

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div className="min-h-screen">
      <ToastContainer position="top-right" autoClose={2000} />


      <Hero />

      <About />

      <Tours/>

<Partners/>
     {/*<Gallery />*/}

  <News/>

      {/* ===== FEATURES SECTION ===== */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-yellow-50/30">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              {t("home.features.title")}
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              {t("home.features.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: "⭐",
                title: t("home.features.list.1.title"),
                description: t("home.features.list.1.desc"),
              },
              {
                icon: "🖼️",
                title: t("home.features.list.2.title"),
                description: t("home.features.list.2.desc"),
              },
              {
                icon: "🏆",
                title: t("home.features.list.3.title"),
                description: t("home.features.list.3.desc"),
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 text-center hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-yellow-200 group"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <span className="text-2xl">{feature.icon}</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* ===== FOOTER ===== */}
      <footer
        id="contacts"
        className="bg-[#1b2a24] text-gray-300 pt-16 relative border-t border-green-900"
      >
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {/* ===== LOGO & DESCRIPTION ===== */}
          <div className="flex flex-col items-start">
            <div className="flex items-center gap-3 mb-4">
              <img
                className="w-12 h-12 rounded-full shadow-xl object-cover"
                src={icon}
                alt="Miniature Hotel"
              />
              <div className="flex gap-2">
                <span className="text-xl font-bold text-gray-300 leading-tight">
                  Miniature
                </span>
                <span className="text-yellow-500 font-semibold text-xl leading-tight">
                  Hotel
                </span>
              </div>
            </div>

            <p className="text-gray-400 leading-relaxed mb-6">
              {t("home.footer.desc")}
            </p>

            {/* ===== SOCIAL MEDIA ===== */}
            <div className="flex gap-5 mt-4">
              {/* Instagram */}
              <a
                href="https://www.instagram.com/miniatureboutiquehotel/"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-yellow-400/10 hover:bg-yellow-400 transition-all duration-300"
                title="Instagram"
                target="_blank"
                rel="noreferrer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 448 512"
                  fill="currentColor"
                  className="w-5 h-5 text-yellow-400 hover:text-white transition-colors"
                >
                  <path d="M224.3 141a115 115 0 1 0 -.6 230 115 115 0 1 0 .6-230zm-.6 40.4a74.6 74.6 0 1 1 .6 149.2 74.6 74.6 0 1 1 -.6-149.2zm93.4-45.1a26.8 26.8 0 1 1 53.6 0 26.8 26.8 0 1 1 -53.6 0zm129.7 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM399 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z" />
                </svg>
              </a>

              {/* Facebook */}
              <a
                href="#"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-yellow-400/10 hover:bg-yellow-400 transition-all duration-300"
                title="Facebook"
                target="_blank"
                rel="noreferrer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  className="w-5 h-5 text-yellow-400 hover:text-white transition-colors"
                >
                  <path d="M22 12a10 10 0 1 0-11.5 9.9v-7H8v-3h2.5V9.5A3.5 3.5 0 0 1 14 6h3v3h-2c-.5 0-1 .5-1 1V12h3l-.5 3h-2.5v7A10 10 0 0 0 22 12" />
                </svg>
              </a>

              {/* Booking */}
              <a
                href="https://www.booking.com/hotel/uz/miniature-boutique-bukhara.ru.html"
                className="text-yellow-400 hover:text-white px-2 flex items-center justify-center rounded-full bg-yellow-400/10 hover:bg-yellow-400 transition-all duration-300"
                title="Booking"
                target="_blank"
                rel="noreferrer"
              >
                Booking.com
              </a>
            </div>
          </div>

          {/* ===== CONTACT INFO ===== */}
          <div>
            <h3 className="text-2xl font-bold text-yellow-400 mb-6">
              {t("home.footer.contacts")}
            </h3>
            <ul className="space-y-3 text-gray-400">
              <li>
                <strong className="text-gray-200">
                  {t("home.footer.phone")}:
                </strong>{" "}
                <a
                  href="tel:+998998774664"
                  className="hover:text-yellow-400 transition-colors"
                >
                  +998 99 877 46 64
                </a>
              </li>
              <li>
                <strong className="text-gray-200">
                  {t("home.footer.email")}:
                </strong>{" "}
                <a
                  href="mailto:miniatureboutique@mail.ru"
                  className="hover:text-yellow-400 transition-colors"
                >
                  miniatureboutique@mail.ru
                </a>
              </li>
              <li>
                <strong className="text-gray-200">
                  {t("home.footer.address")}:
                </strong>{" "}
                Саррафон 1-муйилиш 6-уй, 200100, Bukhara, Uzbekistan
              </li>
            </ul>
          </div>

          {/* ===== MAP ===== */}
          <div className="rounded-3xl overflow-hidden shadow-2xl border border-yellow-400/20">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d497.3581815147606!2d64.42017413802014!3d39.77234531434028!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3f5007f49a3880a1%3A0x4e6842e0ccd3fafa!2sMiniature%20boutique%20hotel!5e1!3m2!1sru!2s!4v1762249276429!5m2!1sru!2s"
              width="100%"
              height="260"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Miniature Hotel Map"
            ></iframe>
          </div>
        </div>

        {/* ===== COPYRIGHT & BACK TO TOP ===== */}
        <div className="text-center text-gray-500 text-sm mt-12 border-t border-green-800 pt-6">
          © {new Date().getFullYear()} Miniature Hotel —{" "}
          {t("home.footer.rights")}.
        </div>

        <div
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="mt-10 mx-auto w-full text-center px-6 py-4 bg-yellow-400 text-black font-semibold cursor-pointer shadow-md hover:bg-yellow-500 hover:-translate-y-1 transition-all duration-300"
        >
          {t("home.footer.back")}
        </div>
      </footer>
    </div>
  );
}

export default Home;
