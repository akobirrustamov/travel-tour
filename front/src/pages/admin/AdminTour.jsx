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
  Image as ImageIcon,
  Upload,
  X,
  Search,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Globe,
  Calendar,
  DollarSign,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  Filter,
  SortAsc,
  Clock,
  Briefcase,
  Users,
} from "lucide-react";
import MyCkeditor from "../../components/MyCkeditor.jsx";

function AdminTour() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [uploading, setUploading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("uz");
  const [statusFilter, setStatusFilter] = useState("all");
  const [cityInput, setCityInput] = useState({
    uz: "",
    ru: "",
    en: "",
    turk: "",
  });
  const [imagePreviews, setImagePreviews] = useState([]);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title_uz: "",
    title_ru: "",
    title_en: "",
    title_turk: "",
    startDate: "",
    endDate: "",
    price: "",
    currency: "USD",
    cities_uz: [],
    cities_ru: [],
    cities_en: [],
    cities_turk: [],
    description_uz: "",
    description_ru: "",
    description_en: "",
    description_turk: "",
    itineraryDetails: "",
    imageIds: [],
    active: true,
  });

  // === Проверка токена ===
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token || isTokenExpired(token)) {
      localStorage.clear();
      navigate("/admin/login");
    } else {
      fetchTours();
    }
  }, [navigate, currentPage, statusFilter]);

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

  // === Fetch Tours with Pagination ===
  const fetchTours = async () => {
    try {
      setLoading(true);
      const res = await requestWithRefresh(
        `/api/v1/travel-tours/page?page=${currentPage}&size=12`,
      );
      if (res && !res.error) {
        let filteredTours = res.data.content || [];

        // Apply status filter
        if (statusFilter === "active") {
          filteredTours = filteredTours.filter((t) => t.active);
        } else if (statusFilter === "inactive") {
          filteredTours = filteredTours.filter((t) => !t.active);
        }

        setTours(filteredTours);
        setTotalPages(res.data.totalPages || 0);
        setTotalItems(res.data.totalElements || 0);
      } else {
        toast.error("Failed to fetch travel tours");
      }
    } catch (error) {
      toast.error("Error loading travel tours");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // === Handle Image Upload ===
  const handleImageUpload = async (files) => {
    if (!files || files.length === 0) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    const maxSize = 10 * 1024 * 1024; // 5MB

    try {
      setUploading(true);

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        if (!allowedTypes.includes(file.type)) {
          toast.error(`${file.name} is not an allowed image format`);
          continue;
        }

        if (file.size > maxSize) {
          toast.error(`${file.name} exceeds 5MB limit`);
          continue;
        }

        const uploadFormData = new FormData();
        uploadFormData.append("photo", file);
        uploadFormData.append("prefix", "tours");

        const res = await requestWithRefresh(
          "/api/v1/file/upload",
          "POST",
          uploadFormData,
          null,
          true,
        );

        if (res && !res.error) {
          const previewUrl = URL.createObjectURL(file);
          setImagePreviews((prev) => [
            ...prev,
            {
              url: previewUrl,
              id: res.data,
              isNewUpload: true,
              name: file.name,
            },
          ]);
          setFormData((prev) => ({
            ...prev,
            imageIds: [...prev.imageIds, res.data],
          }));
        }
      }

      if (files.length > 0) {
        toast.success(`${files.length} image(s) uploaded successfully`);
      }
    } catch (error) {
      toast.error("Error uploading images");
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  // === Handle Remove Image ===
  const handleRemoveImage = (index, imageId) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setFormData((prev) => ({
      ...prev,
      imageIds: prev.imageIds.filter((id) => id !== imageId),
    }));
  };

  // === Handle Add City ===
  const handleAddCity = (lang) => {
    const value = cityInput[lang]?.trim();
    if (!value) return;

    const field = `cities_${lang}`;

    setFormData((prev) => {
      if (prev[field]?.includes(value)) return prev;

      return {
        ...prev,
        [field]: [...(prev[field] || []), value],
      };
    });

    setCityInput((prev) => ({
      ...prev,
      [lang]: "",
    }));
  };
  const handleRemoveCity = (lang, city) => {
    const field = `cities_${lang}`;

    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((c) => c !== city),
    }));
  };

  // === Handle Create/Update ===
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.title_uz.trim()) {
      toast.error("Please enter tour title in Uzbek");
      return;
    }

    if (!formData.startDate) {
      toast.error("Please select start date");
      return;
    }

    if (!formData.endDate) {
      toast.error("Please select end date");
      return;
    }

    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      toast.error("End date must be after start date");
      return;
    }

    if (!formData.price) {
      toast.error("Please enter tour price");
      return;
    }

    if (formData.cities_uz.length === 0) {
      toast.error("Please add at least one city");
      return;
    }

    console.log(formData);
    try {
      const url = editingId
        ? `/api/v1/travel-tours/${editingId}`
        : "/api/v1/travel-tours";
      const method = editingId ? "PUT" : "POST";

      const res = await requestWithRefresh(url, method, formData);

      if (res && !res.error) {
        toast.success(`Tour ${editingId ? "updated" : "created"} successfully`);
        resetForm();
        setIsModalOpen(false);
        fetchTours();
      } else {
        toast.error(`Failed to ${editingId ? "update" : "create"} tour`);
      }
    } catch (error) {
      toast.error("Error saving tour");
      console.error(error);
    }
  };

  // === Handle Delete ===
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this travel tour?"))
      return;

    try {
      const res = await requestWithRefresh(
        `/api/v1/travel-tours/${id}`,
        "DELETE",
      );
      if (res && !res.error) {
        toast.success("Tour deleted successfully");
        fetchTours();
      } else {
        toast.error("Failed to delete tour");
      }
    } catch (error) {
      toast.error("Error deleting tour");
      console.error(error);
    }
  };

  // === Handle Edit ===
  const handleEdit = async (tour) => {
    setEditingId(tour.id);
    setFormData({
      title_uz: tour.title_uz || "",
      title_ru: tour.title_ru || "",
      title_en: tour.title_en || "",
      title_turk: tour.title_turk || "",
      startDate: tour.startDate || "",
      endDate: tour.endDate || "",
      price: tour.price || "",
      currency: tour.currency || "USD",
      cities_uz: tour.cities_uz || [],
      cities_ru: tour.cities_ru || [],
      cities_en: tour.cities_en || [],
      cities_turk: tour.cities_turk || [],
      description_uz: tour.description_uz || "",
      description_ru: tour.description_ru || "",
      description_en: tour.description_en || "",
      description_turk: tour.description_turk || "",
      itineraryDetails: tour.itineraryDetails || "",
      imageIds: tour.images?.map((img) => img.id) || [],
      active: tour.active !== undefined ? tour.active : true,
    });

    // Set image previews
    if (tour.images && tour.images.length > 0) {
      const previews = tour.images.map((img) => ({
        url: `${baseUrl}/api/v1/file/getFile/${img.id}`,
        id: img.id,
        isNewUpload: false,
        name: img.name || "Tour image",
      }));
      setImagePreviews(previews);
    } else {
      setImagePreviews([]);
    }

    setIsModalOpen(true);
  };

  // === Handle Toggle Active Status ===
  const handleToggleActive = async (tour) => {
    try {
      const updatedData = {
        ...tour,
        active: !tour.active,
        imageIds: tour.images?.map((img) => img.id) || [],
      };

      const res = await requestWithRefresh(
        `/api/v1/travel-tours/${tour.id}`,
        "PUT",
        updatedData,
      );

      if (res && !res.error) {
        toast.success(
          `Tour ${!tour.active ? "activated" : "deactivated"} successfully`,
        );
        fetchTours();
      } else {
        toast.error("Failed to update tour status");
      }
    } catch (error) {
      toast.error("Error updating tour status");
      console.error(error);
    }
  };

  // === Reset Form ===
  const resetForm = () => {
    setFormData({
      title_uz: "",
      title_ru: "",
      title_en: "",
      title_turk: "",
      startDate: "",
      endDate: "",
      price: "",
      currency: "USD",
      cities_uz: [],
      cities_ru: [],
      cities_en: [],
      cities_turk: [],
      description_uz: "",
      description_ru: "",
      description_en: "",
      description_turk: "",
      itineraryDetails: "",
      imageIds: [],
      active: true,
    });
    setImagePreviews([]);
    setCityInput("");
    setEditingId(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // === Handle Input Change ===
  const handleInputChange = (e) => {
    const { name, value, type } = e.target;

    if (name.startsWith("description_") || name === "itineraryDetails") {
      return; // Handled by CKEditor
    }

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? e.target.checked
          : type === "number"
            ? parseFloat(value) || 0
            : value,
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

  // === Filter Tours ===
  const filteredTours = tours.filter((tour) => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        tour.title_uz?.toLowerCase().includes(searchLower) ||
        tour.title_ru?.toLowerCase().includes(searchLower) ||
        tour.title_en?.toLowerCase().includes(searchLower) ||
        tour.title_turk?.toLowerCase().includes(searchLower) ||
        tour.cities?.some((city) => city.toLowerCase().includes(searchLower))
      );
    }
    return true;
  });

  // === Get Display Title ===
  const getDisplayTitle = (tour) => {
    switch (selectedLanguage) {
      case "uz":
        return (
          tour.title_uz ||
          tour.title_ru ||
          tour.title_en ||
          tour.title_turk ||
          "No title"
        );
      case "ru":
        return (
          tour.title_ru ||
          tour.title_uz ||
          tour.title_en ||
          tour.title_turk ||
          "No title"
        );
      case "en":
        return (
          tour.title_en ||
          tour.title_uz ||
          tour.title_ru ||
          tour.title_turk ||
          "No title"
        );
      case "turk":
        return (
          tour.title_turk ||
          tour.title_uz ||
          tour.title_ru ||
          tour.title_en ||
          "No title"
        );
      default:
        return (
          tour.title_uz ||
          tour.title_ru ||
          tour.title_en ||
          tour.title_turk ||
          "No title"
        );
    }
  };

  // === Get Display Description ===
  const getDisplayDescription = (tour) => {
    switch (selectedLanguage) {
      case "uz":
        return (
          tour.description_uz ||
          tour.description_ru ||
          tour.description_en ||
          tour.description_turk ||
          ""
        );
      case "ru":
        return (
          tour.description_ru ||
          tour.description_uz ||
          tour.description_en ||
          tour.description_turk ||
          ""
        );
      case "en":
        return (
          tour.description_en ||
          tour.description_uz ||
          tour.description_ru ||
          tour.description_turk ||
          ""
        );
      case "turk":
        return (
          tour.description_turk ||
          tour.description_uz ||
          tour.description_ru ||
          tour.description_en ||
          ""
        );
      default:
        return (
          tour.description_uz ||
          tour.description_ru ||
          tour.description_en ||
          tour.description_turk ||
          ""
        );
    }
  };

  // === Format Date ===
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // === Calculate Duration ===
  const calculateDuration = (start, end) => {
    if (!start || !end) return 0;
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // === Render Language Badges ===
  const renderLanguageBadges = (tour) => {
    const badges = [];
    if (tour.title_uz?.trim())
      badges.push({ key: "uz", label: "UZ", color: "blue" });
    if (tour.title_ru?.trim())
      badges.push({ key: "ru", label: "RU", color: "green" });
    if (tour.title_en?.trim())
      badges.push({ key: "en", label: "EN", color: "purple" });
    if (tour.title_turk?.trim())
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

  // === Render Title Inputs ===
  const renderTitleInputs = () => {
    const titleInputs = [
      {
        key: "uz",
        label: "O'zbekcha",
        placeholder: "Sayoxat nomi",
        required: true,
      },
      {
        key: "ru",
        label: "Русский",
        placeholder: "Название тура",
        required: false,
      },
      {
        key: "en",
        label: "English",
        placeholder: "Tour title",
        required: false,
      },
      {
        key: "turk",
        label: "Türkçe",
        placeholder: "Tur başlığı",
        required: false,
      },
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {titleInputs.map((lang) => (
          <div key={lang.key} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {lang.label} Title{" "}
              {lang.required && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              name={`title_${lang.key}`}
              value={formData[`title_${lang.key}`]}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={lang.placeholder}
              required={lang.required}
            />
          </div>
        ))}
      </div>
    );
  };

  // === Render Description Inputs ===
  const renderDescriptionInputs = () => {
    const descriptionInputs = [
      { key: "uz", label: "O'zbekcha" },
      { key: "ru", label: "Русский" },
      { key: "en", label: "English" },
      { key: "turk", label: "Türkçe" },
    ];

    return (
      <div className="space-y-6">
        {descriptionInputs.map((lang) => (
          <div key={lang.key} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {lang.label} Description
            </label>
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <MyCkeditor
                id={`editor-tour-desc-${lang.key}-${editingId || "new"}`}
                value={formData[`description_${lang.key}`]}
                onChange={(value) =>
                  handleEditorChange(`description_${lang.key}`, value)
                }
                height={200}
              />
            </div>
          </div>
        ))}
      </div>
    );
  };

  // === Render Itinerary Editor ===
  const renderItineraryEditor = () => {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Itinerary Details
          <span className="ml-1 text-xs text-gray-500">
            (Day-by-day tour plan)
          </span>
        </label>
        <div className="border border-gray-300 rounded-lg overflow-hidden">
          <MyCkeditor
            id={`editor-itinerary-${editingId || "new"}`}
            value={formData.itineraryDetails}
            onChange={(value) => handleEditorChange("itineraryDetails", value)}
            height={250}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50">
      <ToastContainer position="top-right" autoClose={2000} />

      {/* === Mobile Menu Button === */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden fixed top-6 left-6 z-50 bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
      >
        ☰
      </button>

      {/* === Sidebar === */}
      <div
        className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"}  lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 w-72 transition-transform duration-300 ease-in-out`}
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
      <main className="flex-1 p-4 lg:p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-10">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Travel Tours
              </h1>
              <p className="text-gray-600 mt-2">
                Manage your travel tours with multi-language support
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
                  placeholder="Search tours..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent w-full sm:w-64"
                />
              </div>

              {/* Add New Button */}
              <button
                onClick={() => {
                  resetForm();
                  setIsModalOpen(true);
                }}
                className="flex items-center justify-center bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-5 py-3 rounded-xl hover:shadow-xl transition-all duration-300 shadow-lg"
              >
                <Plus size={22} className="mr-2" />
                Add New Tour
              </button>
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex flex-col justify-center items-center h-96">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-emerald-500"></div>
              <p className="mt-4 text-gray-600">Loading travel tours...</p>
            </div>
          ) : (
            <>
              {/* Tours Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 mb-10">
                {filteredTours.map((tour) => {
                  const displayTitle = getDisplayTitle(tour);
                  const displayDescription = getDisplayDescription(tour);
                  const duration = calculateDuration(
                    tour.startDate,
                    tour.endDate,
                  );
                  const thumbnail =
                    tour.images && tour.images.length > 0
                      ? `${baseUrl}/api/v1/file/getFile/${tour.images[0].id}`
                      : null;

                  return (
                    <div
                      key={tour.id}
                      className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
                    >
                      {/* Image */}
                      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                        {thumbnail ? (
                          <img
                            src={thumbnail}
                            alt={displayTitle}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            onError={(e) => {
                              e.target.src =
                                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='16' fill='%239ca3af' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E";
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center p-4">
                            <ImageIcon
                              className="text-gray-400 mb-2"
                              size={48}
                            />
                            <span className="text-gray-500 text-sm">
                              No image
                            </span>
                          </div>
                        )}
                        <div className="absolute top-3 right-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md">
                          #{tour.id}
                        </div>
                        <div className="absolute bottom-3 left-3">
                          {renderLanguageBadges(tour)}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5">
                        {/* Title and Status */}
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="font-bold text-lg text-gray-800 truncate max-w-[180px]">
                            {displayTitle}
                          </h3>
                          <button
                            onClick={() => handleToggleActive(tour)}
                            className={`p-2 rounded-full transition-colors ${
                              tour.active
                                ? "bg-green-100 text-green-600 hover:bg-green-200"
                                : "bg-red-100 text-red-600 hover:bg-red-200"
                            }`}
                          >
                            {tour.active ? (
                              <Eye size={16} />
                            ) : (
                              <EyeOff size={16} />
                            )}
                          </button>
                        </div>

                        {/* Cities */}
                        <div className="flex items-start mb-3">
                          <MapPin
                            size={14}
                            className="mr-1 text-gray-500 mt-0.5"
                          />
                          <p className="text-sm text-gray-600 truncate">
                            {tour[`cities_${selectedLanguage}`]?.join(" • ")}
                          </p>
                        </div>

                        {/* Dates and Duration */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar size={14} className="mr-1" />
                            {formatDate(tour.startDate)}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock size={14} className="mr-1" />
                            {duration} days
                          </div>
                        </div>

                        {/* Price */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                            <DollarSign
                              size={16}
                              className="text-emerald-600"
                            />
                            <span className="text-lg font-bold text-gray-800">
                              {tour.price?.toLocaleString()}
                            </span>
                            <span className="text-sm text-gray-500 ml-1">
                              {tour.currency}
                            </span>
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <ImageIcon size={14} className="mr-1" />
                            {tour.images?.length || 0}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                          <button
                            onClick={() => handleEdit(tour)}
                            className="flex items-center text-blue-600 hover:text-blue-800 font-medium group"
                          >
                            <Edit
                              size={18}
                              className="mr-2 group-hover:scale-110 transition-transform"
                            />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(tour.id)}
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
              {filteredTours.length === 0 && !loading && (
                <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
                  <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center mb-6">
                    <Briefcase className="text-gray-400" size={48} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">
                    No travel tours found
                  </h3>
                  <p className="text-gray-600 max-w-md mx-auto mb-8">
                    {searchTerm || statusFilter !== "all"
                      ? "No results found for your filter. Try changing your search or filter criteria."
                      : "Get started by creating your first travel tour."}
                  </p>
                  <button
                    onClick={() => {
                      resetForm();
                      setIsModalOpen(true);
                    }}
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Plus size={20} className="inline mr-2" />
                    Create First Tour
                  </button>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mt-8">
                  <div className="text-sm text-gray-700 mb-4 sm:mb-0">
                    Showing{" "}
                    <span className="font-bold text-emerald-600">
                      {filteredTours.length}
                    </span>{" "}
                    of{" "}
                    <span className="font-bold text-gray-800">
                      {totalItems}
                    </span>{" "}
                    tours • Page{" "}
                    <span className="font-bold text-emerald-600">
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
                                                                ? "bg-emerald-500 text-white"
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
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-gray-800">
                    {editingId ? "Edit Travel Tour" : "Create New Travel Tour"}
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {editingId
                      ? "Update tour information and details"
                      : "Add a new travel tour with multi-language support"}
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
            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              {/* Titles in 4 Languages */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-800">
                    Tour Titles
                  </h3>
                  <div className="flex items-center text-gray-500">
                    <Globe size={20} className="mr-2" />
                    <span className="text-sm">Multi-language Support</span>
                  </div>
                </div>
                {renderTitleInputs()}
              </div>

              {/* Tour Information */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-800">
                  Tour Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Start Date */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Start Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {/* End Date */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      End Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      min={formData.startDate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Price */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Price <span className="text-red-500">*</span>
                    </label>
                    <div className="flex">
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="0.00"
                        required
                      />
                      <select
                        name="currency"
                        value={formData.currency}
                        onChange={handleInputChange}
                        className="px-3 py-2 border border-l-0 border-gray-300 rounded-r-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      >
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="UZS">UZS</option>
                        <option value="RUB">RUB</option>
                      </select>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Status
                    </label>
                    <div className="flex items-center h-10">
                      <input
                        type="checkbox"
                        name="active"
                        checked={formData.active}
                        onChange={handleInputChange}
                        className="h-5 w-5 text-emerald-600 rounded focus:ring-emerald-500"
                        id="active-checkbox"
                      />
                      <label
                        htmlFor="active-checkbox"
                        className="ml-2 text-gray-700"
                      >
                        Active Tour
                      </label>
                    </div>
                    <p className="text-xs text-gray-500">
                      Inactive tours won't be shown on website
                    </p>
                  </div>
                </div>
              </div>

              {/* Cities */}
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-800">Tour Cities</h3>

                {["uz", "ru", "en", "turk"].map((lang) => (
                  <div
                    key={lang}
                    className="space-y-3 border p-4 rounded-xl bg-gray-50"
                  >
                    {/* Title */}
                    <h4 className="font-semibold text-gray-700">
                      Cities ({lang.toUpperCase()})
                    </h4>

                    {/* Input */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={cityInput[lang] || ""}
                        onChange={(e) =>
                          setCityInput((prev) => ({
                            ...prev,
                            [lang]: e.target.value,
                          }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddCity(lang);
                          }
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder={`Enter city (${lang.toUpperCase()})`}
                      />

                      <button
                        type="button"
                        onClick={() => handleAddCity(lang)}
                        className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                      >
                        Add
                      </button>
                    </div>

                    {/* Cities List */}
                    <div className="flex flex-wrap gap-2">
                      {formData[`cities_${lang}`]?.map((city, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm"
                        >
                          <MapPin size={12} className="mr-1" />
                          {city}
                          <button
                            type="button"
                            onClick={() => handleRemoveCity(lang, city)}
                            className="ml-2 text-emerald-700 hover:text-red-600"
                          >
                            <X size={14} />
                          </button>
                        </span>
                      ))}

                      {formData[`cities_${lang}`]?.length === 0 && (
                        <p className="text-sm text-gray-500">No cities added</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {/* Images */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-800">Tour Images</h3>
                <div>
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">
                      Recommended: 1200x800px, max 5MB per image (JPEG, PNG,
                      WebP)
                    </p>

                    {/* Image Previews */}
                    {imagePreviews.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-4">
                        {imagePreviews.map((preview, index) => (
                          <div key={index} className="relative group">
                            <div className="aspect-square rounded-xl overflow-hidden border-2 border-gray-200">
                              <img
                                src={preview.url}
                                alt={`Tour ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                handleRemoveImage(index, preview.id)
                              }
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Upload Button */}
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/50 transition-all duration-300"
                    >
                      <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-r from-emerald-100 to-teal-100 flex items-center justify-center mb-2">
                        <Upload className="text-emerald-500" size={24} />
                      </div>
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        Click to upload images
                      </p>
                      <p className="text-xs text-gray-500">
                        Select multiple images or drag and drop
                      </p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) =>
                          handleImageUpload(Array.from(e.target.files))
                        }
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Descriptions */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-800">
                  Tour Descriptions
                </h3>
                {renderDescriptionInputs()}
              </div>

              {/* Itinerary */}
              {/*<div className="space-y-4">*/}
              {/*    <h3 className="text-xl font-bold text-gray-800">Tour Itinerary</h3>*/}
              {/*    {renderItineraryEditor()}*/}
              {/*</div>*/}

              {/* Form Actions */}
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
                  disabled={uploading}
                  className="px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? (
                    <span className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-3"></div>
                      Uploading...
                    </span>
                  ) : editingId ? (
                    "Update Tour"
                  ) : (
                    "Create Tour"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminTour;
