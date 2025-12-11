import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  Bell,
  Trash2,
  Clock,
  Info,
  RefreshCcw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Check,
  ChevronDown,
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [actionFilter, setActionFilter] = useState("all");
  const [visible, setVisible] = useState(10); // số thông báo hiển thị ban đầu

  const email = localStorage.getItem("email");
  const token = localStorage.getItem("token");

  // =========================
  // TIME AGO
  // =========================
  function timeAgo(dateStr: string) {
    const diff = (new Date().getTime() - new Date(dateStr).getTime()) / 1000;

    if (diff < 60) return `${Math.floor(diff)} giây trước`;
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;

    return `${Math.floor(diff / 86400)} ngày trước`;
  }

  // =========================
  // LOAD DATA
  // =========================
  const loadNotifications = async () => {
    if (!token) return;

    try {
      setLoading(true);

      const res = await fetch(
        `${API_BASE_URL}/api/admin/history?page=0&size=1000`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Lỗi tải thông báo");

      const data = await res.json();

      const list = (data.content || [])
        .map((h: any) => ({
          id: h.id,
          action: h.action ?? "",
          historyType: h.historyType ?? "",
          description: h.description ?? "",
          createdBy: h.createdBy ?? "",
          createDate: h.createDate,
          read: false,
        }))
        .filter((n: any) => n.createdBy === email);

      setNotifications(list);
      setFiltered(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  // =========================
  // STATS
  // =========================
  const total = notifications.length;

  const today = notifications.filter((n) => {
    const d = new Date(n.createDate);
    const now = new Date();
    return (
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear()
    );
  }).length;

  // =========================
  // APPLY FILTER
  // =========================
  useEffect(() => {
    if (actionFilter === "all") {
      setFiltered(notifications);
    } else {
      setFiltered(notifications.filter((n) => n.action === actionFilter));
    }
  }, [actionFilter, notifications]);

  // =========================
  // LOCAL ACTIONS
  // =========================
  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // =========================
  // COLORS + ICONS
  // =========================
  const getColor = (action: string) =>
    action === "CREATE"
      ? "border-green-300 bg-green-50"
      : action === "UPDATE"
        ? "border-blue-300 bg-blue-50"
        : "border-red-300 bg-red-50";
  const getNotificationIcon = (
    type: "success" | "error" | "warning" | "info"
  ) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case "error":
        return <XCircle className="w-6 h-6 text-red-600" />;
      case "warning":
        return <AlertCircle className="w-6 h-6 text-yellow-600" />;
      default:
        return <Info className="w-6 h-6 text-blue-600" />;
    }
  };
  const getNotificationType = (action: string): "success" | "info" | "error" | "warning" => {
    if (action === "CREATE") return "success";
    if (action === "UPDATE") return "info";
    if (action === "DELETE") return "error";
    return "warning";
  };
  const getBgColor = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-300";
      case "warning":
        return "bg-yellow-50 border-yellow-300";
      case "error":
        return "bg-red-50 border-red-300";
      default:
        return "bg-blue-50 border-blue-300";
    }
  };

  const getIcon = (action: string) =>
    action === "DELETE" ? (
      <XCircle className="text-red-600 w-6 h-6" />
    ) : action === "UPDATE" ? (
      <CheckCircle className="text-blue-600 w-6 h-6" />
    ) : action === "CREATE" ? (
      <CheckCircle className="text-green-600 w-6 h-6" />
    ) : (
      <Info className="text-gray-600 w-6 h-6" />
    );

  // =========================
  // RENDER
  // =========================
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-gray-900 mb-2">Thông báo</h1>
          <p className="text-gray-600">
            Bạn có {filtered.length} thông báo từ hoạt động của bạn
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={loadNotifications}
          className="px-6 py-3 bg-gradient-to-r from-red-700 to-red-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
        >
          <RefreshCcw className="w-5 h-5" />
          Làm mới
        </motion.button>
      </motion.div>

      {/* =========================
          STATS BOXES
      ========================= */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Tổng thông báo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all"
        >
          <p className="text-sm text-gray-600 mb-1">Tổng thông báo</p>
          <p className="text-2xl text-gray-900">
            {loading ? "…" : filtered.length.toLocaleString("vi-VN")}
          </p>
        </motion.div>

        {/* Thông báo hôm nay */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all"
        >
          <p className="text-sm text-gray-600 mb-1">Hôm nay</p>
          <p className="text-2xl text-blue-600">
            {loading ? "…" : today.toLocaleString("vi-VN")}
          </p>
        </motion.div>

        {/* Tạo mới */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all"
        >
          <p className="text-sm text-gray-600 mb-1">Tạo mới</p>
          <p className="text-2xl text-green-600">
            {loading
              ? "…"
              : notifications
                .filter((n) => n.action === "CREATE")
                .length.toLocaleString("vi-VN")}
          </p>
        </motion.div>

        {/* Cập nhật */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all"
        >
          <p className="text-sm text-gray-600 mb-1">Cập nhật</p>
          <p className="text-2xl text-orange-600">
            {loading
              ? "…"
              : notifications
                .filter((n) => n.action === "UPDATE")
                .length.toLocaleString("vi-VN")}
          </p>
        </motion.div>

        {/* Xóa */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all"
        >
          <p className="text-sm text-gray-600 mb-1">Đã xóa</p>
          <p className="text-2xl text-red-600">
            {loading
              ? "…"
              : notifications
                .filter((n) => n.action === "DELETE")
                .length.toLocaleString("vi-VN")}
          </p>
        </motion.div>
      </div>

      {/* FILTER BAR */}
      <div className="flex gap-3 items-center bg-white p-4 rounded-xl border shadow-sm">
        <span className="text-gray-700 font-medium">Lọc theo hành động:</span>

        <button
          onClick={() => setActionFilter("all")}
          className={`px-4 py-2 rounded-lg border ${actionFilter === "all"
              ? "bg-red-600 text-white border-red-600"
              : "bg-gray-100 hover:bg-gray-200"
            }`}
        >
          Tất cả
        </button>

        <button
          onClick={() => setActionFilter("CREATE")}
          className={`px-4 py-2 rounded-lg border ${actionFilter === "CREATE"
              ? "bg-green-600 text-white border-green-600"
              : "bg-gray-100 hover:bg-gray-200"
            }`}
        >
          Tạo mới
        </button>

        <button
          onClick={() => setActionFilter("UPDATE")}
          className={`px-4 py-2 rounded-lg border ${actionFilter === "UPDATE"
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-gray-100 hover:bg-gray-200"
            }`}
        >
          Cập nhật
        </button>

        <button
          onClick={() => setActionFilter("DELETE")}
          className={`px-4 py-2 rounded-lg border ${actionFilter === "DELETE"
              ? "bg-red-600 text-white border-red-600"
              : "bg-gray-100 hover:bg-gray-200"
            }`}
        >
          Xóa
        </button>
      </div>

      {/* LIST */}
      {/* LIST */}
      <div className="space-y-4">
        {loading && <p className="text-center">Đang tải...</p>}

        {!loading && filtered.length === 0 && (
          <div className="bg-white border rounded-xl p-10 text-center">
            <Bell className="w-16 h-16 mx-auto text-gray-400" />
            <p className="text-gray-600 mt-3">Không có thông báo</p>
          </div>
        )}

        {!loading &&
          filtered.slice(0, visible).map((n, idx) => {
            const type = getNotificationType(n.action);

            return (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className={`relative flex gap-4 p-4 rounded-xl bg-white border hover:shadow-md ${type === "success"
                    ? "border-green-200"
                    : type === "warning"
                      ? "border-yellow-200"
                      : type === "error"
                        ? "border-red-200"
                        : "border-blue-200"
                  }`}
              >
                {/* TIME AGO – góc phải */}
                <div className="absolute right-4 top-3 text-sm text-gray-500 flex gap-2 items-center">
                  <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                  {timeAgo(n.createDate)}
                </div>

                {/* ICON – có màu */}
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center shadow-sm ${type === "success"
                      ? "bg-green-100 text-green-600"
                      : type === "warning"
                        ? "bg-yellow-100 text-yellow-600"
                        : type === "error"
                          ? "bg-red-100 text-red-600"
                          : "bg-blue-100 text-blue-600"
                    }`}
                >
                  {getNotificationIcon(type)}
                </div>

                {/* CONTENT */}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-lg">
                    {n.historyType.replace(/_/g, " ")}
                  </h3>

                  <p className="text-gray-800 mt-1 font-medium">
                    Người thực hiện:{" "}
                    <span className="text-blue-700">{n.createdBy}</span>
                  </p>

                  <p className="text-gray-700 mt-1">
                    {n.description || "Không có mô tả"}
                  </p>

                  {/* ACTION BUTTONS */}
                  <div className="flex gap-3 mt-3">
                    {!n.read && (
                      <button
                        onClick={() => markAsRead(n.id)}
                        className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 flex items-center gap-1"
                      >
                        <Check className="w-4 h-4" /> Đánh dấu đã đọc
                      </button>
                    )}

                    <button
                      onClick={() => deleteNotification(n.id)}
                      className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 flex items-center gap-1"
                    >
                      <Trash2 className="w-4 h-4" /> Xóa
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}

        {/* NÚT XEM THÊM */}
        {!loading && visible < filtered.length && (
          <div className="flex justify-center mt-4">

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setVisible((v) => v + 10)}
              className="px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-600 text-red rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
            >
              <ChevronDown className="w-5 h-5" />
              Xem thêm
            </motion.button>
          </div>
        )}
      </div>

    </div>
  );
}
