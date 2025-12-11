import React, { useState, useEffect } from "react";
import {
  ChevronRight,
  Database,
  Shield,
  Zap,
  Users,
  LineChart,
  Cloud,
  Menu,
  X,
  Wifi,
  Activity,
  Award,
} from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { motion } from "motion/react";

type LandingProps = {
  onNavigate: (
    view:
      | "landing"
      | "login"
      | "register"
      | "about"
      | "contact"
      | "faq"
      | "help"
      | "terms"
      | "privacy"
  ) => void;
};

export default function LandingPage({ onNavigate }: LandingProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="w-full min-h-screen bg-white text-gray-900">
      {/* Logo PTIT ở góc phải màn hình - Fixed */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="fixed top-24 right-8 z-40 hidden lg:block"
      >
        <motion.div
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="relative"
        >
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-red-600 to-red-800 rounded-2xl blur-xl opacity-30 animate-pulse" />

          {/* Logo container */}
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 border-4 border-red-600">
            <div className="w-28 h-28 bg-gradient-to-br from-red-700 to-red-600 rounded-xl flex items-center justify-center relative overflow-hidden">
              {/* Animated background pattern */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-red-300 to-transparent animate-spin-slow" />
              </div>

              {/* PTIT Text */}
              <div className="relative text-center">
                <div
                  className="text-white text-3xl tracking-wider"
                  style={{ fontFamily: "Arial Black, sans-serif" }}
                >
                  PTIT
                </div>
                <div className="text-red-100 text-xs mt-1">IoT Platform</div>
              </div>
            </div>

            {/* Decorative corners */}
            <div className="absolute -top-2 -left-2 w-4 h-4 border-t-4 border-l-4 border-red-400 rounded-tl-lg" />
            <div className="absolute -top-2 -right-2 w-4 h-4 border-t-4 border-r-4 border-red-400 rounded-tr-lg" />
            <div className="absolute -bottom-2 -left-2 w-4 h-4 border-b-4 border-l-4 border-red-400 rounded-bl-lg" />
            <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-4 border-r-4 border-red-400 rounded-br-lg" />
          </div>
        </motion.div>
      </motion.div>

      {/* ================= HEADER ================= */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/95 backdrop-blur-md shadow-lg"
            : "bg-white/80 backdrop-blur-sm"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-red-700 to-red-600 rounded-lg flex items-center justify-center shadow-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent to-white/20" />
                {/* PTIT Logo Text */}
                <div className="relative text-center z-10">
                  <div
                    className="text-white text-sm tracking-wide"
                    style={{ fontFamily: "Arial Black, sans-serif" }}
                  >
                    PTIT
                  </div>
                </div>
              </div>
              <div>
                <h1 className="bg-gradient-to-r from-red-700 to-red-600 bg-clip-text text-transparent">
                  PTIT IoT Platform
                </h1>
                <p className="text-xs text-gray-600">Học viện CNBCVT</p>
              </div>
            </motion.div>

            {/* Desktop Menu */}
            <nav className="hidden md:flex items-center gap-8">
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => onNavigate("about")}
                className="text-gray-700 hover:text-red-600 transition-colors"
              >
                Giới thiệu
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => onNavigate("faq")}
                className="text-gray-700 hover:text-red-600 transition-colors"
              >
                Tính năng
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => onNavigate("contact")}
                className="text-gray-700 hover:text-red-600 transition-colors"
              >
                Liên hệ
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onNavigate("login")}
                className="px-5 py-2 text-gray-700 hover:text-red-600 transition-colors"
              >
                Đăng nhập
              </motion.button>
              <motion.button
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 10px 30px rgba(220, 38, 38, 0.3)",
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onNavigate("register")}
                className="px-6 py-2.5 bg-gradient-to-r from-red-700 to-red-600 text-white rounded-lg transition-all shadow-lg"
              >
                Đăng ký ngay
              </motion.button>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-700 hover:text-red-600"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="md:hidden mt-4 pb-4 border-t pt-4"
            >
              <nav className="flex flex-col gap-4">
                <button className="text-left text-gray-700 hover:text-red-600 transition-colors">
                  Giới thiệu
                </button>
                <button className="text-left text-gray-700 hover:text-red-600 transition-colors">
                  Tính năng
                </button>
                <button className="text-left text-gray-700 hover:text-red-600 transition-colors">
                  Liên hệ
                </button>
                <button
                  onClick={() => onNavigate("login")}
                  className="text-left px-4 py-2 text-gray-700 hover:text-red-600 transition-colors border rounded-lg"
                >
                  Đăng nhập
                </button>
                <button
                  onClick={() => onNavigate("register")}
                  className="px-4 py-2 bg-gradient-to-r from-red-700 via-red-600 to-yellow-500 text-white rounded-lg"
                >
                  Đăng ký ngay
                </button>
              </nav>
            </motion.div>
          )}
        </div>
      </header>

      {/* ================= HERO SECTION ================= */}
      <section className="relative pt-20 min-h-[90vh] flex items-center overflow-hidden">
        {/* Background with red and white */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-white to-red-50" />

        {/* Decorative Elements */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-20 right-10 w-72 h-72 bg-gradient-to-br from-red-600 to-red-800 rounded-full mix-blend-multiply filter blur-xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute bottom-20 left-10 w-72 h-72 bg-gradient-to-br from-red-400 to-red-600 rounded-full mix-blend-multiply filter blur-xl"
        />

        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-red-500 rounded-full"
            animate={{
              x: [0, Math.random() * 100 - 50, 0],
              y: [0, Math.random() * 100 - 50, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: i * 0.5,
            }}
            style={{
              left: `${10 + i * 15}%`,
              top: `${20 + Math.random() * 60}%`,
            }}
          />
        ))}

        <div className="relative max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-block"
            >
              <div className="px-4 py-2 bg-gradient-to-r from-red-100 to-white text-red-700 rounded-full text-sm border-2 border-red-200 shadow-md">
                🇻🇳 Học viện Công nghệ Bưu chính Viễn thông
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-5xl lg:text-2xl text-gray-900"
            >
              Nền tảng thu thập dữ liệu cảm biến IoT{" "}
              <span className="bg-gradient-to-r from-red-700 to-red-500 bg-clip-text text-transparent">
                phục vụ AI on Sensor
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-lg text-gray-600"
            >
              Data Lake dành cho IoT giúp thu thập – lưu trữ – xử lý – chia sẻ
              dữ liệu phục vụ huấn luyện mô hình AI trực tiếp trên thiết bị cảm
              biến (AI on Sensor). Hỗ trợ nghiên cứu, giảng dạy và triển khai
              các bài lab IoT tại PTIT.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <motion.button
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 20px 40px rgba(220, 38, 38, 0.3)",
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onNavigate("register")}
                className="group px-8 py-4 bg-gradient-to-r from-red-700 to-red-600 text-white rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 relative overflow-hidden"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-800 opacity-0 group-hover:opacity-100 transition-opacity"
                  initial={false}
                />
                <span className="relative z-10">Bắt đầu ngay</span>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform relative z-10" />
              </motion.button>
              <motion.button
                onClick={() => onNavigate("faq")}

                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 border-2 border-red-600 text-red-600 rounded-xl hover:bg-red-50 transition-all"
              >
                Tìm hiểu thêm
              </motion.button>
            </motion.div>

            {/* Stats with animation */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="flex gap-8 pt-8 border-t border-red-200"
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="cursor-pointer"
              >
                <p className="text-3xl bg-gradient-to-r from-red-700 to-red-600 bg-clip-text text-transparent">
                  500+
                </p>
                <p className="text-sm text-gray-600">Sinh viên</p>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="cursor-pointer"
              >
<p className="text-3xl bg-gradient-to-r from-red-700 to-red-600 bg-clip-text text-transparent">
  50+
</p>
<p className="text-sm text-gray-600">Loại cảm biến</p>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="cursor-pointer"
              >
                <p className="text-3xl bg-gradient-to-r from-red-700 to-red-600 bg-clip-text text-transparent">
                  24/7
                </p>
                <p className="text-sm text-gray-600">Giám sát</p>
              </motion.div>
            </motion.div>
          </div>

          {/* Right Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative"
          >
            <motion.div
              animate={{
                rotate: [3, -3, 3],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute inset-0 bg-gradient-to-br from-red-700 via-red-600 to-yellow-500 rounded-3xl transform"
            />
            <div className="relative">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1710429026883-524947152fb1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aWV0bmFtJTIwdW5pdmVyc2l0eSUyMGNhbXB1c3xlbnwxfHx8fDE3NjMzOTcxNDB8MA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="PTIT IoT Platform"
                className="rounded-3xl shadow-2xl w-full h-auto relative z-10 border-4 border-white"
              />

              {/* Floating badges */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-xl p-4 border-2 border-yellow-400"
              >
                <Wifi className="w-8 h-8 text-red-600" />
              </motion.div>

              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-xl p-4 border-2 border-red-400"
              >
                <Activity className="w-8 h-8 text-yellow-600" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ================= FEATURES SECTION ================= */}
      <section className="py-20 bg-gradient-to-b from-white to-red-50">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl text-gray-900 mb-4">Tính năng nổi bật</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Giải pháp toàn diện cho việc quản lý và phân tích dữ liệu IoT
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{
                y: -10,
                boxShadow: "0 20px 40px rgba(220, 38, 38, 0.15)",
              }}
              className="group p-8 bg-white rounded-2xl border-2 border-red-100 hover:border-red-300 transition-all shadow-lg"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="w-14 h-14 bg-gradient-to-br from-red-700 to-red-600 rounded-xl flex items-center justify-center mb-6 shadow-lg"
              >
                <Database className="w-7 h-7 text-white" />
              </motion.div>
              <h3 className="text-xl text-gray-900 mb-3">Lưu trữ an toàn</h3>
              <p className="text-gray-600">
                Hệ thống Data Lake thu thập và lưu trữ dữ liệu cảm biến phục vụ nghiên cứu IoT & AI.

              </p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{
                y: -10,
                boxShadow: "0 20px 40px rgba(220, 38, 38, 0.15)",
              }}
              className="group p-8 bg-white rounded-2xl border-2 border-yellow-100 hover:border-yellow-300 transition-all shadow-lg"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="w-14 h-14 bg-gradient-to-br from-yellow-600 to-yellow-500 rounded-xl flex items-center justify-center mb-6 shadow-lg"
              >
                <LineChart className="w-7 h-7 text-white" />
              </motion.div>
              <h3 className="text-xl text-gray-900 mb-3">
                Phân tích dữ liệu thực
              </h3>
              <p className="text-gray-600">
                Theo dõi dữ liệu real-time và hỗ trợ pipeline xử lý cho huấn luyện mô hình AI on Sensor.

              </p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{
                y: -10,
                boxShadow: "0 20px 40px rgba(220, 38, 38, 0.15)",
              }}
              className="group p-8 bg-white rounded-2xl border-2 border-red-100 hover:border-red-300 transition-all shadow-lg"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="w-14 h-14 bg-gradient-to-br from-red-600 to-yellow-500 rounded-xl flex items-center justify-center mb-6 shadow-lg"
              >
                <Zap className="w-7 h-7 text-white" />
              </motion.div>
              <h3 className="text-xl text-gray-900 mb-3">Hiệu năng cao</h3>
              <p className="text-gray-600">
                Tối ưu xử lý dữ liệu lớn từ các thiết bị IoT cho nghiên cứu.
              </p>
            </motion.div>

            {/* Feature 4 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              whileHover={{
                y: -10,
                boxShadow: "0 20px 40px rgba(220, 38, 38, 0.15)",
              }}
              className="group p-8 bg-white rounded-2xl border-2 border-yellow-100 hover:border-yellow-300 transition-all shadow-lg"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-red-600 rounded-xl flex items-center justify-center mb-6 shadow-lg"
              >
                <Shield className="w-7 h-7 text-white" />
              </motion.div>
              <h3 className="text-xl text-gray-900 mb-3">Bảo mật tối ưu</h3>
              <p className="text-gray-600">
                Bảo mật API, phân quyền dataset và kiểm soát truy cập theo vai trò.
              </p>
            </motion.div>

            {/* Feature 5 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
              whileHover={{
                y: -10,
                boxShadow: "0 20px 40px rgba(220, 38, 38, 0.15)",
              }}
              className="group p-8 bg-white rounded-2xl border-2 border-red-100 hover:border-red-300 transition-all shadow-lg"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="w-14 h-14 bg-gradient-to-br from-red-700 to-yellow-500 rounded-xl flex items-center justify-center mb-6 shadow-lg"
              >
                <Users className="w-7 h-7 text-white" />
              </motion.div>
              <h3 className="text-xl text-gray-900 mb-3">Cộng tác nhóm</h3>
              <p className="text-gray-600">
                Chia sẻ dataset giữa các nhóm nghiên cứu, lớp học hoặc đề tài khoa học.
              </p>
            </motion.div>

            {/* Feature 6 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.6 }}
              whileHover={{
                y: -10,
                boxShadow: "0 20px 40px rgba(220, 38, 38, 0.15)",
              }}
              className="group p-8 bg-white rounded-2xl border-2 border-yellow-100 hover:border-yellow-300 transition-all shadow-lg"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="w-14 h-14 bg-gradient-to-br from-yellow-600 to-red-700 rounded-xl flex items-center justify-center mb-6 shadow-lg"
              >
                <Cloud className="w-7 h-7 text-white" />
              </motion.div>
              <h3 className="text-xl text-gray-900 mb-3">Đám mây linh hoạt</h3>
              <p className="text-gray-600">
                Tích hợp với Data Lake phục vụ lưu trữ dữ liệu lớn IoT.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ================= CTA SECTION ================= */}
      <section className="py-20 bg-gradient-to-br from-red-700 via-red-600 to-yellow-600 text-white relative overflow-hidden">
        {/* Decorative Elements */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute top-0 right-0 w-96 h-96 bg-yellow-500/20 rounded-full -translate-y-1/2 translate-x-1/2"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute bottom-0 left-0 w-96 h-96 bg-red-800/20 rounded-full translate-y-1/2 -translate-x-1/2"
        />

        <div className="relative max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="relative">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                >
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1761427236022-e2a97712bfe6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNobm9sb2d5JTIwc3R1ZGVudHMlMjB3b3JraW5nfGVufDF8fHx8MTc2MzM5NzE0MXww&ixlib=rb-4.1.0&q=80&w=1080"
                    alt="PTIT Team"
                    className="rounded-2xl shadow-2xl border-4 border-white/20"
                  />
                </motion.div>

                {/* Floating badge */}
                <motion.div
                  animate={{ y: [0, -15, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute -bottom-6 -right-6 bg-white text-red-700 rounded-2xl shadow-2xl p-6"
                >
                  <Award className="w-12 h-12" />
                </motion.div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <h2 className="text-4xl lg:text-5xl">
                Sẵn sàng khám phá IoT cùng PTIT?
              </h2>
              <p className="text-xl text-red-100">
                Tham gia cùng hàng trăm sinh viên và giảng viên đang sử dụng nền
                tảng để nghiên cứu và phát triển các dự án IoT sáng tạo
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <motion.button
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 20px 40px rgba(255, 255, 255, 0.3)",
                  }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onNavigate("register")}
                  className="group px-8 py-4 bg-white text-red-700 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  Đăng ký miễn phí
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 border-2 border-white text-white rounded-xl hover:bg-white/10 transition-all"
                >
                  Xem demo
                </motion.button>
              </div>

              <div className="flex items-center gap-4 pt-4">
                <div className="flex -space-x-2">
                  <motion.div
                    whileHover={{ scale: 1.2, zIndex: 10 }}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 border-2 border-white"
                  />
                  <motion.div
                    whileHover={{ scale: 1.2, zIndex: 10 }}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-red-400 to-red-600 border-2 border-white"
                  />
                  <motion.div
                    whileHover={{ scale: 1.2, zIndex: 10 }}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-500 to-red-700 border-2 border-white"
                  />
                </div>
                <p className="text-yellow-100">
                  Đã có <span className="text-white">500+</span> người sử dụng
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-red-900 text-gray-300">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center">
                  <Database className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white">PTIT IoT Platform</h3>
                  <p className="text-xs text-gray-500">
                    Nền tảng IoT thông minh
                  </p>
                </div>
              </div>
              <p className="text-gray-400 mb-4">
                Hệ thống quản lý và phân tích dữ liệu IoT chuyên nghiệp dành cho
                sinh viên và giảng viên Học viện Công nghệ Bưu chính Viễn thông.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="text-white mb-4">Liên kết</h4>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => onNavigate("about")}
                    className="hover:text-red-500 transition-colors"
                  >
                    Giới thiệu
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onNavigate("faq")}
                    className="hover:text-red-500 transition-colors"
                  >
                    Tính năng
                  </button>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-white mb-4">Hỗ trợ</h4>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => onNavigate("contact")}
                    className="hover:text-red-500 transition-colors"
                  >
                    Liên hệ
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onNavigate("terms")}
                    className="hover:text-red-500 transition-colors"
                  >
                    Điều khoản
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onNavigate("privacy")}
                    className="hover:text-red-500 transition-colors"
                  >
                    Chính sách
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} PTIT IoT Platform — Học viện Công
              nghệ Bưu chính Viễn thông
            </p>
            <div className="flex gap-6">
              <button className="hover:text-red-500 transition-colors">
                Facebook
              </button>
              <button className="hover:text-red-500 transition-colors">
                GitHub
              </button>
              <button className="hover:text-red-500 transition-colors">
                Email
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
