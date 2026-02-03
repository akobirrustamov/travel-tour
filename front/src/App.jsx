import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";

// 🔑 Админ
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminLogin from "./pages/admin/AdminLogin";
import BookingsPage from "./pages/admin/BookingsPage";
import AdminMessenger from "./pages/admin/chat/AdminMesseger";

// 🔑 Ресепшн
import ReceptionDashboard from "./pages/reception/AdminDashboard";
import BookingsPageReception from "./pages/reception/BookingsPage";
import Messenger from "./pages/reception/chat/Messeger";

// 🔑 Повар
import Dashboard from "./pages/cook/Dashboard";
import CookMessenger from "./pages/cook/chat/Messeger";

// 🔑 Other
import OtherDashboard from "./pages/others/Dashboard";
import OtherMessenger from "./pages/others/chat/Messeger";

import Home from "./pages/Home";
import About from "./pages/About";
import Rooms from "./pages/Rooms";
import Restaurant from "./pages/Restaurant";
import Booking from "./pages/Booking";
import ManageUsers from "./pages/admin/ManageUsers";

// import Conference from "./pages/Conference";
// import Contacts from "./pages/Contacts";

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
        <Route path="/admin/users" element={<ManageUsers />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/bookings" element={<BookingsPage />} />
        <Route path="/admin/talk" element={<AdminMessenger />} />


      </Routes>
    </BrowserRouter>
  );
}

export default App;
