const fs = require('fs');
const path = require('path');

// Mapping các localhost URL sang biến môi trường
const replacements = [
    {
        from: '"http://localhost:8080/api/v1/auth/current"',
        to: 'API_ENDPOINTS.AUTH_CURRENT',
        needsImport: true
    },
    {
        from: '"http://localhost:8080/api/v1/auth/authenticate"',
        to: 'API_ENDPOINTS.AUTH_LOGIN',
        needsImport: true
    },
    {
        from: '"http://localhost:8080/api/v1/auth/register"',
        to: 'API_ENDPOINTS.AUTH_REGISTER',
        needsImport: true
    },
    {
        from: '"http://localhost:8080/api/v1/auth/update"',
        to: 'API_ENDPOINTS.AUTH_UPDATE',
        needsImport: true
    },
    {
        from: '"http://localhost:8080/api/v1/auth/change-password"',
        to: 'API_ENDPOINTS.AUTH_CHANGE_PASSWORD',
        needsImport: true
    },
    {
        from: '"http://localhost:8080/api/v1/user/deactivate"',
        to: 'API_ENDPOINTS.USER_DEACTIVATE',
        needsImport: true
    },
    {
        from: '"http://localhost:8080/api/v1/iot/devices"',
        to: 'API_ENDPOINTS.DEVICES',
        needsImport: true
    },
    {
        from: '"http://localhost:8080/api/v1/iot/devices/all',
        to: '`${API_ENDPOINTS.DEVICES_ALL}',
        needsImport: true
    },
    {
        from: '"http://localhost:8080/api/v1/iot/device-types"',
        to: 'API_ENDPOINTS.DEVICE_TYPES',
        needsImport: true
    },
    {
        from: '"http://localhost:8080/api/v1/iot/properties"',
        to: 'API_ENDPOINTS.PROPERTIES',
        needsImport: true
    },
    {
        from: '"http://localhost:8080/api/v1/data-query/lake"',
        to: 'API_ENDPOINTS.DATA_QUERY_LAKE',
        needsImport: true
    },
    {
        from: '"http://localhost:8080/api/v1/data-query/history"',
        to: 'API_ENDPOINTS.DATA_QUERY_HISTORY',
        needsImport: true
    },
    {
        from: '"http://localhost:8080/api/admin/history',
        to: '`${API_ENDPOINTS.ADMIN_HISTORY}',
        needsImport: true
    },
    {
        from: '`http://localhost:8080/api/v1/chat`',
        to: 'API_ENDPOINTS.CHAT',
        needsImport: true
    },
    {
        from: '`http://localhost:8080${avatar}`',
        to: '`${API_BASE_URL}${avatar}`',
        needsImport: true
    },
    {
        from: '"http://localhost:8080${avatar}"',
        to: '`${API_BASE_URL}${avatar}`',
        needsImport: true
    },
    {
        from: 'http://localhost:8080',
        to: '${API_BASE_URL}',
        needsImport: true
    },
    {
        from: '"http://localhost:5000/api/device-types"',
        to: 'API_ENDPOINTS.SERVER_DEVICE_TYPES',
        needsImport: true
    },
    {
        from: '`http://localhost:5000/api/devices',
        to: '`${API_ENDPOINTS.SERVER_DEVICES}',
        needsImport: true
    },
    {
        from: '`http://localhost:5000/api/dataset',
        to: '`${API_ENDPOINTS.SERVER_DATASET}',
        needsImport: true
    },
    {
        from: '`http://localhost:5000/api/export_filters',
        to: '`${API_ENDPOINTS.SERVER_EXPORT_FILTERS}',
        needsImport: true
    },
    {
        from: '"http://localhost:5000/api/export_filters',
        to: '`${API_ENDPOINTS.SERVER_EXPORT_FILTERS}',
        needsImport: true
    }
];

console.log('Script này cần chạy thủ công từng file để đảm bảo chính xác.');
console.log('Vui lòng sử dụng find & replace trong IDE của bạn với các pattern sau:\n');

replacements.forEach((r, i) => {
    console.log(`${i + 1}. Tìm: ${r.from}`);
    console.log(`   Thay: ${r.to}`);
    console.log('');
});

console.log('\nVà thêm import vào đầu file:');
console.log('import { API_ENDPOINTS, API_BASE_URL } from "../config/api";');
console.log('hoặc');
console.log('import { API_ENDPOINTS, API_BASE_URL } from "../../config/api";');
console.log('(tùy vào độ sâu của file)');
