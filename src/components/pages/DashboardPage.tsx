import {
  HISTORY_TYPE_MAP,
  ACTION_MAP,
  HISTORY_DESCRIPTION_MAP,
  translateHistoryDescription,
} from "@/utils/historyMaps";
import { countDataLake } from "@/utils/dataLake";
import { API_ENDPOINTS, API_BASE_URL } from "../../config/api";

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
  Wifi,
  FileText,
  WifiOff,
  CheckCircle,
  Info,
  XCircle,
  BarChart3,
  FileDown,
  MapPin,
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
  const [selectedMetric, setSelectedMetric] = useState<"temp" | "humidity">(
    "temp"
  );
  const [animatedTotalRecords, setAnimatedTotalRecords] = useState(0);
  const [chartRange, setChartRange] = useState<"24h" | "7d" | "30d">("24h");

  const token = localStorage.getItem("token");
  const email = localStorage.getItem("email");
  const [queryCount, setQueryCount] = useState<number>(0);

  const { user } = useAuth();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const CURRENT_USER_ID = user?.id || currentUser?.id;
  const roleList = user?.roles || currentUser?.roles || [];
  const isAdmin = roleList.includes("ROLE_ADMIN");
  const createCountPayload = () => {
    const toDate = new Date();
    const fromDate = new Date();
    fromDate.setDate(toDate.getDate() - 30);

    return {
      deviceTypeId: null,
      propertyIds: null,
      fromDate: fromDate.toISOString().slice(0, 10),
      toDate: toDate.toISOString().slice(0, 10),
      fromTime: "00:00:00",
      toTime: "23:59:59",
      province: null,
      district: null,
      ward: null,
      specificLocation: null,
    };
  };
  const fetchQueryCount = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch(
        API_ENDPOINTS.DATA_QUERY_HISTORY,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Fetch query history failed");

      const list = await res.json();

      // ✅ API trả về history của user → đếm thẳng
      setQueryCount(Array.isArray(list) ? list.length : 0);
    } catch (err) {
      console.error("❌ Fetch query count error:", err);
      setQueryCount(0);
    }
  };


  // =========================
  // TRANSLATE HELPERS
  // =========================
  const translateHistoryType = (key?: string) =>
    (key && HISTORY_TYPE_MAP[key]) || key || "Hoạt động";

  const translateAction = (key?: string) =>
    (key && ACTION_MAP[key]) || key || "Hành động";

  const translateDescription = (key?: string) =>
    (key && HISTORY_DESCRIPTION_MAP[key]) || key || "Không có mô tả";

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
      label: "Tổng dữ liệu 30d gần đây",
      value: animatedTotalRecords.toLocaleString(),
      change: "Data Lake",
      trend: "up",
      icon: Database,
      color: "from-blue-500 to-blue-600",
    },

    {
      label: "Đang hoạt động",
      value: totalDevices === 0 ? "0" : `${activeDevices}/${totalDevices}`,
      change:
        totalDevices > 0
          ? `${Math.round((activeDevices / totalDevices) * 100)}%`
          : "0%",
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
  function formatLocation(d: any) {
    if (d.location) return d.location;

    const parts = [d.ward, d.district, d.province].filter(Boolean);
    if (parts.length > 0) return parts.join(" · ");

    return "Chưa gán vị trí";
  }

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
  async function fetchChartFromDataLake(
    sensor: "temp" | "humidity"
  ): Promise<any[]> {
    const payload = {
      deviceTypeId: null,
      propertyIds: null,
      fromDate: new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10),
      toDate: new Date().toISOString().slice(0, 10),
      fromTime: "00:00:00",
      toTime: "23:59:59",
      province: null,
      district: null,
      ward: null,
      specificLocation: null,
    };

    const res = await fetch(API_ENDPOINTS.DATA_QUERY_LAKE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(payload),
    });

    const raw = await res.json();
    if (!Array.isArray(raw)) return [];

    // 🔥 map sensor → propertyName
    const propertyMap: Record<string, string> = {
      temp: "temperature",
      humidity: "humidity",
    };

    const targetProperty = propertyMap[sensor];

    return raw
      .filter(
        (r) =>
          r.propertyName === targetProperty &&
          r.timestamp &&
          r.value !== undefined
      )
      .map((r) => ({
        time: r.timestamp,
        value: Number(r.value),
      }))
      .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
  }
  useEffect(() => {
    fetchQueryCount();
  }, []);

  useEffect(() => {
    const fetchDataLakeCount = async () => {
      try {
        const count = await countDataLake(createCountPayload());
        console.log("✅ DATA LAKE COUNT =", count);
        setTotalRecords(Number(count) || 0);
      } catch (err) {
        console.error("❌ Count Data Lake failed:", err);
        setTotalRecords(0);
      }
    };

    fetchDataLakeCount();
  }, []);

  useEffect(() => {
    fetchChartFromDataLake(selectedMetric)
      .then((data) => {
        console.log("📊 Chart data:", data);
        setChartData(data);
      })
      .catch((err) => {
        console.error("❌ Chart error:", err);
        setChartData([]);
      });
  }, [selectedMetric]);

  useEffect(() => {
    let start = 0;
    const end = totalRecords;

    if (end === 0) {
      setAnimatedTotalRecords(0);
      return;
    }

    const duration = 800; // ms
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // easeOutCubic cho mượt
      const ease = 1 - Math.pow(1 - progress, 3);

      setAnimatedTotalRecords(Math.floor(ease * end));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [totalRecords]);

  useEffect(() => {
    const fetchDashboardDevices = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const url = isAdmin
          ? `${API_ENDPOINTS.DEVICES_ALL}?page=0&size=1000`
          : `${API_ENDPOINTS.DEVICES}?page=0&size=1000`;

        const res = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Fetch devices failed");

        const data = await res.json();
        const list = data.content || [];

        setDevices(list);
        setTotalDevices(data.totalElements ?? list.length);

        // ✅ ĐÚNG
        const activeCount = list.filter(
          (d: any) => d.status === "ONLINE"
        ).length;

        setActiveDevices(activeCount);
      } catch (err) {
        console.error("❌ Dashboard load devices error:", err);
        setDevices([]);
        setTotalDevices(0);
        setActiveDevices(0);
      }
    };

    fetchDashboardDevices();
  }, [isAdmin]);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch(API_ENDPOINTS.AUTH_CURRENT, {
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
    if (!token || !email) return;

    fetch(`${API_ENDPOINTS.ADMIN_HISTORY}?page=0&size=100`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const list = (data.content || [])
          // ✅ chỉ lấy log của CHÍNH user
          .filter((h: any) => h.createdBy === email)

          // ✅ sắp xếp mới nhất trước
          .sort(
            (a: any, b: any) =>
              new Date(b.createDate).getTime() -
              new Date(a.createDate).getTime()
          )

          // ✅ lấy 4–5 thông báo gần nhất
          .slice(0, 5);

        setActivities(list);
      })
      .catch((err) => {
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
        className="flex items-center justify-between"
      >
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
                  className={`px-2 py-1 rounded-lg text-xs ${stat.trend === "warning"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-green-100 text-green-700"
                    }`}
                >
                  {stat.change}
                </span>
              </div>
              <p className="text-gray-600 text-sm">{stat.label}</p>
              <p className="text-3xl text-gray-900">
                <motion.span
                  key={animatedTotalRecords}
                  initial={{ scale: 0.95, opacity: 0.6 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {stat.value}
                </motion.span>
              </p>{" "}
            </motion.div>
          );
        })}
      </div>

      {/* SENSOR CHART */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-6 border shadow-sm"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl text-gray-900">Dữ liệu cảm biến</h3>
            <p className="text-sm text-gray-600">
              Dữ liệu từ các cảm biến trong 30d qua
            </p>
          </div>

          {/* SWITCH METRIC – giữ UI cũ */}
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedMetric("temp")}
              className={`px-4 py-2 rounded-xl transition ${selectedMetric === "temp"
                ? "bg-red-100 text-red-700 border border-red-300"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
            >
              <Thermometer className="w-4 h-4 inline" /> Nhiệt độ
            </button>

            <button
              onClick={() => setSelectedMetric("humidity")}
              className={`px-4 py-2 rounded-xl transition ${selectedMetric === "humidity"
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
              tickFormatter={(v) => new Date(v).toLocaleDateString("vi-VN")}
            />
            <YAxis />
            <Tooltip
              labelFormatter={(v) => new Date(v).toLocaleString("vi-VN")}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="value"
              stroke={selectedMetric === "temp" ? "#ef4444" : "#3b82f6"}
              strokeWidth={2}
              dot={false}
              name={selectedMetric === "temp" ? "Nhiệt độ (°C)" : "Độ ẩm (%)"}
            />
          </LineChart>
        </ResponsiveContainer>

        {/* EMPTY STATE */}
        {chartData.length === 0 && (
          <p className="text-center text-sm text-gray-400 mt-4">
            Chưa có dữ liệu cảm biến trong 30d gần đây
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
          transition={{ duration: 0.3, delay: 0.5 }}
          className="bg-white rounded-2xl p-6 border shadow-sm lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl text-gray-900">Thiết bị của tôi</h3>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
            >
              Xem tất cả <TrendingUp className="w-4 h-4" />
            </motion.button>
          </div>

          <div className="space-y-3">
            {devices.length === 0 && (
              <p className="text-sm text-gray-400 italic">
                Bạn chưa có thiết bị nào
              </p>
            )}

            {devices
              .slice()
              .sort(
                (a, b) =>
                  new Date(b.createDate).getTime() -
                  new Date(a.createDate).getTime()
              )
              .slice(0, 4)
              .map((d) => {
                const isOnline = d.status === "ONLINE";

                return (
                  <motion.div
                    key={d.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25 }}
                    whileHover={{ x: 5, y: -2 }}
                    className="relative flex justify-between p-4 border rounded-xl hover:shadow-md transition-all"
                  >
                    {/* LEFT */}
                    <div className="flex gap-4 items-center">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${isOnline ? "bg-green-100" : "bg-gray-200"
                          }`}
                      >
                        {isOnline ? (
                          <Wifi className="w-5 h-5 text-green-600" />
                        ) : (
                          <WifiOff className="w-5 h-5 text-gray-500" />
                        )}
                      </div>

                      <div>
                        <p className="text-gray-900 font-medium">{d.name}</p>

                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          {formatLocation(d)}
                        </p>

                        <p className="text-sm text-gray-400 break-all">
                          UNIQUE ID: {d.uniqueIdentifier || d.id}
                        </p>
                        <p className="text-xs text-gray-400 break-all">
                          {d.description || "Không có mô tả"}
                        </p>
                      </div>
                    </div>

                    {/* RIGHT */}
                    <div className="text-right text-xs text-gray-400">
                      <p className="font-medium text-gray-500">
                        {timeAgo(d.createDate)}
                      </p>
                      <p>{formatVNDateTime(d.createDate)}</p>
                    </div>
                  </motion.div>
                );
              })}
          </div>
        </motion.div>

        {/* Recent Activities */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 border shadow-sm"
        >
          <h3 className="text-xl text-gray-900 mb-6">Hoạt động gần đây</h3>

          {activities.length === 0 && (
            <p className="text-sm text-gray-500">
              Chưa có hoạt động nào gần đây.
            </p>
          )}

          <div className="space-y-4">
            {activities.map((a) => (
              <div key={a.id} className="flex gap-3">
                {/* DOT */}
                <div
                  className={`mt-2 w-2.5 h-2.5 rounded-full ${getActivityDotColor(
                    a.action
                  )}`}
                />

                {/* CONTENT */}
                <div className="flex-1">
                  <p className="text-sm text-gray-900 font-medium">
                    {translateHistoryType(a.historyType)}
                  </p>

                  <p className="text-xs text-gray-600">
                    {translateHistoryDescription(a.description)} #
                    {a.identify.slice(0, 12)}…
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
