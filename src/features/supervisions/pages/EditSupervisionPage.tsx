import { useEffect, useState, useMemo, useRef } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getAssistantThemeNewPath } from '@/config/routes'
import { cn } from '@/lib/utils'
import {
  Info,
  Users,
  Tag,
  Calendar,
  UserCheck,
  Plus,
  MinusCircle,
  CheckCircle2,
  AlertCircle,
  PencilLine,
  Star,
  Check,
  Loader2,
  Lock,
} from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { sanitizeChercheurIdForApi } from '@/features/auth/extractMatricule'
import { splitContribPercent } from '@/features/supervisions/utils/splitContribPercent'
import { SupervisorSearchPicker } from '@/features/supervisions/components/SupervisorSearchPicker'
import {
  useSupervision,
  useUpdateSupervision,
  useReplaceSupervisionSupervisors,
} from '@/features/supervisions/hooks/useSupervisions'
import type { SupervisionSupervisorReplaceRow } from '@/features/supervisions/types'
import { useStudents } from '@/features/students/hooks'
import { useThemes } from '@/features/themes/hooks'
import type {
  UpdateSupervisionPayload,
  SupervisionType,
  SupervisionStatus,
} from '@/features/supervisions/types'

// ─── Options ─────────────────────────────────────────────────────────────────

const STATUS_OPTIONS: { value: SupervisionStatus; label: string }[] = [
  { value: 'IN_PROGRESS', label: 'En cours' },
  { value: 'DEFENDED', label: 'Soutenu' },
  { value: 'ABANDONED', label: 'Abandonné' },
  { value: 'EXTENSION', label: 'Prolongation' },
  { value: 'SUSPENDED', label: 'Suspendu' },
]
const TYPE_OPTIONS: { value: SupervisionType; label: string }[] = [
  { value: 'PFE', label: 'PFE' },
  { value: 'MASTER', label: 'Master' },
  { value: 'PHD', label: 'Doctorat' },
  { value: 'INTERNSHIP', label: 'Stage (SPE)' },
  { value: 'PROJECT', label: 'Projet de recherche' },
]

const SELECT_CLASS =
  'h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50'

function toDateInput(iso?: string | null): string {
  if (!iso) return ''
  return iso.slice(0, 10)
}

// ─── Step bar ────────────────────────────────────────────────────────────────

const STEPS = ['Général', 'Étudiant', 'Thématique', 'Dates', 'Encadrants']

function StepBar() {
  return (
    <div className='flex items-center gap-0'>
      {STEPS.map((label, i) => (
        <div key={label} className='flex flex-1 items-center'>
          <div className='flex flex-col items-center gap-1'>
            <div className='flex size-7 items-center justify-center rounded-full border-2 border-primary bg-primary text-xs font-bold text-primary-foreground'>
              <Check className='size-3.5' />
            </div>
            <span className='hidden sm:block text-xs font-medium text-primary'>
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className='h-0.5 flex-1 mb-4 mx-1 rounded-full bg-primary' />
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Section header ──────────────────────────────────────────────────────────

function SectionHeader({
  icon: Icon,
  title,
  step,
}: {
  icon: React.ElementType
  title: string
  step: number
}) {
  return (
    <div className='flex items-center gap-2'>
      <div className='flex size-7 items-center justify-center rounded-md bg-primary/10'>
        <Icon className='size-4 text-primary' />
      </div>
      <span className='text-sm font-semibold text-foreground'>
        {step}. {title}
      </span>
    </div>
  )
}

function encadrantsKey(mainRaw: string, coRows: { supervisorId: string }[]) {
  const m = sanitizeChercheurIdForApi(mainRaw.trim()) || ''
  const cos = coRows
    .map((c) => sanitizeChercheurIdForApi(c.supervisorId.trim()))
    .filter(Boolean)
    .filter((id) => id !== m)
  return JSON.stringify({ m, cos: [...new Set(cos)].sort() })
}

function buildEncadrantReplaceRows(
  mainRaw: string,
  coRows: { supervisorId: string }[],
  isExternalById: Map<string, boolean>,
): SupervisionSupervisorReplaceRow[] {
  const m = sanitizeChercheurIdForApi(mainRaw.trim()) || ''
  if (!m) return []
  const coIds = coRows
    .map((c) => sanitizeChercheurIdForApi(c.supervisorId.trim()) || '')
    .filter((id): id is string => Boolean(id) && id !== m)
  const uniqueCo = [...new Set(coIds)]
  const all: string[] = [m, ...uniqueCo]
  const parts = splitContribPercent(all.length)
  return all.map((id, i) => ({
    supervisorId: id,
    isMainSupervisor: i === 0,
    isExternal: isExternalById.get(id) ?? false,
    contributionPercent: parts[i]!,
  }))
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function SkeletonCard({ rows = 3 }: { rows?: number }) {
  return (
    <Card>
      <CardContent className='space-y-4 pt-6'>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className='h-9 animate-pulse rounded-lg bg-muted' />
        ))}
      </CardContent>
    </Card>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EditSupervisionPage() {
  const { t } = useTranslation()
  const { supervisionId } = useParams<{ supervisionId: string }>()
  const navigate = useNavigate()

  const { data: supervision, isLoading } = useSupervision(supervisionId)
  const { mutateAsync: updateSupervision, isPending: isUpdatePending } =
    useUpdateSupervision(supervisionId!)
  const {
    mutateAsync: replaceSupervisionEncadrants,
    isPending: isReplacePending,
  } = useReplaceSupervisionSupervisors(supervisionId!)
  const isPending = isUpdatePending || isReplacePending
  const { data: studentsPage } = useStudents({ limit: 200 })
  const studentOptions = studentsPage?.data ?? []
  const [themeSearch, setThemeSearch] = useState('')
  const { data: themesPage } = useThemes({
    limit: 200,
    search: themeSearch.trim() || undefined,
  })
  const themeOptions = themesPage?.data ?? []

  const [title, setTitle] = useState('')
  const [status, setStatus] = useState<SupervisionStatus>('IN_PROGRESS')
  const [type, setType] = useState<SupervisionType | ''>('')
  const [academicYear, setAcademicYear] = useState('')
  const [studentId, setStudentId] = useState('')
  const [studentSearch, setStudentSearch] = useState('')
  const [themeId, setThemeId] = useState('')
  const [keywords, setKeywords] = useState('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState('')
  const [expectedEndDate, setExpectedEndDate] = useState('')
  const [actualEndDate, setActualEndDate] = useState('')
  const [mainSupervisorId, setMainSupervisorId] = useState('')
  const [coSupervisors, setCoSupervisors] = useState<
    { supervisorId: string }[]
  >([])
  const [initialEncKey, setInitialEncKey] = useState<string | null>(null)
  const encFormInitialized = useRef<string | null>(null)
  const [errors, setErrors] = useState<Record<string, boolean>>({})
  const [toast, setToast] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)

  const validationStatus = supervision?.validationStatus
  const isReadOnly = validationStatus === 'VALIDATED'
  const isRevised = validationStatus === 'REVISED'
  const isRejected = validationStatus === 'REJECTED'

  // Pre-fill from loaded supervision
  useEffect(() => {
    if (supervision) {
      setTitle(supervision.title ?? '')
      setStatus(supervision.status)
      setType(supervision.type)
      setAcademicYear(supervision.academicYear ?? '')
      setStudentId(supervision.studentId ?? '')
      setThemeId(supervision.themeId ?? '')
      setKeywords(supervision.keywords?.join(', ') ?? '')
      setDescription(supervision.description ?? '')
      setStartDate(toDateInput(supervision.startDate))
      setExpectedEndDate(toDateInput(supervision.expectedEndDate))
      setActualEndDate(toDateInput(supervision.actualEndDate))
    }
  }, [supervision])

  // Encadrants: initialize once per route (avoid clobbering edits on refetch)
  useEffect(() => {
    if (!supervisionId || !supervision || supervision.id !== supervisionId)
      return
    if (encFormInitialized.current === supervisionId) return
    encFormInitialized.current = supervisionId
    const main0 =
      supervision.supervisors.find((s) => s.isMainSupervisor)?.supervisorId ??
      ''
    const co0 = supervision.supervisors
      .filter((s) => !s.isMainSupervisor)
      .map((s) => s.supervisorId)
    setMainSupervisorId(main0)
    setCoSupervisors(co0.map((id) => ({ supervisorId: id })))
    setInitialEncKey(
      encadrantsKey(
        main0,
        co0.map((id) => ({ supervisorId: id })),
      ),
    )
  }, [supervision, supervisionId])

  function clearError(key: string) {
    if (errors[key]) setErrors((p) => ({ ...p, [key]: false }))
  }

  function validate(): boolean {
    const next: Record<string, boolean> = {}
    if (!title.trim()) next.title = true
    if (!type) next.type = true
    if (!academicYear.trim()) next.academicYear = true
    if (!studentId) next.studentId = true
    if (!startDate) next.startDate = true
    if (!themeId) next.themeId = true
    const main = sanitizeChercheurIdForApi(mainSupervisorId.trim())
    if (!main) next.mainSupervisor = true
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const isExternalBySupervisorId = useMemo(() => {
    const m = new Map<string, boolean>()
    for (const s of supervision?.supervisors ?? []) {
      m.set(s.supervisorId, s.isExternal)
    }
    return m
  }, [supervision])

  const encadrantChanged = useMemo(() => {
    if (initialEncKey == null) return false
    return encadrantsKey(mainSupervisorId, coSupervisors) !== initialEncKey
  }, [initialEncKey, mainSupervisorId, coSupervisors])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (isReadOnly) return
    if (!validate()) return

    const payload: UpdateSupervisionPayload = {
      title: title.trim(),
      type: type as SupervisionType,
      status,
      academicYear: academicYear.trim(),
      studentId,
      themeId,
      startDate,
      expectedEndDate: expectedEndDate || undefined,
      actualEndDate: actualEndDate || undefined,
      description: description.trim() || undefined,
      keywords: keywords
        ? keywords
            .split(',')
            .map((k) => k.trim())
            .filter(Boolean)
        : [],
    }

    try {
      await updateSupervision(payload)
      if (encadrantChanged) {
        const rows = buildEncadrantReplaceRows(
          mainSupervisorId,
          coSupervisors,
          isExternalBySupervisorId,
        )
        if (rows.length < 1) {
          setToast({
            type: 'error',
            message:
              "Renseignez l'encadrant principal pour enregistrer les changements d'encadrement.",
          })
          setTimeout(() => setToast(null), 5000)
          return
        }
        await replaceSupervisionEncadrants({ supervisors: rows })
      }
      setToast({
        type: 'success',
        message: 'Encadrement modifié avec succès !',
      })
      setTimeout(() => navigate(-1), 1200)
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Erreur lors de la modification'
      setToast({ type: 'error', message: msg })
      setTimeout(() => setToast(null), 3500)
    }
  }

  const existingSupervisors = supervision?.supervisors ?? []

  // Count active changes for the ribbon badge
  const changesCount = useMemo(() => {
    let n = 0
    if (encadrantChanged) n++
    if (supervision) {
      if (title !== (supervision.title ?? '')) n++
      if (type !== supervision.type) n++
      if (status !== supervision.status) n++
      if (academicYear !== (supervision.academicYear ?? '')) n++
      if (themeId !== (supervision.themeId ?? '')) n++
      if (keywords !== (supervision.keywords?.join(', ') ?? '')) n++
      if (description !== (supervision.description ?? '')) n++
    }
    return n
  }, [
    encadrantChanged,
    title,
    type,
    status,
    academicYear,
    themeId,
    keywords,
    description,
    supervision,
  ])

  const filteredStudents = studentOptions.filter((s) => {
    const q = studentSearch.toLowerCase()
    return (
      !q ||
      `${s.firstName} ${s.lastName}`.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q)
    )
  })
  const filteredThemeRows = themeOptions.filter((th) => {
    const q = themeSearch.toLowerCase()
    return (
      !q ||
      th.name.toLowerCase().includes(q) ||
      (th.description?.toLowerCase().includes(q) ?? false)
    )
  })
  const themesPickList = themeSearch.trim()
    ? filteredThemeRows
    : filteredThemeRows.slice(0, 25)
  const keywordChips = keywords
    .split(',')
    .map((k) => k.trim())
    .filter(Boolean)

  return (
    <div className='mx-auto w-full max-w-3xl space-y-5'>
      {/* Toast */}
      {toast && (
        <div
          className={`flex items-center gap-2 rounded-lg border px-4 py-3 text-sm ${
            toast.type === 'success'
              ? 'border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-300'
              : 'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-300'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className='size-4 shrink-0' />
          ) : (
            <AlertCircle className='size-4 shrink-0' />
          )}
          {toast.message}
        </div>
      )}

      {supervision && isReadOnly && (
        <div className='flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/30'>
          <div className='flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-200/80 dark:bg-slate-800/80'>
            <Lock className='size-4 text-slate-600 dark:text-slate-300' />
          </div>
          <div className='min-w-0 flex-1 text-sm text-slate-800 dark:text-slate-200'>
            <p className='font-semibold'>Lecture seule</p>
            <p className='text-xs text-muted-foreground'>
              Cet encadrement est validé : les modifications ne sont plus
              possibles.
            </p>
          </div>
        </div>
      )}

      {supervision && isRevised && !isReadOnly && (
        <div className='flex items-center gap-3 rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 dark:border-sky-900/50 dark:bg-sky-950/25'>
          <div className='flex size-8 shrink-0 items-center justify-center rounded-full bg-sky-100 dark:bg-sky-900/50'>
            <Info className='size-4 text-sky-700 dark:text-sky-400' />
          </div>
          <p className='min-w-0 flex-1 text-sm text-sky-900 dark:text-sky-100'>
            <span className='font-semibold'>Révision demandée. </span>
            En enregistrant, l&apos;encadrement repasse en attente de relecture
            auprès du tuteur principal.
          </p>
        </div>
      )}

      {supervision && isRejected && !isReadOnly && (
        <div className='flex items-center gap-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 dark:border-rose-900/50 dark:bg-rose-950/25'>
          <div className='flex size-8 shrink-0 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-900/50'>
            <Info className='size-4 text-rose-700 dark:text-rose-400' />
          </div>
          <p className='min-w-0 flex-1 text-sm text-rose-900 dark:text-rose-100'>
            <span className='font-semibold'>Dossier refusé. </span>
            En enregistrant, l&apos;encadrement repasse en attente de relecture
            auprès du tuteur principal.
          </p>
        </div>
      )}

      {!isReadOnly && (
        <div className='flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800 dark:bg-amber-950/30'>
          <div className='flex size-8 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/40'>
            <PencilLine className='size-4 text-amber-600 dark:text-amber-400' />
          </div>
          <div className='min-w-0 flex-1'>
            <p className='text-sm font-semibold text-amber-800 dark:text-amber-300'>
              Mode édition
            </p>
            {supervision && (
              <p className='truncate text-xs text-amber-700 dark:text-amber-400'>
                {supervision.title}
              </p>
            )}
          </div>
          {changesCount > 0 && (
            <span className='shrink-0 rounded-full bg-amber-200 px-2.5 py-0.5 text-xs font-semibold text-amber-900 dark:bg-amber-900/50 dark:text-amber-200 tabular'>
              {changesCount} modif.
            </span>
          )}
        </div>
      )}

      {/* Step bar */}
      <Card>
        <CardContent className='px-6 py-4'>
          <StepBar />
        </CardContent>
      </Card>

      {isLoading ? (
        <div className='space-y-4'>
          <SkeletonCard rows={4} />
          <SkeletonCard rows={2} />
          <SkeletonCard rows={3} />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className='space-y-4'>
          <fieldset
            disabled={isReadOnly}
            className='min-w-0 space-y-4 border-0 p-0 m-0 disabled:opacity-60'
          >
            {/* ── 1. Général ─────────────────────────────────────────────── */}
            <Card className='border-l-4 border-l-primary'>
              <CardHeader className='pb-3'>
                <SectionHeader
                  icon={Info}
                  title='Informations générales'
                  step={1}
                />
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-1.5'>
                  <Label htmlFor='title' className='text-xs font-medium'>
                    Titre du projet <span className='text-destructive'>*</span>
                  </Label>
                  <Input
                    id='title'
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value)
                      clearError('title')
                    }}
                    className={`h-9 ${
                      errors.title ? 'border-destructive' : ''
                    }`}
                  />
                  {errors.title && (
                    <p className='text-xs text-destructive'>Champ requis</p>
                  )}
                </div>
                <div className='grid grid-cols-2 gap-4'>
                  <div className='space-y-1.5'>
                    <Label htmlFor='type' className='text-xs font-medium'>
                      Type <span className='text-destructive'>*</span>
                    </Label>
                    <select
                      id='type'
                      value={type}
                      onChange={(e) => {
                        setType(e.target.value as SupervisionType)
                        clearError('type')
                      }}
                      className={
                        SELECT_CLASS +
                        (errors.type ? ' border-destructive' : '')
                      }
                    >
                      <option value=''>{t('common.select')}</option>
                      {TYPE_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                    {errors.type && (
                      <p className='text-xs text-destructive'>Champ requis</p>
                    )}
                  </div>
                  <div className='space-y-1.5'>
                    <Label htmlFor='status' className='text-xs font-medium'>
                      Statut
                    </Label>
                    <select
                      id='status'
                      value={status}
                      onChange={(e) =>
                        setStatus(e.target.value as SupervisionStatus)
                      }
                      className={SELECT_CLASS}
                    >
                      {STATUS_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className='w-1/2 space-y-1.5'>
                  <Label htmlFor='academicYear' className='text-xs font-medium'>
                    Année universitaire{' '}
                    <span className='text-destructive'>*</span>
                  </Label>
                  <select
                    id='academicYear'
                    value={academicYear}
                    onChange={(e) => {
                      setAcademicYear(e.target.value)
                      clearError('academicYear')
                    }}
                    className={
                      SELECT_CLASS +
                      (errors.academicYear ? ' border-destructive' : '')
                    }
                  >
                    <option value=''>
                      {t('supervisions.form.selectYear')}
                    </option>
                    {Array.from({ length: 11 }, (_, i) => {
                      const start = new Date().getFullYear() - 2 + i
                      const label = `${start}-${start + 1}`
                      return (
                        <option key={label} value={label}>
                          {label}
                        </option>
                      )
                    })}
                  </select>
                  {errors.academicYear && (
                    <p className='text-xs text-destructive'>Champ requis</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* ── 2. Étudiant ──────────────────────────────────────────────── */}
            <Card className='border-t-2 border-t-primary'>
              <CardHeader className='pb-3'>
                <SectionHeader icon={Users} title='Étudiant' step={2} />
              </CardHeader>
              <CardContent className='space-y-3'>
                <Input
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  placeholder='Rechercher par nom, prénom ou email...'
                  className='h-9'
                />
                {filteredStudents.length > 0 && (
                  <div
                    className={`grid gap-2 sm:grid-cols-2 max-h-56 overflow-y-auto rounded-lg border p-2 ${
                      errors.studentId ? 'border-destructive' : 'border-input'
                    }`}
                  >
                    {filteredStudents.map((s) => (
                      <button
                        key={s.id}
                        type='button'
                        onClick={() => {
                          setStudentId(s.id)
                          clearError('studentId')
                        }}
                        className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-left transition-all hover:bg-muted ${
                          studentId === s.id
                            ? 'ring-2 ring-primary bg-primary/5'
                            : 'bg-card'
                        }`}
                      >
                        <div className='flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground'>
                          {s.firstName.charAt(0)}
                          {s.lastName.charAt(0)}
                        </div>
                        <div className='min-w-0'>
                          <p className='truncate text-sm font-medium text-foreground'>
                            {s.lastName} {s.firstName}
                          </p>
                          <p className='truncate text-xs text-muted-foreground'>
                            {s.institution}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {errors.studentId && (
                  <p className='text-xs text-destructive'>
                    {t('supervisions.form.selectStudent')}
                  </p>
                )}
                {studentId &&
                  (() => {
                    const sel = studentOptions.find((s) => s.id === studentId)
                    return sel ? (
                      <div className='flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2'>
                        <div className='flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground'>
                          {sel.firstName.charAt(0)}
                          {sel.lastName.charAt(0)}
                        </div>
                        <div className='flex-1 min-w-0'>
                          <p className='text-sm font-medium text-foreground'>
                            {sel.lastName} {sel.firstName}
                          </p>
                          <p className='text-xs text-muted-foreground'>
                            {sel.institution} · {sel.level}
                          </p>
                        </div>
                      </div>
                    ) : null
                  })()}
              </CardContent>
            </Card>

            {/* ── 3. Thématique ────────────────────────────────────────────── */}
            <Card className='border-l-4 border-l-primary/50'>
              <CardHeader className='pb-3'>
                <SectionHeader icon={Tag} title='Thématique' step={3} />
              </CardHeader>
              <CardContent className='space-y-4'>
                {isReadOnly && supervision?.theme && (
                  <div className='rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm'>
                    <span className='text-muted-foreground'>
                      {t('supervisions.form.themeLabel')}:{' '}
                    </span>
                    <span className='font-medium'>
                      {supervision.theme.name}
                    </span>
                  </div>
                )}
                {!isReadOnly && (
                  <div className='space-y-1.5'>
                    <div className='flex flex-wrap items-end justify-between gap-2'>
                      <Label
                        htmlFor='eThemeSearch'
                        className='text-xs font-medium'
                      >
                        {t('supervisions.form.themeLabel')}{' '}
                        <span className='text-destructive'>*</span>
                      </Label>
                      <Link
                        to={getAssistantThemeNewPath()}
                        className={cn(
                          buttonVariants({ variant: 'link', size: 'sm' }),
                          'h-auto p-0 text-xs',
                        )}
                      >
                        + {t('themes.list.add')}
                      </Link>
                    </div>
                    <Input
                      id='eThemeSearch'
                      value={themeSearch}
                      onChange={(e) => setThemeSearch(e.target.value)}
                      placeholder={t('supervisions.form.themeSearch')}
                      className={cn(
                        'h-9',
                        errors.themeId && 'border-destructive',
                      )}
                    />
                    {!themeId && themesPickList.length > 0 && (
                      <div className='max-h-40 overflow-y-auto rounded-lg border border-border bg-card'>
                        {themesPickList.map((th) => (
                          <button
                            key={th.id}
                            type='button'
                            onClick={() => {
                              setThemeId(th.id)
                              clearError('themeId')
                            }}
                            className='flex w-full items-center gap-2 border-b border-border px-3 py-2.5 text-left last:border-0 hover:bg-muted/60'
                          >
                            <div className='min-w-0 flex-1'>
                              <p className='text-sm font-medium'>{th.name}</p>
                              {th.description && (
                                <p className='line-clamp-1 text-xs text-muted-foreground'>
                                  {th.description}
                                </p>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                    {themeSearch &&
                      !themeId &&
                      themeOptions.length > 0 &&
                      themesPickList.length === 0 && (
                        <p className='text-xs text-muted-foreground py-1'>
                          {t('supervisions.form.noThemeMatch')} « {themeSearch}{' '}
                          »
                        </p>
                      )}
                    {!themeId && themeOptions.length === 0 && (
                      <p className='text-xs text-muted-foreground py-1'>
                        <Link
                          to={getAssistantThemeNewPath()}
                          className='text-primary underline underline-offset-2'
                        >
                          {t('themes.list.add')}
                        </Link>
                      </p>
                    )}
                    {errors.themeId && (
                      <p className='text-xs text-destructive'>
                        {t('supervisions.form.themeRequired')}
                      </p>
                    )}
                    {themeId &&
                      (() => {
                        const sel = themeOptions.find((x) => x.id === themeId)
                        return sel ? (
                          <div className='flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2'>
                            <div className='flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary'>
                              <Tag className='size-4' />
                            </div>
                            <div className='min-w-0 flex-1'>
                              <p className='text-sm font-medium'>{sel.name}</p>
                              {sel.description && (
                                <p className='text-xs text-muted-foreground line-clamp-2'>
                                  {sel.description}
                                </p>
                              )}
                            </div>
                            <button
                              type='button'
                              onClick={() => setThemeId('')}
                              className='text-xs text-muted-foreground hover:text-foreground'
                            >
                              ×
                            </button>
                          </div>
                        ) : null
                      })()}
                  </div>
                )}
                <div className='space-y-1.5'>
                  <Label htmlFor='keywords' className='text-xs font-medium'>
                    Mots-clés{' '}
                    <span className='text-muted-foreground font-normal'>
                      (séparés par des virgules)
                    </span>
                  </Label>
                  <Input
                    id='keywords'
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    className='h-9'
                  />
                  {keywordChips.length > 0 && (
                    <div className='flex flex-wrap gap-1.5 pt-1'>
                      {keywordChips.map((k) => (
                        <span
                          key={k}
                          className='inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary'
                        >
                          {k}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className='space-y-1.5'>
                  <Label htmlFor='description' className='text-xs font-medium'>
                    Description du sujet
                  </Label>
                  <textarea
                    id='description'
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className='w-full resize-y rounded-lg border border-input bg-transparent px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50'
                  />
                </div>
              </CardContent>
            </Card>

            {/* ── 4. Dates ─────────────────────────────────────────────────── */}
            <Card className='border-l-4 border-l-primary'>
              <CardHeader className='pb-3'>
                <SectionHeader icon={Calendar} title='Dates' step={4} />
              </CardHeader>
              <CardContent>
                <div className='grid grid-cols-3 gap-4'>
                  <div className='space-y-1.5'>
                    <Label htmlFor='startDate' className='text-xs font-medium'>
                      Date de début <span className='text-destructive'>*</span>
                    </Label>
                    <Input
                      id='startDate'
                      type='date'
                      value={startDate}
                      onChange={(e) => {
                        setStartDate(e.target.value)
                        clearError('startDate')
                      }}
                      className={`h-9 ${
                        errors.startDate ? 'border-destructive' : ''
                      }`}
                    />
                    {errors.startDate && (
                      <p className='text-xs text-destructive'>Requis</p>
                    )}
                  </div>
                  <div className='space-y-1.5'>
                    <Label
                      htmlFor='expectedEndDate'
                      className='text-xs font-medium'
                    >
                      Fin prévue
                    </Label>
                    <Input
                      id='expectedEndDate'
                      type='date'
                      value={expectedEndDate}
                      onChange={(e) => setExpectedEndDate(e.target.value)}
                      className='h-9'
                    />
                  </div>
                  <div className='space-y-1.5'>
                    <Label
                      htmlFor='actualEndDate'
                      className='text-xs font-medium'
                    >
                      Fin réelle
                    </Label>
                    <Input
                      id='actualEndDate'
                      type='date'
                      value={actualEndDate}
                      onChange={(e) => setActualEndDate(e.target.value)}
                      className='h-9'
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ── 5. Encadrants ────────────────────────────────────────────── */}
            <Card className='border border-primary/15 bg-primary/3'>
              <CardHeader className='pb-3'>
                <SectionHeader icon={UserCheck} title='Encadrants' step={5} />
              </CardHeader>
              <CardContent className='space-y-4'>
                {isReadOnly ? (
                  existingSupervisors.length > 0 && (
                    <div className='space-y-2'>
                      <span className='text-xs font-semibold text-muted-foreground'>
                        Encadrants
                      </span>
                      {existingSupervisors.map((s) => (
                        <div
                          key={s.id}
                          className='flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/30 px-4 py-3'
                        >
                          <div className='flex min-w-0 items-center gap-3'>
                            <div
                              className={`flex size-8 shrink-0 items-center justify-center rounded-full ${
                                s.isMainSupervisor
                                  ? 'bg-amber-100 dark:bg-amber-900/40'
                                  : 'bg-muted'
                              }`}
                            >
                              {s.isMainSupervisor ? (
                                <Star className='size-4 text-amber-600 dark:text-amber-400' />
                              ) : (
                                <Users className='size-4 text-muted-foreground' />
                              )}
                            </div>
                            <div className='min-w-0'>
                              <p className='text-sm font-medium text-foreground'>
                                {s.supervisor.nom_complet}
                              </p>
                              <div className='mt-0.5 flex gap-1'>
                                <Badge
                                  variant={
                                    s.isMainSupervisor ? 'default' : 'secondary'
                                  }
                                  className='h-4 px-1.5 text-[10px]'
                                >
                                  {s.isMainSupervisor ? 'Principal' : 'CO'}
                                </Badge>
                                {s.isExternal && (
                                  <Badge
                                    variant='outline'
                                    className='h-4 px-1.5 text-[10px]'
                                  >
                                    Externe
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                ) : (
                  <>
                    <div className='max-w-lg space-y-1.5'>
                      <SupervisorSearchPicker
                        id='edit-main-supervisor'
                        label={
                          <>
                            Encadrant principal
                            <span className='text-destructive'> *</span>
                          </>
                        }
                        value={mainSupervisorId}
                        onChange={(id) => {
                          setMainSupervisorId(id)
                          clearError('mainSupervisor')
                        }}
                        excludeIds={coSupervisors
                          .map((c) => c.supervisorId)
                          .filter(Boolean)}
                        error={errors.mainSupervisor}
                        helperText={
                          errors.mainSupervisor ? (
                            <p className='pt-0.5 text-xs text-destructive'>
                              Sélectionnez l&apos;encadrant principal (relecteur
                              désigné).
                            </p>
                          ) : null
                        }
                      />
                    </div>

                    {coSupervisors.length > 0 && (
                      <div className='space-y-3'>
                        <span className='text-xs font-semibold text-muted-foreground'>
                          Co-encadrants
                        </span>
                        {coSupervisors.map((co, idx) => (
                          <div
                            key={idx}
                            className='flex flex-col gap-2 rounded-lg border border-border bg-muted/30 p-3 sm:flex-row sm:items-center'
                          >
                            <div className='min-w-0 flex-1'>
                              <SupervisorSearchPicker
                                id={`edit-co-supervisor-${idx}`}
                                label={
                                  <span className='text-xs'>
                                    Co-encadrant {idx + 1}
                                  </span>
                                }
                                compact
                                value={co.supervisorId}
                                onChange={(id) =>
                                  setCoSupervisors((p) => {
                                    const a = [...p]
                                    a[idx] = { supervisorId: id }
                                    return a
                                  })
                                }
                                excludeIds={[
                                  mainSupervisorId,
                                  ...coSupervisors
                                    .map((c) => c.supervisorId)
                                    .filter(
                                      (sid, j) => j !== idx && Boolean(sid),
                                    ),
                                ].filter(Boolean)}
                              />
                            </div>
                            <Button
                              type='button'
                              variant='ghost'
                              size='icon'
                              className='size-8 shrink-0 text-destructive hover:bg-destructive/10'
                              onClick={() =>
                                setCoSupervisors((p) =>
                                  p.filter((_, i) => i !== idx),
                                )
                              }
                            >
                              <MinusCircle className='size-4' />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      onClick={() =>
                        setCoSupervisors((p) => [...p, { supervisorId: '' }])
                      }
                      className='gap-2 border-dashed'
                    >
                      <Plus className='size-4' />
                      Ajouter un CO-Encadrant
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </fieldset>

          {/* Actions (outside fieldset so Retour stays clickable in read-only) */}
          <div className='flex items-center justify-end gap-3 pt-1'>
            <Button
              type='button'
              variant='outline'
              onClick={() => navigate(-1)}
              className='px-6'
            >
              {isReadOnly ? 'Retour' : 'Annuler'}
            </Button>
            {!isReadOnly && (
              <Button
                type='submit'
                disabled={isPending}
                className='px-6 transition-all active:scale-[0.98]'
              >
                {isPending ? (
                  <>
                    <Loader2 className='mr-2 size-4 animate-spin' />
                    Modification…
                  </>
                ) : (
                  <>
                    <PencilLine className='mr-2 size-4' />
                    Modifier l&apos;encadrement
                  </>
                )}
              </Button>
            )}
          </div>
        </form>
      )}
    </div>
  )
}
