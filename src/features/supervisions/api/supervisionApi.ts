import axiosInstance from '@/shared/lib/axios'
import type {
  Supervision,
  SupervisionsPage,
  CreateSupervisionPayload,
  UpdateSupervisionPayload,
  AssignSupervisorPayload,
  ReplaceSupervisionSupervisorsPayload,
  SupervisionsFilter,
} from '@/features/supervisions/types'

/** Only defined values; duplicate snake_case keys some backends expect on query strings. */
function buildSupervisionsQueryParams(
  filters: SupervisionsFilter,
): Record<string, string | number> {
  const out: Record<string, string | number> = {}
  if (filters.page != null) out.page = filters.page
  if (filters.limit != null) out.limit = filters.limit
  const q = filters.search?.trim()
  if (q) out.search = q
  if (filters.type) out.type = filters.type
  if (filters.status) out.status = filters.status
  if (filters.validationStatus) {
    out.validationStatus = filters.validationStatus
    out.validation_status = filters.validationStatus
  }
  if (filters.academicYear) {
    out.academicYear = filters.academicYear
    out.academic_year = filters.academicYear
  }
  if (filters.supervisorId) {
    out.supervisorId = filters.supervisorId
  }
  return out
}

export const supervisionApi = {
  getAll: (filters: SupervisionsFilter = {}) => {
    const params = buildSupervisionsQueryParams(filters)
    return axiosInstance.get<SupervisionsPage>('/v1/supervisions', {
      params,
    })
  },

  getById: (id: string) =>
    axiosInstance.get<Supervision>(`/v1/supervisions/${id}`),

  create: (data: CreateSupervisionPayload) =>
    axiosInstance.post<Supervision>('/v1/supervisions', data),

  update: (id: string, data: UpdateSupervisionPayload) =>
    axiosInstance.put<Supervision>(`/v1/supervisions/${id}`, data),

  delete: (id: string) => axiosInstance.delete(`/v1/supervisions/${id}`),

  assignSupervisor: (supervisionId: string, data: AssignSupervisorPayload) =>
    axiosInstance.post(`/v1/supervisions/${supervisionId}/supervisors`, {
      supervisorId: data.supervisorId,
      supervisor_id: data.supervisorId,
      isMainSupervisor: data.isMainSupervisor,
      is_main_supervisor: data.isMainSupervisor,
      isExternal: data.isExternal,
      is_external: data.isExternal,
      ...(data.contributionPercent != null
        ? {
            contributionPercent: data.contributionPercent,
            contribution_percent: data.contributionPercent,
          }
        : {}),
    }),

  replaceSupervisionSupervisors: (
    supervisionId: string,
    data: ReplaceSupervisionSupervisorsPayload,
  ) =>
    axiosInstance.put<Supervision>(
      `/v1/supervisions/${supervisionId}/supervisors`,
      {
        supervisors: data.supervisors.map((r) => ({
          supervisorId: r.supervisorId,
          supervisor_id: r.supervisorId,
          isMainSupervisor: r.isMainSupervisor,
          is_main_supervisor: r.isMainSupervisor,
          isExternal: r.isExternal,
          is_external: r.isExternal,
          contributionPercent: r.contributionPercent,
          contribution_percent: r.contributionPercent,
        })),
      },
    ),

  removeSupervisor: (supervisionId: string, supervisorId: string) =>
    axiosInstance.delete(
      `/v1/supervisions/${supervisionId}/supervisors/${supervisorId}`,
    ),
}
