import React, { useState, useEffect, useMemo } from "react";
import ApiCall from "../../config";
import Sidebar from "./Sidebar";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Select from "react-select";

function AdminBron() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [brons, setBrons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTour, setSelectedTour] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingBron, setEditingBron] = useState(null);

  const [editData, setEditData] = useState({
    name: "",
    email: "",
    phone: "",
    status: 1,
    description: "",
  });
  const handleEditOpen = (bron) => {
    setEditingBron(bron);

    setEditData({
      name: bron.name || "",
      email: bron.email || "",
      phone: bron.phone || "",
      status: bron.status || 1,
      description: bron.description || "",
    });

    setIsEditOpen(true);
  };

  const handleUpdate = async () => {
    try {
      await ApiCall(`/api/v1/bron/${editingBron.id}`, "PUT", editData);

      toast.success("Bron yangilandi");
      setIsEditOpen(false);
      getAllBrons();
    } catch (error) {
      toast.error("Yangilashda xatolik!");
    }
  };

  const navigate = useNavigate();

  // === GET ALL BRONS ===
  const getAllBrons = async () => {
    try {
      const res = await ApiCall("/api/v1/bron", "GET");
      setBrons(res.data);
    } catch (error) {
      toast.error("Bronlarni yuklashda xatolik!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllBrons();
  }, []);

  // === Unique Tour Options ===
  const tourOptions = useMemo(() => {
    const uniqueTours = [
      ...new Map(
        brons.map((b) => [
          b.travelTour?.id,
          {
            value: b.travelTour?.id,
            label: b.travelTour?.title_uz,
          },
        ]),
      ).values(),
    ];

    return [{ value: "all", label: "Barchasi" }, ...uniqueTours];
  }, [brons]);

  // === Filtered Data ===
  const filteredBrons = useMemo(() => {
    if (!selectedTour || selectedTour.value === "all") return brons;

    return brons.filter((b) => b.travelTour?.id === selectedTour.value);
  }, [brons, selectedTour]);

  // === Delete ===
  const handleDelete = async (id) => {
    try {
      await ApiCall(`/api/v1/bron/${id}`, "DELETE");
      toast.success("Bron o'chirildi");
      getAllBrons();
    } catch (error) {
      toast.error("O'chirishda xatolik!");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/admin/login");
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-cyan-50">
      <ToastContainer position="top-right" autoClose={2000} />

      {/* Sidebar */}
      <div className="w-72 hidden lg:block">
        <Sidebar onLogout={handleLogout} />
      </div>

      <main className="flex-1 p-4 lg:p-8  overflow-auto overflow-y-auto h-screen scroll-smooth">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-gray-700">
            Bronlar ro'yxati
          </h2>

          {/* 🔎 FILTER SELECT */}
          <div className="mb-6 max-w-md">
            <Select
              options={tourOptions}
              value={selectedTour}
              onChange={setSelectedTour}
              placeholder="Tur bo'yicha filter..."
              isSearchable
              className="text-sm"
            />
          </div>

          {loading ? (
            <p>Yuklanmoqda...</p>
          ) : filteredBrons.length === 0 ? (
            <p>Bronlar mavjud emas</p>
          ) : (
            <div className="overflow-x-auto bg-white shadow-lg rounded-xl">
              <table className="min-w-full text-sm text-left">
                <thead className="bg-cyan-600 text-white">
                  <tr>
                    <th className="px-6 py-3">#</th>
                    <th className="px-6 py-3">Ism</th>
                    <th className="px-6 py-3">Telefon</th>
                    <th className="px-6 py-3">Email</th>
                    <th className="px-6 py-3">Tur nomi</th>
                    <th className="px-6 py-3">Sana</th>
                    <th className="px-6 py-3">Holati</th>
                    <th className="px-6 py-3">Izoh</th>
                    <th className="px-6 py-3">Amallar</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBrons.map((bron, index) => (
                    <tr key={bron.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4">{index + 1}</td>
                      <td className="px-6 py-4">{bron.name}</td>
                      <td className="px-6 py-4">{bron.phone}</td>
                      <td className="px-6 py-4">{bron.email}</td>
                      <td className="px-6 py-4">
                        {bron?.travelTour?.title_uz}
                      </td>
                      <td className="px-6 py-4">
                        {new Date(bron.createDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        {bron.status === 1
                          ? "Yangi"
                          : bron.status === 2
                            ? "Sotib oldi"
                            : bron.status === 3
                              ? "O'ylab ko'radi"
                              : bron.status === 4
                                ? "Rad etdi"
                                : "Bog'lanib bo'lmadi"}
                      </td>
                      <td className="px-6 py-4">
                        {bron.description ? bron.description : "-"}
                      </td>

                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleEditOpen(bron)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg text-xs mr-2"
                        >
                          ✏
                        </button>
                        <button
                          onClick={() => handleDelete(bron.id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-xs"
                        >
                          O'chirish
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
      {isEditOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl p-6 space-y-4">
            <h3 className="text-xl font-bold text-gray-700">
              Bronni tahrirlash
            </h3>

            {/* Status Select */}
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                value={editData.status}
                onChange={(e) =>
                  setEditData({ ...editData, status: Number(e.target.value) })
                }
                className="w-full border px-3 py-2 rounded-lg"
              >
                <option value={1}>Yangi</option>
                <option value={2}>Sotib oldi</option>
                <option value={3}>O'ylab ko'radi</option>
                <option value={4}>Rad etdi</option>
                <option value={5}>Bog'lanib bo'lmadi</option>
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Izoh (Description)
              </label>
              <textarea
                value={editData.description}
                onChange={(e) =>
                  setEditData({ ...editData, description: e.target.value })
                }
                className="w-full border px-3 py-2 rounded-lg h-24 resize-none"
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => setIsEditOpen(false)}
                className="px-4 py-2 border rounded-lg"
              >
                Bekor qilish
              </button>

              <button
                onClick={handleUpdate}
                className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
              >
                Saqlash
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminBron;
