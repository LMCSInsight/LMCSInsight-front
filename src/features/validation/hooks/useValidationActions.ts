import { useMutation, useQueryClient } from '@tanstack/react-query'
import { validationApi } from '@/features/validation/api/validationApi'
import type {
  ValidatePayload,
  RejectPayload,
  RevisePayload,
} from '@/features/validation/types'

function useInvalidateAll(supervisionId: string) {
  const qc = useQueryClient()
  return () => {
    qc.invalidateQueries({ queryKey: ['validation', 'queue'] })
    qc.invalidateQueries({ queryKey: ['validation', 'detail', supervisionId] })
    qc.invalidateQueries({ queryKey: ['validation', 'stats'] })
    qc.invalidateQueries({ queryKey: ['validation', 'history'] })
    qc.invalidateQueries({ queryKey: ['supervision', supervisionId] })
    qc.invalidateQueries({ queryKey: ['supervisions'] })
  }
}

export function useValidateSupervision(supervisionId: string) {
  const invalidate = useInvalidateAll(supervisionId)
  return useMutation({
    mutationFn: (data: ValidatePayload) =>
      validationApi.validate(supervisionId, data).then((r) => r.data),
    onSuccess: invalidate,
  })
}

export function useRejectSupervision(supervisionId: string) {
  const invalidate = useInvalidateAll(supervisionId)
  return useMutation({
    mutationFn: (data: RejectPayload) =>
      validationApi.reject(supervisionId, data).then((r) => r.data),
    onSuccess: invalidate,
  })
}

export function useReviseSupervision(supervisionId: string) {
  const invalidate = useInvalidateAll(supervisionId)
  return useMutation({
    mutationFn: (data: RevisePayload) =>
      validationApi.revise(supervisionId, data).then((r) => r.data),
    onSuccess: invalidate,
  })
}
