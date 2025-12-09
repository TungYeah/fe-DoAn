import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  History,
  Search,
  Filter,
  Download,
  Calendar,
  User,
  FileText,
  Eye,
  RefreshCcw,
  Clock,
  Activity,
  Shield,
  Database,
  Edit,
  Plus,
  Ban,
  CheckCircle,
  AlertTriangle,
  User2,
  UserCheck,
  UserCircle,
  ShieldAlert,
  ShieldBan,
  ShieldCheck,
} from "lucide-react";
import { Modal } from "../ui/modal";
import { Description } from "@radix-ui/react-dialog";

const API_BASE_URL = "http://localhost:8080";

type HistoryItem = {
  id: string;
  version: number;
  isDeleted: boolean | number;
  flagStatus: number;
  createDate: string;
  lastUpdateDate: string;
  createdBy: string;
  lastUpdatedBy: string;
  identify: string;
  description: string;
  action: string;
  historyType: string;
  content: any;
};

type HistoryStats = {
  total: number;
  creates: number;
  updates: number;
  deletes: number;
  today: number;
};

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [filtered, setFiltered] = useState<HistoryItem[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAction, setSelectedAction] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [selectedHistory, setSelectedHistory] = useState<HistoryItem | null>(
    null
  );
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const [loading, setLoading] = useState(false);

  // phân trang FE
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);

  // ============================
  // helpers
  // ============================

  const parseContent = (content: any) => {
    if (content == null) return {};
    if (typeof content === "object") return content;
    if (typeof content === "string") {
      try {
        return JSON.parse(content);
      } catch {
        return { raw: content };
      }
    }
    return { raw: content };
  };

  const getActionColor = (a: string) =>
    a === "CREATE"
      ? "bg-green-100 text-green-700"
      : a === "UPDATE"
      ? "bg-blue-100 text-blue-700"
      : a === "DELETE"
      ? "bg-red-100 text-red-700"
      : "bg-gray-100 text-gray-700";

  const getActionIcon = (a: string) =>
    a === "CREATE" ? (
      <Plus className="w-3 h-3" />
    ) : a === "UPDATE" ? (
      <Edit className="w-3 h-3" />
    ) : a === "DELETE" ? (
      <Trash2 className="w-3 h-3" />
    ) : (
      <Activity className="w-3 h-3" />
    );

  const getTypeColor = (t: string) =>
    t === "USER_MANAGEMENT"
      ? "bg-purple-100 text-purple-700"
      : t === "DEVICE_MANAGEMENT"
      ? "bg-orange-100 text-orange-700"
      : t === "PROFILE_UPDATE"
      ? "bg-cyan-100 text-cyan-700"
      : t === "SETTINGS"
      ? "bg-pink-100 text-pink-700"
      : "bg-gray-100 text-gray-700";

  const getDateParts = (iso?: string) => {
    if (!iso) return { date: "", time: "" };
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return { date: iso, time: "" };
    return {
      date: d.toLocaleDateString("vi-VN"),
      time: d.toLocaleTimeString("vi-VN"),
    };
  };

  const isToday = (iso?: string) => {
    if (!iso) return false;
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return false;
    const now = new Date();
    return (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    );
  };

  const stats: HistoryStats = {
    total: history.length,
    creates: history.filter((h) => h.action === "CREATE").length,
    updates: history.filter((h) => h.action === "UPDATE").length,
    deletes: history.filter((h) => h.action === "DELETE").length,
    today: history.filter((h) => isToday(h.createDate)).length,
  };

  // ============================
  // load data
  // ============================

  const loadHistory = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.warn("No token in localStorage");
      return;
    }

    try {
      setLoading(true);

      // lấy nhiều nhất có thể, FE tự phân trang
      const res = await fetch(
        `${API_BASE_URL}/api/admin/history?page=0&size=1000`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Fetch history failed: ${res.status}`);
      }

      const data = await res.json();

      const list: HistoryItem[] = (data.content || []).map((h: any) => {
        const createDate = h.createDate || h.create_date || h.created_at || "";
        const lastUpdateDate =
          h.lastUpdateDate || h.last_update_date || h.updated_at || "";

        return {
          id: h.id,
          version: h.version ?? 0,
          isDeleted: h.isDeleted ?? h.is_deleted ?? 0,
          flagStatus: h.flagStatus ?? h.flag_status ?? 1,
          createDate,
          lastUpdateDate,
          createdBy: h.createdBy ?? h.created_by ?? "",
          lastUpdatedBy: h.lastUpdatedBy ?? h.last_updated_by ?? "",
          identify: h.identify ?? "",
          description: h.description ?? "",

          action: h.action ?? "",
          historyType: h.historyType ?? h.history_type ?? "",
          content: h.content,
        };
      });

      setHistory(list);
      setFiltered(list);
      setPage(1);
    } catch (e: any) {
      console.error(e);
      alert(e.message || "Không tải được lịch sử");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  // ============================
  // filter
  // ============================

  useEffect(() => {
    let data = [...history];

    data = data.filter((item) => {
      const search = searchTerm.toLowerCase();

      const matchesSearch =
        item.identify?.toLowerCase().includes(search) ||
        item.createdBy?.toLowerCase().includes(search) ||
        item.id?.toLowerCase().includes(search);

      const matchesAction =
        selectedAction === "all" || item.action === selectedAction;

      const matchesType =
        selectedType === "all" || item.historyType === selectedType;

      // filter date
      let matchesDate = true;
      if (dateFrom) {
        const from = new Date(dateFrom + "T00:00:00");
        const created = item.createDate ? new Date(item.createDate) : null;
        if (!created || created < from) matchesDate = false;
      }
      if (matchesDate && dateTo) {
        const to = new Date(dateTo + "T23:59:59");
        const created = item.createDate ? new Date(item.createDate) : null;
        if (!created || created > to) matchesDate = false;
      }

      return matchesSearch && matchesAction && matchesType && matchesDate;
    });

    setFiltered(data);
    setPage(1); // mỗi lần filter thì về trang 1
  }, [searchTerm, selectedAction, selectedType, dateFrom, dateTo, history]);

  // ============================
  // phân trang FE
  // ============================
  const totalRecords = filtered.length;
  const totalPages = totalRecords === 0 ? 1 : Math.ceil(totalRecords / perPage);
  const startIndex = (page - 1) * perPage;
  const currentHistory = filtered.slice(startIndex, startIndex + perPage);

  const handleExport = (format: "csv" | "excel" | "json") => {
    alert(`Đang xuất lịch sử dạng ${format.toUpperCase()} (demo)…`);
  };

  const handleViewDetails = (item: HistoryItem) => {
    setSelectedHistory(item);
    setIsViewModalOpen(true);
  };

  // ============================
  // render
  // ============================

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl text-gray-900 mb-2">Lịch sử hệ thống</h1>
          <p className="text-gray-600">
            Quản lý và theo dõi mọi hoạt động trong hệ thống
          </p>
        </div>
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleExport("excel")}
            className="px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-red-600 hover:text-red-600 transition-all flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            Xuất báo cáo
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={loadHistory}
            className="px-6 py-3 bg-gradient-to-r from-red-700 to-red-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
          >
            <RefreshCcw className="w-5 h-5" />
            Làm mới
          </motion.button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="flex items-center gap-4 bg-white p-4 border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all"
        >
          <div className="p-3 bg-blue-50 rounded-lg">
            <Database className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Tổng bản ghi</p>
            <p className="text-xl font-semibold text-gray-900">{stats.total}</p>
          </div>
        </motion.div>
        {/* Tạo mới */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="flex items-center gap-4 bg-white p-4 border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all"
        >
          <div className="p-3 bg-green-50 rounded-lg">
            <Plus className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Tạo mới</p>
            <p className="text-xl font-semibold text-green-700">
              {stats.creates}
            </p>
          </div>
        </motion.div>

        {/* Cập nhật */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="flex items-center gap-4 bg-white p-4 border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all"
        >
          <div className="p-3 bg-blue-50 rounded-lg">
            <Edit className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Cập nhật</p>
            <p className="text-xl font-semibold text-gray-900">
              {stats.updates}
            </p>
          </div>
        </motion.div>

        {/* Xóa */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="flex items-center gap-4 bg-white p-4 border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all"
        >
          <div className="p-3 bg-red-50 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Xóa</p>
            <p className="text-xl font-semibold text-red-600">
              {stats.deletes}
            </p>
          </div>
        </motion.div>

        {/* Hôm nay */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="flex items-center gap-4 bg-white p-4 border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all"
        >
          <div className="p-3 bg-orange-50 rounded-lg">
            <Clock className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Hôm nay</p>
            <p className="text-xl font-semibold text-orange-600">
              {stats.today}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-6 border border-gray-200"
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
            <Filter className="w-5 h-5 text-red-600" />
          </div>
          <h3 className="text-xl text-gray-900 font-semibold">Bộ lọc</h3>
        </div>

        {/* SEARCH — full width */}
        <div className="mb-6">
          <label className="block text-gray-700 mb-2 text-sm">Tìm kiếm</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="ID, email, người thực hiện..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl
        focus:border-red-600 focus:outline-none transition-colors text-sm"
            />
          </div>
        </div>

        {/* 4 FILTERS — 1 dòng trên màn lớn */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Action */}
          <div>
            <label className="block text-gray-700 mb-2 text-sm">
              Hành động
            </label>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={selectedAction}
                onChange={(e) => setSelectedAction(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl
          bg-white focus:border-red-600 focus:outline-none transition-colors text-sm"
              >
                <option value="all">Tất cả</option>
                <option value="CREATE">Tạo mới</option>
                <option value="UPDATE">Cập nhật</option>
                <option value="DELETE">Xóa</option>
              </select>
            </div>
          </div>

          {/* Type */}
          <div>
            <label className="block text-gray-700 mb-2 text-sm">
              Loại bản ghi
            </label>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl
          bg-white focus:border-red-600 focus:outline-none transition-colors text-sm"
              >
                <option value="all">Tất cả</option>
                <option value="USER_MANAGEMENT">Quản lý User</option>
                <option value="DEVICE_MANAGEMENT">Quản lý thiết bị</option>
                <option value="PROFILE_UPDATE">Cập nhật hồ sơ</option>
                <option value="SETTINGS">Cài đặt hệ thống</option>
              </select>
            </div>
          </div>

          {/* Date from */}
          <div>
            <label className="block text-gray-700 mb-2 text-sm">Từ ngày</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl
          focus:border-red-600 focus:outline-none transition-colors text-sm"
              />
            </div>
          </div>

          {/* Date to */}
          <div>
            <label className="block text-gray-700 mb-2 text-sm">Đến ngày</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl
          focus:border-red-600 focus:outline-none transition-colors text-sm"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
      >
        {/* top bar: perPage */}
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
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>

          <p>
            Tổng{" "}
            <span className="font-semibold text-gray-900">
              {totalRecords.toLocaleString("vi-VN")}
            </span>{" "}
            bản ghi
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs text-gray-600">
                  Thời gian
                </th>
                <th className="px-4 py-3 text-left text-xs text-gray-600">
                  Loại hành động
                </th>
                <th className="px-4 py-3 text-left text-xs text-gray-600">
                  Loại quản lý
                </th>
                <th className="px-4 py-3 text-left text-xs text-gray-600">
                  Người thực hiện
                </th>
                <th className="px-4 py-3 text-left text-xs text-gray-600">
                  Định danh đối tượng
                </th>
                <th className="px-4 py-3 text-left text-xs text-gray-600">
                  Hành động
                </th>
                <th className="px-4 py-3 text-left text-xs text-gray-600">
                  Trạng thái
                </th>
                <th className="px-4 py-3 text-left text-xs text-gray-600">
                  Version
                </th>
                <th className="px-4 py-3 text-center text-xs text-gray-600">
                  Chi tiết
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-6 text-center text-gray-500"
                  >
                    Đang tải dữ liệu...
                  </td>
                </tr>
              )}

              {!loading && currentHistory.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-6 text-center text-gray-500"
                  >
                    Không có bản ghi nào.
                  </td>
                </tr>
              )}

              {!loading &&
                currentHistory.map((item, idx) => {
                  const { date, time } = getDateParts(item.createDate);
                  return (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.2,
                        delay: Math.min(0.02 * idx, 0.2),
                      }}
                      className={`hover:bg-gray-50 transition-all ${
                        item.isDeleted ? "bg-red-50/40" : ""
                      }`}
                    >
                      {/* time */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-900">{date}</p>
                            <p className="text-xs text-gray-500">{time}</p>
                          </div>
                        </div>
                      </td>

                      {/* action */}
                      <td className="px-4 py-3">
                        {item.action === "CREATE" && (
                          <div className="flex items-center gap-1.5">
                            <Plus className="w-3.5 h-3.5 text-green-600" />
                            <span className="text-xs text-green-600">
                              CREATE
                            </span>
                          </div>
                        )}

                        {item.action === "UPDATE" && (
                          <div className="flex items-center gap-1.5">
                            <Edit className="w-3.5 h-3.5 text-blue-600" />
                            <span className="text-xs text-blue-600">
                              UPDATE
                            </span>
                          </div>
                        )}

                        {item.action === "DELETE" && (
                          <div className="flex items-center gap-1.5">
                            <Trash2 className="w-3.5 h-3.5 text-red-600" />
                            <span className="text-xs text-red-600">DELETE</span>
                          </div>
                        )}
                      </td>

                      {/* type */}
                      <td className="px-4 py-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium ${getTypeColor(
                            item.historyType
                          )}`}
                        >
                          {item.historyType
                            ? item.historyType.replace(/_/g, " ")
                            : "Không rõ"}
                        </span>
                      </td>
                      {/* created by */}
                      <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">

                      <UserCircle className="w-3.5 h-3.5 text-gray-400" />

                          <span className="text-xs text-gray-900">
                          {item.createdBy || "—"}
                        </span>
                                                </div>

                      </td>
                      {/* identify */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-xs text-gray-900">
                            {item.identify || "—"}
                          </span>
                        </div>
                      </td>
                      {/* Hành động */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-xs text-gray-900">
                            {item.description || "—"}
                          </span>
                        </div>
                      </td>


                      {/* status */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          {item.isDeleted ? (
                            <>
                              <Ban className="w-3.5 h-3.5 text-red-600" />
                              <span className="text-xs text-red-600">
                                Deleted
                              </span>
                            </>
                          ) : item.flagStatus === 1 ? (
                            <>
                              <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                              <span className="text-xs text-green-600">
                                Active
                              </span>
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="w-3.5 h-3.5 text-yellow-600" />
                              <span className="text-xs text-yellow-600">
                                Inactive
                              </span>
                            </>
                          )}
                        </div>
                      </td>
                         <td className="px-4 py-3">
                        <span className="text-xs text-gray-600">
                          v{item.version}

                        </span>
                      </td>
                      {/* actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleViewDetails(item)}
                            className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        {/* pagination */}
        {totalRecords > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3 text-sm text-gray-700">
            <p>
              Trang {page} / {totalPages} — Hiển thị {startIndex + 1}–
              {Math.min(startIndex + perPage, totalRecords)} / {totalRecords}{" "}
              bản ghi
            </p>

            <div className="flex items-center gap-1">
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

      {/* MODAL VIEW DETAILS */}
     <Modal
  isOpen={isViewModalOpen}
  onClose={() => setIsViewModalOpen(false)}
  title="Chi tiết bản ghi lịch sử"
  subtitle="Xem thông tin đầy đủ về hành động này"
  icon={<History className="w-5 h-5 text-white" />}
>
  {selectedHistory && (
<div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">

      {/* ===================== ROW 1: ID + Version ===================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl border border-gray-200 bg-gray-50">
          <p className="text-[12px] text-gray-500 mb-1">ID Bản ghi</p>
          <p className="text-sm font-mono text-gray-900 break-all">
            {selectedHistory.id}
          </p>
        </div>

        <div className="p-4 rounded-xl border border-gray-200 bg-gray-50">
          <p className="text-[12px] text-gray-500 mb-1">Version</p>
          <span className="inline-block px-3 py-1 rounded-full bg-gray-200 text-gray-800 text-xs">
            v{selectedHistory.version}
          </span>
        </div>
      </div>

      {/* ===================== ROW 2: Action + Type ===================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Hành động */}
        <div className="p-4 rounded-xl border border-gray-200 bg-gray-50">
          <p className="text-[12px] text-gray-500 mb-1">Hành động</p>

           {selectedHistory.action === "CREATE" && (
        <div className="flex items-center gap-1.5">
          <Plus className="w-3.5 h-3.5 text-green-600" />
          <span className="text-xs font-medium text-green-700">CREATE</span>
        </div>
      )}

              {selectedHistory.action === "UPDATE" && (
        <div className="flex items-center gap-1.5">
          <Edit className="w-3.5 h-3.5 text-blue-600" />
          <span className="text-xs font-medium text-blue-700">UPDATE</span>
        </div>
      )}


          {selectedHistory.action === "DELETE" && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-200">
              <Trash2 className="w-3.5 h-3.5 text-red-600" />
              <span className="text-xs font-medium text-red-700">DELETE</span>
            </div>
          )}
        </div>

        {/* Loại */}
        <div className="p-4 rounded-xl border border-gray-200 bg-gray-50">
          <p className="text-[12px] text-gray-500 mb-1">Loại</p>
          <span className="inline-block px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-medium">
            {selectedHistory.historyType?.replace(/_/g, " ") || "Không rõ"}
          </span>
        </div>
      </div>

      {/* ===================== ROW 3: Time ===================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl border border-gray-200 bg-gray-50">
          <p className="text-[12px] text-gray-500 flex items-center gap-1 mb-1">
            <Clock className="w-4 h-4 text-gray-500" /> Thời gian tạo
          </p>
          <p className="text-sm text-gray-900">{selectedHistory.createDate}</p>
        </div>

        <div className="p-4 rounded-xl border border-gray-200 bg-gray-50">
          <p className="text-[12px] text-gray-500 flex items-center gap-1 mb-1">
            <Clock className="w-4 h-4 text-gray-500" /> Cập nhật lần cuối
          </p>
          <p className="text-sm text-gray-900">
            {selectedHistory.lastUpdateDate || "—"}
          </p>
        </div>
      </div>

      {/* ===================== ROW 4: CreatedBy + UpdatedBy ===================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl border border-gray-200 bg-gray-50">
          <p className="text-[12px] text-gray-500 flex items-center gap-1 mb-1">
            <User className="w-4 h-4 text-gray-500" /> Người thực hiện
          </p>
          <p className="text-sm text-gray-900">{selectedHistory.createdBy}</p>
        </div>

        <div className="p-4 rounded-xl border border-gray-200 bg-gray-50">
          <p className="text-[12px] text-gray-500 flex items-center gap-1 mb-1">
            <User className="w-4 h-4 text-gray-500" /> Đối tượng định danh
          </p>
          <p className="text-sm text-gray-900">
            {selectedHistory.identify || "—"}
          </p>
        </div>
      </div>

      {/* ===================== Định danh ===================== */}
      <div className="p-4 rounded-xl border border-blue-200 bg-blue-50">
        <p className="text-[12px] text-blue-700 font-semibold mb-1 flex items-center gap-1">
          <ShieldCheck className="w-4 h-4 text-blue-700" /> Hành động
        </p>
        <p className="text-sm text-blue-900">{selectedHistory.description}</p>
      </div>

      {/* ===================== Trạng thái ===================== */}
      <div
        className={`p-4 rounded-xl border ${
          selectedHistory.isDeleted
            ? "bg-red-50 border-red-200"
            : selectedHistory.flagStatus === 1
            ? "bg-green-50 border-green-200"
            : "bg-yellow-50 border-yellow-200"
        }`}
      >
        <div className="flex items-center gap-2">
          {selectedHistory.isDeleted ? (
            <>
              <Ban className="w-4 h-4 text-red-600" />
              <span className="text-sm text-red-700">Bản ghi đã bị xóa</span>
            </>
          ) : selectedHistory.flagStatus === 1 ? (
            <>
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-700">Bản ghi đang hoạt động</span>
            </>
          ) : (
            <>
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
              <span className="text-sm text-yellow-700">Không hoạt động</span>
            </>
          )}
        </div>
      </div>

      {/* ===================== JSON Content ===================== */}
      <div className="p-4 rounded-xl border border-gray-200 bg-gray-50">
        <p className="text-[12px] text-gray-600 font-medium flex items-center gap-2 mb-2">
          <FileText className="w-4 h-4 text-gray-600" /> Nội dung (JSON)
        </p>

        <pre className="text-xs bg-white p-4 border border-gray-300 rounded-lg max-h-60 overflow-auto text-gray-800">
          {JSON.stringify(parseContent(selectedHistory.content), null, 2)}
        </pre>
      </div>

      {/* ===================== Footer ===================== */}
      <div className="flex justify-end gap-3 pt-1">
        <button
          onClick={() => setIsViewModalOpen(false)}
          className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 text-sm"
        >
          Đóng
        </button>

        <button
          onClick={() => navigator.clipboard.writeText(selectedHistory.id)}
          className="px-5 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 text-sm shadow-sm"
        >
          Copy ID
        </button>
      </div>
    </div>
  )}
</Modal>

    </div>
  );
}

// ============================
type StatProps = {
  icon: React.ReactNode;
  label: string;
  value: number;
};

function StatCard({ icon, label, value }: StatProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl p-4 border border-gray-200"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
          {icon}
        </div>
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <p className="text-2xl text-gray-900">
            {value.toLocaleString("vi-VN")}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
