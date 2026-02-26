import { useEffect, useState } from "react";
import ApiCall from "../../config";
import { toast } from "react-toastify";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";

function BookingsTable() {
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // drag selection
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState(null);
  const [selectionEnd, setSelectionEnd] = useState(null);

  // модалки
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  // редактирование комнаты
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [clients, setClients] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  // новая бронь
  const [client, setClient] = useState({
    fullName: "",
    email: "",
    passportNumber: "",
    phone: "",
    breakfast: true,
  });
  const [newBooking, setNewBooking] = useState({
    roomId: "",
    checkInTime: "",
    checkOutTime: "",
    manual: true,
    color: "yellow",
    description: "",
    toCook: "",
  });

  // редактирование
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [selectedRoomType, setSelectedRoomType] = useState("");

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const monthNames = [
    "Январь",
    "Февраль",
    "Март",
    "Апрель",
    "Май",
    "Июнь",
    "Июль",
    "Август",
    "Сентябрь",
    "Октябрь",
    "Ноябрь",
    "Декабрь",
  ];

  // Определяем мобильное устройство
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [copiedBooking, setCopiedBooking] = useState(null);
  // 🔹 Анимация открытия/закрытия модалок
  const [modalAnimation, setModalAnimation] = useState("idle");

  const role = JSON.parse(localStorage.getItem("roles")) || [];
  const userRoles = role.length > 0 ? role[0].name : null;
  const isAdmin = userRoles === "ROLE_ADMIN";
  const isReception = userRoles === "ROLE_RECEPTION";

  const closeModalWithAnimation = (onComplete) => {
    setModalAnimation("exiting");
    setTimeout(() => {
      setModalAnimation("idle");
      onComplete();
    }, 300); // время должно совпадать с duration-300 в CSS
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === "c") {
        if (selectedBooking) {
          setCopiedBooking(selectedBooking);
          toast.success("Бронь скопирована!");
        }
      } else if (e.ctrlKey && e.key === "v") {
        if (copiedBooking) {
          const roomBelow = rooms.find((r) => r.id > copiedBooking.room.id);
          if (roomBelow) {
            const newB = {
              clientId: copiedBooking.client.id,
              roomId: roomBelow.id,
              checkInTime: copiedBooking.checkInTime,
              checkOutTime: copiedBooking.checkOutTime,
              breakfast: copiedBooking.breakfast,
              manual: true,
            };
            ApiCall("/api/v1/room-booking", "POST", newB).then((res) => {
              if (!res.error) {
                toast.success(`Бронь вставлена в ${roomBelow.roomName}`);
                loadData();
              }
            });
          } else {
            toast.error("Нет комнаты ниже для вставки!");
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedBooking, copiedBooking, rooms]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  useEffect(() => {
    const body = document.body;
    if (showAddModal || showEditModal || showRoomModal) {
      body.style.overflow = "hidden";
    } else {
      body.style.overflow = "";
    }
  }, [showAddModal, showEditModal, showRoomModal]);

  useEffect(() => {
    loadData();
  }, [currentMonth]);

  const loadData = async () => {
    setIsLoading(true);
    await Promise.all([loadBookings(), loadRooms(), loadClients()]);
    setIsLoading(false);
  };
  const loadClients = async () => {
    const res = await ApiCall("/api/v1/client", "GET");
    if (res && !res.error) setClients(res.data);
  };

  const loadBookings = async () => {
    const res = await ApiCall("/api/v1/room-booking", "GET");
    if (res && !res.error) {
      const confirmed = res.data.filter((b) => b.bookingStatus === 3);
      setBookings(confirmed);
    }
  };

  const loadRooms = async () => {
    const res = await ApiCall("/api/v1/room", "GET");
    if (res && !res.error) setRooms(res.data);
  };

  const getBookingForCell = (roomId, day) => {
    const dayStr = formatDate(year, month, day);
    return bookings.find((b) => {
      const checkIn = b.checkInTime.includes("T")
        ? b.checkInTime.split("T")[0]
        : b.checkInTime;
      const checkOut = b.checkOutTime.includes("T")
        ? b.checkOutTime.split("T")[0]
        : b.checkOutTime;
      const dayDate = new Date(dayStr);
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);

      return (
        b.room.id === roomId &&
        dayDate >= checkInDate &&
        dayDate <= checkOutDate
      );
    });
  };

  const formatDate = (year, month, day) => {
    const mm = String(month + 1).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    return `${year}-${mm}-${dd}`;
  };

  // drag-select
  const handleMouseDown = (roomId, day) => {
    setIsSelecting(true);
    setSelectionStart({ roomId, day });
    setSelectionEnd({ roomId, day });
  };
  const handleMouseEnter = (roomId, day) => {
    if (isSelecting) {
      setSelectionEnd({ roomId, day });
    }
  };

  const handleMouseUp = () => {
    if (selectionStart && selectionEnd) {
      const startDay = Math.min(selectionStart.day, selectionEnd.day);
      const endDay = Math.max(selectionStart.day, selectionEnd.day);

      const startRoomIndex = sortedRooms.findIndex(
        (r) => r.id === selectionStart.roomId
      );
      const endRoomIndex = sortedRooms.findIndex(
        (r) => r.id === selectionEnd.roomId
      );

      // Нормализуем верх/низ
      const topIndex = Math.min(startRoomIndex, endRoomIndex);
      const bottomIndex = Math.max(startRoomIndex, endRoomIndex);
      const selectedRooms = sortedRooms.slice(topIndex, bottomIndex + 1);

      setNewBooking({
        rooms: selectedRooms,
        roomIds: selectedRooms.map((r) => r.id),
        checkInTime: formatDate(year, month, startDay),
        checkOutTime: formatDate(year, month, endDay + 1),
        manual: true,
      });

      setShowAddModal(true);
    }
    setIsSelecting(false);
  };

  // добавление брони
  const handleAddBooking = async () => {
    try {
      const clientRes = await ApiCall("/api/v1/client", "POST", client);
      if (clientRes.error) {
        toast.error("Ошибка при создании клиента");
        return;
      }
      const clientId = clientRes.data.id;

      // если выделено несколько комнат
      const roomIds = Array.isArray(newBooking.roomIds)
        ? newBooking.roomIds
        : [newBooking.roomId];

      for (const roomId of roomIds) {
        const bookingPayload = {
          clientId,
          roomId,
          checkInTime: newBooking.checkInTime,
          checkOutTime: newBooking.checkOutTime,
          breakfast: client.breakfast,
          manual: true,
          color: newBooking.color,
          description: newBooking.description,
          toCook: newBooking.toCook,
          bookingStatus: 3,
        };
        const bookingRes = await ApiCall(
          "/api/v1/room-booking",
          "POST",
          bookingPayload
        );
        if (bookingRes.error) {
          console.error("Ошибка при бронировании комнаты", roomId);
        }
      }

      toast.success("Бронь добавлена!");
      setShowAddModal(false);
      setClient({
        fullName: "",
        email: "",
        passportNumber: "",
        phone: "",
        breakfast: true,
      });
      setNewBooking({
        roomId: "",
        checkInTime: "",
        checkOutTime: "",
        manual: true,
      });
      loadData();
    } catch {
      toast.error("Ошибка при добавлении брони");
    }
  };

  // открыть модалку редактирования
  const openEditModal = (booking) => {
    if (isReception || isAdmin) {
      setSelectedBooking({
        ...booking,
        description: booking.description || "",
      });
      setSelectedRoomId(booking.room.id.toString());
      setSelectedRoomType(booking.room.roomType?.id?.toString() || "");
      setShowEditModal(true);
    }
  };

  // открыть модалку редактирования комнаты
  const openRoomModal = (room) => {
    setSelectedRoom({
      ...room,
      originalStatus: room.status,
      originalPrice: room.price,
      originalTypeId: room.roomType?.id,
    });
    setShowRoomModal(true);
  };

  const handleSaveRoom = async () => {
    if (!selectedRoom) return;

    try {
      if (selectedRoom.status !== selectedRoom.originalStatus) {
        const statusRes = await ApiCall(
          `/api/v1/room/status/${selectedRoom.id}`,
          "PUT",
          { status: selectedRoom.status }
        );
        if (statusRes.error) throw new Error("Ошибка при изменении статуса");
      }

      if (selectedRoom.price !== selectedRoom.originalPrice) {
        const priceRes = await ApiCall(
          `/api/v1/room/price/${selectedRoom.id}/${selectedRoom.price}`,
          "PUT"
        );
        if (priceRes.error) throw new Error("Ошибка при изменении цены");
      }

      if (
        selectedRoomType &&
        selectedRoomType !== selectedRoom.originalTypeId?.toString()
      ) {
        const typeRes = await ApiCall(
          `/api/v1/room/type/${selectedRoom.id}/${selectedRoomType}`,
          "PUT"
        );
        if (typeRes.error) throw new Error("Ошибка при изменении типа");
      }

      toast.success("Комната обновлена!");
      setShowRoomModal(false);
      loadRooms();
    } catch (err) {
      toast.error(err.message || "Ошибка при сохранении комнаты");
    }
  };

  // сохранить редактирование
  const handleSaveEdit = async () => {
    if (!selectedBooking) return;

    const payload = {
      roomId: selectedRoomId,
      clientId: selectedBooking.client.id,
      checkInTime: selectedBooking.checkInTime,
      checkOutTime: selectedBooking.checkOutTime,
      breakfast: selectedBooking.breakfast,
      arrived: selectedBooking.arrived,
      color: selectedBooking.color,
      description: selectedBooking.description,
      toCook: selectedBooking.toCook,
    };

    const res = await ApiCall(
      `/api/v1/room-booking/change-booking-time/${selectedBooking.id}`,
      "PUT",
      payload
    );

    if (selectedRoomType) {
      await ApiCall(
        `/api/v1/room/type/${selectedRoomId}/${selectedRoomType}`,
        "PUT"
      );
    }

    if (!res.error) {
      toast.success("Бронь обновлена");
      setShowEditModal(false);
      loadData();
    } else {
      toast.error("Ошибка при обновлении");
    }
  };

  const handleDeleteBooking = async () => {
    if (!selectedBooking) return;
    if (!window.confirm("Удалить бронь?")) return;
    const res = await ApiCall(
      `/api/v1/room-booking/${selectedBooking.id}`,
      "DELETE"
    );
    if (!res.error) {
      toast.success("Бронь удалена");
      setShowEditModal(false);
      loadData();
    } else {
      toast.error("Ошибка при удалении");
    }
  };

  const formatDisplayDate = (isoDate) => {
    if (!isoDate) return "";
    const [year, month, day] = isoDate.split("-");
    return `${day}-${month}-${year}`;
  };

  const changeMonth = (direction) => {
    setCurrentMonth(new Date(year, month + direction, 1));
  };

  // Функция для отображения дней недели
  const getDayOfWeek = (day) => {
    const date = new Date(year, month, day);
    const days = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
    return days[date.getDay()];
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  const sortedRooms = [...rooms].sort((a, b) => a.id - b.id);

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Заголовок и управление */}
      <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
        <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-800">
            {monthNames[month]} {year}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => changeMonth(-1)}
              className="p-2 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
              aria-label="Предыдущий месяц"
            >
              ←
            </button>
            <button
              onClick={() => setCurrentMonth(new Date())}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Сегодня
            </button>
            <button
              onClick={() => changeMonth(1)}
              className="p-2 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
              aria-label="Следующий месяц"
            >
              →
            </button>
          </div>
        </div>
      </div>

      {/* Таблица */}
      <div
        className="overflow-x-auto overflow-y-hidden bg-white select-none scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
        style={{ maxWidth: "100%", overscrollBehaviorX: "contain" }}
        onMouseDown={(e) => e.preventDefault()}
        onMouseUp={handleMouseUp}
        onTouchEnd={handleMouseUp}
      >
        <div className="min-w-max">
          <table
            className="w-full border-collapse text-sm"
            onMouseDown={(e) => {
              // 🛑 Если клик внутри заголовка — отменяем все действия
              const th = e.target.closest("th");
              if (th) {
                e.stopPropagation();
                e.preventDefault();
                return;
              }
            }}
            onTouchStart={(e) => {
              const th = e.target.closest("th");
              if (th) {
                e.stopPropagation();
                e.preventDefault();
                return;
              }
            }}
          >
            <thead>
              <tr className="bg-gray-50">
                <th className="sticky left-0 z-10 bg-gray-100 border border-gray-200 px-3 py-3 text-left min-w-[120px]">
                  <div className="font-semibold text-gray-700">Комната</div>
                  <div className="text-xs text-gray-500 font-normal">
                    Тип / Цена
                  </div>
                </th>
                {days.map((d) => {
                  const dayDate = new Date(year, month, d);
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const isToday = dayDate.getTime() === today.getTime();
                  const isWeekend =
                    dayDate.getDay() === 0 || dayDate.getDay() === 6;

                  return (
                    <th
                      key={d}
                      className={`border border-gray-200 px-1 py-2 text-center min-w-[${
                        isMobile ? "32" : "48"
                      }px] ${
                        isToday
                          ? "bg-blue-500 text-white border-blue-600"
                          : isWeekend
                          ? "bg-red-50 text-red-700"
                          : "bg-gray-50 text-gray-700"
                      }`}
                    >
                      <div className="text-xs font-semibold">
                        {getDayOfWeek(d)}
                      </div>
                      <div
                        className={`text-sm font-bold ${
                          isToday ? "text-white" : ""
                        }`}
                      >
                        {d}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {sortedRooms.map((room) => (
                <tr key={room.id} className="hover:bg-gray-50">
                  <td
                    className="sticky left-0 z-10 bg-white border border-gray-200 px-3 py-1 cursor-pointer hover:bg-blue-50 transition-colors group"
                    onClick={() => openRoomModal(room)}
                  >
                    <div className="font-semibold text-gray-800">
                      {room.roomName}
                    </div>
                    <div className="text-xs text-gray-600">
                      {room.roomType?.name || "—"}
                    </div>
                    <div className="text-[10px] text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      {room.description}
                    </div>
                  </td>

                  {days.map((day) => {
                    const booked = getBookingForCell(room.id, day);
                    const roomIndex = sortedRooms.findIndex(
                      (r) => r.id === room.id
                    );
                    const startRoomIndex = selectionStart
                      ? sortedRooms.findIndex(
                          (r) => r.id === selectionStart.roomId
                        )
                      : -1;
                    const endRoomIndex = selectionEnd
                      ? sortedRooms.findIndex(
                          (r) => r.id === selectionEnd.roomId
                        )
                      : -1;

                    const isSelected = isAdmin &&
                      isSelecting &&
                      selectionStart &&
                      selectionEnd &&
                      day >= Math.min(selectionStart.day, selectionEnd.day) &&
                      day <= Math.max(selectionStart.day, selectionEnd.day) &&
                      roomIndex >= Math.min(startRoomIndex, endRoomIndex) &&
                      roomIndex <= Math.max(startRoomIndex, endRoomIndex);

                    const dayDate = new Date(year, month, day);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const isToday = dayDate.getTime() === today.getTime();

                    // 🟩 Цвет ячейки
                    let cellClass = "bg-green-50 hover:bg-green-100";
                    let statusIcon = "";

                    if (booked) {
                      // 🎨 Цвет берётся из выбранного при создании/редактировании
                      switch (booked.color) {
                        case "red":
                          cellClass = "bg-red-400 text-white";
                          break;
                        case "brown":
                          cellClass = "bg-amber-800 text-white";
                          break;
                        case "green":
                          cellClass = "bg-green-500 text-white";
                          break;
                        case "yellow":
                          cellClass = "bg-yellow-400 text-black";
                          break;
                        default:
                          cellClass = "bg-orange-300 text-white";
                      }

                      // ✅ Значки прибытия (без изменения цвета)
                      if (booked.arrived === true) {
                        statusIcon = "✔";
                      } else if (booked.arrived === false) {
                        statusIcon = "✖";
                      } else {
                        statusIcon = "?";
                      }
                    }

                    return (
                      <td
                        key={day}
                        className={`border h-12 cursor-pointer transition-colors relative ${cellClass} 
                        ${isToday ? "ring-2 ring-blue-400 ring-inset" : ""}
                        ${isSelected ? "bg-blue-200" : ""}
                        ${
                          booked
                            ? booked.manual
                              ? "border-2 border-gray-200" // 🖐 ручная бронь (панель)
                              : "border-2 border-fuchsia-950" // 🌐 бронь с сайта (пунктир)
                            : "border border-gray-200"
                        }
                      `}
                        onMouseDown={() => {
                          if (booked) {
                            openEditModal(booked);
                          } else {
                            handleMouseDown(room.id, day);
                          }
                        }}
                        onTouchStart={() => {
                          if (booked) {
                            openEditModal(booked);
                          } else {
                            handleMouseDown(room.id, day);
                          }
                        }}
                        onMouseEnter={() =>
                          !booked && handleMouseEnter(room.id, day)
                        }
                        data-room-id={room.id}
                        data-day={day}
                      >
                        {booked?.client?.fullName && (
                          <div className="absolute inset-1 flex flex-col justify-center items-center text-center">
                            <span className="text-[10px] font-medium leading-tight truncate">
                              {isMobile
                                ? booked.client.fullName.split(" ")[0]
                                : booked.client.fullName}
                            </span>
                            {statusIcon && (
                              <span className="text-xs font-bold mt-1">
                                {statusIcon}
                              </span>
                            )}
                          </div>
                        )}
                        {isSelected && (
                          <div className="absolute inset-0 bg-blue-300 bg-opacity-40 border-2 border-blue-500 pointer-events-none"></div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isAdmin && showAddModal && (
        <ModernModal
          onClose={() => closeModalWithAnimation(() => setShowAddModal(false))}
          title="Новая бронь"
          animation={modalAnimation}
        >
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-200">
              <h3 className="font-bold text-slate-800 text-lg mb-4">
                📅 Детали бронирования
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="bg-white p-3 rounded-xl">
                  <span className="text-slate-600">Заезд: </span>
                  <span className="font-semibold text-slate-800">
                    <i>{formatDisplayDate(newBooking.checkInTime)}</i>
                  </span>
                </div>
                <div className="bg-white p-3 rounded-xl">
                  <span className="text-slate-600">Выезд: </span>
                  <span className="font-semibold text-slate-800">
                    <i>{formatDisplayDate(newBooking.checkOutTime)}</i>
                  </span>
                </div>
              </div>
              <div className="mt-4">
                <p className="font-semibold text-sm mb-3 text-slate-700">
                  Выбранные комнаты:
                </p>
                <div className="flex flex-wrap gap-2">
                  {newBooking.rooms?.map((room) => (
                    <span
                      key={room.id}
                      className="bg-white px-4 py-2 rounded-full text-sm font-medium text-slate-700 border border-slate-300 shadow-sm"
                    >
                      {room.roomName} — {room.roomType?.name || "—"}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  ФИО клиента *
                </label>
                <input
                  list="client-list"
                  type="text"
                  placeholder="Введите ФИО клиента..."
                  value={client.fullName}
                  onChange={(e) => {
                    const name = e.target.value;
                    setClient({ ...client, fullName: name });
                    const existing = clients.find(
                      (c) => c.fullName.toLowerCase() === name.toLowerCase()
                    );
                    if (existing) {
                      setClient({
                        fullName: existing.fullName,
                        email: existing.email || "",
                        passportNumber: existing.passportNumber || "",
                        phone: existing.phone || "",
                        breakfast: existing.breakfast ?? true,
                      });
                    }
                  }}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                  required
                />
                <datalist id="client-list">
                  {clients.map((c) => (
                    <option key={c.id} value={c.fullName} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Комментарий
                </label>
                <textarea
                  placeholder="Введите комментарий к брони..."
                  value={newBooking.description}
                  onChange={(e) =>
                    setNewBooking({
                      ...newBooking,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200 bg-white"
                  rows={3}
                />
              </div>

              <div>
                <div className="flex gap-1 items-center mb-3">
                  <label className="text-sm font-semibold text-slate-700">
                    Повару
                  </label>
                  <button type="button" onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? (
                      <FiChevronUp className="text-slate-600" size={20} />
                    ) : (
                      <FiChevronDown className="text-slate-600" size={20} />
                    )}
                  </button>
                </div>

                {isOpen && (
                  <textarea
                    placeholder="Комментарии повару..."
                    value={newBooking.toCook || ""}
                    onChange={(e) =>
                      setNewBooking({
                        ...newBooking,
                        toCook: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white resize-none"
                    rows={3}
                  />
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={client.breakfast}
                        onChange={(e) =>
                          setClient({ ...client, breakfast: e.target.checked })
                        }
                        className="sr-only"
                      />
                      <div
                        className={`w-12 h-6 rounded-full transition-colors duration-200 ${
                          client.breakfast ? "bg-emerald-500" : "bg-slate-300"
                        }`}
                      >
                        <div
                          className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                            client.breakfast
                              ? "transform translate-x-7"
                              : "transform translate-x-1"
                          }`}
                        />
                      </div>
                    </div>
                    <span className="font-medium text-slate-700">
                      Завтрак включён
                    </span>
                  </label>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Цвет ячейки
                  </label>
                  <div className="flex gap-3">
                    {[
                      {
                        name: "Красный",
                        value: "red",
                        className: "bg-red-500",
                      },
                      {
                        name: "Коричневый",
                        value: "brown",
                        className: "bg-amber-800",
                      },
                      {
                        name: "Зелёный",
                        value: "green",
                        className: "bg-green-500",
                      },
                      {
                        name: "Жёлтый",
                        value: "yellow",
                        className: "bg-yellow-400",
                      },
                    ].map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() =>
                          setNewBooking({ ...newBooking, color: color.value })
                        }
                        className={`w-8 h-8 rounded-full border-2 transition-all duration-200 transform ${
                          newBooking.color === color.value
                            ? "border-slate-800 scale-110 shadow-lg"
                            : "border-slate-300 hover:scale-105"
                        } ${color.className}`}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-6 border-t border-slate-200">
              <button
                onClick={() =>
                  closeModalWithAnimation(() => setShowAddModal(false))
                }
                className="px-8 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-all duration-200 font-medium"
              >
                Отмена
              </button>
              <button
                onClick={handleAddBooking}
                className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
              >
                ✅ Добавить бронь
              </button>
            </div>
          </div>
        </ModernModal>
      )}

      {/* Модалка комнаты */}
      {isAdmin && showRoomModal && selectedRoom && (
        <ModernModal
          onClose={() => setShowRoomModal(false)}
          title="Редактировать комнату"
        >
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-bold text-lg">{selectedRoom.roomName}</h3>
              <p className="text-gray-600">{selectedRoom.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Цена:
                </label>
                <input
                  type="number"
                  value={selectedRoom.price}
                  onChange={(e) =>
                    setSelectedRoom({ ...selectedRoom, price: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Тип комнаты:
                </label>
                <select
                  value={selectedRoom.roomType?.id || ""}
                  onChange={(e) =>
                    setSelectedRoom({
                      ...selectedRoom,
                      roomType: { id: Number(e.target.value) },
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Выберите тип</option>
                  <option value="TWIN">TWIN</option>
                  <option value="DOUBLE">DOUBLE</option>
                  <option value="TRIPLE">TRIPLE</option>
                </select>
              </div>
            </div>

            <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={selectedRoom.status}
                onChange={(e) =>
                  setSelectedRoom({ ...selectedRoom, status: e.target.checked })
                }
                className="w-4 h-4 text-blue-500 rounded focus:ring-blue-500"
              />
              <span className="font-medium">
                {selectedRoom.status ? "Комната активна" : "Комната выключена"}
              </span>
            </label>

            <div className="flex flex-col sm:flex-row gap-3 justify-between pt-4">
              <button
                onClick={() => setShowRoomModal(false)}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={handleSaveRoom}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold"
              >
                Сохранить изменения
              </button>
            </div>
          </div>
        </ModernModal>
      )}
      {/* Модалка редактирования */}
      {showEditModal && selectedBooking && (
        <ModernModal
          onClose={() => closeModalWithAnimation(() => setShowEditModal(false))}
          title={isReception ? "ℹ️ Информация о брони" : "Редактировать бронь"}
          animation={modalAnimation}
        >
          {isReception ? (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-200">
                <div className="space-y-3 text-sm">
                  <div className="bg-white p-3 rounded-xl">
                    <span className="text-slate-600">Гость: </span>
                    <span className="font-semibold text-slate-800">
                      {selectedBooking.client.fullName}
                    </span>
                  </div>
                  <div className="bg-white p-3 rounded-xl">
                    <span className="text-slate-600">Комната: </span>
                    <span className="font-semibold text-slate-800">
                      {selectedBooking.room.roomName}
                    </span>
                  </div>
                  <div className="bg-white p-3 rounded-xl">
                    <span className="text-slate-600">Тип: </span>
                    <span className="font-semibold text-slate-800">
                      {selectedBooking.room.roomType?.name || "—"}
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <div className="bg-white p-3 rounded-xl w-1/2">
                      <span className="text-slate-600">Дата заезда: </span>
                      <span className="font-semibold text-slate-800">
                        {selectedBooking.checkInTime.split("T")[0] || "—"}
                      </span>
                    </div>
                    <div className="bg-white p-3 rounded-xl w-1/2">
                      <span className="text-slate-600">Дата выезда: </span>
                      <span className="font-semibold text-slate-800">
                        {selectedBooking.checkInTime.split("T")[0] || "—"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Только комментарий повару */}
              <div>
                <div className="flex gap-1 items-center mb-3">
                  <label className="text-sm font-semibold text-slate-700">
                    Повару
                  </label>
                  <button type="button" onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? (
                      <FiChevronUp className="text-slate-600" size={20} />
                    ) : (
                      <FiChevronDown className="text-slate-600" size={20} />
                    )}
                  </button>
                </div>

                {isOpen && (
                  <textarea
                    placeholder="Комментарии повару..."
                    value={selectedBooking.toCook || ""}
                    onChange={(e) =>
                      setSelectedBooking({
                        ...selectedBooking,
                        toCook: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white resize-none"
                    rows={3}
                  />
                )}
              </div>

              <div className="flex gap-3 justify-between pt-6 border-t border-slate-200">
                <div className="flex gap-3">
                  <button
                    onClick={() =>
                      closeModalWithAnimation(() => setShowEditModal(false))
                    }
                    className="px-8 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-all duration-200 font-medium"
                  >
                    Отмена
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
                  >
                    💾 Сохранить
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-200">
                <div className="gap-4 text-sm">
                  <div className="md:col-span-2 bg-white p-3 rounded-xl">
                    <span className="text-slate-600">Гость: </span>
                    <span className="font-semibold text-slate-800">
                      {selectedBooking.client.fullName}
                    </span>
                  </div>
                  <div className="flex gap-4 justify-between mt-4">
                    <div className="bg-white p-3 rounded-xl w-1/2">
                      <span className="text-slate-600">Комната: </span>
                      <span className="font-semibold text-slate-800">
                        {selectedBooking.room.roomName}
                      </span>
                    </div>
                    <div className="bg-white p-3 rounded-xl w-1/2">
                      <span className="text-slate-600">Тип: </span>
                      <span className="font-semibold text-slate-800">
                        {selectedBooking.room.roomType?.name || "—"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Дата заезда
                  </label>
                  <input
                    type="date"
                    value={selectedBooking.checkInTime.split("T")[0]}
                    onChange={(e) =>
                      setSelectedBooking({
                        ...selectedBooking,
                        checkInTime: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Дата выезда
                  </label>
                  <input
                    type="date"
                    value={selectedBooking.checkOutTime.split("T")[0]}
                    onChange={(e) =>
                      setSelectedBooking({
                        ...selectedBooking,
                        checkOutTime: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Комментарий
                </label>
                <textarea
                  value={selectedBooking.description || ""}
                  onChange={(e) =>
                    setSelectedBooking({
                      ...selectedBooking,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white resize-none"
                  rows={3}
                />
              </div>

              <div>
                <div className="flex gap-1 items-center mb-3">
                  <label className="text-sm font-semibold text-slate-700">
                    Повару
                  </label>
                  <button type="button" onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? (
                      <FiChevronUp className="text-slate-600" size={20} />
                    ) : (
                      <FiChevronDown className="text-slate-600" size={20} />
                    )}
                  </button>
                </div>

                {isOpen && (
                  <textarea
                    placeholder="Комментарии повару..."
                    value={selectedBooking.toCook || ""}
                    onChange={(e) =>
                      setSelectedBooking({
                        ...selectedBooking,
                        toCook: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white resize-none"
                    rows={3}
                  />
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-slate-50 p-4 my-2 rounded-xl border border-slate-200">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={selectedBooking.breakfast}
                          onChange={(e) =>
                            setSelectedBooking({
                              ...selectedBooking,
                              breakfast: e.target.checked,
                            })
                          }
                          className="sr-only"
                        />
                        <div
                          className={`w-12 h-6 rounded-full transition-colors duration-200 ${
                            selectedBooking.breakfast
                              ? "bg-emerald-500"
                              : "bg-slate-300"
                          }`}
                        >
                          <div
                            className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                              selectedBooking.breakfast
                                ? "transform translate-x-7"
                                : "transform translate-x-1"
                            }`}
                          />
                        </div>
                      </div>
                      <span className="font-medium text-slate-700">
                        Завтрак включён
                      </span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                      Статус прибытия
                    </label>
                    <select
                      value={
                        selectedBooking.arrived === null
                          ? "null"
                          : selectedBooking.arrived
                          ? "true"
                          : "false"
                      }
                      onChange={(e) => {
                        const value =
                          e.target.value === "null"
                            ? null
                            : e.target.value === "true";
                        setSelectedBooking({
                          ...selectedBooking,
                          arrived: value,
                        });
                      }}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    >
                      <option value="null">⏳ Ожидается</option>
                      <option value="true">✅ Прибыл</option>
                      <option value="false">❌ Не прибыл</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                      Цвет ячейки
                    </label>
                    <div className="flex gap-3">
                      {[
                        {
                          name: "Красный",
                          value: "red",
                          className: "bg-red-500",
                        },
                        {
                          name: "Коричневый",
                          value: "brown",
                          className: "bg-amber-800",
                        },
                        {
                          name: "Зелёный",
                          value: "green",
                          className: "bg-green-500",
                        },
                        {
                          name: "Жёлтый",
                          value: "yellow",
                          className: "bg-yellow-400",
                        },
                      ].map((color) => (
                        <button
                          key={color.value}
                          onClick={() =>
                            setSelectedBooking({
                              ...selectedBooking,
                              color: color.value,
                            })
                          }
                          className={`w-8 h-8 rounded-full border-2 transition-all duration-200 transform ${
                            selectedBooking.color === color.value
                              ? "border-slate-800 scale-110 shadow-lg"
                              : "border-slate-300 hover:scale-105"
                          } ${color.className}`}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                      Изменить комнату
                    </label>
                    <select
                      value={selectedRoomId}
                      onChange={(e) => setSelectedRoomId(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    >
                      <option value="">Выберите комнату</option>
                      {rooms.map((room) => (
                        <option key={room.id} value={room.id}>
                          {room.roomName} ({room.roomType?.name || "—"})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-between pt-6 border-t border-slate-200">
                <button
                  onClick={handleDeleteBooking}
                  className="px-6 py-3 bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-xl hover:from-rose-600 hover:to-rose-700 transition-all duration-200 font-semibold"
                >
                  🗑️ Удалить бронь
                </button>
                <div className="flex gap-3">
                  <button
                    onClick={() =>
                      closeModalWithAnimation(() => setShowEditModal(false))
                    }
                    className="px-8 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-all duration-200 font-medium"
                  >
                    Отмена
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
                  >
                    💾 Сохранить
                  </button>
                </div>
              </div>
            </div>
          )}
        </ModernModal>
      )}
    </div>
  );
}

// Современный компонент модального окна
function ModernModal({ onClose, title, children, animation }) {
  return (
    <div
      className={`fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-md transition-opacity duration-300 ${
        animation === "entering" || animation === "exiting"
          ? "opacity-0"
          : "opacity-100"
      }`}
    >
      <div
        className={`relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto transform transition-all duration-300 ${
          animation === "entering"
            ? "scale-95 opacity-0 translate-y-4"
            : animation === "exiting"
            ? "scale-100 opacity-0 -translate-y-4"
            : "scale-100 opacity-100 translate-y-0"
        }`}
      >
        <div className="sticky top-0 bg-white border-b border-slate-200 px-8 py-6 rounded-t-3xl backdrop-blur-sm bg-opacity-90 z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-xl transition-all duration-200 text-slate-500 hover:text-slate-700 hover:rotate-90"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
        <div className="p-8">{children}</div>
      </div>
    </div>
  );
}

export default BookingsTable;
