import React, { ReactNode, useEffect } from "react";
import ReactDOM from "react-dom";

interface CustomModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
}

const CustomModal: React.FC<CustomModalProps> = ({
  open,
  onClose,
  title,
  children,
  footer,
}) => {
  // Khóa scroll nền khi mở popup
  useEffect(() => {
    if (!open) return;
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = old;
    };
  }, [open]);

  if (!open) return null;

  return ReactDOM.createPortal(
    <>
      <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-[1px] flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl mx-4 max-h-[85vh] flex flex-col animate-[modalIn_0.18s_ease-out]">
          {/* Header */}
          <div className="px-5 py-4 border-b flex items-center justify-between">
            {title && <h2 className="text-lg font-semibold">{title}</h2>}
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-sm px-2"
            >
              ✕
            </button>
          </div>

          {/* Body */}
          <div className="px-5 py-4 overflow-y-auto">{children}</div>

          {/* Footer (nếu có) */}
          {footer && (
            <div className="px-5 py-3 border-t bg-gray-50 flex justify-end gap-2">
              {footer}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: translateY(10px) scale(.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </>,
    document.body
  );
};

export default CustomModal;
