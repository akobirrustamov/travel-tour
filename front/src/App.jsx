import { Routes, Route, useLocation } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminCarusel from "./pages/admin/AdminCarusel";
import AdminGallery from "./pages/admin/AdminGallery";
import AdminNews from "./pages/admin/AdminNews";
import AdminTour from "./pages/admin/AdminTour";
import AdminYoutube from "./pages/admin/AdminYoutube";
import AdminPartner from "./pages/admin/AdminPartner";

import Home from "./pages/Home";
import Rooms from "./pages/Rooms";
import News from "./pages/news/index";
import Restaurant from "./pages/Restaurant";
import Gallery from "./pages/gallery/index";
import Video from "./pages/videos/index";
import Booking from "./pages/Booking";
import Tours from "./pages/TourDetails/index";
import Brons from "./pages/admin/AdminBron";
import ToursDetails from "./pages/TourDetails/Details";
import { useEffect } from "react";
import NewsDetails from "./pages/news/NewsDetails";

function App() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0); // INSTANT
  }, [pathname]);
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="rooms" element={<Rooms />} />
        <Route path="news" element={<News />} />
        <Route path="news/:id" element={<NewsDetails />} />
        <Route path="restaurant" element={<Restaurant />} />
        <Route path="gallery" element={<Gallery />} />
        <Route path="youtube" element={<Video />} />
        <Route path="booking" element={<Booking />} />
        <Route path="tours" element={<Tours />} />
        <Route path="tours/:id" element={<ToursDetails />} />
      </Route>

      {/* 🔑 Админ */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/carusel" element={<AdminCarusel />} />
      <Route path="/admin/gallery" element={<AdminGallery />} />
      <Route path="/admin/news" element={<AdminNews />} />
      <Route path="/admin/tour" element={<AdminTour />} />
      <Route path="/admin/brons" element={<Brons />} />
      <Route path="/admin/youtube" element={<AdminYoutube />} />
      <Route path="/admin/partner" element={<AdminPartner />} />
    </Routes>
  );
}

export default App;
