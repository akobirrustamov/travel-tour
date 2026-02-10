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
    Users,
    Globe,
    Phone,
    Mail,
    Link,
    CheckCircle,
    XCircle,
    Star,
    Filter,
    SortAsc,
    Eye,
    EyeOff
} from "lucide-react";
import MyCkeditor from "../../components/MyCkeditor.jsx";

function AdminPartner() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [partners, setPartners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [uploading, setUploading] = useState(false);
    const [logoPreview, setLogoPreview] = useState(null);
    const [statusFilter, setStatusFilter] = useState("all"); // all, active, inactive
    const [selectedLanguage, setSelectedLanguage] = useState("uz"); // Default language for display
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title_uz: "",
        title_ru: "",
        title_en: "",
        title_turk: "",
        logoId: null,
        description_uz: "",
        description_ru: "",
        description_en: "",
        description_turk: "",
        website: "",
        phone: "",
        email: "",
        active: true,
        sortOrder: 0
    });

    // === Проверка токена ===
    useEffect(() => {
        const token = localStorage.getItem("access_token");
        if (!token || isTokenExpired(token)) {
            localStorage.clear();
            navigate("/admin/login");
        } else {
            fetchPartners();
        }
    }, [navigate, currentPage, statusFilter]);

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

    // === Fetch Partners with Pagination ===
    const fetchPartners = async () => {
        try {
            setLoading(true);
            const res = await requestWithRefresh(`/api/v1/travel-partners/page?page=${currentPage}&size=12`);
            if (res && !res.error) {
                let filteredPartners = res.data.content || [];

                // Apply status filter
                if (statusFilter === "active") {
                    filteredPartners = filteredPartners.filter(p => p.active);
                } else if (statusFilter === "inactive") {
                    filteredPartners = filteredPartners.filter(p => !p.active);
                }

                setPartners(filteredPartners);
                setTotalPages(res.data.totalPages || 0);
                setTotalItems(filteredPartners.length);
            } else {
                toast.error("Failed to fetch travel partners");
            }
        } catch (error) {
            toast.error("Error loading travel partners");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // === Handle Logo Upload ===
    const handleLogoUpload = async (file) => {
        if (!file) return;

        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/svg+xml', 'image/webp'];
        const maxSize = 2 * 1024 * 1024; // 2MB

        if (!allowedTypes.includes(file.type)) {
            toast.error("Only image files are allowed (JPEG, PNG, JPG, SVG, WebP)");
            return;
        }

        if (file.size > maxSize) {
            toast.error("Logo size must be less than 2MB");
            return;
        }

        try {
            setUploading(true);
            const uploadFormData = new FormData();
            uploadFormData.append("photo", file);
            uploadFormData.append("prefix", "partners");

            const res = await requestWithRefresh("/api/v1/file/upload", "POST", uploadFormData, null, true);

            if (res && !res.error) {
                const previewUrl = URL.createObjectURL(file);
                setLogoPreview({
                    url: previewUrl,
                    file: file,
                    isNewUpload: true
                });
                setFormData(prev => ({ ...prev, logoId: res.data }));
                toast.success("Logo uploaded successfully");
            } else {
                toast.error("Failed to upload logo");
            }
        } catch (error) {
            toast.error("Error uploading logo");
            console.error(error);
        } finally {
            setUploading(false);
        }
    };

    // === Handle Create/Update ===
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate that at least one title field is filled
        if (!formData.title_uz.trim() && !formData.title_ru.trim() &&
            !formData.title_en.trim() && !formData.title_turk.trim()) {
            toast.error("Please enter partner name in at least one language");
            return;
        }

        try {
            const url = editingId ? `/api/v1/travel-partners/${editingId}` : "/api/v1/travel-partners";
            const method = editingId ? "PUT" : "POST";

            const res = await requestWithRefresh(url, method, formData);

            if (res && !res.error) {
                toast.success(`Partner ${editingId ? 'updated' : 'created'} successfully`);
                resetForm();
                setIsModalOpen(false);
                fetchPartners();
            } else {
                toast.error(`Failed to ${editingId ? 'update' : 'create'} partner`);
            }
        } catch (error) {
            toast.error("Error saving partner");
            console.error(error);
        }
    };

    // === Handle Delete ===
    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this travel partner?")) return;

        try {
            const res = await requestWithRefresh(`/api/v1/travel-partners/${id}`, "DELETE");
            if (res && !res.error) {
                toast.success("Partner deleted successfully");
                fetchPartners();
            } else {
                toast.error("Failed to delete partner");
            }
        } catch (error) {
            toast.error("Error deleting partner");
            console.error(error);
        }
    };

    // === Handle Edit ===
    const handleEdit = async (partner) => {
        setEditingId(partner.id);

        // The backend entity has nameUz, nameRu, etc. but DTO uses title_uz, title_ru, etc.
        // Map entity fields to DTO fields
        setFormData({
            title_uz: partner.nameUz || "",
            title_ru: partner.nameRu || "",
            title_en: partner.nameEn || "",
            title_turk: partner.nameTurk || "",
            logoId: partner.logo?.id || null,
            description_uz: partner.description_uz || "",
            description_ru: partner.description_ru || "",
            description_en: partner.description_en || "",
            description_turk: partner.description_turk || "",
            website: partner.website || "",
            phone: partner.phone || "",
            email: partner.email || "",
            active: partner.active !== undefined ? partner.active : true,
            sortOrder: partner.sortOrder || 0
        });

        // Set logo preview
        if (partner.logo) {
            setLogoPreview({
                url: `${baseUrl}/api/v1/file/getFile/${partner.logo.id}`,
                file: null,
                isNewUpload: false,
                existingMediaId: partner.logo.id
            });
        } else {
            setLogoPreview(null);
        }

        setIsModalOpen(true);
    };

    // === Handle Remove Logo ===
    const handleRemoveLogo = () => {
        setLogoPreview(null);
        setFormData(prev => ({ ...prev, logoId: null }));
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    // === Handle Toggle Active Status ===
    const handleToggleActive = async (partner) => {
        try {
            // Create update data with DTO structure
            const updatedData = {
                title_uz: partner.nameUz || "",
                title_ru: partner.nameRu || "",
                title_en: partner.nameEn || "",
                title_turk: partner.nameTurk || "",
                logoId: partner.logo?.id || null,
                description_uz: partner.description_uz || "",
                description_ru: partner.description_ru || "",
                description_en: partner.description_en || "",
                description_turk: partner.description_turk || "",
                website: partner.website || "",
                phone: partner.phone || "",
                email: partner.email || "",
                active: !partner.active,
                sortOrder: partner.sortOrder || 0
            };

            const res = await requestWithRefresh(`/api/v1/travel-partners/${partner.id}`, "PUT", updatedData);

            if (res && !res.error) {
                toast.success(`Partner ${!partner.active ? 'activated' : 'deactivated'} successfully`);
                fetchPartners();
            } else {
                toast.error("Failed to update partner status");
            }
        } catch (error) {
            toast.error("Error updating partner status");
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
            logoId: null,
            description_uz: "",
            description_ru: "",
            description_en: "",
            description_turk: "",
            website: "",
            phone: "",
            email: "",
            active: true,
            sortOrder: 0
        });
        setLogoPreview(null);
        setEditingId(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    // === Handle Input Change ===
    const handleInputChange = (e) => {
        const { name, value, type } = e.target;

        // Skip description fields (handled by CKEditor)
        if (name.startsWith('description_')) {
            return;
        }

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? e.target.checked :
                type === 'number' ? parseInt(value) || 0 :
                    value
        }));
    };

    // === Handle CKEditor Change ===
    const handleEditorChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // === Handle Logout ===
    const handleLogout = () => {
        localStorage.clear();
        navigate("/admin/login");
    };

    // === Filter Partners ===
    const filteredPartners = partners.filter(partner => {
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            return (
                (partner.nameUz?.toLowerCase().includes(searchLower) ||
                    partner.nameRu?.toLowerCase().includes(searchLower) ||
                    partner.nameEn?.toLowerCase().includes(searchLower) ||
                    partner.nameTurk?.toLowerCase().includes(searchLower) ||
                    partner.email?.toLowerCase().includes(searchLower) ||
                    partner.phone?.toLowerCase().includes(searchLower) ||
                    partner.website?.toLowerCase().includes(searchLower))
            );
        }
        return true;
    });

    // === Get Logo URL ===
    const getLogoUrl = (partner) => {
        if (partner.logo && partner.logo.id) {
            return `${baseUrl}/api/v1/file/getFile/${partner.logo.id}`;
        }
        return null;
    };

    // === Format Website URL ===
    const formatWebsiteUrl = (url) => {
        if (!url) return "";
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            return `https://${url}`;
        }
        return url;
    };

    // === Get Display Name ===
    const getDisplayName = (partner) => {
        // Return name based on selected language
        switch(selectedLanguage) {
            case "uz": return partner.nameUz || partner.nameRu || partner.nameEn || partner.nameTurk || "No name";
            case "ru": return partner.nameRu || partner.nameUz || partner.nameEn || partner.nameTurk || "No name";
            case "en": return partner.nameEn || partner.nameUz || partner.nameRu || partner.nameTurk || "No name";
            case "turk": return partner.nameTurk || partner.nameUz || partner.nameRu || partner.nameEn || "No name";
            default: return partner.nameUz || partner.nameRu || partner.nameEn || partner.nameTurk || "No name";
        }
    };

    // === Get Display Description ===
    const getDisplayDescription = (partner) => {
        // Return description based on selected language
        switch(selectedLanguage) {
            case "uz": return partner.description_uz || partner.description_ru || partner.description_en || partner.description_turk || "";
            case "ru": return partner.description_ru || partner.description_uz || partner.description_en || partner.description_turk || "";
            case "en": return partner.description_en || partner.description_uz || partner.description_ru || partner.description_turk || "";
            case "turk": return partner.description_turk || partner.description_uz || partner.description_ru || partner.description_en || "";
            default: return partner.description_uz || partner.description_ru || partner.description_en || partner.description_turk || "";
        }
    };

    // === Render Language Badges ===
    const renderLanguageBadges = (partner) => {
        const badges = [];
        if (partner.nameUz?.trim()) badges.push({ key: "uz", label: "UZ", color: "blue" });
        if (partner.nameRu?.trim()) badges.push({ key: "ru", label: "RU", color: "green" });
        if (partner.nameEn?.trim()) badges.push({ key: "en", label: "EN", color: "purple" });
        if (partner.nameTurk?.trim()) badges.push({ key: "turk", label: "TR", color: "yellow" });

        return (
            <div className="flex flex-wrap gap-1">
                {badges.map(badge => (
                    <span
                        key={badge.key}
                        className={`text-xs font-medium px-2 py-1 rounded-full 
                            ${badge.color === 'blue' ? 'bg-blue-100 text-blue-700' : ''}
                            ${badge.color === 'green' ? 'bg-green-100 text-green-700' : ''}
                            ${badge.color === 'purple' ? 'bg-purple-100 text-purple-700' : ''}
                            ${badge.color === 'yellow' ? 'bg-yellow-100 text-yellow-700' : ''}
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
            { key: "uz", label: "O'zbekcha", placeholder: "O'zbekcha nomi" },
            { key: "ru", label: "Русский", placeholder: "Русское название" },
            { key: "en", label: "English", placeholder: "English name" },
            { key: "turk", label: "Türkçe", placeholder: "Türkçe isim" }
        ];

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {titleInputs.map((lang) => (
                    <div key={lang.key} className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            {lang.label} Name
                        </label>
                        <input
                            type="text"
                            name={`title_${lang.key}`}
                            value={formData[`title_${lang.key}`]}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder={lang.placeholder}
                        />
                    </div>
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
            { key: "turk", label: "Türkçe", placeholder: "Türkçe açıklama..." }
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
                                id={`editor-partner-${lang.key}-${editingId || 'new'}`}
                                value={formData[`description_${lang.key}`]}
                                onChange={(value) => handleEditorChange(`description_${lang.key}`, value)}
                                height={200}
                            />
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                            <span>
                                {formData[`description_${lang.key}`]?.replace(/<[^>]*>/g, '').length || 0} characters
                            </span>
                            <span>Rich text editor - supports formatting and images</span>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-cyan-50">
            <ToastContainer position="top-right" autoClose={2000} />

            {/* === Mobile Menu Button === */}
            <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden fixed top-6 left-6 z-50 bg-gradient-to-r from-cyan-500 to-blue-600 text-white p-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
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
            <main className="flex-1 p-4 lg:p-8 overflow-auto">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-10">
                        <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                                Travel Partners
                            </h1>
                            <p className="text-gray-600 mt-2">Manage your travel agency partners and collaborators</p>
                        </div>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mt-6 lg:mt-0">
                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search partners..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent w-full sm:w-64"
                                />
                            </div>

                            {/* Add New Button */}
                            <button
                                onClick={() => {
                                    resetForm();
                                    setIsModalOpen(true);
                                }}
                                className="flex items-center justify-center bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-5 py-3 rounded-xl hover:shadow-xl transition-all duration-300 shadow-lg"
                            >
                                <Plus size={22} className="mr-2" />
                                Add New Partner
                            </button>
                        </div>
                    </div>





                    {/* Loading State */}
                    {loading ? (
                        <div className="flex flex-col justify-center items-center h-96">
                            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-cyan-500"></div>
                            <p className="mt-4 text-gray-600">Loading travel partners...</p>
                        </div>
                    ) : (
                        <>
                            {/* Partners Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-10">
                                {filteredPartners.map((partner) => {
                                    const logoUrl = getLogoUrl(partner);
                                    const displayName = getDisplayName(partner);
                                    const displayDescription = getDisplayDescription(partner);

                                    return (
                                        <div key={partner.id} className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                                            {/* Header with Logo and Status */}
                                            <div className="relative p-6 bg-gradient-to-r from-cyan-50 to-blue-50">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center">
                                                        {logoUrl ? (
                                                            <div className="w-12 h-12 rounded-lg bg-white p-2 shadow-sm">
                                                                <img
                                                                    src={logoUrl}
                                                                    alt={displayName}
                                                                    className="w-full h-full object-contain"
                                                                    onError={(e) => {
                                                                        e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='14' fill='%239ca3af' text-anchor='middle' dy='.3em'%3ELogo%3C/text%3E%3C/svg%3E";
                                                                    }}
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div className="w-12 h-12 rounded-lg bg-white p-2 shadow-sm flex items-center justify-center">
                                                                <Users className="text-gray-400" size={24} />
                                                            </div>
                                                        )}
                                                        <div className="ml-4">
                                                            <h3 className="font-bold text-lg text-gray-800 truncate max-w-[180px]">
                                                                {displayName}
                                                            </h3>
                                                            {partner.sortOrder > 0 && (
                                                                <div className="flex items-center text-sm text-gray-500">
                                                                    <Star size={12} className="mr-1" />
                                                                    Priority: {partner.sortOrder}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleToggleActive(partner)}
                                                        className={`p-2 rounded-full transition-colors ${
                                                            partner.active
                                                                ? 'bg-green-100 text-green-600 hover:bg-green-200'
                                                                : 'bg-red-100 text-red-600 hover:bg-red-200'
                                                        }`}
                                                    >
                                                        {partner.active ? <Eye size={18} /> : <EyeOff size={18} />}
                                                    </button>
                                                </div>

                                                {/* Status Badge */}
                                                <div className="absolute top-4 right-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                        partner.active
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-red-100 text-red-700'
                                                    }`}>
                                                        {partner.active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div className="p-6">
                                                {/* Description Preview */}
                                                <div className="mb-4">
                                                    <p className="text-gray-600 text-sm line-clamp-3 h-16">
                                                        {displayDescription || "No description provided"}
                                                    </p>
                                                </div>

                                                {/* Language Badges */}
                                                <div className="mb-4">
                                                    {renderLanguageBadges(partner)}
                                                </div>

                                                {/* Contact Info */}
                                                <div className="space-y-2 mb-6">
                                                    {partner.website && (
                                                        <div className="flex items-center text-sm text-gray-600">
                                                            <Link size={14} className="mr-2 text-cyan-600" />
                                                            <a
                                                                href={formatWebsiteUrl(partner.website)}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="truncate hover:text-cyan-700 hover:underline"
                                                            >
                                                                {partner.website.replace(/^https?:\/\//, '')}
                                                            </a>
                                                        </div>
                                                    )}
                                                    {partner.email && (
                                                        <div className="flex items-center text-sm text-gray-600">
                                                            <Mail size={14} className="mr-2 text-cyan-600" />
                                                            <span className="truncate">{partner.email}</span>
                                                        </div>
                                                    )}
                                                    {partner.phone && (
                                                        <div className="flex items-center text-sm text-gray-600">
                                                            <Phone size={14} className="mr-2 text-cyan-600" />
                                                            <span className="truncate">{partner.phone}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Actions */}
                                                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                                                    <button
                                                        onClick={() => handleEdit(partner)}
                                                        className="flex items-center text-blue-600 hover:text-blue-800 font-medium group"
                                                    >
                                                        <Edit size={18} className="mr-2 group-hover:scale-110 transition-transform" />
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(partner.id)}
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
                            {filteredPartners.length === 0 && !loading && (
                                <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
                                    <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center mb-6">
                                        <Users className="text-gray-400" size={48} />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-800 mb-3">No travel partners found</h3>
                                    <p className="text-gray-600 max-w-md mx-auto mb-8">
                                        {searchTerm || statusFilter !== "all"
                                            ? "No results found for your filter. Try changing your search or filter criteria."
                                            : "Get started by adding your first travel partner."}
                                    </p>
                                    <button
                                        onClick={() => {
                                            resetForm();
                                            setIsModalOpen(true);
                                        }}
                                        className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                                    >
                                        <Plus size={20} className="inline mr-2" />
                                        Add First Partner
                                    </button>
                                </div>
                            )}

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex flex-col sm:flex-row items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mt-8">
                                    <div className="text-sm text-gray-700 mb-4 sm:mb-0">
                                        Showing <span className="font-bold text-cyan-600">{filteredPartners.length}</span> of{" "}
                                        <span className="font-bold text-gray-800">{totalItems}</span> partners • Page{" "}
                                        <span className="font-bold text-cyan-600">{currentPage + 1}</span> of{" "}
                                        <span className="font-bold text-gray-800">{totalPages}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
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
                                                            ${currentPage === pageNum
                                                            ? 'bg-cyan-500 text-white'
                                                            : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                                                        }`}
                                                    >
                                                        {pageNum + 1}
                                                    </button>
                                                );
                                            })}
                                        </div>
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
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 rounded-t-3xl">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-3xl font-bold text-gray-800">
                                        {editingId ? "Edit Travel Partner" : "Add New Travel Partner"}
                                    </h2>
                                    <p className="text-gray-600 mt-1">
                                        {editingId ? "Update partner information" : "Add a new travel partner to your network"}
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
                            {/* Names in 4 Languages */}
                            <div className="mb-8">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-800">Partner Names</h3>
                                        <p className="text-gray-600 mt-1">Enter partner name in 4 different languages</p>
                                    </div>
                                    <div className="flex items-center text-gray-500">
                                        <Globe size={20} className="mr-2" />
                                        <span className="text-sm">Multi-language Support</span>
                                    </div>
                                </div>
                                {renderTitleInputs()}
                            </div>

                            {/* Logo Upload Section */}
                            <div className="mb-8">
                                <label className="block text-lg font-semibold text-gray-800 mb-6">
                                    Partner Logo
                                    <span className="block text-sm font-normal text-gray-500 mt-1">
                                        Recommended: 200x200px, PNG/JPEG/SVG, max 2MB
                                    </span>
                                </label>

                                {logoPreview ? (
                                    <div className="relative group max-w-xs">
                                        <div className="rounded-2xl overflow-hidden border-4 border-gray-100">
                                            <img
                                                src={logoPreview.url}
                                                alt="Logo preview"
                                                className="w-full h-48 object-contain bg-gray-50"
                                                onError={(e) => {
                                                    e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='24' fill='%239ca3af' text-anchor='middle' dy='.3em'%3ELogo%3C/text%3E%3C/svg%3E";
                                                }}
                                            />
                                        </div>
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl flex items-center justify-center">
                                            <div className="flex space-x-4 mt-auto mb-6">
                                                <button
                                                    type="button"
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="bg-white text-gray-800 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors shadow-lg"
                                                >
                                                    Change Logo
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={handleRemoveLogo}
                                                    className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors shadow-lg"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="border-3 border-dashed border-gray-300 rounded-2xl p-8 text-center cursor-pointer hover:border-cyan-500 hover:bg-cyan-50/50 transition-all duration-300 max-w-xs"
                                    >
                                        <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-cyan-100 to-blue-100 flex items-center justify-center mb-4">
                                            <Upload className="text-cyan-500" size={28} />
                                        </div>
                                        <p className="text-lg font-medium text-gray-700 mb-2">
                                            Upload Logo
                                        </p>
                                        <p className="text-gray-500 text-sm">
                                            Click to browse or drag and drop
                                        </p>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => {
                                                if (e.target.files[0]) {
                                                    handleLogoUpload(e.target.files[0]);
                                                }
                                            }}
                                            className="hidden"
                                        />
                                    </div>
                                )}

                                {uploading && (
                                    <div className="mt-4 text-center max-w-xs">
                                        <div className="inline-flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-cyan-500"></div>
                                            <span className="ml-3 text-gray-700 font-medium">Uploading logo...</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Contact Information */}
                            <div className="mb-8">
                                <h3 className="text-xl font-bold text-gray-800 mb-6">Contact Information</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Website */}
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700 flex items-center">
                                            <Link size={16} className="mr-2 text-gray-500" />
                                            Website
                                        </label>
                                        <input
                                            type="url"
                                            name="website"
                                            value={formData.website}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="https://example.com"
                                        />
                                    </div>

                                    {/* Email */}
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700 flex items-center">
                                            <Mail size={16} className="mr-2 text-gray-500" />
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="partner@example.com"
                                        />
                                    </div>

                                    {/* Phone */}
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700 flex items-center">
                                            <Phone size={16} className="mr-2 text-gray-500" />
                                            Phone
                                        </label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="+998 XX XXX XX XX"
                                        />
                                    </div>

                                    {/* Sort Order and Active Status */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Display Priority
                                            </label>
                                            <input
                                                type="number"
                                                name="sortOrder"
                                                value={formData.sortOrder}
                                                onChange={handleInputChange}
                                                min="0"
                                                max="999"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="0"
                                            />
                                            <p className="text-xs text-gray-500">Lower numbers appear first</p>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Status
                                            </label>
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    name="active"
                                                    checked={formData.active}
                                                    onChange={handleInputChange}
                                                    className="h-5 w-5 text-cyan-600 rounded focus:ring-cyan-500"
                                                    id="active-checkbox"
                                                />
                                                <label htmlFor="active-checkbox" className="ml-2 text-gray-700">
                                                    Active
                                                </label>
                                            </div>
                                            <p className="text-xs text-gray-500">Show on website</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Descriptions Section */}
                            <div className="mb-10">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-800">Descriptions</h3>
                                        <p className="text-gray-600 mt-1">Add descriptions in 4 different languages</p>
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
                                    disabled={uploading}
                                    className="px-8 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg"
                                >
                                    {uploading ? (
                                        <span className="flex items-center">
                                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-3"></div>
                                            Uploading...
                                        </span>
                                    ) : editingId ? (
                                        "Update Partner"
                                    ) : (
                                        "Create Partner"
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

export default AdminPartner;