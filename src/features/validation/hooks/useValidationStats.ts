import { useQuery } from '@tanstack/react-query'
import { validationApi } from '@/features/validation/api/validationApi'

export function useValidationStats() {
  return useQuery({
    queryKey: ['validation', 'stats'],
    queryFn: () => validationApi.getStats().then((r) => r.data),
  })
}
