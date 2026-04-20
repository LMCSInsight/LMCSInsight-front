import axiosInstance from '@/shared/lib/axios'
import type {
  ValidationQueueResponse,
  ValidationHistoryResponse,
  ValidationStats,
  QueueFilters,
  HistoryFilters,
  ValidatePayload,
  RejectPayload,
  RevisePayload,
} from '@/features/validation/types'
import type { Supervision } from '@/features/supervisions/types'

export const validationApi = {
  getQueue: (filters: QueueFilters = {}) =>
    axiosInstance.get<ValidationQueueResponse>('/v1/validation/queue', {
      params: filters,
    }),

  getStats: () => axiosInstance.get<ValidationStats>('/v1/validation/stats'),

  getHistory: (filters: HistoryFilters = {}) =>
    axiosInstance.get<ValidationHistoryResponse>('/v1/validation/history', {
      params: filters,
    }),

  validate: (supervisionId: string, data: ValidatePayload = {}) =>
    axiosInstance.post<Supervision>(
      `/v1/supervisions/${supervisionId}/validate`,
      data,
    ),

  reject: (supervisionId: string, data: RejectPayload) =>
    axiosInstance.post<Supervision>(
      `/v1/supervisions/${supervisionId}/reject`,
      data,
    ),

  revise: (supervisionId: string, data: RevisePayload) =>
    axiosInstance.post<Supervision>(
      `/v1/supervisions/${supervisionId}/revise`,
      data,
    ),
}
