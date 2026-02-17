import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ApiCall from "../../config";
import Sidebar from "./Sidebar";
import { ToastContainer, toast } from "react-toastify";
import { isTokenExpired } from "../../config/token";
import {
  FiCalendar,
  FiImage,
  FiVideo,
  FiUsers,
  FiMap,
  FiCamera,
  FiTrendingUp,
  FiActivity,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiDownload,
  FiUpload,
  FiBarChart2,
  FiStar,
  FiRefreshCw
} from "react-icons/fi";
import {
  MdOutlineTour,
  MdOutlineHotel,
  MdOutlineAttachMoney,
  MdOutlineDateRange,
  MdOutlinePhotoLibrary
} from "react-icons/md";
import {
  FaRegNewspaper,
  FaRegImages,
  FaYoutube,
  FaRegCalendarAlt
} from "react-icons/fa";
import { BiTrip } from "react-icons/bi";

function AdminDashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [statistics, setStatistics] = useState(null);
  const [summary, setSummary] = useState(null);
  const [activeStatus, setActiveStatus] = useState(null);
  const [timeline, setTimeline] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("week");

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token || isTokenExpired(token)) {
      localStorage.clear();
      navigate("/admin/login");
    } else {
      fetchAllStatistics();
    }
  }, [navigate]);

  const fetchAllStatistics = async () => {
    setLoading(true);
    try {
      const [statsRes, summaryRes, statusRes, timelineRes] = await Promise.all([
        ApiCall("/api/v1/statistic", "GET", null, null, true),
        ApiCall("/api/v1/statistic/summary", "GET", null, null, true),
        ApiCall("/api/v1/statistic/active-status", "GET", null, null, true),
        ApiCall("/api/v1/statistic/timeline", "GET", null, null, true)
      ]);

      if (statsRes?.data) setStatistics(statsRes.data);
      if (summaryRes?.data) setSummary(summaryRes.data);
      if (statusRes?.data) setActiveStatus(statusRes.data);
      if (timelineRes?.data) setTimeline(timelineRes.data);
    } catch (error) {
      console.error("Error fetching statistics:", error);
      toast.error("Failed to load statistics");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAllStatistics();
    setRefreshing(false);
    toast.success("Statistics updated");
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num || 0);
  };

  const StatCard = ({ title, value, icon: Icon, color, subtitle, trend }) => (
      <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-300 border-l-4" style={{ borderColor: color }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
            <p className="text-3xl font-bold text-gray-800">{formatNumber(value)}</p>
            {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
            {trend && (
                <div className="flex items-center mt-2">
              <span className={`text-xs font-medium ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
              </span>
                  <span className="text-xs text-gray-400 ml-1">vs last week</span>
                </div>
            )}
          </div>
          <div className="p-3 rounded-lg" style={{ backgroundColor: `${color}20` }}>
            <Icon className="w-8 h-8" style={{ color }} />
          </div>
        </div>
      </div>
  );

  const ProgressBar = ({ label, value, total, color }) => {
    const percentage = total > 0 ? (value / total) * 100 : 0;
    return (
        <div className="mb-3">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">{label}</span>
            <span className="font-medium">{formatNumber(value)}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
                className="h-2 rounded-full transition-all duration-300"
                style={{ width: `${percentage}%`, backgroundColor: color }}
            ></div>
          </div>
        </div>
    );
  };

  if (loading) {
    return (
        <div className="flex min-h-screen bg-gray-100">
          <Sidebar onLogout={() => navigate("/admin/login")} />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading dashboard data...</p>
            </div>
          </div>
        </div>
    );
  }

  return (
      <div className="flex min-h-screen bg-gray-100  overflow-hidden">
        <ToastContainer position="top-right" autoClose={2000} />

        {/* Burger Menu */}
        {!sidebarOpen && (
            <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden fixed top-4 left-4 z-50 bg-blue-500 text-white p-2 rounded-md shadow-lg"
            >
              ☰
            </button>
        )}

        {/* Sidebar */}
        <div
            className={`${
                sidebarOpen ? "translate-x-0" : "-translate-x-full"
            } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 w-64 transition-transform duration-300 ease-in-out bg-gray-800`}
        >
          <Sidebar onLogout={() => navigate("/admin/login")} />
        </div>

        {/* Overlay */}
        {sidebarOpen && (
            <div
                className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
                onClick={() => setSidebarOpen(false)}
            ></div>
        )}

        {/* Main Content */}
        <main className="flex-1 py-4 lg:py-6 bg-gray-100 overflow-y-auto  h-screen scroll-smooth px-16 ">
          {/* Header */}
          <div className="flex flex-col  md:flex-row md:items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
              <p className="text-gray-500 text-sm mt-1">Welcome back, Admin</p>
            </div>
            <div className="flex items-center space-x-3 mt-4 md:mt-0">
              <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all"
              >
                <FiRefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              <div className="bg-white px-4 py-2 rounded-lg shadow-sm">
              <span className="text-gray-600 text-sm">
                Last updated: {new Date().toLocaleTimeString()}
              </span>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          {summary && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
                <StatCard
                    title="Total Bookings"
                    value={summary.totalBookings}
                    icon={FiCalendar}
                    color="#3B82F6"
                />
                <StatCard
                    title="Total Tours"
                    value={summary.totalTours}
                    icon={BiTrip}
                    color="#10B981"
                />
                <StatCard
                    title="Total News"
                    value={summary.totalNews}
                    icon={FaRegNewspaper}
                    color="#F59E0B"
                />
                <StatCard
                    title="Gallery Items"
                    value={summary.totalGallery}
                    icon={FiCamera}
                    color="#EC4899"
                />
                <StatCard
                    title="Tour Days"
                    value={summary.totalTourDays}
                    icon={FiMap}
                    color="#8B5CF6"
                />
              </div>
          )}

          {/* Today's Activity */}
          {timeline?.today && (
              <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                    <FiActivity className="w-5 h-5 mr-2 text-blue-500" />
                    Today's Activity
                  </h2>
                  <span className="text-sm text-gray-500">{new Date().toLocaleDateString()}</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                  {Object.entries(timeline.today).map(([key, value]) => (
                      <div key={key} className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-gray-800">{formatNumber(value)}</p>
                        <p className="text-xs text-gray-500 capitalize">{key}</p>
                      </div>
                  ))}
                </div>
              </div>
          )}

          {/* Main Statistics Grid */}
          {statistics && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Travel Tours Section */}
                {statistics.travelTours && (
                    <div className="bg-white rounded-xl shadow-md p-6">
                      <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <BiTrip className="w-5 h-5 mr-2 text-green-500" />
                        Travel Tours Overview
                      </h2>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="bg-green-50 p-3 rounded-lg">
                            <p className="text-sm text-green-600">Active</p>
                            <p className="text-2xl font-bold text-green-700">{statistics.travelTours.active}</p>
                          </div>
                          <div className="bg-red-50 p-3 rounded-lg">
                            <p className="text-sm text-red-600">Inactive</p>
                            <p className="text-2xl font-bold text-red-700">{statistics.travelTours.inactive}</p>
                          </div>
                        </div>

                        <ProgressBar
                            label="Upcoming Tours"
                            value={statistics.travelTours.upcoming}
                            total={statistics.travelTours.total}
                            color="#3B82F6"
                        />
                        <ProgressBar
                            label="Ongoing Tours"
                            value={statistics.travelTours.ongoing}
                            total={statistics.travelTours.total}
                            color="#10B981"
                        />
                        <ProgressBar
                            label="Completed Tours"
                            value={statistics.travelTours.completed}
                            total={statistics.travelTours.total}
                            color="#8B5CF6"
                        />

                        <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
                          <div>
                            <p className="text-sm text-gray-500">With Images</p>
                            <p className="text-xl font-bold text-gray-800">{statistics.travelTours.withImages}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Without Images</p>
                            <p className="text-xl font-bold text-gray-800">{statistics.travelTours.withoutImages}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                )}

                {/* Bookings Section */}
                {statistics.bookings && (
                    <div className="bg-white rounded-xl shadow-md p-6">
                      <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <FiCalendar className="w-5 h-5 mr-2 text-blue-500" />
                        Bookings Overview
                      </h2>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-blue-50 p-4 rounded-lg text-center">
                          <p className="text-3xl font-bold text-blue-600">{formatNumber(statistics.bookings.today)}</p>
                          <p className="text-sm text-blue-600">Today</p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg text-center">
                          <p className="text-3xl font-bold text-purple-600">{formatNumber(statistics.bookings.lastWeek)}</p>
                          <p className="text-sm text-purple-600">This Week</p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-600">Total Bookings</span>
                          <span className="text-xl font-bold text-gray-800">{formatNumber(statistics.bookings.total)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${(statistics.bookings.lastMonth / statistics.bookings.total) * 100}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">Last month: {formatNumber(statistics.bookings.lastMonth)}</p>
                      </div>
                    </div>
                )}

                {/* Media Gallery Section */}
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <MdOutlinePhotoLibrary className="w-5 h-5 mr-2 text-pink-500" />
                    Media Overview
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    {statistics.carousel && (
                        <div className="bg-orange-50 p-4 rounded-lg">
                          <p className="text-sm text-orange-600">Carousel</p>
                          <p className="text-2xl font-bold text-orange-700">{statistics.carousel.total}</p>
                          <p className="text-xs text-orange-500 mt-1">{statistics.carousel.withImages} with images</p>
                        </div>
                    )}
                    {statistics.gallery && (
                        <div className="bg-pink-50 p-4 rounded-lg">
                          <p className="text-sm text-pink-600">Gallery</p>
                          <p className="text-2xl font-bold text-pink-700">{statistics.gallery.total}</p>
                          <p className="text-xs text-pink-500 mt-1">{statistics.gallery.withImages} with images</p>
                        </div>
                    )}
                    {statistics.youtube && (
                        <div className="bg-red-50 p-4 rounded-lg">
                          <p className="text-sm text-red-600">YouTube</p>
                          <p className="text-2xl font-bold text-red-700">{statistics.youtube.total}</p>
                          <p className="text-xs text-red-500 mt-1">{statistics.youtube.withIframe} with iframe</p>
                        </div>
                    )}
                    {statistics.attachments && (
                        <div className="bg-indigo-50 p-4 rounded-lg">
                          <p className="text-sm text-indigo-600">Attachments</p>
                          <p className="text-2xl font-bold text-indigo-700">{statistics.attachments.total}</p>
                          <p className="text-xs text-indigo-500 mt-1">{statistics.attachments.images} images</p>
                        </div>
                    )}
                  </div>
                </div>

                {/* News & Partners Section */}
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <FaRegNewspaper className="w-5 h-5 mr-2 text-yellow-500" />
                    Content Overview
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    {statistics.news && (
                        <div className="col-span-2 bg-yellow-50 p-4 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-semibold text-yellow-700">News</span>
                            <span className="text-2xl font-bold text-yellow-700">{statistics.news.total}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <p className="text-yellow-600">With Photos: {statistics.news.withPhotos}</p>
                              <p className="text-yellow-600">With Main: {statistics.news.withMainPhoto}</p>
                            </div>
                            <div>
                              <p className="text-yellow-600">This Week: {statistics.news.createdThisWeek}</p>
                              <p className="text-yellow-600">This Month: {statistics.news.createdThisMonth}</p>
                            </div>
                          </div>
                        </div>
                    )}
                    {statistics.travelPartners && (
                        <div className="col-span-2 bg-teal-50 p-4 rounded-lg mt-2">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-semibold text-teal-700">Travel Partners</span>
                            <span className="text-2xl font-bold text-teal-700">{statistics.travelPartners.total}</span>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-center">
                            <div>
                              <p className="text-lg font-bold text-green-600">{statistics.travelPartners.active}</p>
                              <p className="text-xs text-teal-600">Active</p>
                            </div>
                            <div>
                              <p className="text-lg font-bold text-red-600">{statistics.travelPartners.inactive}</p>
                              <p className="text-xs text-teal-600">Inactive</p>
                            </div>
                            <div>
                              <p className="text-lg font-bold text-teal-600">{statistics.travelPartners.withLogo}</p>
                              <p className="text-xs text-teal-600">With Logo</p>
                            </div>
                          </div>
                        </div>
                    )}
                  </div>
                </div>

                {/* Tour Days Section */}
                {statistics.tourDays && (
                    <div className="bg-white rounded-xl shadow-md p-6 lg:col-span-2">
                      <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <FiMap className="w-5 h-5 mr-2 text-purple-500" />
                        Tour Days Analysis
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-purple-50 p-4 rounded-lg text-center">
                          <p className="text-3xl font-bold text-purple-600">{formatNumber(statistics.tourDays.total)}</p>
                          <p className="text-sm text-purple-600">Total Tour Days</p>
                        </div>
                        <div className="bg-indigo-50 p-4 rounded-lg text-center">
                          <p className="text-3xl font-bold text-indigo-600">{formatNumber(statistics.tourDays.averagePerTour)}</p>
                          <p className="text-sm text-indigo-600">Average per Tour</p>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-lg text-center">
                          <p className="text-3xl font-bold text-blue-600">{formatNumber(statistics.tourDays.createdToday)}</p>
                          <p className="text-sm text-blue-600">Created Today</p>
                        </div>
                      </div>
                    </div>
                )}
              </div>
          )}

          {/* Footer */}
          <div className="mt-6 text-center text-gray-400 text-sm">
            <p>Dashboard automatically updates every 5 minutes</p>
          </div>
        </main>
      </div>
  );
}

export default AdminDashboard;