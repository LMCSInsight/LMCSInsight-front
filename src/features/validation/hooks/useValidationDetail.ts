import { useQuery } from '@tanstack/react-query'
import { supervisionApi } from '@/features/supervisions/api/supervisionApi'

export function useValidationDetail(supervisionId: string | undefined) {
  return useQuery({
    queryKey: ['validation', 'detail', supervisionId],
    queryFn: () => supervisionApi.getById(supervisionId!).then((r) => r.data),
    enabled: !!supervisionId,
  })
}
