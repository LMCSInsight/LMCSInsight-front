import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { themeApi } from '@/features/themes/api'
import type { ThemePayload, ThemesFilter } from '@/features/themes/api'

export function useThemes(filters: ThemesFilter = {}) {
  return useQuery({
    queryKey: ['themes', filters],
    queryFn: () => themeApi.getAll(filters).then((res) => res.data),
  })
}

export function useTheme(id: string | undefined) {
  return useQuery({
    queryKey: ['theme', id],
    queryFn: () => themeApi.getById(id!).then((res) => res.data),
    enabled: !!id,
  })
}

export function useCreateTheme() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: ThemePayload) =>
      themeApi.create(data).then((res) => res.data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['themes'] })
    },
  })
}

export function useUpdateTheme(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<ThemePayload>) =>
      themeApi.update(id, data).then((res) => res.data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['themes'] })
      void qc.invalidateQueries({ queryKey: ['theme', id] })
    },
  })
}

export function useDeleteTheme() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => themeApi.delete(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['themes'] })
    },
  })
}
