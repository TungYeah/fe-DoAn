import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion"; // Hoặc "motion/react" tùy phiên bản bạn dùng

import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
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
import { toast } from "sonner"; 

// Đổi URL trỏ về Spring Boot
const API_URL = "http://localhost:8080/api/v1/iot/device-types";

// Hàm helper để lấy header chứa token
const getAuthHeaders = () => {
  const token = localStorage.getItem("token"); // Hoặc lấy từ AuthContext
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
};

export default function DeviceTypesPage() {
  const [deviceTypes, setDeviceTypes] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [selectedType, setSelectedType] = useState<any>(null);

  const [newType, setNewType] = useState({
    name: "",
    manufacturer: "",
    description: "",
    category: "",
  });

  const [page, setPage] = useState(0); // Spring Boot page bắt đầu từ 0
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
const validateDeviceType = (data: {
  name: string;
  manufacturer: string;
  category: string;
}) => {
  if (!data.name.trim()) {
    toast.warning("Vui lòng nhập tên loại thiết bị");
    return false;
  }

  if (!data.manufacturer.trim()) {
    toast.warning("Vui lòng nhập hãng sản xuất");
    return false;
  }

  if (!data.category.trim()) {
    toast.warning("Vui lòng nhập danh mục thiết bị");
    return false;
  }

  return true;
};

  // ================= FETCH ==================
  const loadDeviceTypes = async () => {
    try {
      // Spring Boot Pageable params: page, size, sort
      const res = await axios.get(API_URL, {
        params: {
            page: page,
            size: perPage,
            // sort: "createdAt,desc" // Nếu muốn sắp xếp
        },
        ...getAuthHeaders()
      });
      
      // Cấu trúc trả về từ Spring Boot Page<T>: { content: [], totalPages: int, ... }
      setDeviceTypes(res.data.content || []);
      setTotalPages(res.data.totalPages);
      setTotalElements(res.data.totalElements);

    } catch (err) {
      console.error("Lỗi tải loại thiết bị:", err);
      toast.error("Không thể tải danh sách loại thiết bị");
    }
  };

  useEffect(() => {
    loadDeviceTypes();
    // eslint-disable-next-line
  }, [page, perPage]); 

  // ============== ADD (SỬ DỤNG SPRING BOOT) =================
const handleAddType = async () => {
  if (!validateDeviceType(newType)) return;

  try {
    await axios.post(API_URL, newType, getAuthHeaders());

    toast.success("Thêm loại thiết bị thành công!");
    setIsAddOpen(false);
    setNewType({
      name: "",
      manufacturer: "",
      description: "",
      category: "",
    });
    loadDeviceTypes();
  } catch (err: any) {
    const message =
      err.response?.data?.message || "Lỗi thêm loại thiết bị!";
    toast.error(message);
  }
};


  // ============== EDIT =================
const handleEditType = async () => {
  if (!selectedType) return;

  if (!validateDeviceType(selectedType)) return;

  try {
    await axios.put(
      `${API_URL}/${selectedType.id}`,
      selectedType,
      getAuthHeaders()
    );
    toast.success("Cập nhật loại thiết bị thành công!");
    setIsEditOpen(false);
    loadDeviceTypes();
  } catch (err: any) {
    const message =
      err.response?.data?.message || "Lỗi cập nhật!";
    toast.error(message);
  }
};


  // ============== DELETE ==============
  const handleDeleteType = async () => {
    try {
      await axios.delete(`${API_URL}/${selectedType.id}`, getAuthHeaders());
      toast.success("Đã xóa thiết bị!");
      setIsDeleteOpen(false);
      loadDeviceTypes();
    } catch (err: any) {
        const message = err.response?.data?.message || "Xóa thất bại!";
        toast.error(message);
    }
  };

  // ============== RENDER UI ==============
  
  // Filter client-side cho search (hoặc bạn có thể gọi API search riêng)
  // Lưu ý: Nếu dữ liệu lớn, nên làm Search ở Backend. Ở đây làm tạm client-side trên trang hiện tại
  const displayList = deviceTypes.filter((t) =>
    t.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

      {/* SEARCH */}
      <div className="bg-white rounded-xl p-4 border flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchTerm}
placeholder="Tìm kiếm loại thiết bị..."
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-12 pl-12 pr-4 border rounded-xl bg-gray-50 focus:bg-white"
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
                setPage(0); // Reset về trang đầu
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
            Tổng <span className="font-semibold text-gray-900">{totalElements}</span> loại thiết bị
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
            {displayList.map((t, idx) => (
              <motion.tr
                key={t.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="hover:bg-gray-50"
              >
                <TableCell className="px-6 py-4 font-medium">{t.name}</TableCell>
                <TableCell className="px-6 py-4">{t.manufacturer || "—"}</TableCell>
                <TableCell className="px-6 py-4">{t.category || "—"}</TableCell>
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

            {displayList.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6 text-gray-500">
                  Không có dữ liệu
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* PAGINATION */}
        <div className="flex justify-between items-center px-6 py-4 text-sm border-t bg-white">
          <p>
            Trang {page + 1}/{totalPages}
          </p>

          <div className="flex items-center gap-1">
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

            {/* Hiển thị số trang đơn giản */}
             {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                 // Logic hiển thị trang thông minh hơn có thể thêm ở đây
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
                 )
             })}

            <button
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
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
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Hủy
            </button>

            <button
              onClick={handleAddType}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
            >
              Thêm
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Tên loại <span className="text-red-500">*</span></label>
            <input
              className="w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-red-200 outline-none"
              value={newType.name}
              onChange={(e) =>
                setNewType({ ...newType, name: e.target.value })
              }
              placeholder="VD: Cảm biến nhiệt độ"
            />
          </div>

          <div>
<label className="text-sm font-medium text-gray-700">
  Hãng sản xuất <span className="text-red-500">*</span>
</label>
            <input
              className="w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-red-200 outline-none"
              value={newType.manufacturer}
              onChange={(e) =>
                setNewType({ ...newType, manufacturer: e.target.value })
              }
              placeholder="VD: Xiaomi, Samsung..."
            />
          </div>

          <div>
<label className="text-sm font-medium text-gray-700">
  Danh mục <span className="text-red-500">*</span>
</label>
            <input
              className="w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-red-200 outline-none"
              value={newType.category}
              onChange={(e) =>
                setNewType({ ...newType, category: e.target.value })
              }
              placeholder="VD: Sensor, Switch..."
            />
          </div>

          <div>
<label className="text-sm font-medium text-gray-700">
  Mô tả <span className="text-red-500">*</span>
</label>
            <textarea
              className="w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-red-200 outline-none"
              value={newType.description}
              onChange={(e) =>
                setNewType({ ...newType, description: e.target.value })
              }
              rows={3}
            />
          </div>
        </div>
      </Modal>
{/* Các Modal VIEW, EDIT, DELETE giữ nguyên structure nhưng dùng hàm xử lý mới */}
      {/* ... (Phần code Modal View, Edit, Delete cũ của bạn ở đây là ổn, chỉ cần đảm bảo gọi đúng hàm handle mới) */}
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