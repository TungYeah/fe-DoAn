import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import axios from "axios";
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
  MapPin,
  Layers,
  Clock,
  HardDrive,
  TrendingUp,
  ChevronDown,
} from "lucide-react";

const API_BASE = "http://localhost:8080/api/v1";

// Định nghĩa kiểu dữ liệu cho dòng hiển thị
interface PivotedRow {
  uniqueKey: string;
  timestamp: string;
  deviceName: string;
  location: string;
  label: string;
  [key: string]: string;
}

// Định nghĩa kiểu dữ liệu cho Lịch sử (Khớp với DTO Backend)
interface HistoryItem {
  id: number;
  filterName: string; // Tên file
  filterJson: string; // Payload JSON
  description: string;
  createAt: string; // Ngày tạo
}

type Ward = { code: number; name: string };
type District = { code: number; name: string; wards: Ward[] };
type Province = { code: number; name: string; districts: District[] };

export default function QueryPage2() {
  // --- STATE METADATA ---
  const [deviceTypes, setDeviceTypes] = useState([]);
  const [properties, setProperties] = useState([]);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  // --- STATE FILTER ---/
  const [selectedDeviceTypeId, setSelectedDeviceTypeId] = useState<string>("");
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);
  const [dates, setDates] = useState({ from: "", to: "" });
  const [times, setTimes] = useState({ from: "00:00", to: "23:59" });

  const [locationState, setLocationState] = useState({
    province: "",
    district: "",
    ward: "",
    specific: "",
  });

  // --- STATE RESULT ---
  const [rawResults, setRawResults] = useState<any[]>([]);
  const [pivotedData, setPivotedData] = useState<PivotedRow[]>([]);
  const [dynamicColumns, setDynamicColumns] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // --- STATE HISTORY ---
  const [historyList, setHistoryList] = useState<HistoryItem[]>([]);

  // --- UI STATE ---
  const [showResults, setShowResults] = useState(false);
  const [showHistory, setShowHistory] = useState(true);

  // Load provinces với depth=3
  useEffect(() => {
    fetch("https://provinces.open-api.vn/api/?depth=3")
      .then((res) => res.json())
      .then((data) => setProvinces(data || []))
      .catch(() => setProvinces([]));
  }, []);

  // Khi chọn Province -> fill District
  useEffect(() => {
    if (!locationState.province) {
      setDistricts([]);
      setWards([]);
      setLocationState((prev) => ({ ...prev, district: "", ward: "" }));
      return;
    }

    const p = provinces.find((p) => p.name === locationState.province);
    setDistricts(p?.districts || []);
    setWards([]);
    setLocationState((prev) => ({ ...prev, district: "", ward: "" }));
  }, [locationState.province, provinces]);

  // Khi chọn District -> fill Ward
  useEffect(() => {
    if (!locationState.district) {
      setWards([]);
      setLocationState((prev) => ({ ...prev, ward: "" }));
      return;
    }

    const d = districts.find((d) => d.name === locationState.district);
    setWards(d?.wards || []);
    setLocationState((prev) => ({ ...prev, ward: "" }));
  }, [locationState.district, districts]);

  // 1. Fetch Metadata & History khi load trang
  useEffect(() => {
    fetchMeta();
    fetchHistory();
  }, []);

  const fetchMeta = async () => {
    try {
      const [typeRes, propRes] = await Promise.all([
        axios.get(`${API_BASE}/iot/device-types?size=100`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }),
        axios.get(`${API_BASE}/iot/properties`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }),
      ]);
      setDeviceTypes(typeRes.data.content || []);
      setProperties(propRes.data.content || []);
    } catch (e) {
      console.error("Lỗi tải metadata", e);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${API_BASE}/data-query/history`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setHistoryList(res.data);
    } catch (e) {
      console.error("Lỗi tải lịch sử", e);
    }
  };

  // 2. Pivot Logic (Xử lý dữ liệu thô thành bảng)
  useEffect(() => {
    if (rawResults.length === 0) {
      setPivotedData([]);
      setDynamicColumns([]);
      return;
    }

    const groupedMap = new Map<string, PivotedRow>();
    const foundProperties = new Set<string>();

    rawResults.forEach((item) => {
      const key = `${item.deviceId}_${item.timestamp}`;

      if (!groupedMap.has(key)) {
        groupedMap.set(key, {
          uniqueKey: key,
          timestamp: item.timestamp,
          deviceName: item.deviceName,
          location: item.location || "Chưa cập nhật vị trí",
          label: item.label,
        });
      }

      const row = groupedMap.get(key)!;
      row[item.propertyName] = item.value;
      foundProperties.add(item.propertyName);
    });

    const processedRows = Array.from(groupedMap.values()).sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    setPivotedData(processedRows);
    setDynamicColumns(Array.from(foundProperties).sort());
  }, [rawResults]);

  // --- HELPER: Tạo Payload (Dùng chung cho Search và Save History) ---
  const createPayload = () => ({
    deviceTypeId: selectedDeviceTypeId || null,
    propertyIds: selectedProperties.length > 0 ? selectedProperties : null,
    fromDate: dates.from,
    toDate: dates.to,
    fromTime: times.from + ":00",
    toTime: times.to + ":59",
    province: locationState.province || null,
    district: locationState.district || null,
    ward: locationState.ward || null,
    specificLocation: locationState.specific || null,
  });

  // 3. Handle Search
  const handleQuery = async () => {
    if (!dates.from || !dates.to) return alert("Vui lòng chọn khoảng ngày!");

    setLoading(true);
    try {
      const payload = createPayload();
      const res = await axios.post(`${API_BASE}/data-query/lake`, payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setRawResults(res.data);
      setShowResults(true);
    } catch (err) {
      console.error(err);
      alert("Không tìm thấy dữ liệu phù hợp!");
    } finally {
      setLoading(false);
    }
  };

  // 4. Export CSV & Save History
  const handleExportCSV = async () => {
    if (pivotedData.length === 0) return alert("Không có dữ liệu để xuất!");

    // --- A. Tạo file CSV ---
    const headers = [
      "Thời gian",
      "Thiết bị",
      "Vị trí chi tiết",
      ...dynamicColumns,
      "Nhãn cảnh báo",
    ];

    const csvRows = pivotedData.map((row) => {
      const time = new Date(row.timestamp)
        .toLocaleString("vi-VN")
        .replace(",", "");
      const dynamicValues = dynamicColumns.map((col) => row[col] || "");
      const escape = (txt: string) =>
        `"${String(txt || "").replace(/"/g, '""')}"`;

      return [
        escape(time),
        escape(row.deviceName),
        escape(row.location),
        ...dynamicValues.map(escape),
        escape(row.label),
      ].join(",");
    });

    const csvContent = "\uFEFF" + [headers.join(","), ...csvRows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const fileName = `Bao_cao_IoT_${dates.from}_${dates.to}.csv`;

    link.href = url;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // --- B. Lưu lịch sử vào Backend ---
    try {
      await axios.post(
        `${API_BASE}/data-query/history?fileName=${fileName}`,
        createPayload(),
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      fetchHistory(); // Tải lại danh sách ngay sau khi lưu
    } catch (e) {
      console.error("Không thể lưu lịch sử export", e);
    }
  };

  // 5. Khôi phục lịch sử (Truy vấn lại)
  const handleRestoreHistory = async (item: HistoryItem) => {
    try {
      // Parse JSON từ trường filterJson
      const payload = JSON.parse(item.filterJson);

      // Fill lại dữ liệu vào ô input
      setDates({ from: payload.fromDate, to: payload.toDate });
      setTimes({
        from: payload.fromTime ? payload.fromTime.substring(0, 5) : "00:00",
        to: payload.toTime ? payload.toTime.substring(0, 5) : "23:59",
      });
      setLocationState({
        province: payload.province || "",
        district: payload.district || "",
        ward: payload.ward || "",
        specific: payload.specificLocation || "",
      });
      setSelectedDeviceTypeId(payload.deviceTypeId || "");
      setSelectedProperties(payload.propertyIds || []);

      // Gọi API tìm kiếm lại ngay lập tức
      setLoading(true);
      window.scrollTo({ top: 0, behavior: "smooth" }); // Cuộn lên đầu trang

      const res = await axios.post(`${API_BASE}/data-query/lake`, payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setRawResults(res.data);
      setShowResults(true);
    } catch (e) {
      console.error("Lỗi khôi phục lịch sử", e);
      alert("Dữ liệu lịch sử bị lỗi!");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedDeviceTypeId("");
    setSelectedProperties([]);
    setDates({ from: "", to: "" });
    setTimes({ from: "00:00", to: "23:59" });
    setLocationState({ province: "", district: "", ward: "", specific: "" });
    setShowResults(false);
  };

  // Calculate stats
  const totalRecords = pivotedData.length;
  const uniqueDevices = new Set(pivotedData.map((r) => r.deviceName)).size;
  const activeFiltersCount = [
    selectedDeviceTypeId,
    selectedProperties.length > 0,
    dates.from,
    dates.to,
    locationState.province,
    locationState.district,
    locationState.ward,
  ].filter(Boolean).length;

  let timeRangeLabel = "—";
  if (dates.from && dates.to) {
    const diffMs =
      new Date(dates.to).getTime() - new Date(dates.from).getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    timeRangeLabel = `${diffDays} ngày`;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl text-gray-900 mb-2">Truy vấn Data Lake</h1>
          <p className="text-gray-600">
            Tìm kiếm dữ liệu lịch sử lưu trữ trên MinIO theo Loại thiết bị & Vị
            trí
          </p>
        </div>
      </motion.div>

      {/* Query Builder */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
            <Search className="w-5 h-5 text-red-600" />
          </div>
          <h3 className="text-xl text-gray-900">Bộ lọc truy vấn</h3>
        </div>

        {/* ===== ROW 1: LOẠI THIẾT BỊ & THỜI GIAN ===== */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Loại thiết bị */}
          <div>
            <label className="block text-gray-700 mb-2 flex items-center gap-2">
              <Database className="w-4 h-4 text-gray-500" />
              Loại thiết bị
            </label>
            <select
              value={selectedDeviceTypeId}
              onChange={(e) => setSelectedDeviceTypeId(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-600 focus:outline-none transition-colors bg-white"
            >
              <option value="">-- Tất cả loại --</option>
              {deviceTypes.map((type: any) => (
                <option key={type.id} value={type.id}>
                  {type.name} ({type.category})
                </option>
              ))}
            </select>
          </div>

          {/* Từ ngày giờ */}
          <div>
            <label className="block text-gray-700 mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              Từ ngày
            </label>
            <input
              type="date"
              value={dates.from}
              onChange={(e) => setDates({ ...dates, from: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-600 focus:outline-none transition-colors"
            />
          </div>

          {/* Đến ngày giờ */}
          <div>
            <label className="block text-gray-700 mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              Đến ngày
            </label>
            <input
              type="date"
              value={dates.to}
              onChange={(e) => setDates({ ...dates, to: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-600 focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* ===== ROW 2: THỜI GIAN (GIỜ) ===== */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-gray-700 mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              Từ giờ
            </label>
            <input
              type="time"
              value={times.from}
              onChange={(e) => setTimes({ ...times, from: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-600 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              Đến giờ
            </label>
            <input
              type="time"
              value={times.to}
              onChange={(e) => setTimes({ ...times, to: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-600 focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* ===== ROW 3: ĐỊA CHỈ (TỈNH/QUẬN/XÃ) ===== */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Tỉnh/Thành phố */}
          <div>
            <label className="block text-gray-700 mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-500" />
              Tỉnh/Thành phố
            </label>
            <select
              value={locationState.province}
              onChange={(e) =>
                setLocationState({ ...locationState, province: e.target.value })
              }
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-600 focus:outline-none transition-colors bg-white"
            >
              <option value="">-- Tất cả tỉnh --</option>
              {provinces.map((p) => (
                <option key={p.code} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Quận/Huyện */}
          <div>
            <label className="block text-gray-700 mb-2">Quận/Huyện</label>
            <select
              value={locationState.district}
              onChange={(e) =>
                setLocationState({ ...locationState, district: e.target.value })
              }
              disabled={!locationState.province}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-600 focus:outline-none transition-colors bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">-- Tất cả quận --</option>
              {districts.map((d) => (
                <option key={d.code} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Xã/Phường */}
          <div>
            <label className="block text-gray-700 mb-2">Xã/Phường</label>
            <select
              value={locationState.ward}
              onChange={(e) =>
                setLocationState({ ...locationState, ward: e.target.value })
              }
              disabled={!locationState.district}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-600 focus:outline-none transition-colors bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">-- Tất cả xã --</option>
              {wards.map((w) => (
                <option key={w.code} value={w.name}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ===== ROW 4: LOẠI CẢM BIẾN (PROPERTIES) ===== */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-2 flex items-center gap-2">
            <Layers className="w-4 h-4 text-gray-500" />
            Loại cảm biến (Properties)
          </label>
          <div className="border-2 border-gray-200 rounded-xl p-3 bg-gray-50 max-h-40 overflow-y-auto">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {properties.map((p: any) => (
                <label
                  key={p.id}
                  className="flex items-center gap-2 text-sm bg-white px-3 py-2 rounded-lg border border-gray-200 cursor-pointer hover:bg-red-50 hover:border-red-300 transition-all"
                >
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                    checked={selectedProperties.includes(p.id)}
                    onChange={(e) => {
                      if (e.target.checked)
                        setSelectedProperties([...selectedProperties, p.id]);
                      else
                        setSelectedProperties(
                          selectedProperties.filter((id) => id !== p.id)
                        );
                    }}
                  />
                  <span className="text-gray-700">{p.name}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Query Actions */}
        <div className="flex gap-3 mt-6 pt-4 border-t">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleQuery}
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-red-700 to-red-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 disabled:opacity-60"
          >
            <Play className="w-5 h-5" />
            {loading ? "Đang truy vấn..." : "Thực hiện truy vấn"}
          </motion.button>
          <button
            onClick={handleReset}
            className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-red-600 hover:text-red-600 transition-all"
          >
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
                  <p className="text-2xl text-gray-900">{uniqueDevices}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center gap-3">
                <Filter className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Bộ lọc</p>
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
                <span className="text-gray-900">
                  {totalRecords.toLocaleString()}
                </span>{" "}
                bản ghi
              </p>
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleExportCSV}
                  disabled={pivotedData.length === 0}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:bg-gray-400"
                >
                  <Download className="w-4 h-4" />
                  CSV
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
                    <th className="px-6 py-4 text-left text-sm text-gray-600">
                      Thời gian
                    </th>
                    <th className="px-6 py-4 text-left text-sm text-gray-600">
                      Thiết bị
                    </th>
                    <th className="px-6 py-4 text-left text-sm text-gray-600">
                      Vị trí
                    </th>
                    {dynamicColumns.map((col) => (
                      <th
                        key={col}
                        className="px-6 py-4 text-left text-sm text-gray-600"
                      >
                        {col}
                      </th>
                    ))}
                    <th className="px-6 py-4 text-left text-sm text-gray-600">
                      Nhãn
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {pivotedData.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4 + dynamicColumns.length}
                        className="px-6 py-12 text-center text-gray-400"
                      >
                        Không có dữ liệu hiển thị
                      </td>
                    </tr>
                  ) : (
                    pivotedData.map((row) => (
                      <tr
                        key={row.uniqueKey}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 text-gray-900">
                          {new Date(row.timestamp).toLocaleString("vi-VN")}
                        </td>
                        <td className="px-6 py-4 text-gray-900">
                          {row.deviceName}
                        </td>
                        <td className="px-6 py-4 text-gray-700">
                          {row.location}
                        </td>
                        {dynamicColumns.map((col) => (
                          <td key={col} className="px-6 py-4">
                            <span className="text-gray-900">
                              {row[col] || "-"}
                            </span>
                          </td>
                        ))}
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs ${
                              row.label === "CRITICAL"
                                ? "bg-red-100 text-red-700"
                                : row.label === "WARNING"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {row.label}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Hiển thị{" "}
                <span className="text-gray-900">1-{pivotedData.length}</span>{" "}
                trong tổng số{" "}
                <span className="text-gray-900">{pivotedData.length}</span> bản
                ghi
              </p>
            </div>
          </motion.div>
        </>
      )}

      {/* Query History Section */}
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
                  <h3 className="text-white text-lg">
                    Lịch sử truy vấn & tải xuống
                  </h3>
                  <p className="text-white/80 text-sm">
                    Quản lý các truy vấn đã thực hiện
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-white/20 rounded-full text-white text-sm">
                  {historyList.length} truy vấn
                </span>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm text-gray-600">
                    Tên file
                  </th>
                  <th className="px-6 py-4 text-left text-sm text-gray-600">
                    Thời gian
                  </th>
                  <th className="px-6 py-4 text-left text-sm text-gray-600">
                    Mô tả
                  </th>
                  <th className="px-6 py-4 text-left text-sm text-gray-600">
                    Định dạng
                  </th>
                  <th className="px-6 py-4 text-center text-sm text-gray-600">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {historyList.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-gray-400"
                    >
                      Chưa có lịch sử truy vấn
                    </td>
                  </tr>
                ) : (
                  historyList.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <FileText className="w-5 h-5 text-blue-600" />
                          </div>
                          <p className="text-gray-900">{item.filterName}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {new Date(item.createAt).toLocaleString("vi-VN")}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {item.description}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-full text-xs bg-green-100 text-green-700">
                          CSV
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleRestoreHistory(item)}
                            className="p-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
                            title="Truy vấn lại"
                          >
                            <RefreshCcw className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-sm text-gray-600 flex items-center justify-between">
            <p>
              Hiển thị{" "}
              <span className="text-gray-900">{historyList.length}</span> lần
              export gần nhất.
            </p>
            <button
              onClick={fetchHistory}
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
