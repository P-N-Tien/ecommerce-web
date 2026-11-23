import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '@/lib/api/api-base-url';

export interface UnwrappedAxiosInstance
  extends Omit<AxiosInstance, 'get' | 'post' | 'put' | 'patch' | 'delete' | 'request'> {
  <T = unknown>(config: AxiosRequestConfig): Promise<T>;
  <T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T>;
  request<T = unknown>(config: AxiosRequestConfig): Promise<T>;
  get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T>;
  delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T>;
  post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>;
  put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>;
  patch<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>;
}

const defaultConfig = {
  baseURL: API_BASE_URL,
  timeout: 10_000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
};

export const http = axios.create(defaultConfig) as UnwrappedAxiosInstance;

export const authClient: AxiosInstance = axios.create(defaultConfig);
