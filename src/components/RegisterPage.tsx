import React, { useState } from "react";
import { motion } from "motion/react";
import { Lock, Mail, Eye, EyeOff, User, Building } from "lucide-react";

type RegisterProps = {
  onNavigate: (view: string) => void;
  onRegister: () => void;
};

export default function RegisterPage({ onNavigate }: RegisterProps) {
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    organization: "",
    password: "",
    confirmPassword: "",
  });

  const [registerError, setRegisterError] = useState("");

  // =====================
  // SUBMIT REGISTER
  // =====================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setRegisterError("Mật khẩu và xác nhận mật khẩu không khớp!");
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          unit: formData.organization, // ENUM CNTT / DTVT
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setRegisterError(data.message || "Đăng ký thất bại!");
        return;
      }

      // Không lưu token – backend không trả token khi đăng ký
      alert(data.message || "Đăng ký thành công. Vui lòng kiểm tra email!");

      setRegisterError("");
      onNavigate("login"); // quay lại màn login

    } catch (error) {
      console.error(error);
      setRegisterError("Không thể kết nối tới server!");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center p-6">

      {/* Background */}
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
        
        {/* Left side giữ nguyên nếu muốn */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden lg:block"
        >
        </motion.div>

        {/* Right side */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 border-2 border-red-100">
            
            <div className="mb-8">
              <h3 className="text-2xl text-gray-900 mb-2">Đăng ký tài khoản</h3>
              <p className="text-gray-600">Điền thông tin để tạo tài khoản</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Full name */}
              <div>
                <label className="block text-gray-700 mb-2">Họ và tên</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Nguyễn Văn A"
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl"
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
                    placeholder="email@example.com"
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl"
                    required
                  />
                </div>
              </div>

              {/* Organization */}
              <div>
                <label className="block text-gray-700 mb-2">Đơn vị / Khoa</label>
                <div className="relative">
                  <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

                  <select
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl bg-white"
                    required
                  >
                    <option value="">-- Chọn khoa --</option>
                    <option value="CNTT">Khoa Công Nghệ Thông Tin</option>
                    <option value="DTVT">Khoa Điện Tử Viễn Thông</option>
                  </select>
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
                    className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </div>

              {/* Confirm password */}
              <div>
                <label className="block text-gray-700 mb-2">Xác nhận mật khẩu</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl"
                    required
                  />
                </div>
              </div>

              {/* Error */}
              {registerError && (
                <div className="bg-red-500 text-white text-sm py-2 px-4 rounded-lg shadow-md">
                  {registerError}
                </div>
              )}

              {/* Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-red-700 to-red-600 text-white rounded-xl shadow-lg"
              >
                Đăng ký
              </motion.button>
            </form>

            {/* Login link */}
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Đã có tài khoản?
                <button onClick={() => onNavigate("login")} className="text-red-600 hover:text-red-700">
                  {" "}Đăng nhập
                </button>
              </p>
            </div>

            <div className="mt-4 text-center">
              <button onClick={() => onNavigate("landing")} className="text-sm text-gray-500 hover:text-gray-700">
                ← Quay lại trang chủ
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
