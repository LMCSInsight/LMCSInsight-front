import axios, { type InternalAxiosRequestConfig } from "axios";
import { env } from "@/config/env";
import { APP_CONSTANTS } from "@/config/constants";

const axiosInstance = axios.create({
  baseURL: env.API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(APP_CONSTANTS.STORAGE_KEYS.TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(APP_CONSTANTS.STORAGE_KEYS.TOKEN);
      localStorage.removeItem(APP_CONSTANTS.STORAGE_KEYS.USER);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
