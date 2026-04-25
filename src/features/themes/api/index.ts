import axiosInstance from '@/shared/lib/axios'

export interface TeamRef {
  id: string
  name: string
  description?: string | null
}

export interface Theme {
  id: string
  name: string
  description?: string | null
  teamId?: string | null
  team?: TeamRef | null
  createdAt: string
  updatedAt: string
}

export interface ThemesPage {
  data: Theme[]
  total: number
  page: number
  limit: number
}

export interface ThemePayload {
  name: string
  description?: string
  teamId?: string | null
}

export interface ThemesFilter {
  search?: string
  teamId?: string
  page?: number
  limit?: number
}

export const themeApi = {
  getAll: (filters: ThemesFilter = {}) =>
    axiosInstance.get<ThemesPage>('/v1/themes', { params: filters }),

  getById: (id: string) => axiosInstance.get<Theme>(`/v1/themes/${id}`),

  create: (data: ThemePayload) => axiosInstance.post<Theme>('/v1/themes', data),

  update: (id: string, data: Partial<ThemePayload>) =>
    axiosInstance.put<Theme>(`/v1/themes/${id}`, data),

  delete: (id: string) => axiosInstance.delete(`/v1/themes/${id}`),
}
