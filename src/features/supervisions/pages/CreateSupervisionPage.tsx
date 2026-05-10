import { useState, useMemo } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  getAssistantThemeNewPath,
  getAssistantSupervisionDetailPath,
} from '@/config/routes'
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
  Check,
  Loader2,
} from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { APP_CONSTANTS } from '@/config/constants'
import { authApi } from '@/features/auth/api/authApi'
import {
  extractMatriculeFromAccessToken,
  sanitizeChercheurIdForApi,
} from '@/features/auth/extractMatricule'
import {
  mapBackendUserToDisplayUser,
  type BackendAuthUser,
} from '@/features/auth/types'
import { useCreateSupervision } from '@/features/supervisions/hooks/useSupervisions'
import { supervisionApi } from '@/features/supervisions/api/supervisionApi'
import { splitContribPercent } from '@/features/supervisions/utils/splitContribPercent'
import { SupervisorSearchPicker } from '@/features/supervisions/components/SupervisorSearchPicker'
import { useAuthContext } from '@/shared/context/AuthContext'
import { cn } from '@/lib/utils'
import { useStudents } from '@/features/students/hooks'
import { useThemes } from '@/features/themes/hooks'
import type {
  CreateSupervisionPayload,
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

// ─── Step bar ────────────────────────────────────────────────────────────────

const STEPS = ['Général', 'Étudiant', 'Thématique', 'Dates', 'Encadrants']

function StepBar({ active }: { active: number }) {
  return (
    <div className='flex items-center gap-0'>
      {STEPS.map((label, i) => {
        const done = i < active
        const current = i === active
        return (
          <div key={label} className='flex flex-1 items-center'>
            <div className='flex flex-col items-center gap-1'>
              <div
                className={`flex size-7 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors ${
                  done
                    ? 'border-primary bg-primary text-primary-foreground'
                    : current
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-muted-foreground/30 bg-transparent text-muted-foreground'
                }`}
              >
                {done ? <Check className='size-3.5' /> : i + 1}
              </div>
              <span
                className={`hidden sm:block text-xs ${
                  current
                    ? 'font-semibold text-primary'
                    : 'text-muted-foreground'
                }`}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`h-0.5 flex-1 mb-4 mx-1 rounded-full transition-colors ${
                  done ? 'bg-primary' : 'bg-muted-foreground/20'
                }`}
              />
            )}
          </div>
        )
      })}
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CreateSupervisionPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const { currentUser } = useAuthContext()
  const isAssistantPath = location.pathname.startsWith('/assistant/')
  const { mutateAsync: createSupervision, isPending } = useCreateSupervision()
  const { data: studentsPage } = useStudents({ limit: 200 })
  const [themeSearch, setThemeSearch] = useState('')
  const { data: themesPage } = useThemes({
    limit: 200,
    search: themeSearch.trim() || undefined,
  })
  const studentOptions = studentsPage?.data ?? []
  const themeOptions = themesPage?.data ?? []
  const [toast, setToast] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)
  const [errors, setErrors] = useState<Record<string, boolean>>({})

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

  const activeStep = useMemo(() => {
    if (coSupervisors.length > 0 || mainSupervisorId) return 4
    if (startDate) return 3
    if (themeId || keywords || description) return 2
    if (studentId) return 1
    if (title) return 0
    return 0
  }, [
    title,
    studentId,
    themeId,
    keywords,
    description,
    startDate,
    mainSupervisorId,
    coSupervisors.length,
  ])

  const filteredStudents = studentOptions.filter((s) => {
    const q = studentSearch.toLowerCase()
    return (
      !q ||
      `${s.firstName} ${s.lastName}`.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q)
    )
  })

  const filteredThemes = themeOptions.filter((th) => {
    const q = themeSearch.toLowerCase()
    return (
      !q ||
      th.name.toLowerCase().includes(q) ||
      (th.description?.toLowerCase().includes(q) ?? false)
    )
  })
  const themesPickList = themeSearch.trim()
    ? filteredThemes
    : filteredThemes.slice(0, 25)

  function addCo() {
    setCoSupervisors((p) => [...p, { supervisorId: '' }])
  }
  function removeCo(i: number) {
    setCoSupervisors((p) => p.filter((_, idx) => idx !== i))
  }
  function updateCoSupervisorId(i: number, supervisorId: string) {
    setCoSupervisors((p) => {
      const a = [...p]
      a[i] = { supervisorId }
      return a
    })
  }

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
    if (isAssistantPath) {
      const main = sanitizeChercheurIdForApi(mainSupervisorId.trim())
      if (!main) next.mainSupervisor = true
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    const payload: CreateSupervisionPayload = {
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
        : undefined,
    }

    const token = localStorage.getItem(APP_CONSTANTS.STORAGE_KEYS.TOKEN)
    let mainSupervisorMatricule =
      sanitizeChercheurIdForApi(mainSupervisorId.trim()) || ''

    if (!isAssistantPath) {
      mainSupervisorMatricule =
        mainSupervisorMatricule ||
        sanitizeChercheurIdForApi(currentUser?.matricule) ||
        extractMatriculeFromAccessToken(token) ||
        ''
      if (!mainSupervisorMatricule) {
        try {
          const { data } = await authApi.me()
          mainSupervisorMatricule =
            sanitizeChercheurIdForApi(
              mapBackendUserToDisplayUser(data.user as BackendAuthUser)
                .matricule,
            ) || ''
        } catch {
          /* ignore */
        }
      }
    }

    try {
      const created = await createSupervision(payload)
      const { data: createdDetail } = await supervisionApi.getById(created.id)
      const backendSeededSupervisor =
        (createdDetail.supervisors?.length ?? 0) > 0

      if (!mainSupervisorMatricule && !backendSeededSupervisor) {
        setToast({
          type: 'error',
          message: isAssistantPath
            ? "Renseignez l'encadrant principal (chercheur ESI) pour assigner le relecteur."
            : "Impossible d'identifier votre profil chercheur (matricule ESI / chercheur_id). Renseignez l'encadrant principal, ou demandez que l'API auth (login ou /v1/auth/me) expose chercheur_id pour votre compte.",
        })
        setTimeout(() => setToast(null), 5000)
        return
      }
      if (mainSupervisorMatricule) {
        const main = mainSupervisorMatricule
        const coList = coSupervisors
          .map((c) => sanitizeChercheurIdForApi(c.supervisorId.trim()) || '')
          .filter((id): id is string => Boolean(id) && id !== main)
        const uniqueCo = [...new Set(coList)]
        const all: string[] = [main, ...uniqueCo]
        const parts = splitContribPercent(all.length)
        await supervisionApi.replaceSupervisionSupervisors(created.id, {
          supervisors: all.map((id, i) => ({
            supervisorId: id,
            isMainSupervisor: i === 0,
            isExternal: false,
            contributionPercent: parts[i]!,
          })),
        })
      }
      await queryClient.invalidateQueries({ queryKey: ['supervisions'] })
      setToast({ type: 'success', message: 'Encadrement ajouté avec succès !' })
      setTimeout(() => {
        if (isAssistantPath) {
          navigate(getAssistantSupervisionDetailPath(created.id), {
            replace: true,
          })
        } else {
          navigate(-1)
        }
      }, 1200)
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Erreur lors de la création'
      setToast({ type: 'error', message: msg })
      setTimeout(() => setToast(null), 3500)
    }
  }

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

      {/* Page title */}
      <div>
        <h1 className='text-2xl font-semibold tracking-tight'>
          Ajouter un encadrement
        </h1>
        <p className='text-sm text-muted-foreground'>
          Remplissez les informations pour créer un nouvel encadrement.
        </p>
      </div>

      {/* Step bar */}
      <Card>
        <CardContent className='px-6 py-4'>
          <StepBar active={activeStep} />
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className='space-y-4'>
        {/* ── 1. Général ─────────────────────────────────────────────────── */}
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
                placeholder="ex: Deep Learning pour la détection d'anomalies"
                className={`h-9 ${errors.title ? 'border-destructive' : ''}`}
              />
              {errors.title && (
                <p className='text-xs text-destructive'>Champ requis</p>
              )}
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-1.5'>
                <Label htmlFor='type' className='text-xs font-medium'>
                  Type d&apos;encadrement{' '}
                  <span className='text-destructive'>*</span>
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
                Année universitaire <span className='text-destructive'>*</span>
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
                <option value=''>{t('supervisions.form.selectYear')}</option>
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

        {/* ── 2. Étudiant ────────────────────────────────────────────────── */}
        <Card className='border-t-2 border-t-primary'>
          <CardHeader className='pb-3'>
            <SectionHeader icon={Users} title='Étudiant' step={2} />
          </CardHeader>
          <CardContent className='space-y-3'>
            <div className='space-y-1.5'>
              <Label htmlFor='studentSearch' className='text-xs font-medium'>
                Rechercher un étudiant{' '}
                <span className='text-destructive'>*</span>
              </Label>
              <Input
                id='studentSearch'
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                placeholder='Nom, prénom ou email...'
                className='h-9'
              />
            </div>
            {/* Filterable card grid */}
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
            {filteredStudents.length === 0 && studentSearch && (
              <p className='text-xs text-muted-foreground py-2 text-center'>
                Aucun étudiant trouvé pour « {studentSearch} »
              </p>
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
                  <div className='flex items-center gap-2 rounded-lg bg-primary/5 border border-primary/20 px-3 py-2'>
                    <div className='flex size-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground'>
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
                    <button
                      type='button'
                      onClick={() => setStudentId('')}
                      className='text-xs text-muted-foreground hover:text-foreground ml-auto'
                    >
                      ×
                    </button>
                  </div>
                ) : null
              })()}
          </CardContent>
        </Card>

        {/* ── 3. Thématique ──────────────────────────────────────────────── */}
        <Card className='border-l-4 border-l-primary/50'>
          <CardHeader className='pb-3'>
            <SectionHeader icon={Tag} title='Thématique' step={3} />
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-1.5'>
              <div className='flex flex-wrap items-end justify-between gap-2'>
                <Label htmlFor='themeSearch' className='text-xs font-medium'>
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
                id='themeSearch'
                value={themeSearch}
                onChange={(e) => setThemeSearch(e.target.value)}
                placeholder={t('supervisions.form.themeSearch')}
                className={cn(
                  'h-9',
                  errors.themeId ? 'border-destructive' : 'border-input',
                )}
                autoComplete='off'
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
              {!themeId &&
                themeSearch &&
                themeOptions.length > 0 &&
                themesPickList.length === 0 && (
                  <p className='text-xs text-muted-foreground py-1'>
                    {t('supervisions.form.noThemeMatch')} « {themeSearch} »
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
                        onClick={() => {
                          setThemeId('')
                        }}
                        className='text-xs text-muted-foreground hover:text-foreground'
                      >
                        ×
                      </button>
                    </div>
                  ) : null
                })()}
            </div>
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
                placeholder='ex: Intelligence Artificielle, Machine Learning, NLP'
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
                placeholder='Décrivez le sujet de recherche...'
                className='w-full resize-y rounded-lg border border-input bg-transparent px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50'
              />
            </div>
          </CardContent>
        </Card>

        {/* ── 4. Dates ───────────────────────────────────────────────────── */}
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
                  Date de fin prévue
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
                <Label htmlFor='actualEndDate' className='text-xs font-medium'>
                  Date de fin réelle
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

        {/* ── 5. Encadrants ──────────────────────────────────────────────── */}
        <Card className='border border-primary/15 bg-primary/3'>
          <CardHeader className='pb-3'>
            <SectionHeader icon={UserCheck} title='Encadrants' step={5} />
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='max-w-lg space-y-1.5'>
              <SupervisorSearchPicker
                id='main-supervisor'
                label={
                  <>
                    Encadrant principal
                    {isAssistantPath ? (
                      <span className='text-destructive'> *</span>
                    ) : (
                      <span className='text-muted-foreground font-normal'>
                        {' '}
                        — facultatif
                      </span>
                    )}
                  </>
                }
                value={mainSupervisorId}
                onChange={(id) => {
                  setMainSupervisorId(id)
                  if (errors.mainSupervisor) {
                    setErrors((p) => ({ ...p, mainSupervisor: false }))
                  }
                }}
                excludeIds={coSupervisors
                  .map((c) => c.supervisorId)
                  .filter(Boolean)}
                error={errors.mainSupervisor}
                helperText={
                  <>
                    {errors.mainSupervisor && (
                      <p className='text-xs text-destructive pt-0.5'>
                        Sélectionnez l&apos;encadrant principal (relecteur
                        désigné).
                      </p>
                    )}
                    <p className='text-xs text-muted-foreground max-w-lg pt-0.5'>
                      {isAssistantPath
                        ? 'Requis pour l’assignation : choisissez un chercheur actif dans la liste.'
                        : 'Si ce champ est vide, le système tentera d’utiliser votre matricule (compte chercheur). Ne pas saisir un identifiant utilisateur (UUID).'}
                    </p>
                  </>
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
                        id={`co-supervisor-${idx}`}
                        label={
                          <span className='text-xs'>
                            Co-encadrant {idx + 1}
                          </span>
                        }
                        compact
                        value={co.supervisorId}
                        onChange={(id) => updateCoSupervisorId(idx, id)}
                        excludeIds={[
                          mainSupervisorId,
                          ...coSupervisors
                            .map((c) => c.supervisorId)
                            .filter((sid, j) => j !== idx && Boolean(sid)),
                        ].filter(Boolean)}
                      />
                    </div>
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      className='size-8 shrink-0 text-destructive hover:bg-destructive/10'
                      onClick={() => removeCo(idx)}
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
              onClick={addCo}
              className='gap-2 border-dashed'
            >
              <Plus className='size-4' />
              Ajouter un CO-Encadrant
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
                Création…
              </>
            ) : (
              <>
                <CheckCircle2 className='mr-2 size-4' />
                Ajouter l&apos;encadrement
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
