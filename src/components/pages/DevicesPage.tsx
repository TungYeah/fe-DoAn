import React, { useState } from "react";
import { motion } from "motion/react";
import { Search, Plus, Edit, Trash2, Power, PowerOff, Wifi, WifiOff, MapPin, Download } from "lucide-react";
import CommentsSection from "../CommentsSection";

const devicesData = [
  { id: 1, name: "Cảm biến nhiệt độ #1", type: "Nhiệt độ", location: "Phòng A1", status: "online", value: "28.5°C", lastUpdate: "2 phút trước" },
  { id: 2, name: "Cảm biến độ ẩm #1", type: "Độ ẩm", location: "Phòng A1", status: "online", value: "65%", lastUpdate: "3 phút trước" },
  { id: 3, name: "Camera giám sát #1", type: "Camera", location: "Hành lang B", status: "offline", value: "N/A", lastUpdate: "1 giờ trước" },
  { id: 4, name: "Cảm biến ánh sáng #1", type: "Ánh sáng", location: "Phòng C2", status: "online", value: "850 lux", lastUpdate: "1 phút trước" },
  { id: 5, name: "Cảm biến khí gas #1", type: "Khí gas", location: "Phòng D3", status: "warning", value: "120 ppm", lastUpdate: "4 phút trước" },
];

export default function DevicesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showComments, setShowComments] = useState(false);

  const filteredDevices = devicesData.filter(device =>
    device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    device.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExport = (format: "csv" | "excel" | "json") => {
    alert(`Đang xuất danh sách thiết bị dạng ${format.toUpperCase()}...`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-gray-900 mb-2">Quản lý thiết bị</h1>
          <p className="text-gray-600">Theo dõi và quản lý tất cả thiết bị IoT</p>
        </div>
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleExport("excel")}
            className="px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-red-600 hover:text-red-600 transition-all flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            Xuất Excel
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-gradient-to-r from-red-700 to-red-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Thêm thiết bị
          </motion.button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Wifi className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Online</p>
              <p className="text-2xl text-gray-900">234</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <WifiOff className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Offline</p>
              <p className="text-2xl text-gray-900">14</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Power className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Cảnh báo</p>
              <p className="text-2xl text-gray-900">8</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Power className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Hoạt động tốt</p>
              <p className="text-2xl text-gray-900">94%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm thiết bị..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-600 focus:outline-none transition-colors"
            />
          </div>
          <button
            onClick={() => setShowComments(!showComments)}
            className="px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-red-600 hover:text-red-600 transition-all"
          >
            {showComments ? "Ẩn" : "Hiện"} bình luận
          </button>
        </div>
      </div>

      {/* Devices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDevices.map((device, index) => (
          <motion.div
            key={device.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{ y: -5 }}
            className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-lg transition-all"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  device.status === "online" ? "bg-green-100" :
                  device.status === "offline" ? "bg-red-100" : "bg-yellow-100"
                }`}>
                  {device.status === "online" ? (
                    <Wifi className="w-6 h-6 text-green-600" />
                  ) : device.status === "offline" ? (
                    <WifiOff className="w-6 h-6 text-red-600" />
                  ) : (
                    <Power className="w-6 h-6 text-yellow-600" />
                  )}
                </div>
                <div>
                  <h3 className="text-gray-900">{device.name}</h3>
                  <p className="text-sm text-gray-500">{device.type}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-lg text-xs ${
                device.status === "online" ? "bg-green-100 text-green-700" :
                device.status === "offline" ? "bg-red-100 text-red-700" :
                "bg-yellow-100 text-yellow-700"
              }`}>
                {device.status === "online" ? "Online" :
                 device.status === "offline" ? "Offline" : "Cảnh báo"}
              </span>
            </div>

            {/* Value */}
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-1">Giá trị hiện tại</p>
              <p className="text-3xl text-gray-900">{device.value}</p>
            </div>

            {/* Location */}
            <div className="flex items-center gap-2 mb-4 text-gray-600">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">{device.location}</span>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">Cập nhật: {device.lastUpdate}</p>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors">
                  <Edit className="w-4 h-4" />
                </button>
                <button className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Comments Section */}
      {showComments && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <CommentsSection entityId="devices-page" entityType="page" />
        </motion.div>
      )}
    </div>
  );
}