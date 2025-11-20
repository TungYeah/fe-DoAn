import React from "react";
import { motion } from "motion/react";
import { TrendingUp, Users, Cpu, Activity, DollarSign, ArrowUp, ArrowDown } from "lucide-react";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const statsData = [
  { label: "Tổng thiết bị", value: "248", change: "+12%", trend: "up", icon: Cpu, color: "from-blue-500 to-blue-600" },
  { label: "Người dùng", value: "1,429", change: "+8%", trend: "up", icon: Users, color: "from-green-500 to-green-600" },
  { label: "Hoạt động", value: "94.2%", change: "-2%", trend: "down", icon: Activity, color: "from-purple-500 to-purple-600" },
  { label: "Doanh thu", value: "₫24.5M", change: "+18%", trend: "up", icon: DollarSign, color: "from-red-500 to-red-600" },
];

const deviceActivityData = [
  { time: "00:00", devices: 120 },
  { time: "04:00", devices: 98 },
  { time: "08:00", devices: 180 },
  { time: "12:00", devices: 220 },
  { time: "16:00", devices: 195 },
  { time: "20:00", devices: 160 },
  { time: "24:00", devices: 135 },
];

const revenueData = [
  { month: "T1", value: 18.5 },
  { month: "T2", value: 20.2 },
  { month: "T3", value: 19.8 },
  { month: "T4", value: 22.1 },
  { month: "T5", value: 21.5 },
  { month: "T6", value: 24.5 },
];

const deviceTypeData = [
  { name: "Cảm biến nhiệt độ", value: 85, color: "#ef4444" },
  { name: "Cảm biến độ ẩm", value: 65, color: "#3b82f6" },
  { name: "Camera", value: 48, color: "#10b981" },
  { name: "Thiết bị khác", value: 50, color: "#f59e0b" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl text-gray-900 mb-2">Tổng quan</h1>
        <p className="text-gray-600">Chào mừng trở lại! Đây là tổng quan hệ thống của bạn.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs ${
                  stat.trend === "up" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                }`}>
                  {stat.trend === "up" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                  {stat.change}
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
              <p className="text-3xl text-gray-900">{stat.value}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Device Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl text-gray-900 mb-1">Hoạt động thiết bị</h3>
              <p className="text-sm text-gray-600">Số lượng thiết bị hoạt động theo thời gian</p>
            </div>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={deviceActivityData}>
              <defs>
                <linearGradient id="colorDevices" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="time" stroke="#999" />
              <YAxis stroke="#999" />
              <Tooltip />
              <Area type="monotone" dataKey="devices" stroke="#3b82f6" fillOpacity={1} fill="url(#colorDevices)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl text-gray-900 mb-1">Doanh thu</h3>
              <p className="text-sm text-gray-600">Doanh thu 6 tháng gần nhất (triệu VNĐ)</p>
            </div>
            <DollarSign className="w-5 h-5 text-red-600" />
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#999" />
              <YAxis stroke="#999" />
              <Tooltip />
              <Bar dataKey="value" fill="#ef4444" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Device Types */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
          className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm lg:col-span-2"
        >
          <h3 className="text-xl text-gray-900 mb-6">Phân loại thiết bị</h3>
          <div className="flex items-center justify-between gap-8">
            <ResponsiveContainer width="50%" height={200}>
              <PieChart>
                <Pie
                  data={deviceTypeData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label
                >
                  {deviceTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-3">
              {deviceTypeData.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-gray-700">{item.name}</span>
                  </div>
                  <span className="text-gray-900">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.7 }}
          className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm"
        >
          <h3 className="text-xl text-gray-900 mb-6">Hoạt động gần đây</h3>
          <div className="space-y-4">
            {[
              { label: "Thiết bị mới", time: "5 phút trước", status: "success" },
              { label: "Cập nhật dữ liệu", time: "15 phút trước", status: "info" },
              { label: "Cảnh báo nhiệt độ", time: "1 giờ trước", status: "warning" },
              { label: "Bảo trì hệ thống", time: "2 giờ trước", status: "error" },
            ].map((activity, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  activity.status === "success" ? "bg-green-500" :
                  activity.status === "info" ? "bg-blue-500" :
                  activity.status === "warning" ? "bg-yellow-500" : "bg-red-500"
                }`} />
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.label}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
