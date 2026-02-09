import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import About from "./pages/About";
import Rooms from "./pages/Rooms";
import Restaurant from "./pages/Restaurant";
import Booking from "./pages/Booking";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="rooms" element={<Rooms />} />
          <Route path="restaurant" element={<Restaurant />} />
          <Route path="booking" element={<Booking />} />
        </Route>



        {/* 🔑 Админ */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/carusel" element={<AdminCarusel />} />
        <Route path="/admin/gallery" element={<AdminGallery />} />
        <Route path="/admin/news" element={<AdminNews />} />
        <Route path="/admin/tour" element={<AdminTour />} />
        <Route path="/admin/youtube" element={<AdminYoutube />} />
        <Route path="/admin/partner" element={<AdminPartner />} />


      </Routes>
    </BrowserRouter>
  );
}

export default App;
