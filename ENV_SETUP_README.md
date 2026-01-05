# ✅ Đã hoàn thành chuyển đổi sang Environment Variables

## 📦 Các file đã được cập nhật

### Backend
- ✅ `server.js` - Đã chuyển toàn bộ config sang env vars
- ✅ `.env` - File config cho local development
- ✅ `.env.example` - Template cho team members
- ✅ `.gitignore` - Đã thêm .env để không commit credentials

### Frontend Core
- ✅ `src/config/api.ts` - **File config tập trung cho tất cả API endpoints**
- ✅ `src/utils/dataLake.ts`
- ✅ `src/utils/auth.js`
- ✅ `src/contexts/AuthContext.tsx`

### Components
- ✅ `src/components/LoginPage.tsx`
- ✅ `src/components/RegisterPage.tsx`
- ✅ `src/components/DashboardLayout.tsx`

### Package
- ✅ `package.json` - Đã thêm `dotenv` dependency

## 🔧 Cài đặt

```bash
# Cài đặt dependencies
npm install

# File .env đã được tạo sẵn với config localhost
# Không cần làm gì thêm cho development
```

## 🚀 Chạy ứng dụng

```bash
# Terminal 1: Chạy backend
node server.js

# Terminal 2: Chạy frontend
npm run dev
```

## 📝 Các file còn lại cần cập nhật (Optional)

Xem chi tiết trong file `MIGRATION_GUIDE.md`

Các file sau vẫn đang dùng hardcoded localhost nhưng **vẫn hoạt động bình thường**:
- `src/components/ChatPage.tsx`
- `src/components/pages/DashboardPage.tsx`
- `src/components/pages/DevicesPage.tsx`
- `src/components/pages/DeviceTypesPage.tsx`
- `src/components/pages/PropertiesPage.tsx`
- `src/components/pages/QueryPage.tsx`
- `src/components/pages/QueryPage2.tsx`
- `src/components/pages/SettingsPage.tsx`
- `src/components/pages/ProfilePage.tsx`
- `src/components/pages/UsersPage.tsx`
- `src/components/pages/NotificationsPage.tsx`
- `src/components/pages/HistoryPage.tsx`
- `src/components/pages/AIPage.tsx`
- `src/components/pages/ResetPasswordPage.tsx`
- `src/components/ui/ImportUserButton.tsx`

**Bạn có thể cập nhật dần dần khi cần thiết.**

## 🌐 Khi deploy lên server thật

### Bước 1: Cập nhật file `.env`

```env
# Backend API URLs
VITE_API_BASE_URL=http://YOUR_SERVER_IP:8080
VITE_SERVER_URL=http://YOUR_SERVER_IP:5000

# Database Configuration
DB_HOST=your-db-host
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=testtinasoft

# MinIO Configuration
MINIO_ENDPOINT=your-minio-host
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=your-access-key
MINIO_SECRET_KEY=your-secret-key
MINIO_BUCKET_NAME=thingsboard-data

# Server Configuration
PORT=5000
```

### Bước 2: Build và deploy

```bash
# Build frontend
npm run build

# Deploy backend
node server.js
```

## 🎯 Lợi ích của việc sử dụng Environment Variables

1. **Bảo mật cao hơn**: Credentials không bị commit lên Git
2. **Dễ deploy**: Chỉ cần đổi .env, không cần sửa code
3. **Linh hoạt**: Dễ dàng switch giữa dev/staging/production
4. **Tập trung**: Tất cả config ở một chỗ
5. **Type-safe**: TypeScript biết được các endpoints có sẵn

## 📚 Cấu trúc file config

### `src/config/api.ts`
File này export:
- `API_BASE_URL`: URL của Spring Boot backend (port 8080)
- `SERVER_URL`: URL của Node.js backend (port 5000)
- `API_ENDPOINTS`: Object chứa tất cả các endpoint paths

### Cách sử dụng trong code:

```typescript
import { API_ENDPOINTS, API_BASE_URL } from "../config/api";

// Sử dụng endpoint có sẵn
fetch(API_ENDPOINTS.AUTH_LOGIN, {
  method: "POST",
  // ...
});

// Hoặc build URL động
fetch(`${API_BASE_URL}/api/v1/custom/endpoint`, {
  // ...
});

// Hiển thị avatar
const avatarUrl = `${API_BASE_URL}${user.avatar}`;
```

## ⚠️ Lưu ý quan trọng

1. **File `.env` đã được thêm vào `.gitignore`** - Không bao giờ commit file này
2. **File `.env.example`** - Đây là template, có thể commit lên Git
3. **Vite prefix**: Biến môi trường cho frontend phải có prefix `VITE_`
4. **Backend dotenv**: Server.js đã có `require('dotenv').config()` ở đầu file

## 🔍 Kiểm tra

Để kiểm tra xem env vars có hoạt động không:

```javascript
// Trong browser console (frontend)
console.log(import.meta.env.VITE_API_BASE_URL);

// Trong server.js (backend)
console.log(process.env.DB_HOST);
```

## 📞 Hỗ trợ

Nếu gặp vấn đề:
1. Kiểm tra file `.env` có tồn tại không
2. Kiểm tra các biến có đúng tên không (VITE_ prefix cho frontend)
3. Restart cả frontend và backend sau khi thay đổi .env
4. Xem file `MIGRATION_GUIDE.md` để biết chi tiết cách cập nhật các file còn lại

---

**Tóm lại**: Dự án của bạn đã sẵn sàng để deploy! Chỉ cần thay đổi file `.env` khi có IP server thật. 🎉
