import axios from 'axios';
import type { AxiosInstance } from 'axios';
import { API_BASE_URL } from '@/services/http/api-base-url';

const defaultConfig = {
  baseURL: API_BASE_URL,
  timeout: 10_000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
};

// Main API client
export const http: AxiosInstance = axios.create(defaultConfig);

// Auth client: does not use the main API interceptors
export const authClient: AxiosInstance = axios.create(defaultConfig);
