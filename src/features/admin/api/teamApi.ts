import axiosInstance from '@/shared/lib/axios'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Team {
  id: string
  name: string
  description?: string | null
  themeId: string
  theme: {
    id: string
    name: string
  }
  members?: Array<{
    chercheur_id: string
    nom_complet: string
  }>
  createdAt: string
  updatedAt: string
  _count?: {
    members: number
  }
}

export interface TeamsPage {
  data: Team[]
  total: number
  page: number
  limit: number
}

export interface TeamPayload {
  name: string
  description?: string
  themeId: string
  memberIds?: string[]
}

export interface TeamsFilter {
  search?: string
  page?: number
  limit?: number
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const teamApi = {
  getAll: (filters: TeamsFilter = {}) =>
    axiosInstance.get<TeamsPage>('/v1/teams', { params: filters }),

  getById: (id: string) => axiosInstance.get<Team>(`/v1/teams/${id}`),

  create: (data: TeamPayload) => axiosInstance.post<Team>('/v1/teams', data),

  update: (id: string, data: Partial<TeamPayload>) =>
    axiosInstance.put<Team>(`/v1/teams/${id}`, data),

  delete: (id: string) => axiosInstance.delete(`/v1/teams/${id}`),
}
