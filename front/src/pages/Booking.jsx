import { useEffect, useState } from "react";
import ApiCall from "../config";
import { ToastContainer, toast } from "react-toastify";

function Booking() {
  const [rooms, setRooms] = useState([]);
  const [client, setClient] = useState({
    fullName: "",
    email: "",
    passportNumber: "",
    phone: "",
    breakfast: true,
  });
  const [isConfirmed, setIsConfirmed] = useState(false); // ✅ для отображения "чека"

  useEffect(() => {
    const stored = localStorage.getItem("selectedRooms");
    if (stored) {
      setRooms(JSON.parse(stored));
    }
  }, []);

  const addRoom = () => {
    setRooms([
      ...rooms,
      { roomType: "", guests: 1, checkIn: "", checkOut: "" },
    ]);
  };

  const updateRoom = (index, field, value) => {
    const newRooms = [...rooms];
    newRooms[index][field] = value;
    setRooms(newRooms);
  };

  const guestOptions = (roomType) => {
    if (roomType === "TRIPLE") return [1, 2, 3];
    if (roomType === "DOUBLE" || roomType === "TWIN") return [1, 2];
    return [1];
  };

  const handleSubmit = async () => {
    if (!client.fullName.trim()) {
      toast.info("Пожалуйста, введите ФИО");
      return;
    }

    const phoneDigits = client.phone.replace(/\D/g, "");
    if (phoneDigits.length < 12 || phoneDigits.length > 15) {
      toast.error("Введите корректный номер телефона (пример: +998987654321)");
      return;
    }

    const passportPattern = /^[A-Z]{2}[0-9]{7}$/i;
    if (!passportPattern.test(client.passportNumber)) {
      toast.error(
        "Введите корректные серию и номер паспорта (пример: AA1234567)"
      );
      return;
    }

    for (const room of rooms) {
      if (!room.roomType || !room.checkIn || !room.checkOut) {
        toast.info("Проверьте выбранные комнаты — не все поля заполнены");
        return;
      }
    }

    try {
      const clientRes = await ApiCall("/api/v1/client", "POST", client);
      if (clientRes.error) {
        toast.error("Ошибка при создании клиента");
        return;
      }

      const clientId = clientRes.data.id;
      for (const room of rooms) {
        const bookingPayload = {
          clientId,
          roomType: room.roomType,
          checkInTime: room.checkIn,
          checkOutTime: room.checkOut,
          breakfast: client.breakfast,
          manual: false,
          bookingStatus: 1,
          guestsCount: room.guestsCount,
        };

        const bookingRes = await ApiCall(
          "/api/v1/room-booking",
          "POST",
          bookingPayload
        );
        if (bookingRes.error) {
          toast.warn("Нет доступных комнат выбранного типа на эти даты");
          return;
        }
      }

      toast.success("Бронирование успешно создано!");
      localStorage.removeItem("selectedRooms");

      // ✅ Показываем "чек" вместо перехода
      setTimeout(() => setIsConfirmed(true), 1500);
    } catch (error) {
      console.error(error);
      toast.error("Произошла ошибка при бронировании");
    }
  };

  // ✅ Если бронь подтверждена — показываем чек
  if (isConfirmed) {
    return (
      <div className="max-w-3xl mx-auto mt-20 p-8 bg-white rounded-2xl shadow-lg text-center">
        <h1 className="text-3xl font-bold text-green-600 mb-4">
          Ваша бронь принята!
        </h1>
        <p className="text-gray-600 mb-6">Ниже указаны данные вашей брони:</p>

        <div className="text-left space-y-3 border p-4 rounded-lg bg-gray-50">
          <p>
            <strong>ФИО:</strong> {client.fullName}
          </p>
          <p>
            <strong>Email:</strong> {client.email || "—"}
          </p>
          <p>
            <strong>Паспорт:</strong> {client.passportNumber}
          </p>
          <p>
            <strong>Телефон:</strong> {client.phone}
          </p>
          <p>
            <strong>Завтрак:</strong>{" "}
            {client.breakfast ? "Включён" : "Без завтрака"}
          </p>

          <hr className="my-3" />
          <p className="font-semibold text-lg">Комнаты:</p>
          {rooms.map((room, idx) => (
            <div key={idx} className="border-t pt-2">
              <p>
                <strong>Тип:</strong> {room.roomType}
              </p>
              <p>
                <strong>Гостей:</strong> {room.guestsCount}
              </p>
              <p>
                <strong>Заезд:</strong> {room.checkIn}
              </p>
              <p>
                <strong>Выезд:</strong> {room.checkOut}
              </p>
            </div>
          ))}
        </div>

        <p className="mt-6 text-gray-700 text-lg">
          В ближайшее время с вами свяжутся для подтверждения брони.
        </p>
        <p className="text-gray-700 font-semibold mt-2">
          Спасибо, что вы с нами!
        </p>

        {/* ✅ Кнопка "На главную" */}
        <button
          onClick={() => (window.location.href = "/")}
          className="mt-8 px-8 py-3 bg-yellow-400 text-black rounded-lg font-semibold hover:bg-yellow-500 transition"
        >
          На главную
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <h1 className="text-3xl text-white font-bold mb-6">
        Подтверждение бронирования
      </h1>
      <ToastContainer position="top-right" autoClose={2000} />

      {/* Rooms */}
      <div className="mb-8 space-y-6">
        <h2 className="text-xl text-gray-300 font-semibold">Ваши комнаты:</h2>
        {rooms.map((room, i) => (
          <div
            key={i}
            className="p-4 border rounded-lg bg-gray-50 grid grid-cols-1 md:grid-cols-4 gap-4"
          >
            <select
              value={room.roomType}
              onChange={(e) => updateRoom(i, "roomType", e.target.value)}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="">Тип</option>
              <option value="TWIN">TWIN</option>
              <option value="DOUBLE">DOUBLE</option>
              <option value="TRIPLE">TRIPLE</option>
            </select>

            <select
              value={room.guestsCount}
              onChange={(e) =>
                updateRoom(i, "guestsCount", Number(e.target.value))
              }
              disabled={!room.roomType}
              className="px-4 py-2 border rounded-lg"
            >
              {guestOptions(room.roomType).map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>

            <input
              type="date"
              value={room.checkIn}
              onChange={(e) => updateRoom(i, "checkIn", e.target.value)}
              className="px-4 py-2 border rounded-lg"
            />

            <input
              type="date"
              value={room.checkOut}
              onChange={(e) => updateRoom(i, "checkOut", e.target.value)}
              className="px-4 py-2 border rounded-lg"
            />
          </div>
        ))}

        <button
          onClick={addRoom}
          className="px-6 py-2 border border-yellow-400 text-yellow-400 rounded-lg hover:bg-yellow-400 hover:text-black transition"
        >
          Добавить комнату
        </button>
      </div>

      {/* Client */}
      <div className="space-y-4">
        <input
          type="text"
          placeholder="ФИО"
          value={client.fullName}
          onChange={(e) => setClient({ ...client, fullName: e.target.value })}
          className="w-full px-4 py-3 border rounded-lg"
        />
        <input
          type="email"
          placeholder="Email"
          value={client.email}
          onChange={(e) => setClient({ ...client, email: e.target.value })}
          className="w-full px-4 py-3 border rounded-lg"
        />
        <input
          type="text"
          placeholder="Номер паспорта"
          value={client.passportNumber}
          onChange={(e) =>
            setClient({ ...client, passportNumber: e.target.value })
          }
          className="w-full px-4 py-3 border rounded-lg"
          maxLength={9}
        />
        <input
          type="tel"
          placeholder="Номер Ватсапа"
          value={client.phone}
          onChange={(e) => {
            const value = e.target.value.replace(/[^0-9+]/g, "");
            setClient({ ...client, phone: value });
          }}
          className="w-full px-4 py-3 border rounded-lg"
          maxLength={16}
        />

        <label className="flex items-center text-white gap-2">
          <input
            type="checkbox"
            checked={client.breakfast}
            onChange={(e) =>
              setClient({ ...client, breakfast: e.target.checked })
            }
          />
          Завтрак включён
        </label>
      </div>

      <button
        onClick={handleSubmit}
        className="mt-6 w-full bg-yellow-400 text-black px-6 py-4 rounded-lg font-semibold hover:bg-yellow-500 transition"
      >
        Завершить бронирование
      </button>
    </div>
  );
}

export default Booking;
