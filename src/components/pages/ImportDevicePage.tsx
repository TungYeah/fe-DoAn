import React, { useState } from "react";
import { motion } from "motion/react";
import { Upload, FileText, Download, CheckCircle, XCircle, AlertCircle } from "lucide-react";

export default function ImportDevicePage() {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [importStatus, setImportStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };

  const handleImport = () => {
    setImportStatus("uploading");
    // Giả lập upload
    setTimeout(() => {
      setImportStatus("success");
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl text-gray-900 mb-2">Import thiết bị</h1>
        <p className="text-gray-600">Import danh sách thiết bị từ file Excel hoặc CSV</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Upload Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upload Zone */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-8 border border-gray-200"
          >
            <form
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onSubmit={(e) => e.preventDefault()}
            >
              <div
                className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${
                  dragActive
                    ? "border-red-600 bg-red-50"
                    : "border-gray-300 hover:border-red-600 hover:bg-red-50"
                }`}
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                    <Upload className="w-8 h-8 text-red-600" />
                  </div>
                  
                  <div>
                    <p className="text-xl text-gray-900 mb-2">
                      Kéo thả file hoặc click để chọn
                    </p>
                    <p className="text-sm text-gray-600">
                      Hỗ trợ file .xlsx, .xls, .csv (tối đa 10MB)
                    </p>
                  </div>

                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleChange}
                  />
                  <label
                    htmlFor="file-upload"
                    className="px-6 py-3 bg-gradient-to-r from-red-700 to-red-600 text-white rounded-xl cursor-pointer hover:shadow-lg transition-all"
                  >
                    Chọn file
                  </label>
                </div>
              </div>
            </form>

            {/* Uploaded File Info */}
            {uploadedFile && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 bg-gray-50 rounded-xl flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-red-600" />
                  <div>
                    <p className="text-gray-900">{uploadedFile.name}</p>
                    <p className="text-sm text-gray-600">
                      {(uploadedFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setUploadedFile(null)}
                  className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </motion.div>
            )}

            {/* Import Button */}
            {uploadedFile && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleImport}
                disabled={importStatus === "uploading"}
                className="w-full mt-6 py-3 bg-gradient-to-r from-red-700 to-red-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
              >
                {importStatus === "uploading" ? "Đang import..." : "Import thiết bị"}
              </motion.button>
            )}

            {/* Status Messages */}
            {importStatus === "success" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3"
              >
                <CheckCircle className="w-6 h-6 text-green-600" />
                <div>
                  <p className="text-green-900">Import thành công!</p>
                  <p className="text-sm text-green-700">Đã thêm 25 thiết bị mới vào hệ thống</p>
                </div>
              </motion.div>
            )}

            {importStatus === "error" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3"
              >
                <XCircle className="w-6 h-6 text-red-600" />
                <div>
                  <p className="text-red-900">Import thất bại!</p>
                  <p className="text-sm text-red-700">Vui lòng kiểm tra lại định dạng file</p>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Template Download */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-blue-50 rounded-2xl p-6 border border-blue-200"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-blue-900 mb-2">Chưa có file mẫu?</h3>
                <p className="text-sm text-blue-700 mb-4">
                  Tải xuống file mẫu Excel để xem định dạng chuẩn cho việc import thiết bị
                </p>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Tải file mẫu
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Instructions */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl p-6 border border-gray-200"
          >
            <h3 className="text-xl text-gray-900 mb-4">Hướng dẫn</h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm text-red-600">1</span>
                </div>
                <div>
                  <p className="text-gray-900 mb-1">Tải file mẫu</p>
                  <p className="text-sm text-gray-600">Tải xuống file Excel mẫu</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm text-red-600">2</span>
                </div>
                <div>
                  <p className="text-gray-900 mb-1">Điền thông tin</p>
                  <p className="text-sm text-gray-600">Nhập thông tin thiết bị vào file</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm text-red-600">3</span>
                </div>
                <div>
                  <p className="text-gray-900 mb-1">Upload file</p>
                  <p className="text-sm text-gray-600">Kéo thả hoặc chọn file để upload</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm text-red-600">4</span>
                </div>
                <div>
                  <p className="text-gray-900 mb-1">Xác nhận</p>
                  <p className="text-sm text-gray-600">Kiểm tra và xác nhận import</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 border border-gray-200"
          >
            <h3 className="text-xl text-gray-900 mb-4">Định dạng file</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-gray-700">Tên thiết bị</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-gray-700">Loại thiết bị</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-gray-700">Vị trí</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-gray-700">Mô tả</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-gray-700">Trạng thái</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
