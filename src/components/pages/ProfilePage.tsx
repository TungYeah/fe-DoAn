import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { User, Mail, Building, Calendar, Edit, Save, Camera } from "lucide-react";

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    id:"",
    username: "",
    email: "",
    unit: "",
    unitDescription: "",
    roles: [],
    createdAt: "",
  });

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch("http://localhost:8080/api/v1/auth/current", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await res.json();

        setFormData({
          id: data.id,
          username: data.username,
          email: data.email,
          unit: data.unit,
          unitDescription: data.unitDescription,
          roles: data.roles,
          createdAt: new Date(data.createdAt).toLocaleDateString("vi-VN"), 
        });

      } catch (error) {
        console.error("Error fetching current user:", error);
      }
    };

    fetchCurrentUser();
  }, []);

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-gray-900 mb-2">Hồ sơ cá nhân</h1>
          <p className="text-gray-600">Quản lý thông tin và cài đặt tài khoản</p>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsEditing(!isEditing)}
          className="px-6 py-3 bg-gradient-to-r from-red-700 to-red-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
        >
          {isEditing ? <Save className="w-5 h-5" /> : <Edit className="w-5 h-5" />}
          {isEditing ? "Lưu thay đổi" : "Chỉnh sửa"}
        </motion.button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-2xl p-8 border border-gray-200 text-center"
        >
          <div className="relative inline-block mb-6">
            <div className="w-32 h-32 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center text-white text-4xl">
              {formData.username.charAt(0).toUpperCase()}
            </div>
            {isEditing && (
              <button className="absolute bottom-0 right-0 w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-red-700 transition-colors">
                <Camera className="w-5 h-5" />
              </button>
            )}
          </div>

          <h2 className="text-2xl text-gray-900 mb-2">{formData.username}</h2>
          <p className="text-gray-600 mb-4">{formData.email}</p>

          <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-6">
            <Calendar className="w-4 h-4" />
            <span>Tham gia từ {formData.createdAt}</span>
          </div>

          <div className="space-y-3 pt-6 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Đơn vị</span>
              <span className="text-gray-900">{formData.unitDescription}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Vai trò</span>
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                {formData.roles[0] || "USER"}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-white rounded-2xl p-8 border border-gray-200"
        >
          <h3 className="text-xl text-gray-900 mb-6">Thông tin cá nhân</h3>

          <div className="space-y-6">
            {/* id */}
            <div>
              <label className="block text-gray-700 mb-2">ID người dùng: </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.id}
                  disabled
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl disabled:bg-gray-50"
                />
              </div>
            </div>
            {/* Username */}
            <div>
              <label className="block text-gray-700 mb-2">Tên tài khoản</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.username}
                  disabled
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl disabled:bg-gray-50"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-gray-700 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl disabled:bg-gray-50"
                />
              </div>
            </div>

            {/* Unit */}
            <div>
              <label className="block text-gray-700 mb-2">Đơn vị / Khoa</label>
              <div className="relative">
                <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.unitDescription}
                  disabled
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl disabled:bg-gray-50"
                />
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </div>
  );
}
