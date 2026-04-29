import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userApi } from '@/features/admin/api/userApi'
import type { UserPayload, UsersFilter } from '@/features/admin/api/userApi'
import { useAuthContext } from '@/shared/context/AuthContext'
import { canUseAdminApi } from '@/shared/lib/authToken'

export function useUsers(filters: UsersFilter = {}) {
  const { currentUser } = useAuthContext()
  return useQuery({
    queryKey: ['admin-users', filters],
    queryFn: () => userApi.getAll(filters).then((res) => res.data),
    enabled: canUseAdminApi(currentUser?.role),
    retry: false,
  })
}

export function useUser(id: string | undefined) {
  const { currentUser } = useAuthContext()
  return useQuery({
    queryKey: ['admin-user', id],
    queryFn: () => userApi.getById(id!).then((res) => res.data),
    enabled: !!id && canUseAdminApi(currentUser?.role),
    retry: false,
  })
}

export function useUserStats() {
  const { currentUser } = useAuthContext()
  return useQuery({
    queryKey: ['admin-user-stats'],
    queryFn: () => userApi.getStats().then((res) => res.data),
    enabled: canUseAdminApi(currentUser?.role),
    retry: false,
  })
}

export function useCreateUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: UserPayload) =>
      userApi.create(data).then((res) => res.data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin-users'] })
      void qc.invalidateQueries({ queryKey: ['admin-user-stats'] })
    },
  })
}

export function useUpdateUser(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<UserPayload>) =>
      userApi.update(id, data).then((res) => res.data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin-users'] })
      void qc.invalidateQueries({ queryKey: ['admin-user', id] })
    },
  })
}

export function useToggleUserStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      userApi.toggleStatus(id).then((res) => res.data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin-users'] })
      void qc.invalidateQueries({ queryKey: ['admin-user-stats'] })
    },
  })
}

export function useResetUserPassword() {
  return useMutation({
    mutationFn: ({ id, password }: { id: string; password: string }) =>
      userApi.resetPassword(id, password).then((res) => res.data),
  })
}

export function useDeleteUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => userApi.toggleStatus(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin-users'] })
      void qc.invalidateQueries({ queryKey: ['admin-user-stats'] })
    },
  })
}
