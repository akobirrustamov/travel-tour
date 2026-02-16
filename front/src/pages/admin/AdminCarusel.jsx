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
    Eye,
    EyeOff
} from "lucide-react";

function AdminCarusel() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [carusels, setCarusels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [uploading, setUploading] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        mediaId: null,
        title_uz: "",
        title_ru: "",
        title_en: "",
        title_turk: "",
        description_uz: "",
        description_ru: "",
        description_en: "",
        description_turk: ""
    });

    // === Проверка токена ===
    useEffect(() => {
        const token = localStorage.getItem("access_token");
        if (!token || isTokenExpired(token)) {
            localStorage.clear();
            navigate("/admin/login");
        } else {
            fetchCarusels();
        }
    }, [navigate, currentPage]);

    // === Request with Refresh Token ===
    const requestWithRefresh = async (url, method = "GET", data = null, params = null) => {
        let res = await ApiCall(url, method, data, params);
        if (res && res.error && (res.data === 401 || res.data === 403)) {
            const refreshRes = await ApiCall(
                "/api/auth/refresh",
                "POST",
                null,
                null,
                false,
                true
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

    // === Fetch Carusels ===
    const fetchCarusels = async () => {
        try {
            setLoading(true);
            const res = await requestWithRefresh(`/api/v1/carousel/page?page=${currentPage}&size=20`);
            if (res && !res.error) {
                setCarusels(res.data.content || []);
                setTotalPages(res.data.totalPages || 0);
            } else {
                toast.error("Failed to fetch carusels");
            }
        } catch (error) {
            toast.error("Error loading carusels");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // === Handle File Upload ===
    const handleFileUpload = async (file) => {
        if (!file) return;

        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
        const maxSize = 5 * 1024 * 1024; // 5MB

        if (!allowedTypes.includes(file.type)) {
            toast.error("Only image files are allowed (JPEG, PNG, JPG, GIF, WebP)");
            return;
        }

        if (file.size > maxSize) {
            toast.error("File size must be less than 5MB");
            return;
        }

        try {
            setUploading(true);
            const uploadFormData = new FormData();
            uploadFormData.append("photo", file);
            uploadFormData.append("prefix", "carusel");

            const res = await requestWithRefresh("/api/v1/file/upload", "POST", uploadFormData, null, true);

            if (res && !res.error) {
                // Create a local URL for preview
                const previewUrl = URL.createObjectURL(file);
                setImagePreview({
                    url: previewUrl,
                    file: file,
                    isNewUpload: true
                });

                setFormData(prev => ({ ...prev, mediaId: res.data }));
                toast.success("Image uploaded successfully");
            } else {
                toast.error("Failed to upload image");
            }
        } catch (error) {
            toast.error("Error uploading image");
            console.error(error);
        } finally {
            setUploading(false);
        }
    };

    // === Handle Create/Update ===
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.mediaId && !editingId) {
            toast.error("Please upload an image first");
            return;
        }

        try {
            const url = editingId ? `/api/v1/carousel/${editingId}` : "/api/v1/carousel";
            const method = editingId ? "PUT" : "POST";

            const res = await requestWithRefresh(url, method, formData);

            if (res && !res.error) {
                toast.success(`Carusel ${editingId ? 'updated' : 'created'} successfully`);
                resetForm();
                setIsModalOpen(false);
                fetchCarusels();
            } else {
                toast.error(`Failed to ${editingId ? 'update' : 'create'} carusel`);
            }
        } catch (error) {
            toast.error("Error saving carusel");
            console.error(error);
        }
    };

    // === Handle Delete ===
    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this carusel?")) return;

        try {
            const res = await requestWithRefresh(`/api/v1/carousel/${id}`, "DELETE");
            if (res && !res.error) {
                toast.success("Carusel deleted successfully");
                await fetchCarusels();
            } else {
                toast.error("Failed to delete carusel");
            }
        } catch (error) {
            toast.error("Error deleting carusel");
            console.error(error);
        }
    };

    // === Handle Edit ===
    const handleEdit = async (carusel) => {
        setEditingId(carusel.id);
        setFormData({
            mediaId: carusel.media?.id || null,
            title_uz: carusel.title_uz || "",
            title_ru: carusel.title_ru || "",
            title_en: carusel.title_en || "",
            title_turk: carusel.title_turk || "",
            description_uz: carusel.description_uz || "",
            description_ru: carusel.description_ru || "",
            description_en: carusel.description_en || "",
            description_turk: carusel.description_turk || ""
        });

        // Set image preview for edit mode
        if (carusel.media) {
            // Use the existing server URL for preview
            setImagePreview({
                url: `${baseUrl}/api/v1/file/getFile/${carusel.media.id}`,
                file: null,
                isNewUpload: false,
                existingMediaId: carusel.media.id
            });
        } else {
            setImagePreview(null);
        }

        setIsModalOpen(true);
    };

    // === Handle Remove Image ===
    const handleRemoveImage = () => {
        setImagePreview(null);
        setFormData(prev => ({ ...prev, mediaId: null }));
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    // === Reset Form ===
    const resetForm = () => {
        setFormData({
            mediaId: null,
            title_uz: "",
            title_ru: "",
            title_en: "",
            title_turk: "",
            description_uz: "",
            description_ru: "",
            description_en: "",
            description_turk: ""
        });
        setImagePreview(null);
        setEditingId(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    // === Handle Input Change ===
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // === Handle Logout ===
    const handleLogout = () => {
        localStorage.clear();
        navigate("/admin/login");
    };

    // === Filter Carusels ===
    const filteredCarusels = carusels.filter(carusel =>
        carusel.title_uz?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        carusel.title_ru?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        carusel.title_en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        carusel.title_turk?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // === Get Image URL ===
    const getImageUrl = (carusel) => {
        if (carusel.media && carusel.media.id) {
            return `${baseUrl}/api/v1/file/getFile/${carusel.media.id}`;
        }
        return null;
    };

    // === Render Language Tabs ===
    const renderLanguageTabs = (type = "title") => {
        const languages = [
            { key: "uz", label: "O'zbekcha" },
            { key: "ru", label: "Русский" },
            { key: "en", label: "English" },
            { key: "turk", label: "Türkçe" }
        ];

        return (
            <div className="mb-6">
                <div className="flex border-b border-gray-200">
                    {languages.map((lang) => (
                        <div key={lang.key} className="mr-4 pb-2">
                            <span className={`text-sm font-medium ${formData[`${type}_${lang.key}`] ? 'text-blue-600' : 'text-gray-500'}`}>
                                {lang.label}
                            </span>
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                    {languages.map((lang) => (
                        <div key={lang.key}>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {lang.label} {type === "title" ? "Title" : "Description"}
                            </label>
                            {type === "title" ? (
                                <input
                                    type="text"
                                    name={`${type}_${lang.key}`}
                                    value={formData[`${type}_${lang.key}`]}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder={`Enter ${lang.label} title`}
                                />
                            ) : (
                                <textarea
                                    name={`${type}_${lang.key}`}
                                    value={formData[`${type}_${lang.key}`]}
                                    onChange={handleInputChange}
                                    rows="3"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder={`Enter ${lang.label} description`}
                                />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <ToastContainer position="top-right" autoClose={2000} />

            {/* === Mobile Menu Button === */}
            <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden fixed top-6 left-6 z-50 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
                ☰
            </button>

            {/* === Sidebar === */}
            <div className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 w-72 transition-transform duration-300 ease-in-out`}>
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
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-10">
                        <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                Carousel Management
                            </h1>
                            <p className="text-gray-600 mt-2">Manage your website carousel slides</p>
                        </div>

                        <div className="flex items-center space-x-4 mt-4 md:mt-0">
                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search carousels..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                                />
                            </div>

                            {/* Add New Button */}
                            <button
                                onClick={() => {
                                    resetForm();
                                    setIsModalOpen(true);
                                }}
                                className="flex items-center bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-5 py-3 rounded-xl hover:shadow-xl transition-all duration-300 shadow-lg"
                            >
                                <Plus size={22} className="mr-2" />
                                Add New Slide
                            </button>
                        </div>
                    </div>



                    {/* Loading State */}
                    {loading ? (
                        <div className="flex flex-col justify-center items-center h-96">
                            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
                            <p className="mt-4 text-gray-600">Loading carousel slides...</p>
                        </div>
                    ) : (
                        <>
                            {/* Carousel Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 mb-10">
                                {filteredCarusels.map((carusel) => {
                                    const imageUrl = getImageUrl(carusel);
                                    return (
                                        <div key={carusel.id} className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                                            {/* Image */}
                                            <div className="relative h-56 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                                                {imageUrl ? (
                                                    <img
                                                        src={imageUrl}
                                                        alt={carusel.title_uz || "Carousel slide"}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                        onError={(e) => {
                                                            e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='16' fill='%239ca3af' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E";
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex flex-col items-center justify-center p-4">
                                                        <ImageIcon className="text-gray-400 mb-2" size={48} />
                                                        <span className="text-gray-500 text-sm">No image</span>
                                                    </div>
                                                )}
                                                <div className="absolute top-3 right-3 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md">
                                                    ID: {carusel.id}
                                                </div>
                                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                                                    <h3 className="text-white font-bold text-lg truncate">
                                                        {carusel.title_uz || "Untitled"}
                                                    </h3>
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div className="p-5">
                                                <p className="text-gray-600 text-sm mb-4 line-clamp-2 h-12">
                                                    {carusel.description_uz || "No description provided"}
                                                </p>

                                                {/* Language Badges */}
                                                <div className="flex flex-wrap gap-2 mb-6">
                                                    {carusel.title_uz && (
                                                        <span className="bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-full border border-blue-200">
                                                            UZ
                                                        </span>
                                                    )}
                                                    {carusel.title_ru && (
                                                        <span className="bg-gradient-to-r from-green-100 to-green-50 text-green-700 text-xs font-medium px-3 py-1.5 rounded-full border border-green-200">
                                                            RU
                                                        </span>
                                                    )}
                                                    {carusel.title_en && (
                                                        <span className="bg-gradient-to-r from-purple-100 to-purple-50 text-purple-700 text-xs font-medium px-3 py-1.5 rounded-full border border-purple-200">
                                                            EN
                                                        </span>
                                                    )}
                                                    {carusel.title_turk && (
                                                        <span className="bg-gradient-to-r from-yellow-100 to-yellow-50 text-yellow-700 text-xs font-medium px-3 py-1.5 rounded-full border border-yellow-200">
                                                            TR
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Actions */}
                                                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                                                    <button
                                                        onClick={() => handleEdit(carusel)}
                                                        className="flex items-center text-blue-600 hover:text-blue-800 font-medium group"
                                                    >
                                                        <Edit size={18} className="mr-2 group-hover:scale-110 transition-transform" />
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(carusel.id)}
                                                        className="flex items-center text-red-600 hover:text-red-800 font-medium group"
                                                    >
                                                        <Trash2 size={18} className="mr-2 group-hover:scale-110 transition-transform" />
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Empty State */}
                            {filteredCarusels.length === 0 && !loading && (
                                <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
                                    <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center mb-6">
                                        <ImageIcon className="text-gray-400" size={48} />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-800 mb-3">No carousel slides found</h3>
                                    <p className="text-gray-600 max-w-md mx-auto mb-8">
                                        {searchTerm ? "No results found for your search. Try a different term." : "Get started by creating your first carousel slide."}
                                    </p>
                                    <button
                                        onClick={() => {
                                            resetForm();
                                            setIsModalOpen(true);
                                        }}
                                        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                                    >
                                        <Plus size={20} className="inline mr-2" />
                                        Create First Slide
                                    </button>
                                </div>
                            )}

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mt-8">
                                    <div className="text-sm text-gray-700">
                                        Showing page <span className="font-bold text-blue-600">{currentPage + 1}</span> of{" "}
                                        <span className="font-bold text-gray-800">{totalPages}</span>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                                            disabled={currentPage === 0}
                                            className="flex items-center px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <ChevronLeft size={18} className="mr-2" />
                                            Previous
                                        </button>
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
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
                                        {editingId ? "Edit Carousel Slide" : "Create New Slide"}
                                    </h2>
                                    <p className="text-gray-600 mt-1">
                                        {editingId ? "Update your carousel slide details" : "Add a new slide to your carousel"}
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
                            {/* File Upload Section */}
                            <div className="mb-10">
                                <label className="block text-lg font-semibold text-gray-800 mb-6">
                                    Carousel Image <span className="text-red-500">*</span>
                                    <span className="block text-sm font-normal text-gray-500 mt-1">
                                        Recommended: 1920x1080px, max 5MB (JPEG, PNG, WebP, GIF)
                                    </span>
                                </label>

                                {imagePreview ? (
                                    <div className="relative group">
                                        <div className="rounded-2xl overflow-hidden border-4 border-gray-100">
                                            <img
                                                src={imagePreview.url}
                                                alt="Preview"
                                                className="w-full h-80 object-cover"
                                                onError={(e) => {
                                                    e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='400' viewBox='0 0 800 400'%3E%3Crect width='800' height='400' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='24' fill='%239ca3af' text-anchor='middle' dy='.3em'%3EImage not available%3C/text%3E%3C/svg%3E";
                                                }}
                                            />
                                        </div>
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl flex flex-col items-center justify-center p-6">
                                            <div className="flex space-x-4 mt-auto mb-6">
                                                <button
                                                    type="button"
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="bg-white text-gray-800 px-6 py-3 rounded-xl font-medium hover:bg-gray-100 transition-colors shadow-lg"
                                                >
                                                    Change Image
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={handleRemoveImage}
                                                    className="bg-red-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-red-600 transition-colors shadow-lg"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                        <p className="mt-3 text-sm text-gray-600 flex items-center">
                                            <Upload size={16} className="mr-2" />
                                            {imagePreview.isNewUpload ? "New upload" : "Existing image"} • Click to change
                                        </p>
                                    </div>
                                ) : (
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="border-3 border-dashed border-gray-300 rounded-2xl p-12 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 transition-all duration-300"
                                    >
                                        <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-blue-100 to-purple-100 flex items-center justify-center mb-6">
                                            <Upload className="text-blue-500" size={36} />
                                        </div>
                                        <p className="text-xl font-medium text-gray-700 mb-3">
                                            Click to upload carousel image
                                        </p>
                                        <p className="text-gray-500 mb-4">
                                            Drag and drop your image here or click to browse
                                        </p>
                                        <p className="text-sm text-gray-400">
                                            Supports: JPEG, PNG, WebP, GIF • Max: 5MB
                                        </p>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => {
                                                if (e.target.files[0]) {
                                                    handleFileUpload(e.target.files[0]);
                                                }
                                            }}
                                            className="hidden"
                                        />
                                    </div>
                                )}

                                {uploading && (
                                    <div className="mt-6 text-center">
                                        <div className="inline-flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-t-3 border-b-3 border-blue-500"></div>
                                            <span className="ml-3 text-gray-700 font-medium">Uploading image...</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Titles Section */}
                            <div className="mb-10">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-bold text-gray-800">Titles (4 Languages)</h3>
                                    <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
                                        Required for all languages
                                    </span>
                                </div>
                                {renderLanguageTabs("title")}
                            </div>

                            {/* Descriptions Section */}
                            <div className="mb-10">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-bold text-gray-800">Descriptions (4 Languages)</h3>
                                    <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
                                        Optional but recommended
                                    </span>
                                </div>
                                {renderLanguageTabs("description")}
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
                                    disabled={uploading || (!formData.mediaId && !editingId)}
                                    className="px-8 py-3.5 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg"
                                >
                                    {uploading ? (
                                        <span className="flex items-center">
                                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-3"></div>
                                            Uploading...
                                        </span>
                                    ) : editingId ? (
                                        "Update Carousel Slide"
                                    ) : (
                                        "Create Carousel Slide"
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

export default AdminCarusel;