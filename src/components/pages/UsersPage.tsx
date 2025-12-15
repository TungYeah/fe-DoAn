import { toast } from "sonner";
import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Modal } from "../ui/modal";
import ImportUserButton from "../ui/ImportUserButton";

import {
  Search,
  Edit,
  Filter,
  UserCheck,
  UserX,
  Download,
  Eye,
  Shield,
  Ban,
  CheckCircle,
  Save,
  Key,
  Book,
  Cpu
} from "lucide-react";

// --- Types ---
type UserItem = {
  id: string;
  name: string;
  email: string;
  role: string;
  unit: string;

  status: "active" | "inactive";
  statusLabel: string;
  locked: boolean;
  deactivated: boolean;

  devices: number;
  joinDate: string;
  enabled: boolean | null;
  activationDate: string;
  lastActive: string;
};

type UserStats = {
  totalUsers: number;
  activeUsers: number;
  onlineUsers: number;
  newUsersToday: number;
};

const API_BASE_URL = "http://localhost:8080";
const UNIT_OPTIONS = [
  { value: "CNTT", label: "Công nghệ thông tin" },
  { value: "DTVT", label: "Điện tử viễn thông" },
];
const ROLE_OPTIONS = [
  { value: "ROLE_ADMIN", label: "Admin" },
  { value: "ROLE_USER", label: "User" },
];

export default function UsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  
  // Form chỉnh sửa
  const [editForm, setEditForm] = useState({
    fullName: "",
    unit: "",
    email: "",
  });
  const [savingEdit, setSavingEdit] = useState(false);

  // State Modal
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isChangeRoleModalOpen, setIsChangeRoleModalOpen] = useState(false);
  const [isToggleStatusModalOpen, setIsToggleStatusModalOpen] = useState(false);

  // Logic xử lý
  const [targetRole, setTargetRole] = useState<string>("ROLE_USER");
  const [changingRole, setChangingRole] = useState(false);
  const [togglingStatus, setTogglingStatus] = useState(false);

  // Filter & Pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Stats
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // --- HÀM HELPER: FETCH USER DATA ---
  const fetchUsers = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      setLoadingUsers(true);
      const res = await fetch(
        `${API_BASE_URL}/api/v1/admin/users?page=${page}&size=${size}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
if (!res.ok) throw new Error("Fetch users failed");

      const data = await res.json();

      const mappedUsers: UserItem[] = (data.content || []).map((u: any) => {
        const joinDate = u.createdAt
          ? new Date(u.createdAt).toLocaleString("vi-VN")
          : "";
        const isLocked = u.locked === true;
        const isDeactivated = u.deactivated === true;

        let status: "active" | "inactive" = "active";
        let statusLabel = "Hoạt động";

        if (isLocked || isDeactivated) {
          status = "inactive";
          statusLabel = isLocked ? "Bị Admin chặn" : "Người dùng khóa tài khoản";
        }

        return {
          id: u.id,
          name: u.fullName ?? "No name",
          email: u.email,
          role: (u.roles || []).includes("ROLE_ADMIN") ? "ROLE_ADMIN" : "ROLE_USER",
          unit: u.unit ?? "Không rõ",
          status,
          statusLabel,
          locked: isLocked,
          deactivated: isDeactivated,
          devices: u.deviceCount ?? 0, // Trường này BE trả về từ API getPage
          joinDate,
          enabled: u.enabled ?? null,
          activationDate: u.enabled ? joinDate : "Chưa kích hoạt",
          lastActive: u.lastActive ? new Date(u.lastActive).toLocaleString("vi-VN") : "Chưa ghi nhận",
        };
      });

      setUsers(mappedUsers);
      setTotalElements(data.totalElements);
      setTotalPages(data.totalPages);
    } catch (e) {
      toast.error("Không tải được danh sách người dùng");
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_BASE_URL}/api/v1/admin/users/statistics`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch stats");
      const data: UserStats = await res.json();
      setStats(data);
    } catch (error) {
      console.error("Error loading stats", error);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [page, size]);
  useEffect(() => { fetchStats(); }, []);
  useEffect(() => { setPage(0); }, [searchTerm, selectedRole, size]);

  // --- HÀM XUẤT CSV (FRONTEND ONLY) ---
  const handleExport = async (format: "excel") => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const toastId = toast.loading("Đang tải dữ liệu để xuất file...");

    try {
      // 1. Gọi API lấy TOÀN BỘ dữ liệu (size lớn)
      // Lưu ý: Nếu dữ liệu quá lớn (>10.000), nên dùng phương pháp khác hoặc backend export
      const res = await fetch(
        `${API_BASE_URL}/api/v1/admin/users?page=0&size=9999`, 
        {
          headers: {
"Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Không lấy được dữ liệu");
      const data = await res.json();
      const allUsers = data.content || [];

      if (allUsers.length === 0) {
        toast.dismiss(toastId);
        toast.info("Không có dữ liệu để xuất");
        return;
      }

      // 2. Định nghĩa Header cho CSV
      const headers = ["ID", "Email", "Họ và tên", "Đơn vị", "Vai trò", "Trạng thái", "Số thiết bị", "Ngày tạo", "Ngày kích hoạt"];

      // 3. Map dữ liệu thành các dòng CSV
      const csvRows = allUsers.map((u: any) => {
        // Xử lý Role
        const roleStr = (u.roles || []).includes("ROLE_ADMIN") ? "ADMIN" : "USER";
        
        // Xử lý Status
        const isLocked = u.locked === true;
        const isDeactivated = u.deactivated === true;
        let statusStr = "Hoạt động";
        if (isLocked) statusStr = "Đã chặn";
        else if (isDeactivated) statusStr = "Tự khóa";

        // Xử lý ngày tháng
        const createdDate = u.createdAt ? new Date(u.createdAt).toLocaleDateString("vi-VN") : "";
        const activeDate = u.enabled ? createdDate : "Chưa kích hoạt";
        
        // Escape dấu phẩy trong tên (nếu có) bằng dấu ngoặc kép
        const escape = (text: string) => `"${String(text || "").replace(/"/g, '""')}"`;

        return [
          escape(u.id),
          escape(u.email),
          escape(u.fullName),
          escape(u.unit),
          escape(roleStr),
          escape(statusStr),
          u.deviceCount ?? 0,
          escape(createdDate),
          escape(activeDate)
        ].join(",");
      });

      // 4. Ghép Header và Rows
      // \uFEFF là BOM (Byte Order Mark) giúp Excel nhận diện đúng tiếng Việt UTF-8
      const csvContent = "\uFEFF" + [headers.join(","), ...csvRows].join("\n");

      // 5. Tạo Blob và tải xuống
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      
      const fileName = `Danh_sach_User_${new Date().toISOString().slice(0, 10)}.csv`;
      
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.dismiss(toastId);
      toast.success("Xuất file thành công!");

    } catch (error) {
      console.error(error);
      toast.dismiss(toastId);
      toast.error("Có lỗi khi xuất file");
    }
  };

  // ... (Phần Handlers khác: Edit, Role, Status giữ nguyên) ...
  const handleViewDetails = (user: UserItem) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  const handleEdit = (user: UserItem) => {
    setSelectedUser(user);
    setEditForm({ fullName: user.name, unit: user.unit || "", email: user.email });
    setIsEditModalOpen(true);
};

  const handleSubmitEdit = async () => {
    if (!selectedUser) return;
    try {
      setSavingEdit(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/v1/admin/users/update/${encodeURIComponent(selectedUser.email)}`, {
        method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ fullName: editForm.fullName.trim(), unit: editForm.unit }),
      });
      if (!res.ok) throw new Error("Cập nhật thất bại");
      const data = await res.json();
      setUsers(prev => prev.map(u => u.id === data.id ? { ...u, name: data.fullName ?? u.name, unit: data.unit ?? u.unit } : u));
      toast.success("Cập nhật thành công!");
      setIsEditModalOpen(false);
    } catch (e: any) { toast.error(e.message); } finally { setSavingEdit(false); }
  };

  const handleChangeRole = (user: UserItem) => {
    setSelectedUser(user);
    setTargetRole(user.role === "ROLE_ADMIN" ? "ROLE_ADMIN" : "ROLE_USER");
    setIsChangeRoleModalOpen(true);
  };

  const handleSubmitChangeRole = async () => {
    if (!selectedUser) return;
    const token = localStorage.getItem("token");
    if (!token) return;
    const wantAdmin = targetRole === "ROLE_ADMIN";
    if ((selectedUser.role === "ROLE_ADMIN") === wantAdmin) { setIsChangeRoleModalOpen(false); return; }
    try {
      setChangingRole(true);
      const res = await fetch(`${API_BASE_URL}/api/v1/admin/users/${encodeURIComponent(selectedUser.email)}/${wantAdmin ? "assign-role" : "remove-role"}`, {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ roleName: "ROLE_ADMIN" }),
      });
      if (!res.ok) throw new Error("Lỗi");
      const data = await res.json();
      const newRole = (data.roles || []).includes("ROLE_ADMIN") ? "ROLE_ADMIN" : "ROLE_USER";
      setUsers(prev => prev.map(u => (u.id === data.id ? { ...u, role: newRole } : u)));
      toast.success("Thành công"); setIsChangeRoleModalOpen(false);
    } catch (e: any) { toast.error(e.message); } finally { setChangingRole(false); }
  };

  const handleToggleStatus = (user: UserItem) => { setSelectedUser(user); setIsToggleStatusModalOpen(true); };

  const handleConfirmToggleStatus = async () => {
    if (!selectedUser) return;
    const token = localStorage.getItem("token");
    if (!token) return;
    const isActive = selectedUser.status === "active";
    try {
      setTogglingStatus(true);
      const res = await fetch(`${API_BASE_URL}/api/v1/admin/users/${encodeURIComponent(selectedUser.email)}/${isActive ? "lock" : "unlock"}`, {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Lỗi");
      const data = await res.json();
const locked = data.locked === true; const deactivated = data.deactivated === true;
      let newStatus: "active" | "inactive" = (locked || deactivated) ? "inactive" : "active";
      let newStatusLabel = locked ? "Bị Admin chặn" : (deactivated ? "Người dùng khóa" : "Hoạt động");
      setUsers(prev => prev.map(u => u.id === data.id ? { ...u, status: newStatus, statusLabel: newStatusLabel, locked, deactivated } : u));
      toast.success("Thành công"); setIsToggleStatusModalOpen(false);
    } catch (e: any) { toast.error(e.message); } finally { setTogglingStatus(false); }
  };

  const totalUsers = stats?.totalUsers ?? 0;
  const activeUsers = stats?.activeUsers ?? 0;
  const inactiveUsers = stats ? stats.totalUsers - stats.activeUsers : 0;
  const newUsersToday = stats?.newUsersToday ?? 0;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="flex items-center justify-between">
        <div><h1 className="text-3xl text-gray-900 mb-2">Quản lý User</h1><p className="text-gray-600">Quản lý người dùng và phân quyền trong hệ thống</p></div>
        <div className="flex gap-3 items-center">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleExport("excel")} className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-green-600 hover:text-green-600 transition-all flex items-center gap-2">
            <Download className="w-5 h-5" /> Xuất Excel (CSV)
          </motion.button>
          <ImportUserButton onSuccess={fetchUsers} />
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[{ label: "Tổng User", value: totalUsers, color: "text-gray-900" }, { label: "Đang hoạt động", value: activeUsers, color: "text-green-600" }, { label: "Chưa kích hoạt", value: inactiveUsers, color: "text-red-600" }, { label: "Người dùng mới", value: newUsersToday, color: "text-blue-600" }].map((stat, idx) => (
          <motion.div key={idx} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3, delay: 0.1 * idx }} className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all">
            <p className="text-sm text-gray-600 mb-1">{stat.label}</p><p className={`text-2xl ${stat.color}`}>{loadingStats ? "…" : stat.value.toLocaleString("vi-VN")}</p>
          </motion.div>
        ))}
      </div>

      {/* Filter */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
<div className="flex-1 relative"><Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /><input type="text" placeholder="Tìm kiếm theo tên hoặc email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-600 focus:outline-none transition-colors" /></div>
          <div className="relative"><Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /><select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} className="pl-12 pr-8 py-3 border-2 border-gray-200 rounded-xl focus:border-red-600 focus:outline-none transition-colors appearance-none bg-white"><option value="all">Tất cả vai trò</option><option value="role_admin">Admin</option><option value="role_user">User</option></select></div>
        </div>
      </motion.div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200">
          <div className="flex items-center gap-2 text-sm text-gray-700"><span>Hiển thị mỗi trang:</span><select value={size} onChange={(e) => { setSize(Number(e.target.value)); setPage(0); }} className="border border-gray-300 rounded-lg px-2 py-1 text-sm"><option value={5}>5</option><option value={10}>10</option><option value={20}>20</option><option value={50}>50</option></select></div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>{["Người dùng", "ID", "Vai trò", "Khoa", "Trạng thái", "Thiết bị", "Ngày tham gia", "Ngày kích hoạt", "Thao tác"].map(h => (<th key={h} className={`px-6 py-4 text-left text-sm text-gray-600 ${h === "Thao tác" ? "text-right" : ""}`}>{h}</th>))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.length === 0 && (<tr><td colSpan={9} className="px-6 py-6 text-center text-gray-500">Không có người dùng nào.</td></tr>)}
              {users.map((user, idx) => (
                <motion.tr key={user.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: Math.min(0.03 * idx, 0.3) }} className="hover:bg-gray-50 transition-all cursor-pointer">
                  <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center shadow text-white text-sm">{user.name.charAt(0)}</div><div><p className="text-gray-900">{user.name}</p><p className="text-sm text-gray-500">{user.email}</p></div></div></td>
                  <td className="px-6 py-4 text-gray-700 font-mono">{user.id}</td>
<td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-xs ${user.role === "ROLE_ADMIN" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-700"}`}>{user.role}</span></td>
                  <td className="px-6 py-4 text-gray-700">{user.unit}</td>
                  <td className="px-6 py-4"><div className="flex flex-col"><div className="flex items-center gap-2">{user.status === "active" ? (<><UserCheck className="w-4 h-4 text-green-600" /><span className="text-sm text-green-600">Hoạt động</span></>) : (<><UserX className="w-4 h-4 text-red-600" /><span className="text-sm text-red-600">Không hoạt động</span></>)}</div>{user.status === "inactive" && (<span className="text-xs text-gray-500 mt-1">{user.statusLabel}</span>)}</div></td>
                  <td className="px-6 py-4 text-gray-900">{user.devices} thiết bị</td>
                  <td className="px-6 py-4 text-gray-600">{user.joinDate}</td>
                  <td className="px-6 py-4 text-gray-600">{user.activationDate}</td>
                  <td className="px-6 py-4"><div className="flex items-center justify-end gap-2"><button onClick={() => handleViewDetails(user)} className="p-2 hover:bg-green-50 rounded-lg text-green-600" title="Xem"><Eye className="w-4 h-4" /></button><button onClick={() => handleEdit(user)} className="p-2 hover:bg-blue-50 rounded-lg text-blue-600" title="Sửa"><Edit className="w-4 h-4" /></button><button onClick={() => handleChangeRole(user)} className="p-2 hover:bg-blue-50 rounded-lg text-blue-600" title="Đổi quyền"><Shield className="w-4 h-4" /></button><button onClick={() => handleToggleStatus(user)} className={`p-2 rounded-lg ${user.status === "active" ? "hover:bg-red-50 text-red-600" : "hover:bg-green-50 text-green-600"}`} title={user.status === "active" ? "Chặn" : "Kích hoạt"}>{user.status === "active" ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}</button></div></td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (<div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between text-sm text-gray-700"><p>Trang {page + 1} / {totalPages} — Tổng {totalElements} người dùng</p><div className="flex items-center gap-1"><button disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))} className="px-3 py-1 rounded-md border disabled:opacity-40">Trước</button><button disabled={page + 1 >= totalPages} onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} className="px-3 py-1 rounded-md border disabled:opacity-40">Sau</button></div></div>)}
      </div>

      {/* Modals */}
<Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Thông tin người dùng" icon={<Eye className="w-5 h-5 text-white" />} size="md">{selectedUser && (<div className="space-y-4"><div className="flex items-center gap-3 p-3 bg-red-50 rounded-xl border border-red-200"><div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white text-xl">{selectedUser.name.charAt(0)}</div><div><h3 className="text-base font-bold">{selectedUser.name}</h3><p className="text-sm">{selectedUser.email}</p></div></div><div className="grid grid-cols-2 gap-3"><div className="p-3 bg-gray-50 rounded border"><p className="text-xs text-gray-500">ID</p><p className="text-sm">{selectedUser.id}</p></div><div className="p-3 bg-gray-50 rounded border"><p className="text-xs text-gray-500">Vai trò</p><p className="text-sm">{selectedUser.role}</p></div><div className="p-3 bg-gray-50 rounded border"><p className="text-xs text-gray-500">Khoa</p><p className="text-sm">{selectedUser.unit === "CNTT" ? "CNTT" : "DTVT"}</p></div><div className="p-3 bg-gray-50 rounded border"><p className="text-xs text-gray-500">Thiết bị</p><p className="text-sm">{selectedUser.devices}</p></div></div><div className="flex justify-end"><button onClick={() => setIsViewModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded text-sm">Đóng</button></div></div>)}</Modal>
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Sửa thông tin" icon={<Edit className="w-5 h-5 text-white" />} size="md"><div className="space-y-4"><div><label className="text-xs font-bold text-gray-600">Họ tên</label><input className="w-full border p-2 rounded" value={editForm.fullName} onChange={e => setEditForm({ ...editForm, fullName: e.target.value })} /></div><div><label className="text-xs font-bold text-gray-600">Email</label><input className="w-full border p-2 rounded bg-gray-100" value={editForm.email} disabled /></div><div><label className="text-xs font-bold text-gray-600">Khoa</label><select className="w-full border p-2 rounded" value={editForm.unit} onChange={e => setEditForm({ ...editForm, unit: e.target.value })}><option value="">-- Chọn --</option>{UNIT_OPTIONS.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}</select></div><div className="flex justify-end gap-2"><button onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 border rounded">Hủy</button><button onClick={handleSubmitEdit} disabled={savingEdit} className="px-4 py-2 bg-red-600 text-white rounded">{savingEdit ? "Lưu..." : "Lưu"}</button></div></div></Modal>
<Modal isOpen={isChangeRoleModalOpen} onClose={() => setIsChangeRoleModalOpen(false)} title="Đổi quyền" icon={<Shield className="w-5 h-5 text-white" />}><div className="space-y-4"><p>Chọn vai trò mới cho <strong>{selectedUser?.name}</strong>:</p><div className="flex gap-4">{ROLE_OPTIONS.map(opt => (<label key={opt.value} className={`flex-1 border p-3 rounded cursor-pointer ${targetRole === opt.value ? "bg-red-50 border-red-500" : ""}`}><input type="radio" name="role" value={opt.value} checked={targetRole === opt.value} onChange={() => setTargetRole(opt.value)} className="mr-2" />{opt.label}</label>))}</div><div className="flex justify-end gap-2"><button onClick={() => setIsChangeRoleModalOpen(false)} className="px-4 py-2 border rounded">Hủy</button><button onClick={handleSubmitChangeRole} disabled={changingRole} className="px-4 py-2 bg-blue-600 text-white rounded">{changingRole ? "..." : "Cập nhật"}</button></div></div></Modal>
      <Modal isOpen={isToggleStatusModalOpen} onClose={() => setIsToggleStatusModalOpen(false)} title="Xác nhận" icon={<Ban className="w-5 h-5 text-white" />}><div className="space-y-4 text-center"><p>Bạn có chắc muốn <strong>{selectedUser?.status === "active" ? "CHẶN" : "KÍCH HOẠT"}</strong> tài khoản <strong>{selectedUser?.name}</strong>?</p><div className="flex justify-center gap-2"><button onClick={() => setIsToggleStatusModalOpen(false)} className="px-4 py-2 border rounded">Hủy</button><button onClick={handleConfirmToggleStatus} disabled={togglingStatus} className={`px-4 py-2 text-white rounded ${selectedUser?.status === "active" ? "bg-red-600" : "bg-green-600"}`}>{togglingStatus ? "..." : "Đồng ý"}</button></div></div></Modal>
    </div>
  );
}