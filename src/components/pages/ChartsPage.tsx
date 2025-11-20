import React, { useState } from "react";
import { motion } from "motion/react";
import { BarChart3, Download, RefreshCw, Filter } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";

const deviceDataByHour = [
  { time: "00:00", temp: 24, humid: 60, light: 0, gas: 50 },
  { time: "04:00", temp: 22, humid: 65, light: 0, gas: 48 },
  { time: "08:00", temp: 26, humid: 55, light: 400, gas: 55 },
  { time: "12:00", temp: 30, humid: 50, light: 850, gas: 60 },
  { time: "16:00", temp: 28, humid: 52, light: 600, gas: 58 },
  { time: "20:00", temp: 25, humid: 58, light: 200, gas: 52 },
  { time: "24:00", temp: 23, humid: 62, light: 0, gas: 50 },
];

const deviceStatus = [
  { name: "Online", value: 234, color: "#10b981" },
  { name: "Offline", value: 14, color: "#ef4444" },
];

const devicePerformance = [
  { device: "Nhiệt độ", performance: 95, uptime: 98, accuracy: 92 },
  { device: "Độ ẩm", performance: 92, uptime: 96, accuracy: 90 },
  { device: "Ánh sáng", performance: 88, uptime: 94, accuracy: 88 },
  { device: "Khí gas", performance: 90, uptime: 95, accuracy: 89 },
];

const deviceActivity = [
  { day: "T2", devices: 220 },
  { day: "T3", devices: 235 },
  { day: "T4", devices: 228 },
  { day: "T5", devices: 245 },
  { day: "T6", devices: 238 },
  { day: "T7", devices: 210 },
  { day: "CN", devices: 195 },
];

export default function ChartsPage() {
  const [timeRange, setTimeRange] = useState("24h");
  const [chartType, setChartType] = useState("line");

  const handleExport = (format: "png" | "svg" | "pdf") => {
    alert(`Đang xuất biểu đồ dạng ${format.toUpperCase()}...`);
  };

  const handleRefresh = () => {
    alert("Đang làm mới dữ liệu...");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-gray-900 mb-2">Biểu đồ thiết bị</h1>
          <p className="text-gray-600">Phân tích và trực quan hóa dữ liệu thiết bị IoT</p>
        </div>
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRefresh}
            className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-red-600 hover:text-red-600 transition-all flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Làm mới
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleExport("png")}
            className="px-4 py-2 bg-gradient-to-r from-red-700 to-red-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Xuất biểu đồ
          </motion.button>
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
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-red-600 focus:outline-none transition-colors"
          >
            <option value="24h">24 giờ</option>
            <option value="7d">7 ngày</option>
            <option value="30d">30 ngày</option>
            <option value="1y">1 năm</option>
          </select>
          <select
            value={chartType}
            onChange={(e) => setChartType(e.target.value)}
            className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-red-600 focus:outline-none transition-colors"
          >
            <option value="line">Biểu đồ đường</option>
            <option value="bar">Biểu đồ cột</option>
            <option value="area">Biểu đồ vùng</option>
          </select>
        </div>
      </motion.div>

      {/* Main Chart - Device Data Over Time */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl p-6 border border-gray-200"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl text-gray-900 mb-1">Dữ liệu thiết bị theo thời gian</h3>
            <p className="text-sm text-gray-600">Theo dõi các thông số thiết bị trong 24 giờ</p>
          </div>
          <BarChart3 className="w-6 h-6 text-red-600" />
        </div>
        <ResponsiveContainer width="100%" height={350}>
          {chartType === "line" ? (
            <LineChart data={deviceDataByHour}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="time" stroke="#999" />
              <YAxis stroke="#999" />
              <Tooltip />
              <Line type="monotone" dataKey="temp" stroke="#ef4444" strokeWidth={2} name="Nhiệt độ" />
              <Line type="monotone" dataKey="humid" stroke="#3b82f6" strokeWidth={2} name="Độ ẩm" />
              <Line type="monotone" dataKey="light" stroke="#f59e0b" strokeWidth={2} name="Ánh sáng" />
              <Line type="monotone" dataKey="gas" stroke="#10b981" strokeWidth={2} name="Khí gas" />
            </LineChart>
          ) : chartType === "bar" ? (
            <BarChart data={deviceDataByHour}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="time" stroke="#999" />
              <YAxis stroke="#999" />
              <Tooltip />
              <Bar dataKey="temp" fill="#ef4444" name="Nhiệt độ" />
              <Bar dataKey="humid" fill="#3b82f6" name="Độ ẩm" />
              <Bar dataKey="light" fill="#f59e0b" name="Ánh sáng" />
              <Bar dataKey="gas" fill="#10b981" name="Khí gas" />
            </BarChart>
          ) : (
            <AreaChart data={deviceDataByHour}>
              <defs>
                <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="time" stroke="#999" />
              <YAxis stroke="#999" />
              <Tooltip />
              <Area type="monotone" dataKey="temp" stroke="#ef4444" fillOpacity={1} fill="url(#colorTemp)" name="Nhiệt độ" />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </motion.div>

      {/* Secondary Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Device Status Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 border border-gray-200"
        >
          <h3 className="text-xl text-gray-900 mb-6">Trạng thái thiết bị</h3>
          <div className="flex items-center justify-between">
            <ResponsiveContainer width="50%" height={200}>
              <PieChart>
                <Pie
                  data={deviceStatus}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label
                >
                  {deviceStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-4">
              {deviceStatus.map((item) => (
                <div key={item.name} className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <div>
                    <p className="text-sm text-gray-700">{item.name}</p>
                    <p className="text-2xl text-gray-900">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Device Activity Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6 border border-gray-200"
        >
          <h3 className="text-xl text-gray-900 mb-6">Hoạt động theo ngày</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={deviceActivity}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" stroke="#999" />
              <YAxis stroke="#999" />
              <Tooltip />
              <Bar dataKey="devices" fill="#ef4444" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Performance Radar Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl p-6 border border-gray-200"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl text-gray-900 mb-1">Hiệu suất thiết bị</h3>
            <p className="text-sm text-gray-600">So sánh hiệu suất, uptime và độ chính xác</p>
          </div>
          <button
            onClick={() => handleExport("svg")}
            className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-red-600 hover:text-red-600 transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Xuất SVG
          </button>
        </div>
        <div className="grid lg:grid-cols-2 gap-8">
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={devicePerformance}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="device" stroke="#6b7280" />
              <PolarRadiusAxis stroke="#6b7280" />
              <Radar name="Hiệu suất" dataKey="performance" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
              <Radar name="Uptime" dataKey="uptime" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
              <Radar name="Độ chính xác" dataKey="accuracy" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
          <div className="space-y-4">
            <div className="p-4 bg-red-50 rounded-xl border border-red-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-3 h-3 bg-red-600 rounded-full" />
                <span className="text-gray-900">Hiệu suất trung bình</span>
              </div>
              <p className="text-3xl text-red-600">91.25%</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-3 h-3 bg-blue-600 rounded-full" />
                <span className="text-gray-900">Uptime trung bình</span>
              </div>
              <p className="text-3xl text-blue-600">95.75%</p>
            </div>
            <div className="p-4 bg-green-50 rounded-xl border border-green-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-3 h-3 bg-green-600 rounded-full" />
                <span className="text-gray-900">Độ chính xác</span>
              </div>
              <p className="text-3xl text-green-600">89.75%</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Export Options */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-br from-red-50 to-white rounded-2xl p-6 border border-red-200"
      >
        <h3 className="text-xl text-gray-900 mb-4">Xuất dữ liệu</h3>
        <p className="text-gray-600 mb-4">Xuất biểu đồ và dữ liệu dưới nhiều định dạng khác nhau</p>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleExport("png")}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            PNG
          </button>
          <button
            onClick={() => handleExport("svg")}
            className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            SVG
          </button>
          <button
            onClick={() => handleExport("pdf")}
            className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            PDF
          </button>
        </div>
      </motion.div>
    </div>
  );
}
