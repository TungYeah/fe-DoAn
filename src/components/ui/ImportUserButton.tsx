import React, { useRef, useState } from "react";
import axios from "axios";
import { FileSpreadsheet, Loader2, Download, FileDown, Upload } from "lucide-react"; // Thêm icon FileDown

const API_BASE = "http://localhost:8080/api/v1";

interface ImportUserButtonProps {
  onSuccess: () => void;
}

export default function ImportUserButton({ onSuccess }: ImportUserButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", 
      "application/vnd.ms-excel"
    ];
    if (!validTypes.includes(file.type)) {
      alert("Vui lòng chỉ chọn file Excel (.xlsx, .xls)");
      return;
    }

    if (!window.confirm(`Bạn có chắc muốn import danh sách từ file: ${file.name}?`)) {
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`${API_BASE}/admin/users/import`, formData, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert(res.data);
      onSuccess();
    } catch (error: any) {
      console.error("Import thất bại", error);
      alert(error.response?.data?.message || "Có lỗi xảy ra khi import file!");
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Hàm tải file mẫu
  const downloadTemplate = () => {
    // Tạo nội dung file CSV mẫu (có BOM \uFEFF để Excel đọc tiếng Việt)
    const headers = ["Email", "Họ và tên(3-100 kí tự)", "Đơn vị(CNTT/DTVT)", "Role (USER/ADMIN)"];
    const example1 = ["user1@ptit.edu.vn", "Nguyễn Văn A", "CNTT", "USER"];
    const example2 = ["admin@ptit.edu.vn", "Trần Thị B", "DTVT", "ADMIN"];
    
    const csvContent = "\uFEFF" + [headers.join(","), example1.join(","), example2.join(",")].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "Mau_Import_User.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

return (
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-1">
                
    <input
      type="file"
      ref={fileInputRef}
      onChange={handleFileChange}
      accept=".xlsx, .xls"
      className="hidden"
    />

    {/* Nút Import (BÊN TRÁI) */}
    <button
      onClick={() => fileInputRef.current?.click()}
      disabled={loading}
      className="
        flex items-center gap-2
        bg-red-600 hover:bg-red-700
        text-white px-4 py-2.5
        rounded-lg text-sm font-medium
        transition-all shadow-sm
        disabled:opacity-60 disabled:cursor-not-allowed
        active:scale-95
      "
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Upload className="w-4 h-4" />
      )}
      {loading ? "Đang xử lý..." : "Chọn file Excel"}
    </button>
              </div>

    {/* Nút Tải template (BÊN PHẢI) */}
    <button
      onClick={downloadTemplate}
                      className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-blue-600 hover:text-blue-600 transition-all flex items-center gap-2"

    >
      <Download className="w-4 h-4" />
      Tải template
    </button>
  </div>
);

}
