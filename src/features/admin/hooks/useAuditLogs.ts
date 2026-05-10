import { useQuery } from '@tanstack/react-query'
import { adminApi } from '@/features/admin/api/adminApi'
import type { AuditLogsFilter } from '@/features/admin/api/adminApi'
import { useAuthContext } from '@/shared/context/AuthContext'
import { canUseAdminApi } from '@/shared/lib/authToken'

export function useAuditLogs(filters: AuditLogsFilter = {}) {
  const { currentUser } = useAuthContext()
  const canQuery = canUseAdminApi(currentUser?.role)

  return useQuery({
    queryKey: ['admin-audit-logs', filters],
    queryFn: () => adminApi.getAuditLogs(filters).then((res) => res.data),
    enabled: canQuery,
    retry: false,
  })
}
