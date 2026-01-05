# Hướng dẫn cập nhật API URLs

Đã tạo file `.env` và `src/config/api.ts` để quản lý tập trung các API URLs.

## Các file đã cập nhật:
- ✅ server.js
- ✅ .env
- ✅ .env.example
- ✅ .gitignore
- ✅ src/config/api.ts
- ✅ src/utils/dataLake.ts
- ✅ src/utils/auth.js
- ✅ src/contexts/AuthContext.tsx
- ✅ src/components/LoginPage.tsx

## Các file còn lại cần cập nhật:
- src/components/RegisterPage.tsx
- src/components/DashboardLayout.tsx
- src/components/ChatPage.tsx
- src/components/pages/*.tsx (nhiều file)
- src/components/ui/ImportUserButton.tsx

## Cách sử dụng:

### Frontend (React/TypeScript):
```typescript
import { API_ENDPOINTS, API_BASE_URL } from "../config/api";

// Sử dụng endpoint có sẵn
fetch(API_ENDPOINTS.AUTH_LOGIN, {...})

// Hoặc tự build URL
fetch(`${API_BASE_URL}/api/v1/custom/endpoint`, {...})
```

### Backend (Node.js):
```javascript
require('dotenv').config();

// Sử dụng biến môi trường
const host = process.env.DB_HOST || 'localhost';
const apiUrl = process.env.VITE_API_BASE_URL || 'http://localhost:8080';
```

## Cài đặt package cần thiết:

```bash
npm install dotenv
```

## Khi deploy production:
Chỉ cần thay đổi file `.env`:
```
VITE_API_BASE_URL=http://your-server-ip:8080
VITE_SERVER_URL=http://your-server-ip:5000
DB_HOST=your-db-host
MINIO_ENDPOINT=your-minio-host
```
