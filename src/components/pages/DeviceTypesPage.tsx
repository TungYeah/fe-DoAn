import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "motion/react";

import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Filter,
} from "lucide-react";

import { Modal } from "../ui/modal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

const API_URL = "http://localhost:5000/api/device-types";

export default function DeviceTypesPage() {
  const [deviceTypes, setDeviceTypes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [selectedType, setSelectedType] = useState(null);

  const [newType, setNewType] = useState({
    name: "",
    manufacturer: "",
    description: "",
    category: "",
  });

  const [page, setPage] = useState(1);
const [perPage, setPerPage] = useState(10);

  // ================= FETCH ==================
  const loadDeviceTypes = async () => {
    try {
      const res = await axios.get(API_URL);
      setDeviceTypes(res.data.device_types || res.data || []);
    } catch (err) {
      console.error("Lỗi tải loại thiết bị:", err);
    }
  };

  useEffect(() => {
    loadDeviceTypes();
  }, []);

  // ============== FILTER ==============
  const filtered = deviceTypes.filter((t) =>
    t.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / perPage);
  const current = filtered.slice((page - 1) * perPage, page * perPage);

  // ============== ADD =================
  const handleAddType = async () => {
    if (!newType.name) return alert("Tên loại thiết bị không được trống");

    try {
      await axios.post(API_URL, newType);
      alert("Thêm loại thiết bị thành công!");
      setIsAddOpen(false);
      setNewType({
        name: "",
        manufacturer: "",
        description: "",
        category: "",
      });
      loadDeviceTypes();
    } catch {
      alert("Lỗi thêm loại thiết bị!");
    }
  };

  // ============== EDIT =================
  const handleEditType = async () => {
    if (!selectedType) return;

    try {
      await axios.put(`${API_URL}/${selectedType.id}`, selectedType);
      alert("Cập nhật thành công!");
      setIsEditOpen(false);
      loadDeviceTypes();
    } catch {
      alert("Lỗi cập nhật!");
    }
  };

  // ============== DELETE ==============
  const handleDeleteType = async () => {
    try {
      await axios.delete(`${API_URL}/${selectedType.id}`);
      alert("Đã xóa!");
      setIsDeleteOpen(false);
      loadDeviceTypes();
    } catch {
      alert("Xóa thất bại!");
    }
  };

  return (
    <div className="space-y-8">
      {/* ===================== HEADER ===================== */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl text-gray-900 mb-2">Quản lý loại thiết bị</h1>
          <p className="text-gray-600">Danh sách các loại cảm biến trong hệ thống</p>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsAddOpen(true)}
          className="px-6 py-3 bg-gradient-to-r from-red-700 to-red-600 text-white rounded-xl shadow-lg flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Thêm loại thiết bị
        </motion.button>
      </motion.div>

      {/* ==================== SEARCH ===================== */}
      <div className="bg-white rounded-xl p-4 border flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchTerm}
            placeholder="Tìm kiếm loại thiết bị..."
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="w-full h-12 pl-12 pr-4 border rounded-xl bg-gray-50 focus:bg-white"
          />
        </div>
      </div>

      {/* ==================== TABLE ===================== */}
      <div className="rounded-2xl border bg-white overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 text-sm text-gray-700 bg-white">
  <div className="flex items-center gap-2">
    <span>Hiển thị mỗi trang:</span>
    <select
      value={perPage}
      onChange={(e) => {
        setPage(1);
        // set perPage
        const value = Number(e.target.value);
        // bạn đã đặt perPage = 10 cố định, giờ chuyển sang state
        // nên cần thêm perPage vào useState phía trên: const [perPage, setPerPage] = useState(10);
        setPerPage(value);
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
      {filtered.length.toLocaleString("vi-VN")}
    </span>{" "}
    loại thiết bị
  </p>
</div>
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="px-6 py-4">Tên loại</TableHead>
              <TableHead className="px-6 py-4">Hãng SX</TableHead>
              <TableHead className="px-6 py-4">Danh mục</TableHead>
              <TableHead className="px-6 py-4">Mô tả</TableHead>
              <TableHead className="px-6 py-4 text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {current.map((t, idx) => (
              <motion.tr
                key={t.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="hover:bg-gray-50"
              >
                <TableCell className="px-6 py-4 font-medium">{t.name}</TableCell>
                <TableCell className="px-6 py-4">{t.manufacturer || "Không có dữ liệu"}</TableCell>
                <TableCell className="px-6 py-4">{t.category || "Không có dữ liệu"}</TableCell>
                <TableCell className="px-6 py-4 truncate max-w-xs">{t.description}</TableCell>

                <TableCell className="px-6 py-4 text-right space-x-2">
                  <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    className="p-2 rounded-lg hover:bg-green-50 text-green-600"
                    onClick={() => {
                      setSelectedType(t);
                      setIsViewOpen(true);
                    }}
                  >
                    <Eye className="w-4 h-4" />
                  </motion.button>

                  <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    className="p-2 rounded-lg hover:bg-blue-50 text-blue-600"
                    onClick={() => {
                      setSelectedType({ ...t });
                      setIsEditOpen(true);
                    }}
                  >
                    <Edit className="w-4 h-4" />
                      </motion.button>
                  <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    className="p-2 rounded-lg hover:bg-red-50 text-red-600"
                    onClick={() => {
                      setSelectedType(t);
                      setIsDeleteOpen(true);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </TableCell>
              </motion.tr>
            ))}

            {current.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6 text-gray-500">
                  Không có dữ liệu
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* ==================== PAGINATION ===================== */}
       {/* ==================== TOP BAR: SHOW PER PAGE ===================== */}


{/* ==================== TABLE PAGINATION ===================== */}
<div className="flex justify-between items-center px-6 py-4 text-sm border-t bg-white">
  <p>
    Trang {page}/{totalPages} — Hiển thị{" "}
    {filtered.length === 0
      ? 0
      : (page - 1) * perPage + 1}
    –
    {Math.min(page * perPage, filtered.length)} /{" "}
    {filtered.length}
  </p>

  <div className="flex items-center gap-1">
    {/* Prev */}
    <button
      disabled={page === 1}
      onClick={() => setPage((p) => Math.max(1, p - 1))}
      className={`px-3 py-1 rounded-md border ${
        page === 1
          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
          : "bg-white hover:bg-gray-50"
      }`}
    >
      Trước
    </button>

    {/* Page numbers */}
    {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
      <button
        key={n}
        onClick={() => setPage(n)}
        className={`px-3 py-1 rounded-md border ${
          page === n
            ? "bg-red-600 text-white border-red-600"
            : "bg-white hover:bg-gray-50"
        }`}
      >
        {n}
      </button>
    ))}

    {/* Next */}
    <button
      disabled={page === totalPages}
      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
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

      </div>

      {/* ==================== MODAL: ADD ===================== */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Thêm loại thiết bị"
        icon={<Plus className="w-5 h-5 text-white" />}
        size="md"
        footer={
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setIsAddOpen(false)}
              className="px-4 py-2 border rounded-lg"
            >
              Hủy
            </button>

            <button
              onClick={handleAddType}
              className="px-4 py-2 bg-red-600 text-white rounded-lg"
            >
              Thêm
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm">Tên loại *</label>
            <input
              className="w-full border rounded-lg px-3 py-2 mt-1"
              value={newType.name}
              onChange={(e) =>
                setNewType({ ...newType, name: e.target.value })
              }
              placeholder="VD: Temperature Sensor"
            />
          </div>

          <div>
            <label className="text-sm">Hãng sản xuất</label>
            <input
              className="w-full border rounded-lg px-3 py-2 mt-1"
              value={newType.manufacturer}
              onChange={(e) =>
                setNewType({ ...newType, manufacturer: e.target.value })
              }
            />
          </div>

          <div>
            <label className="text-sm">Danh mục</label>
            <input
              className="w-full border rounded-lg px-3 py-2 mt-1"
              value={newType.category}
              onChange={(e) =>
                setNewType({ ...newType, category: e.target.value })
              }
            />
          </div>

          <div>
            <label className="text-sm">Mô tả</label>
            <textarea
              className="w-full border rounded-lg px-3 py-2 mt-1"
              value={newType.description}
              onChange={(e) =>
                setNewType({ ...newType, description: e.target.value })
              }
            />
          </div>
        </div>
      </Modal>

      {/* ==================== MODAL: VIEW ===================== */}
      <Modal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title="Chi tiết loại thiết bị"
        icon={<Eye className="w-5 h-5 text-white" />}
        size="md"
      >
        {selectedType && (
          <div className="space-y-4">
            <p>
              <b>Tên:</b> {selectedType.name}
            </p>
            <p>
              <b>Hãng SX:</b> {selectedType.manufacturer || "—"}
            </p>
            <p>
              <b>Danh mục:</b> {selectedType.category || "—"}
            </p>
            <p>
              <b>Mô tả:</b> {selectedType.description || "—"}
            </p>
          </div>
        )}
      </Modal>

      {/* ==================== MODAL: EDIT ===================== */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Chỉnh sửa loại thiết bị"
        icon={<Edit className="w-5 h-5 text-white" />}
        size="md"
        footer={
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setIsEditOpen(false)}
              className="px-4 py-2 border rounded-lg text-gray-700"
            >
              Hủy
            </button>
            <button
              onClick={handleEditType}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
              Cập nhật
            </button>
          </div>
        }
      >
        {selectedType && (
          <div className="space-y-4">
            <div>
              <label className="text-sm">Tên loại *</label>
              <input
                className="w-full border rounded-lg px-3 py-2 mt-1"
                value={selectedType.name}
                onChange={(e) =>
                  setSelectedType({ ...selectedType, name: e.target.value })
                }
              />
            </div>

            <div>
              <label className="text-sm">Hãng SX</label>
              <input
                className="w-full border rounded-lg px-3 py-2 mt-1"
                value={selectedType.manufacturer}
                onChange={(e) =>
                  setSelectedType({
                    ...selectedType,
                    manufacturer: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <label className="text-sm">Danh mục</label>
              <input
                className="w-full border rounded-lg px-3 py-2 mt-1"
                value={selectedType.category}
                onChange={(e) =>
                  setSelectedType({ ...selectedType, category: e.target.value })
                }
              />
            </div>

            <div>
              <label className="text-sm">Mô tả</label>
              <textarea
                className="w-full border rounded-lg px-3 py-2 mt-1"
                value={selectedType.description}
                onChange={(e) =>
                  setSelectedType({
                    ...selectedType,
                    description: e.target.value,
                  })
                }
              />
            </div>
          </div>
        )}
      </Modal>

      {/* ==================== MODAL: DELETE ===================== */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Xóa loại thiết bị"
        icon={<Trash2 className="w-5 h-5 text-white" />}
        customWidth="max-w-[380px]"
      >
        <div className="text-center space-y-4 px-4">
          <p className="text-gray-700">Bạn có chắc chắn muốn xóa loại thiết bị:</p>
          <p className="font-semibold text-gray-900">{selectedType?.name}</p>

          <p className="text-sm text-red-600">Hành động này không thể hoàn tác</p>

          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={() => setIsDeleteOpen(false)}
              className="px-4 py-2 border rounded-lg"
            >
              Hủy
            </button>
            <button
              onClick={handleDeleteType}
              className="px-4 py-2 bg-red-600 text-white rounded-lg"
            >
              Xóa
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
