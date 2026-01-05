// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
export const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

// API Endpoints
export const API_ENDPOINTS = {
    // Auth
    AUTH_CURRENT: `${API_BASE_URL}/api/v1/auth/current`,
    AUTH_LOGIN: `${API_BASE_URL}/api/v1/auth/authenticate`,
    AUTH_REGISTER: `${API_BASE_URL}/api/v1/auth/register`,
    AUTH_FORGOT_PASSWORD: `${API_BASE_URL}/api/v1/auth/forgot-password`,
    AUTH_RESET_PASSWORD: `${API_BASE_URL}/api/v1/auth/reset-password`,
    AUTH_UPDATE: `${API_BASE_URL}/api/v1/auth/update`,
    AUTH_CHANGE_PASSWORD: `${API_BASE_URL}/api/v1/auth/change-password`,
    AUTH_REQUEST_REACTIVATION: `${API_BASE_URL}/api/v1/auth/request-reactivation`,

    // User
    USER_DEACTIVATE: `${API_BASE_URL}/api/v1/user/deactivate`,

    // Devices
    DEVICES: `${API_BASE_URL}/api/v1/iot/devices`,
    DEVICES_ALL: `${API_BASE_URL}/api/v1/iot/devices/all`,

    // Device Types
    DEVICE_TYPES: `${API_BASE_URL}/api/v1/iot/device-types`,

    // Properties
    PROPERTIES: `${API_BASE_URL}/api/v1/iot/properties`,

    // Data Query
    DATA_QUERY_LAKE: `${API_BASE_URL}/api/v1/data-query/lake`,
    DATA_QUERY_HISTORY: `${API_BASE_URL}/api/v1/data-query/history`,

    // Admin
    ADMIN_HISTORY: `${API_BASE_URL}/api/admin/history`,

    // Chat
    CHAT: `${API_BASE_URL}/api/v1/chat`,

    // Server endpoints (Node.js backend)
    SERVER_DEVICE_TYPES: `${SERVER_URL}/api/device-types`,
    SERVER_DEVICES: `${SERVER_URL}/api/devices`,
    SERVER_DATASET: `${SERVER_URL}/api/dataset`,
    SERVER_EXPORT_FILTERS: `${SERVER_URL}/api/export_filters`,
};

export default API_BASE_URL;
