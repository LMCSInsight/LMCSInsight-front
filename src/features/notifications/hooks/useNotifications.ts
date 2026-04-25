import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axiosInstance from '@/shared/lib/axios'

export interface AppNotification {
  id: string
  type: 'VALIDATION_DECISION' | 'NEW_SUBMISSION' | 'RESUBMISSION'
  title: string
  message: string
  readAt: string | null
  supervisionId: string | null
  supervision: { id: string; title: string } | null
  createdAt: string
}

async function fetchNotifications(): Promise<AppNotification[]> {
  const res = await axiosInstance.get<AppNotification[]>('/v1/notifications')
  return res.data
}

async function markRead(id: string): Promise<void> {
  await axiosInstance.post(`/v1/notifications/${id}/read`)
}

export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
    refetchInterval: 30_000,
    staleTime: 15_000,
  })
}

export function useMarkNotificationRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: markRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  })
}
