import axiosInstance from '@/shared/lib/axios'

export interface ChercheurListItem {
  chercheur_id: string
  nom_complet: string
  qualite: string
  grade_recherche: string | null
  mails: string[]
  teams: Array<{ id: string; name: string }>
}

export interface ChercheursPage {
  data: ChercheurListItem[]
  total: number
  page: number
  limit: number
}

export interface ChercheursFilter {
  search?: string
  page?: number
  limit?: number
}

export const chercheurApi = {
  getAll: (filters: ChercheursFilter = {}) =>
    axiosInstance.get<ChercheursPage>('/v1/chercheurs', { params: filters }),
}
