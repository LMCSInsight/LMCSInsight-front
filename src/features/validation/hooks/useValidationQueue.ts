import { useQuery } from '@tanstack/react-query'
import { validationApi } from '@/features/validation/api/validationApi'
import type { QueueFilters } from '@/features/validation/types'

export function useValidationQueue(filters: QueueFilters = {}) {
  return useQuery({
    queryKey: ['validation', 'queue', filters],
    queryFn: () => validationApi.getQueue(filters).then((r) => r.data),
  })
}
