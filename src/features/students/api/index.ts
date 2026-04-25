import axiosInstance from '@/shared/lib/axios'

// ─── Types ────────────────────────────────────────────────────────────────────

export type Institution = 'ESI' | 'EXTERNE'
export type StudentLevel = 'MASTER' | 'DOCTORANT'
export type Specialty = 'SIL' | 'SID' | 'SIT' | 'SIQ'

export interface Student {
  id: string
  firstName: string
  lastName: string
  email: string
  institution: Institution
  level: StudentLevel
  specialty?: Specialty | null
  supervisions?: unknown[]
  createdAt: string
  updatedAt: string
}

export interface StudentsPage {
  data: Student[]
  total: number
  page: number
  limit: number
}

export interface StudentPayload {
  firstName: string
  lastName: string
  email: string
  institution: Institution
  level: StudentLevel
  specialty?: Specialty
}

export interface StudentsFilter {
  search?: string
  institution?: Institution
  level?: StudentLevel
  page?: number
  limit?: number
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const studentApi = {
  getAll: (filters: StudentsFilter = {}) =>
    axiosInstance.get<StudentsPage>('/v1/students', { params: filters }),

  getById: (id: string) => axiosInstance.get<Student>(`/v1/students/${id}`),

  create: (data: StudentPayload) =>
    axiosInstance.post<Student>('/v1/students', data),

  update: (id: string, data: Partial<StudentPayload>) =>
    axiosInstance.put<Student>(`/v1/students/${id}`, data),

  delete: (id: string) => axiosInstance.delete(`/v1/students/${id}`),
}
