import React, { useState } from "react";
import { motion } from "motion/react";
import { User, Mail, Building, Phone, MapPin, Calendar, Edit, Save, Camera } from "lucide-react";

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "Nguyễn Văn An",
    email: "an.nguyen@ptit.edu.vn",
    phone: "0123456789",
    organization: "Khoa Công nghệ Thông tin",
    location: "Hà Nội",
    joinDate: "15/01/2024",
  });

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
              {formData.name.charAt(0)}
            </div>
            {isEditing && (
              <button className="absolute bottom-0 right-0 w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-red-700 transition-colors">
                <Camera className="w-5 h-5" />
              </button>
            )}
          </div>
          
          <h2 className="text-2xl text-gray-900 mb-2">{formData.name}</h2>
          <p className="text-gray-600 mb-4">{formData.email}</p>
          
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-6">
            <Calendar className="w-4 h-4" />
            <span>Tham gia từ {formData.joinDate}</span>
          </div>

          <div className="space-y-3 pt-6 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Thiết bị</span>
              <span className="text-gray-900">12 thiết bị</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Dữ liệu</span>
              <span className="text-gray-900">2.4 GB</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Vai trò</span>
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">Admin</span>
            </div>
          </div>
        </motion.div>

        {/* Information Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-white rounded-2xl p-8 border border-gray-200"
        >
          <h3 className="text-xl text-gray-900 mb-6">Thông tin cá nhân</h3>
          
          <div className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-gray-700 mb-2">Họ và tên</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={!isEditing}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-600 focus:outline-none transition-colors disabled:bg-gray-50"
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
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={!isEditing}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-600 focus:outline-none transition-colors disabled:bg-gray-50"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-gray-700 mb-2">Số điện thoại</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  disabled={!isEditing}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-600 focus:outline-none transition-colors disabled:bg-gray-50"
                />
              </div>
            </div>

            {/* Organization */}
            <div>
              <label className="block text-gray-700 mb-2">Đơn vị / Khoa</label>
              <div className="relative">
                <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.organization}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  disabled={!isEditing}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-600 focus:outline-none transition-colors disabled:bg-gray-50"
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-gray-700 mb-2">Địa chỉ</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  disabled={!isEditing}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-600 focus:outline-none transition-colors disabled:bg-gray-50"
                />
              </div>
            </div>
          </div>

          {/* Change Password Section */}
          {!isEditing && (
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-xl text-gray-900 mb-4">Bảo mật</h3>
              <button className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-red-600 hover:text-red-600 transition-all">
                Đổi mật khẩu
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
