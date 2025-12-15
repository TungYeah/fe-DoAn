export const HISTORY_TYPE_MAP: Record<string, string> = {
  USER_MANAGEMENT: "Quản lý người dùng",
  DEVICE_MANAGEMENT: "Quản lý thiết bị",
  DEVICE_TYPE_MANAGEMENT: "Quản lý loại thiết bị", 
  PROPERTY_MANAGEMENT: "Quản lý thuộc tính",
  SENSOR_MANAGEMENT: "Quản lý cảm biến",
  COMMENT_MANAGEMENT: "Quản lý bình luận",
  AUTH: "Xác thực",
  PROFILE_UPDATE: "Cập nhật hồ sơ",
  SETTINGS: "Cài đặt hệ thống",
  SYSTEM: "Hệ thống",
};

export const ACTION_MAP: Record<string, string> = {
  CREATE: "Tạo mới",
  UPDATE: "Cập nhật",
  DELETE: "Xóa",
  LOGIN: "Đăng nhập",
  LOGOUT: "Đăng xuất",
  RESET_PASSWORD: "Đặt lại mật khẩu",
  CHANGE_PASSWORD: "Đổi mật khẩu",
};
export const HISTORY_DESCRIPTION_MAP: Record<string, string> = {
  // ===== AUTH =====
  "New user register for an account.": "Người dùng mới đăng ký tài khoản",
  "Reset Password via Email": "Đặt lại mật khẩu qua email",
  "User Changed Password": "Người dùng đổi mật khẩu",
  "Change Password": "Đổi mật khẩu",

  // ===== USER =====
  "Lock a user": "Khóa tài khoản người dùng",
  "Unlock a user": "Mở khóa tài khoản người dùng",
  "Add role for account": "Gán quyền cho tài khoản",
  "Remove role from account": "Gỡ quyền khỏi tài khoản",
  "Lock commenting of a account": "Khóa chức năng bình luận",
  "Unlock commenting of a account": "Mở khóa chức năng bình luận",
  "Update avatar": "Cập nhật ảnh đại diện",
  "Update information of account": "Cập nhật thông tin tài khoản",
  "User self-deactivated account": "Người dùng tự khóa tài khoản",
  "User wiped all data": "Người dùng xóa toàn bộ dữ liệu",

  // ===== COMMENT =====
  "User creat a comment": "Người dùng tạo bình luận",
  "Hide a comment": "Ẩn bình luận",
  "Unhide a comment": "Bỏ ẩn bình luận",
  "Delete a comment": "Xóa bình luận",

  // ===== DEVICE =====
  "Create a device": "Tạo thiết bị",
  "Update a device": "Cập nhật thiết bị",
  "Delete a device": "Xóa thiết bị",

  // ===== DEVICE TYPE =====
  "Create a device type": "Tạo loại thiết bị",
  "Update a device type": "Cập nhật loại thiết bị",
  "Delete a device type": "Xóa loại thiết bị",

  // ===== PROPERTY =====
  "Create a property": "Tạo thuộc tính",
  "Update a property": "Cập nhật thuộc tính",
  "Delete a property": "Xóa thuộc tính",

  // ===== SENSOR =====
  "Create a sensor": "Tạo cảm biến",
  "Update a sensor": "Cập nhật cảm biến",
  "Delete a sensor": "Xóa cảm biến",
};
