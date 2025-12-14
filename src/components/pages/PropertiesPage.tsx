import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Search, Plus, Edit, Trash2, Eye, Activity } from "lucide-react";

import { Modal } from "../ui/modal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

const API_URL = "http://localhost:8080/api/v1/iot/properties";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
};

export default function PropertiesPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
const [page, setPage] = useState(0);
const [perPage, setPerPage] = useState(10);
const [totalPages, setTotalPages] = useState(0);
const [totalRecords, setTotalRecords] = useState(0);

  // modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedProp, setSelectedProp] = useState<any>(null);
const validateProperty = (data: {
  name: string;
  unit: string;
  dataType: string;
}) => {
  if (!data.name.trim()) {
    toast.warning("Vui lòng nhập tên thuộc tính");
    return false;
  }

  if (!data.unit.trim()) {
    toast.warning("Vui lòng nhập đơn vị đo");
    return false;
  }

  if (!data.dataType) {
    toast.warning("Vui lòng chọn kiểu dữ liệu");
    return false;
  }

  return true;
};

  // form add
  const [newProp, setNewProp] = useState({
    name: "",
    unit: "",
    dataType: "NUMERIC",
  });


const loadProperties = async () => {
  try {
    const res = await axios.get(API_URL, {
      params: {
        page,
        size: perPage,
      },
      ...getAuthHeaders(),
    });

    setProperties(res.data.content || []);
    setTotalPages(res.data.totalPages);
    setTotalRecords(res.data.totalElements);
  } catch {
    toast.error("Không thể tải danh sách thuộc tính");
  }
};


useEffect(() => {
  loadProperties();
}, [page, perPage]);

  // ================= CRUD =================
const handleAddProp = async () => {
  if (!validateProperty(newProp)) return;

  try {
    await axios.post(API_URL, newProp, getAuthHeaders());
    toast.success("Thêm thuộc tính thành công");
    setIsAddOpen(false);
    setNewProp({ name: "", unit: "", dataType: "NUMERIC" });
    loadProperties();
  } catch (e: any) {
    toast.error(e.response?.data?.message || "Lỗi thêm thuộc tính");
  }
};


const handleEditProp = async () => {
  if (!selectedProp) return;

  if (!validateProperty(selectedProp)) return;

  try {
    await axios.put(
      `${API_URL}/${selectedProp.id}`,
      selectedProp,
      getAuthHeaders()
    );
    toast.success("Cập nhật thuộc tính thành công");
    setIsEditOpen(false);
    loadProperties();
  } catch (e: any) {
    toast.error(e.response?.data?.message || "Lỗi cập nhật");
  }
};


  const handleDeleteProp = async () => {
    try {
      await axios.delete(`${API_URL}/${selectedProp.id}`, getAuthHeaders());
      toast.success("Đã xóa thuộc tính");
      setIsDeleteOpen(false);
      loadProperties();
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Xóa thất bại");
    }
  };

  // ================= FILTER + PAGINATION =================



const displayList = properties.filter((p) => {
  const keyword = searchTerm.toLowerCase();
  return (
    p.name?.toLowerCase().includes(keyword) ||
    p.unit?.toLowerCase().includes(keyword) ||
    p.dataType?.toLowerCase().includes(keyword)
  );
});

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex items-center justify-between"
            >
        <div>
          <h1 className="text-3xl text-gray-900 mb-2">Quản lý thuộc tính</h1>
          <p className="text-gray-600">
            Định nghĩa các thông số đo lường (Nhiệt độ, Độ ẩm…)
          </p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="px-6 py-3 bg-gradient-to-r from-red-700 to-red-600 text-white rounded-xl shadow-lg flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Thêm thuộc tính
        </button>
      </motion.div>

      {/* SEARCH */}
      <div className="bg-white rounded-xl p-4 border">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm thuộc tính..."
            className="w-full h-12 pl-12 pr-4 border rounded-xl bg-gray-50"
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="rounded-2xl border bg-white overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 text-sm text-gray-700 bg-white">
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
            </select>
          </div>
          <p>
            Tổng <b>{totalRecords}</b> thuộc tính
          </p>
        </div>

        <Table>
                   <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="px-6 py-4">Tên thuộc tính</TableHead>
              <TableHead className="px-6 py-4">Đơn vị</TableHead>
              <TableHead className="px-6 py-4">Kiểu dữ liệu</TableHead>
              <TableHead className="px-6 py-4 text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
{displayList.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="px-6 py-4 font-medium flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-500" />
                  {p.name}
                </TableCell>
                                <TableCell className="px-6 py-4">
                  <span className="px-2 py-1 bg-gray-100 rounded text-xs font-semibold text-gray-700">
                    {p.unit || "N/A"}
                  </span>
                </TableCell>
                              <TableCell className="px-6 py-4">
                  <span className="px-2 py-1 bg-gray-100 rounded text-xs font-semibold text-gray-700">
                    {p.dataType || "N/A"}
                  </span>
                </TableCell>
                <TableCell className="px-6 py-4 text-right space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 rounded-lg hover:bg-green-50 text-green-600"
                    onClick={() => { setSelectedProp(p); setIsViewOpen(true); }}
                  >
                    <Eye className="w-4 h-4" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 rounded-lg hover:bg-blue-50 text-blue-600"
                    onClick={() => { setSelectedProp({ ...p }); setIsEditOpen(true); }}
                  >
                    <Edit className="w-4 h-4" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 rounded-lg hover:bg-red-50 text-red-600"
onClick={() => { setSelectedProp(p); setIsDeleteOpen(true); }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </TableCell>
              </TableRow>
            ))}

{displayList.length === 0 && (
  <TableRow>
    <TableCell colSpan={4} className="text-center py-6 text-gray-500">
      Không có dữ liệu
    </TableCell>
  </TableRow>
)}

          </TableBody>
        </Table>

        {/* PAGINATION */}
        <div className="flex justify-between px-6 py-4 border-t text-sm">
          <p>
  Trang {page + 1} / {totalPages}
</p>

          <div className="flex gap-1">
            <button
  disabled={page === 0}
  onClick={() => setPage((p) => Math.max(0, p - 1))}
>
  Trước
</button>
            {Array.from({ length: totalPages }).map((_, i) => (
  <button
    key={i}
    onClick={() => setPage(i)}
    className={`px-3 py-1 border rounded ${
      page === i ? "bg-red-600 text-white" : ""
    }`}
  >
    {i + 1}
  </button>
))}

            <button
  disabled={page >= totalPages - 1}
  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
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
        title="Thêm thuộc tính mới"
        icon={<Plus className="w-5 h-5 text-white" />}
        size="md"
        footer={
          <div className="flex gap-2 justify-end">
            <button onClick={() => setIsAddOpen(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Hủy</button>
            <button onClick={handleAddProp} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg">Lưu lại</button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Tên thuộc tính <span className="text-red-500">*</span></label>
            <input
              className="w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-200 outline-none"
              placeholder="VD: Nhiệt độ, Độ ẩm..."
              value={newProp.name}
              onChange={(e) => setNewProp({ ...newProp, name: e.target.value })}
            />
          </div>
          <div>
<label className="text-sm font-medium text-gray-700">
  Đơn vị đo <span className="text-red-500">*</span>
</label>
            <input
              className="w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-200 outline-none"
              placeholder="VD: °C, %, ppm..."
              value={newProp.unit}
              onChange={(e) => setNewProp({ ...newProp, unit: e.target.value })}
/>
          </div>
          <div>
<label className="text-sm font-medium text-gray-700">
  Kiểu dữ liệu <span className="text-red-500">*</span>
</label>
            <select
              className="w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-200 outline-none bg-white"
              value={newProp.dataType}
              onChange={(e) => setNewProp({ ...newProp, dataType: e.target.value })}
            >
              <option value="NUMERIC">Số (Numeric)</option>
              <option value="BOOLEAN">Đúng/Sai (Boolean)</option>
              <option value="STRING">Chuỗi (String)</option>
            </select>
          </div>
        </div>
      </Modal>

      {/* ==================== MODAL: EDIT ===================== */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Cập nhật thuộc tính"
        icon={<Edit className="w-5 h-5 text-white" />}
        size="md"
        footer={
          <div className="flex gap-2 justify-end">
            <button onClick={() => setIsEditOpen(false)} className="px-4 py-2 border rounded-lg">Hủy</button>
            <button onClick={handleEditProp} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Cập nhật</button>
          </div>
        }
      >
        {selectedProp && (
          <div className="space-y-4">
            <div>
<label className="text-sm font-medium">
  Tên thuộc tính <span className="text-red-500">*</span>
</label>
              <input
                className="w-full border rounded-lg px-3 py-2 mt-1"
                value={selectedProp.name}
                onChange={(e) => setSelectedProp({ ...selectedProp, name: e.target.value })}
              />
            </div>
            <div>
<label className="text-sm font-medium">
  Đơn vị đo <span className="text-red-500">*</span>
</label>
              <input
                className="w-full border rounded-lg px-3 py-2 mt-1"
                value={selectedProp.unit}
                onChange={(e) => setSelectedProp({ ...selectedProp, unit: e.target.value })}
              />
            </div>
            <div>
<label className="text-sm font-medium text-gray-700">
  Kiểu dữ liệu <span className="text-red-500">*</span>
</label>
              <select
                className="w-full border rounded-lg px-3 py-2 mt-1 bg-white"
                value={selectedProp.dataType}
                onChange={(e) => setSelectedProp({ ...selectedProp, dataType: e.target.value })}
              >
                <option value="NUMERIC">Số (Numeric)</option>
                <option value="BOOLEAN">Đúng/Sai (Boolean)</option>
                <option value="STRING">Chuỗi (String)</option>
              </select>
            </div>
          </div>
        )}
      </Modal>

      {/* ==================== MODAL: VIEW ===================== */}
      <Modal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title="Chi tiết thuộc tính"
        icon={<Eye className="w-5 h-5 text-white" />}
      >
{selectedProp && (
          <div className="space-y-3">
             <p><b>ID:</b> <span className="text-gray-600">{selectedProp.id}</span></p>
             <p><b>Tên:</b> <span className="text-gray-900 font-medium">{selectedProp.name}</span></p>
             <p><b>Đơn vị:</b> <span className="bg-gray-100 px-2 py-0.5 rounded text-sm">{selectedProp.unit || "Không có"}</span></p>
             <p><b>Kiểu dữ liệu:</b> {selectedProp.dataType}</p>
          </div>
        )}
      </Modal>

      {/* ==================== MODAL: DELETE ===================== */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Xóa thuộc tính"
        icon={<Trash2 className="w-5 h-5 text-white" />}
        customWidth="max-w-[400px]"
      >
        <div className="text-center space-y-4 px-4">
          <p className="text-gray-700">Bạn có chắc chắn muốn xóa thuộc tính này?</p>
          <div className="bg-gray-50 p-3 rounded-lg border">
             <p className="font-bold text-lg text-gray-900">{selectedProp?.name}</p>
             <p className="text-sm text-gray-500">{selectedProp?.unit}</p>
          </div>
          <p className="text-sm text-red-600 italic">Lưu ý: Hành động này không thể hoàn tác.</p>

          <div className="flex justify-center gap-3 pt-2">
            <button onClick={() => setIsDeleteOpen(false)} className="px-4 py-2 border rounded-lg">Hủy</button>
            <button onClick={handleDeleteProp} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Xác nhận xóa</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}