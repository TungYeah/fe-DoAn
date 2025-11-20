import React, { useState } from "react";
import { motion } from "motion/react";
import { DollarSign, TrendingUp, TrendingDown, Calendar, Download, CreditCard, Wallet, PiggyBank } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

const monthlyRevenue = [
  { month: "T1", revenue: 18.5, cost: 12.2, profit: 6.3 },
  { month: "T2", revenue: 20.2, cost: 13.1, profit: 7.1 },
  { month: "T3", revenue: 19.8, cost: 12.8, profit: 7.0 },
  { month: "T4", revenue: 22.1, cost: 14.5, profit: 7.6 },
  { month: "T5", revenue: 21.5, cost: 14.0, profit: 7.5 },
  { month: "T6", revenue: 24.5, cost: 15.8, profit: 8.7 },
];

const revenueBySource = [
  { source: "Gói cơ bản", amount: 8.5, color: "#3b82f6" },
  { source: "Gói nâng cao", amount: 12.3, color: "#8b5cf6" },
  { source: "Gói doanh nghiệp", amount: 3.7, color: "#ef4444" },
];

const transactions = [
  { id: 1, user: "Nguyễn Văn An", plan: "Gói nâng cao", amount: "₫500,000", date: "15/06/2024", status: "success" },
  { id: 2, user: "Trần Thị Bình", plan: "Gói cơ bản", amount: "₫200,000", date: "14/06/2024", status: "success" },
  { id: 3, user: "Lê Minh Cường", plan: "Gói doanh nghiệp", amount: "₫1,200,000", date: "13/06/2024", status: "pending" },
  { id: 4, user: "Phạm Thu Hà", plan: "Gói nâng cao", amount: "₫500,000", date: "12/06/2024", status: "success" },
  { id: 5, user: "Hoàng Văn Đức", plan: "Gói cơ bản", amount: "₫200,000", date: "11/06/2024", status: "success" },
];

export default function RevenuePage() {
  const [timeRange, setTimeRange] = useState("6months");

  const handleExport = (format: "csv" | "pdf" | "excel") => {
    alert(`Đang xuất báo cáo doanh thu dạng ${format.toUpperCase()}...`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-gray-900 mb-2">Doanh thu</h1>
          <p className="text-gray-600">Theo dõi và phân tích doanh thu hệ thống</p>
        </div>
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleExport("pdf")}
            className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-red-600 hover:text-red-600 transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Xuất PDF
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleExport("excel")}
            className="px-4 py-2 bg-gradient-to-r from-red-700 to-red-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Xuất Excel
          </motion.button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -5 }}
          className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-1 text-sm bg-white/20 px-2 py-1 rounded-lg">
              <TrendingUp className="w-4 h-4" />
              +18%
            </div>
          </div>
          <p className="text-green-100 mb-1">Doanh thu tháng này</p>
          <p className="text-3xl">₫24.5M</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          whileHover={{ y: -5 }}
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <CreditCard className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-1 text-sm bg-white/20 px-2 py-1 rounded-lg">
              <TrendingUp className="w-4 h-4" />
              +12%
            </div>
          </div>
          <p className="text-blue-100 mb-1">Giao dịch</p>
          <p className="text-3xl">248</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ y: -5 }}
          className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Wallet className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-1 text-sm bg-white/20 px-2 py-1 rounded-lg">
              <TrendingUp className="w-4 h-4" />
              +8%
            </div>
          </div>
          <p className="text-purple-100 mb-1">Chi phí</p>
          <p className="text-3xl">₫15.8M</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ y: -5 }}
          className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 text-white shadow-lg"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <PiggyBank className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-1 text-sm bg-white/20 px-2 py-1 rounded-lg">
              <TrendingUp className="w-4 h-4" />
              +24%
            </div>
          </div>
          <p className="text-red-100 mb-1">Lợi nhuận</p>
          <p className="text-3xl">₫8.7M</p>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-200"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl text-gray-900 mb-1">Xu hướng doanh thu</h3>
              <p className="text-sm text-gray-600">Doanh thu, chi phí và lợi nhuận 6 tháng</p>
            </div>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-red-600 focus:outline-none transition-colors"
            >
              <option value="6months">6 tháng</option>
              <option value="1year">1 năm</option>
              <option value="all">Tất cả</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#999" />
              <YAxis stroke="#999" />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} name="Doanh thu" />
              <Line type="monotone" dataKey="cost" stroke="#ef4444" strokeWidth={3} name="Chi phí" />
              <Line type="monotone" dataKey="profit" stroke="#3b82f6" strokeWidth={3} name="Lợi nhuận" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Revenue by Source */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl p-6 border border-gray-200"
        >
          <h3 className="text-xl text-gray-900 mb-6">Doanh thu theo gói</h3>
          <div className="space-y-4">
            {revenueBySource.map((item) => (
              <div key={item.source}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-700">{item.source}</span>
                  <span className="text-gray-900">₫{item.amount}M</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{
                      width: `${(item.amount / 24.5) * 100}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Tổng doanh thu</span>
              <span className="text-2xl text-gray-900">₫24.5M</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Transactions Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
      >
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-xl text-gray-900 mb-1">Giao dịch gần đây</h3>
            <p className="text-sm text-gray-600">Danh sách giao dịch mới nhất</p>
          </div>
          <button
            onClick={() => handleExport("csv")}
            className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-red-600 hover:text-red-600 transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Xuất CSV
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm text-gray-600">ID</th>
                <th className="px-6 py-4 text-left text-sm text-gray-600">Người dùng</th>
                <th className="px-6 py-4 text-left text-sm text-gray-600">Gói dịch vụ</th>
                <th className="px-6 py-4 text-left text-sm text-gray-600">Số tiền</th>
                <th className="px-6 py-4 text-left text-sm text-gray-600">Ngày</th>
                <th className="px-6 py-4 text-left text-sm text-gray-600">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-gray-900">#{tx.id}</td>
                  <td className="px-6 py-4 text-gray-900">{tx.user}</td>
                  <td className="px-6 py-4 text-gray-600">{tx.plan}</td>
                  <td className="px-6 py-4 text-gray-900">{tx.amount}</td>
                  <td className="px-6 py-4 text-gray-600">{tx.date}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs ${
                      tx.status === "success"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}>
                      {tx.status === "success" ? "Thành công" : "Đang xử lý"}
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
            Hiển thị <span className="text-gray-900">1-5</span> trong tổng số <span className="text-gray-900">248</span> giao dịch
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
    </div>
  );
}
