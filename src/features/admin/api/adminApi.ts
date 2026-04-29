import axiosInstance from '@/shared/lib/axios'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AdminStats {
  users: {
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
  supervisions: {
    total: number
    byValidationStatus: {
      PENDING: number
      VALIDATED: number
      REJECTED: number
      REVISED: number
    }
  }
  recentActivity: {
    count: number
    periodDays: number
  }
}

export interface AuditLogUser {
  id: string
  firstName: string
  lastName: string
  role: string
  email: string
}

export interface AuditLog {
  id: string
  action: string
  entityType: string
  entityId?: string | null
  changes?: unknown
  ipAddress?: string | null
  userAgent?: string | null
  userId?: string | null
  supervisionId?: string | null
  createdAt: string
  user?: AuditLogUser | null
}

export interface AuditLogsPage {
  data: AuditLog[]
  total: number
  page: number
  limit: number
}

export interface AuditLogsFilter {
  from?: string
  to?: string
  userId?: string
  action?: string
  entityType?: string
  page?: number
  limit?: number
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const adminApi = {
  getStats: () => axiosInstance.get<AdminStats>('/v1/admin/stats'),

  getAuditLogs: (filters: AuditLogsFilter = {}) =>
    axiosInstance.get<AuditLogsPage>('/v1/admin/audit-logs', {
      params: filters,
    }),
}
