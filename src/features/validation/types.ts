import type {
  ValidationStatus,
  SupervisionType,
  Supervision,
} from '@/features/supervisions/types'

export type { ValidationStatus }

export interface ValidationLogEntry {
  id: string
  supervisionId: string
  validatorId: string
  status: ValidationStatus
  comments?: string | null
  fieldsChecked?: Record<string, boolean> | null
  issues?: string[] | null
  createdAt: string
  supervision?: {
    id: string
    title: string
    type: SupervisionType
    academicYear: string
    validationStatus: ValidationStatus
  }
}

export type ValidationQueueItem = Supervision

export interface ValidationQueueResponse {
  data: ValidationQueueItem[]
  total: number
  page: number
  limit: number
}

export interface ValidationHistoryResponse {
  data: ValidationLogEntry[]
  total: number
  page: number
  limit: number
}

export interface ValidationStats {
  pending: number
  validatedToday: number
  rejectedThisWeek: number
  revisedThisWeek: number
  byType: Record<string, number>
}

export interface QueueFilters {
  status?: ValidationStatus
  search?: string
  type?: SupervisionType
  academicYear?: string
  page?: number
  limit?: number
}

export interface HistoryFilters {
  status?: ValidationStatus
  from?: string
  to?: string
  page?: number
  limit?: number
}

export interface ValidatePayload {
  comments?: string
  fieldsChecked?: Record<string, boolean>
}

export interface RejectPayload {
  comments: string
  issues: string[]
}

export interface RevisePayload {
  comments: string
  issues: string[]
}
