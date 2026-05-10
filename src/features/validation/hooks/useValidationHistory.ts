import { useQuery } from '@tanstack/react-query'
import { validationApi } from '@/features/validation/api/validationApi'
import type { HistoryFilters } from '@/features/validation/types'

export function useValidationHistory(filters: HistoryFilters = {}) {
  return useQuery({
    queryKey: ['validation', 'history', filters],
    queryFn: () => validationApi.getHistory(filters).then((r) => r.data),
  })
}
