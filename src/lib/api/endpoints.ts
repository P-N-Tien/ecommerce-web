// Must match DEFAULT_API_PREFIX from ecommerce-store-api/src/infrastructure/http/api-version.ts.
const API_PREFIX = '/api/v1';
const id = (value: string | number) => encodeURIComponent(String(value));

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_PREFIX}/auth/login`,
    REGISTER: `${API_PREFIX}/auth/register`,
    LOGOUT: `${API_PREFIX}/auth/logout`,
    LOGOUT_ALL: `${API_PREFIX}/auth/logout-all`,
    REFRESH: `${API_PREFIX}/auth/refresh`,
    CHANGE_PASSWORD: `${API_PREFIX}/auth/change-password`,
  },
  CATEGORIES: {
    BASE: `${API_PREFIX}/categories`,
    DETAIL: (categoryId: string | number) => `${API_PREFIX}/categories/${id(categoryId)}`,
    ACTIVATE: (categoryId: string | number) => `${API_PREFIX}/categories/${id(categoryId)}/activate`,
    DEACTIVATE: (categoryId: string | number) => `${API_PREFIX}/categories/${id(categoryId)}/deactivate`,
  },
  PRODUCTS: {
    BASE: `${API_PREFIX}/products`,
    DETAIL: (productId: string | number) => `${API_PREFIX}/products/${id(productId)}`,
  },
  INVENTORY: {
    BASE: `${API_PREFIX}/inventory`,
    PRODUCT: (productId: string | number) => `${API_PREFIX}/inventory/products/${id(productId)}`,
    ADJUST: (productId: string | number) => `${API_PREFIX}/inventory/products/${id(productId)}/adjust`,
  },
  ORDERS: {
    BASE: `${API_PREFIX}/orders`,
    DETAIL: (orderId: string | number) => `${API_PREFIX}/orders/${id(orderId)}`,
    TRANSITION: (orderId: string | number, action: string) => `${API_PREFIX}/orders/${id(orderId)}/${id(action)}`,
  },
  USERS: {
    BASE: `${API_PREFIX}/users`,
    DETAIL: (userId: string | number) => `${API_PREFIX}/users/${id(userId)}`,
    ACTIVATE: (userId: string | number) => `${API_PREFIX}/users/${id(userId)}/activate`,
    DEACTIVATE: (userId: string | number) => `${API_PREFIX}/users/${id(userId)}/deactivate`,
    ROLE: (userId: string | number) => `${API_PREFIX}/users/${id(userId)}/role`,
  },
  ROLES: {
    BASE: `${API_PREFIX}/roles`,
    DETAIL: (roleId: string | number) => `${API_PREFIX}/roles/${id(roleId)}`,
  },
  PERMISSIONS: {
    BASE: `${API_PREFIX}/permissions`,
  },
} as const;
