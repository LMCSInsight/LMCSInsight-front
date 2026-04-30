import type {
  Supervision,
  SupervisionStatus,
  SupervisionType,
} from '@/features/supervisions/types'

export const SUPERVISION_TYPE_LABEL_FR: Record<SupervisionType, string> = {
  PFE: 'PFE',
  MASTER: 'Master',
  PHD: 'Doctorat',
  INTERNSHIP: 'Stage',
  PROJECT: 'Projet',
}

export const SUPERVISION_STATUS_FR: Record<SupervisionStatus, string> = {
  IN_PROGRESS: 'En cours',
  DEFENDED: 'Soutenu',
  ABANDONED: 'Abandonné',
  EXTENSION: 'Prolongation',
  SUSPENDED: 'Suspendu',
}

/** Checkbox filter keys: supervision lifecycle + validation backlog */
export const SEARCH_STATUS_FILTER_KEYS = [
  'IN_PROGRESS',
  'DEFENDED',
  'ABANDONED',
  'EXTENSION',
  'SUSPENDED',
  'VALIDATION_PENDING',
] as const

export const SEARCH_STATUS_FILTER_LABELS: Record<
  (typeof SEARCH_STATUS_FILTER_KEYS)[number],
  string
> = {
  IN_PROGRESS: SUPERVISION_STATUS_FR.IN_PROGRESS,
  DEFENDED: SUPERVISION_STATUS_FR.DEFENDED,
  ABANDONED: SUPERVISION_STATUS_FR.ABANDONED,
  EXTENSION: SUPERVISION_STATUS_FR.EXTENSION,
  SUSPENDED: SUPERVISION_STATUS_FR.SUSPENDED,
  VALIDATION_PENDING: 'Validation en attente',
}

export type SearchSupervisionRow = {
  id: string
  studentId: string
  title: string
  student: string
  type: SupervisionType
  supervisors: string
  theme: string
  statusKey: SupervisionStatus
  validationPending: boolean
  academicYear: string
  hasExternalSupervisor: boolean
}

export function studentDisplayName(s: Supervision): string {
  const st = s.student
  if (!st) return '—'
  return `${st.firstName} ${st.lastName}`.trim() || '—'
}

export function supervisorsDisplayLine(s: Supervision): string {
  const parts = (s.supervisors ?? [])
    .map((x) => x.supervisor?.nom_complet?.trim())
    .filter(Boolean) as string[]
  return parts.join(', ') || '—'
}

export function themeDisplay(s: Supervision): string {
  return s.theme?.name?.trim() || 'Sans thème'
}

export function toSearchSupervisionRow(s: Supervision): SearchSupervisionRow {
  return {
    id: s.id,
    studentId: s.studentId,
    title: s.title,
    student: studentDisplayName(s),
    type: s.type,
    supervisors: supervisorsDisplayLine(s),
    theme: themeDisplay(s),
    statusKey: s.status,
    validationPending: s.validationStatus === 'PENDING',
    academicYear: s.academicYear,
    hasExternalSupervisor: (s.supervisors ?? []).some((x) => x.isExternal),
  }
}

export function supervisionStatusBadgeLabel(s: Supervision): string {
  if (s.validationStatus === 'PENDING') return 'Validation en attente'
  return SUPERVISION_STATUS_FR[s.status] ?? s.status
}

export function searchRowBadgeLabel(row: SearchSupervisionRow): string {
  if (row.validationPending) return 'Validation en attente'
  return SUPERVISION_STATUS_FR[row.statusKey] ?? row.statusKey
}

export function matchesSupervisionStatusFilter(
  row: SearchSupervisionRow,
  statuses: string[],
): boolean {
  if (statuses.length === 0) return true
  return statuses.some((k) =>
    k === 'VALIDATION_PENDING' ? row.validationPending : row.statusKey === k,
  )
}
