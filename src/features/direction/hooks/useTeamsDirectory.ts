import { useQuery } from '@tanstack/react-query'
import { teamApi } from '@/features/admin/api/teamApi'
import type { TeamsFilter } from '@/features/admin/api/teamApi'

/** Read-only teams list for Direction portal (same `/v1/teams` as admin; RBAC enforced by API). */
export function useTeamsDirectory(filters: TeamsFilter = {}) {
  return useQuery({
    queryKey: ['teams-directory', filters],
    queryFn: () => teamApi.getAll(filters).then((r) => r.data),
    retry: 1,
  })
}
