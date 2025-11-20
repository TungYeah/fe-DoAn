import React, { useState } from "react";
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
  User,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  ChevronDown,
  MessageCircle,
} from "lucide-react";

type DashboardLayoutProps = {
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  children: React.ReactNode;
};

export default function DashboardLayout({
  currentPage,
  onNavigate,
  onLogout,
  children,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

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
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50">
        <div className="h-full px-4 flex items-center justify-between">
          {/* Left */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-700 to-red-600 rounded-lg flex items-center justify-center">
                <div className="text-white text-sm tracking-wide" style={{ fontFamily: 'Arial Black, sans-serif' }}>
                  PTIT
                </div>
              </div>
              <div className="hidden md:block">
                <h1 className="bg-gradient-to-r from-red-700 to-red-600 bg-clip-text text-transparent">
                  PTIT IoT Platform
                </h1>
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-4">
            {/* Chat Icon */}
            <button
              onClick={() => onNavigate("chat")}
              className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <MessageCircle className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-green-600 rounded-full" />
            </button>

            {/* Notifications */}
            <button
              onClick={() => onNavigate("notifications")}
              className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-600 rounded-full" />
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm text-gray-900">Admin User</p>
                  <p className="text-xs text-gray-500">admin@ptit.edu.vn</p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-600" />
              </button>

              {/* Dropdown */}
              {userMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2"
                >
                  <button
                    onClick={() => {
                      onNavigate("profile");
                      setUserMenuOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3"
                  >
                    <User className="w-4 h-4 text-gray-600" />
                    <span className="text-gray-700">Hồ sơ cá nhân</span>
                  </button>
                  <button
                    onClick={() => {
                      onNavigate("settings");
                      setUserMenuOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3"
                  >
                    <Settings className="w-4 h-4 text-gray-600" />
                    <span className="text-gray-700">Cài đặt</span>
                  </button>
                  <hr className="my-2" />
                  <button
                    onClick={onLogout}
                    className="w-full px-4 py-2 text-left hover:bg-red-50 flex items-center gap-3 text-red-600"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Đăng xuất</span>
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-16 bottom-0 bg-white border-r border-gray-200 transition-all duration-300 z-40 ${
          sidebarOpen ? "w-64" : "w-0"
        } overflow-hidden`}
      >
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-red-700 to-red-600 text-white shadow-lg"
                    : "text-gray-700 hover:bg-red-50 hover:text-red-600"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="whitespace-nowrap">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main
        className={`pt-16 transition-all duration-300 ${
          sidebarOpen ? "ml-64" : "ml-0"
        }`}
      >
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}