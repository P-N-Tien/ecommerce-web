export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
export const AUTH_REFRESH_URL = '/api/v1/auth/refresh';
export const AUTH_LOGOUT_URL = '/api/v1/auth/logout';
export const LOGIN_REDIRECT_URL = '/login';
export const REGISTER_REDIRECT_URL = '/api/v1/auth/register';

export const API_AUTHEN_URLS = [LOGIN_REDIRECT_URL, REGISTER_REDIRECT_URL];
