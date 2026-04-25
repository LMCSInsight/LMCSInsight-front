import { useNavigate, useParams, Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ROUTES, getAssistantSupervisionEditPath } from '@/config/routes'
import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Calendar,
  Tag,
  Users,
  Star,
  UserCheck,
  CheckCircle2,
  Clock,
  XCircle,
  RefreshCw,
  GraduationCap,
  BookOpen,
  Hash,
  ChevronRight,
} from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import {
  useSupervision,
  useDeleteSupervision,
} from '@/features/supervisions/hooks/useSupervisions'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

// ─── Label / color maps ──────────────────────────────────────────────────────

const STATUS_LABELS: Record<string, string> = {
  IN_PROGRESS: 'En cours',
  DEFENDED: 'Soutenu',
  ABANDONED: 'Abandonné',
  EXTENSION: 'Prolongation',
  SUSPENDED: 'Suspendu',
}
const TYPE_LABELS: Record<string, string> = {
  PFE: 'PFE',
  MASTER: 'Master',
  PHD: 'Doctorat',
  INTERNSHIP: 'Stage (SPE)',
  PROJECT: 'Projet de recherche',
}
const VALIDATION_LABELS: Record<string, string> = {
  PENDING: 'En attente',
  VALIDATED: 'Validé',
  REJECTED: 'Refusé',
  REVISED: 'À réviser',
}

// Status hero card accent (left-border + bg tint)
const STATUS_ACCENT: Record<
  string,
  { border: string; bg: string; dark: string }
> = {
  IN_PROGRESS: {
    border: 'border-l-blue-500',
    bg: 'bg-blue-50/60',
    dark: 'dark:bg-blue-950/20',
  },
  DEFENDED: {
    border: 'border-l-green-500',
    bg: 'bg-green-50/60',
    dark: 'dark:bg-green-950/20',
  },
  ABANDONED: {
    border: 'border-l-red-400',
    bg: 'bg-red-50/60',
    dark: 'dark:bg-red-950/20',
  },
  EXTENSION: {
    border: 'border-l-orange-400',
    bg: 'bg-orange-50/60',
    dark: 'dark:bg-orange-950/20',
  },
  SUSPENDED: {
    border: 'border-l-gray-400',
    bg: 'bg-gray-50/60',
    dark: 'dark:bg-gray-950/20',
  },
}

const STATUS_BADGE_STYLE: Record<string, string> = {
  IN_PROGRESS:
    'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  DEFENDED:
    'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  ABANDONED: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  EXTENSION:
    'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
  SUSPENDED: 'bg-gray-100 text-gray-700 dark:bg-gray-900/40 dark:text-gray-300',
}

const VALIDATION_ICON: Record<string, React.ElementType> = {
  PENDING: Clock,
  VALIDATED: CheckCircle2,
  REJECTED: XCircle,
  REVISED: RefreshCw,
}
const VALIDATION_BADGE_STYLE: Record<string, string> = {
  PENDING:
    'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  VALIDATED:
    'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  REJECTED: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  REVISED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(iso?: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('fr-DZ', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

function getInitials(name?: string): string {
  if (!name) return '?'
  return name
    .trim()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('')
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className='flex flex-col gap-0.5'>
      <span className='text-xs font-semibold text-muted-foreground'>
        {label}
      </span>
      <span className='text-sm font-medium text-foreground'>
        {value ?? '—'}
      </span>
    </div>
  )
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function SkeletonPage() {
  return (
    <div className='mx-auto w-full max-w-4xl space-y-4'>
      <div className='h-36 animate-pulse rounded-2xl bg-muted' />
      <div className='grid gap-4 sm:grid-cols-2'>
        <div className='h-40 animate-pulse rounded-xl bg-muted' />
        <div className='h-40 animate-pulse rounded-xl bg-muted' />
      </div>
      <div className='h-28 animate-pulse rounded-xl bg-muted' />
      <div className='grid grid-cols-3 gap-4'>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className='h-24 animate-pulse rounded-xl bg-muted' />
        ))}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SupervisionDetailPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { id, supervisionId, userId } = useParams<{
    id?: string
    supervisionId?: string
    userId?: string
  }>()
  const resolvedId = supervisionId ?? id

  const { data, isLoading, isError } = useSupervision(resolvedId)
  const { mutate: deleteSupervision, isPending: isDeleting } =
    useDeleteSupervision()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  // ── Hooks must be declared before any early return ────────────────────────
  const [barsVisible, setBarsVisible] = useState(false)
  useEffect(() => {
    if (!data) return
    const t = setTimeout(() => setBarsVisible(true), 200)
    return () => clearTimeout(t)
  }, [data])

  if (isLoading) return <SkeletonPage />

  if (isError || !data) {
    return (
      <div className='mx-auto w-full max-w-4xl'>
        <Card className='border-destructive/40 bg-destructive/5'>
          <CardContent className='flex flex-col items-center gap-3 py-14 text-center'>
            <div className='flex size-12 items-center justify-center rounded-full bg-destructive/10'>
              <BookOpen className='size-6 text-destructive' />
            </div>
            <p className='text-sm font-medium text-destructive'>
              Impossible de charger cet encadrement.
            </p>
            <Button variant='outline' size='sm' onClick={() => navigate(-1)}>
              <ArrowLeft className='mr-2 size-4' />
              Retour
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const accent = STATUS_ACCENT[data.status] ?? STATUS_ACCENT.SUSPENDED
  const isAssistantPortal = location.pathname.startsWith('/assistant/')
  const canEditAsAssistant =
    isAssistantPortal &&
    resolvedId &&
    (data.validationStatus === 'PENDING' ||
      data.validationStatus === 'REVISED' ||
      data.validationStatus === 'REJECTED')
  const editPath =
    canEditAsAssistant && resolvedId
      ? getAssistantSupervisionEditPath(resolvedId)
      : undefined
  const basePath = isAssistantPortal
    ? '/assistant/supervisions'
    : userId
      ? `/researcher/${userId}/supervisions`
      : '#'
  const showEditButton = canEditAsAssistant
  const deletableByAssistant = data.validationStatus !== 'VALIDATED'
  const showDeleteAsAssistant = isAssistantPortal && deletableByAssistant
  const ValidationIcon = VALIDATION_ICON[data.validationStatus] ?? Clock

  // Timeline progress calculation
  const startMs = data.startDate ? new Date(data.startDate).getTime() : null
  const endMs = data.expectedEndDate
    ? new Date(data.expectedEndDate).getTime()
    : null
  const nowMs = Date.now()
  const progressPct =
    startMs && endMs && endMs > startMs
      ? Math.min(
          100,
          Math.max(
            0,
            Math.round(((nowMs - startMs) / (endMs - startMs)) * 100),
          ),
        )
      : null

  return (
    <div className='mx-auto w-full max-w-4xl space-y-4'>
      <ConfirmDialog
        open={deleteOpen}
        title={t('assistant.supervisions.deleteTitle')}
        description={t('assistant.supervisions.deleteDescription')}
        confirmLabel={t('assistant.supervisions.delete')}
        onCancel={() => {
          setDeleteOpen(false)
          setDeleteError(null)
        }}
        onConfirm={() => {
          if (!resolvedId) return
          setDeleteError(null)
          deleteSupervision(resolvedId, {
            onSuccess: () => {
              setDeleteOpen(false)
              navigate(ROUTES.ASSISTANT_SUPERVISIONS)
            },
            onError: () => {
              setDeleteError(t('assistant.supervisions.deleteError'))
            },
          })
        }}
      />
      {deleteError && showDeleteAsAssistant && (
        <p className='text-sm text-destructive' role='alert'>
          {deleteError}
        </p>
      )}
      {/* ── Breadcrumb ───────────────────────────────────────────────── */}
      <nav className='flex items-center gap-1.5 text-xs text-muted-foreground'>
        <Link to={basePath} className='hover:text-foreground transition-colors'>
          Encadrements
        </Link>
        <ChevronRight className='size-3 shrink-0' />
        <span className='text-foreground font-medium truncate max-w-xs'>
          {data.title}
        </span>
      </nav>

      {/* ── Status hero card ──────────────────────────────────────────── */}
      <Card
        className={`overflow-hidden border-l-4 ${accent.border} ${accent.bg} ${accent.dark}`}
      >
        <CardContent className='px-6 py-6'>
          <div className='flex flex-wrap items-start justify-between gap-4'>
            <div className='flex-1 min-w-0 space-y-3'>
              <h1 className='text-2xl font-bold leading-tight tracking-tight text-foreground'>
                {data.title}
              </h1>
              <div className='flex flex-wrap items-center gap-2'>
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                    STATUS_BADGE_STYLE[data.status] ??
                    'bg-muted text-foreground'
                  }`}
                >
                  {STATUS_LABELS[data.status] ?? data.status}
                </span>
                <Badge variant='outline' className='text-xs'>
                  {TYPE_LABELS[data.type] ?? data.type}
                </Badge>
                {data.academicYear && (
                  <Badge variant='secondary' className='text-xs'>
                    {data.academicYear}
                  </Badge>
                )}
              </div>
            </div>
            {/* Validation pill */}
            <div
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold shrink-0 ${
                VALIDATION_BADGE_STYLE[data.validationStatus] ??
                'bg-muted text-foreground'
              }`}
            >
              <ValidationIcon className='size-3.5' />
              {VALIDATION_LABELS[data.validationStatus] ??
                data.validationStatus}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Bento grid: student + validation ─────────────────────────── */}
      <div className='grid gap-4 sm:grid-cols-2'>
        {/* Student card */}
        <Card className='border-l-4 border-l-primary'>
          <CardHeader className='pb-3'>
            <div className='flex items-center gap-2'>
              <div className='flex size-7 items-center justify-center rounded-md bg-primary/10'>
                <GraduationCap className='size-4 text-primary' />
              </div>
              <span className='text-sm font-semibold text-foreground'>
                Étudiant
              </span>
            </div>
          </CardHeader>
          <CardContent>
            {data.student ? (
              <div className='space-y-3'>
                <div className='flex items-center gap-3'>
                  <div className='flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground'>
                    {getInitials(
                      `${data.student.firstName} ${data.student.lastName}`,
                    )}
                  </div>
                  <div>
                    <p className='text-sm font-semibold text-foreground'>
                      {data.student.lastName} {data.student.firstName}
                    </p>
                    <p className='text-xs text-muted-foreground'>
                      {data.student.level}
                    </p>
                  </div>
                </div>
                <div className='h-px bg-border' />
                <div className='grid grid-cols-1 gap-3'>
                  <InfoRow
                    label='Établissement'
                    value={data.student.institution}
                  />
                  <InfoRow label='Email' value={data.student.email} />
                </div>
              </div>
            ) : (
              <p className='text-sm text-muted-foreground italic'>
                Étudiant non renseigné
              </p>
            )}
          </CardContent>
        </Card>

        {/* Validation card */}
        <Card
          className={`border-l-4 ${
            data.validationStatus === 'VALIDATED'
              ? 'border-l-green-500'
              : data.validationStatus === 'REJECTED'
                ? 'border-l-red-400'
                : data.validationStatus === 'REVISED'
                  ? 'border-l-blue-400'
                  : 'border-l-amber-400'
          }`}
        >
          <CardHeader className='pb-3'>
            <div className='flex items-center gap-2'>
              <div className='flex size-7 items-center justify-center rounded-md bg-primary/10'>
                <CheckCircle2 className='size-4 text-primary' />
              </div>
              <span className='text-sm font-semibold text-foreground'>
                Validation
              </span>
            </div>
          </CardHeader>
          <CardContent className='space-y-3'>
            <div
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                VALIDATION_BADGE_STYLE[data.validationStatus] ??
                'bg-muted text-foreground'
              }`}
            >
              <ValidationIcon className='size-3' />
              {VALIDATION_LABELS[data.validationStatus] ??
                data.validationStatus}
            </div>
            {data.validatedAt && (
              <InfoRow label='Validé le' value={fmt(data.validatedAt)} />
            )}
            {data.validationNotes && (
              <div className='flex flex-col gap-0.5'>
                <span className='text-xs font-semibold text-muted-foreground'>
                  Notes
                </span>
                <p className='text-sm text-foreground leading-relaxed'>
                  {data.validationNotes}
                </p>
              </div>
            )}
            {!data.validatedAt && !data.validationNotes && (
              <p className='text-xs text-muted-foreground italic'>
                Aucune note de validation
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Thématique card ───────────────────────────────────────────── */}
      <Card className='border-l-4 border-l-primary'>
        <CardHeader className='pb-3'>
          <div className='flex items-center gap-2'>
            <div className='flex size-7 items-center justify-center rounded-md bg-primary/10'>
              <Tag className='size-4 text-primary' />
            </div>
            <span className='text-sm font-semibold text-foreground'>
              Thématique
            </span>
          </div>
        </CardHeader>
        <CardContent className='space-y-4'>
          {/* Keywords */}
          {data.keywords?.length > 0 ? (
            <div className='flex flex-wrap gap-1.5'>
              {data.keywords.map((k) => (
                <span
                  key={k}
                  className='inline-flex items-center rounded-md border-l-2 border-l-primary/40 border border-primary/15 bg-primary/8 px-2.5 py-0.5 text-xs font-medium text-primary'
                >
                  {k}
                </span>
              ))}
            </div>
          ) : (
            <p className='text-xs text-muted-foreground italic'>
              Aucun mot-clé
            </p>
          )}
          {/* Description */}
          {data.description && (
            <>
              <div className='h-px bg-border' />
              <div className='flex flex-col gap-1'>
                <span className='text-xs font-semibold text-muted-foreground'>
                  Description
                </span>
                <p className='text-sm leading-relaxed text-foreground'>
                  {data.description}
                </p>
              </div>
            </>
          )}
          {/* Theme */}
          {data.theme && (
            <>
              <div className='h-px bg-border' />
              <InfoRow label='Thème de recherche' value={data.theme.name} />
            </>
          )}
        </CardContent>
      </Card>

      {/* ── Dates — timeline bar ─────────────────────────────────────── */}
      <Card>
        <CardHeader className='pb-3'>
          <div className='flex items-center gap-2'>
            <div className='flex size-7 items-center justify-center rounded-md bg-primary/10'>
              <Calendar className='size-4 text-primary' />
            </div>
            <span className='text-sm font-semibold text-foreground'>
              Calendrier
            </span>
          </div>
        </CardHeader>
        <CardContent className='space-y-4'>
          {/* Timeline bar */}
          {progressPct !== null && (
            <div className='space-y-1.5'>
              <div className='h-2 w-full overflow-hidden rounded-full bg-muted'>
                <div
                  className='h-full rounded-full bg-primary transition-[width] duration-700 ease-out'
                  style={{ width: barsVisible ? `${progressPct}%` : '0%' }}
                />
              </div>
              <div className='flex justify-between text-xs text-muted-foreground'>
                <span>{fmt(data.startDate)}</span>
                <span className='tabular font-medium text-foreground'>
                  {progressPct}% écoulé
                </span>
                <span>{fmt(data.expectedEndDate)}</span>
              </div>
            </div>
          )}
          <div className='grid grid-cols-3 gap-4'>
            <div className='flex flex-col gap-0.5'>
              <span className='text-xs font-semibold text-muted-foreground'>
                Début
              </span>
              <span className='text-sm font-medium text-foreground'>
                {fmt(data.startDate)}
              </span>
            </div>
            <div className='flex flex-col gap-0.5'>
              <span className='text-xs font-semibold text-muted-foreground'>
                Fin prévue
              </span>
              <span className='text-sm font-medium text-foreground'>
                {fmt(data.expectedEndDate)}
              </span>
            </div>
            <div className='flex flex-col gap-0.5'>
              <span className='text-xs font-semibold text-muted-foreground'>
                Fin réelle
              </span>
              <span className='text-sm font-medium text-foreground'>
                {fmt(data.actualEndDate)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Encadrants ────────────────────────────────────────────────── */}
      <Card className='border-l-4 border-l-primary'>
        <CardHeader className='pb-3'>
          <div className='flex items-center gap-2'>
            <div className='flex size-7 items-center justify-center rounded-md bg-primary/10'>
              <UserCheck className='size-4 text-primary' />
            </div>
            <span className='text-sm font-semibold text-foreground'>
              Encadrants
            </span>
            <Badge variant='secondary' className='ml-auto text-xs'>
              {data.supervisors.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {data.supervisors.length === 0 ? (
            <p className='text-sm text-muted-foreground italic'>
              Aucun encadrant assigné
            </p>
          ) : (
            <div className='space-y-3'>
              {data.supervisors.map((s, idx) => (
                <div
                  key={s.id ?? idx}
                  className='flex items-center gap-4 rounded-xl border border-border bg-muted/30 p-4'
                >
                  {/* Avatar / role icon */}
                  <div
                    className={`flex size-10 shrink-0 items-center justify-center rounded-full ${
                      s.isMainSupervisor
                        ? 'bg-amber-100 dark:bg-amber-900/40'
                        : 'bg-muted'
                    }`}
                  >
                    {s.isMainSupervisor ? (
                      <Star className='size-5 text-amber-600 dark:text-amber-400' />
                    ) : (
                      <Users className='size-5 text-muted-foreground' />
                    )}
                  </div>
                  {/* Name + badges */}
                  <div className='flex-1 min-w-0'>
                    <p className='text-sm font-semibold text-foreground truncate'>
                      {s.supervisor.nom_complet}
                    </p>
                    <div className='mt-1 flex flex-wrap gap-1'>
                      <Badge
                        variant={s.isMainSupervisor ? 'default' : 'secondary'}
                        className='h-4 px-1.5 text-[10px]'
                      >
                        {s.isMainSupervisor ? 'Principal' : 'CO-Encadrant'}
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
                  {/* Contribution bar */}
                  {s.contributionPercent != null && (
                    <div className='flex flex-col items-end gap-1 shrink-0'>
                      <span className='tabular text-xs font-semibold text-foreground'>
                        {s.contributionPercent}%
                      </span>
                      <div className='h-1.5 w-20 overflow-hidden rounded-full bg-muted'>
                        <div
                          className='h-full rounded-full bg-primary transition-[width] duration-700 delay-300 ease-out'
                          style={{
                            width: barsVisible
                              ? `${s.contributionPercent}%`
                              : '0%',
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Metadata ─────────────────────────────────────────────────── */}
      <Card>
        <CardContent className='grid grid-cols-2 gap-4 pt-4 sm:grid-cols-3'>
          <InfoRow label='Créé le' value={fmt(data.createdAt)} />
          <InfoRow label='Mis à jour le' value={fmt(data.updatedAt)} />
          <div className='flex flex-col gap-0.5 sm:col-span-1 col-span-2'>
            <span className='text-xs font-semibold text-muted-foreground'>
              ID
            </span>
            <span
              className='flex items-center gap-1 text-xs font-mono text-muted-foreground truncate'
              title={data.id}
            >
              <Hash className='size-3 shrink-0' />
              {data.id}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* ── Action bar ───────────────────────────────────────────────── */}
      <div className='flex flex-wrap items-center gap-3 pt-1'>
        <Button variant='ghost' onClick={() => navigate(-1)} className='gap-2'>
          <ArrowLeft className='size-4' />
          Retour
        </Button>
        <div className='flex-1' />
        {showEditButton && editPath && (
          <Link
            to={editPath}
            className={cn(
              buttonVariants({ variant: 'outline' }),
              'gap-2 inline-flex items-center',
            )}
          >
            <Pencil className='size-4' />
            Modifier
          </Link>
        )}
        {showDeleteAsAssistant && (
          <Button
            type='button'
            variant='destructive'
            disabled={isDeleting}
            className='gap-2'
            onClick={() => {
              setDeleteError(null)
              setDeleteOpen(true)
            }}
          >
            <Trash2 className='size-4' />
            {t('assistant.supervisions.delete')}
          </Button>
        )}
      </div>
    </div>
  )
}
