import axiosInstance from "@/shared/lib/axios";
import type { LoginCredentials, AuthResponse } from "@/features/auth/types";

export const authApi = {
  login: (credentials: LoginCredentials) =>
    axiosInstance.post<AuthResponse>("/auth/login", credentials),

  logout: () => axiosInstance.post("/auth/logout"),

  forgotPassword: (email: string) =>
    axiosInstance.post("/auth/forgot-password", { email }),
};
