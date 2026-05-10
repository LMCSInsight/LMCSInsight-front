import { useQuery } from '@tanstack/react-query'
import { chercheurApi, type ChercheursFilter } from '@/features/chercheurs/api'

export function useChercheurs(filters: ChercheursFilter = {}) {
  return useQuery({
    queryKey: ['chercheurs', filters],
    queryFn: () => chercheurApi.getAll(filters).then((r) => r.data),
  })
}
