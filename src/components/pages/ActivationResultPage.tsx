import React from "react";
import { motion } from "motion/react";
import { CheckCircle, XCircle } from "lucide-react";

export default function ActivationResultPage() {
  const params = new URLSearchParams(window.location.search);
  const message = params.get("message") || "Không xác định";

  const success = message.toLowerCase().includes("thành công");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-10 rounded-2xl shadow-xl border max-w-lg w-full text-center"
      >
        {success ? (
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
        ) : (
          <XCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />
        )}

        <h2 className="text-2xl font-semibold text-gray-800 mb-3">
          {success ? "Kích hoạt thành công!" : "Kích hoạt thất bại!"}
        </h2>

        <p className="text-gray-600 mb-6">{message}</p>

        <a
          href="/login"
          className="px-6 py-3 bg-gradient-to-r from-red-700 to-red-600 text-white rounded-xl shadow-lg inline-block"
        >
          Đến trang đăng nhập
        </a>
      </motion.div>
    </div>
  );
}
