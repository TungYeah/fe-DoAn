import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  Moon, Sun, Globe, Lock, User, Camera, Bell, Shield, 
  Database, Trash2, Save, Eye, EyeOff, Check 
} from "lucide-react";

export default function SettingsPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState("vi");
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    deviceAlert: true,
    dataUpdate: false,
  });
  
  // Password change
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [passwordData, setPasswordData] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  // Profile
  const [profileData, setProfileData] = useState({
    name: "Nguyễn Văn An",
    displayName: "Admin User",
  });

  const handleSaveProfile = () => {
    alert("Đã lưu thông tin cá nhân!");
  };

  const handleChangePassword = () => {
    if (passwordData.new !== passwordData.confirm) {
      alert("Mật khẩu xác nhận không khớp!");
      return;
    }
    alert("Đã đổi mật khẩu thành công!");
    setPasswordData({ current: "", new: "", confirm: "" });
  };

  const handleAvatarChange = () => {
    alert("Chọn ảnh đại diện mới...");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl text-gray-900 mb-2">Cài đặt</h1>
        <p className="text-gray-600">Quản lý tài khoản và tùy chỉnh hệ thống</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Profile & Avatar */}
        <div className="space-y-6">
          {/* Avatar Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl p-6 border border-gray-200"
          >
            <h3 className="text-xl text-gray-900 mb-6">Ảnh đại diện</h3>
            <div className="flex flex-col items-center">
              <div className="relative mb-4">
                <div className="w-32 h-32 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center text-white text-4xl">
                  {profileData.name.charAt(0)}
                </div>
                <button
                  onClick={handleAvatarChange}
                  className="absolute bottom-0 right-0 w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-red-700 transition-colors"
                >
                  <Camera className="w-5 h-5" />
                </button>
              </div>
              <p className="text-gray-900 mb-1">{profileData.displayName}</p>
              <p className="text-sm text-gray-600">admin@ptit.edu.vn</p>
            </div>
          </motion.div>

          {/* Display Name */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 border border-gray-200"
          >
            <h3 className="text-xl text-gray-900 mb-4">Tên hiển thị</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">Tên đầy đủ</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-600 focus:outline-none transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Tên hiển thị</label>
                <input
                  type="text"
                  value={profileData.displayName}
                  onChange={(e) => setProfileData({ ...profileData, displayName: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-600 focus:outline-none transition-colors"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSaveProfile}
                className="w-full py-3 bg-gradient-to-r from-red-700 to-red-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                Lưu thay đổi
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Middle & Right Columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Appearance Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 border border-gray-200"
          >
            <h3 className="text-xl text-gray-900 mb-6">Giao diện</h3>
            <div className="space-y-4">
              {/* Dark Mode */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  {darkMode ? (
                    <Moon className="w-5 h-5 text-gray-700" />
                  ) : (
                    <Sun className="w-5 h-5 text-gray-700" />
                  )}
                  <div>
                    <p className="text-gray-900">Chế độ tối</p>
                    <p className="text-sm text-gray-600">Bật giao diện tối cho mắt</p>
                  </div>
                </div>
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className={`relative w-14 h-8 rounded-full transition-colors ${
                    darkMode ? "bg-red-600" : "bg-gray-300"
                  }`}
                >
                  <div
                    className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                      darkMode ? "translate-x-7" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* Language */}
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                  <Globe className="w-5 h-5 text-gray-700" />
                  <div>
                    <p className="text-gray-900">Ngôn ngữ</p>
                    <p className="text-sm text-gray-600">Chọn ngôn ngữ hiển thị</p>
                  </div>
                </div>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-600 focus:outline-none transition-colors"
                >
                  <option value="vi">Tiếng Việt</option>
                  <option value="en">English</option>
                  <option value="ja">日本語</option>
                  <option value="zh">中文</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Password Change */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 border border-gray-200"
          >
            <div className="flex items-center gap-3 mb-6">
              <Lock className="w-6 h-6 text-red-600" />
              <h3 className="text-xl text-gray-900">Đổi mật khẩu</h3>
            </div>
            <div className="space-y-4">
              {/* Current Password */}
              <div>
                <label className="block text-gray-700 mb-2">Mật khẩu hiện tại</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword.current ? "text" : "password"}
                    value={passwordData.current}
                    onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                    placeholder="Nhập mật khẩu hiện tại"
                    className="w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:border-red-600 focus:outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword({ ...showPassword, current: !showPassword.current })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-gray-700 mb-2">Mật khẩu mới</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword.new ? "text" : "password"}
                    value={passwordData.new}
                    onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                    placeholder="Nhập mật khẩu mới"
                    className="w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:border-red-600 focus:outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-gray-700 mb-2">Xác nhận mật khẩu mới</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword.confirm ? "text" : "password"}
                    value={passwordData.confirm}
                    onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                    placeholder="Nhập lại mật khẩu mới"
                    className="w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:border-red-600 focus:outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleChangePassword}
                className="w-full py-3 bg-gradient-to-r from-red-700 to-red-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
              >
                <Shield className="w-5 h-5" />
                Đổi mật khẩu
              </motion.button>
            </div>
          </motion.div>

          {/* Notifications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 border border-gray-200"
          >
            <div className="flex items-center gap-3 mb-6">
              <Bell className="w-6 h-6 text-red-600" />
              <h3 className="text-xl text-gray-900">Thông báo</h3>
            </div>
            <div className="space-y-4">
              {/* Email Notifications */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="text-gray-900">Thông báo Email</p>
                  <p className="text-sm text-gray-600">Nhận thông báo qua email</p>
                </div>
                <button
                  onClick={() => setNotifications({ ...notifications, email: !notifications.email })}
                  className={`relative w-14 h-8 rounded-full transition-colors ${
                    notifications.email ? "bg-red-600" : "bg-gray-300"
                  }`}
                >
                  <div
                    className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                      notifications.email ? "translate-x-7" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* Push Notifications */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="text-gray-900">Thông báo đẩy</p>
                  <p className="text-sm text-gray-600">Nhận thông báo trực tiếp</p>
                </div>
                <button
                  onClick={() => setNotifications({ ...notifications, push: !notifications.push })}
                  className={`relative w-14 h-8 rounded-full transition-colors ${
                    notifications.push ? "bg-red-600" : "bg-gray-300"
                  }`}
                >
                  <div
                    className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                      notifications.push ? "translate-x-7" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* Device Alerts */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="text-gray-900">Cảnh báo thiết bị</p>
                  <p className="text-sm text-gray-600">Cảnh báo khi thiết bị lỗi</p>
                </div>
                <button
                  onClick={() => setNotifications({ ...notifications, deviceAlert: !notifications.deviceAlert })}
                  className={`relative w-14 h-8 rounded-full transition-colors ${
                    notifications.deviceAlert ? "bg-red-600" : "bg-gray-300"
                  }`}
                >
                  <div
                    className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                      notifications.deviceAlert ? "translate-x-7" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* Data Updates */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="text-gray-900">Cập nhật dữ liệu</p>
                  <p className="text-sm text-gray-600">Thông báo khi có dữ liệu mới</p>
                </div>
                <button
                  onClick={() => setNotifications({ ...notifications, dataUpdate: !notifications.dataUpdate })}
                  className={`relative w-14 h-8 rounded-full transition-colors ${
                    notifications.dataUpdate ? "bg-red-600" : "bg-gray-300"
                  }`}
                >
                  <div
                    className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                      notifications.dataUpdate ? "translate-x-7" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Danger Zone */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-red-50 rounded-2xl p-6 border-2 border-red-200"
          >
            <div className="flex items-center gap-3 mb-4">
              <Trash2 className="w-6 h-6 text-red-600" />
              <h3 className="text-xl text-red-900">Vùng nguy hiểm</h3>
            </div>
            <p className="text-red-700 mb-4">
              Các hành động dưới đây không thể hoàn tác. Vui lòng cân nhắc kỹ trước khi thực hiện.
            </p>
            <div className="space-y-3">
              <button className="w-full px-6 py-3 bg-white border-2 border-red-300 text-red-600 rounded-xl hover:bg-red-50 transition-all flex items-center justify-center gap-2">
                <Database className="w-5 h-5" />
                Xóa tất cả dữ liệu
              </button>
              <button className="w-full px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all flex items-center justify-center gap-2">
                <Trash2 className="w-5 h-5" />
                Xóa tài khoản
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
