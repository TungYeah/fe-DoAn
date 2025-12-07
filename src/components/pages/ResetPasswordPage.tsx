import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Lock } from "lucide-react";

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const token = params.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp!");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("http://localhost:8080/api/v1/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          newPassword,
          confirmationPassword: confirmPassword,
        }),
      });

      const text = await res.text();

      if (!res.ok) {
        setError(text);
      } else {
        setMessage(text);

        // ⏳ Tự động back về login sau 2 giây
        setTimeout(() => navigate("/login"), 2000);
      }

    } catch (err) {
      setError("Không thể kết nối đến server!");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center p-6">

      {/* BG EFFECT */}
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

      <div className="relative w-full max-w-xl">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="bg-white rounded-2xl shadow-2xl p-10 border-2 border-red-100">

            <h3 className="text-2xl text-gray-900 mb-2">Đặt lại mật khẩu</h3>
            <p className="text-gray-600 mb-8">
              Nhập mật khẩu mới của bạn bên dưới.
            </p>

            {!token && (
              <p className="text-red-600 text-center font-semibold">
                Token không hợp lệ hoặc đã hết hạn!
              </p>
            )}

            {token && (
              <form onSubmit={handleSubmit} className="space-y-6">

                {/* NEW PASSWORD */}
                <div>
                  <label className="block text-gray-700 mb-2">Mật khẩu mới</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Nhập mật khẩu mới"
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-600"
                      required
                    />
                  </div>
                </div>

                {/* CONFIRM PASSWORD */}
                <div>
                  <label className="block text-gray-700 mb-2">
                    Nhập lại mật khẩu
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Xác nhận mật khẩu"
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-600"
                      required
                    />
                  </div>
                </div>

                {/* SUBMIT BUTTON */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-red-700 to-red-600 text-white rounded-xl shadow-lg"
                >
                  {loading ? "Đang xử lý..." : "Xác nhận"}
                </motion.button>

                {error && (
                  <p className="text-red-600 text-center text-sm mt-3">{error}</p>
                )}
                {message && (
                  <p className="text-green-600 text-center text-sm mt-3">
                    {message} <br /> (Đang chuyển hướng về trang đăng nhập…)
                  </p>
                )}
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
