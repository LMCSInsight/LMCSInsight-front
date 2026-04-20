import { useEffect, useState, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
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
} from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  useSupervision,
  useUpdateSupervision,
  useAssignSupervisor,
  useRemoveSupervisor,
} from '@/features/supervisions/hooks/useSupervisions'
import { useStudents } from '@/features/students/hooks'
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
  const { supervisionId } = useParams<{ supervisionId: string }>()
  const navigate = useNavigate()

  const { data: supervision, isLoading } = useSupervision(supervisionId)
  const { mutate: updateSupervision, isPending } = useUpdateSupervision(
    supervisionId!,
  )
  const { mutate: assignSupervisor } = useAssignSupervisor(supervisionId!)
  const { mutate: removeSupervisor } = useRemoveSupervisor(supervisionId!)
  const { data: studentsPage } = useStudents({ limit: 200 })
  const studentOptions = studentsPage?.data ?? []

  const [title, setTitle] = useState('')
  const [status, setStatus] = useState<SupervisionStatus>('IN_PROGRESS')
  const [type, setType] = useState<SupervisionType | ''>('')
  const [academicYear, setAcademicYear] = useState('')
  const [studentId, setStudentId] = useState('')
  const [studentSearch, setStudentSearch] = useState('')
  const [keywords, setKeywords] = useState('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState('')
  const [expectedEndDate, setExpectedEndDate] = useState('')
  const [actualEndDate, setActualEndDate] = useState('')
  const [supervisorsToRemove, setSupervisorsToRemove] = useState<string[]>([])
  const [newCoSupervisors, setNewCoSupervisors] = useState<
    { supervisorId: string; isExternal: boolean }[]
  >([])
  const [errors, setErrors] = useState<Record<string, boolean>>({})
  const [toast, setToast] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)

  // Pre-fill from loaded supervision
  useEffect(() => {
    if (supervision) {
      setTitle(supervision.title ?? '')
      setStatus(supervision.status)
      setType(supervision.type)
      setAcademicYear(supervision.academicYear ?? '')
      setStudentId(supervision.studentId ?? '')
      setKeywords(supervision.keywords?.join(', ') ?? '')
      setDescription(supervision.description ?? '')
      setStartDate(toDateInput(supervision.startDate))
      setExpectedEndDate(toDateInput(supervision.expectedEndDate))
      setActualEndDate(toDateInput(supervision.actualEndDate))
    }
  }, [supervision])

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
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    const payload: UpdateSupervisionPayload = {
      title: title.trim(),
      type: type as SupervisionType,
      status,
      academicYear: academicYear.trim(),
      studentId,
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

    updateSupervision(payload, {
      onSuccess: () => {
        supervisorsToRemove.forEach((sid) => removeSupervisor(sid))
        newCoSupervisors.forEach((co) => {
          if (co.supervisorId.trim()) {
            assignSupervisor({
              supervisorId: co.supervisorId.trim(),
              isMainSupervisor: false,
              isExternal: co.isExternal,
            })
          }
        })
        setToast({
          type: 'success',
          message: 'Encadrement modifié avec succès !',
        })
        setTimeout(() => navigate(-1), 1200)
      },
      onError: (err: unknown) => {
        const msg =
          err instanceof Error ? err.message : 'Erreur lors de la modification'
        setToast({ type: 'error', message: msg })
        setTimeout(() => setToast(null), 3500)
      },
    })
  }

  const existingSupervisors = supervision?.supervisors ?? []

  // Count active changes for the ribbon badge
  const changesCount = useMemo(() => {
    let n =
      supervisorsToRemove.length +
      newCoSupervisors.filter((co) => co.supervisorId.trim()).length
    if (supervision) {
      if (title !== (supervision.title ?? '')) n++
      if (type !== supervision.type) n++
      if (status !== supervision.status) n++
      if (academicYear !== (supervision.academicYear ?? '')) n++
      if (keywords !== (supervision.keywords?.join(', ') ?? '')) n++
      if (description !== (supervision.description ?? '')) n++
    }
    return n
  }, [
    title,
    type,
    status,
    academicYear,
    keywords,
    description,
    supervisorsToRemove,
    newCoSupervisors,
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
  const keywordChips = keywords
    .split(',')
    .map((k) => k.trim())
    .filter(Boolean)

  return (
    <div className='mx-auto max-w-3xl space-y-5'>
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

      {/* Amber editing ribbon */}
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
                  className={`h-9 ${errors.title ? 'border-destructive' : ''}`}
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
                      SELECT_CLASS + (errors.type ? ' border-destructive' : '')
                    }
                  >
                    <option value=''>Sélectionner...</option>
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
                <Input
                  id='academicYear'
                  value={academicYear}
                  onChange={(e) => {
                    setAcademicYear(e.target.value)
                    clearError('academicYear')
                  }}
                  placeholder='ex: 2025-2026'
                  className={`h-9 ${
                    errors.academicYear ? 'border-destructive' : ''
                  }`}
                />
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
                  Veuillez sélectionner un étudiant
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
              {/* Existing supervisors */}
              {existingSupervisors.length > 0 && (
                <div className='space-y-2'>
                  <span className='text-xs font-semibold text-muted-foreground'>
                    Encadrants actuels
                  </span>
                  {existingSupervisors.map((s) => {
                    const markedForRemoval = supervisorsToRemove.includes(
                      s.supervisorId,
                    )
                    return (
                      <div
                        key={s.id}
                        className={`flex items-center justify-between gap-3 rounded-lg border px-4 py-3 transition-all duration-200 ${
                          markedForRemoval
                            ? 'border-destructive/40 bg-destructive/5'
                            : 'border-border bg-muted/30'
                        }`}
                      >
                        <div className='flex items-center gap-3 min-w-0'>
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
                            <p
                              className={`text-sm font-medium ${
                                markedForRemoval
                                  ? 'line-through text-muted-foreground'
                                  : 'text-foreground'
                              }`}
                            >
                              {s.supervisor.nom_complet}
                            </p>
                            <div className='flex gap-1 mt-0.5'>
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
                        <Button
                          type='button'
                          variant='ghost'
                          size='sm'
                          onClick={() =>
                            setSupervisorsToRemove((p) =>
                              p.includes(s.supervisorId)
                                ? p.filter((x) => x !== s.supervisorId)
                                : [...p, s.supervisorId],
                            )
                          }
                          className={
                            markedForRemoval
                              ? 'text-muted-foreground hover:bg-muted text-xs'
                              : 'text-destructive hover:bg-destructive/10 text-xs'
                          }
                        >
                          {markedForRemoval ? 'Annuler' : 'Retirer'}
                        </Button>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* New co-supervisors */}
              {newCoSupervisors.length > 0 && (
                <div className='space-y-3'>
                  <span className='text-xs font-semibold text-muted-foreground'>
                    Nouveaux co-encadrants
                  </span>
                  {newCoSupervisors.map((co, idx) => (
                    <div
                      key={idx}
                      className='flex items-end gap-3 rounded-lg border border-border bg-muted/30 p-3'
                    >
                      <div className='flex-1 space-y-1'>
                        <Label className='text-xs'>
                          CO_Encadrant {idx + 1} (Matricule ESI)
                        </Label>
                        <Input
                          value={co.supervisorId}
                          onChange={(e) =>
                            setNewCoSupervisors((p) => {
                              const a = [...p]
                              a[idx] = {
                                ...a[idx],
                                supervisorId: e.target.value,
                              }
                              return a
                            })
                          }
                          placeholder='ex: 12345'
                          className='h-8 text-sm'
                        />
                      </div>
                      <div className='w-28 space-y-1'>
                        <Label className='text-xs'>Externe ?</Label>
                        <select
                          value={co.isExternal ? 'true' : 'false'}
                          onChange={(e) =>
                            setNewCoSupervisors((p) => {
                              const a = [...p]
                              a[idx] = {
                                ...a[idx],
                                isExternal: e.target.value === 'true',
                              }
                              return a
                            })
                          }
                          className='h-8 w-full rounded-md border border-input bg-transparent px-2 text-xs text-foreground outline-none'
                        >
                          <option value='false'>Interne</option>
                          <option value='true'>Externe</option>
                        </select>
                      </div>
                      <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        className='size-8 text-destructive hover:bg-destructive/10'
                        onClick={() =>
                          setNewCoSupervisors((p) =>
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
                  setNewCoSupervisors((p) => [
                    ...p,
                    { supervisorId: '', isExternal: false },
                  ])
                }
                className='gap-2 border-dashed'
              >
                <Plus className='size-4' />
                Ajouter un CO_Encadrant
              </Button>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className='flex items-center justify-end gap-3 pt-1'>
            <Button
              type='button'
              variant='outline'
              onClick={() => navigate(-1)}
              className='px-6'
            >
              Annuler
            </Button>
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
          </div>
        </form>
      )}
    </div>
  )
}
