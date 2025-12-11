import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  Search,
  Filter,
  Download,
  Calendar,
  Cpu,
  Database,
  Play,
  History,
  Eye,
  FileText,
  RefreshCcw,
  Trash2,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

/* ======= kiểu dữ liệu location API ======= */
type Ward = { code: number; name: string };
type District = { code: number; name: string; wards: Ward[] };
type Province = { code: number; name: string; districts: District[] };

/* ============  đổi giờ ISO sang VN ===================== */
function toVietnamTime(iso: string) {
  if (!iso) return "N/A";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "N/A";
  return format(d, "HH:mm:ss dd/MM/yyyy", { locale: vi });
}

/* đổi giờ hiện tại sang ISO ================ */
function VNLocalToISO(input: string) {
  if (!input) return "";
  return new Date(input).toISOString();
}

/* ====================Tạo name file======================== */
function generateDefaultFileName() {
  const now = new Date();
  const p = (x: number) => (x < 10 ? "0" + x : x);

  return `dataset_${now.getFullYear()}${p(now.getMonth() + 1)}${p(
    now.getDate()
  )}_${p(now.getHours())}${p(now.getMinutes())}${p(now.getSeconds())}.csv`;
}

/* ===========================Export CSV========================== */
function exportCSV(dataset: any, fileName?: string) {
  if (!dataset) return;

  let rows: any[] = [];

  if (dataset.data) rows.push(...dataset.data);
  if (dataset.sensors)
    Object.values(dataset.sensors).forEach((arr: any) => rows.push(...arr));
  if (dataset.devices)
    Object.values(dataset.devices).forEach((arr: any) => rows.push(...arr));

  if (rows.length === 0) return;
  const header = "timestamp,unique_identifier,sensor,value\n";
  const csvRows = rows
    .map(
      (r: any) => `${r.timestamp},${r.unique_identifier},${r.sensor},${r.value}`
    )
    .join("\n");

  const blob = new Blob([header + csvRows], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName || generateDefaultFileName();
  a.click();
  URL.revokeObjectURL(url);
}

type SensorOption = {
  label: string;
  value: string;
};

export default function QueryPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { user } = useAuth();
  console.log(">>> CURRENT USER:", user);
  console.log(">>> USER ID:", currentUser?.id);
  const [sensorList, setSensorList] = useState<SensorOption[]>([]);

  const CURRENT_USER_ID = user?.id || currentUser?.id;
  const roleList = user?.roles || currentUser?.roles || [];

  const isAdmin = roleList.includes("ROLE_ADMIN");

  console.log("ROLE LIST:", roleList);
  console.log("IS ADMIN:", isAdmin);
  // ================== STATE BACKEND LOGIC ==================
  const [devices, setDevices] = useState<any[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>("all");
  const [selectedMetric, setSelectedMetric] = useState<string>("all");

  // location filter
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  const [selectedProvince, setSelectedProvince] = useState<string>("all");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("all");
  const [selectedWard, setSelectedWard] = useState<string>("all");

  const [dateFromVN, setDateFromVN] = useState("");
  const [dateToVN, setDateToVN] = useState("");

  const [minValue, setMinValue] = useState<string>("");
  const [maxValue, setMaxValue] = useState<string>("");

  const [dataset, setDataset] = useState<any>(null);
  const [rows, setRows] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(false);

  const [history, setHistory] = useState<any[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [currentHistoryId, setCurrentHistoryId] = useState<number | null>(null);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyPerPage, setHistoryPerPage] = useState(5);

  // UI state
  const [showResults, setShowResults] = useState(false);
  const [showHistory, setShowHistory] = useState(true);

  function normalizeName(str: string) {
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // xoá dấu
      .replace(/\s+/g, "") // xoá khoảng cách
      .toLowerCase(); // viết thường
  }

  // ============ lấy thong tin ng dùng ===============

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch("http://20.249.208.207:8080/api/v1/auth/current", {
          method: "GET",
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
  // ====load list sensor====
  useEffect(() => {
    const fetchDeviceTypes = async () => {
      try {
        const res = await fetch("http://20.249.208.207:5000/api/device-types");
        const data = await res.json();

        const list = data.device_types || [];

        const sensors = list.map((dt: any) => ({
          label: dt.name, // hiển thị trên dropdown
          value: normalizeName(dt.name), // dùng để lọc
        }));

        setSensorList(sensors);
      } catch (err) {
        console.error("Lỗi load device-types:", err);
      }
    };

    fetchDeviceTypes();
  }, []);

  // ============ LOAD THIẾT BỊ ===============
  useEffect(() => {
    if (!CURRENT_USER_ID) return;

    const fetchDevices = async () => {
      try {
        const uid = CURRENT_USER_ID;
        const role = isAdmin ? "admin" : "user";

        const res = await fetch(
          `http://20.249.208.207:5000/api/devices?user_id=${uid}&role=${role}`
        );

        const json = await res.json();
        setDevices(json.devices || []);
      } catch (err) {
        console.error("Lỗi tải thiết bị:", err);
        setDevices([]);
      }
    };

    fetchDevices();
  }, [CURRENT_USER_ID, isAdmin]);

  // ============ LOAD PROVINCE API ============ (depth=3 để có sẵn quận, xã)
  useEffect(() => {
    fetch("https://provinces.open-api.vn/api/?depth=3")
      .then((res) => res.json())
      .then((data) => {
        setProvinces(data || []);
      })
      .catch((err) => {
        console.error("Lỗi load tỉnh thành:", err);
        setProvinces([]);
      });
  }, []);

  // Khi chọn Province -> fill District
  useEffect(() => {
    if (selectedProvince === "all") {
      setDistricts([]);
      setWards([]);
      setSelectedDistrict("all");
      setSelectedWard("all");
      return;
    }
    const p = provinces.find((x) => x.name === selectedProvince);
    setDistricts(p?.districts || []);
    setWards([]);
    setSelectedDistrict("all");
    setSelectedWard("all");
  }, [selectedProvince, provinces]);

  // Khi chọn District -> fill Ward
  useEffect(() => {
    if (selectedDistrict === "all") {
      setWards([]);
      setSelectedWard("all");
      return;
    }
    const d = districts.find((x) => x.name === selectedDistrict);
    setWards(d?.wards || []);
    setSelectedWard("all");
  }, [selectedDistrict, districts]);

  // ============ LOAD HISTORY ===============
  async function loadHistory() {
    if (!CURRENT_USER_ID) return;
    setIsHistoryLoading(true);
    try {
      const res = await fetch(
        `http://20.249.208.207:5000/api/export_filters/${CURRENT_USER_ID}`
      );
      const json = await res.json();
      setHistory(json || []);
    } catch (e) {
      console.error(e);
      setHistory([]);
    }
    setIsHistoryLoading(false);
  }
  const historyTotalPages = Math.max(
    1,
    Math.ceil(history.length / historyPerPage)
  );

  const historyStartIndex = (historyPage - 1) * historyPerPage;
  const currentHistory = history.slice(
    historyStartIndex,
    historyStartIndex + historyPerPage
  );

  useEffect(() => {
    loadHistory();
  }, [CURRENT_USER_ID]);

  // ============ LỌC DATASET ===============
  async function handleQuery() {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();

      if (selectedDevice !== "all")
        params.append("unique_identifier", selectedDevice);
      if (selectedMetric !== "all") params.append("sensor", selectedMetric);

      const startISO = dateFromVN ? VNLocalToISO(dateFromVN) : "all";
      const endISO = dateToVN ? VNLocalToISO(dateToVN) : "all";

      if (dateFromVN) params.append("start", startISO);
      if (dateToVN) params.append("end", endISO);

      if (selectedProvince !== "all")
        params.append("province", selectedProvince);
      if (selectedDistrict !== "all")
        params.append("district", selectedDistrict);
      if (selectedWard !== "all") params.append("ward", selectedWard);

      // (Tuỳ backend có hỗ trợ min/max value hay không, tạm thời không gửi)

      const res = await fetch(
        `http://20.249.208.207:5000/api/dataset?${params.toString()}`
      );
      const json = await res.json();

      setDataset(json);

      let flat: any[] = [];
      if (json.data) flat.push(...json.data);
      if (json.sensors)
        Object.values(json.sensors).forEach((arr: any) => flat.push(...arr));
      if (json.devices)
        Object.values(json.devices).forEach((arr: any) => flat.push(...arr));

      setRows(flat);
      setPage(1);
      setShowResults(true);
    } catch (e) {
      console.error(e);
      setDataset(null);
      setRows([]);
      setShowResults(false);
    }
    setIsLoading(false);
  }

  // ============ LƯU FILTER ===============
  async function saveFilter(filter: any, fileName: string) {
    if (!CURRENT_USER_ID) return;

    await fetch("http://20.249.208.207:5000/api/export_filters", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        created_by: CURRENT_USER_ID,
        filter_name: fileName,
        filter_json: filter,
      }),
    });
    console.log(">>> SEND FILTER:", {
      created_by: CURRENT_USER_ID,
      filter_name: fileName,
      filter_json: filter,
    });

    loadHistory();
  }

  // ============ XEM LẠI DATASET TỪ HISTORY ===============
  async function handleViewDataset(id: number) {
    const res = await fetch(
      `http://20.249.208.207:5000/api/export_filters/${id}/dataset`
    );
    const json = await res.json();
    setDataset(json);

    let flat: any[] = [];
    if (json.data) flat.push(...json.data);
    if (json.sensors)
      Object.values(json.sensors).forEach((arr: any) => flat.push(...arr));
    if (json.devices)
      Object.values(json.devices).forEach((arr: any) => flat.push(...arr));

    setRows(flat);
    setPage(1);
    setCurrentHistoryId(id);
    setShowResults(true);
  }

  // ============ DOWNLOAD CSV TỪ HISTORY ===============
  function handleDownloadHistory(id: number) {
    window.open(
      `http://20.249.208.207:5000/api/export_filters/${id}/export_csv`,
      "_blank"
    );
  }

  // ============ XOÁ HISTORY ===============
  async function handleDeleteHistory(id: number) {
    const ok = window.confirm("Bạn có chắc muốn xóa lịch sử này?");
    if (!ok) return;

    await fetch(`http://20.249.208.207:5000/api/export_filters/${id}`, {
      method: "DELETE",
    });

    if (currentHistoryId === id) setCurrentHistoryId(null);
    loadHistory();
  }

  // ============ EXPORT CSV TỪ DATASET HIỆN TẠI ===============
  function handleExportCSV() {
    if (!dataset) {
      alert("Chưa có dữ liệu để export.");
      return;
    }

    let fileName = prompt("Nhập tên file CSV (bỏ trống để dùng tên mặc định):");

    if (fileName) {
      const vietnameseRegex =
        /[áàảãạăắằẳẵặâấầẩẫậóòỏõọôốồổỗộơớờởỡợéèẻẽẹêếềểễệíìỉĩịúùủũụưứừửữựýỳỷỹỵđ]/i;
      if (vietnameseRegex.test(fileName)) {
        alert(
          "Không được dùng dấu tiếng Việt trong tên file! Vui lòng đặt tên không dấu."
        );
        return;
      }
      if (!fileName.endsWith(".csv")) {
        fileName += ".csv";
      }
    }

    const startISO = dateFromVN ? VNLocalToISO(dateFromVN) : "all";
    const endISO = dateToVN ? VNLocalToISO(dateToVN) : "all";

    const finalName = fileName || generateDefaultFileName();
    exportCSV(dataset, finalName);

    const filter = {
      unique_identifier: selectedDevice || "all",
      sensor: selectedMetric || "all",
      start: startISO,
      end: endISO,
      location: {
        province: selectedProvince || "all",
        district: selectedDistrict || "all",
        ward: selectedWard || "all",
      },
    };

    saveFilter(filter, finalName);
  }

  // ======== PAGINATION =========
  const totalPages = Math.max(1, Math.ceil(rows.length / perPage));
  const startIndex = (page - 1) * perPage;
  const currentData = rows.slice(startIndex, startIndex + perPage);

  const totalRecords = dataset?.total || rows.length;
  const uniqueDevices = new Set(rows.map((r) => r.unique_identifier)).size;

  const activeFiltersCount = [
    selectedDevice !== "all",
    selectedMetric !== "all",
    !!dateFromVN,
    !!dateToVN,
    selectedProvince !== "all",
    selectedDistrict !== "all",
    selectedWard !== "all",
  ].filter(Boolean).length;

  let timeRangeLabel = "Không giới hạn";
  if (dateFromVN && dateToVN) {
    const diffMs =
      new Date(dateToVN).getTime() - new Date(dateFromVN).getTime();
    const diffHours = Math.max(1, Math.round(diffMs / (1000 * 60 * 60)));
    timeRangeLabel = `${diffHours} giờ`;
  } else if (dateFromVN || dateToVN) {
    timeRangeLabel = "Một phía thời gian";
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between"
      >
        {" "}
        <div>
          <h1 className="text-3xl text-gray-900 mb-2">Truy vấn dữ liệu</h1>

          <p className="text-gray-600">
            Tìm kiếm và lọc dữ liệu từ thiết bị IoT, xuất CSV và xem lịch sử tải
            xuống.
          </p>
        </div>
      </motion.div>

      {/* ================= BỘ LỌC TRUY VẤN ================= */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-6 border border-gray-200"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
            <Search className="w-5 h-5 text-red-600" />
          </div>
          <h3 className="text-xl text-gray-900 font-semibold">
            Bộ lọc truy vấn Dataset
          </h3>
        </div>

        {/* Hàng 1: Thiết bị + Sensor + Từ ngày + Đến ngày */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Thiết bị */}
          <div>
            <label className="block text-gray-700 mb-2">Thiết bị của bạn</label>
            <div className="relative">
              <Cpu className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={selectedDevice}
                onChange={(e) => setSelectedDevice(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-600 focus:outline-none transition-colors appearance-none"
              >
                <option value="all">Thiết bị của bạn</option>
                {devices.map((d: any) => (
                  <option value={d.unique_identifier} key={d.unique_identifier}>
                    {d.unique_identifier} — {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Sensor */}
          <div>
            <label className="block text-gray-700 mb-2">Sensor</label>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-600 focus:outline-none transition-colors appearance-none"
              >
                <option value="all">Tất cả</option>

                {sensorList.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Từ ngày */}
          <div>
            <label className="block text-gray-700 mb-2">Từ ngày</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="datetime-local"
                value={dateFromVN}
                onChange={(e) => setDateFromVN(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-600 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Đến ngày */}
          <div>
            <label className="block text-gray-700 mb-2">Đến ngày</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="datetime-local"
                value={dateToVN}
                onChange={(e) => setDateToVN(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-600 focus:outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Hàng 2: Location + Min/Max value */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Tỉnh */}
          <div>
            <label className="block text-gray-700 mb-2">Tỉnh/Thành phố</label>
            <select
              value={selectedProvince}
              onChange={(e) => setSelectedProvince(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-600 focus:outline-none transition-colors"
            >
              <option value="all">Tất cả</option>
              {provinces.map((p) => (
                <option key={p.code} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Quận */}
          <div>
            <label className="block text-gray-700 mb-2">Quận/Huyện</label>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              disabled={selectedProvince === "all"}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-600 focus:outline-none transition-colors disabled:bg-gray-100"
            >
              <option value="all">Tất cả</option>
              {districts.map((d) => (
                <option key={d.code} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Xã */}
          <div>
            <label className="block text-gray-700 mb-2">Xã/Phường</label>
            <select
              value={selectedWard}
              onChange={(e) => setSelectedWard(e.target.value)}
              disabled={selectedDistrict === "all"}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-600 focus:outline-none transition-colors disabled:bg-gray-100"
            >
              <option value="all">Tất cả</option>
              {wards.map((w) => (
                <option key={w.code} value={w.name}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Query Actions */}
        <div className="flex flex-wrap gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleQuery}
            disabled={isLoading}
            className="px-6 py-3 bg-gradient-to-r from-red-700 to-red-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 disabled:opacity-60"
          >
            <Play className="w-5 h-5" />
            {isLoading ? "Đang truy vấn..." : "Thực hiện truy vấn"}
          </motion.button>

          <button
            onClick={() => {
              setSelectedDevice("all");
              setSelectedMetric("all");
              setDateFromVN("");
              setDateToVN("");
              setSelectedProvince("all");
              setSelectedDistrict("all");
              setSelectedWard("all");
              setMinValue("");
              setMaxValue("");
            }}
            className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-red-600 hover:text-red-600 transition-all"
          >
            Reset
          </button>
        </div>
      </motion.div>

      {/* ================= KẾT QUẢ + EXPORT ================= */}
      {showResults && dataset && (
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
                  <p className="text-2xl text-gray-900">
                    {totalRecords.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center gap-3">
                <Cpu className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Thiết bị</p>
                  <p className="text-2xl text-gray-900">
                    {uniqueDevices.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center gap-3">
                <Filter className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Số điều kiện lọc</p>
                  <p className="text-2xl text-gray-900">{activeFiltersCount}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="text-sm text-gray-600">Khoảng thời gian</p>
                  <p className="text-xl text-gray-900">{timeRangeLabel}</p>
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
                Tìm thấy{" "}
                <span className="text-gray-900 font-semibold">
                  {totalRecords.toLocaleString()}
                </span>{" "}
                bản ghi
              </p>
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleExportCSV}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  CSV
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() =>
                    alert(
                      "Hiện tại backend chỉ hỗ trợ CSV, JSON đang phát triển."
                    )
                  }
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  JSON
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() =>
                    alert(
                      "Hiện tại backend chỉ hỗ trợ CSV, Excel đang phát triển."
                    )
                  }
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
            <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <span>Hiển thị mỗi trang:</span>
                <select
                  value={perPage}
                  onChange={(e) => {
                    setPerPage(Number(e.target.value));
                    setPage(1);
                  }}
                  className="border border-gray-300 rounded-lg px-2 py-1 text-sm"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm text-gray-600">
                      Thời gian
                    </th>
                    <th className="px-6 py-4 text-left text-sm text-gray-600">
                      Thiết bị
                    </th>
                    <th className="px-6 py-4 text-left text-sm text-gray-600">
                      Sensor
                    </th>
                    <th className="px-6 py-4 text-left text-sm text-gray-600">
                      Giá trị
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentData.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-6 py-6 text-center text-gray-500"
                      >
                        Không có dữ liệu.
                      </td>
                    </tr>
                  )}

                  {currentData.map((row: any, idx: number) => (
                    <tr
                      key={idx}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-gray-900">
                        {toVietnamTime(row.timestamp)}
                      </td>
                      <td className="px-6 py-4 text-gray-900">
                        {row.unique_identifier}
                      </td>
                      <td className="px-6 py-4 text-gray-900">{row.sensor}</td>
                      <td className="px-6 py-4 text-gray-900">{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {rows.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3 text-sm text-gray-700">
                <p>
                  Trang {page} / {totalPages} — Hiển thị {startIndex + 1}–
                  {Math.min(startIndex + perPage, rows.length)} / {rows.length}{" "}
                  bản ghi
                </p>
                <div className="flex items-center gap-1">
                  {/* Prev */}
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className={`px-3 py-1 rounded-md border ${
                      page === 1
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white hover:bg-gray-50"
                    }`}
                  >
                    Trước
                  </button>

                  {/* page numbers với ... */}
                  {(() => {
                    const arr: (number | string)[] = [];
                    const maxButtons = 5;

                    if (totalPages <= maxButtons) {
                      for (let i = 1; i <= totalPages; i++) arr.push(i);
                    } else {
                      arr.push(1);
                      if (page > 3) arr.push("...");
                      const middle = [page - 1, page, page + 1].filter(
                        (p) => p > 1 && p < totalPages
                      );
                      arr.push(...middle);
                      if (page < totalPages - 2) arr.push("...");
                      arr.push(totalPages);
                    }

                    return arr.map((num, i) =>
                      num === "..." ? (
                        <span key={i} className="px-2 text-gray-400">
                          ...
                        </span>
                      ) : (
                        <button
                          key={i}
                          onClick={() => setPage(num as number)}
                          className={`px-3 py-1 rounded-md border ${
                            num === page
                              ? "bg-red-600 text-white border-red-600"
                              : "bg-white hover:bg-gray-50"
                          }`}
                        >
                          {num}
                        </button>
                      )
                    );
                  })()}

                  {/* Next */}
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className={`px-3 py-1 rounded-md border ${
                      page === totalPages
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white hover:bg-gray-50"
                    }`}
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}

      {/* ================= LỊCH SỬ TẢI XUỐNG ================= */}
      {showHistory && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-red-700 to-red-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <History className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white text-xl font-semibold">
                    Lịch sử truy vấn & tải xuống
                  </h3>
                  <p className="text-white text-sm font-semibold">
                    Quản lý các truy vấn đã thực hiện
                  </p>
                </div>
              </div>

              <span className="px-3 py-1 bg-white/20 rounded-full text-white text-sm">
                {history.length} lần export
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-4">
            {isHistoryLoading && (
              <p className="text-gray-600 text-sm">Đang tải lịch sử...</p>
            )}

            {!isHistoryLoading && history.length === 0 && (
              <p className="text-gray-600 text-sm">Chưa có lịch sử.</p>
            )}

            {!isHistoryLoading && history.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm text-gray-600">
                        Tên file
                      </th>
                      <th className="px-4 py-3 text-left text-sm text-gray-600">
                        Thời gian
                      </th>
                      <th className="px-4 py-3 text-center text-sm text-gray-600">
                        Định dạng
                      </th>
                      <th className="px-4 py-3 text-center text-sm text-gray-600">
                        Trạng thái
                      </th>
                      <th className="px-4 py-3 text-center text-sm text-gray-600">
                        Thao tác
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-200">
                    {currentHistory.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-gray-50 transition-all"
                      >
                        {/* TÊN FILE */}
                        <td className="px-4 py-3">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <div className="flex items-center gap-3">
                              {/* Icon document */}
                              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                                <FileText className="w-4 h-4" />
                              </div>
                              {/* Info */}
                              <p className="text-gray-900 font-medium">
                                {item.filter_name}
                              </p>
                              {/* <p className="text-xs text-gray-500">Tải {item.download_count ?? 0} lần</p>  có thể thêm sau*/}
                            </div>
                          </motion.button>
                        </td>

                        <td className="px-4 py-3 text-sm text-gray-700">
                          {toVietnamTime(item.createAt)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {(() => {
                            // Lấy format từ API — fallback = CSV
                            const format = item.format
                              ? item.format.toUpperCase()
                              : item.filter_name
                                  ?.toLowerCase()
                                  .endsWith(".xlsx")
                              ? "EXCEL"
                              : item.filter_name
                                  ?.toLowerCase()
                                  .endsWith(".json")
                              ? "JSON"
                              : "CSV";

                            // Chọn màu theo format
                            const colorClass =
                              format === "CSV"
                                ? "bg-green-100 text-green-700"
                                : format === "EXCEL"
                                ? "bg-orange-100 text-orange-700"
                                : "bg-blue-100 text-blue-700"; // JSON

                            return (
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium ${colorClass}`}
                              >
                                {format}
                              </span>
                            );
                          })()}
                        </td>
                        {/* TRẠNG THÁI */}
                        <td className="px-4 py-3 text-center">
                          {currentHistoryId === item.id ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs">
                              <span className="w-2 h-2 rounded-full bg-green-500" />
                              Đang hiển thị
                            </span>
                          ) : (
                            <span className="text-xs text-gray-500">
                              Chưa hiển thị
                            </span>
                          )}
                        </td>

                        {/* THAO TÁC */}
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-3">
                            {/* XEM */}
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleViewDataset(item.id)}
                              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 text-gray-700"
                            >
                              <Eye className="w-4 h-4" />
                            </motion.button>

                            {/* TẢI */}
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleDownloadHistory(item.id)}
                              className="p-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              <Download className="w-4 h-4" />
                            </motion.button>

                            {/* XOÁ */}
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleDeleteHistory(item.id)}
                              className="p-2 rounded-lg border border-red-300 text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Footer */}
          {/* Pagination for history */}
<div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between text-sm text-gray-700">
  <div className="flex items-center gap-2">
    <span>Hiển thị mỗi trang:</span>
    <select
      value={historyPerPage}
      onChange={(e) => {
        setHistoryPerPage(Number(e.target.value));
        setHistoryPage(1);
      }}
      className="border border-gray-300 rounded-lg px-2 py-1 text-sm"
    >
      <option value={5}>5</option>
      <option value={10}>10</option>
      <option value={20}>20</option>
    </select>
  </div>

  <div className="flex items-center gap-1">
    {/* Prev */}
    <button
      onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
      disabled={historyPage === 1}
      className={`px-3 py-1 rounded-md border ${
        historyPage === 1
          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
          : "bg-white hover:bg-gray-50"
      }`}
    >
      Trước
    </button>

    {/* Number pagination */}
    {(() => {
      const arr: (number | string)[] = [];
      const maxButtons = 5;

      if (historyTotalPages <= maxButtons) {
        for (let i = 1; i <= historyTotalPages; i++) arr.push(i);
      } else {
        arr.push(1);
        if (historyPage > 3) arr.push("...");
        const middle = [historyPage - 1, historyPage, historyPage + 1].filter(
          (p) => p > 1 && p < historyTotalPages
        );
        arr.push(...middle);
        if (historyPage < historyTotalPages - 2) arr.push("...");
        arr.push(historyTotalPages);
      }

      return arr.map((num, i) =>
        num === "..." ? (
          <span key={i} className="px-2 text-gray-400">
            ...
          </span>
        ) : (
          <button
            key={i}
            onClick={() => setHistoryPage(num as number)}
            className={`px-3 py-1 rounded-md border ${
              num === historyPage
                ? "bg-red-600 text-white border-red-600"
                : "bg-white hover:bg-gray-50"
            }`}
          >
            {num}
          </button>
        )
      );
    })()}

    {/* Next */}
    <button
      onClick={() =>
        setHistoryPage((p) => Math.min(historyTotalPages, p + 1))
      }
      disabled={historyPage === historyTotalPages}
      className={`px-3 py-1 rounded-md border ${
        historyPage === historyTotalPages
          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
          : "bg-white hover:bg-gray-50"
      }`}
    >
      Sau
    </button>
  </div>
</div>

          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-sm text-gray-600 flex items-center justify-between">
            <p>
              Hiển thị{" "}
              <span className="text-gray-900 font-medium">
                {history.length}
              </span>{" "}
              lần export gần nhất.
            </p>
            <button
              onClick={loadHistory}
              className="flex items-center gap-2 text-red-600 hover:text-red-700"
            >
              <RefreshCcw className="w-4 h-4" />
              Làm mới
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
