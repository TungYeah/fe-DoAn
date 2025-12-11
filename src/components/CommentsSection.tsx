import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Lock, Mail, Eye, EyeOff, AlertTriangle, Wifi } from "lucide-react";
import { useSearchParams } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

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
  const [loadingRestore, setLoadingRestore] = useState(false);

  // Forgot/reset mode
  const [isForgot, setIsForgot] = useState(false);
  const [isResetPassword, setIsResetPassword] = useState(false);

  // Forgot fields
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotMessage, setForgotMessage] = useState("");
  const [forgotError, setForgotError] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  // Reset fields
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [resetMsg, setResetMsg] = useState("");

  const [params] = useSearchParams();

  // ======================
  // CHECK RESET TOKEN
  // ======================
  useEffect(() => {
    const t = params.get("token");
    if (t) {
      setResetToken(t);
      setIsResetPassword(true);
      setIsForgot(false);
    }
  }, [params]);

  // ======================
  // FORGOT PASSWORD
  // ======================
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotMessage("");
    setForgotError("");

    try {
      setForgotLoading(true);

      const res = await fetch(`${API_BASE}/api/v1/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });

      if (!res.ok) {
        const err = await res.json();
        setForgotError(err.message || "Email không tồn tại!");
      } else {
        const msg = await res.text();
        setForgotMessage(msg);
      }
    } catch (err) {
      setForgotError("Không thể kết nối đến server!");
    }

    setForgotLoading(false);
  };

  // ======================
  // RESET PASSWORD
  // ======================
  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetMsg("");

    if (newPass !== confirmPass) {
      setResetMsg("Mật khẩu xác nhận không khớp!");
      return;
    }

    const res = await fetch(`${API_BASE}/api/v1/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: resetToken,
        newPassword: newPass,
        confirmationPassword: confirmPass,
      }),
    });

    const txt = await res.text();
    setResetMsg(txt);

    if (res.ok) {
      setTimeout(() => setIsResetPassword(false), 2000);
    }
  };

  // ======================
  // LOGIN
  // ======================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLocked(false);
    setReactivateMessage("");

    try {
      const response = await fetch(`${API_BASE}/api/v1/auth/authenticate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const err = !response.ok ? await response.json() : null;

      if (err) {
        if (err.code === 1005 || err.message?.includes("vô hiệu hóa")) {
          setLocked(true);
          setLoginError(err.message || "Tài khoản đã bị vô hiệu hóa!");
          return;
        }
        if (
          err.message?.toLowerCase().includes("bị admin khóa") ||
          err.code === 2001 ||
          err.message?.toLowerCase().includes("locked")
        ) {
          setLocked(true);
          setLoginError(
            "Tài khoản của bạn đã bị quản trị viên chặn và không thể đăng nhập."
          );
          return;
        }
        if (err.code === 1006 || err.message?.includes("chưa kích hoạt")) {
          setLoginError(err.message || "Tài khoản chưa kích hoạt. Kiểm tra email!");
          return;
        }

        setLoginError(err.message || "Email hoặc mật khẩu không đúng!");
        return;
      }

      const data = await response.json();
      const token = data.token;

      localStorage.setItem("token", token);

      const userRes = await fetch(`${API_BASE}/api/v1/auth/current`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const user = await userRes.json();

      localStorage.setItem("fullName", user.fullName);
      localStorage.setItem("email", user.email);

      onLogin();
    } catch (error) {
      setLoginError("Không thể kết nối tới server!");
    }
  };

  // ======================
  // YÊU CẦU KÍCH HOẠT LẠI
  // ======================
  const handleRequestReactivation = async () => {
    setLoadingRestore(true);
    setReactivateMessage("");

    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/request-reactivation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const msg = await res.text();
      setReactivateMessage(msg);
    } catch {
      setReactivateMessage("Không thể gửi yêu cầu. Vui lòng thử lại!");
    }

    setLoadingRestore(false);
  };

  // ======================
  // UI
  // ======================
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
                <div
                  className="text-white text-xl tracking-wide"
                  style={{ fontFamily: "Arial Black, sans-serif" }}
                >
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

            <h2 className="text-4xl text-gray-900 mt-8">Chào mừng trở lại!</h2>
            <p className="text-xl text-gray-600">
              Đăng nhập để quản lý thiết bị IoT và thu thập dữ liệu của bạn
            </p>

            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <Wifi className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-gray-900">Kết nối thiết bị</p>
                  <p className="text-sm text-gray-600">
                    Quản lý hàng trăm thiết bị IoT
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* RIGHT SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 border-2 border-red-100">
            {/* RESET PASSWORD */}
            {isResetPassword && (
              <>
                <h3 className="text-2xl text-gray-900 mb-2">Đặt lại mật khẩu</h3>
                <p className="text-gray-600 mb-6">
                  Nhập mật khẩu mới cho tài khoản của bạn.
                </p>

                <form onSubmit={handleResetSubmit} className="space-y-6">
                  <div>
                    <label className="block text-gray-700 mb-2">
                      Mật khẩu mới
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="password"
                        value={newPass}
                        onChange={(e) => setNewPass(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-600"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2">
                      Nhập lại mật khẩu
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="password"
                        value={confirmPass}
                        onChange={(e) => setConfirmPass(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-600"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-red-700 to-red-600 text-white rounded-xl shadow-lg"
                  >
                    Xác nhận
                  </button>

                  {resetMsg && (
                    <p className="text-center mt-3 text-green-600">{resetMsg}</p>
                  )}
                </form>

                <div className="mt-4 text-center">
                  <button
                    onClick={() => setIsResetPassword(false)}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    ← Quay lại đăng nhập
                  </button>
                </div>
              </>
            )}

            {/* ============================== */}
            {/* FORGOT PASSWORD */}
            {/* ============================== */}
            {!isResetPassword && isForgot && (
              <>
                <h3 className="text-2xl text-gray-900 mb-2">Quên mật khẩu</h3>
                <p className="text-gray-600 mb-6">
                  Nhập email để nhận liên kết đặt lại mật khẩu.
                </p>

                <form onSubmit={handleForgotSubmit} className="space-y-6">
                  <div>
                    <label className="block text-gray-700 mb-2">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="email@example.com"
                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-600"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-red-700 to-red-600 text-white rounded-xl shadow-lg"
                    disabled={forgotLoading}
                  >
                    {forgotLoading ? "Đang gửi..." : "Gửi liên kết đặt lại mật khẩu"}
                  </button>

                  {forgotMessage && (
                    <p className="text-green-600 text-sm">{forgotMessage}</p>
                  )}
                  {forgotError && (
                    <p className="text-red-600 text-sm">{forgotError}</p>
                  )}
                </form>

                <div className="mt-4 text-center">
                  <button
                    onClick={() => setIsForgot(false)}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    ← Quay lại đăng nhập
                  </button>
                </div>
              </>
            )}

            {/* ============================== */}
            {/* LOGIN FORM */}
            {/* ============================== */}
            {!isForgot && !isResetPassword && (
              <>
                <h3 className="text-2xl text-gray-900 mb-2">Đăng nhập</h3>
                <p className="text-gray-600 mb-8">Nhập thông tin để tiếp tục</p>

                {locked && (
                  <div className="border border-red-300 bg-red-50 text-red-700 p-4 rounded-xl mb-6 flex gap-3">
                    <AlertTriangle className="w-6 h-6 text-red-600" />

                    <div>
                      <p className="font-semibold">Tài khoản của bạn đã bị khóa</p>
                      <p className="text-sm">
                        Bạn có thể yêu cầu mở khóa qua email đăng ký.
                      </p>

                      <button
                        onClick={handleRequestReactivation}
                        disabled={loadingRestore}
                        className={`mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 ${
                          loadingRestore ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                      >
                        {loadingRestore ? "Đang gửi..." : "Gửi yêu cầu khôi phục"}
                      </button>

                      {reactivateMessage && (
                        <p className="mt-3 text-sm text-green-600">
                          {reactivateMessage}
                        </p>
                      )}
                    </div>
                  </div>
                )}

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

                    {/* SUBMIT */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className="w-full py-3 bg-gradient-to-r from-red-700 to-red-600 text-white rounded-xl shadow-lg"
                    >
                      Đăng nhập
                    </motion.button>

                    {loginError && (
                      <div className="mt-3 bg-red-500 text-white text-sm py-2 px-4 rounded-lg shadow-md">
                        {loginError}
                      </div>
                    )}
                  </form>
                )}

                {/* REGISTER */}
                <div className="mt-6 text-center">
                  <p className="text-gray-600">
                    Chưa có tài khoản?
                    <button
                      onClick={() => onNavigate("register")}
                      className="text-red-600 hover:text-red-700 ml-1"
                    >
                      Đăng ký ngay
                    </button>
                  </p>
                </div>

                {/* FORGOT */}
                <div className="mt-3 text-center">
                  <button
                    onClick={() => setIsForgot(true)}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Quên mật khẩu?
                  </button>
                </div>

                {/* BACK TO LANDING */}
                <div className="mt-4 text-center">
                  <button
                    onClick={() => onNavigate("landing")}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    ← Quay lại trang chủ
                  </button>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

