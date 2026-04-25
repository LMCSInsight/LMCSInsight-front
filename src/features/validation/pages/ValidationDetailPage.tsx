import { useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeft,
  Loader2,
  AlertTriangle,
  CalendarDays,
  BookOpen,
  ShieldCheck,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useValidationDetail } from '@/features/validation/hooks/useValidationDetail'
import {
  useValidateSupervision,
  useRejectSupervision,
  useReviseSupervision,
} from '@/features/validation/hooks/useValidationActions'
import { ValidationStatusBadge } from '@/features/validation/components/ValidationStatusBadge'
import { ValidationTimeline } from '@/features/validation/components/ValidationTimeline'
import { ValidationChecklist } from '@/features/validation/components/ValidationChecklist'
import { ValidationActionBar } from '@/features/validation/components/ValidationActionBar'
import {
  ValidationDecisionModal,
  type DecisionType,
} from '@/features/validation/components/ValidationDecisionModal'
import { AgeBadge } from '@/features/validation/components/ValidationQueueTable'
import { ROUTES, getResearcherReviewsPath } from '@/config/routes'
import { Tag } from '@/components/ui/tag'
import { cn } from '@/lib/utils'
import type {
  ValidationLogInfo,
  SupervisionStatus,
} from '@/features/supervisions/types'
import type { ValidationLogEntry } from '@/features/validation/types'

const SUPERVISION_STATUS_STYLES: Record<SupervisionStatus, string> = {
  IN_PROGRESS:
    'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/50',
  DEFENDED:
    'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/50',
  ABANDONED: 'bg-muted text-muted-foreground border-border',
  EXTENSION:
    'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/50',
  SUSPENDED:
    'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800/50',
}

function SupervisionStatusBadge({ status }: { status: SupervisionStatus }) {
  const { t } = useTranslation()
  return (
    <span
      className={cn(
        'inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium',
        SUPERVISION_STATUS_STYLES[status],
      )}
    >
      {t(`supervisions.status.${status}`)}
    </span>
  )
}

function adaptLog(log: ValidationLogInfo): ValidationLogEntry {
  return {
    id: log.id,
    supervisionId: '',
    validatorId: '',
    status: log.status,
    comments: log.comments,
    fieldsChecked: log.fieldsChecked as Record<string, boolean> | null,
    issues: log.issues as string[] | null,
    createdAt: log.createdAt,
  }
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2)
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return parts[0]?.slice(0, 2).toUpperCase() ?? '?'
}

const TOTAL_FIELDS = 8

export default function ValidationDetailPage() {
  const { supervisionId, userId: routeUserId } = useParams<{
    supervisionId: string
    userId?: string
  }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation()
  const isResearcherReview =
    Boolean(routeUserId) && location.pathname.includes('/reviews/')

  const {
    data: supervision,
    isLoading,
    isError,
  } = useValidationDetail(supervisionId)

  const validateMutation = useValidateSupervision(supervisionId!)
  const rejectMutation = useRejectSupervision(supervisionId!)
  const reviseMutation = useReviseSupervision(supervisionId!)

  const [modalOpen, setModalOpen] = useState(false)
  const [activeDecision, setActiveDecision] = useState<DecisionType | null>(
    null,
  )
  const [fieldsChecked, setFieldsChecked] = useState<Record<string, boolean>>(
    {},
  )

  const isMutating =
    validateMutation.isPending ||
    rejectMutation.isPending ||
    reviseMutation.isPending

  const checkedCount = Object.values(fieldsChecked).filter(Boolean).length

  function openDecision(decision: DecisionType) {
    setActiveDecision(decision)
    setModalOpen(true)
  }

  async function handleConfirm(comments: string, issues: string[]) {
    if (!activeDecision) return
    if (activeDecision === 'validate') {
      await validateMutation.mutateAsync({
        comments: comments || undefined,
        fieldsChecked,
      })
    } else if (activeDecision === 'reject') {
      await rejectMutation.mutateAsync({ comments, issues })
    } else {
      await reviseMutation.mutateAsync({ comments, issues })
    }
    setModalOpen(false)
    setActiveDecision(null)
    if (isResearcherReview && routeUserId) {
      navigate(getResearcherReviewsPath(routeUserId))
    } else {
      navigate(ROUTES.ASSISTANT_ACTIVITY)
    }
  }

  /* ── Loading ──────────────────────────────────────────────────────────── */
  if (isLoading) {
    return (
      <div className='flex flex-col gap-5 py-6 max-w-6xl animate-pulse'>
        <div className='h-8 w-40 rounded-lg bg-muted' />
        <div className='h-36 rounded-xl bg-muted' />
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-5'>
          <div className='lg:col-span-2 flex flex-col gap-5'>
            <div className='h-64 rounded-xl bg-muted' />
            <div className='h-32 rounded-xl bg-muted' />
          </div>
          <div className='flex flex-col gap-5'>
            <div className='h-56 rounded-xl bg-muted' />
            <div className='h-48 rounded-xl bg-muted' />
          </div>
        </div>
        <div className='flex items-center justify-center py-4'>
          <Loader2
            className='size-5 animate-spin text-muted-foreground'
            strokeWidth={1.5}
          />
        </div>
      </div>
    )
  }

  /* ── Error ────────────────────────────────────────────────────────────── */
  if (isError || !supervision) {
    return (
      <div className='flex flex-col items-center gap-4 py-32'>
        <div className='flex size-16 items-center justify-center rounded-full bg-muted'>
          <BookOpen
            className='size-7 text-muted-foreground'
            strokeWidth={1.5}
          />
        </div>
        <div className='text-center'>
          <p className='font-medium text-foreground'>
            {t('supervisions.detail.notFound')}
          </p>
          <p className='mt-1 text-sm text-muted-foreground'>
            {isResearcherReview
              ? t('researcher.reviews.backToList')
              : t('assistant.queue.backToActivity')}
          </p>
        </div>
        <button
          type='button'
          onClick={() => navigate(-1)}
          className='inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors'
        >
          <ArrowLeft className='size-4' strokeWidth={1.5} />
          {t('common.back')}
        </button>
      </div>
    )
  }

  const timelineEntries = (supervision.validations ?? []).map(adaptLog)
  const studentName = supervision.student
    ? `${supervision.student.firstName} ${supervision.student.lastName}`
    : '—'
  const showResearcherChecklist =
    isResearcherReview && supervision.validationStatus === 'PENDING'

  const flaggedIssues =
    timelineEntries.length > 0 && timelineEntries[0].issues
      ? (timelineEntries[0].issues as string[])
      : []

  return (
    <div className='flex flex-col min-h-full max-w-6xl'>
      {/* ── Back nav ───────────────────────────────────────────────────────── */}
      <button
        type='button'
        onClick={() =>
          navigate(
            isResearcherReview && routeUserId
              ? getResearcherReviewsPath(routeUserId)
              : ROUTES.ASSISTANT_ACTIVITY,
          )
        }
        className='mb-5 inline-flex w-fit items-center gap-1.5 rounded-md px-1 py-1 text-sm text-muted-foreground hover:text-foreground transition-colors'
      >
        <ArrowLeft className='size-4' strokeWidth={1.5} />
        {isResearcherReview
          ? t('researcher.reviews.backToList')
          : t('assistant.queue.backToActivity')}
      </button>

      {/* ── Hero card ──────────────────────────────────────────────────────── */}
      <Card className='relative mb-5 overflow-hidden border-primary/20 bg-linear-to-br from-primary/8 via-primary/3 to-transparent'>
        <CardContent className='px-6 py-5'>
          <div className='flex flex-wrap items-start justify-between gap-3 mb-3'>
            <h1 className='text-xl font-semibold tracking-tight text-foreground leading-snug flex-1 min-w-0'>
              {supervision.title}
            </h1>
            <ValidationStatusBadge status={supervision.validationStatus} />
          </div>

          {/* Metadata chips row */}
          <div className='flex flex-wrap items-center gap-x-3 gap-y-2'>
            <span className='inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-0.5 text-xs font-semibold text-muted-foreground'>
              {supervision.type}
            </span>
            <span className='inline-flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap'>
              <CalendarDays className='size-3.5 shrink-0' strokeWidth={1.5} />
              {supervision.academicYear}
            </span>
            <span className='text-muted-foreground/40'>·</span>
            <span className='text-xs text-muted-foreground whitespace-nowrap'>
              {t('assistant.detail.submitted')}{' '}
              {new Date(supervision.createdAt).toLocaleDateString(undefined, {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </span>
            <AgeBadge dateStr={supervision.createdAt} />
          </div>
        </CardContent>
      </Card>

      {/* ── Main grid ──────────────────────────────────────────────────────── */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-5 pb-24'>
        {/* ── LEFT: 2/3 ────────────────────────────────────────────────────── */}
        <div className='lg:col-span-2 flex flex-col gap-5'>
          {/* Details card */}
          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='text-sm font-semibold'>
                {t('supervisions.detail.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className='flex flex-col gap-5'>
              {/* Key facts grid */}
              <div className='grid grid-cols-2 sm:grid-cols-3 gap-4'>
                <div>
                  <p className='text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-1'>
                    {t('supervisions.detail.labels.studentName')}
                  </p>
                  <p className='text-sm font-semibold text-foreground'>
                    {studentName}
                  </p>
                  {supervision.student?.institution && (
                    <p className='text-xs text-muted-foreground mt-0.5'>
                      {supervision.student.institution}
                    </p>
                  )}
                </div>
                <div>
                  <p className='text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-1'>
                    {t('supervisions.detail.labels.supervisionType')}
                  </p>
                  <span className='inline-flex items-center rounded-md border border-border bg-muted/60 px-2.5 py-0.5 text-xs font-semibold text-muted-foreground'>
                    {supervision.type}
                  </span>
                </div>
                <div>
                  <p className='text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-1'>
                    {t('supervisions.detail.labels.academicYear')}
                  </p>
                  <p className='text-sm font-semibold text-foreground whitespace-nowrap'>
                    {supervision.academicYear}
                  </p>
                </div>
                <div>
                  <p className='text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-1'>
                    {t('supervisions.detail.labels.status')}
                  </p>
                  <SupervisionStatusBadge status={supervision.status} />
                </div>
                {supervision.startDate && (
                  <div>
                    <p className='text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-1'>
                      Début
                    </p>
                    <p className='text-sm font-medium text-foreground whitespace-nowrap'>
                      {new Date(supervision.startDate).toLocaleDateString(
                        undefined,
                        {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        },
                      )}
                    </p>
                  </div>
                )}
                {supervision.theme && (
                  <div>
                    <p className='text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-1'>
                      {t('supervisions.detail.labels.theme')}
                    </p>
                    <p className='text-sm font-medium text-foreground'>
                      {supervision.theme.name}
                    </p>
                  </div>
                )}
              </div>

              {/* Description */}
              {supervision.description && (
                <div className='border-t border-border pt-4'>
                  <p className='text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-2'>
                    {t('supervisions.detail.labels.topicDescription')}
                  </p>
                  <p className='text-sm text-foreground leading-relaxed whitespace-pre-wrap'>
                    {supervision.description}
                  </p>
                </div>
              )}

              {/* Keywords */}
              {supervision.keywords.length > 0 && (
                <div className='border-t border-border pt-4'>
                  <p className='text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-2.5'>
                    {t('supervisions.detail.sections.topic')}
                  </p>
                  <div className='flex flex-wrap gap-1.5'>
                    {supervision.keywords.map((kw) => (
                      <Tag key={kw}>{kw}</Tag>
                    ))}
                  </div>
                </div>
              )}

              {/* Supervisors */}
              {supervision.supervisors.length > 0 && (
                <div className='border-t border-border pt-4'>
                  <p className='text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-3'>
                    {t('supervisions.detail.sections.supervisors')}
                  </p>
                  <div className='flex flex-col gap-3'>
                    {supervision.supervisors.map((s) => (
                      <div key={s.id} className='flex items-center gap-3'>
                        <div className='flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary ring-1 ring-primary/20'>
                          {getInitials(s.supervisor.nom_complet)}
                        </div>
                        <div className='min-w-0 flex-1'>
                          <p className='text-sm font-medium text-foreground leading-snug'>
                            {s.supervisor.nom_complet}
                          </p>
                          <p className='text-xs text-muted-foreground'>
                            {s.isMainSupervisor
                              ? t('assistant.detail.mainSupervisor')
                              : t('assistant.detail.coSupervisor')}
                            {' · '}
                            {s.contributionPercent}%
                          </p>
                        </div>
                        {s.isMainSupervisor && (
                          <span className='shrink-0 rounded-full border border-primary/25 bg-primary/8 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary'>
                            Principal
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Flagged issues from last review */}
          {flaggedIssues.length > 0 && (
            <Card className='border-rose-200 bg-rose-50 dark:border-rose-800/40 dark:bg-rose-900/10'>
              <CardHeader className='pb-3'>
                <CardTitle className='flex items-center gap-2 text-sm font-semibold text-rose-800 dark:text-rose-400'>
                  <AlertTriangle
                    className='size-4 shrink-0'
                    strokeWidth={1.5}
                  />
                  {t('assistant.detail.flaggedIssues')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className='flex flex-col gap-2.5'>
                  {flaggedIssues.map((issue, i) => (
                    <li
                      key={i}
                      className='flex items-start gap-2.5 text-sm text-rose-800 dark:text-rose-300'
                    >
                      <span className='mt-1.5 size-1.5 shrink-0 rounded-full bg-rose-500' />
                      {issue}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        {/* ── RIGHT: 1/3 ───────────────────────────────────────────────────── */}
        <div className='flex flex-col gap-5'>
          {/* Checklist with progress */}
          {showResearcherChecklist && (
            <Card>
              <CardHeader className='pb-3'>
                <div className='flex items-center justify-between'>
                  <CardTitle className='flex items-center gap-2 text-sm font-semibold'>
                    <ShieldCheck
                      className='size-4 text-primary'
                      strokeWidth={1.5}
                    />
                    {t('assistant.checklist.title')}
                  </CardTitle>
                  <span
                    className={cn(
                      'text-xs font-semibold tabular-nums',
                      checkedCount === TOTAL_FIELDS
                        ? 'text-emerald-600'
                        : 'text-muted-foreground',
                    )}
                  >
                    {checkedCount}/{TOTAL_FIELDS}
                  </span>
                </div>
                {/* Progress bar */}
                <div className='mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted'>
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-500',
                      checkedCount === TOTAL_FIELDS
                        ? 'bg-emerald-500'
                        : 'bg-primary',
                    )}
                    style={{ width: `${(checkedCount / TOTAL_FIELDS) * 100}%` }}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <ValidationChecklist
                  fieldsChecked={fieldsChecked}
                  onChange={setFieldsChecked}
                  disabled={isMutating}
                />
              </CardContent>
            </Card>
          )}

          {/* Validation timeline */}
          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='text-sm font-semibold'>
                {t('assistant.timeline.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ValidationTimeline entries={timelineEntries} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Sticky action bar (main supervisor / researcher, PENDING only) ── */}
      {isResearcherReview && supervision.validationStatus === 'PENDING' && (
        <ValidationActionBar
          onAction={openDecision}
          disabled={isMutating}
          status={supervision.validationStatus}
        />
      )}

      {/* ── Decision modal ─────────────────────────────────────────────────── */}
      <ValidationDecisionModal
        open={modalOpen}
        decision={activeDecision}
        loading={isMutating}
        onClose={() => {
          setModalOpen(false)
          setActiveDecision(null)
        }}
        onConfirm={handleConfirm}
      />
    </div>
  )
}
