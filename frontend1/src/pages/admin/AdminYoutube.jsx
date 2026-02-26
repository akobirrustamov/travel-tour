import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ApiCall, { baseUrl } from "../../config";
import Sidebar from "./Sidebar";
import { ToastContainer, toast } from "react-toastify";
import { isTokenExpired } from "../../config/token";
import {
  Plus,
  Edit,
  Trash2,
  Upload,
  X,
  Search,
  ChevronLeft,
  ChevronRight,
  Youtube as YoutubeIcon,
  Globe,
  Film,
  Calendar,
  Eye,
  Copy,
  Check,
  Link,
  Filter,
  Play,
} from "lucide-react";
import MyCkeditor from "../../components/MyCkeditor.jsx";

function AdminYoutube() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("uz");
  const [copiedId, setCopiedId] = useState(null);
  const [previewIframe, setPreviewIframe] = useState("");
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    iframe: "",
    description_uz: "",
    description_ru: "",
    description_en: "",
    description_turk: "",
  });

  // === Проверка токена ===
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token || isTokenExpired(token)) {
      localStorage.clear();
      navigate("/admin/login");
    } else {
      fetchVideos();
    }
  }, [navigate, currentPage]);

  // === Request with Refresh Token ===
  const requestWithRefresh = async (
    url,
    method = "GET",
    data = null,
    params = null,
  ) => {
    let res = await ApiCall(url, method, data, params);
    if (res && res.error && (res.data === 401 || res.data === 403)) {
      const refreshRes = await ApiCall(
        "/api/auth/refresh",
        "POST",
        null,
        null,
        false,
        true,
      );
      if (refreshRes && !refreshRes.error) {
        localStorage.setItem("access_token", refreshRes.data.accessToken);
        res = await ApiCall(url, method, data, params);
      } else {
        localStorage.removeItem("access_token");
        navigate("/admin/login");
      }
    }
    return res;
  };

  // === Fetch Videos with Pagination ===
  const fetchVideos = async () => {
    try {
      setLoading(true);
      const res = await requestWithRefresh(
        `/api/v1/youtube/page?page=${currentPage}&size=12`,
      );
      if (res && !res.error) {
        setVideos(res.data.content || []);
        setTotalPages(res.data.totalPages || 0);
        setTotalItems(res.data.totalElements || 0);
      } else {
        toast.error("Failed to fetch YouTube videos");
      }
    } catch (error) {
      toast.error("Error loading YouTube videos");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // === Handle Create/Update ===
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const url = editingId
        ? `/api/v1/youtube/${editingId}`
        : "/api/v1/youtube";
      const method = editingId ? "PUT" : "POST";

      const res = await requestWithRefresh(url, method, formData);

      if (res && !res.error) {
        toast.success(
          `YouTube video ${editingId ? "updated" : "created"} successfully`,
        );
        resetForm();
        setIsModalOpen(false);
        fetchVideos();
      } else {
        toast.error(
          `Failed to ${editingId ? "update" : "create"} YouTube video`,
        );
      }
    } catch (error) {
      toast.error("Error saving YouTube video");
      console.error(error);
    }
  };

  // === Handle Delete ===
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this YouTube video?"))
      return;

    try {
      const res = await requestWithRefresh(`/api/v1/youtube/${id}`, "DELETE");
      if (res && !res.error) {
        toast.success("YouTube video deleted successfully");
        fetchVideos();
      } else {
        fetchVideos();
        toast.error("Failed to delete YouTube video");
      }
    } catch (error) {
      toast.error("Error deleting YouTube video");
      console.error(error);
    }
  };

  // === Handle Edit ===
  const handleEdit = async (video) => {
    setEditingId(video.id);
    setFormData({
      iframe: video.iframe || "",
      description_uz: video.description_uz || "",
      description_ru: video.description_ru || "",
      description_en: video.description_en || "",
      description_turk: video.description_turk || "",
    });

    // Set preview
    setPreviewIframe(video.iframe || "");

    setIsModalOpen(true);
  };

  // === Handle Copy Embed Code ===
  const handleCopyEmbedCode = async (video) => {
    try {
      await navigator.clipboard.writeText(video.iframe);
      setCopiedId(video.id);
      toast.success("Embed code copied to clipboard");

      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopiedId(null);
      }, 2000);
    } catch (error) {
      toast.error("Failed to copy embed code");
      console.error(error);
    }
  };

  // === Handle Iframe Change ===
  const handleIframeChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, iframe: value }));
    setPreviewIframe(value);
  };

  // === Extract YouTube Video ID ===
  const extractYouTubeId = (iframe) => {
    if (!iframe) return null;

    // Try to extract video ID from iframe src
    const srcMatch = iframe.match(/src="[^"]*youtube\.com\/embed\/([^"?]+)/);
    if (srcMatch && srcMatch[1]) {
      return srcMatch[1];
    }

    // Try to extract from youtube.com/watch?v= format
    const watchMatch = iframe.match(/youtube\.com\/watch\?v=([^&]+)/);
    if (watchMatch && watchMatch[1]) {
      return watchMatch[1];
    }

    // Try to extract from youtu.be/ format
    const shortMatch = iframe.match(/youtu\.be\/([^"?]+)/);
    if (shortMatch && shortMatch[1]) {
      return shortMatch[1];
    }

    return null;
  };

  // === Get YouTube Thumbnail ===
  const getYouTubeThumbnail = (iframe) => {
    const videoId = extractYouTubeId(iframe);
    if (!videoId) return null;

    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  };

  // === Extract Instagram ID ===
  const getInstagramEmbed = (iframeString) => {
    if (!iframeString) return null;

    // Agar to‘liq iframe bo‘lsa
    const match = iframeString.match(/src="([^"]+)"/);
    if (match) return match[1];

    // Instagram link
    const instaMatch = iframeString.match(/instagram\.com\/(reel|p)\/([^/?]+)/);
    if (instaMatch) {
      return `https://www.instagram.com/${instaMatch[1]}/${instaMatch[2]}/embed`;
    }

    // YouTube watch link
    const ytMatch = iframeString.match(/v=([^&]+)/);
    if (ytMatch) {
      return `https://www.youtube.com/embed/${ytMatch[1]}`;
    }

    // youtu.be link
    const shortMatch = iframeString.match(/youtu\.be\/([^?]+)/);
    if (shortMatch) {
      return `https://www.youtube.com/embed/${shortMatch[1]}`;
    }

    return null;
  };

  // === Reset Form ===
  const resetForm = () => {
    setFormData({
      iframe: "",
      description_uz: "",
      description_ru: "",
      description_en: "",
      description_turk: "",
    });
    setPreviewIframe("");
    setEditingId(null);
  };

  // === Handle Input Change ===
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Skip description fields (handled by CKEditor)
    if (name.startsWith("description_")) {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // === Handle CKEditor Change ===
  const handleEditorChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // === Handle Logout ===
  const handleLogout = () => {
    localStorage.clear();
    navigate("/admin/login");
  };

  // === Filter Videos ===
  const filteredVideos = videos.filter((video) => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        video.description_uz?.toLowerCase().includes(searchLower) ||
        video.description_ru?.toLowerCase().includes(searchLower) ||
        video.description_en?.toLowerCase().includes(searchLower) ||
        video.description_turk?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  // === Format Date ===
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // === Get Display Description ===
  const getDisplayDescription = (video) => {
    // Return description based on selected language
    switch (selectedLanguage) {
      case "uz":
        return (
          video.description_uz ||
          video.description_ru ||
          video.description_en ||
          video.description_turk ||
          ""
        );
      case "ru":
        return (
          video.description_ru ||
          video.description_uz ||
          video.description_en ||
          video.description_turk ||
          ""
        );
      case "en":
        return (
          video.description_en ||
          video.description_uz ||
          video.description_ru ||
          video.description_turk ||
          ""
        );
      case "turk":
        return (
          video.description_turk ||
          video.description_uz ||
          video.description_ru ||
          video.description_en ||
          ""
        );
      default:
        return (
          video.description_uz ||
          video.description_ru ||
          video.description_en ||
          video.description_turk ||
          ""
        );
    }
  };

  // === Render Language Badges ===
  const renderLanguageBadges = (video) => {
    const badges = [];
    if (video.description_uz?.trim())
      badges.push({ key: "uz", label: "UZ", color: "blue" });
    if (video.description_ru?.trim())
      badges.push({ key: "ru", label: "RU", color: "green" });
    if (video.description_en?.trim())
      badges.push({ key: "en", label: "EN", color: "purple" });
    if (video.description_turk?.trim())
      badges.push({ key: "turk", label: "TR", color: "yellow" });

    return (
      <div className="flex flex-wrap gap-1">
        {badges.map((badge) => (
          <span
            key={badge.key}
            className={`text-xs font-medium px-2 py-1 rounded-full 
                            ${badge.color === "blue" ? "bg-blue-100 text-blue-700" : ""}
                            ${badge.color === "green" ? "bg-green-100 text-green-700" : ""}
                            ${badge.color === "purple" ? "bg-purple-100 text-purple-700" : ""}
                            ${badge.color === "yellow" ? "bg-yellow-100 text-yellow-700" : ""}
                        `}
          >
            {badge.label}
          </span>
        ))}
      </div>
    );
  };

  // === Render Description Inputs ===
  const renderDescriptionInputs = () => {
    const languageInputs = [
      { key: "uz", label: "O'zbekcha", placeholder: "O'zbekcha tavsif..." },
      { key: "ru", label: "Русский", placeholder: "Описание на русском..." },
      { key: "en", label: "English", placeholder: "Description in English..." },
      { key: "turk", label: "Türkçe", placeholder: "Türkçe açıklama..." },
    ];

    return (
      <div className="space-y-6">
        {languageInputs.map((lang) => (
          <div key={lang.key} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {lang.label} Description
              <span className="ml-1 text-xs text-gray-500">(Optional)</span>
            </label>
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <MyCkeditor
                id={`editor-youtube-${lang.key}-${editingId || "new"}`}
                value={formData[`description_${lang.key}`]}
                onChange={(value) =>
                  handleEditorChange(`description_${lang.key}`, value)
                }
                height={150}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>
                {formData[`description_${lang.key}`]?.replace(/<[^>]*>/g, "")
                  .length || 0}{" "}
                characters
              </span>
              <span>Rich text editor - supports formatting</span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-red-50">
      <ToastContainer position="top-right" autoClose={2000} />

      {/* === Mobile Menu Button === */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden fixed top-6 left-6 z-50 bg-gradient-to-r from-red-500 to-red-600 text-white p-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
      >
        ☰
      </button>

      {/* === Sidebar === */}
      <div
        className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 w-72 transition-transform duration-300 ease-in-out`}
      >
        <Sidebar onLogout={handleLogout} />
      </div>

      {/* === Overlay === */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* === Main Content === */}
      <main className="flex-1 p-4 lg:p-8  overflow-auto overflow-y-auto h-screen scroll-smooth">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-10">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
                Instagram Videos
              </h1>
              <p className="text-gray-600 mt-2">
                Manage embedded Instagram videos with descriptions
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mt-6 lg:mt-0">
              {/* Search */}
              <div className="relative">
                <Search
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Search video descriptions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent w-full sm:w-64"
                />
              </div>

              {/* Add New Button */}
              <button
                onClick={() => {
                  resetForm();
                  setIsModalOpen(true);
                }}
                className="flex items-center justify-center bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-5 py-3 rounded-xl hover:shadow-xl transition-all duration-300 shadow-lg"
              >
                <Plus size={22} className="mr-2" />
                Add New Video
              </button>
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex flex-col justify-center items-center h-96">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-500"></div>
              <p className="mt-4 text-gray-600">Loading Instagram videos...</p>
            </div>
          ) : (
            <>
              {/* Videos Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-10">
                {filteredVideos.map((video) => {
                  const displayDescription = getDisplayDescription(video);
                  const embedUrl = getInstagramEmbed(video.iframe);

                  return (
                    <div
                      key={video.id}
                      className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
                    >
                      {/* Video Preview */}
                      <div className="relative aspect-video overflow-hidden bg-black min-hscreen ">
                        {embedUrl ? (
                          <iframe
                            src={embedUrl}
                            className="w-full h-full"
                            frameBorder="0"
                            scrolling="no"
                            allow="autoplay; encrypted-media"
                            allowFullScreen
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center">
                            <YoutubeIcon
                              className="text-red-500 mb-2"
                              size={48}
                            />
                            <span className="text-gray-300 text-sm">
                              Video Preview Not Available
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        {/* Description Preview */}
                        <div className="mb-4">
                          <p className="text-gray-600 text-sm line-clamp-3 h-16">
                            {displayDescription || "No description provided"}
                          </p>
                        </div>

                        {/* Date */}
                        <div className="flex items-center text-gray-500 text-sm mb-6">
                          <Calendar size={14} className="mr-2" />
                          {formatDate(video.createdAt)}
                        </div>

                        {/* Actions */}
                        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEdit(video)}
                              className="flex items-center text-blue-600 hover:text-blue-800 font-medium group"
                            >
                              <Edit
                                size={18}
                                className="mr-2 group-hover:scale-110 transition-transform"
                              />
                              Edit
                            </button>
                            <button
                              onClick={() => handleCopyEmbedCode(video)}
                              className="flex items-center text-purple-600 hover:text-purple-800 font-medium group"
                            >
                              {copiedId === video.id ? (
                                <>
                                  <Check
                                    size={18}
                                    className="mr-2 group-hover:scale-110 transition-transform"
                                  />
                                  Copied
                                </>
                              ) : (
                                <>
                                  <Copy
                                    size={18}
                                    className="mr-2 group-hover:scale-110 transition-transform"
                                  />
                                  Copy Embed
                                </>
                              )}
                            </button>
                          </div>
                          <button
                            onClick={() => handleDelete(video.id)}
                            className="flex items-center text-red-600 hover:text-red-800 font-medium group"
                          >
                            <Trash2
                              size={18}
                              className="mr-2 group-hover:scale-110 transition-transform"
                            />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Empty State */}
              {filteredVideos.length === 0 && !loading && (
                <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
                  <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center mb-6">
                    <YoutubeIcon className="text-gray-400" size={48} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">
                    No Instagram videos found
                  </h3>
                  <p className="text-gray-600 max-w-md mx-auto mb-8">
                    {searchTerm
                      ? "No results found for your search. Try a different search term."
                      : "Get started by adding your first Instagram video embed."}
                  </p>
                  <button
                    onClick={() => {
                      resetForm();
                      setIsModalOpen(true);
                    }}
                    className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Plus size={20} className="inline mr-2" />
                    Add First Video
                  </button>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mt-8">
                  <div className="text-sm text-gray-700 mb-4 sm:mb-0">
                    Showing{" "}
                    <span className="font-bold text-red-600">
                      {filteredVideos.length}
                    </span>{" "}
                    of{" "}
                    <span className="font-bold text-gray-800">
                      {totalItems}
                    </span>{" "}
                    videos • Page{" "}
                    <span className="font-bold text-red-600">
                      {currentPage + 1}
                    </span>{" "}
                    of{" "}
                    <span className="font-bold text-gray-800">
                      {totalPages}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(0, prev - 1))
                      }
                      disabled={currentPage === 0}
                      className="flex items-center px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft size={18} className="mr-2" />
                      Previous
                    </button>
                    <div className="flex items-center space-x-1">
                      {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = idx;
                        } else if (currentPage < 3) {
                          pageNum = idx;
                        } else if (currentPage > totalPages - 4) {
                          pageNum = totalPages - 5 + idx;
                        } else {
                          pageNum = currentPage - 2 + idx;
                        }

                        return (
                          <button
                            key={idx}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`w-10 h-10 rounded-xl text-sm font-medium transition-colors
                                                            ${
                                                              currentPage ===
                                                              pageNum
                                                                ? "bg-red-500 text-white"
                                                                : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                                                            }`}
                          >
                            {pageNum + 1}
                          </button>
                        );
                      })}
                    </div>
                    <button
                      onClick={() =>
                        setCurrentPage((prev) =>
                          Math.min(totalPages - 1, prev + 1),
                        )
                      }
                      disabled={currentPage === totalPages - 1}
                      className="flex items-center px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                      <ChevronRight size={18} className="ml-2" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* === Modal === */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-gray-800">
                    {editingId ? "Edit Instagram Video" : "Add Instagram Video"}
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {editingId
                      ? "Update video embed and descriptions"
                      : "Add a new Instagram video embed with descriptions"}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors"
                >
                  <X size={28} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-8">
              {/* YouTube Embed Section */}
              <div className="mb-8">
                <label className="block text-lg font-semibold text-gray-800 mb-6">
                  Instagram Embed Code <span className="text-red-500">*</span>
                  <span className="block text-sm font-normal text-gray-500 mt-1">
                    Paste the embed iframe code from Instagram. Click "Share" →
                    "Embed" on Instagram to get the code.
                  </span>
                </label>

                {/* Iframe Input */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 flex items-center">
                      <Link size={16} className="mr-2 text-gray-500" />
                      Embed Iframe Code
                    </label>
                    <textarea
                      name="iframe"
                      value={formData.iframe}
                      onChange={handleIframeChange}
                      rows="6"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent font-mono text-sm resize-none"
                      placeholder='<iframe width="560" height="315" src="https://www.youtube.com/embed/VIDEO_ID" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
                      required
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{formData.iframe.length} characters</span>
                      <span>Make sure to include full iframe tag</span>
                    </div>
                  </div>

                  {/* Preview */}
                  {previewIframe && (
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 flex items-center">
                        <Eye size={16} className="mr-2 text-gray-500" />
                        Live Preview
                      </label>
                      <div className="border-2 border-gray-200 rounded-xl overflow-hidden">
                        <div
                          className="w-full aspect-video bg-gray-100 flex items-center justify-center"
                          dangerouslySetInnerHTML={{ __html: previewIframe }}
                        />
                      </div>
                      <p className="text-xs text-gray-500">
                        Preview may not show all YouTube features due to
                        security restrictions
                      </p>
                    </div>
                  )}
                </div>

                {/* Quick Help */}
                <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <h4 className="font-medium text-blue-800 mb-2 flex items-center">
                    <YoutubeIcon size={16} className="mr-2" />
                    How to get YouTube embed code:
                  </h4>
                  <ol className="list-decimal list-inside text-sm text-blue-700 space-y-1">
                    <li>Go to YouTube video you want to embed</li>
                    <li>
                      Click the <strong>"Share"</strong> button below the video
                    </li>
                    <li>
                      Select <strong>"Embed"</strong> from the options
                    </li>
                    <li>Copy the entire iframe code provided</li>
                    <li>Paste it in the field above</li>
                  </ol>
                </div>
              </div>

              {/* Descriptions Section */}
              <div className="mb-10">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">
                      Video Descriptions
                    </h3>
                    <p className="text-gray-600 mt-1">
                      Add descriptions in 4 different languages (optional)
                    </p>
                  </div>
                  <div className="flex items-center text-gray-500">
                    <Globe size={20} className="mr-2" />
                    <span className="text-sm">Multi-language Support</span>
                  </div>
                </div>
                {renderDescriptionInputs()}
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end space-x-4 pt-8 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="px-8 py-3.5 border-2 border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-8 py-3.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {editingId ? "Update Video" : "Add Video"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminYoutube;
