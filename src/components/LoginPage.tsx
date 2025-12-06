import React, { useState } from "react";
import { motion } from "motion/react";
import { Lock, Mail, Eye, EyeOff, AlertTriangle } from "lucide-react";

type LoginProps = {
  onNavigate: (view: string) => void;
  onLogin: () => void;
};

export default function LoginPage({ onNavigate, onLogin }: LoginProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [locked, setLocked] = useState(false);
  const [reactivateMessage, setReactivateMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLocked(false);
    setReactivateMessage("");

    try {
      const response = await fetch("http://localhost:8080/api/v1/auth/authenticate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      // ❌ LOGIN FAILED
      if (!response.ok) {
        const err = await response.json();

        // 🔥 IF ACCOUNT IS DEACTIVATED
        if (err.message?.includes("vô hiệu hóa")) {
          setLocked(true);
          setLoginError("❌ Tài khoản của bạn đã bị vô hiệu hóa!");
          return;
        }

        // Sai mật khẩu
        setLoginError("Email hoặc mật khẩu không đúng!");
        return;
      }

      // ✅ LOGIN SUCCESS
      const data = await response.json();
      const token = data.token;

      localStorage.setItem("token", token);

      // Lấy thông tin user sau login
      const userRes = await fetch("http://localhost:8080/api/v1/auth/current", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const user = await userRes.json();

      localStorage.setItem("fullName", user.fullName);
      localStorage.setItem("email", user.email);

      onLogin();
    } catch (err) {
      console.error(err);
      setLoginError("Không thể kết nối tới server!");
    }
  };

  // ==========================
  // 🔥 API GỬI YÊU CẦU KHÔI PHỤC
  // ==========================
  const handleRequestReactivation = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/v1/auth/request-reactivation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const msg = await res.text();
      setReactivateMessage(msg);
    } catch (err) {
      setReactivateMessage("Không thể gửi yêu cầu. Vui lòng thử lại!");
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

        {/* LEFT */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden lg:block"
        >
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-gradient-to-br from-red-700 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                <div className="text-white text-xl font-black">PTIT</div>
              </div>
              <div>
                <h1 className="text-3xl bg-gradient-to-r from-red-700 to-red-600 bg-clip-text text-transparent">
                  PTIT IoT Platform
                </h1>
                <p className="text-gray-600">Nền tảng IoT Việt Nam</p>
              </div>
            </div>

            <h2 className="text-4xl text-gray-900 mt-8">Chào mừng trở lại!</h2>
          </div>
        </motion.div>

        {/* RIGHT */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative"
        >
          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 border-2 border-red-100">

            {/* Title */}
            <div className="mb-8">
              <h3 className="text-2xl text-gray-900 mb-2">Đăng nhập</h3>
              <p className="text-gray-600">Nhập thông tin để tiếp tục</p>
            </div>

            {/* 🚫 Tài khoản bị khóa UI */}
            {locked && (
              <div className="border border-red-300 bg-red-50 text-red-700 p-4 rounded-xl mb-6 flex gap-3">
                <AlertTriangle className="w-6 h-6 text-red-600" />
                <div>
                  <p className="font-semibold">Tài khoản của bạn đã bị khóa</p>
                  <p className="text-sm">
                    Bạn có thể yêu cầu mở khóa tài khoản qua email đăng ký.
                  </p>

                  {/* nút khôi phục */}
                  <button
                    onClick={handleRequestReactivation}
                    className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Gửi yêu cầu khôi phục
                  </button>

                  {/* thông báo sau khi gửi */}
                  {reactivateMessage && (
                    <p className="mt-3 text-sm text-green-600">
                      {reactivateMessage}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Login form */}
            {!locked && (
              <form onSubmit={handleSubmit} className="space-y-6">

                {/* EMAIL */}
                <div>
                  <label className="block text-gray-700 mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@example.com"
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-600"
                      required
                    />
                  </div>
                </div>

                {/* PASSWORD */}
                <div>
                  <label className="block text-gray-700 mb-2">Mật khẩu</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:border-red-600"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff /> : <Eye />}
                    </button>
                  </div>
                </div>

                {/* LOGIN BUTTON */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-red-700 to-red-600 text-white rounded-xl shadow-lg"
                >
                  Đăng nhập
                </motion.button>

                {/* ERROR MESSAGE */}
                {loginError && (
                  <div className="mt-3 bg-red-500 text-white text-sm py-2 px-4 rounded-lg shadow-md">
                    {loginError}
                  </div>
                )}

              </form>
            )}

            {/* Navigation */}
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Chưa có tài khoản?
                <button onClick={() => onNavigate("register")} className="text-red-600 hover:text-red-700">
                  {" "}Đăng ký ngay
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
