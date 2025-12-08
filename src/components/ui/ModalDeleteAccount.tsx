import React, { useState } from "react";
import { motion } from "motion/react";
import { Trash2, X, Lock } from "lucide-react";

export default function ModalDeleteAccount({ isOpen, onClose, onConfirm }) {
  const [password, setPassword] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* MODAL */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative z-[1000] w-[95%] max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
      >
        {/* HEADER ĐỎ GIỐNG MẪU */}
        <div className="bg-gradient-to-r from-red-600 to-red-500 px-5 py-4 flex items-start justify-between text-white">
          <div className="flex items-start gap-3">
            <div className="bg-white/20 w-10 h-10 rounded-full flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-base font-semibold">Khóa tài khoản</p>
              <p className="text-xs opacity-90">Hành động nguy hiểm</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-white/80 hover:text-white text-lg"
          >
            <X />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6">
          <p className="text-center text-gray-700 text-sm leading-relaxed mb-4">
            Nhập mật khẩu để xác nhận khóa tài khoản của bạn.
            <br />
            <span className="text-red-500 font-medium">
              Hành động này không thể hoàn tác.
            </span>
          </p>

          {/* INPUT PASSWORD */}
          <div className="relative mb-6">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="password"
              placeholder="Nhập mật khẩu..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-3 py-3 border rounded-xl text-sm focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* FOOTER BUTTONS */}
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              Hủy
            </button>

            <button
              onClick={() => onConfirm(password)}
              className="px-5 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 shadow"
            >
              Xóa
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
