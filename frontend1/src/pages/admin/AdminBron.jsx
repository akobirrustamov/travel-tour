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
              placeholder="Tur bo‘yicha filter..."
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
    </div>
  );
}

export default AdminBron;
