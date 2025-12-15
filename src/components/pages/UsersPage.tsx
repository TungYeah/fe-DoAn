import ImportUserButton from "../ui/ImportUserButton";
import { toast } from "sonner";
import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Modal } from "../ui/modal";
import { AnimatePresence } from "framer-motion";

import {
  Search,
  Plus,
  Edit,
  Trash2,
  Filter,
  MoreVertical,
  UserCheck,
  UserX,
  Activity,
  Download,
  Eye,
  Mail,
  UserIcon,
  Phone,
  Shield,
  Calendar,
  Cpu,
  Ban,
  CheckCircle,
  Save,
  Key,
  ChevronLeft,
  ChevronRight,
  Book,
  Upload,
  FileSpreadsheet,
  UsersIcon,
  Database,
  UserRound,
  Users,
  UserCheck2,
  TrendingUp,
} from "lucide-react";

type UserItem = {
  id: string;
  name: string;
  email: string;
  role: string;
  unit: string;

  status: "active" | "inactive";
  statusLabel: string; // 👉 lý do: Hoạt động / Bị Admin chặn / Người dùng khóa tài khoản
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

const API_BASE_URL = "http://localhost:8080"; // chỉnh nếu BE dùng port khác
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
  const [editForm, setEditForm] = useState({
    fullName: "",
    unit: "",
    email: "",
  });
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);

  const [savingEdit, setSavingEdit] = useState(false);

  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); /// sửa thong tin
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] =
    useState(false); /// reset pas (them sau)
  const [isChangeRoleModalOpen, setIsChangeRoleModalOpen] = useState(false); /// phân quyền

  const [targetRole, setTargetRole] = useState<string>("ROLE_USER"); // role muốn set
  const [changingRole, setChangingRole] = useState(false); // loading cho nút Lưu

  const [isToggleStatusModalOpen, setIsToggleStatusModalOpen] = useState(false); /// block
  const [togglingStatus, setTogglingStatus] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  // Phân trang
  // Pagination (BE)
  const [page, setPage] = useState(0); // ⚠️ backend bắt đầu từ 0
  const [size, setSize] = useState(10);

  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [stats, setStats] = useState<UserStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const handleViewDetails = (user: UserItem) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  const handleResetPassword = (user: UserItem) => {
    setSelectedUser(user);
    setIsResetPasswordModalOpen(true);
  };
  // ===== Import Excel states =====
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);

  // ===== Handle upload file =====
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);

    // MOCK DATA (sau này thay bằng đọc excel thật)
    setPreviewData([
      {
        name: "Nguyễn Văn A",
        email: "a@ptit.edu.vn",
        phone: "0123456789",
        role: "User",
        department: "CNTT",
        password: "PTIT@2024abc",
      },
    ]);
  };

  // ===== Download template =====
  const handleDownloadTemplate = () => {
    const headers = ["Họ tên", "Email", "Số điện thoại", "Vai trò", "Khoa"];
    const csv = "\uFEFF" + headers.join(",");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "template_import_user.csv";
    a.click();

    URL.revokeObjectURL(url);
  };

  const handleExport = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Chưa đăng nhập");
      return;
    }

    const toastId = toast.loading("Đang xuất danh sách người dùng...");

    try {
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

      const headers = [
        "ID",
        "Email",
        "Họ và tên",
        "Đơn vị",
        "Vai trò",
        "Trạng thái",
        "Số thiết bị",
        "Ngày tạo",
        "Ngày kích hoạt",
      ];

      const escape = (text: string) =>
        `"${String(text || "").replace(/"/g, '""')}"`;

      const rows = allUsers.map((u: any) => {
        const role = (u.roles || []).includes("ROLE_ADMIN") ? "ADMIN" : "USER";

        let status = "Hoạt động";
        if (u.locked) status = "Đã chặn";
        else if (u.deactivated) status = "Tự khóa";

        const createdDate = u.createdAt
          ? new Date(u.createdAt).toLocaleDateString("vi-VN")
          : "";

        const activeDate = u.enabled ? createdDate : "Chưa kích hoạt";

        return [
          escape(u.id),
          escape(u.email),
          escape(u.fullName),
          escape(u.unit),
          escape(role),
          escape(status),
          u.deviceCount ?? u.devicesCount ?? 0,
          escape(createdDate),
          escape(activeDate),
        ].join(",");
      });

      const csv = "\uFEFF" + [headers.join(","), ...rows].join("\n");

      const blob = new Blob([csv], {
        type: "text/csv;charset=utf-8;",
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Danh_sach_User_${new Date()
        .toISOString()
        .slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);

      toast.dismiss(toastId);
      toast.success("Xuất file thành công!");
    } catch (e) {
      toast.dismiss(toastId);
      toast.error("Lỗi khi xuất file");
    }
  };

  const handleChangeRole = (user: UserItem) => {
    setSelectedUser(user);
    // Nếu user hiện có ROLE_ADMIN thì chọn ADMIN, không thì USER
    const currentRole = user.role === "ROLE_ADMIN" ? "ROLE_ADMIN" : "ROLE_USER";
    setTargetRole(currentRole);
    setIsChangeRoleModalOpen(true);
  };
  const handleSubmitChangeRole = async () => {
    if (!selectedUser) return;

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Chưa đăng nhập hoặc hết phiên đăng nhập");
      return;
    }

    const currentIsAdmin = selectedUser.role === "ROLE_ADMIN";
    const wantAdmin = targetRole === "ROLE_ADMIN";

    // Nếu không thay đổi gì thì thôi
    if (currentIsAdmin === wantAdmin) {
      toast.info("Vai trò không thay đổi");
      setIsChangeRoleModalOpen(false);
      return;
    }

    try {
      setChangingRole(true);

      const baseUrl = `${API_BASE_URL}/api/v1/admin/users/${encodeURIComponent(
        selectedUser.email
      )}`;

      const url = wantAdmin
        ? `${baseUrl}/assign-role`
        : `${baseUrl}/remove-role`;

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        // BE chỉ quan tâm roleName = ROLE_ADMIN (thêm / xóa admin)
        body: JSON.stringify({ roleName: "ROLE_ADMIN" }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Cập nhật vai trò thất bại");
      }

      const data = await res.json(); // UserResponse

      // Tính lại role chính từ danh sách roles trả về
      const roles: string[] = data.roles || [];
      const isAdminAfter = roles.includes("ROLE_ADMIN");
      const mainRole = isAdminAfter ? "ROLE_ADMIN" : "ROLE_USER";

      // Cập nhật list users
      setUsers((prev) =>
        prev.map((u) =>
          u.id === data.id
            ? {
                ...u,
                role: mainRole,
              }
            : u
        )
      );

      // Cập nhật selectedUser nếu đang mở modal
      setSelectedUser((prev) =>
        prev && prev.id === data.id ? { ...prev, role: mainRole } : prev
      );

      toast.success(
        wantAdmin
          ? "Đã gán quyền Admin cho người dùng"
          : "Đã bỏ quyền Admin, người dùng trở lại quyền User"
      );
      setIsChangeRoleModalOpen(false);
    } catch (e: any) {
      toast.error(e.message || "Có lỗi xảy ra khi cập nhật vai trò");
    } finally {
      setChangingRole(false);
    }
  };

  const handleToggleStatus = (user: UserItem) => {
    setSelectedUser(user);
    setIsToggleStatusModalOpen(true);
  };
  const handleConfirmToggleStatus = async () => {
    if (!selectedUser) return;

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Chưa đăng nhập hoặc phiên đăng nhập đã hết hạn");
      return;
    }

    // Đang active -> gọi /lock, đang inactive -> gọi /unlock
    const isActive = selectedUser.status === "active";

    const url = `${API_BASE_URL}/api/v1/admin/users/${encodeURIComponent(
      selectedUser.email
    )}/${isActive ? "lock" : "unlock"}`;

    try {
      setTogglingStatus(true);

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(
          err.message || "Cập nhật trạng thái tài khoản thất bại"
        );
      }

      const data = await res.json(); // UserResponse từ BE

      // ===== Lấy locked / deactivated từ BE =====
      const locked =
        data.locked === true || data.locked === 1 || data.locked === "1";

      const deactivatedRaw = data.deactivated ?? data.deactived;
      const deactivated =
        deactivatedRaw === true ||
        deactivatedRaw === 1 ||
        deactivatedRaw === "1";

      // ===== Tính status + statusLabel giống mapping ban đầu =====
      let newStatus: "active" | "inactive" = "active";
      let newStatusLabel = "Hoạt động";

      if (locked || deactivated) {
        newStatus = "inactive";
        newStatusLabel = locked ? "Bị Admin chặn" : "Người dùng khóa tài khoản";
      }

      // Cập nhật list users
      setUsers((prev) =>
        prev.map((u) =>
          u.id === data.id
            ? {
                ...u,
                status: newStatus,
                statusLabel: newStatusLabel,
                locked,
                deactivated,
              }
            : u
        )
      );

      // Cập nhật selectedUser (nếu đang mở modal)
      setSelectedUser((prev) =>
        prev && prev.id === data.id
          ? {
              ...prev,
              status: newStatus,
              statusLabel: newStatusLabel,
              locked,
              deactivated,
            }
          : prev
      );

      // Thông báo
      if (newStatus === "active") {
        toast.success(
          `Đã kích hoạt tài khoản: ${data.fullName || selectedUser.name}`
        );
      } else if (locked) {
        toast.warning(
          `Đã chặn tài khoản: ${data.fullName || selectedUser.name}`
        );
      } else {
        // Trường hợp chỉ deactivated = true
        toast.info(
          `Tài khoản hiện không hoạt động: ${newStatusLabel} (${
            data.fullName || selectedUser.name
          })`
        );
      }

      setIsToggleStatusModalOpen(false);
    } catch (e: any) {
      toast.error(
        e.message || "Có lỗi xảy ra khi cập nhật trạng thái tài khoản"
      );
    } finally {
      setTogglingStatus(false);
    }
  };

  const handleEdit = (user: UserItem) => {
    setSelectedUser(user);
    setEditForm({
      fullName: user.name,
      unit: user.unit || "",
      email: user.email,
    });
    setIsEditModalOpen(true);
  };
  const handleSubmitEdit = async () => {
    if (!selectedUser) return;

    try {
      setSavingEdit(true);
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API_BASE_URL}/api/v1/admin/users/update/${encodeURIComponent(
          selectedUser.email
        )}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            fullName: editForm.fullName.trim(),
            unit: editForm.unit,
          }), // khớp với UpdateUserRequest
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Cập nhật người dùng thất bại");
      }

      const data = await res.json(); // UserResponse

      // ✅ cập nhật lại list users trong FE
      setUsers((prev) =>
        prev.map((u) =>
          u.id === data.id
            ? {
                ...u,
                name: data.fullName ?? u.name,
                unit: data.unit ?? u.unit,
              }
            : u
        )
      );

      toast.success("Cập nhật người dùng thành công!");
      setIsEditModalOpen(false);
    } catch (e: any) {
      toast.error(e.message || "Có lỗi xảy ra khi cập nhật");
    } finally {
      setSavingEdit(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const fetchUsers = async () => {
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

          const isLocked = u.locked === true || u.locked === 1;
          const isDeactivated = u.deactivated === true || u.deactivated === 1;

          let status: "active" | "inactive" = "active";
          let statusLabel = "Hoạt động";

          if (isLocked || isDeactivated) {
            status = "inactive";
            statusLabel = isLocked
              ? "Bị Admin chặn"
              : "Người dùng khóa tài khoản";
          }

          return {
            id: u.id,
            name: u.fullName ?? "No name",
            email: u.email,
            role: u.roles?.includes("ROLE_ADMIN") ? "ROLE_ADMIN" : "ROLE_USER",
            unit: u.unit ?? "Không rõ",

            status,
            statusLabel,
            locked: isLocked,
            deactivated: isDeactivated,

            devices: u.deviceCount ?? u.devicesCount ?? 0,
            joinDate,
            enabled: u.enabled ?? null,
            activationDate: u.enabled ? joinDate : "Chưa kích hoạt",
            lastActive: u.lastActive
              ? new Date(u.lastActive).toLocaleString("vi-VN")
              : "Chưa ghi nhận",
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

    fetchUsers();
  }, [page, size]);

  useEffect(() => {
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

        if (!res.ok) {
          console.error(
            "Fetch /api/v1/admin/users/statistics failed:",
            res.status
          );
          throw new Error("Failed to fetch stats");
        }

        const data: UserStats = await res.json();
        console.log("User statistics:", data);
        setStats(data);
      } catch (error) {
        console.error("Error loading stats", error);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, []); // gọi 1 lần khi load trang

  const totalUsers = stats?.totalUsers ?? 0;
  const activeUsers = stats?.activeUsers ?? 0;
  // tạm tính inactive = tổng - active
  const inactiveUsers = stats ? stats.totalUsers - stats.activeUsers : 0;
  const newUsersToday = stats?.newUsersToday ?? 0;

  // mỗi lần đổi search / role thì về trang 1
  useEffect(() => {
    setPage(0);
  }, [searchTerm, selectedRole, size]);
  const filteredUsers = users.filter((u) => {
    // lọc theo role
    if (selectedRole !== "all" && u.role !== selectedRole) {
      return false;
    }

    // lọc theo search (tên hoặc email)
    if (searchTerm.trim()) {
      const keyword = searchTerm.toLowerCase();
      return (
        u.name.toLowerCase().includes(keyword) ||
        u.email.toLowerCase().includes(keyword)
      );
    }

    return true;
  });

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
          <h1 className="text-3xl text-gray-900 mb-2">Quản lý User</h1>
          <p className="text-gray-600">
            Quản lý người dùng và phân quyền trong hệ thống
          </p>
        </div>
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleExport}
            className="px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-green-600 hover:text-green-600 transition-all flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            Xuất Excel
          </motion.button>

          <motion.button
            onClick={() => setIsAddUserModalOpen(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-gradient-to-r from-red-700 to-red-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Thêm User
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
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-blue-600">Tổng User</p>
            <p className="text-xl font-semibold text-blue-600">
              {" "}
              {loadingStats ? "…" : totalUsers.toLocaleString("vi-VN")}
            </p>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="flex items-center gap-4 bg-white p-4 border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all"
        >
          <div className="p-3 bg-green-50 rounded-lg">
            <UserCheck2 className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Đang hoạt động</p>
            <p className="text-xl font-semibold text-green-600">
              {" "}
              {loadingStats ? "…" : activeUsers.toLocaleString("vi-VN")}
            </p>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="flex items-center gap-4 bg-white p-4 border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all"
        >
          <div className="p-3 bg-red-100 rounded-lg">
            <UserX className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <p className="text-sm text-red-600">Chưa kích hoạt</p>
            <p className="text-xl font-semibold text-red-600">
              {" "}
              {loadingStats ? "…" : inactiveUsers.toLocaleString("vi-VN")}
            </p>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="flex items-center gap-4 bg-white p-4 border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all"
        >
          <div className="p-3 bg-gray-100 rounded-lg">
            <TrendingUp className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-purple-600">Người dùng mới hôm nay</p>
            <p className="text-xl font-semibold text-purple-600">
              {" "}
              {loadingStats ? "…" : newUsersToday.toLocaleString("vi-VN")}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm"
      >
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên hoặc email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-600 focus:outline-none transition-colors"
            />
          </div>

          {/* Role Filter */}
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="pl-12 pr-8 py-3 border-2 border-gray-200 rounded-xl focus:border-red-600 focus:outline-none transition-colors appearance-none bg-white"
            >
              <option value="all">Tất cả vai trò</option>
              <option value="ROLE_ADMIN">Admin</option>
              <option value="ROLE_USER">User</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {/* Thanh trên: chọn số bản ghi mỗi trang */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <span>Hiển thị mỗi trang:</span>
            <select
              value={size}
              onChange={(e) => {
                setSize(Number(e.target.value));
                setPage(0); // ⚠️ backend page bắt đầu từ 0
              }}
              className="border border-gray-300 rounded-lg px-2 py-1 text-sm"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        {/* Bảng */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm text-gray-600">
                  Người dùng
                </th>
                <th className="px-6 py-4 text-left text-sm text-gray-600">
                  ID
                </th>
                <th className="px-6 py-4 text-left text-sm text-gray-600">
                  Vai trò
                </th>
                <th className="px-6 py-4 text-left text-sm text-gray-600">
                  Khoa
                </th>
                <th className="px-6 py-4 text-left text-sm text-gray-600">
                  Trạng thái
                </th>
                <th className="px-6 py-4 text-left text-sm text-gray-600">
                  Thiết bị
                </th>
                <th className="px-6 py-4 text-left text-sm text-gray-600">
                  Ngày tham gia
                </th>
                <th className="px-6 py-4 text-left text-sm text-gray-600">
                  Ngày kích hoạt
                </th>
                <th className="px-6 py-4 text-right text-sm text-gray-600">
                  Thao tác
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {users.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="px-6 py-6 text-center text-gray-500"
                  >
                    Không có người dùng nào.
                  </td>
                </tr>
              )}

              {filteredUsers.map((user, idx) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.25,
                    delay: Math.min(0.03 * idx, 0.3),
                  }}
                  className="hover:bg-gray-50 transition-all cursor-pointer"
                >
                  {/* Người dùng */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        transition={{ type: "spring", stiffness: 300 }}
                        className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center shadow"
                      >
                        <span className="text-white text-sm">
                          {user.name.charAt(0)}
                        </span>
                      </motion.div>
                      <div>
                        <p className="text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* ID */}
                  <td className="px-6 py-4 text-gray-700 font-mono">
                    {user.id}
                  </td>

                  {/* Vai trò */}
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs ${
                        user.role === "ROLE_ADMIN"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>

                  {/* Khoa */}
                  <td className="px-6 py-4 text-gray-700">{user.unit}</td>

                  {/* Trạng thái */}
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        {user.status === "active" ? (
                          <>
                            <UserCheck className="w-4 h-4 text-green-600" />
                            <span className="text-sm text-green-600">
                              Hoạt động
                            </span>
                          </>
                        ) : (
                          <>
                            <UserX className="w-4 h-4 text-red-600" />
                            <span className="text-sm text-red-600">
                              Không hoạt động
                            </span>
                          </>
                        )}
                      </div>

                      {user.status === "inactive" && (
                        <span className="text-xs text-gray-500 mt-1">
                          {user.statusLabel}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Thiết bị */}
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-900">
                      {user.devices} thiết bị
                    </p>
                  </td>

                  {/* Ngày tham gia */}
                  <td className="px-6 py-4">
                    <span className="text-gray-600">{user.joinDate}</span>
                  </td>

                  {/* Ngày kích hoạt */}
                  <td className="px-6 py-4 text-gray-600">
                    {user.activationDate}
                  </td>

                  {/* Thao tác */}
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleViewDetails(user)}
                        className="p-2 hover:bg-green-50 rounded-lg text-green-600 transition-colors"
                        title="Xem chi tiết"
                      >
                        <Eye className="w-4 h-4" />
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleEdit(user)}
                        className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Edit className="w-4 h-4" />
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleChangeRole(user)}
                        className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors"
                        title="Thay đổi vai trò"
                      >
                        <Shield className="w-4 h-4" />
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleToggleStatus(user)}
                        className={`p-2 rounded-lg transition-colors ${
                          user.status === "active"
                            ? "hover:bg-red-50 text-red-600"
                            : "hover:bg-green-50 text-green-600"
                        }`}
                        title={user.status === "active" ? "Chặn" : "Kích hoạt"}
                      >
                        {user.status === "active" ? (
                          <Ban className="w-4 h-4" />
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between text-sm text-gray-700">
            <p>
              Trang {page + 1} / {totalPages} — Tổng {totalElements} người dùng
            </p>

            <div className="flex items-center gap-1">
              {/* Prev */}
              <button
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="px-3 py-1 rounded-md border disabled:opacity-40"
              >
                Trước
              </button>

              {/* Page numbers + ... */}
              {(() => {
                const arr: (number | string)[] = [];

                if (totalPages <= 5) {
                  // ít trang → hiển thị hết
                  for (let i = 0; i < totalPages; i++) arr.push(i);
                } else {
                  arr.push(0); // trang đầu

                  if (page > 2) arr.push("...");

                  const middle = [page - 1, page, page + 1].filter(
                    (p) => p > 0 && p < totalPages - 1
                  );
                  arr.push(...middle);

                  if (page < totalPages - 3) arr.push("...");

                  arr.push(totalPages - 1); // trang cuối
                }

                return arr.map((p, i) =>
                  p === "..." ? (
                    <span key={i} className="px-2 text-gray-400">
                      ...
                    </span>
                  ) : (
                    <button
                      key={i}
                      onClick={() => setPage(p as number)}
                      className={`px-3 py-1 rounded-md border ${
                        p === page
                          ? "bg-red-600 text-white border-red-600"
                          : "bg-white hover:bg-gray-50"
                      }`}
                    >
                      {(p as number) + 1}
                    </button>
                  )
                );
              })()}

              {/* Next */}
              <button
                disabled={page + 1 >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                className="px-3 py-1 rounded-md border disabled:opacity-40"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/*  modal xem chi tiết  */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Thông tin chi tiết người dùng"
        subtitle="Xem thông tin đầy đủ về tài khoản"
        icon={<Eye className="w-5 h-5 text-white" />}
        size="md"
      >
        {selectedUser && (
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border border-red-200">
              <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center">
                <span className="text-white text-xl">
                  {selectedUser.name.charAt(0)}
                </span>
              </div>
              <div>
                <h3 className="text-base text-gray-900">{selectedUser.name}</h3>
                <p className="text-xs text-gray-600">{selectedUser.email}</p>
              </div>
            </div>

            {/* Details Grid */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Thông tin tài khoản
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Key className="w-4 h-4 text-gray-500" />
                    <p className="text-[11px] text-gray-500">ID người dùng</p>
                  </div>
                  <p className="text-sm text-gray-900">{selectedUser.id}</p>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Shield className="w-4 h-4 text-gray-500" />
                    <p className="text-[11px] text-gray-500">Vai trò</p>
                  </div>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs ${
                      selectedUser.role === "ROLE_ADMIN"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {selectedUser.role}
                  </span>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Cpu className="w-4 h-4 text-gray-500" />
                    <p className="text-[11px] text-gray-500">Thiết bị</p>
                  </div>
                  <p className="text-sm text-gray-900">
                    {selectedUser.devices} thiết bị
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Book className="w-4 h-4 text-gray-500" />
                    <p className="text-[11px] text-gray-500">Khoa</p>
                  </div>
                  {selectedUser.unit === "CNTT" ? (
                    <>
                      <span className="text-sm text-gray-900">
                        Công nghệ thông tin
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-sm text-gray-900">
                        Điện tử viễn thông
                      </span>
                    </>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Hoạt động
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <p className="text-[11px] text-gray-500">Ngày tham gia</p>
                    </div>
                    <p className="text-sm text-gray-900">
                      {selectedUser.joinDate}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <p className="text-[11px] text-gray-500">
                        Ngày kích hoạt
                      </p>
                    </div>
                    <p className="text-sm text-gray-900">
                      {selectedUser.activationDate}
                    </p>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 md:col-span-2">
                    <div className="flex items-center gap-2 mb-1">
                      <Activity className="w-4 h-4 text-gray-500" />
                      <p className="text-[11px] text-gray-500">
                        Hoạt động gần nhất
                      </p>
                    </div>
                    <p className="text-sm text-gray-900">
                      {selectedUser.lastActive}
                    </p>
                  </div>
                </div>
              </div>
              {/* Status */}
              <div
                className={`p-3 rounded-lg border ${
                  selectedUser.status === "active"
                    ? "bg-green-50 border-green-200"
                    : "bg-red-50 border-red-200"
                }`}
              >
                <div className="flex items-center gap-2">
                  {selectedUser.status === "active" ? (
                    <>
                      <UserCheck className="w-5 h-5 text-green-600" />
                      <span className="text-sm text-green-700">
                        Tài khoản đang hoạt động
                      </span>
                    </>
                  ) : (
                    <>
                      <UserX className="w-5 h-5 text-red-600" />
                      <span className="text-sm text-red-700">
                        Tài khoản không hoạt động
                      </span>
                    </>
                  )}
                </div>

                {selectedUser.status === "inactive" && (
                  <p className="text-xs text-gray-600 mt-1">
                    {selectedUser.statusLabel}
                  </p>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                Đóng
              </button>
              <button
                onClick={() => {
                  setIsViewModalOpen(false);
                  handleEdit(selectedUser);
                }}
                className="px-4 py-2 bg-gradient-to-r from-red-700 to-red-600 text-white rounded-lg hover:shadow-lg transition-all text-sm flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Chỉnh sửa
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/*  MODAL sửa */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Chỉnh sửa thông tin người dùng"
        subtitle="Cập nhật thông tin tài khoản"
        icon={<Edit className="w-5 h-5 text-white" />}
        size="md"
        footer={
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              Hủy
            </button>
            <button
              onClick={handleSubmitEdit}
              disabled={savingEdit}
              className="px-4 py-2 bg-gradient-to-r from-red-700 to-red-600 text-white rounded-lg hover:shadow-lg transition-all text-sm flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {savingEdit ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        }
      >
        {selectedUser && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {/* Họ và tên */}
              <div>
                <label className="block text-xs text-gray-600 mb-1.5 font-medium">
                  Họ và tên
                </label>
                <input
                  type="text"
                  value={editForm.fullName}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      fullName: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:border-red-500 focus:ring-1 focus:ring-red-100 outline-none transition-all"
                />
              </div>

              {/* Email (không cho sửa) */}
              <div>
                <label className="block text-xs text-gray-600 mb-1.5 font-medium">
                  Email
                </label>
                <input
                  type="email"
                  value={editForm.email}
                  disabled
                  className="w-full px-3 py-2 text-sm bg-gray-100 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed"
                />
              </div>

              {/* Khoa / Phòng ban (dropdown enum) */}
              <div>
                <label className="block text-xs text-gray-600 mb-1.5 font-medium">
                  Khoa/Phòng ban
                </label>
                <select
                  value={editForm.unit}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, unit: e.target.value }))
                  }
                  className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:border-red-500 focus:ring-1 focus:ring-red-100 outline-none transition-all"
                >
                  <option value="">-- Chọn khoa / phòng ban --</option>
                  {UNIT_OPTIONS.map((u) => (
                    <option key={u.value} value={u.value}>
                      {u.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* RESET PASSWORD MODAL 
      <Modal
        isOpen={isResetPasswordModalOpen}
        onClose={() => setIsResetPasswordModalOpen(false)}
        title="Reset mật khẩu"
        subtitle="Tạo mật khẩu mới cho người dùng"
        icon={<Key className="w-5 h-5 text-white" />}
        size="sm"
      >
        {selectedUser && (
          <div className="space-y-4">
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">{selectedUser.name.charAt(0)}</span>
                </div>
                <div>
                  <p className="text-sm text-gray-900">{selectedUser.name}</p>
                  <p className="text-xs text-gray-600">{selectedUser.email}</p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1.5 font-medium">
                Mật khẩu mới
              </label>
              <input
                type="text"
                placeholder="Mật khẩu tự động: PTIT@2024xyz"
                className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:border-purple-500 focus:ring-1 focus:ring-purple-100 outline-none transition-all font-mono"
                readOnly
              />
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-800">
                💡 Mật khẩu mới sẽ được gửi qua email: <strong>{selectedUser.email}</strong>
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsResetPasswordModalOpen(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  alert(`Đã reset mật khẩu cho: ${selectedUser.name}`);
                  setIsResetPasswordModalOpen(false);
                }}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:shadow-lg transition-all text-sm flex items-center gap-2"
              >
                <Key className="w-4 h-4" />
                Reset mật khẩu
              </button>
            </div>
          </div>
        )}
      </Modal>*/}

      {/*modal thêm người dùng*/}
      <Modal
        icon={<Upload className="w-5 h-5 text-white" />}
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        title="Thêm người dùng"
        footer={
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setIsAddUserModalOpen(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              Hủy
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="space-y-4">
            {/* Instructions */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-sm text-blue-900 mb-2 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4" />
                Hướng dẫn import Excel
              </h4>
              <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
                <li>
                  - Tải file mẫu Excel gồm có các cột: Email, Họ tên, Đơn vị
                  Khoa, Vai trò (chức năng)
                </li>
                <li>
                  - Sau khi viết xong danh sách người dùng cần thêm, Save As để
                  chuyển định dạng .csv sang .xls, .xlsx
                </li>
                <li>- Mật khẩu sẽ được tự động tạo theo định dạng: 123456</li>
                <li>
                  - Thông báo tới người dùng để có thể đổi mật khẩu ngay sau khi
                  tạo
                </li>
              </ul>
            </div>
            {/* Import Excel section */}
            <div className="flex items-center justify-between gap-3 mt-3">
              <ImportUserButton
                onSuccess={() => {
                  setIsAddUserModalOpen(false); // đóng modal
                  setPage(0); // reload user list
                }}
              />
            </div>
          </div>
        </div>
      </Modal>
      {/* modal phân quyền */}
      <Modal
        isOpen={isChangeRoleModalOpen}
        onClose={() => setIsChangeRoleModalOpen(false)}
        title="Thay đổi vai trò"
        subtitle="Cập nhật quyền hạn người dùng"
        icon={<Shield className="w-5 h-5 text-white" />}
      >
        {selectedUser && (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">
                    {selectedUser.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-900">{selectedUser.name}</p>
                  <p className="text-xs text-gray-600">
                    Vai trò hiện tại:{" "}
                    <strong>
                      {selectedUser.role === "ROLE_ADMIN" ? "Admin" : "User"}
                    </strong>
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-2 font-medium">
                Chọn vai trò mới
              </label>
              <div className="space-y-2">
                {ROLE_OPTIONS.map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                      targetRole === opt.value
                        ? "border-red-500 bg-red-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={opt.value}
                      checked={targetRole === opt.value}
                      onChange={() => setTargetRole(opt.value)}
                      className="w-4 h-4 text-red-600"
                    />
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{opt.label}</p>
                      <p className="text-xs text-gray-500">
                        {opt.value === "ROLE_ADMIN" &&
                          "Toàn quyền quản trị hệ thống"}
                        {opt.value === "ROLE_USER" &&
                          "Quyền người dùng thông thường"}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsChangeRoleModalOpen(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmitChangeRole}
                disabled={changingRole}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-lg transition-all text-sm flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Shield className="w-4 h-4" />
                {changingRole ? "Đang cập nhật..." : "Cập nhật vai trò"}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL ban tài khoản */}
      <Modal
        isOpen={isToggleStatusModalOpen}
        onClose={() => setIsToggleStatusModalOpen(false)}
        title={
          selectedUser?.status === "active"
            ? "Chặn tài khoản"
            : "Kích hoạt tài khoản"
        }
        customWidth="max-w-[380px]"
      >
        {selectedUser && (
          <div className="space-y-4 text-center">
            <div
              className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center ${
                selectedUser.status === "active" ? "bg-red-100" : "bg-green-100"
              }`}
            >
              {selectedUser.status === "active" ? (
                <Ban className="w-8 h-8 text-red-600" />
              ) : (
                <CheckCircle className="w-8 h-8 text-green-600" />
              )}
            </div>

            <div>
              <p className="text-gray-700 mb-2">
                {selectedUser.status === "active"
                  ? "Bạn có chắc muốn chặn tài khoản:"
                  : "Bạn có chắc muốn Kích hoạt tài khoản:"}
              </p>
              <p className="text-gray-900 font-semibold">{selectedUser.name}</p>
            </div>

            <div
              className={`p-3 rounded-lg border ${
                selectedUser.status === "active"
                  ? "bg-yellow-50 border-yellow-200"
                  : "bg-blue-50 border-blue-200"
              }`}
            >
              <p
                className={`text-xs ${
                  selectedUser.status === "active"
                    ? "text-yellow-800"
                    : "text-blue-800"
                }`}
              >
                {selectedUser.status === "active"
                  ? "⚠️ Người dùng sẽ không thể đăng nhập và truy cập hệ thống"
                  : "✅ Người dùng sẽ có thể đăng nhập và sử dụng hệ thống trở lại"}
              </p>
            </div>

            <div className="flex justify-center gap-2 pt-2">
              <button
                onClick={() => setIsToggleStatusModalOpen(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmToggleStatus}
                disabled={togglingStatus}
                className={`px-4 py-2 text-white rounded-lg hover:shadow-lg transition-all text-sm flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed ${
                  selectedUser.status === "active"
                    ? "bg-gradient-to-r from-red-700 to-red-600"
                    : "bg-gradient-to-r from-green-600 to-green-700"
                }`}
              >
                {selectedUser.status === "active" ? (
                  <>
                    <Ban className="w-4 h-4" />
                    {togglingStatus ? "Đang chặn..." : "Chặn"}
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    {togglingStatus ? "Đang Kích hoạt..." : "Kích hoạt"}
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
