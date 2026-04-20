import axiosInstance from '@/shared/lib/axios'
import type { LoginCredentials, AuthResponse } from '@/features/auth/types'

export const authApi = {
  login: (credentials: LoginCredentials) =>
    axiosInstance.post<AuthResponse>('/v1/auth/login', credentials),

  refresh: (refreshToken: string) =>
    axiosInstance.post<{ accessToken: string }>('/v1/auth/refresh', {
      refreshToken,
    }),

  logout: () => axiosInstance.post('/v1/auth/logout'),

  me: () => axiosInstance.get<{ user: AuthResponse['user'] }>('/v1/auth/me'),

  forgotPassword: (email: string) =>
    axiosInstance.post('/v1/auth/forgot-password', { email }),
}
