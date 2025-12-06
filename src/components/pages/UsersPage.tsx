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
} from "lucide-react";

type UserItem = {
  id: string;
  name: string;
  email: string;
  role: string;
  unit: string;
  status: "active" | "inactive";
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
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

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
      alert("Chưa đăng nhập hoặc hết phiên đăng nhập");
      return;
    }

    const currentIsAdmin = selectedUser.role === "ROLE_ADMIN";
    const wantAdmin = targetRole === "ROLE_ADMIN";

    // Nếu không thay đổi gì thì thôi
    if (currentIsAdmin === wantAdmin) {
      alert("Vai trò không thay đổi");
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

      alert(
        wantAdmin
          ? "Đã gán quyền Admin cho người dùng"
          : "Đã bỏ quyền Admin, người dùng trở lại quyền User"
      );
      setIsChangeRoleModalOpen(false);
    } catch (e: any) {
      alert(e.message || "Có lỗi xảy ra khi cập nhật vai trò");
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
      alert("Chưa đăng nhập hoặc phiên đăng nhập đã hết hạn");
      return;
    }

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

      // locked = true -> inactive, locked = false -> active
      const newStatus: "active" | "inactive" = data.locked
        ? "inactive"
        : "active";

      // Cập nhật list users trên bảng
      setUsers((prev) =>
        prev.map((u) =>
          u.id === data.id
            ? {
                ...u,
                status: newStatus,
              }
            : u
        )
      );

      // Cập nhật selectedUser (nếu modal đang mở)
      setSelectedUser((prev) =>
        prev && prev.id === data.id ? { ...prev, status: newStatus } : prev
      );

      alert(
        newStatus === "inactive"
          ? `Đã vô hiệu hóa tài khoản: ${data.fullName || selectedUser.name}`
          : `Đã kích hoạt tài khoản: ${data.fullName || selectedUser.name}`
      );

      setIsToggleStatusModalOpen(false);
    } catch (e: any) {
      alert(e.message || "Có lỗi xảy ra khi cập nhật trạng thái tài khoản");
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

      alert("Cập nhật người dùng thành công!");
      setIsEditModalOpen(false);
    } catch (e: any) {
      alert(e.message || "Có lỗi xảy ra khi cập nhật");
    } finally {
      setSavingEdit(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return; // chưa login thì thôi

    const fetchUsers = async () => {
      try {
        setLoadingUsers(true);

        const res = await fetch(
          `${API_BASE_URL}/api/v1/admin/users?page=0&size=10`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          console.error("Fetch /api/v1/admin/users failed:", res.status);
          throw new Error("Failed to fetch users");
        }

        const data = await res.json();
        console.log("Users page:", data);

        const mapped: UserItem[] = (data.content || []).map((u: any) => {
          const joinDate = u.createdAt
            ? new Date(u.createdAt).toLocaleString("vi-VN")
            : "";

          // ✅ Tính ngày/ trạng thái kích hoạt theo enabled
          let activationDate = "Chưa kích hoạt";

          if (u.enabled === true || u.enabled === 1) {
            activationDate = joinDate || "Đã kích hoạt";
          } else if (u.enabled === false || u.enabled === 0) {
            activationDate = "Chưa xác thực";
          } else if (u.enabled == null) {
            activationDate = "Chưa xác thực";
          }

          // ✅ Ưu tiên ROLE_ADMIN nếu user có nhiều role
          const roles: string[] = u.roles || [];
          let mainRole: string = "ROLE_USER";

          if (roles.includes("ROLE_ADMIN")) {
            mainRole = "ROLE_ADMIN";
          } else if (roles.includes("ROLE_USER")) {
            mainRole = "ROLE_USER";
          } else if (u.mainRole) {
            mainRole = u.mainRole;
          }

          return {
            id: u.id,
            name: u.fullName ?? u.username ?? "No name",
            email: u.email,
            role: mainRole, // 👈 dùng role đã tính
            unit: u.unit ?? "Không rõ",
            status: u.locked || u.disabled ? "inactive" : "active",
            devices: u.devicesCount ?? 0,
            joinDate,
            enabled: u.enabled ?? null,
            activationDate,
            lastActive: u.last_active
              ? new Date(u.last_active).toLocaleString("vi-VN")
              : "Chưa ghi nhận",
          };
        });

        setUsers(mapped);
      } catch (err) {
        console.error("Error loading users", err);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []); // ⬅ không còn [token] nữa

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

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole =
      selectedRole === "all" ||
      user.role.toLowerCase() === selectedRole.toLowerCase();

    return matchesSearch && matchesRole;
  });
  // sau const filteredUsers = ...
  const totalRecords = filteredUsers.length;
  const totalPages = totalRecords === 0 ? 1 : Math.ceil(totalRecords / perPage);
  const startIndex = (page - 1) * perPage;
  const currentUsers = filteredUsers.slice(startIndex, startIndex + perPage);

  // mỗi lần đổi search / role thì về trang 1
  useEffect(() => {
    setPage(1);
  }, [searchTerm, selectedRole]);

  const handleExport = (format: "csv" | "excel" | "pdf") => {
    alert(`Đang xuất danh sách user dạng ${format.toUpperCase()}...`);
  };

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
            onClick={() => handleExport("excel")}
            className="px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-red-600 hover:text-red-600 transition-all flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            Xuất Excel
          </motion.button>
          <motion.button
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
          className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all"
        >
          <p className="text-sm text-gray-600 mb-1">Tổng User</p>
          <p className="text-2xl text-gray-900">
            {loadingStats ? "…" : totalUsers.toLocaleString("vi-VN")}
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all"
        >
          <p className="text-sm text-gray-600 mb-1">Đang hoạt động</p>
          <p className="text-2xl text-green-600">
            {loadingStats ? "…" : activeUsers.toLocaleString("vi-VN")}
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all"
        >
          <p className="text-sm text-gray-600 mb-1">Chưa kích hoạt</p>
          <p className="text-2xl text-red-600">
            {loadingStats ? "…" : inactiveUsers.toLocaleString("vi-VN")}
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all"
        >
          <p className="text-sm text-gray-600 mb-1">Người dùng mới hôm nay</p>
          <p className="text-2xl text-blue-600">
            {loadingStats ? "…" : newUsersToday.toLocaleString("vi-VN")}
          </p>
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
              <option value="role_admin">Admin</option>
              <option value="role_user">User</option>
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
            người dùng
          </p>
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
              {currentUsers.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="px-6 py-6 text-center text-gray-500"
                  >
                    Không có người dùng nào.
                  </td>
                </tr>
              )}

              {currentUsers.map((user, idx) => (
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
                  </td>

                  {/* Thiết bị */}
                  <td className="px-6 py-4">
                    <span className="text-gray-900">
                      {user.devices} thiết bị
                    </span>
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
                        title={
                          user.status === "active" ? "Vô hiệu hóa" : "Kích hoạt"
                        }
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
        {totalRecords > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3 text-sm text-gray-700">
            <p>
              Trang {page} / {totalPages} — Hiển thị {startIndex + 1}–
              {Math.min(startIndex + perPage, totalRecords)} / {totalRecords}{" "}
              người dùng
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

              {/* Page numbers */}
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
                      selectedUser.role === "Admin"
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
            ? "Vô hiệu hóa tài khoản"
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
                  ? "Bạn có chắc muốn vô hiệu hóa tài khoản:"
                  : "Bạn có chắc muốn kích hoạt lại tài khoản:"}
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
              <p className="text-xs ${selectedUser.status === 'active' ? 'text-yellow-800' : 'text-blue-800'}">
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
                    {togglingStatus ? "Đang vô hiệu hóa..." : "Vô hiệu hóa"}
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    {togglingStatus ? "Đang kích hoạt..." : "Kích hoạt"}
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
