import React, { useState } from "react";
import { motion } from "motion/react";
import { Bell, Check, Trash2, Filter, CheckCheck, Circle, AlertCircle, Info, CheckCircle, XCircle } from "lucide-react";

type NotificationType = "info" | "success" | "warning" | "error";

type Notification = {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  read: boolean;
};

const notificationsData: Notification[] = [
  { id: 1, type: "error", title: "Cảnh báo thiết bị", message: "Cảm biến nhiệt độ #3 ngừng hoạt động", time: "5 phút trước", read: false },
  { id: 2, type: "success", title: "Import thành công", message: "Đã import 250 bản ghi dữ liệu mới", time: "15 phút trước", read: false },
  { id: 3, type: "warning", title: "Cảnh báo nhiệt độ cao", message: "Nhiệt độ phòng A1 đạt 35°C", time: "1 giờ trước", read: false },
  { id: 4, type: "info", title: "Cập nhật hệ thống", message: "Hệ thống sẽ bảo trì vào 2h sáng mai", time: "2 giờ trước", read: true },
  { id: 5, type: "success", title: "Người dùng mới", message: "Có 5 người dùng mới đăng ký", time: "3 giờ trước", read: true },
  { id: 6, type: "info", title: "Báo cáo tuần", message: "Báo cáo hiệu suất tuần đã sẵn sàng", time: "1 ngày trước", read: true },
  { id: 7, type: "warning", title: "Dung lượng sắp đầy", message: "Dung lượng lưu trữ đạt 85%", time: "2 ngày trước", read: true },
  { id: 8, type: "error", title: "Lỗi kết nối", message: "Mất kết nối với 3 thiết bị", time: "2 ngày trước", read: true },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(notificationsData);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [typeFilter, setTypeFilter] = useState<"all" | NotificationType>("all");

  const filteredNotifications = notifications.filter(notif => {
    const matchesReadFilter = filter === "all" || 
      (filter === "unread" && !notif.read) || 
      (filter === "read" && notif.read);
    const matchesTypeFilter = typeFilter === "all" || notif.type === typeFilter;
    return matchesReadFilter && matchesTypeFilter;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = (id: number) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const handleDelete = (id: number) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const handleDeleteAll = () => {
    if (confirm("Bạn có chắc muốn xóa tất cả thông báo?")) {
      setNotifications([]);
    }
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5" />;
      case "error":
        return <XCircle className="w-5 h-5" />;
      case "warning":
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getNotificationColor = (type: NotificationType) => {
    switch (type) {
      case "success":
        return "bg-green-100 text-green-600 border-green-200";
      case "error":
        return "bg-red-100 text-red-600 border-red-200";
      case "warning":
        return "bg-yellow-100 text-yellow-600 border-yellow-200";
      default:
        return "bg-blue-100 text-blue-600 border-blue-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-gray-900 mb-2">Thông báo</h1>
          <p className="text-gray-600">
            Bạn có {unreadCount} thông báo chưa đọc
          </p>
        </div>
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
            className="px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-red-600 hover:text-red-600 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCheck className="w-5 h-5" />
            Đánh dấu tất cả đã đọc
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDeleteAll}
            className="px-4 py-3 bg-gradient-to-r from-red-700 to-red-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
          >
            <Trash2 className="w-5 h-5" />
            Xóa tất cả
          </motion.button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Tổng thông báo</p>
          <p className="text-2xl text-gray-900">{notifications.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Chưa đọc</p>
          <p className="text-2xl text-red-600">{unreadCount}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Đã đọc</p>
          <p className="text-2xl text-green-600">{notifications.length - unreadCount}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Hôm nay</p>
          <p className="text-2xl text-blue-600">5</p>
        </div>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-4 border border-gray-200"
      >
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-600" />
            <span className="text-gray-700">Bộ lọc:</span>
          </div>
          
          {/* Read/Unread Filter */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === "all"
                  ? "bg-red-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === "unread"
                  ? "bg-red-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Chưa đọc
            </button>
            <button
              onClick={() => setFilter("read")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === "read"
                  ? "bg-red-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Đã đọc
            </button>
          </div>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-red-600 focus:outline-none transition-colors"
          >
            <option value="all">Tất cả loại</option>
            <option value="info">Thông tin</option>
            <option value="success">Thành công</option>
            <option value="warning">Cảnh báo</option>
            <option value="error">Lỗi</option>
          </select>
        </div>
      </motion.div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl p-12 border border-gray-200 text-center"
          >
            <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-xl text-gray-600">Không có thông báo</p>
          </motion.div>
        ) : (
          filteredNotifications.map((notification, index) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`bg-white rounded-2xl p-4 border-2 transition-all hover:shadow-md ${
                notification.read ? "border-gray-200" : "border-red-200 bg-red-50"
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border-2 flex-shrink-0 ${getNotificationColor(notification.type)}`}>
                  {getNotificationIcon(notification.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <h3 className="text-gray-900">{notification.title}</h3>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {!notification.read && (
                        <Circle className="w-2 h-2 fill-red-600 text-red-600" />
                      )}
                      <span className="text-sm text-gray-500">{notification.time}</span>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-3">{notification.message}</p>
                  
                  {/* Actions */}
                  <div className="flex gap-2">
                    {!notification.read && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm flex items-center gap-1"
                      >
                        <Check className="w-4 h-4" />
                        Đánh dấu đã đọc
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(notification.id)}
                      className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm flex items-center gap-1"
                    >
                      <Trash2 className="w-4 h-4" />
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Pagination */}
      {filteredNotifications.length > 0 && (
        <div className="flex justify-center">
          <div className="flex gap-2">
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              Trước
            </button>
            <button className="px-4 py-2 bg-red-600 text-white rounded-lg">1</button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">2</button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">3</button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              Sau
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
