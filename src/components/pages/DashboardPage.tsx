import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
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
  Wifi,FileText,
  WifiOff,
  CheckCircle, Info, XCircle,
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
  const [totalDevices, setTotalDevices] = useState(0);
const [activeDevices, setActiveDevices] = useState(0);
const [devices, setDevices] = useState<any[]>([]);
const [activities, setActivities] = useState<any[]>([]);
const [totalRecords, setTotalRecords] = useState<number>(0);
const [chartData, setChartData] = useState<any[]>([]);
const [selectedMetric, setSelectedMetric] = useState<"temp" | "humidity">("temp");

const [chartRange, setChartRange] = useState<"24h" | "7d" | "30d">("24h");

const token = localStorage.getItem("token");
const email = localStorage.getItem("email");
const [queryCount, setQueryCount] = useState<number>(0);

const { user } = useAuth();
const [currentUser, setCurrentUser] = useState<any>(null);
const CURRENT_USER_ID = user?.id || currentUser?.id;
const roleList = user?.roles || currentUser?.roles || [];
const isAdmin = roleList.includes("ROLE_ADMIN");

const userStatsData = [
{
  label: "Thiết bị của tôi",
  value: totalDevices,
  change: "My Devices",
  trend: "up",
  icon: Cpu,
  color: "from-red-500 to-red-600",
},

{
  label: "Tổng dữ liệu",
  value: totalRecords.toLocaleString(),
  change: "Data Lake",
  trend: "up",
  icon: Database,
  color: "from-blue-500 to-blue-600",
},

  {
    label: "Đang hoạt động",
    value: `${activeDevices}/${totalDevices}`,
    change:
      totalDevices > 0
        ? `${Math.round((activeDevices / totalDevices) * 100)}%`
        : "0%",
    trend: "up",
    icon: Power,
    color: "from-green-500 to-green-600",
  },
{
  label: "Truy vấn",
  value: queryCount,
  change: "Export Filter",
  trend: "up",
  icon: FileText,
  color: "from-purple-500 to-purple-600",
},

];
  const navigate = useNavigate();
  function timeAgo(dateStr: string) {
  if (!dateStr) return "—";

  const diffMs = Date.now() - new Date(dateStr).getTime();
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 60) return `${diffSec} giây trước`;

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} phút trước`;

  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} giờ trước`;

  const diffDay = Math.floor(diffHour / 24);
  return `${diffDay} ngày trước`;
}

function formatVNDateTime(dateStr: string) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);

  const pad = (n: number) => (n < 10 ? "0" + n : n);

  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(
    d.getSeconds()
  )} ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}
useEffect(() => {
  if (!CURRENT_USER_ID) return;

  fetch(`http://localhost:5000/api/export_filters/${CURRENT_USER_ID}`)
    .then((res) => res.json())
    .then((data) => {
      setQueryCount(Array.isArray(data) ? data.length : 0);
    })
    .catch((err) => {
      console.error("Lỗi load số truy vấn:", err);
      setQueryCount(0);
    });
}, [CURRENT_USER_ID]);

useEffect(() => {
  fetch(
    "http://localhost:5000/api/dashboard/datalake/chart?sensor=temp"
  )
    .then(res => res.json())
    .then(data => setChartData(data))
    .catch(() => setChartData([]));
}, []);
useEffect(() => {
  fetch(
    `http://localhost:5000/api/dashboard/datalake/chart?sensor=${selectedMetric}`
  )
    .then((res) => res.json())
    .then((data) => setChartData(data))
    .catch(() => setChartData([]));
}, [selectedMetric]);

useEffect(() => {
  if (!CURRENT_USER_ID) return;

  fetch(
    `http://localhost:5000/api/dashboard/datalake/count`
  )
    .then(res => res.json())
    .then(data => {
      setTotalRecords(data.totalRecords || 0);
    })
    .catch(err => {
      console.error("Lỗi count datalake:", err);
      setTotalRecords(0);
    });
}, [CURRENT_USER_ID]);

  useEffect(() => {
  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch("http://localhost:8080/api/v1/auth/current", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) return;

      const data = await res.json();
      setCurrentUser(data);
    } catch (err) {
      console.error("Lỗi lấy current user:", err);
    }
  };

  fetchCurrentUser();
}, []);

useEffect(() => {
  if (!CURRENT_USER_ID) return;

  const fetchDevices = async () => {
    try {
      const role = isAdmin ? "admin" : "user";

      const res = await fetch(
        `http://localhost:5000/api/devices?user_id=${CURRENT_USER_ID}&role=${role}`
      );

      const json = await res.json();

      if (json.status === "success") {
        const list = json.devices || [];

        setDevices(list);
        setTotalDevices(json.total || list.length);

        const active = list.filter(
          (d: any) => String(d.flag_status) === "1"
        ).length;

        setActiveDevices(active);
      }
    } catch (err) {
      console.error("Lỗi load thiết bị dashboard:", err);
      setDevices([]);
      setTotalDevices(0);
      setActiveDevices(0);
    }
  };

  fetchDevices();
}, [CURRENT_USER_ID, isAdmin]);

useEffect(() => {
  const userId = localStorage.getItem("user_id"); // bạn đang lưu khi login
  const role = localStorage.getItem("role");      // ADMIN | USER

  if (!userId) return;

  fetch(
    `http://localhost:5000/api/devices?user_id=${userId}&role=${role === "ADMIN" ? "admin" : "user"}`
  )
    .then(res => res.json())
    .then(data => {
      if (data.status === "success") {
        setDevices(data.devices || []);
        setTotalDevices(data.total || 0);

        const active = (data.devices || []).filter(
          (d: any) => String(d.flag_status) === "1"
        ).length;

        setActiveDevices(active);
      }
    })
    .catch(err => console.error("Lỗi lấy thiết bị:", err));
}, []);
useEffect(() => {
  if (!token || !email) return;

  fetch("http://localhost:8080/api/admin/history?page=0&size=100", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      const list = (data.content || [])
        // ✅ chỉ lấy log của CHÍNH user
        .filter((h: any) => h.content?.email === email)

        // ✅ sắp xếp mới nhất trước
        .sort(
          (a: any, b: any) =>
            new Date(b.createDate).getTime() -
            new Date(a.createDate).getTime()
        )

        // ✅ chỉ lấy 4 hoạt động gần nhất
        .slice(0, 4);

      setActivities(list);
    })
    .catch(err => {
      console.error("Lỗi load hoạt động dashboard:", err);
      setActivities([]);
    });
}, [token, email]);

function getActivityDotColor(action: string) {
  switch (action) {
    case "CREATE":
      return "bg-green-500";
    case "UPDATE":
      return "bg-blue-500";
    case "DELETE":
      return "bg-red-500";
    default:
      return "bg-yellow-500";
  }
}


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
      <h3 className="text-xl text-gray-900">
        Dữ liệu cảm biến (3 tháng gần nhất)
      </h3>
      <p className="text-sm text-gray-600">
        Biểu diễn dữ liệu theo thời gian thực
      </p>
    </div>

    {/* SWITCH METRIC – giữ UI cũ */}
    <div className="flex gap-2">
      <button
        onClick={() => setSelectedMetric("temp")}
        className={`px-4 py-2 rounded-xl transition ${
          selectedMetric === "temp"
            ? "bg-red-100 text-red-700 border border-red-300"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        }`}
      >
        <Thermometer className="w-4 h-4 inline" /> Nhiệt độ
      </button>

      <button
        onClick={() => setSelectedMetric("humidity")}
        className={`px-4 py-2 rounded-xl transition ${
          selectedMetric === "humidity"
            ? "bg-blue-100 text-blue-700 border border-blue-300"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        }`}
      >
        <Droplets className="w-4 h-4 inline" /> Độ ẩm
      </button>
    </div>
  </div>

  {/* CHART */}
  <ResponsiveContainer width="100%" height={300}>
    <LineChart data={chartData}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis
        dataKey="time"
        tickFormatter={(v) =>
          new Date(v).toLocaleDateString("vi-VN")
        }
      />
      <YAxis />
      <Tooltip
        labelFormatter={(v) =>
          new Date(v).toLocaleString("vi-VN")
        }
      />
      <Legend />
      <Line
        type="monotone"
        dataKey="value"
        stroke={selectedMetric === "temp" ? "#ef4444" : "#3b82f6"}
        strokeWidth={2}
        dot={false}
        name={
          selectedMetric === "temp"
            ? "Nhiệt độ (°C)"
            : "Độ ẩm (%)"
        }
      />
    </LineChart>
  </ResponsiveContainer>

  {/* EMPTY STATE */}
  {chartData.length === 0 && (
    <p className="text-center text-sm text-gray-400 mt-4">
      Chưa có dữ liệu cảm biến trong 3 tháng gần đây
    </p>
  )}
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
{devices
  .slice()
  .sort(
    (a, b) =>
      new Date(b.create_date).getTime() -
      new Date(a.create_date).getTime()
  )
  .slice(0, 4)
  .map((d) => (
  <motion.div
    key={d.id}
    className="relative flex justify-between p-4 border rounded-xl hover:shadow"
  >
    {/* LEFT */}
    <div className="flex gap-4 items-center">
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
          String(d.flag_status) === "1"
            ? "bg-green-100"
            : "bg-gray-200"
        }`}
      >
        {String(d.flag_status) === "1" ? (
          <Wifi className="w-5 h-5 text-green-600" />
        ) : (
          <WifiOff className="w-5 h-5 text-gray-500" />
        )}
      </div>

      <div>
        <p className="text-gray-900 font-medium">{d.name}</p>
        <p className="text-xs text-gray-500">{d.device_type_name}</p>
        <p className="text-xs text-gray-400">
          ID: {d.unique_identifier}
        </p>
      </div>
    </div>

    {/* RIGHT – TIME INFO */}
    <div className="text-right text-xs text-gray-400">
      <p className="font-medium text-gray-500">
        {timeAgo(d.create_date)}
      </p>
      <p>{formatVNDateTime(d.create_date)}</p>
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
  <h3 className="text-xl text-gray-900 mb-6">
    Hoạt động gần đây
  </h3>

  {activities.length === 0 && (
    <p className="text-sm text-gray-500">
      Chưa có hoạt động nào gần đây.
    </p>
  )}

  <div className="space-y-4">
    {activities.map((a) => (
      <div key={a.id} className="flex gap-3">
        {/* ICON */}
{/* DOT */}
<div
  className={`mt-2 w-2.5 h-2.5 rounded-full ${getActivityDotColor(
    a.action
  )}`}
/>


        {/* CONTENT */}
        <div className="flex-1">
          <p className="text-sm text-gray-900 font-medium">
            {a.historyType.replace(/_/g, " ")}
          </p>

          <p className="text-xs text-gray-600">
            {a.description || "Không có mô tả"}
          </p>

          <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
            <Clock className="w-3 h-3" />
            {timeAgo(a.createDate)}
          </p>
        </div>
      </div>
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
