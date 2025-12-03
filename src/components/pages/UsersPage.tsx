import React, { useState, useEffect } from "react";
import { motion } from "motion/react";

import {
  Search,
  Plus,
  Edit,
  Trash2,
  Filter,
  MoreVertical,
  UserCheck,
  UserX,
  Download,
} from "lucide-react";

type UserItem = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "active" | "inactive";
  devices: number;
  joinDate: string;
};


type UserStats = {
  totalUsers: number;
  activeUsers: number;
  onlineUsers: number;
  newUsersToday: number;
};

const API_BASE_URL = "http://localhost:8080"; // chỉnh nếu BE dùng port khác

export default function UsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
const [loadingUsers, setLoadingUsers] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");

  const [stats, setStats] = useState<UserStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

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

        const mapped: UserItem[] = (data.content || []).map((u: any) => ({
          id: u.id,
          name: u.fullName ?? u.username ?? "No name",
          email: u.email,
          role:
            (u.roles && u.roles[0]) ||
            u.mainRole ||
            "User",
          status: u.locked || u.disabled ? "inactive" : "active",
          devices: u.devicesCount ?? 0,
          joinDate: u.createdAt
            ? new Date(u.createdAt).toLocaleDateString("vi-VN")
            : "",
        }));

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


  const handleExport = (format: "csv" | "excel" | "pdf") => {
    alert(`Đang xuất danh sách user dạng ${format.toUpperCase()}...`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
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
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Tổng User</p>
          <p className="text-2xl text-gray-900">
            {loadingStats ? "…" : totalUsers.toLocaleString("vi-VN")}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Đang hoạt động</p>
          <p className="text-2xl text-green-600">
            {loadingStats ? "…" : activeUsers.toLocaleString("vi-VN")}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Không hoạt động</p>
          <p className="text-2xl text-red-600">
            {loadingStats ? "…" : inactiveUsers.toLocaleString("vi-VN")}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Người dùng mới hôm nay</p>
          <p className="text-2xl text-blue-600">
            {loadingStats ? "…" : newUsersToday.toLocaleString("vi-VN")}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200">
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
              <option value="role_manager">Manager</option>
              <option value="role_user">User</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm text-gray-600">
                  Người dùng
                </th>
                <th className="px-6 py-4 text-left text-sm text-gray-600">
                  Vai trò
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
                <th className="px-6 py-4 text-right text-sm text-gray-600">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm">
                          {user.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs ${
                        user.role === "ROLE_ADMIN"
                          ? "bg-purple-100 text-purple-700"
                          : user.role === "ROLE_MANAGER"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
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
                  <td className="px-6 py-4">
                    <span className="text-gray-900">
                      {user.devices} thiết bị
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-600">{user.joinDate}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Hiển thị{" "}
            <span className="text-gray-900">1-{filteredUsers.length}</span> trong
            tổng số{" "}
            <span className="text-gray-900">
              {loadingStats ? "…" : totalUsers.toLocaleString("vi-VN")}
            </span>{" "}
            user
          </p>
          <div className="flex gap-2">
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              Trước
            </button>
            <button className="px-4 py-2 bg-red-600 text-white rounded-lg">
              1
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              2
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              3
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              Sau
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
