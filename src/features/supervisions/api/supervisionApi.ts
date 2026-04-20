import axiosInstance from '@/shared/lib/axios'
import type {
  Supervision,
  SupervisionsPage,
  CreateSupervisionPayload,
  UpdateSupervisionPayload,
  AssignSupervisorPayload,
  SupervisionsFilter,
} from '@/features/supervisions/types'

export const supervisionApi = {
  getAll: (filters: SupervisionsFilter = {}) =>
    axiosInstance.get<SupervisionsPage>('/v1/supervisions', {
      params: filters,
    }),

  getById: (id: string) =>
    axiosInstance.get<Supervision>(`/v1/supervisions/${id}`),

  create: (data: CreateSupervisionPayload) =>
    axiosInstance.post<Supervision>('/v1/supervisions', data),

  update: (id: string, data: UpdateSupervisionPayload) =>
    axiosInstance.put<Supervision>(`/v1/supervisions/${id}`, data),

  delete: (id: string) => axiosInstance.delete(`/v1/supervisions/${id}`),

  assignSupervisor: (supervisionId: string, data: AssignSupervisorPayload) =>
    axiosInstance.post(`/v1/supervisions/${supervisionId}/supervisors`, data),

  removeSupervisor: (supervisionId: string, supervisorId: string) =>
    axiosInstance.delete(
      `/v1/supervisions/${supervisionId}/supervisors/${supervisorId}`,
    ),
}
