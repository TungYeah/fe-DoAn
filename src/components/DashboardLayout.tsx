import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  LayoutDashboard,
  Users,
  Cpu,
  Upload,
  Database as DatabaseIcon,
  Search,
  DollarSign,
  BarChart3,
  User as UserIcon,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  ChevronDown,
  MessageCircle,
  Bot,
  History,
} from "lucide-react";

type DashboardLayoutProps = {
  currentPage: string;
  onNavigate: (v: string) => void;
  onLogout: () => void;
  children?: React.ReactNode;
};

// ===========================
// Avatar giống ProfilePage
// ===========================
const getAvatarUI = (avatar?: string | null) => {
  const src =
    avatar && avatar.trim() !== ""
      ? `http://localhost:8080${avatar}`
      : "/847969.png"; // ảnh mặc định trong public/

  return (
    <img
      src={src}
      className="w-8 h-8 rounded-full object-cover shrink-0 border border-gray-300"
      alt="avatar"
      onError={(e) => {
        (e.target as HTMLImageElement).src = "/847969.png";
      }}
    />
  );
};

export default function DashboardLayout({
  currentPage,
  onNavigate,
  onLogout,
  children,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const [userInfo, setUserInfo] = useState({
    fullName: "",
    email: "",
    avatar: "",
  });

  // ========================
  // Fetch current user
  // ========================
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return; // chưa login thì thôi

    fetch("http://localhost:8080/api/v1/auth/current", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((u) => {
        // cập nhật state
        setUserInfo({
          fullName: u.fullName || "",
          email: u.email || "",
          avatar: u.avatar || "", // path dạng "/uploads/avatars/img.png"
        });

        // nếu muốn xài chỗ khác thì lưu localStorage
        localStorage.setItem("fullName", u.fullName || "");
        localStorage.setItem("email", u.email || "");
      })
      .catch((err) => console.error("Get current user error:", err));
  }, []);

  const displayName =
    userInfo.fullName?.trim() !== "" ? userInfo.fullName : userInfo.email;

  const menuItems = [
    { id: "dashboard", label: "Tổng quan", icon: LayoutDashboard },
    { id: "users", label: "Quản lý User", icon: Users },
    { id: "devices", label: "Quản lý thiết bị", icon: Cpu },
    { id: "import-device", label: "Import thiết bị", icon: Upload },
    { id: "import-data", label: "Import dữ liệu", icon: DatabaseIcon },
    { id: "query", label: "Truy vấn", icon: Search },
    { id: "revenue", label: "Doanh thu", icon: DollarSign },
    { id: "charts", label: "Biểu đồ thiết bị", icon: BarChart3 },
    { id: "notifications", label: "Thông báo", icon: Bell },
    { id: "chat", label: "Chat", icon: MessageCircle },
    { id: "ai", label: "AI Assistant", icon: Bot },
    { id: "history", label: "Lịch sử", icon: History },

  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50">
        <div className="h-full px-4 flex items-center justify-between">
          {/* LEFT */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              {sidebarOpen ? <X /> : <Menu />}
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center text-white font-black">
                PTIT
              </div>
              <h1 className="hidden md:block text-transparent bg-gradient-to-r from-red-700 to-red-600 bg-clip-text">
                PTIT IoT Platform
              </h1>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-4">
            <MessageCircle
              className="w-5 h-5 text-gray-600 cursor-pointer"
              onClick={() => onNavigate("chat")}
            />

            <Bell
              className="w-5 h-5 text-gray-600 cursor-pointer"
              onClick={() => onNavigate("notifications")}
            />

            <div className="relative">
              {/* USER BUTTON */}
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg"
              >
                {/* Avatar */}
                {getAvatarUI(userInfo.avatar)}

                <div className="hidden md:block text-left">
                  <p className="text-sm">{displayName}</p>
                  <p className="text-xs text-gray-600">{userInfo.email}</p>
                </div>

                <ChevronDown className="w-4 h-4 text-gray-600" />
              </button>

              {/* Dropdown Menu */}
              {userMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border p-2"
                >
                  <button
                    onClick={() => {
                      onNavigate("profile");
                      setUserMenuOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex gap-3"
                  >
                    <UserIcon className="w-4 h-4" />
                    Hồ sơ cá nhân
                  </button>

                  <button
                    onClick={() => {
                      onNavigate("settings");
                      setUserMenuOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex gap-3"
                  >
                    <Settings className="w-4 h-4" />
                    Cài đặt
                  </button>

                  <hr className="my-2" />

                  <button
                    onClick={onLogout}
                    className="w-full px-4 py-2 text-left hover:bg-red-50 text-red-600 flex gap-3"
                  >
                    <LogOut className="w-4 h-4" />
                    Đăng xuất
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* SIDEBAR */}
      <aside
        className={`fixed left-0 top-16 bottom-0 bg-white border-r transition-all ${
          sidebarOpen ? "w-64" : "w-0"
        } overflow-hidden`}
      >
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${
                  currentPage === item.id
                    ? "bg-red-600 text-white shadow"
                    : "hover:bg-gray-100"
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* CONTENT */}
      <main className={`pt-16 ${sidebarOpen ? "ml-64" : "ml-0"}`}>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
