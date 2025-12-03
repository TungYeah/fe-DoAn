import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  Lock, User, Camera, Bell, Shield,
  Database, Trash2, Save, Eye, EyeOff, Building
} from "lucide-react";
import Toast from "../Toast";

export default function SettingsPage() {
  const [toastMessage, setToastMessage] = useState("");

  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
  });

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

  const [profileData, setProfileData] = useState({
    name: "",
    unit: "",
    email: "",
    avatar: "",
  });

  // Auto hide toast
  useEffect(() => {
    if (!toastMessage) return;
    const t = setTimeout(() => setToastMessage(""), 2500);
    return () => clearTimeout(t);
  }, [toastMessage]);


  // Load current profile
  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch("http://localhost:8080/api/v1/auth/current", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(user => {
        setProfileData({
          name: user.fullName,
          unit: user.unit,
          email: user.email,
          // 🔥 SỬA ĐÚNG: không thêm dấu "/" thừa !!!
          avatar: user.avatar ? `http://localhost:8080${user.avatar}` : ""
        });
      });

  }, []);

  // ===========================
  //  SAVE PROFILE
  // ===========================
  const handleSaveProfile = async () => {
    const token = localStorage.getItem("token");

    const formData = new FormData();
    formData.append("data", new Blob(
      [JSON.stringify({
        fullName: profileData.name,
        unitEnum: profileData.unit
      })],
      { type: "application/json" }
    ));

    const res = await fetch("http://localhost:8080/api/v1/auth/update", {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (res.ok) {
      setToastMessage("Cập nhật thành công!");
      setTimeout(() => window.location.reload(), 800);
    } else {
      alert("❌ Cập nhật thất bại!");
    }
  };


  // ===========================
  //  CHANGE PASSWORD
  // ===========================
  const handleChangePassword = async () => {
    if (passwordData.new !== passwordData.confirm) {
      alert("Mật khẩu xác nhận không khớp!");
      return;
    }

    const token = localStorage.getItem("token");

    const res = await fetch("http://localhost:8080/api/v1/auth/change-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        currentPassword: passwordData.current,
        newPassword: passwordData.new,
        confirmationPassword: passwordData.confirm,
      }),
    });

    if (res.ok) {
      setToastMessage("Đổi mật khẩu thành công!");
      setPasswordData({ current: "", new: "", confirm: "" });
    } else {
      const err = await res.json();
      alert("Lỗi: " + err.message);
    }
  };


  // ===========================
  //  UPLOAD AVATAR
  // ===========================
  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const token = localStorage.getItem("token");

    const formData = new FormData();
    formData.append("data", new Blob(
      [JSON.stringify({
        fullName: profileData.name,
        unitEnum: profileData.unit
      })],
      { type: "application/json" }
    ));
    formData.append("avatar", file);

    const res = await fetch("http://localhost:8080/api/v1/auth/update", {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (res.ok) {
      setToastMessage("Ảnh đại diện đã thay đổi!");
      setTimeout(() => window.location.reload(), 800);
    }
  };


  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT PANEL */}
        <div className="space-y-6">

          {/* Avatar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl p-6 border border-gray-200"
          >
            <h3 className="text-xl text-gray-900 mb-6">Ảnh đại diện</h3>

            <div className="flex flex-col items-center">
              <div className="relative mb-4">

                {profileData.avatar ? (
                  <img
                    src={profileData.avatar}
                    alt="avatar"
                    className="w-32 h-32 rounded-full object-cover border"
                  />
                ) : (
                  <div className="w-32 h-32 bg-gradient-to-br from-red-600 to-red-700
                    rounded-full flex items-center justify-center text-white text-4xl">
                    {profileData.name?.charAt(0)}
                  </div>
                )}

                <input
                  type="file"
                  id="avatarInput"
                  className="hidden"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                />

                <button
                  onClick={() => document.getElementById("avatarInput")?.click()}
                  className="absolute bottom-0 right-0 w-10 h-10 bg-red-600 rounded-full 
                    flex items-center justify-center text-white shadow-lg hover:bg-red-700"
                >
                  <Camera className="w-5 h-5" />
                </button>
              </div>

              <p className="text-gray-900 mb-1">{profileData.name}</p>
              <p className="text-sm text-gray-600">{profileData.email}</p>
            </div>
          </motion.div>


          {/* Profile Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl p-6 border border-gray-200"
          >
            <h3 className="text-xl text-gray-900 mb-4">Thông tin cá nhân</h3>

            <div className="space-y-4">

              <div>
                <label className="block mb-2 text-gray-700">Họ và tên</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) =>
                      setProfileData({ ...profileData, name: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-3 border-2 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-2 text-gray-700">Đơn vị / Khoa</label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <select
                    value={profileData.unit}
                    onChange={(e) =>
                      setProfileData({ ...profileData, unit: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-3 border-2 rounded-xl bg-white"
                  >
                    <option value="">-- Chọn khoa --</option>
                    <option value="CNTT">Công nghệ thông tin</option>
                    <option value="DTVT">Điện tử viễn thông</option>
                  </select>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSaveProfile}
                className="w-full py-3 bg-gradient-to-r from-red-700 to-red-600 text-white rounded-xl shadow-lg flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                Lưu thay đổi
              </motion.button>

            </div>
          </motion.div>
        </div>


        {/* RIGHT PANEL */}
        <div className="lg:col-span-2 space-y-6">

          {/* Change Password */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 border border-gray-200"
          >
            <div className="flex items-center gap-3 mb-6">
              <Lock className="w-6 h-6 text-red-600" />
              <h3 className="text-xl text-gray-900">Đổi mật khẩu</h3>
            </div>

            <div className="space-y-4">

              {/* Current password */}
              <div>
                <label className="block mb-2 text-gray-700">Mật khẩu hiện tại</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword.current ? "text" : "password"}
                    value={passwordData.current}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, current: e.target.value })
                    }
                    className="w-full pl-10 pr-12 py-3 border-2 rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword({ ...showPassword, current: !showPassword.current })
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showPassword.current ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </div>

              {/* New password */}
              <div>
                <label className="block mb-2 text-gray-700">Mật khẩu mới</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword.new ? "text" : "password"}
                    value={passwordData.new}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, new: e.target.value })
                    }
                    className="w-full pl-10 pr-12 py-3 border-2 rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword({ ...showPassword, new: !showPassword.new })
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showPassword.new ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </div>

              {/* Confirm */}
              <div>
                <label className="block mb-2 text-gray-700">Xác nhận mật khẩu</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword.confirm ? "text" : "password"}
                    value={passwordData.confirm}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, confirm: e.target.value })
                    }
                    className="w-full pl-10 pr-12 py-3 border-2 rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword({ ...showPassword, confirm: !showPassword.confirm })
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showPassword.confirm ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleChangePassword}
                className="w-full py-3 bg-gradient-to-r from-red-700 to-red-600 text-white rounded-xl shadow-lg flex items-center justify-center gap-2"
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
            className="bg-white rounded-2xl p-6 border border-gray-200"
          >
            <div className="flex items-center gap-3 mb-6">
              <Bell className="w-6 h-6 text-red-600" />
              <h3 className="text-xl text-gray-900">Thông báo</h3>
            </div>

            <div className="space-y-4">

              {/* Email */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="text-gray-900">Thông báo Email</p>
                  <p className="text-sm text-gray-600">Nhận thông báo qua email</p>
                </div>
                <button
                  onClick={() =>
                    setNotifications({ ...notifications, email: !notifications.email })
                  }
                  className={`relative w-14 h-8 rounded-full transition-colors 
                    ${notifications.email ? "bg-red-600" : "bg-gray-300"}`}
                >
                  <div
                    className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform
                      ${notifications.email ? "translate-x-7" : "translate-x-1"}`}
                  />
                </button>
              </div>

              {/* Push */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="text-gray-900">Thông báo đẩy</p>
                  <p className="text-sm text-gray-600">Nhận thông báo trực tiếp</p>
                </div>
                <button
                  onClick={() =>
                    setNotifications({ ...notifications, push: !notifications.push })
                  }
                  className={`relative w-14 h-8 rounded-full transition-colors 
                    ${notifications.push ? "bg-red-600" : "bg-gray-300"}`}
                >
                  <div
                    className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform
                      ${notifications.push ? "translate-x-7" : "translate-x-1"}`}
                  />
                </button>
              </div>

            </div>
          </motion.div>


          {/* Danger Zone */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 rounded-2xl p-6 border-2 border-red-200"
          >
            <div className="flex items-center gap-3 mb-4">
              <Trash2 className="w-6 h-6 text-red-600" />
              <h3 className="text-xl text-red-900">Vùng nguy hiểm</h3>
            </div>

            <p className="text-red-700 mb-4">
              Các hành động dưới đây không thể hoàn tác.
            </p>

            <div className="space-y-3">
              <button className="w-full px-6 py-3 bg-white border-2 border-red-300 text-red-600 rounded-xl hover:bg-red-50 flex items-center justify-center gap-2">
                <Database className="w-5 h-5" />
                Xóa tất cả dữ liệu
              </button>

              <button className="w-full px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 flex items-center justify-center gap-2">
                <Trash2 className="w-5 h-5" />
                Xóa tài khoản
              </button>
            </div>
          </motion.div>

        </div>
      </div>


      {/* Toast */}
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage("")} />
      )}
    </>
  );
}
