import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  History, Search, Filter, Download, Calendar, User, 
  FileText, Eye, Trash2, RefreshCcw, Clock, Activity,
  Shield, Database, Edit, Plus, Ban, CheckCircle, AlertTriangle
} from "lucide-react";
import { Modal } from "../ui/modal";

// Mock data dựa trên database structure
const historyData = [
  {
    id: "d89f6de6-d682-4c36-a08b-eb2a5f8cb747",
    version: 0,
    is_deleted: 0,
    flag_status: 1,
    create_date: "2025-12-06 15:46:56.456154",
    last_update_date: "2025-12-06 15:46:56.456154",
    created_by: "admin@example.com",
    last_updated_by: "admin@example.com",
    identify: "User Changed Password",
    action: "UPDATE",
    history_type: "USER_MANAGEMENT",
    content: '{"id":1, "fullName":"Admin", "password":"$2a$10$evCMBSS7AVlH3tSGDxRqaLeC8tz3qO5fLdEmFa+sPDjFsL1..."}'
  },
  {
    id: "d225c3a7-bcc7-4cc7-96f1-cae2e2986180",
    version: 0,
    is_deleted: 0,
    flag_status: 1,
    create_date: "2025-12-06 08:44:54.130323",
    last_update_date: "2025-12-06 08:44:54.130323",
    created_by: "admin@example.com",
    last_updated_by: "admin@example.com",
    identify: "n.h.ulyh@gmail.com",
    action: "UPDATE",
    history_type: "USER_MANAGEMENT",
    content: '{"id":6, "fullName":"Nguyễn Huyền Linh", "password":"$2a$10$5v6WA5Y5qVs5Om7R.5OKPu/.FvlADF5TUmUu..."}'
  },
  {
    id: "dc50f6a1-bca2-4ea9-a89d-a1e9db6a48db",
    version: 0,
    is_deleted: 0,
    flag_status: 1,
    create_date: "2025-12-06 08:35:33.291353",
    last_update_date: "2025-12-06 08:35:33.291353",
    created_by: "admin@example.com",
    last_updated_by: "admin@example.com",
    identify: "mp3.vn.990@gmail.com",
    action: "UPDATE",
    history_type: "USER_MANAGEMENT",
    content: '{"id":10, "fullName":"Nguyễn Thị Hiền", "password":"$2a$10$WeQTN3ZNxGQJNZGqNvuIfO6TKT1HgJb9H2T1av.Et..."}'
  },
  {
    id: "dc3e4c7c-2a6-d322-e873-9ed2e8d3bd9b",
    version: 0,
    is_deleted: 0,
    flag_status: 1,
    create_date: "2025-12-06 08:43:23.001385",
    last_update_date: "2025-12-06 08:43:23.001385",
    created_by: "admin@example.com",
    last_updated_by: "admin@example.com",
    identify: "doanhchienhcm@gmail.com",
    action: "UPDATE",
    history_type: "USER_MANAGEMENT",
    content: '{"id":7, "fullName":"abc", "password":"$2a$10$02YlkS3aL/6y9Ym4GaiZ.re5sFTjKSMDyS5DjzqCy.GVNW.EK..."}'
  },
  {
    id: "dce14028-af2c-40e9-afb6-ad8ca385a90e",
    version: 0,
    is_deleted: 0,
    flag_status: 1,
    create_date: "2025-12-06 08:32:01.853757",
    last_update_date: "2025-12-06 08:32:01.853757",
    created_by: "admin@example.com",
    last_updated_by: "admin@example.com",
    identify: "ndhuy1ptit3@gmail.com",
    action: "CREATE",
    history_type: "USER_MANAGEMENT",
    content: '{"id":14, "fullName":"Nguyễn Quang Huy", "email":"ndhuy1ptit3@gmail.com", "role":"USER"}'
  },
  {
    id: "df89469b-d964-4f49-afb8-ccecb50e6ca3",
    version: 0,
    is_deleted: 0,
    flag_status: 1,
    create_date: "2025-12-04 18:36:23.087412",
    last_update_date: "2025-12-04 18:36:23.087412",
    created_by: "admin@example.com",
    last_updated_by: "admin@example.com",
    identify: "admin@example.com",
    action: "UPDATE",
    history_type: "USER_MANAGEMENT",
    content: '{"id":1, "fullName":"Tôi là admin", "password":"$2a$10$c/1XzJp.MYhRoGMYM0YocYuRyBjPT3kraYC6asTDbOa8..."}'
  },
  {
    id: "e028a-b5-c66e-4ac8-e573-f65cb4fc2483",
    version: 0,
    is_deleted: 0,
    flag_status: 1,
    create_date: "2025-12-05 08:25:07.724457",
    last_update_date: "2025-12-05 08:25:07.724457",
    created_by: "mp3.vn.990@gmail.com",
    last_updated_by: "mp3.vn.990@gmail.com",
    identify: "mp3.vn.990@gmail.com",
    action: "UPDATE",
    history_type: "PROFILE_UPDATE",
    content: '{"id":10, "fullName":"Nguyễn Thị Hiền", "email":"mp3.vn.990@gmail.com"}'
  },
  {
    id: "e46b2cbb-8f54-4321-84f8-a032dadc5bcc",
    version: 0,
    is_deleted: 0,
    flag_status: 1,
    create_date: "2025-12-06 08:44:48.985563",
    last_update_date: "2025-12-06 08:44:48.985563",
    created_by: "admin@example.com",
    last_updated_by: "admin@example.com",
    identify: "doanhchienhcm@gmail.com",
    action: "UPDATE",
    history_type: "USER_MANAGEMENT",
    content: '{"id":7, "fullName":"abc", "password":"(hashed)"}'
  },
  {
    id: "e7b52a98-3f5e-4f73-be76-a88cb3dc5e80",
    version: 0,
    is_deleted: 0,
    flag_status: 1,
    create_date: "2025-12-06 08:45:19.353585",
    last_update_date: "2025-12-06 08:45:19.353585",
    created_by: "mp3.vn.990@gmail.com",
    last_updated_by: "mp3.vn.990@gmail.com",
    identify: "admin@example.com",
    action: "DELETE",
    history_type: "DEVICE_MANAGEMENT",
    content: '{"id":25, "deviceName":"Cảm biến nhiệt độ #5", "status":"deleted"}'
  },
  {
    id: "e7e982b2-8447-4a3e-8c78-43c37997ca35",
    version: 0,
    is_deleted: 1,
    flag_status: 0,
    create_date: "2025-12-06 09:12:51.710285",
    last_update_date: "2025-12-06 09:12:51.710285",
    created_by: "admin@example.com",
    last_updated_by: "admin@example.com",
    identify: "admin@example.com",
    action: "DELETE",
    history_type: "USER_MANAGEMENT",
    content: '{"id":18, "fullName":"Tôi là admin củ cc", "deleted":true}'
  },
  {
    id: "fba19823-c3b6-48a1-894a-b8be3cba4c31",
    version: 0,
    is_deleted: 0,
    flag_status: 1,
    create_date: "2025-12-06 09:06:46.132344",
    last_update_date: "2025-12-06 09:06:46.132344",
    created_by: "mp3.vn.990@gmail.com",
    last_updated_by: "mp3.vn.990@gmail.com",
    identify: "doanhchienhcm@gmail.com",
    action: "CREATE",
    history_type: "DEVICE_MANAGEMENT",
    content: '{"id":128, "deviceName":"Cảm biến ánh sáng #10", "location":"Phòng 203"}'
  },
  {
    id: "fe41ac99-f616-4557-add9-58cd78c5a533",
    version: 0,
    is_deleted: 0,
    flag_status: 1,
    create_date: "2025-12-06 09:08:36.630899",
    last_update_date: "2025-12-06 09:08:36.630899",
    created_by: "mp3.vn.990@gmail.com",
    last_updated_by: "mp3.vn.990@gmail.com",
    identify: "mp3.vn.990@gmail.com",
    action: "UPDATE",
    history_type: "SETTINGS",
    content: '{"darkMode":true, "language":"vi", "notifications":true}'
  }
];

export default function HistoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAction, setSelectedAction] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedHistory, setSelectedHistory] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Filter history
  const filteredHistory = historyData.filter(item => {
    const matchesSearch = 
      item.identify.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.created_by.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAction = selectedAction === "all" || item.action === selectedAction;
    const matchesType = selectedType === "all" || item.history_type === selectedType;
    
    return matchesSearch && matchesAction && matchesType;
  });

  const handleExport = (format: "csv" | "json" | "excel") => {
    alert(`Đang xuất lịch sử dạng ${format.toUpperCase()}...`);
  };

  const handleViewDetails = (item: any) => {
    setSelectedHistory(item);
    setIsViewModalOpen(true);
  };

  // Parse content JSON safely
  const parseContent = (content: string) => {
    try {
      return JSON.parse(content);
    } catch {
      return { raw: content };
    }
  };

  // Get action badge color
  const getActionColor = (action: string) => {
    switch(action) {
      case "CREATE": return "bg-green-100 text-green-700";
      case "UPDATE": return "bg-blue-100 text-blue-700";
      case "DELETE": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  // Get action icon
  const getActionIcon = (action: string) => {
    switch(action) {
      case "CREATE": return <Plus className="w-3 h-3" />;
      case "UPDATE": return <Edit className="w-3 h-3" />;
      case "DELETE": return <Trash2 className="w-3 h-3" />;
      default: return <Activity className="w-3 h-3" />;
    }
  };

  // Get type badge color
  const getTypeColor = (type: string) => {
    switch(type) {
      case "USER_MANAGEMENT": return "bg-purple-100 text-purple-700";
      case "DEVICE_MANAGEMENT": return "bg-orange-100 text-orange-700";
      case "PROFILE_UPDATE": return "bg-cyan-100 text-cyan-700";
      case "SETTINGS": return "bg-pink-100 text-pink-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  // Stats
  const stats = {
    total: historyData.length,
    today: historyData.filter(h => h.create_date.startsWith("2025-12-06")).length,
    creates: historyData.filter(h => h.action === "CREATE").length,
    updates: historyData.filter(h => h.action === "UPDATE").length,
    deletes: historyData.filter(h => h.action === "DELETE").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-gray-900 mb-2">Lịch sử hệ thống</h1>
          <p className="text-gray-600">Quản lý và theo dõi mọi hoạt động trong hệ thống</p>
        </div>
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleExport("excel")}
            className="px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-red-600 hover:text-red-600 transition-all flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            Xuất báo cáo
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-gradient-to-r from-red-700 to-red-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
          >
            <RefreshCcw className="w-5 h-5" />
            Làm mới
          </motion.button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-4 border border-gray-200"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Database className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Tổng bản ghi</p>
              <p className="text-2xl text-gray-900">{stats.total}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white rounded-xl p-4 border border-gray-200"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Plus className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Tạo mới</p>
              <p className="text-2xl text-green-600">{stats.creates}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-4 border border-gray-200"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Edit className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Cập nhật</p>
              <p className="text-2xl text-blue-600">{stats.updates}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-xl p-4 border border-gray-200"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Xóa</p>
              <p className="text-2xl text-red-600">{stats.deletes}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-4 border border-gray-200"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Hôm nay</p>
              <p className="text-2xl text-orange-600">{stats.today}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-6 border border-gray-200"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
            <Filter className="w-5 h-5 text-red-600" />
          </div>
          <h3 className="text-xl text-gray-900">Bộ lọc</h3>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <label className="block text-gray-700 mb-2 text-sm">Tìm kiếm</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="ID, email, người thực hiện..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-red-600 focus:outline-none transition-colors text-sm"
              />
            </div>
          </div>

          {/* Action Filter */}
          <div>
            <label className="block text-gray-700 mb-2 text-sm">Hành động</label>
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:border-red-600 focus:outline-none transition-colors appearance-none bg-white text-sm"
            >
              <option value="all">Tất cả</option>
              <option value="CREATE">Tạo mới</option>
              <option value="UPDATE">Cập nhật</option>
              <option value="DELETE">Xóa</option>
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-gray-700 mb-2 text-sm">Loại</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:border-red-600 focus:outline-none transition-colors appearance-none bg-white text-sm"
            >
              <option value="all">Tất cả</option>
              <option value="USER_MANAGEMENT">Quản lý User</option>
              <option value="DEVICE_MANAGEMENT">Quản lý thiết bị</option>
              <option value="PROFILE_UPDATE">Cập nhật profile</option>
              <option value="SETTINGS">Cài đặt</option>
            </select>
          </div>

          {/* Date From */}
          <div>
            <label className="block text-gray-700 mb-2 text-sm">Từ ngày</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 border-2 border-gray-200 rounded-xl focus:border-red-600 focus:outline-none transition-colors text-sm"
              />
            </div>
          </div>

          {/* Date To */}
          <div>
            <label className="block text-gray-700 mb-2 text-sm">Đến ngày</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 border-2 border-gray-200 rounded-xl focus:border-red-600 focus:outline-none transition-colors text-sm"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* History Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs text-gray-600">Thời gian</th>
                <th className="px-4 py-3 text-left text-xs text-gray-600">Hành động</th>
                <th className="px-4 py-3 text-left text-xs text-gray-600">Loại</th>
                <th className="px-4 py-3 text-left text-xs text-gray-600">Định danh</th>
                <th className="px-4 py-3 text-left text-xs text-gray-600">Người thực hiện</th>
                <th className="px-4 py-3 text-left text-xs text-gray-600">Trạng thái</th>
                <th className="px-4 py-3 text-left text-xs text-gray-600">Version</th>
                <th className="px-4 py-3 text-center text-xs text-gray-600">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredHistory.map((item, idx) => (
                <motion.tr
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.02 }}
                  className={`hover:bg-gray-50 transition-all ${
                    item.is_deleted ? "bg-red-50/30" : ""
                  }`}
                >
                  {/* Time */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-900">{item.create_date.split(' ')[0]}</p>
                        <p className="text-xs text-gray-500">{item.create_date.split(' ')[1]}</p>
                      </div>
                    </div>
                  </td>

                  {/* Action */}
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getActionColor(item.action)}`}>
                      {getActionIcon(item.action)}
                      {item.action}
                    </span>
                  </td>

                  {/* Type */}
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getTypeColor(item.history_type)}`}>
                      {item.history_type.replace(/_/g, ' ')}
                    </span>
                  </td>

                  {/* Identify */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-xs text-gray-900">{item.identify}</span>
                    </div>
                  </td>

                  {/* Created By */}
                  <td className="px-4 py-3">
                    <span className="text-xs text-gray-600">{item.created_by}</span>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {item.is_deleted ? (
                        <>
                          <Ban className="w-3.5 h-3.5 text-red-600" />
                          <span className="text-xs text-red-600">Deleted</span>
                        </>
                      ) : item.flag_status === 1 ? (
                        <>
                          <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                          <span className="text-xs text-green-600">Active</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-3.5 h-3.5 text-yellow-600" />
                          <span className="text-xs text-yellow-600">Inactive</span>
                        </>
                      )}
                    </div>
                  </td>

                  {/* Version */}
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                      v{item.version}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleViewDetails(item)}
                        className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors"
                        title="Xem chi tiết"
                      >
                        <Eye className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Hiển thị <span className="text-gray-900">1-{filteredHistory.length}</span> trong tổng số <span className="text-gray-900">{historyData.length}</span> bản ghi
          </p>
          <div className="flex gap-2">
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
              Trước
            </button>
            <button className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm">1</button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">2</button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">3</button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
              Sau
            </button>
          </div>
        </div>
      </motion.div>

      {/* VIEW DETAILS MODAL */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Chi tiết bản ghi lịch sử"
        subtitle="Xem thông tin đầy đủ về hành động này"
        icon={<History className="w-5 h-5 text-white" />}
        size="lg"
      >
        {selectedHistory && (
          <div className="space-y-4">
            {/* Header Info */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-500 mb-1">ID Bản ghi</p>
                <p className="text-xs text-gray-900 font-mono break-all">{selectedHistory.id}</p>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-500 mb-1">Version</p>
                <span className="inline-block px-2 py-0.5 bg-gray-200 text-gray-700 rounded text-xs">
                  v{selectedHistory.version}
                </span>
              </div>
            </div>

            {/* Action & Type */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-500 mb-1.5">Hành động</p>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getActionColor(selectedHistory.action)}`}>
                  {getActionIcon(selectedHistory.action)}
                  {selectedHistory.action}
                </span>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-500 mb-1.5">Loại</p>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getTypeColor(selectedHistory.history_type)}`}>
                  {selectedHistory.history_type.replace(/_/g, ' ')}
                </span>
              </div>
            </div>

            {/* Time Info */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-3.5 h-3.5 text-gray-500" />
                  <p className="text-xs text-gray-500">Thời gian tạo</p>
                </div>
                <p className="text-xs text-gray-900">{selectedHistory.create_date}</p>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-3.5 h-3.5 text-gray-500" />
                  <p className="text-xs text-gray-500">Cập nhật lần cuối</p>
                </div>
                <p className="text-xs text-gray-900">{selectedHistory.last_update_date}</p>
              </div>
            </div>

            {/* User Info */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 mb-1">
                  <User className="w-3.5 h-3.5 text-gray-500" />
                  <p className="text-xs text-gray-500">Người tạo</p>
                </div>
                <p className="text-xs text-gray-900">{selectedHistory.created_by}</p>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 mb-1">
                  <User className="w-3.5 h-3.5 text-gray-500" />
                  <p className="text-xs text-gray-500">Người cập nhật</p>
                </div>
                <p className="text-xs text-gray-900">{selectedHistory.last_updated_by}</p>
              </div>
            </div>

            {/* Identify */}
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-1">
                <Shield className="w-3.5 h-3.5 text-blue-600" />
                <p className="text-xs text-blue-600 font-medium">Định danh</p>
              </div>
              <p className="text-sm text-blue-900">{selectedHistory.identify}</p>
            </div>

            {/* Status */}
            <div className={`p-3 rounded-lg border ${
              selectedHistory.is_deleted 
                ? "bg-red-50 border-red-200"
                : selectedHistory.flag_status === 1
                ? "bg-green-50 border-green-200"
                : "bg-yellow-50 border-yellow-200"
            }`}>
              <div className="flex items-center gap-2">
                {selectedHistory.is_deleted ? (
                  <>
                    <Ban className="w-4 h-4 text-red-600" />
                    <span className="text-sm text-red-700">Bản ghi đã bị xóa</span>
                  </>
                ) : selectedHistory.flag_status === 1 ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-700">Bản ghi đang hoạt động</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm text-yellow-700">Bản ghi không hoạt động</span>
                  </>
                )}
              </div>
            </div>

            {/* Content JSON */}
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-gray-600" />
                <p className="text-xs text-gray-600 font-medium">Nội dung (JSON)</p>
              </div>
              <div className="max-h-48 overflow-auto">
                <pre className="text-xs text-gray-800 font-mono bg-white p-3 rounded border border-gray-200">
                  {JSON.stringify(parseContent(selectedHistory.content), null, 2)}
                </pre>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                Đóng
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(selectedHistory.id);
                  alert("Đã copy ID!");
                }}
                className="px-4 py-2 bg-gradient-to-r from-red-700 to-red-600 text-white rounded-lg hover:shadow-lg transition-all text-sm"
              >
                Copy ID
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
