import React, { useState } from "react";
import { motion } from "motion/react";
import { Lock, Mail, Eye, EyeOff, User, Building } from "lucide-react";

type RegisterProps = {
  onNavigate: (view: string) => void;
  onRegister: () => void;
};

export default function RegisterPage({ onNavigate, onRegister }: RegisterProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    organization: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Giả lập đăng ký thành công
    onRegister();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center p-6">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 5, repeat: Infinity }}
          className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-red-600 to-red-800 rounded-full mix-blend-multiply filter blur-xl"
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 7, repeat: Infinity, delay: 1 }}
          className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-br from-red-400 to-red-600 rounded-full mix-blend-multiply filter blur-xl"
        />
      </div>

      <div className="relative w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left side - Branding */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden lg:block"
        >
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-gradient-to-br from-red-700 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                <div className="text-white text-xl tracking-wide" style={{ fontFamily: 'Arial Black, sans-serif' }}>
                  PTIT
                </div>
              </div>
              <div>
                <h1 className="text-3xl bg-gradient-to-r from-red-700 to-red-600 bg-clip-text text-transparent">
                  PTIT IoT Platform
                </h1>
                <p className="text-gray-600">Nền tảng IoT Việt Nam</p>
              </div>
            </div>

            <h2 className="text-4xl text-gray-900 mt-8">
              Bắt đầu hành trình IoT!
            </h2>
            <p className="text-xl text-gray-600">
              Tạo tài khoản để truy cập đầy đủ tính năng quản lý thiết bị IoT
            </p>

            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <span className="text-red-600">✓</span>
                </div>
                <p className="text-gray-600">Quản lý không giới hạn thiết bị</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <span className="text-red-600">✓</span>
                </div>
                <p className="text-gray-600">Phân tích dữ liệu thời gian thực</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <span className="text-red-600">✓</span>
                </div>
                <p className="text-gray-600">Miễn phí cho sinh viên PTIT</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right side - Register Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative"
        >
          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 border-2 border-red-100">
            <div className="mb-8">
              <h3 className="text-2xl text-gray-900 mb-2">Đăng ký tài khoản</h3>
              <p className="text-gray-600">Điền thông tin để tạo tài khoản</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name */}
              <div>
                <label className="block text-gray-700 mb-2">Họ và tên</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Nguyễn Văn A"
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-600 focus:outline-none transition-colors"
                    required
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
                    placeholder="email@ptit.edu.vn"
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-600 focus:outline-none transition-colors"
                    required
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
                    placeholder="Khoa Công nghệ Thông tin"
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-600 focus:outline-none transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-gray-700 mb-2">Mật khẩu</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:border-red-600 focus:outline-none transition-colors"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-gray-700 mb-2">Xác nhận mật khẩu</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-600 focus:outline-none transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Terms */}
              <label className="flex items-start gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 text-red-600 border-gray-300 rounded mt-1" required />
                <span className="text-sm text-gray-600">
                  Tôi đồng ý với{" "}
                  <button type="button" className="text-red-600 hover:text-red-700">
                    Điều khoản sử dụng
                  </button>{" "}
                  và{" "}
                  <button type="button" className="text-red-600 hover:text-red-700">
                    Chính sách bảo mật
                  </button>
                </span>
              </label>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-red-700 to-red-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                Đăng ký
              </motion.button>
            </form>

            {/* Login Link */}
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Đã có tài khoản?{" "}
                <button
                  onClick={() => onNavigate("login")}
                  className="text-red-600 hover:text-red-700"
                >
                  Đăng nhập
                </button>
              </p>
            </div>

            {/* Back to Home */}
            <div className="mt-4 text-center">
              <button
                onClick={() => onNavigate("landing")}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                ← Quay lại trang chủ
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
