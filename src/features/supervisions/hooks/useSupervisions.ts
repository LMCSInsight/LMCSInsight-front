import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supervisionApi } from '@/features/supervisions/api/supervisionApi'
import type {
  SupervisionsFilter,
  CreateSupervisionPayload,
  UpdateSupervisionPayload,
  AssignSupervisorPayload,
  ReplaceSupervisionSupervisorsPayload,
} from '@/features/supervisions/types'

export function useSupervisions(filters: SupervisionsFilter = {}) {
  return useQuery({
    queryKey: ['supervisions', filters],
    queryFn: () => supervisionApi.getAll(filters).then((res) => res.data),
  })
}

export function useSupervision(id: string | undefined) {
  return useQuery({
    queryKey: ['supervision', id],
    queryFn: () => supervisionApi.getById(id!).then((res) => res.data),
    enabled: !!id,
  })
}

export function useCreateSupervision() {
  return useMutation({
    mutationFn: (data: CreateSupervisionPayload) =>
      supervisionApi.create(data).then((res) => res.data),
  })
}

export function useUpdateSupervision(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateSupervisionPayload) =>
      supervisionApi.update(id, data).then((res) => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['supervisions'] })
      qc.invalidateQueries({ queryKey: ['supervision', id] })
    },
  })
}

export function useDeleteSupervision() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await supervisionApi.delete(id)
      return id
    },
    onSuccess: (id) => {
      void qc.invalidateQueries({ queryKey: ['supervisions'] })
      void qc.removeQueries({ queryKey: ['supervision', id] })
    },
  })
}

export function useAssignSupervisor(supervisionId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: AssignSupervisorPayload) =>
      supervisionApi
        .assignSupervisor(supervisionId, data)
        .then((res) => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['supervision', supervisionId] })
      qc.invalidateQueries({ queryKey: ['supervisions'] })
    },
  })
}

export function useRemoveSupervisor(supervisionId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (supervisorId: string) =>
      supervisionApi.removeSupervisor(supervisionId, supervisorId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['supervision', supervisionId] })
      qc.invalidateQueries({ queryKey: ['supervisions'] })
    },
  })
}

export function useReplaceSupervisionSupervisors(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: ReplaceSupervisionSupervisorsPayload) =>
      supervisionApi
        .replaceSupervisionSupervisors(id, data)
        .then((res) => res.data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['supervision', id] })
      void qc.invalidateQueries({ queryKey: ['supervisions'] })
    },
  })
}
