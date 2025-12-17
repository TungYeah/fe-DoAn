import { Modal } from "@/components/ui/modal";
import { MultiSelectDropdown } from "@/components/ui/MultiSelectDropdown";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";

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
  // --- EXPORT META ---
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFileName, setExportFileName] = useState("");
  // --- PAGINATION STATE ---
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);

  // --- STATE METADATA ---
  const [deviceTypes, setDeviceTypes] = useState([]);
  const [properties, setProperties] = useState([]);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<Province | null>(
    null
  );
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(
    null
  );
  const [selectedWard, setSelectedWard] = useState<Ward | null>(null);

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

  const handleProvinceChange = (code: string) => {
    const p = provinces.find((x) => String(x.code) === code) || null;

    setSelectedProvince(p);
    setSelectedDistrict(null);
    setSelectedWard(null);

    setDistricts(p?.districts || []);
    setWards([]);

    setLocationState((prev) => ({
      ...prev,
      province: p?.name || "",
      district: "",
      ward: "",
    }));
  };

  const handleDistrictChange = (code: string) => {
    const d = districts.find((x) => String(x.code) === code) || null;

    setSelectedDistrict(d);
    setSelectedWard(null);

    setWards(d?.wards || []);

    setLocationState((prev) => ({
      ...prev,
      district: d?.name || "",
      ward: "",
    }));
  };

  const handleWardChange = (code: string) => {
    const w = wards.find((x) => String(x.code) === code) || null;

    setSelectedWard(w);

    setLocationState((prev) => ({
      ...prev,
      ward: w?.name || "",
    }));
  };

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
  const normalizeFileName = (value: string) => {
    return value
      .normalize("NFD") // tách dấu
      .replace(/[\u0300-\u036f]/g, "") // bỏ dấu
      .replace(/\s+/g, "_") // space → _
      .replace(/[^a-zA-Z0-9_-]/g, "") // chỉ cho a-z A-Z 0-9 _ -
      .replace(/_+/g, "_"); // gộp nhiều _
  };

  // Load provinces với depth=3
  useEffect(() => {
    fetch("/data/vietnam_locations.json")
      .then((res) => {
        if (!res.ok) throw new Error("Không load được file location offline");
        return res.json();
      })
      .then((data) => setProvinces(data || []))
      .catch((err) => {
        console.error(err);
        toast.error("Lỗi tải dữ liệu tỉnh/thành (offline)");
        setProvinces([]);
      });
  }, []);

  // Khi chọn Province -> fill District

  // Khi chọn District -> fill Ward

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
      const unitStr = item.unit ? ` ${item.unit}` : "";
      row[item.propertyName] = `${item.value}${unitStr}`;
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
  const generateDefaultExportInfo = () => {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, "0");

    const timeStr = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(
      now.getSeconds()
    )}`;

    const fileName = `Bao_cao_IoT_${dates.from}_${dates.to}_${timeStr}.csv`;

    return { fileName };
  };

  // 3. Handle Search
  const handleQuery = async () => {
    if (!dates.from || !dates.to)
      return toast.warning("Vui lòng chọn khoảng ngày!");

    setLoading(true);
    try {
      const payload = createPayload();
      const res = await axios.post(`${API_BASE}/data-query/lake`, payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setRawResults(res.data);
      setPage(1); // ✅ reset về trang 1
      setShowResults(true);
    } catch (err) {
      console.error(err);
      toast.warning("Không tìm thấy dữ liệu phù hợp!");
    } finally {
      setLoading(false);
    }
  };

  // 4. Export CSV & Save History
  const handleExportCSV = async () => {
    if (pivotedData.length === 0)
      return toast.warning("Không có dữ liệu để xuất!");

    const defaults = generateDefaultExportInfo();

    // 👉 Ưu tiên user nhập, không có thì auto
    const finalFileName =
      (exportFileName?.trim() || defaults.fileName).replace(/\.csv$/i, "") +
      ".csv";

    // ===== A. TẠO CSV (GIỮ NGUYÊN LOGIC CŨ) =====
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
    link.href = url;
    link.setAttribute("download", finalFileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // ===== B. LƯU HISTORY – API CŨ =====
    try {
      await axios.post(
        `${API_BASE}/data-query/history?fileName=${finalFileName}`,
        {
          ...createPayload(),
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      fetchHistory();
    } catch (e) {
      console.error("Không thể lưu lịch sử export", e);
    }

    // ===== C. RESET UI =====
    setShowExportModal(false);
    setExportFileName("");
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

      // ===== RESTORE LOCATION (OFFLINE - SAFE & FULL) =====

      // Nếu dữ liệu địa chỉ chưa load xong
      if (!provinces.length) {
        toast.warning("Đang tải dữ liệu địa chỉ, vui lòng thử lại");
        return;
      }

      // CASE 1: Lịch sử query = "Tất cả tỉnh" (province null / "")
      if (!payload.province) {
        setSelectedProvince(null);
        setSelectedDistrict(null);
        setSelectedWard(null);
        setDistricts([]);
        setWards([]);
      } else {
        const p = provinces.find((x) => x.name === payload.province) || null;

        if (p) {
          setSelectedProvince(p);
          setDistricts(p.districts || []);

          const d =
            p.districts?.find((x) => x.name === payload.district) || null;

          if (d) {
            setSelectedDistrict(d);
            setWards(d.wards || []);

            const w = d.wards?.find((x) => x.name === payload.ward) || null;

            setSelectedWard(w);
          } else {
            setSelectedDistrict(null);
            setWards([]);
            setSelectedWard(null);
          }
        } else {
          // Province trong history không khớp dữ liệu offline
          setSelectedProvince(null);
          setSelectedDistrict(null);
          setSelectedWard(null);
          setDistricts([]);
          setWards([]);
        }
      }

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
      toast.warning("Dữ liệu lịch sử bị lỗi!");
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

    setSelectedProvince(null);
    setSelectedDistrict(null);
    setSelectedWard(null);
    setDistricts([]);
    setWards([]);

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
  // ============================
  // PAGINATION LOGIC (RESULT TABLE)
  // ============================

  const totalRecordsResult = pivotedData.length;
  const totalPagesResult =
    totalRecordsResult === 0 ? 1 : Math.ceil(totalRecordsResult / perPage);

  const startIndexResult = (page - 1) * perPage;

  const currentResultData = pivotedData.slice(
    startIndexResult,
    startIndexResult + perPage
  );

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
              value={
                selectedProvince?.code ? String(selectedProvince.code) : ""
              }
              onChange={(e) => handleProvinceChange(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-600 focus:outline-none transition-colors bg-white"
            >
              <option value="">-- Tất cả tỉnh --</option>
              {provinces.map((p) => (
                <option key={p.code} value={p.code}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Quận/Huyện */}
          <div>
            <label className="block text-gray-700 mb-2">Quận/Huyện</label>
            <select
              value={
                selectedDistrict?.code ? String(selectedDistrict.code) : ""
              }
              onChange={(e) => handleDistrictChange(e.target.value)}
              disabled={!selectedProvince || loading}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-600 focus:outline-none transition-colors bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">-- Tất cả quận --</option>
              {districts.map((d) => (
                <option key={d.code} value={d.code}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Xã/Phường */}
          <div>
            <label className="block text-gray-700 mb-2">Xã/Phường</label>
            <select
              value={selectedWard?.code ? String(selectedWard.code) : ""}
              onChange={(e) => handleWardChange(e.target.value)}
              disabled={!selectedDistrict || loading}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-600 focus:outline-none transition-colors bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">-- Tất cả xã --</option>
              {wards.map((w) => (
                <option key={w.code} value={w.code}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ===== ROW 4: LOẠI CẢM BIẾN (PROPERTIES) bảng chứa tooneg hợp
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
        </div> ===== */}
        {/* ===== ROW 4: LOẠI CẢM BIẾN (DROPDOWN) ===== */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="mb-6">
            <label className="block text-gray-700 mb-2 flex items-center gap-2">
              <Layers className="w-4 h-4 text-gray-500" />
              Loại cảm biến (Properties)
            </label>

            <MultiSelectDropdown
              options={properties}
              selectedIds={selectedProperties}
              onToggle={(id) => {
                setSelectedProperties((prev) =>
                  prev.includes(id)
                    ? prev.filter((x) => x !== id)
                    : [...prev, id]
                );
              }}
              placeholder="Chọn các thuộc tính cảm biến..."
              emptyMessage="Chưa có thuộc tính nào"
            />
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
                  onClick={() => setShowExportModal(true)}
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
              <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 text-sm text-gray-700">
  <div className="flex items-center gap-2">
    <span>Hiển thị mỗi trang:</span>
    <select
      value={perPage}
      onChange={(e) => {
        setPerPage(Number(e.target.value));
        setPage(1);
      }}
      className="border border-gray-300 rounded-lg px-2 py-1 text-sm"
    >
      <option value={10}>10</option>
      <option value={20}>20</option>
      <option value={50}>50</option>
      <option value={100}>100</option>
    </select>
  </div>

  <p>
    Tổng{" "}
    <span className="font-semibold text-gray-900">
      {totalRecordsResult.toLocaleString()}
    </span>{" "}
    bản ghi
  </p>
</div>

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
currentResultData.map((row) => (
                      <tr
                        key={row.uniqueKey}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {new Date(row.timestamp).toLocaleString("vi-VN")}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {row.deviceName}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {row.location}
                        </td>
                        {dynamicColumns.map((col) => (
                          <td key={col} className="px-6 py-4">
                            <span className="text-gray-900">
                              {row[col] || "-"}
                            </span>
                          </td>
                        ))}
                        <td className="px-6 py-4 text-sm text-gray-900">
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
              {totalRecordsResult > 0 && (
  <div className="px-6 py-4 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3 text-sm text-gray-700">
    <p>
      Trang {page} / {totalPagesResult} — Hiển thị{" "}
      {startIndexResult + 1}–
      {Math.min(startIndexResult + perPage, totalRecordsResult)} /{" "}
      {totalRecordsResult} bản ghi
    </p>

    <div className="flex items-center gap-1">
      {/* Previous */}
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

      {/* Page numbers */}
      {(() => {
        const arr: (number | string)[] = [];
        const maxButtons = 5;

        if (totalPagesResult <= maxButtons) {
          for (let i = 1; i <= totalPagesResult; i++) arr.push(i);
        } else {
          arr.push(1);

          if (page > 3) arr.push("...");

          const middle = [page - 1, page, page + 1].filter(
            (p) => p > 1 && p < totalPagesResult
          );
          arr.push(...middle);

          if (page < totalPagesResult - 2) arr.push("...");

          arr.push(totalPagesResult);
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
        onClick={() =>
          setPage((p) => Math.min(totalPagesResult, p + 1))
        }
        disabled={page === totalPagesResult}
        className={`px-3 py-1 rounded-md border ${
          page === totalPagesResult
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-white hover:bg-gray-50"
        }`}
      >
        Sau
      </button>
    </div>
  </div>
)}

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
                  <h3 className="text-white text-xl font-semibold">
                    Lịch sử truy vấn & tải xuống
                  </h3>
                  <p className="text-white text-sm font-semibold">
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
                      className="hover:bg-gray-50 transition-all"
                    >
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
                              {item.filterName}
                            </p>
                            {/* <p className="text-xs text-gray-500">Tải {item.download_count ?? 0} lần</p>  có thể thêm sau*/}
                          </div>
                        </motion.button>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {new Date(item.createAt).toLocaleString("vi-VN")}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {item.description}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-full text-xs bg-green-100 text-green-700">
                          CSV
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-3">
                          {/* XEM */}
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleRestoreHistory(item)}
                            className="p-2 rounded-lg border border-purple-600 text-purple-600 hover:bg-purple-50"
                            title="Xem lại truy vấn"
                          >
                            <Eye className="w-4 h-4" />
                          </motion.button>

                          {/* TẢI */}
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            title="Tải lại truy vấn"
                            className="p-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <Download className="w-4 h-4" />
                          </motion.button>

                          {/* XOÁ */}
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            title="Xóa truy vấn"
                            className="p-2 rounded-lg border border-red-300 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
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
      <Modal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        title="Xuất dữ liệu CSV"
        subtitle="Đặt tên file xuất dữ liệu"
        icon={<Download className="w-5 h-5 text-white" />}
        footer={
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowExportModal(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              Hủy
            </button>
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 bg-gradient-to-r from-red-700 to-red-600 text-white rounded-lg hover:shadow-lg transition-all text-sm flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          {/* Tên file */}
          <div>
            <label className="block text-xs text-gray-600 mb-1.5 font-medium">
              Tên file (CSV)
            </label>
            <input
              type="text"
              value={exportFileName}
              onChange={(e) => {
                const normalized = normalizeFileName(e.target.value);
                setExportFileName(normalized);
              }}
              placeholder="Bao_cao_IoT_2025-12-17"
              className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg
             focus:border-red-500 focus:ring-1 focus:ring-red-100 outline-none
             transition-all font-mono"
            />
          </div>

          {/* Gợi ý */}
          <p className="text-xs text-gray-500">
            Chỉ cho phép chữ và số, dấu <b>-</b> hoặc <b>_</b>. Không khoảng
            trắng.
            <br></br>
            Nếu không nhập tên file, hệ thống sẽ tự động tạo tên dựa trên khoảng
            thời gian truy vấn.
          </p>
        </div>
      </Modal>
    </div>
  );
}
