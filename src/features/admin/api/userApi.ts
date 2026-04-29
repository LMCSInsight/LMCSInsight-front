import axiosInstance from '@/shared/lib/axios'

// ─── Types ────────────────────────────────────────────────────────────────────

export type UserRole = 'ADMIN' | 'DIRECTOR' | 'RESEARCHER' | 'ASSISTANT'

export interface AdminUser {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  phoneNumber?: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface UsersPage {
  data: AdminUser[]
  total: number
  page: number
  limit: number
}

export interface UserPayload {
  email: string
  password?: string
  firstName: string
  lastName: string
  role: UserRole
  phoneNumber?: string
}

export interface UsersFilter {
  search?: string
  role?: UserRole
  isActive?: boolean
  page?: number
  limit?: number
}

export interface UserStats {
  total: number
  active: number
  inactive: number
  byRole: {
    ADMIN: number
    DIRECTOR: number
    RESEARCHER: number
    ASSISTANT: number
  }
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const userApi = {
  getAll: (filters: UsersFilter = {}) =>
    axiosInstance.get<UsersPage>('/v1/users', { params: filters }),

  getById: (id: string) => axiosInstance.get<AdminUser>(`/v1/users/${id}`),

  create: (data: UserPayload) =>
    axiosInstance.post<AdminUser>('/v1/users', data),

  update: (id: string, data: Partial<UserPayload>) =>
    axiosInstance.put<AdminUser>(`/v1/users/${id}`, data),

  toggleStatus: (id: string) =>
    axiosInstance.patch<AdminUser>(`/v1/users/${id}/status`),

  resetPassword: (id: string, password: string) =>
    axiosInstance.post<{ id: string; email: string }>(
      `/v1/users/${id}/reset-password`,
      { password },
    ),

  getStats: () => axiosInstance.get<UserStats>('/v1/users/stats'),
}
