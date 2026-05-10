import { useQuery } from '@tanstack/react-query'
import { adminApi } from '@/features/admin/api/adminApi'
import { useAuthContext } from '@/shared/context/AuthContext'
import { canUseAdminApi } from '@/shared/lib/authToken'

export function useAdminStats() {
  const { currentUser } = useAuthContext()
  const canQuery = canUseAdminApi(currentUser?.role)

  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminApi.getStats().then((res) => res.data),
    enabled: canQuery,
    retry: false,
    staleTime: 60_000,
  })
}
