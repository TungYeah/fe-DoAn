import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Search,
  Filter,
  Calendar,
  MapPin,
  HardDrive,
  Download,
  FileText,
  Layers,
  History,
  RefreshCcw,
} from "lucide-react";
import { motion } from "framer-motion";

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

export default function DataQuery() {
  
  type Ward = { code: number; name: string };
type District = { code: number; name: string; wards: Ward[] };
type Province = { code: number; name: string; districts: District[] };

  // --- STATE METADATA ---
  const [deviceTypes, setDeviceTypes] = useState([]);
  const [properties, setProperties] = useState([]);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  // --- STATE FILTER ---
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
  useEffect(() => {
    fetch("https://provinces.open-api.vn/api/?depth=3")
      .then((res) => res.json())
      .then((data) => setProvinces(data || []))
      .catch(() => setProvinces([]));
  }, []);

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
  const handleSearch = async () => {
    if (!dates.from || !dates.to) return alert("Vui lòng chọn khoảng ngày!");

    setLoading(true);
    try {
      const payload = createPayload();
      const res = await axios.post(`${API_BASE}/data-query/lake`, payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setRawResults(res.data);
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
    } catch (e) {
      console.error("Lỗi khôi phục lịch sử", e);
      alert("Dữ liệu lịch sử bị lỗi!");
    } finally {
      setLoading(false);
    }
  };

  // --- RENDER ---
  return (
    <div className="space-y-6 p-4">
      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold flex items-center gap-2 text-gray-800">
          <HardDrive className="w-8 h-8 text-blue-600" />
          Truy vấn Data Lake
        </h1>
        <p className="text-gray-500">
          Tìm kiếm dữ liệu lịch sử lưu trữ trên MinIO theo Loại thiết bị & Vị
          trí
        </p>
      </motion.div>

      {/* Filter Panel */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Cột 1: Thời gian */}
        <div className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2 text-blue-700">
            <Calendar className="w-4 h-4" /> Thời gian
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-500">Từ ngày</label>
              <input
                type="date"
                className="w-full border rounded p-2 text-sm"
                value={dates.from}
                onChange={(e) => setDates({ ...dates, from: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Đến ngày</label>
              <input
                type="date"
                className="w-full border rounded p-2 text-sm"
                value={dates.to}
                onChange={(e) => setDates({ ...dates, to: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-500">Từ giờ</label>
              <input
                type="time"
                className="w-full border rounded p-2 text-sm"
                value={times.from}
                onChange={(e) => setTimes({ ...times, from: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Đến giờ</label>
              <input
                type="time"
                className="w-full border rounded p-2 text-sm"
                value={times.to}
                onChange={(e) => setTimes({ ...times, to: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Cột 2: Vị trí */}
        <div className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2 text-blue-700">
            <MapPin className="w-4 h-4" /> Vị trí (Lưu tại Device)
          </h3>
          <select
            className="w-full border rounded p-2 text-sm"
            value={locationState.province}
            onChange={(e) =>
              setLocationState({ ...locationState, province: e.target.value })
            }
          >
            <option value="">-- Tất cả Tỉnh/TP --</option>
            {provinces.map((p) => (
              <option key={p.code} value={p.name}>
                {p.name}
              </option>
            ))}
          </select>

          <select
            className="w-full border rounded p-2 text-sm"
            value={locationState.district}
            disabled={!locationState.province}
            onChange={(e) =>
              setLocationState({ ...locationState, district: e.target.value })
            }
          >
            <option value="">-- Tất cả Quận/Huyện --</option>
            {districts.map((d) => (
              <option key={d.code} value={d.name}>
                {d.name}
              </option>
            ))}
          </select>

          <select
            className="w-full border rounded p-2 text-sm"
            value={locationState.ward}
            disabled={!locationState.district}
            onChange={(e) =>
              setLocationState({ ...locationState, ward: e.target.value })
            }
          >
            <option value="">-- Tất cả Phường/Xã --</option>
            {wards.map((w) => (
              <option key={w.code} value={w.name}>
                {w.name}
              </option>
            ))}
          </select>
        </div>

        {/* Cột 3: Metadata */}
        <div className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2 text-blue-700">
            <Filter className="w-4 h-4" /> Metadata
          </h3>

          <div>
            <label className="text-xs text-gray-500 mb-1 block flex items-center gap-1">
              <Layers className="w-3 h-3" /> Chọn Loại thiết bị
            </label>
            <select
              className="w-full border rounded p-2 text-sm bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-blue-200"
              value={selectedDeviceTypeId}
              onChange={(e) => setSelectedDeviceTypeId(e.target.value)}
            >
              <option value="">-- Tất cả các loại --</option>
              {deviceTypes.map((dt: any) => (
                <option key={dt.id} value={dt.id}>
                  {dt.name} ({dt.category})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">
              Chọn Thuộc tính
            </label>
            <div className="flex flex-wrap gap-2 h-24 overflow-y-auto border rounded p-2 bg-gray-50">
              {properties.map((p: any) => (
                <label
                  key={p.id}
                  className="flex items-center gap-1 text-xs bg-white px-2 py-1 rounded border cursor-pointer hover:bg-blue-50 transition-colors"
                >
                  <input
                    type="checkbox"
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
                  {p.name}
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500 italic">
          {pivotedData.length > 0 &&
            `Tìm thấy ${pivotedData.length} dòng dữ liệu.`}
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExportCSV}
            disabled={pivotedData.length === 0}
            className="bg-green-600 text-white px-5 py-3 rounded-lg font-semibold flex items-center gap-2 hover:bg-green-700 disabled:bg-gray-300 transition-colors"
          >
            <Download className="w-5 h-5" /> Xuất CSV
          </button>
          <button
            onClick={handleSearch}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
          >
            {loading ? (
              "Đang xử lý..."
            ) : (
              <>
                <Search className="w-5 h-5" /> Truy vấn
              </>
            )}
          </button>
        </div>
      </div>

      {/* Result Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
          <h3 className="font-semibold flex items-center gap-2">
            <FileText className="w-4 h-4" /> Kết quả hiển thị
          </h3>
        </div>
        <div className="overflow-x-auto max-h-[600px]">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-gray-100 text-gray-700 sticky top-0 z-10">
              <tr>
                <th className="p-3 border-b border-r sticky left-0 bg-gray-100 min-w-[150px]">
                  Thời gian
                </th>
                <th className="p-3 border-b border-r min-w-[150px]">
                  Thiết bị
                </th>
                <th className="p-3 border-b border-r min-w-[300px]">
                  Vị trí chi tiết
                </th>

                {dynamicColumns.map((col) => (
                  <th
                    key={col}
                    className="p-3 border-b border-r text-center bg-blue-50 text-blue-800 font-semibold min-w-[100px]"
                  >
                    {col}
                  </th>
                ))}

                <th className="p-3 border-b text-center min-w-[100px]">Nhãn</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {pivotedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={4 + dynamicColumns.length}
                    className="p-12 text-center text-gray-400"
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
                    <td className="p-3 border-r sticky left-0 bg-white font-mono text-gray-600">
                      {new Date(row.timestamp).toLocaleString("vi-VN")}
                    </td>
                    <td className="p-3 border-r font-medium text-blue-600">
                      {row.deviceName}
                    </td>

                    <td
                      className="p-3 border-r text-gray-600 whitespace-normal break-words"
                      title={row.location}
                    >
                      {row.location}
                    </td>

                    {dynamicColumns.map((col) => (
                      <td
                        key={col}
                        className="p-3 border-r text-center font-semibold text-gray-700"
                      >
                        {row[col] ? (
                          row[col]
                        ) : (
                          <span className="text-gray-200">-</span>
                        )}
                      </td>
                    ))}

                    <td className="p-3 text-center">
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold shadow-sm border ${
                          row.label === "CRITICAL"
                            ? "bg-red-50 text-red-600 border-red-200"
                            : row.label === "WARNING"
                            ? "bg-orange-50 text-orange-600 border-orange-200"
                            : "bg-green-50 text-green-600 border-green-200"
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
      </div>

      {/* --- PHẦN LỊCH SỬ XUẤT CSV --- */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden mt-8">
        <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
          <h3 className="font-semibold flex items-center gap-2 text-gray-700">
            <History className="w-4 h-4" /> Lịch sử xuất báo cáo
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="p-3">Ngày tạo</th>
                <th className="p-3">Tên file</th>
                <th className="p-3">Mô tả bộ lọc</th>
                <th className="p-3 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {historyList.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-gray-500">
                    Chưa có lịch sử xuất file
                  </td>
                </tr>
              ) : (
                historyList.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="p-3 text-gray-600">
                      {/* Dùng createAt khớp với Entity */}
                      {new Date(item.createAt).toLocaleString("vi-VN")}
                    </td>

                    {/* Dùng filterName khớp với Entity */}
                    <td className="p-3 font-medium text-green-700">
                      {item.filterName}
                    </td>

                    <td className="p-3 text-gray-500">{item.description}</td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleRestoreHistory(item)}
                        className="bg-blue-100 text-blue-600 px-3 py-1 rounded text-xs font-bold hover:bg-blue-200 flex items-center gap-1 mx-auto transition-colors"
                        title="Tải lại bộ lọc và truy vấn ngay"
                      >
                        <RefreshCcw className="w-3 h-3" /> Truy vấn lại
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
