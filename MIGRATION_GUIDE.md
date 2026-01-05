# Hướng dẫn Migration sang Environment Variables

## ✅ Đã hoàn thành

### Backend (server.js)
- ✅ Đã thêm `require('dotenv').config()`
- ✅ Đã chuyển MinIO config sang env vars
- ✅ Đã chuyển MySQL config sang env vars  
- ✅ Đã chuyển PORT sang env vars
- ✅ Đã chuyển dataset URLs sang env vars

### Frontend Core
- ✅ Đã tạo `src/config/api.ts` - file config tập trung
- ✅ Đã cập nhật `src/utils/dataLake.ts`
- ✅ Đã cập nhật `src/utils/auth.js`
- ✅ Đã cập nhật `src/contexts/AuthContext.tsx`
- ✅ Đã cập nhật `src/components/LoginPage.tsx`
- ✅ Đã cập nhật `src/components/RegisterPage.tsx`

### Config Files
- ✅ Đã tạo `.env` với giá trị localhost
- ✅ Đã tạo `.env.example` template
- ✅ Đã cập nhật `.gitignore` để ignore .env
- ✅ Đã thêm `dotenv` vào package.json

## 📋 Cần cập nhật thủ công

Các file sau cần thêm import và thay thế localhost URLs:

### 1. DashboardLayout.tsx
```typescript
// Thêm import
import { API_ENDPOINTS, API_BASE_URL } from "../config/api";

// Thay thế (dòng 45-47)
const src = avatar && avatar.trim() !== ""
  ? `${API_BASE_URL}${avatar}`
  : "/847969.png";

// Thay thế (dòng 84-86)
fetch(API_ENDPOINTS.AUTH_CURRENT, {
  headers: { Authorization: `Bearer ${token}` },
})
```

### 2. ChatPage.tsx
```typescript
// Thêm import
import { API_BASE_URL } from "../config/api";

// Thay thế (dòng 23)
const API_BASE = API_BASE_URL;
```

### 3. Components/pages/ - Cần cập nhật:

#### DashboardPage.tsx
```typescript
import { API_ENDPOINTS } from "../../config/api";

// Dòng 93: API_ENDPOINTS.DATA_QUERY_HISTORY
// Dòng 219: API_ENDPOINTS.DATA_QUERY_LAKE
// Dòng 319-320: API_ENDPOINTS.DEVICES_ALL và API_ENDPOINTS.DEVICES
// Dòng 359: API_ENDPOINTS.AUTH_CURRENT
// Dòng 381: API_ENDPOINTS.ADMIN_HISTORY
```

#### DevicesPage.tsx
```typescript
import { API_BASE_URL } from "../../config/api";

// Dòng 42: const API_BASE = `${API_BASE_URL}/api/v1/iot`;
```

#### DeviceTypesPage.tsx
```typescript
import { API_ENDPOINTS } from "../../config/api";

// Dòng 25: const API_URL = API_ENDPOINTS.DEVICE_TYPES;
```

#### PropertiesPage.tsx
```typescript
import { API_ENDPOINTS } from "../../config/api";

// Dòng 17: const API_URL = API_ENDPOINTS.PROPERTIES;
```

#### QueryPage.tsx
```typescript
import { API_BASE_URL } from "../../config/api";

// Dòng 30: const API_BASE = API_BASE_URL;
```

#### QueryPage2.tsx
```typescript
import { API_ENDPOINTS, SERVER_URL } from "../../config/api";

// Dòng 148: API_ENDPOINTS.AUTH_CURRENT
// Dòng 171: `${SERVER_URL}/api/device-types`
// Dòng 200: `${SERVER_URL}/api/devices?user_id=${uid}&role=${role}`
// Dòng 261: `${SERVER_URL}/api/export_filters/${CURRENT_USER_ID}`
// Dòng 311: `${SERVER_URL}/api/dataset?${params.toString()}`
// Dòng 340: `${SERVER_URL}/api/export_filters`
// Dòng 361: `${SERVER_URL}/api/export_filters/${id}/dataset`
// Dòng 382: `${SERVER_URL}/api/export_filters/${id}/export_csv`
// Dòng 392: `${SERVER_URL}/api/export_filters/${id}`
```

#### SettingsPage.tsx
```typescript
import { API_ENDPOINTS, API_BASE_URL } from "../../config/api";

// Dòng 61: API_ENDPOINTS.AUTH_CURRENT
// Dòng 72: `${API_BASE_URL}${user.avatar}`
// Dòng 96: API_ENDPOINTS.AUTH_UPDATE
// Dòng 120: API_ENDPOINTS.AUTH_CHANGE_PASSWORD
// Dòng 167: API_ENDPOINTS.AUTH_UPDATE
// Dòng 180: `${API_BASE_URL}${updated.avatar}`
// Dòng 199: API_ENDPOINTS.USER_DEACTIVATE
```

#### ProfilePage.tsx
```typescript
import { API_ENDPOINTS, API_BASE_URL } from "../../config/api";

// Dòng 12: `${API_BASE_URL}${avatar}`
// Dòng 48: API_ENDPOINTS.AUTH_CURRENT
```

#### UsersPage.tsx
```typescript
import { API_BASE_URL } from "../../config/api";

// Dòng 69: const API_BASE_URL = API_BASE_URL; (hoặc xóa dòng này)
```

#### NotificationsPage.tsx
```typescript
import { API_BASE_URL } from "../../config/api";

// Dòng 29: const API_BASE_URL = API_BASE_URL; (hoặc xóa dòng này)
```

#### HistoryPage.tsx
```typescript
import { API_BASE_URL } from "../../config/api";

// Dòng 42: const API_BASE_URL = API_BASE_URL; (hoặc xóa dòng này)
```

#### AIPage.tsx
```typescript
import { API_ENDPOINTS } from "../../config/api";

// Dòng 31: API_ENDPOINTS.CHAT
```

#### ResetPasswordPage.tsx
```typescript
import { API_ENDPOINTS } from "../../config/api";

// Dòng 32: API_ENDPOINTS.AUTH_RESET_PASSWORD
```

### 4. UI Components

#### ImportUserButton.tsx
```typescript
import { API_BASE_URL } from "../config/api";

// Dòng 5: const API_BASE = API_BASE_URL;
```

## 🚀 Cách cập nhật nhanh

### Sử dụng Find & Replace trong IDE:

1. **Tìm:** `"http://localhost:8080`
   **Thay:** `API_BASE_URL` hoặc `API_ENDPOINTS.XXX`

2. **Tìm:** `"http://localhost:5000`
   **Thay:** `SERVER_URL`

3. Thêm import vào đầu mỗi file:
   ```typescript
   import { API_ENDPOINTS, API_BASE_URL } from "../config/api";
   // hoặc
   import { API_ENDPOINTS, API_BASE_URL } from "../../config/api";
   ```

## 📦 Cài đặt dependencies

```bash
npm install dotenv
```

## 🔧 Khi deploy production

Chỉ cần sửa file `.env`:

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

## ✨ Lợi ích

1. **Dễ deploy:** Chỉ cần đổi .env, không cần sửa code
2. **Bảo mật:** Credentials không bị commit lên git
3. **Linh hoạt:** Dễ dàng switch giữa dev/staging/production
4. **Tập trung:** Tất cả config ở một chỗ
5. **Type-safe:** TypeScript biết được các endpoints có sẵn

## 📝 Notes

- File `.env` đã được thêm vào `.gitignore`
- File `.env.example` là template cho team members
- Vite tự động load biến môi trường có prefix `VITE_`
- Backend Node.js cần `require('dotenv').config()` ở đầu file
