import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { studentApi } from '@/features/students/api'
import type { StudentPayload, StudentsFilter } from '@/features/students/api'

export function useStudents(filters: StudentsFilter = {}) {
  return useQuery({
    queryKey: ['students', filters],
    queryFn: () => studentApi.getAll(filters).then((res) => res.data),
  })
}

export function useStudent(id: string | undefined) {
  return useQuery({
    queryKey: ['student', id],
    queryFn: () => studentApi.getById(id!).then((res) => res.data),
    enabled: !!id,
  })
}

export function useCreateStudent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: StudentPayload) =>
      studentApi.create(data).then((res) => res.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['students'] }),
  })
}

export function useUpdateStudent(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<StudentPayload>) =>
      studentApi.update(id, data).then((res) => res.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['students'] })
      qc.invalidateQueries({ queryKey: ['student', id] })
    },
  })
}

export function useDeleteStudent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => studentApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['students'] }),
  })
}
