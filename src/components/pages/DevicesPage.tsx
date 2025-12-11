// src/components/pages/DevicesPage.tsx

import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "motion/react";
import {
  Search,
  Plus,
  Trash2,
  Wifi,
  WifiOff,
  Power,
  MapPin,
  Activity,
  Copy,
  Filter,
  RefreshCcw,PackageOpen,
  User2,
  UserPlus,
  UserPlus2,
} from "lucide-react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../ui/card";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableHeader,
} from "../ui/table";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Modal } from "../ui/modal";
import { Save, X } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "../ui/select";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { useAuth } from "../../contexts/AuthContext";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";

export default function DevicesPage() {
  // PHÂN TRANG
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const [currentUser, setCurrentUser] = useState<any>(null);
  const { user } = useAuth();
  console.log(">>> CURRENT USER:", user);
  console.log(">>> USER ID:", currentUser?.id);

  const CURRENT_USER_ID = user?.id || currentUser?.id;
  // FE: roles trả về từ Spring Boot là array string
  const roleList = user?.roles || currentUser?.roles || [];

  const isAdmin = roleList.includes("ROLE_ADMIN");

  console.log("ROLE LIST:", roleList);
  console.log("IS ADMIN:", isAdmin);

  // =================== STATE =====================
  const [activeTab, setActiveTab] = useState<"overview" | "details">(
    "overview"
  );
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [copied, setCopied] = useState("");
  const [copiedRow, setCopiedRow] = useState<string | null>(null);

  const [devices, setDevices] = useState<any[]>([]);
  const [deviceTypes, setDeviceTypes] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Popup
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<any | null>(null);

  // Dropdown filters
  const [filterStatus, setFilterStatus] = useState<
    "all" | "online" | "offline" | "warning"
  >("all");

  // Location state
  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);

  const [selectedProvince, setSelectedProvince] = useState<any | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<any | null>(null);
  const [selectedWard, setSelectedWard] = useState<any | null>(null);

  const [formError, setFormError] = useState("");

  const [newDevice, setNewDevice] = useState({
    name: "",
    created_by: "",
    unique_identifier: "",
    description: "",
    device_type_id: "",
  });

  // ============ FETCH DATA ============
  useEffect(() => {
    if (!currentUser?.id) return; // ⛔ chặn khi user chưa load xong
    fetchDevices();
    fetchDeviceTypes();
    fetchProvinces();
  }, [currentUser]);
  // ============ lấy thong tin ng dùng ===============

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          console.warn("⛔ Không có token -> không fetch current user");
          return;
        }

        const res = await fetch("http://localhost:8080/api/v1/auth/current", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        // Kiểm tra status API (tránh đọc JSON sai)
        if (!res.ok) {
          console.error("❌ Lấy current user thất bại, status:", res.status);

          // Token hết hạn → logout optional
          if (res.status === 401 || res.status === 403) {
            console.warn("⚠️ Token hết hạn hoặc không hợp lệ");
            // localStorage.removeItem("token");  // nếu muốn logout
          }

          return;
        }

        const data = await res.json();

        console.log(">>> CURRENT USER (API):", data);

        setCurrentUser(data);
      } catch (err) {
        console.error("🔥 Lỗi khi fetch current user:", err);
      }
    };

    fetchCurrentUser();
  }, []);

  const fetchDevices = async () => {
    try {
      // Lấy user id
      const uid =
        user?.id || currentUser?.id || Number(localStorage.getItem("user_id"));

      if (!uid) {
        console.log("⛔ Không có user_id -> dừng fetch devices.");
        return;
      }

      // Lấy roles: ưu tiên AuthContext -> fallback currentUser
      const roleList = user?.roles || currentUser?.roles || [];

      const isAdmin = roleList.includes("ROLE_ADMIN");

      console.log("FETCH DEVICES → ROLES:", roleList);
      console.log("FETCH DEVICES → IS ADMIN:", isAdmin);

      // Gọi API với role
      const res = await axios.get("http://localhost:5000/api/devices", {
        params: {
          user_id: uid,
          role: isAdmin ? "admin" : "user",
        },
      });

      console.log(">>> DATA DEVICES:", res.data);

      setDevices(
        (res.data?.devices || []).map((d: any) => ({
          ...d,
          status: getStatusFromFlag(d.flag_status),
        }))
      );
    } catch (err) {
      console.error("❌ Lỗi tải thiết bị:", err);
    }
  };

  const fetchDeviceTypes = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/device-types");
      setDeviceTypes(res.data?.device_types || []);
    } catch (err) {
      console.error("Lỗi tải loại thiết bị:", err);
    }
  };

  // ============ LOCATION API ============
  const fetchProvinces = async () => {
    try {
      const res = await axios.get("https://provinces.open-api.vn/api/p/");
      setProvinces(res.data || []);
    } catch (err) {
      console.error("Lỗi tải tỉnh:", err);
    }
  };

  const handleProvinceChange = async (code: string) => {
    const p = provinces.find((item) => String(item.code) === code) || null;
    setSelectedProvince(p);
    setSelectedDistrict(null);
    setSelectedWard(null);
    setDistricts([]);
    setWards([]);

    try {
      const res = await axios.get(
        `https://provinces.open-api.vn/api/p/${code}?depth=2`
      );
      setDistricts(res.data?.districts || []);
    } catch (err) {
      console.error("Lỗi tải quận:", err);
    }
  };

  const handleDistrictChange = async (code: string) => {
    const d = districts.find((item) => String(item.code) === code) || null;
    setSelectedDistrict(d);
    setSelectedWard(null);
    setWards([]);

    try {
      const res = await axios.get(
        `https://provinces.open-api.vn/api/d/${code}?depth=2`
      );
      setWards(res.data?.wards || []);
    } catch (err) {
      console.error("Lỗi tải xã:", err);
    }
  };

  const handleWardChange = (code: string) => {
    const w = wards.find((item) => String(item.code) === code) || null;
    setSelectedWard(w);
  };

  // ============ THÊM THIẾT BỊ ============
  const handleAddDevice = async () => {
    try {
      setFormError("");
      if (
        !newDevice.name ||
        !newDevice.unique_identifier ||
        !newDevice.device_type_id
      ) {
        setFormError(" Vui lòng nhập đủ thông tin bắt buộc.");
        return;
      }

      const provinceName = selectedProvince?.name || "";
      const districtName = selectedDistrict?.name || "";
      const wardName = selectedWard?.name || "";
      const locationString = [wardName, districtName, provinceName]
        .filter(Boolean)
        .join(", ");

      await axios.post("http://localhost:5000/api/add-device", {
        ...newDevice,
        created_by: CURRENT_USER_ID,
        location: locationString || null,
        province: provinceName || null,
        district: districtName || null,
        ward: wardName || null,
      });

      alert(" Thêm thiết bị thành công! ✅");
      setIsAddOpen(false);
      setNewDevice({
        name: "",
        unique_identifier: "",
        description: "",
        device_type_id: "",
      });
      setSelectedProvince(null);
      setSelectedDistrict(null);
      setSelectedWard(null);
      fetchDevices();
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Không thể thêm thiết bị.";
      setFormError(msg);
    }
  };

  // ============ LỌC ============
  const filteredDevices = devices.filter((d) => {
    const name = (d.name || "").toLowerCase();
    const type = (d.device_type_name || "").toLowerCase();
    const q = searchTerm.toLowerCase();
    const status = (d.status as string) || "online";

    const okSearch = name.includes(q) || type.includes(q);
    const okStatus = filterStatus === "all" || filterStatus === status;

    return okSearch && okStatus;
  });
  // Khi thay đổi search hoặc filter → trở về trang 1
  useEffect(() => {
    setPage(1);
  }, [searchTerm, filterStatus]);

  // phân trang
  const totalRecords = filteredDevices.length;
  const totalPages = totalRecords === 0 ? 1 : Math.ceil(totalRecords / perPage);
  const startIndex = (page - 1) * perPage;

  const currentDevices = filteredDevices.slice(
    startIndex,
    startIndex + perPage
  );

  // API upload URL helper
  const getUploadUrl = (deviceId: string) =>
    `http://localhost:5001/upload/${deviceId}`;

  // ============================ UI ============================
  // Chuyển flag_status thành status string
  const getStatusFromFlag = (flag: number | string | null | undefined) => {
    if (flag === 1 || flag === "1") return "online";
    if (flag === 0 || flag === "0") return "offline";
    return "warning";
  };

  return (
    <div className="space-y-8">
      {/* TITLE */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between"
      >
        {" "}
        <div>
          <h1 className="text-3xl text-gray-900 mb-2">Quản lý thiết bị IoT</h1>
          <p className="text-gray-600">Theo dõi và quản lý tất cả thiết bị</p>
        </div>
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsAddOpen(true)}
            className="px-6 py-3 bg-gradient-to-r from-red-700 to-red-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Thêm thiết bị
          </motion.button>
        </div>
      </motion.div>

      {/* TAB SWITCHER */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className=" transition-all w-full flex"
      >
        <div className="flex gap-2 bg-gray-100 p-2 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "overview"
                ? "bg-white shadow-sm text-red-600 font-semibold"
                : "text-gray-600 hover:bg-white/70"
            }`}
          >
            <b>Tổng quan</b>
          </button>

          <button
            onClick={() => setActiveTab("details")}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "details"
                ? "bg-white shadow-sm text-red-600 font-semibold"
                : "text-gray-600 hover:bg-white/70"
            }`}
          >
            <b>Danh sách chi tiết</b>
          </button>
        </div>
      </motion.div>

      {/* ================= TAB 1 — OVERVIEW ================= */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border p-4 shadow-sm flex items-center gap-4">
            {/* SEARCH BOX */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="relative flex-1"
            >
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm kiếm theo tên hoặc loại thiết bị..."
                className="w-full h-12 pl-12 pr-4 rounded-xl border border-gray-300 text-[15px] bg-gray-50 focus:bg-white focus:border-gray-400 outline-none transition-all"
              />
            </motion.div>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-44 h-12 rounded-xl bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <SelectValue placeholder="Tất cả trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDevices.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="col-span-full flex flex-col items-center justify-center py-20 text-gray-500"
              >
                    <PackageOpen className="w-20 h-20 text-gray-300 mb-4" />

                <p className="text-lg font-medium">Bạn chưa có thiết bị nào</p>
                <p className="text-sm text-gray-400 mt-1">
                  Hãy thêm thiết bị đầu tiên của bạn!
                </p>

                <button
                  onClick={() => setIsAddOpen(true)}
                  className="mt-4 px-5 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 shadow"
                >
                  + Thêm thiết bị
                </button>
              </motion.div>
            )}
            {currentDevices.map((device, idx) => (
              <motion.div
                key={device.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ y: -5 }}
                className="bg-white p-6 rounded-2xl border shadow-sm hover:shadow-lg transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        device.status === "online"
                          ? "bg-green-100"
                          : device.status === "offline"
                          ? "bg-red-100"
                          : "bg-yellow-100"
                      }`}
                    >
                      {device.status === "online" ? (
                        <Wifi className="text-green-600 w-6 h-6" />
                      ) : device.status === "offline" ? (
                        <WifiOff className="text-red-600 w-6 h-6" />
                      ) : (
                        <Power className="text-yellow-600 w-6 h-6" />
                      )}
                    </div>

                    <div>
                      <h3 className="text-gray-900 font-medium">
                        {device.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {device.device_type_name}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <UserPlus2 className="w-4 h-4" />
                  <span className="text-sm">
                    {" "}
                    {device.creator_name
                      ? `${device.creator_name} (${device.creator_email})`
                      : `ID: ${device.created_by}`}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">
                    {device.location || "Không rõ vị trí"}
                  </span>
                </div>

                <p className="text-xs text-gray-500 mb-3">
                  Cập nhật: {device.last_seen || "N/A"}
                </p>

                <div className="flex justify-between pt-4 border-t">
                  {/* CỤM HIỂN THỊ ID ĐẶT THEO CỘT */}
                  <div className="flex flex-col gap-1">
                    <p className="text-xs text-gray-500 break-all">
                      ID: {device.id}
                    </p>
                    <p className="text-xs text-gray-500">
                      Mã thiết bị: {device.unique_identifier}
                    </p>
                  </div>

                  {/* ICON BUTTONS */}
                  <div className="flex gap-2 items-start">
                    <button
                      className="p-2 hover:bg-blue-50 rounded-lg text-blue-600"
                      onClick={() => {
                        setSelectedDevice(device);
                        setIsViewOpen(true);
                      }}
                      title="Xem chi tiết"
                    >
                      <Activity className="w-4 h-4" />
                    </button>

                    <button
                      className="p-2 hover:bg-green-50 rounded-lg text-green-600"
                      onClick={() => {
                        navigator.clipboard.writeText(
                          getUploadUrl(device.unique_identifier)
                        );
                        alert("Đã copy API upload!");
                      }}
                      title="Copy API upload"
                    >
                      <Copy className="w-4 h-4" />
                    </button>

                    <button
                      className="p-2 hover:bg-red-50 rounded-lg text-red-600"
                      onClick={() => {
                        setSelectedDevice(device);
                        setIsDeleteModalOpen(true);
                      }}
                      title="Xóa thiết bị"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 2 — DETAILS ================= */}
      {activeTab === "details" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border p-4 shadow-sm flex items-center gap-4">
            {/* SEARCH BOX */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm kiếm theo tên hoặc loại thiết bị..."
                className="w-full h-12 pl-12 pr-4 rounded-xl border border-gray-300 text-[15px] bg-gray-50 focus:bg-white focus:border-gray-400 outline-none transition-all"
              />
            </div>

            {/* FILTER BUTTON */}
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-44 h-12 rounded-xl bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <SelectValue placeholder="Tất cả trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* TABLE */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden rounded-2xl border bg-white shadow-sm"
          >
            {" "}
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

              <p className="text-sm text-gray-600">
                Tổng{" "}
                <span className="font-semibold text-gray-900">
                  {totalRecords.toLocaleString("vi-VN")}
                </span>{" "}
                thiết bị
              </p>
            </div>
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="font-semibold text-gray-700 text-left px-6 py-4">
                    Thiết bị
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 text-left px-6">
                    Loại
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 text-left px-6">
                    Người tạo
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 text-left px-6">
                    Vị trí
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 text-left px-6">
                    Trạng thái
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 text-left px-6">
                    ID
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700 text-left px-6">
                    Thao tác
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredDevices.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-12 text-center text-gray-500 text-lg"
                    >
                      <div className="flex flex-col items-center justify-center">
                            <PackageOpen className="w-50 h-50 text-gray-300 mb-4" />

                        <p>Không có thiết bị nào</p>
                      </div>
                    </td>
                  </tr>
                )}
                {currentDevices.map((d, idx) => (
                  <motion.tr
                    key={d.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04, duration: 0.25 }}
                    className="hover:bg-gray-50 transition-all cursor-pointer"
                  >
                    <TableCell className="flex items-center gap-4 py-4 px-6">
                      <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-semibold text-sm">
                        {d.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 leading-tight">
                          {d.name}
                        </p>
                        <p className="text-[13px] text-gray-500">
                          {d.unique_identifier}
                        </p>
                      </div>
                    </TableCell>

                    <TableCell className="px-6">
                      <Badge className="rounded-full px-3 py-1 bg-blue-50 text-blue-600 border border-blue-200 text-[13px]">
                        {d.device_type_name}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6 text-sm text-gray-700">
                      {d.creator_name
                        ? `${d.creator_name} (${d.creator_email})`
                        : d.created_by}
                    </TableCell>

                    <TableCell className="text-[14px] text-gray-700 px-6">
                      {d.location || "Không rõ"}
                    </TableCell>

                    <TableCell className="px-6">
                      {d.status === "online" ? (
                        <span className="text-green-600 font-medium flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-green-500" />
                          Online
                        </span>
                      ) : d.status === "offline" ? (
                        <span className="text-red-600 font-medium flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-red-500" />
                          Offline
                        </span>
                      ) : (
                        <span className="text-yellow-600 font-medium flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-yellow-500" />
                          Warning
                        </span>
                      )}
                    </TableCell>

                    <TableCell className="px-6">
                      {/* Thông báo “Đã copy” */}
                      {copiedRow ===
                        String(d.unique_identifier ?? d.id ?? "") && (
                        <span
                          className="absolute -top-6 right-0 bg-white px-4 py-2 text-[20px]
                                      text-green-700 border border-green-300 rounded-md shadow-sm
                                      font-bold"
                        >
                          Đã copy!
                        </span>
                      )}

                      <div className="flex items-center gap-2 relative">
                        <Input
                          readOnly
                          value={d.id || "Chưa có"}
                          className="w-44 text-xs bg-gray-50 rounded-lg"
                        />
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(d.id || "");
                            const rowKey = String(
                              d.unique_identifier ?? d.id ?? ""
                            );
                            setCopiedRow(rowKey);
                            setTimeout(() => setCopiedRow(null), 1500);
                          }}
                          className="p-2 rounded-lg border hover:bg-gray-100 text-gray-700 transition"
                          title="Copy ID"
                          type="button"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </TableCell>

                    <TableCell className="px-6 space-x-2 text-left">
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-full text-blue-600 border-blue-300 hover:bg-blue-50"
                        onClick={() => {
                          setSelectedDevice(d);
                          setIsViewOpen(true);
                        }}
                      >
                        Xem
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-full text-red-600 border-red-300 hover:bg-red-50"
                        onClick={() => {
                          setSelectedDevice(d);
                          setIsDeleteModalOpen(true);
                        }}
                      >
                        Xóa
                      </Button>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
            {totalRecords > 0 && (
              <div className="px-6 py-4 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3 text-sm text-gray-700">
                <p>
                  Trang {page} / {totalPages} — Hiển thị {startIndex + 1}–
                  {Math.min(startIndex + perPage, totalRecords)} /{" "}
                  {totalRecords} thiết bị
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

                  {/* Page Numbers */}
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
        </div>
      )}

      {/* ================= POPUP THÊM THIẾT BỊ  ================= */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => {
          setIsAddOpen(false);
          setFormError("");
        }}
        title="Thêm thiết bị mới"
        subtitle="Điền thông tin để kết nối thiết bị IoT"
        icon={<Plus className="w-5 h-5 text-white" />}
        size="md"
        footer={
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">
              <span className="text-red-600">*</span> Trường bắt buộc
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setIsAddOpen(false);
                  setFormError("");
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all text-sm"
              >
                Hủy
              </button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddDevice}
                className="px-4 py-2 bg-gradient-to-r from-red-700 to-red-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2 text-sm"
              >
                <Plus className="w-4 h-4" />
                Thêm thiết bị
              </motion.button>
            </div>
          </div>
        }
      >
        <div className="space-y-5">
          <div>
            <div className="flex items-center gap-5 mb-3">
              <div className="w-1 h-4 bg-red-600 rounded-full"></div>
              <b className="pl-3 border-l-4 border-red-600">
                {" "}
                &nbsp; THÔNG TIN CƠ BẢN
              </b>
            </div>

            <div className="space-y-3">
              {/* Row 1: Tên và Mã thiết bị */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1.5 font-medium">
                    Tên thiết bị <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={newDevice.name}
                    onChange={(e) =>
                      setNewDevice({ ...newDevice, name: e.target.value })
                    }
                    placeholder="VD: Cảm biến nhiệt độ #1"
                    className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-600 mb-1.5 font-medium">
                    Mã thiết bị <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={newDevice.unique_identifier}
                    onChange={(e) =>
                      setNewDevice({
                        ...newDevice,
                        unique_identifier: e.target.value,
                      })
                    }
                    placeholder="IOT-001"
                    className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none font-mono transition-all"
                  />
                </div>
              </div>

              {/* Row 2: Loại thiết bị */}
              <div>
                <label className="block text-xs text-gray-600 mb-1.5 font-medium">
                  Loại thiết bị <span className="text-red-600">*</span>
                </label>
                <select
                  value={newDevice.device_type_id}
                  onChange={(e) =>
                    setNewDevice({
                      ...newDevice,
                      device_type_id: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition-all"
                >
                  <option value="">Chọn loại thiết bị</option>
                  {deviceTypes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-5 mb-3">
              <div className="w-1 h-4 bg-red-600 rounded-full"></div>
              <b class="pl-3 border-l-4 border-red-600">
                {" "}
                &nbsp; ĐỊA CHỈ CHI TIẾT
              </b>
            </div>

            <div className="space-y-3">
              {/* Row 1: 3 dropdowns */}
              <div className="grid grid-cols-3 gap-3">
                {/* Tỉnh */}
                <div>
                  <label className="block text-xs text-gray-600 mb-1.5 font-medium">
                    Tỉnh
                  </label>
                  <select
                    value={selectedProvince?.code || ""}
                    onChange={(e) => handleProvinceChange(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all"
                  >
                    <option value="">Chọn tỉnh</option>
                    {provinces.map((p) => (
                      <option key={p.code} value={p.code}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Quận */}
                <div>
                  <label className="block text-xs text-gray-600 mb-1.5 font-medium">
                    Quận/Huyện
                  </label>
                  <select
                    disabled={!selectedProvince}
                    value={selectedDistrict?.code || ""}
                    onChange={(e) => handleDistrictChange(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all"
                  >
                    <option value="">Chọn quận</option>
                    {districts.map((d) => (
                      <option key={d.code} value={d.code}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Xã */}
                <div>
                  <label className="block text-xs text-gray-600 mb-1.5 font-medium">
                    Xã/Phường
                  </label>
                  <select
                    disabled={!selectedDistrict}
                    value={selectedWard?.code || ""}
                    onChange={(e) => handleWardChange(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all"
                  >
                    <option value="">Chọn xã</option>
                    {wards.map((w) => (
                      <option key={w.code} value={w.code}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {(selectedProvince || selectedDistrict || selectedWard) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2"
                >
                  <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-600 font-medium mb-0.5">
                    Địa chỉ:&nbsp;
                    {[
                      selectedWard?.name,
                      selectedDistrict?.name,
                      selectedProvince?.name,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                </motion.div>
              )}

              {/* Mô tả */}
              <div>
                <label className="block text-xs text-gray-600 mb-1.5 font-medium">
                  Mô tả
                </label>
                <textarea
                  rows={2}
                  value={newDevice.description}
                  onChange={(e) =>
                    setNewDevice({ ...newDevice, description: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg outline-none resize-none focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all"
                  placeholder="Nhập mô tả chi tiết về thiết bị..."
                />
              </div>
            </div>
          </div>

          {/* Error Message */}
          {formError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-700 bg-red-50 border border-red-200 px-3 py-2.5 rounded-lg text-xs flex items-start gap-2"
            >
              <span className="text-red-600 font-bold">⚠️</span>
              <span className="flex-1">{formError}</span>
            </motion.div>
          )}
        </div>
      </Modal>

      {/* ================= POPUP XEM THIẾT BỊ ================= */}
      <Modal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title="Chi tiết thiết bị"
        size="md"
        icon={<Activity className="w-6 h-6 text-white" />}
      >
        {selectedDevice && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                {getStatusFromFlag(selectedDevice.flag_status) === "online" ? (
                  <Wifi className="w-6 h-6 text-blue-600" />
                ) : getStatusFromFlag(selectedDevice.flag_status) ===
                  "offline" ? (
                  <WifiOff className="w-6 h-6 text-red-600" />
                ) : (
                  <Power className="w-6 h-6 text-yellow-600" />
                )}
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedDevice.name}
                </h3>
                <p className="text-sm text-gray-600">
                  {selectedDevice.device_type_name}
                </p>
              </div>
            </div>

            {/* Mã thiết bị */}
            <div className="p-4 bg-gray-50 rounded-xl border">
              <p className="text-xs text-gray-500">Mã thiết bị</p>
              <p className="font-mono text-gray-900 text-sm">
                {selectedDevice.unique_identifier}
              </p>
            </div>

            {/* ID */}
            <div className="p-4 bg-gray-50 rounded-xl border space-y-2">
              <p className="text-xs text-gray-500">ID</p>

              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={selectedDevice.id || "Chưa có"}
                  className="flex-1 bg-white border px-3 py-2 rounded-lg font-mono text-sm"
                />

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(selectedDevice.id || "");
                    setCopied("api");
                    setTimeout(() => setCopied(""), 1500);
                  }}
                  className="p-2 rounded-lg border hover:bg-gray-100 text-gray-700"
                  title="Copy ID"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>

              {copied === "api" && (
                <p className="text-xs text-green-600"> Đã copy ID</p>
              )}
            </div>
            {/* CREATED BY */}
            <div className="p-4 bg-gray-50 rounded-xl border">
              <p className="text-xs text-gray-500">Tạo bởi</p>
              <p className="text-sm text-gray-900 mt-1">
                {selectedDevice.creator_name
                  ? `${selectedDevice.creator_name} (${selectedDevice.creator_email})`
                  : `User ID: ${selectedDevice.created_by}`}
              </p>
            </div>

            {/* CREATE DATE */}
            <div className="p-4 bg-gray-50 rounded-xl border">
              <p className="text-xs text-gray-500">Ngày tạo</p>
              <p className="text-sm text-gray-900 mt-1">
                {selectedDevice.create_date
                  ? new Date(selectedDevice.create_date).toLocaleString("vi-VN")
                  : "Không có dữ liệu"}
              </p>
            </div>
            {/* Upload URL */}
            <div className="p-4 bg-gray-50 rounded-xl border space-y-2">
              <p className="text-xs text-gray-500">API Upload URL</p>
              <input
                readOnly
                value={getUploadUrl(selectedDevice.unique_identifier)}
                className="w-full bg-white border px-3 py-2 rounded-lg font-mono text-sm"
              />
            </div>

            {selectedDevice.location && (
              <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                <p className="text-xs text-green-700">Địa chỉ chi tiết</p>
                <p className="text-sm text-green-900">
                  {selectedDevice.location}
                </p>
              </div>
            )}

            <div className="flex justify-end">
              <button
                onClick={() => setIsViewOpen(false)}
                className="px-6 py-2 border border-gray-300 rounded-xl hover:bg-gray-100 transition"
              >
                Đóng
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ================= XÓA THIẾT BỊ  ================= */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Xóa thiết bị"
        customWidth="max-w-[380px]"
        icon={<Trash2 className="w-5 h-5 text-white" />}
      >
        <div className="space-y-6">
          {/* Icon */}
          <div className="w-16 h-16 bg-red-100 rounded-full mx-auto flex items-center justify-center shadow-sm">
            <Trash2 className="w-8 h-8 text-red-600" />
          </div>

          {/* Text */}
          <div className="text-center space-y-2 px-4">
            <p className="text-gray-700 text-[15px]">
              Bạn có chắc chắn muốn xóa thiết bị:
            </p>

            <p className="font-semibold text-gray-900 text-lg">
              {selectedDevice?.name}
            </p>

            <p className="text-sm text-gray-500">
              Hành động này <b className="text-red-600">không thể hoàn tác</b>.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-2 px-4">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-5 py-2 rounded-xl border border-gray-300 text-gray-700 
                   hover:bg-gray-100 transition-all shadow-sm"
            >
              Hủy
            </button>

            <button
              onClick={async () => {
                try {
                  await axios.delete(
                    `http://localhost:5000/api/devices/${selectedDevice.unique_identifier}`
                  );

                  alert(`Đã xóa thiết bị: ${selectedDevice.name}`);
                  setIsDeleteModalOpen(false);
                  setSelectedDevice(null);
                  fetchDevices();
                } catch (err) {
                  console.error(err);
                  alert("❌ Xóa thất bại, vui lòng thử lại!");
                }
              }}
              className="px-5 py-2 bg-gradient-to-r from-red-700 to-red-600 
                   text-white rounded-xl shadow-md hover:shadow-xl 
                   transition-all"
            >
              Xóa
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
