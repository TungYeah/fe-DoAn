import { useNavigate } from "react-router-dom";
import React, { useState } from "react";
import { motion } from "motion/react";
import {
  Thermometer,
  Droplets,
  Cpu,
  Database,
  Power,
  AlertTriangle,
  Plus,
  TrendingUp,
  Clock,
  Wifi,
  WifiOff,
  BarChart3,
  FileDown,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// ======================
//  Fake stats for demo
// ======================
const userStatsData = [
  {
    label: "Thiết bị của tôi",
    value: "12",
    change: "+2 mới",
    trend: "up",
    icon: Cpu,
    color: "from-red-500 to-red-600",
  },
  {
    label: "Dữ liệu hôm nay",
    value: "2,847",
    change: "+324",
    trend: "up",
    icon: Database,
    color: "from-blue-500 to-blue-600",
  },
  {
    label: "Đang hoạt động",
    value: "10/12",
    change: "83%",
    trend: "up",
    icon: Power,
    color: "from-green-500 to-green-600",
  },
  {
    label: "Cảnh báo",
    value: "3",
    change: "Mới nhất 5 phút",
    trend: "warning",
    icon: AlertTriangle,
    color: "from-yellow-500 to-yellow-600",
  },
];

// ======================
//  Demo sensor data
// ======================
const sensorData = [
  { time: "06:00", temp: 24.5, humidity: 65 },
  { time: "08:00", temp: 25.2, humidity: 63 },
  { time: "10:00", temp: 27.1, humidity: 58 },
  { time: "12:00", temp: 29.3, humidity: 54 },
  { time: "14:00", temp: 30.5, humidity: 52 },
  { time: "16:00", temp: 28.7, humidity: 56 },
  { time: "18:00", temp: 26.4, humidity: 61 },
  { time: "20:00", temp: 25.1, humidity: 64 },
];

// ======================
//  Demo devices
// ======================
const userDevices = [
  {
    id: "DEV001",
    name: "Phòng khách",
    type: "Temp/Humidity",
    status: "online",
    lastUpdate: "2 phút trước",
    temp: "25.5°C",
    humidity: "62%",
  },
  {
    id: "DEV002",
    name: "Phòng ngủ",
    type: "Temp/Humidity",
    status: "online",
    lastUpdate: "1 phút trước",
    temp: "24.2°C",
    humidity: "68%",
  },
  {
    id: "DEV003",
    name: "Vườn",
    type: "Soil Moisture",
    status: "online",
    lastUpdate: "5 phút trước",
    temp: "-",
    humidity: "45%",
  },
  {
    id: "DEV004",
    name: "Garage",
    type: "Motion",
    status: "offline",
    lastUpdate: "2 giờ trước",
    temp: "-",
    humidity: "-",
  },
];

// ======================
//  Demo activities
// ======================
const recentActivities = [
  {
    device: "DEV001 - Phòng khách",
    action: "Nhiệt độ vượt ngưỡng (>28°C)",
    time: "5 phút trước",
    type: "warning",
  },
  {
    device: "DEV002 - Phòng ngủ",
    action: "Cập nhật dữ liệu thành công",
    time: "1 phút trước",
    type: "success",
  },
  {
    device: "DEV004 - Garage",
    action: "Mất kết nối",
    time: "2 giờ trước",
    type: "error",
  },
  {
    device: "DEV003 - Vườn",
    action: "Độ ẩm đất thấp (<50%)",
    time: "10 phút trước",
    type: "info",
  },
];

// ==========================================
//                DASHBOARD PAGE
// ==========================================
export default function DashboardPage() {
  const navigate = useNavigate();

  const [selectedMetric, setSelectedMetric] = useState<"temp" | "humidity">(
    "temp"
  );

  return (
    <div className="space-y-6">
      {/* ======================= */}
      {/* HEADER */}
      {/* ======================= */}
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-gray-900 mb-2">Dashboard của tôi</h1>
          <p className="text-gray-600">
            Tổng quan thiết bị và dữ liệu cảm biến cá nhân.
          </p>
        </div>

        {/* Add Device Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
                          onClick={() => navigate("/dashboard/devices")}

            className="px-6 py-3 bg-gradient-to-r from-red-700 to-red-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Thêm thiết bị
          </motion.button>
</motion.div>
      {/* ======================= */}
      {/* STATS CARDS */}
      {/* ======================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {userStatsData.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-white rounded-2xl p-6 border shadow-sm hover:shadow-lg"
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span
                  className={`px-2 py-1 rounded-lg text-xs ${
                    stat.trend === "warning"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {stat.change}
                </span>
              </div>

              <p className="text-gray-600 text-sm">{stat.label}</p>
              <p className="text-3xl text-gray-900">{stat.value}</p>
            </motion.div>
          );
        })}
      </div>

      {/* ======================= */}
      {/* SENSOR CHART */}
      {/* ======================= */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-6 border shadow-sm"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl text-gray-900">Dữ liệu cảm biến (24 giờ)</h3>
            <p className="text-sm text-gray-600">Biểu diễn nhiệt độ và độ ẩm</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setSelectedMetric("temp")}
              className={`px-4 py-2 rounded-xl ${
                selectedMetric === "temp"
                  ? "bg-red-100 text-red-700 border border-red-300"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Thermometer className="w-4 h-4 inline" /> Nhiệt độ
            </button>

            <button
              onClick={() => setSelectedMetric("humidity")}
              className={`px-4 py-2 rounded-xl ${
                selectedMetric === "humidity"
                  ? "bg-blue-100 text-blue-700 border border-blue-300"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Droplets className="w-4 h-4 inline" /> Độ ẩm
            </button>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={sensorData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Legend />
            {selectedMetric === "temp" ? (
              <Line
                type="monotone"
                dataKey="temp"
                stroke="#ef4444"
                strokeWidth={2}
              />
            ) : (
              <Line
                type="monotone"
                dataKey="humidity"
                stroke="#3b82f6"
                strokeWidth={2}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* ======================= */}
      {/* DEVICES + RECENT ACTIVITY */}
      {/* ======================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* My Devices */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 border shadow-sm lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl text-gray-900">Thiết bị của tôi</h3>
            <button
              onClick={() => navigate("/dashboard/devices")}
              className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
            >
              Xem tất cả <TrendingUp className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            {userDevices.map((d, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex justify-between p-4 border rounded-xl hover:shadow"
              >
                <div className="flex gap-4 items-center">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      d.status === "online" ? "bg-green-100" : "bg-gray-200"
                    }`}
                  >
                    {d.status === "online" ? (
                      <Wifi className="w-5 h-5 text-green-600" />
                    ) : (
                      <WifiOff className="w-5 h-5 text-gray-500" />
                    )}
                  </div>

                  <div>
                    <p className="text-gray-900">{d.name}</p>
                    <p className="text-xs text-gray-500">{d.type}</p>
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {d.lastUpdate}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  {d.temp !== "-" && (
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Nhiệt độ</p>
                      <p className="text-gray-900">{d.temp}</p>
                    </div>
                  )}
                  {d.humidity !== "-" && (
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Độ ẩm</p>
                      <p className="text-gray-900">{d.humidity}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent Activities */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 border shadow-sm"
        >
          <h3 className="text-xl text-gray-900 mb-6">Hoạt động gần đây</h3>

          <div className="space-y-4">
            {recentActivities.map((a, i) => (
              <motion.div key={i} className="flex gap-3">
                <div
                  className={`w-2 h-2 rounded-full mt-2 ${
                    a.type === "success"
                      ? "bg-green-500"
                      : a.type === "warning"
                      ? "bg-yellow-500"
                      : a.type === "info"
                      ? "bg-blue-500"
                      : "bg-red-500"
                  }`}
                ></div>

                <div>
                  <p className="text-xs text-gray-500">{a.device}</p>
                  <p className="text-sm text-gray-900">{a.action}</p>
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {a.time}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ======================= */}
      {/* QUICK ACTIONS */}
      {/* ======================= */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-red-500 to-red-700 rounded-2xl p-8 text-white"
      >
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-2xl mb-2">Bắt đầu sử dụng</h3>
            <p className="text-red-100">
              Khám phá các tính năng của nền tảng IoT
            </p>
          </div>

          <div className="flex gap-3">
            {/* CHARTS PAGE */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => navigate("/dashboard/charts")}
              className="flex items-center gap-2 px-5 py-3 bg-white/20 border border-white/30 rounded-xl"
            >
              <BarChart3 className="w-4 h-4" /> Xem biểu đồ
            </motion.button>

            {/* QUERY PAGE */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => navigate("/dashboard/query")}
              className="flex items-center gap-2 px-5 py-3 bg-white text-red-600 rounded-xl hover:shadow-lg"
            >
              <FileDown className="w-4 h-4" /> Export dữ liệu
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
