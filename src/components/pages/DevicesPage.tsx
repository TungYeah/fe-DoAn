import axios from "axios";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { showToast } from "@/utils/toast";
import { toast } from "sonner";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Cpu,
  Copy,
  Check,
  Server,
  Activity,
  AlertTriangle,
  ChevronDown,
  Gauge,
  GaugeCircle,
  PackageOpen,
  Wifi,
  WifiOff,
  Power,
  Save,
  Eye,
  MapPin,
  GaugeCircleIcon,
} from "lucide-react";

import { Modal } from "../ui/modal";
import { MultiSelectDropdown } from "../ui/MultiSelectDropdown";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

export default function DevicesPage() {
  const API_BASE = "http://localhost:8080/api/v1/iot";

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };
  };

  // ================== DEVICE CODE INPUT RULE ==================
  const normalizeDeviceCode = (value: string) => {
    return value
      .normalize("NFD") // tách dấu tiếng Việt
      .replace(/[\u0300-\u036f]/g, "") // xoá dấu
      .replace(/[^a-zA-Z0-9_-]/g, "") // CHỈ cho A-Z, 0-9, - _
      .toUpperCase(); // VIẾT HOA
  };

  // ===== LOCATION STATE =====
  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);

  const [selectedProvince, setSelectedProvince] = useState<any>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<any>(null);
  const [selectedWard, setSelectedWard] = useState<any>(null);
  // --- switch tab ---

  const [activeTab, setActiveTab] = useState<"overview" | "details">(
    "overview"
  );

  // --- STATE DATA ---
  const [devices, setDevices] = useState<any[]>([]);
  const [deviceTypes, setDeviceTypes] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);

  // --- STATE UI ---
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);

  // State cho Modal thêm nhanh Property
  const [isQuickAddPropOpen, setIsQuickAddPropOpen] = useState(false);

  const [selectedDevice, setSelectedDevice] = useState<any>(null);
  const reloadDevices = async () => {
    await loadDevices(); // cho tab details
    await loadAllDevices(); // cho tab overview
  };

  // Form State cho Device
  const [formData, setFormData] = useState({
    uniqueIdentifier: "",
    name: "",
    status: "OFFLINE",
    deviceTypeId: "",
    description: "",
    propertyIds: [] as string[],
    primaryPropertyId: "",
    thresholdWarning: "" as string | number,
    thresholdCritical: "" as string | number,
    province: "",
    district: "",
    ward: "",
  });

  // Form State cho Quick Add Property
  const [quickProp, setQuickProp] = useState({
    name: "",
    unit: "",
    dataType: "NUMERIC",
  });
  const [allDevices, setAllDevices] = useState<any[]>([]);

  // Pagination
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // ================= LOAD MOCK DATA ==================
  const loadDevices = async () => {
    try {
      const res = await axios.get(`${API_BASE}/devices`, {
        params: {
          page,
          size: perPage,
        },
        ...getAuthHeaders(),
      });

      setDevices(res.data.content || []);
      setTotalElements(res.data.totalElements || 0);
      setTotalPages(res.data.totalPages || 0);
    } catch (err) {
      console.error(err);
      toast.error("Lỗi tải danh sách thiết bị");
    }
  };
  const loadAllDevices = async () => {
    try {
      const res = await axios.get(`${API_BASE}/devices`, {
        params: {
          size: 1000, // hoặc rất lớn
        },
        ...getAuthHeaders(),
      });

      setAllDevices(res.data.content || []);
    } catch (err) {
      toast.error("Lỗi tải toàn bộ thiết bị");
    }
  };
  ///Gọi loadAllDevices khi vào tab overview
  useEffect(() => {
    if (activeTab === "overview") {
      loadAllDevices();
    }
  }, [activeTab]);

  const loadMetadata = async () => {
    try {
      const [resTypes, resProps] = await Promise.all([
        axios.get(`${API_BASE}/device-types?size=100`, getAuthHeaders()),
        axios.get(`${API_BASE}/properties?size=100`, getAuthHeaders()),
      ]);

      setDeviceTypes(resTypes.data.content || []);
      setProperties(resProps.data.content || []);
    } catch (err) {
      console.error(err);
      toast.error("Lỗi tải danh mục thiết bị / cảm biến");
    }
  };

  useEffect(() => {
    axios
      .get("https://provinces.open-api.vn/api/p/")
      .then((res) => setProvinces(res.data || []))
      .catch(() => toast.error("Lỗi tải danh sách tỉnh"));
  }, []);
  const handleProvinceChange = async (code: string) => {
    const p = provinces.find((x) => String(x.code) === code);

    setSelectedProvince(p);
    setSelectedDistrict(null);
    setSelectedWard(null);
    setDistricts([]);
    setWards([]);

    setFormData((prev) => ({
      ...prev,
      province: p?.name || "",
      district: "",
      ward: "",
    }));

    if (!code) return;

    const res = await axios.get(
      `https://provinces.open-api.vn/api/p/${code}?depth=2`
    );
    setDistricts(res.data?.districts || []);
  };

  const handleDistrictChange = async (code: string) => {
    const d = districts.find((x) => String(x.code) === code);
    setSelectedDistrict(d);
    setSelectedWard(null);
    setWards([]);

    setFormData((prev) => ({
      ...prev,
      district: d?.name || "",
      ward: "",
    }));

    const res = await axios.get(
      `https://provinces.open-api.vn/api/d/${code}?depth=2`
    );
    setWards(res.data?.wards || []);
  };
  const handleWardChange = (code: string) => {
    const w = wards.find((x) => String(x.code) === code);
    setSelectedWard(w);

    setFormData((prev) => ({
      ...prev,
      ward: w?.name || "",
    }));
  };

  useEffect(() => {
    loadMetadata();
  }, []);

  useEffect(() => {
    loadDevices();
    // eslint-disable-next-line
  }, [page, perPage]);

  // ================= HANDLERS ==================

  const resetForm = () => {
    setFormData({
      uniqueIdentifier: "",
      name: "",
      status: "OFFLINE",
      deviceTypeId: "",
      description: "",
      propertyIds: [],
      primaryPropertyId: "",
      thresholdWarning: "",
      thresholdCritical: "",
      province: "",
      district: "",
      ward: "",
    });

    setSelectedProvince(null);
    setSelectedDistrict(null);
    setSelectedWard(null);
    setDistricts([]);
    setWards([]);
  };

  // Mở modal Edit và map dữ liệu từ row vào form
  const openEdit = (dev: any) => {
    setSelectedDevice(dev);

    // ===== map sensors =====
    const currentPropertyIds =
      dev.sensors?.map((s: any) => String(s.propertyId || s.property?.id)) ||
      [];

    const primarySensor = dev.sensors?.find(
      (s: any) =>
        s.propertyId === dev.primaryPropertyId ||
        s.property?.id === dev.primaryPropertyId
    );

    // ===== set form =====
    setFormData({
      uniqueIdentifier: dev.uniqueIdentifier,
      name: dev.name,
      status: dev.status,
      deviceTypeId: String(dev.deviceTypeId || ""),
      description: dev.description || "",
      propertyIds: currentPropertyIds,
      primaryPropertyId: dev.primaryPropertyId
        ? String(dev.primaryPropertyId)
        : "",
      thresholdWarning: primarySensor?.thresholdWarning ?? "",
      thresholdCritical: primarySensor?.thresholdCritical ?? "",
      province: dev.province || "",
      district: dev.district || "",
      ward: dev.ward || "",
    });

    // ===== GUARD: ĐỢI PROVINCE LOAD =====
    if (!provinces.length) {
      setIsEditOpen(true);
      return;
    }

    // ===== SET LOCATION DROPDOWN =====
    const p = provinces.find((x) => x.name === dev.province);
    if (p) {
      setSelectedProvince(p);

      axios
        .get(`https://provinces.open-api.vn/api/p/${p.code}?depth=2`)
        .then((res) => {
          setDistricts(res.data.districts || []);

          const d = res.data.districts.find(
            (x: any) => x.name === dev.district
          );
          if (d) {
            setSelectedDistrict(d);

            axios
              .get(`https://provinces.open-api.vn/api/d/${d.code}?depth=2`)
              .then((r2) => {
                setWards(r2.data.wards || []);
                const w = r2.data.wards.find((x: any) => x.name === dev.ward);
                if (w) setSelectedWard(w);
              });
          }
        });
    }

    setIsEditOpen(true);
  };
  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.warning("Vui lòng nhập tên thiết bị");
      return false;
    }

    if (!formData.uniqueIdentifier.trim()) {
      toast.warning("Vui lòng nhập mã định danh thiết bị");
      return false;
    }

    if (!formData.deviceTypeId) {
      toast.warning("Vui lòng chọn loại thiết bị");
      return false;
    }

    if (!formData.status) {
      toast.warning("Vui lòng chọn trạng thái thiết bị");
      return false;
    }

    // ===== ĐỊA CHỈ =====
    if (!selectedProvince) {
      toast.warning("Vui lòng chọn tỉnh / thành phố");
      return false;
    }

    if (!selectedDistrict) {
      toast.warning("Vui lòng chọn quận / huyện");
      return false;
    }

    if (!selectedWard) {
      toast.warning("Vui lòng chọn xã / phường");
      return false;
    }

    // ===== SENSOR =====
    if (formData.propertyIds.length === 0) {
      toast.warning("Vui lòng chọn ít nhất 1 cảm biến");
      return false;
    }

    if (!formData.primaryPropertyId) {
      toast.warning("Vui lòng chọn cảm biến chính (Dashboard)");
      return false;
    }

    if (
      formData.thresholdWarning === "" ||
      formData.thresholdWarning === null
    ) {
      toast.warning("Vui lòng nhập ngưỡng cảnh báo (Warning)");
      return false;
    }

    if (
      formData.thresholdCritical === "" ||
      formData.thresholdCritical === null
    ) {
      toast.warning("Vui lòng nhập ngưỡng nguy hiểm (Critical)");
      return false;
    }

    return true;
  };

  // Submit Device (Add/Edit)
  const handleSubmitDevice = async (isEdit: boolean) => {
    if (!validateForm()) return;

    try {
      const provinceName = selectedProvince!.name;
      const districtName = selectedDistrict!.name;
      const wardName = selectedWard!.name;

      const payload = {
        ...formData,
        province: provinceName,
        district: districtName,
        ward: wardName,
        location: `${wardName}, ${districtName}, ${provinceName}`,
        thresholdWarning: Number(formData.thresholdWarning),
        thresholdCritical: Number(formData.thresholdCritical),
        primaryPropertyId: formData.primaryPropertyId,
      };

      if (isEdit && selectedDevice) {
        await axios.put(
          `${API_BASE}/devices/${selectedDevice.id}`,
          payload,
          getAuthHeaders()
        );
        toast.success("Cập nhật thiết bị thành công!");
        setIsEditOpen(false);
      } else {
        await axios.post(`${API_BASE}/devices`, payload, getAuthHeaders());
        toast.success("Thêm thiết bị thành công!");
        setIsAddOpen(false);
      }

      await reloadDevices();
      resetForm();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  // Submit Quick Add Property
  const handleQuickAddProperty = async () => {
    if (!quickProp.name)
      return toast.warning("Tên thuộc tính không được trống");

    try {
      const res = await axios.post(
        `${API_BASE}/properties`,
        quickProp,
        getAuthHeaders()
      );
      const newProp = res.data;

      setProperties((prev) => [...prev, newProp]);
      setFormData((prev) => ({
        ...prev,
        propertyIds: [...prev.propertyIds, String(newProp.id)],
      }));

      toast.success("Đã thêm thuộc tính mới!");
      setIsQuickAddPropOpen(false);
      setQuickProp({ name: "", unit: "", dataType: "NUMERIC" });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi thêm thuộc tính");
    }
  };

  // Delete Device
  const handleDelete = async () => {
    try {
      await axios.delete(
        `${API_BASE}/devices/${selectedDevice.id}`,
        getAuthHeaders()
      );
      toast.success("Đã xóa thiết bị");
      setIsDeleteOpen(false);
      await reloadDevices();
    } catch {
      toast.error("Xóa thất bại");
    }
  };

  // Toggle chọn/bỏ chọn property
  const toggleProperty = (propId: string) => {
    const id = String(propId);

    setFormData((prev) => {
      const exists = prev.propertyIds.includes(id);
      const newIds = exists
        ? prev.propertyIds.filter((pid) => pid !== id)
        : [...prev.propertyIds, id];

      let newPrimary = prev.primaryPropertyId;
      if (exists && prev.primaryPropertyId === id) {
        newPrimary = "";
      }

      return {
        ...prev,
        propertyIds: newIds,
        primaryPropertyId: newPrimary,
        ...(newPrimary === ""
          ? { thresholdWarning: "", thresholdCritical: "" }
          : {}),
      };
    });
  };

  const filteredDevices =
    activeTab === "overview"
      ? allDevices.filter(
          (d) =>
            d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            d.uniqueIdentifier.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : devices.filter(
          (d) =>
            d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            d.uniqueIdentifier.toLowerCase().includes(searchTerm.toLowerCase())
        );

  const getStatus = (d: any) =>
    d.status ||
    (d.flagStatus === 1
      ? "ONLINE"
      : d.flagStatus === 0
      ? "OFFLINE"
      : "WARNING");

  return (
    <div className="space-y-8">
      {/* HEADER */}

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
            onClick={() => {
              resetForm();
              setIsAddOpen(true);
            }}
            className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-xl shadow-lg flex items-center gap-2 hover:shadow-xl transition-all"
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
        className="w-full flex"
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

      {/* SEARCH BAR */}
      <div className="bg-white rounded-xl p-4 border flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            className="w-full h-12 pl-12 pr-4 border rounded-xl bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-red-200 transition-all"
            placeholder="Tìm theo tên hoặc mã thiết bị..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      {/* ================= TAB OVERVIEW (GRID) ================= */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDevices.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-500">
              <PackageOpen className="w-20 h-20 text-gray-300 mb-4" />
              <p className="text-lg font-medium">Bạn chưa có thiết bị nào</p>
              <p className="text-sm text-gray-400 mt-1">
                Hãy thêm thiết bị đầu tiên của bạn!
              </p>
            </div>
          )}

          {filteredDevices.map((device, idx) => (
            <motion.div
              key={device.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ y: -5 }}
              className="bg-white p-6 rounded-2xl border shadow-sm hover:shadow-lg transition-all"
            >
              {/* HEADER */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      device.status === "ONLINE"
                        ? "bg-green-100"
                        : device.status === "OFFLINE"
                        ? "bg-gray-200"
                        : "bg-yellow-100"
                    }`}
                  >
                    {device.status === "ONLINE" ? (
                      <Wifi className="w-6 h-6 text-green-700" />
                    ) : device.status === "OFFLINE" ? (
                      <WifiOff className="w-6 h-6 text-gray-600" />
                    ) : (
                      <Power className="w-6 h-6 text-yellow-700" />
                    )}
                  </div>

                  <div>
                    <h3 className="text-gray-900 font-medium">{device.name}</h3>
                    <p className="text-sm text-gray-500">
                      {device.typeName || "—"}
                    </p>
                  </div>
                </div>
              </div>

              {/* LOCATION */}

              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">
                  {device.location || "Không rõ vị trí"}
                </span>
              </div>
              {/* PROPERTIES */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  {/* BÊN TRÁI */}
                  <div className="flex items-center gap-2 text-gray-600">
                    <GaugeCircle className="w-4 h-4" />
                    <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                      Cảm biến tích hợp
                    </span>
                  </div>

                  {/* BÊN PHẢI */}
                  <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                    {device.sensors?.length || 0} sensors
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {device.sensors?.length ? (
                    device.sensors.map((s: any) => {
                      const isPrimary =
                        device.primaryPropertyId ===
                        (s.propertyId || s.property?.id);
                      return (
                        <motion.span
                          key={s.id}
                          whileHover={{ scale: 1.05 }}
                          className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs rounded-lg border font-medium transition-all ${
                            isPrimary
                              ? "bg-red-50 border-red-200 text-red-700 shadow-sm"
                              : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          {s.propertyName || s.property?.name}
                          {isPrimary && (
                            <span className="text-yellow-500">★</span>
                          )}
                        </motion.span>
                      );
                    })
                  ) : (
                    <span className="text-xs text-gray-400 italic px-2 py-1">
                      Chưa gắn cảm biến
                    </span>
                  )}
                </div>
              </div>
              {/* ===== NGƯỠNG CẢNH BÁO ===== */}
              {(() => {
                const sensors = device.sensors || [];

                // ❌ KHÔNG CÓ CẢM BIẾN
                if (sensors.length === 0) {
                  return (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-2.5 mb-4">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <AlertTriangle className="w-3.5 h-3.5 opacity-50" />
                        <span>Chưa cấu hình ngưỡng cảnh báo</span>
                      </div>
                    </div>
                  );
                }

                // ✅ CÓ CẢM BIẾN → tìm primary hoặc fallback sensor đầu
                const primarySensor =
                  sensors.find(
                    (s: any) =>
                      (s.propertyId || s.property?.id) ===
                      device.primaryPropertyId
                  ) || sensors[0];

                const hasThreshold =
                  primarySensor?.thresholdWarning != null ||
                  primarySensor?.thresholdCritical != null;

                // 🚨 CÓ NGƯỠNG
                if (hasThreshold) {
                  return (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 mb-4">
                      <div className="flex items-center justify-between gap-3">
                        {/* BÊN TRÁI: ICON + TITLE */}
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-3.5 h-3.5 text-orange-600" />
                          <span className="text-xs font-semibold text-orange-700">
                            Ngưỡng cảnh báo:
                          </span>
                        </div>

                        {/* BÊN PHẢI: WARNING / CRITICAL */}
                        <div className="flex items-center gap-3 text-xs font-semibold">
                          {primarySensor.thresholdWarning != null && (
                            <span className="text-orange-700 flex items-center gap-1">
                              ⚠ Warning:
                              <b>{primarySensor.thresholdWarning}</b>
                            </span>
                          )}

                          {primarySensor.thresholdCritical != null && (
                            <span className="text-red-700 flex items-center gap-1">
                              ⛔ Critical:
                              <b>{primarySensor.thresholdCritical}</b>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                }

                // ℹ️ CÓ CẢM BIẾN NHƯNG CHƯA CÓ NGƯỠNG
                return (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 mb-4">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <AlertTriangle className="w-3.5 h-3.5 opacity-50" />
                      <span>Chưa cấu hình ngưỡng cảnh báo</span>
                    </div>
                  </div>
                );
              })()}

              {/* FOOTER */}
              <div className="flex justify-between items-center pt-4 border-t">
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    device.status === "ONLINE"
                      ? "bg-green-100 text-green-700"
                      : device.status === "OFFLINE"
                      ? "bg-gray-100 text-gray-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {device.status}
                </span>
                {/* CỤM HIỂN THỊ ID ĐẶT THEO CỘT */}
                <div className="flex flex-col gap-1">
                  <p className="text-xs text-gray-500 break-all">
                    ID: {device.id}
                  </p>
                  <p className="text-xs text-gray-500">
                    Mã thiết bị: {device.uniqueIdentifier}
                  </p>
                </div>
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 rounded-lg hover:bg-green-200 text-green-700"
                    onClick={() => {
                      setSelectedDevice(device);
                      setIsViewOpen(true);
                    }}
                    title="Xem chi tiết"
                  >
                    <Eye className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 rounded-lg hover:bg-blue-50 text-blue-600"
                    onClick={() => openEdit(device)} // 🔥 BẮT BUỘC
                    title="Sửa"
                  >
                    <Edit className="w-4 h-4" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 rounded-lg hover:bg-red-50 text-red-600"
                    onClick={() => {
                      setSelectedDevice(device);
                      setIsDeleteOpen(true);
                    }}
                    title="Xóa"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
      {activeTab === "details" && (
        <>
          {/* TABLE */}

          <div className="rounded-2xl border bg-white overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 text-sm text-gray-700 bg-white">
              <div className="flex items-center gap-2">
                <span>Hiển thị mỗi trang:</span>
                <select
                  value={perPage}
                  onChange={(e) => {
                    setPerPage(Number(e.target.value));
                    setPage(0); // ⚠️ reset về trang đầu
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
                Tổng <b>{totalElements}</b> thiết bị
              </p>
            </div>

            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="px-6 py-4">Thiết bị</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Người tạo</TableHead>

                  <TableHead>Cảm biến (Properties)</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDevices.map((dev, idx) => (
                  <motion.tr
                    key={dev.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <TableCell className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          {" "}
                          <strong style={{ fontWeight: 600 }}>
                            {dev.name}
                          </strong>
                        </p>
                        <p className="text-xs text-gray-500 font-mono">
                          {dev.uniqueIdentifier}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{dev.typeName || "—"}</TableCell>
                    <TableCell>
                      <strong style={{ fontWeight: 600 }}>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-bold ${
                            dev.status === "ONLINE"
                              ? "bg-green-100 text-green-700"
                              : dev.status === "OFFLINE"
                              ? "bg-gray-100 text-gray-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {dev.status}
                        </span>
                      </strong>
                    </TableCell>
                    <TableCell> {dev.createdBy || "Không xác định"}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {dev.sensors?.map((s: any) => {
                          const isPrimary =
                            dev.primaryPropertyId ===
                            (s.propertyId || s.property?.id);

                          const mainColor = isPrimary ? "#dc2626" : "#374151"; // red-600 / gray-700
                          const bgColor = isPrimary ? "#fef2f2" : "#ffffff";
                          const borderColor = isPrimary ? "#fecaca" : "#e5e7eb";

                          return (
                            <span
                              key={s.id}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                                padding: "2px 6px",
                                fontSize: "12px",
                                borderRadius: "6px",
                                border: `1px solid ${borderColor}`,
                                backgroundColor: bgColor,
                                color: mainColor,
                              }}
                            >
                              {/* ICON */}
                              <span style={{ display: "flex", opacity: 0.85 }}>
                                <GaugeCircle size={12} />
                              </span>

                              {/* TÊN SENSOR */}
                              <strong style={{ fontWeight: 600 }}>
                                {s.propertyName ||
                                  s.property?.name ||
                                  "Unknown"}
                              </strong>

                              {/* ĐƠN VỊ */}
                              {s.propertyUnit && (
                                <small style={{ opacity: 0.6 }}>
                                  ({s.propertyUnit})
                                </small>
                              )}

                              {/* THRESHOLD */}
                              {isPrimary &&
                                (s.thresholdWarning != null ||
                                  s.thresholdCritical != null) && (
                                  <span
                                    style={{
                                      marginLeft: 4,
                                      paddingLeft: 4,
                                      borderLeft: "1px solid #fca5a5",
                                      fontSize: "10px",
                                      color: "#ea580c", // orange-600
                                      display: "inline-flex",
                                      gap: 2,
                                    }}
                                  >
                                    {s.thresholdWarning != null && (
                                      <em style={{ fontStyle: "normal" }}>
                                        W:{s.thresholdWarning}
                                      </em>
                                    )}
                                    {s.thresholdWarning != null &&
                                      s.thresholdCritical != null && (
                                        <span>|</span>
                                      )}
                                    {s.thresholdCritical != null && (
                                      <em style={{ fontStyle: "normal" }}>
                                        C:{s.thresholdCritical}
                                      </em>
                                    )}
                                  </span>
                                )}

                              {/* SAO PRIMARY */}
                              {isPrimary && (
                                <span
                                  style={{
                                    marginLeft: 4,
                                    fontSize: "10px",
                                    color: "#eab308", // yellow-500
                                  }}
                                >
                                  ★
                                </span>
                              )}
                            </span>
                          );
                        })}

                        {(!dev.sensors || dev.sensors.length === 0) && (
                          <em style={{ fontSize: 12, color: "#9ca3af" }}>
                            Chưa có cảm biến
                          </em>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 rounded-lg hover:bg-green-50 text-green-700"
                        onClick={() => {
                          setSelectedDevice(dev);
                          setIsViewOpen(true);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 rounded-lg hover:bg-blue-50 text-blue-700"
                        onClick={() => openEdit(dev)}
                      >
                        <Edit className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 rounded-lg hover:bg-red-50 text-red-700"
                        onClick={() => {
                          setSelectedDevice(dev);
                          setIsDeleteOpen(true);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </TableCell>
                  </motion.tr>
                ))}
                {filteredDevices.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-8 text-gray-500"
                    >
                      Không tìm thấy thiết bị nào
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            <div className="flex justify-between items-center px-6 py-4 text-sm border-t bg-white">
              <p>
                Trang {page + 1}/{totalPages}
              </p>

              <div className="flex items-center gap-1">
                {/* TRƯỚC */}
                <button
                  disabled={page === 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  className={`px-3 py-1 rounded-md border ${
                    page === 0
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white hover:bg-gray-50"
                  }`}
                >
                  Trước
                </button>

                {/* SỐ TRANG (tối đa 5) */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pNum = i;
                  if (page > 2) pNum = page - 2 + i;
                  if (pNum >= totalPages) return null;

                  return (
                    <button
                      key={pNum}
                      onClick={() => setPage(pNum)}
                      className={`px-3 py-1 rounded-md border ${
                        page === pNum
                          ? "bg-red-600 text-white border-red-600"
                          : "bg-white hover:bg-gray-50"
                      }`}
                    >
                      {pNum + 1}
                    </button>
                  );
                })}

                {/* SAU */}
                <button
                  disabled={page >= totalPages - 1}
                  onClick={() =>
                    setPage((p) => Math.min(totalPages - 1, p + 1))
                  }
                  className={`px-3 py-1 rounded-md border ${
                    page >= totalPages - 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white hover:bg-gray-50"
                  }`}
                >
                  Sau
                </button>
              </div>
            </div>
          </div>
        </>
      )}
      {/* ==================== MODAL ADD / EDIT DEVICE ===================== */}
      <Modal
        isOpen={isAddOpen || isEditOpen}
        onClose={() => {
          setIsAddOpen(false);
          setIsEditOpen(false);
        }}
        title={isEditOpen ? "Cập nhật thiết bị" : "Thêm thiết bị mới"}
        icon={<Cpu className="w-5 h-5 text-white" />}
        footer={
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setIsAddOpen(false);
                setIsEditOpen(false);
              }}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSubmitDevice(isEditOpen)}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Lưu
            </motion.button>
          </div>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Cột Trái: Thông tin cơ bản */}
          <div className="space-y-4">
            <b className="pl-3 border-l-4 border-red-600">
              {" "}
              &nbsp; THÔNG TIN CƠ BẢN
            </b>
            <div>
              <label className="text-sm font-medium text-gray-700">
                Tên thiết bị <span className="text-red-500">*</span>
              </label>
              <input
                className="w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-red-200 outline-none"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="VD: Gateway Tầng 1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                Mã định danh (Unique ID) <span className="text-red-500">*</span>
              </label>
              <input
                className="w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-red-200 outline-none font-mono"
                value={formData.uniqueIdentifier}
                onChange={(e) => {
                  const normalized = normalizeDeviceCode(e.target.value);
                  setFormData({ ...formData, uniqueIdentifier: normalized });
                }}
                placeholder="VD: ESP32_GATEWAY-01"
              />
              <p className="text-xs text-gray-500 mt-1">
                Chỉ cho phép A–Z, 0–9, dấu <b>-</b> hoặc <b>_</b>. Không khoảng
                trắng.
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                Loại thiết bị <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full border rounded-lg px-3 py-2 mt-1 bg-white focus:ring-2 focus:ring-red-200 outline-none"
                value={formData.deviceTypeId}
                onChange={(e) =>
                  setFormData({ ...formData, deviceTypeId: e.target.value })
                }
              >
                <option value="">-- Chọn loại --</option>
                {deviceTypes.map((dt) => (
                  <option key={dt.id} value={dt.id}>
                    {dt.name}
                  </option>
                ))}
              </select>
            </div>
            {/* ===== ĐỊA CHỈ ===== */}
            <div className="space-y-3 pt-2">
              <label className="text-sm font-medium text-gray-700">
                Địa chỉ lắp đặt
              </label>

              {/* TỈNH */}
              <select
                className="w-full border rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-red-200 outline-none"
                value={selectedProvince?.code || ""}
                onChange={(e) => handleProvinceChange(e.target.value)}
              >
                <option value="">-- Chọn tỉnh --</option>
                {provinces.map((p) => (
                  <option key={p.code} value={p.code}>
                    {p.name}
                  </option>
                ))}
              </select>

              {/* QUẬN */}
              <select
                disabled={!selectedProvince}
                className="w-full border rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-red-200 outline-none disabled:bg-gray-100"
                value={selectedDistrict?.code || ""}
                onChange={(e) => handleDistrictChange(e.target.value)}
              >
                <option value="">-- Chọn quận / huyện --</option>
                {districts.map((d) => (
                  <option key={d.code} value={d.code}>
                    {d.name}
                  </option>
                ))}
              </select>

              {/* XÃ */}
              <select
                disabled={!selectedDistrict}
                className="w-full border rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-red-200 outline-none disabled:bg-gray-100"
                value={selectedWard?.code || ""}
                onChange={(e) => handleWardChange(e.target.value)}
              >
                <option value="">-- Chọn xã / phường --</option>
                {wards.map((w) => (
                  <option key={w.code} value={w.code}>
                    {w.name}
                  </option>
                ))}
              </select>

              {/* PREVIEW */}
              {(formData.province || formData.district || formData.ward) && (
                <div className="text-xs text-blue-700 bg-blue-50 border border-blue-200 p-2 rounded">
                  📍{" "}
                  {[formData.ward, formData.district, formData.province]
                    .filter(Boolean)
                    .join(", ")}
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Trạng thái
              </label>
              <select
                className="w-full border rounded-lg px-3 py-2 mt-1 bg-white focus:ring-2 focus:ring-red-200 outline-none"
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as any })
                }
              >
                <option value="ONLINE">Online</option>
                <option value="OFFLINE">Offline</option>
                <option value="MAINTENANCE">Bảo trì</option>
              </select>
            </div>

            <div className="pt-2">
              <label className="text-sm font-medium text-gray-700">
                Mô tả thêm
              </label>
              <textarea
                className="w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-red-200 outline-none"
                rows={3}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Nhập mô tả chi tiết về thiết bị..."
              />
            </div>
          </div>

          {/* Cột Phải: Chọn Properties */}
          <div className="space-y-4 flex flex-col">
            <b className="pl-3 border-l-4 border-red-600">
              {" "}
              &nbsp; THÔNG TIN CẢM BIẾN
            </b>
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-gray-700">
                Tích hợp cảm biến (Properties)
              </label>
              <button
                type="button"
                onClick={() => setIsQuickAddPropOpen(true)}
                className="text-xs flex items-center gap-1 text-red-600 hover:underline font-medium hover:bg-red-50 px-2 py-1 rounded transition-colors"
              >
                <Plus className="w-3 h-3" /> Thêm nhanh
              </button>
            </div>

            {/* Multi-Select Dropdown cho Properties - REPLACED SCROLL WITH DROPDOWN */}
            <MultiSelectDropdown
              options={properties}
              selectedIds={formData.propertyIds}
              onToggle={toggleProperty}
              placeholder="Chọn các thuộc tính cảm biến..."
              emptyMessage="Chưa có thuộc tính nào"
            />

            {/* Chọn Primary Property & Cấu hình Threshold */}
            <div className="bg-white border rounded-lg p-3 space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Thuộc tính chính (Dashboard)
                </label>
                <select
                  className="w-full border rounded-lg px-3 py-2 mt-1 bg-white focus:ring-2 focus:ring-red-200 outline-none disabled:bg-gray-100 disabled:text-gray-400"
                  value={formData.primaryPropertyId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      primaryPropertyId: e.target.value,
                    })
                  }
                  disabled={formData.propertyIds.length === 0}
                >
                  <option value="">-- Không chọn --</option>
                  {properties
                    .filter((p) => formData.propertyIds.includes(p.id))
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.unit || "-"})
                      </option>
                    ))}
                </select>
              </div>

              {/* Chỉ hiện cấu hình Threshold khi đã chọn Primary Property */}
              {formData.primaryPropertyId && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="border-t pt-3 grid grid-cols-2 gap-3"
                >
                  <div className="col-span-2 flex items-center gap-2 text-xs font-semibold text-orange-600 bg-orange-50 p-2 rounded">
                    <AlertTriangle className="w-3 h-3" /> Cấu hình ngưỡng cảnh
                    báo
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-700">
                      Ngưỡng Cảnh báo (Warning)
                    </label>
                    <input
                      type="number"
                      className="w-full border rounded px-2 py-1.5 mt-1 text-sm focus:ring-2 focus:ring-orange-200 outline-none"
                      placeholder="VD: 40"
                      value={formData.thresholdWarning}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          thresholdWarning: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700">
                      Ngưỡng Nguy hiểm (Critical)
                    </label>
                    <input
                      type="number"
                      className="w-full border rounded px-2 py-1.5 mt-1 text-sm focus:ring-2 focus:ring-red-200 outline-none"
                      placeholder="VD: 60"
                      value={formData.thresholdCritical}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          thresholdCritical: e.target.value,
                        })
                      }
                    />
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </Modal>

      {/* ==================== MODAL VIEW DEVICE ===================== */}
      <Modal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title="Chi tiết thiết bị"
        icon={<Activity className="w-5 h-5 text-white" />}
        footer={
          <div className="flex justify-end gap-2">
            {/* ĐÓNG */}
            <button
              onClick={() => setIsViewOpen(false)}
              className="px-4 py-2 bg-gray-500 border rounded-lg hover:bg-gray-600 transition-colors"
            >
              Đóng
            </button>

            {/* CHỈNH SỬA */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setIsViewOpen(false); // đóng modal xem
                openEdit(selectedDevice); // mở modal chỉnh sửa
              }}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Chỉnh sửa
            </motion.button>
          </div>
        }
      >
        {selectedDevice && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-16">
            {/* ================= CỘT TRÁI: THÔNG TIN THIẾT BỊ ================= */}
            <div className="space-y-4">
              <b className="pl-3 border-l-4 border-red-600">
                &nbsp; Thông tin cơ bản
              </b>
              <br></br>
              <div className="flex items-center justify-between p-4 rounded-xl border bg-blue-50 border-blue-200">
                <div className="flex items-center gap-3">
                  {/* ICON */}
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                    <Cpu className="w-5 h-5 text-blue-600" />
                  </div>

                  {/* TÊN + MÃ */}
                  <div>
                    <p className="font-semibold text-gray-900 leading-tight">
                      {selectedDevice.name}
                    </p>
                    <p className="text-xs text-gray-500 font-mono">
                      {selectedDevice.uniqueIdentifier}
                    </p>
                  </div>
                </div>

                {/* TRẠNG THÁI */}
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap
      ${
        selectedDevice.status === "ONLINE"
          ? "bg-green-100 text-green-700"
          : selectedDevice.status === "OFFLINE"
          ? "bg-gray-100 text-gray-700"
          : "bg-yellow-100 text-yellow-700"
      }`}
                >
                  {selectedDevice.status}
                </span>
              </div>
              {/* ===== ĐỊA CHỈ (NGAY DƯỚI HEADER) ===== */}
              <div className="text-xs text-blue-700 bg-blue-50 border border-blue-200 p-2 rounded">
                <span>📍 </span>
                <span>
                  {[
                    selectedDevice.ward,
                    selectedDevice.district,
                    selectedDevice.province,
                  ]
                    .filter(Boolean)
                    .join(", ") || "Không có thông tin vị trí"}
                </span>
              </div>

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
                      navigator.clipboard.writeText(selectedDevice.id);
                      toast.success("Đã copy ID");
                    }}
                    className="p-2 rounded-lg border hover:bg-gray-100 text-gray-700"
                    title="Copy ID"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* LOẠI */}
              <div className="p-4 border rounded-xl bg-white">
                <p className="text-xs text-gray-500 mb-1">Loại thiết bị</p>
                <p className="text-sm text-gray-900">
                  {selectedDevice.typeName || "Chưa phân loại"}
                </p>
              </div>

              {/* TẠO BỞI */}
              <div className="p-4 border rounded-xl bg-white">
                <p className="text-xs text-gray-500 mb-1">Tạo bởi</p>
                <p className="text-sm text-gray-900">
                  {selectedDevice.createdBy || "Không xác định"}
                </p>
              </div>

              {/* NGÀY */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 border rounded-xl bg-white">
                  <p className="text-xs text-gray-500 mb-1">Ngày tạo</p>
                  <p className="text-sm text-gray-900">
                    {selectedDevice.createDate
                      ? new Date(selectedDevice.createDate).toLocaleString(
                          "vi-VN"
                        )
                      : "—"}
                  </p>
                </div>

                <div className="p-4 border rounded-xl bg-white">
                  <p className="text-xs text-gray-500 mb-1">
                    Cập nhật gần nhất
                  </p>
                  <p className="text-sm text-gray-900">
                    {selectedDevice.lastUpdateDate
                      ? new Date(selectedDevice.lastUpdateDate).toLocaleString(
                          "vi-VN"
                        )
                      : "Chưa cập nhật"}
                  </p>
                </div>
              </div>
              {/* MÔ TẢ */}
              <div className="p-4 border rounded-xl bg-white">
                <p className="text-xs text-gray-500 mb-1">Mô tả</p>
                <p className="text-sm text-gray-900">
                  {selectedDevice.description?.trim()
                    ? selectedDevice.description
                    : "Không có mô tả"}
                </p>
              </div>
            </div>

            {/* ================= CỘT PHẢI: CẢM BIẾN ================= */}
            <div className="space-y-4">
              <b className="pl-3 border-l-4 border-red-600">
                &nbsp; Cảm biến gắn với thiết bị
              </b>
              <br></br>

              {selectedDevice.sensors?.length ? (
                <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                  {selectedDevice.sensors.map((s: any) => {
                    const propId = s.propertyId || s.property?.id;
                    const isPrimary =
                      selectedDevice.primaryPropertyId === propId;

                    return (
                      <div
                        key={s.id}
                        className={`p-4 rounded-xl border ${
                          isPrimary
                            ? "bg-red-50 border-red-200"
                            : "bg-white border-gray-200"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <GaugeCircle className="w-4 h-4 text-gray-500" />
                            <span className="font-medium text-gray-900">
                              {s.propertyName || s.property?.name}
                            </span>
                          </div>

                          {s.propertyUnit && (
                            <span className="text-xs text-gray-500">
                              ({s.propertyUnit})
                            </span>
                          )}
                        </div>

                        {(s.thresholdWarning != null ||
                          s.thresholdCritical != null) && (
                          <div className="mt-2 text-xs flex gap-4">
                            {s.thresholdWarning != null && (
                              <span className="text-orange-600 flex items-center gap-1">
                                ⚠ Warning: {s.thresholdWarning}
                              </span>
                            )}
                            {s.thresholdCritical != null && (
                              <span className="text-red-600 flex items-center gap-1">
                                ⛔ Critical: {s.thresholdCritical}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic">
                  Thiết bị chưa gắn cảm biến nào
                </p>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* ==================== MODAL QUICK ADD PROPERTY ===================== */}
      <Modal
        isOpen={isQuickAddPropOpen}
        onClose={() => setIsQuickAddPropOpen(false)}
        title="Thêm nhanh thuộc tính"
        icon={<Server className="w-5 h-5 text-white" />}
        size="md"
        footer={
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setIsQuickAddPropOpen(false)}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleQuickAddProperty}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Thêm ngay
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg text-sm text-blue-800 flex gap-2">
            <Server className="w-4 h-4 mt-0.5 shrink-0" />
            <p>
              Thuộc tính này sẽ được thêm vào hệ thống và tự động chọn cho thiết
              bị đang tạo.
            </p>
          </div>
          <div>
            <label className="text-sm font-medium">
              Tên thuộc tính <span className="text-red-500">*</span>
            </label>
            <input
              className="w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-200 outline-none"
              autoFocus
              value={quickProp.name}
              onChange={(e) =>
                setQuickProp({ ...quickProp, name: e.target.value })
              }
              placeholder="VD: Mức nước, CO2..."
            />
          </div>
          <div>
            <label className="text-sm font-medium">Đơn vị đo</label>
            <input
              className="w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-200 outline-none"
              value={quickProp.unit}
              onChange={(e) =>
                setQuickProp({ ...quickProp, unit: e.target.value })
              }
              placeholder="VD: cm, ppm..."
            />
          </div>
          <div>
            <label className="text-sm font-medium">Kiểu dữ liệu</label>
            <select
              className="w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-200 outline-none bg-white"
              value={quickProp.dataType}
              onChange={(e) =>
                setQuickProp({ ...quickProp, dataType: e.target.value })
              }
            >
              <option value="NUMERIC">Số (Numeric)</option>
              <option value="BOOLEAN">Đúng/Sai (Boolean)</option>
              <option value="STRING">Chuỗi (String)</option>
            </select>
          </div>
        </div>
      </Modal>

      {/* MODAL DELETE */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Xóa thiết bị"
        icon={<Trash2 className="w-5 h-5 text-white" />}
        customWidth="max-w-[380px]"
      >
        <div className="text-center p-4 space-y-4">
          <p className="text-gray-600">
            Bạn có chắc chắn muốn xóa thiết bị này?
          </p>
          <div className="bg-gray-100 p-3 rounded-lg">
            <p className="font-bold text-gray-900">{selectedDevice?.name}</p>
            <p className="text-xs text-gray-500 font-mono">
              {selectedDevice?.uniqueIdentifier}
            </p>
          </div>

          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={() => setIsDeleteOpen(false)}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Xác nhận xóa
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
