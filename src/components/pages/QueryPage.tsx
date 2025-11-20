import React, { useState } from "react";
import { motion } from "motion/react";
import { Search, Filter, Download, Calendar, Cpu, Database, Play } from "lucide-react";

const queryResults = [
  { id: 1, timestamp: "2024-06-15 14:30:25", device: "Cảm biến nhiệt độ #1", value: "28.5°C", status: "normal" },
  { id: 2, timestamp: "2024-06-15 14:30:20", device: "Cảm biến độ ẩm #1", value: "65%", status: "normal" },
  { id: 3, timestamp: "2024-06-15 14:30:15", device: "Cảm biến ánh sáng #1", value: "850 lux", status: "normal" },
  { id: 4, timestamp: "2024-06-15 14:30:10", device: "Cảm biến khí gas #1", value: "120 ppm", status: "warning" },
  { id: 5, timestamp: "2024-06-15 14:30:05", device: "Cảm biến nhiệt độ #2", value: "32.1°C", status: "warning" },
];

export default function QueryPage() {
  const [deviceFilter, setDeviceFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showResults, setShowResults] = useState(false);

  const handleQuery = () => {
    setShowResults(true);
  };

  const handleExport = (format: "csv" | "json" | "excel") => {
    // Giả lập export
    alert(`Đang xuất dữ liệu dạng ${format.toUpperCase()}...`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-gray-900 mb-2">Truy vấn dữ liệu</h1>
          <p className="text-gray-600">Tìm kiếm và lọc dữ liệu từ thiết bị IoT</p>
        </div>
      </div>

      {/* Query Builder */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-6 border border-gray-200"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
            <Search className="w-5 h-5 text-red-600" />
          </div>
          <h3 className="text-xl text-gray-900">Bộ lọc truy vấn</h3>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {/* Device Filter */}
          <div>
            <label className="block text-gray-700 mb-2">Thiết bị</label>
            <div className="relative">
              <Cpu className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={deviceFilter}
                onChange={(e) => setDeviceFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-600 focus:outline-none transition-colors appearance-none"
              >
                <option value="all">Tất cả thiết bị</option>
                <option value="temp">Cảm biến nhiệt độ</option>
                <option value="humid">Cảm biến độ ẩm</option>
                <option value="light">Cảm biến ánh sáng</option>
                <option value="gas">Cảm biến khí gas</option>
              </select>
            </div>
          </div>

          {/* Date From */}
          <div>
            <label className="block text-gray-700 mb-2">Từ ngày</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="datetime-local"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-600 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Date To */}
          <div>
            <label className="block text-gray-700 mb-2">Đến ngày</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="datetime-local"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-600 focus:outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Advanced Filters */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-gray-700 mb-2">Giá trị tối thiểu</label>
            <input
              type="number"
              placeholder="Nhập giá trị..."
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-600 focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Giá trị tối đa</label>
            <input
              type="number"
              placeholder="Nhập giá trị..."
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-600 focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Query Actions */}
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleQuery}
            className="px-6 py-3 bg-gradient-to-r from-red-700 to-red-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
          >
            <Play className="w-5 h-5" />
            Thực hiện truy vấn
          </motion.button>
          <button className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-red-600 hover:text-red-600 transition-all">
            Reset
          </button>
        </div>
      </motion.div>

      {/* Results */}
      {showResults && (
        <>
          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-4"
          >
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center gap-3">
                <Database className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Kết quả</p>
                  <p className="text-2xl text-gray-900">1,245</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center gap-3">
                <Cpu className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Thiết bị</p>
                  <p className="text-2xl text-gray-900">15</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center gap-3">
                <Filter className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Lọc</p>
                  <p className="text-2xl text-gray-900">3</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="text-sm text-gray-600">Thời gian</p>
                  <p className="text-xl text-gray-900">24h</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Export Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-4 border border-gray-200"
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="text-gray-700">
                Tìm thấy <span className="text-gray-900">1,245</span> bản ghi
              </p>
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleExport("csv")}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  CSV
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleExport("json")}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  JSON
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleExport("excel")}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Excel
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Results Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm text-gray-600">Thời gian</th>
                    <th className="px-6 py-4 text-left text-sm text-gray-600">Thiết bị</th>
                    <th className="px-6 py-4 text-left text-sm text-gray-600">Giá trị</th>
                    <th className="px-6 py-4 text-left text-sm text-gray-600">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {queryResults.map((result) => (
                    <tr key={result.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-gray-900">{result.timestamp}</td>
                      <td className="px-6 py-4 text-gray-900">{result.device}</td>
                      <td className="px-6 py-4">
                        <span className="text-gray-900">{result.value}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs ${
                          result.status === "normal" 
                            ? "bg-green-100 text-green-700" 
                            : "bg-yellow-100 text-yellow-700"
                        }`}>
                          {result.status === "normal" ? "Bình thường" : "Cảnh báo"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Hiển thị <span className="text-gray-900">1-5</span> trong tổng số <span className="text-gray-900">1,245</span> bản ghi
              </p>
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
          </motion.div>
        </>
      )}
    </div>
  );
}
