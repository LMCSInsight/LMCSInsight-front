import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { teamApi } from '@/features/admin/api/teamApi'
import type { TeamPayload, TeamsFilter } from '@/features/admin/api/teamApi'
import { useAuthContext } from '@/shared/context/AuthContext'
import { canUseAdminApi } from '@/shared/lib/authToken'

export function useTeams(filters: TeamsFilter = {}) {
  const { currentUser } = useAuthContext()
  return useQuery({
    queryKey: ['admin-teams', filters],
    queryFn: () => teamApi.getAll(filters).then((res) => res.data),
    enabled: canUseAdminApi(currentUser?.role),
    retry: false,
  })
}

export function useTeam(id: string | undefined) {
  const { currentUser } = useAuthContext()
  return useQuery({
    queryKey: ['admin-team', id],
    queryFn: () => teamApi.getById(id!).then((res) => res.data),
    enabled: !!id && canUseAdminApi(currentUser?.role),
    retry: false,
  })
}

export function useCreateTeam() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: TeamPayload) =>
      teamApi.create(data).then((res) => res.data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin-teams'] })
    },
  })
}

export function useUpdateTeam(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<TeamPayload>) =>
      teamApi.update(id, data).then((res) => res.data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin-teams'] })
      void qc.invalidateQueries({ queryKey: ['admin-team', id] })
    },
  })
}

export function useDeleteTeam() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => teamApi.delete(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin-teams'] })
    },
  })
}
