// ─── Enums (match backend exactly) ───────────────────────────────────────────

export type SupervisionType =
  | 'PFE'
  | 'MASTER'
  | 'PHD'
  | 'INTERNSHIP'
  | 'PROJECT'
export type SupervisionStatus =
  | 'IN_PROGRESS'
  | 'DEFENDED'
  | 'ABANDONED'
  | 'EXTENSION'
  | 'SUSPENDED'
export type ValidationStatus = 'PENDING' | 'VALIDATED' | 'REJECTED' | 'REVISED'

// ─── Nested shapes returned by the backend ───────────────────────────────────

export interface StudentInfo {
  id: string
  firstName: string
  lastName: string
  email: string
  institution: string
  level: string
  specialty?: string | null
}

export interface ChercheurInfo {
  chercheur_id: string
  nom_complet: string
  mails: string[]
  qualite?: string
  equipe_id?: string | null
}

export interface SupervisionSupervisorInfo {
  id: string
  supervisionId: string
  supervisorId: string
  isMainSupervisor: boolean
  isExternal: boolean
  contributionPercent: number
  supervisor: ChercheurInfo
  createdAt: string
}

export interface ThemeInfo {
  id: string
  name: string
  description?: string | null
}

export interface ValidationLogInfo {
  id: string
  status: ValidationStatus
  comments?: string | null
  fieldsChecked?: unknown
  issues?: unknown
  createdAt: string
}

// ─── Main Supervision model ───────────────────────────────────────────────────

export interface Supervision {
  id: string
  title: string
  type: SupervisionType
  description?: string | null
  status: SupervisionStatus
  validationStatus: ValidationStatus
  validatedAt?: string | null
  validationNotes?: string | null
  academicYear: string
  startDate: string
  expectedEndDate?: string | null
  actualEndDate?: string | null
  keywords: string[]
  studentId: string
  student?: StudentInfo
  themeId?: string | null
  theme?: ThemeInfo | null
  supervisors: SupervisionSupervisorInfo[]
  validations?: ValidationLogInfo[]
  createdAt: string
  updatedAt: string
}

// ─── Paginated list response ──────────────────────────────────────────────────

export interface SupervisionsPage {
  data: Supervision[]
  total: number
  page: number
  limit: number
}

// ─── Request payloads ─────────────────────────────────────────────────────────

export interface CreateSupervisionPayload {
  title: string
  type: SupervisionType
  description?: string
  status?: SupervisionStatus
  academicYear: string
  startDate: string
  expectedEndDate?: string
  actualEndDate?: string
  keywords?: string[]
  studentId: string
  themeId?: string
}

export interface UpdateSupervisionPayload {
  title?: string
  type?: SupervisionType
  description?: string
  status?: SupervisionStatus
  academicYear?: string
  startDate?: string
  expectedEndDate?: string
  actualEndDate?: string
  keywords?: string[]
  studentId?: string
  themeId?: string
}

export interface AssignSupervisorPayload {
  supervisorId: string
  isMainSupervisor?: boolean
  isExternal?: boolean
  contributionPercent?: number
}

export interface SupervisionSupervisorReplaceRow {
  supervisorId: string
  isMainSupervisor: boolean
  isExternal?: boolean
  contributionPercent: number
}

export interface ReplaceSupervisionSupervisorsPayload {
  supervisors: SupervisionSupervisorReplaceRow[]
}

// ─── Filter params for GET /v1/supervisions ──────────────────────────────────

export interface SupervisionsFilter {
  type?: SupervisionType
  status?: SupervisionStatus
  validationStatus?: ValidationStatus
  academicYear?: string
  supervisorId?: string
  search?: string
  page?: number
  limit?: number
}
