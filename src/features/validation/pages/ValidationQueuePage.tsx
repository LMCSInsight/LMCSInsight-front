import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useMatch } from 'react-router-dom'
import { Search, X, ClipboardCheck } from 'lucide-react'
import {
  getResearcherReviewDetailPath,
  getAssistantSupervisionDetailPath,
} from '@/config/routes'
import { Card, CardContent } from '@/components/ui/card'
import { useValidationQueue } from '@/features/validation/hooks/useValidationQueue'
import { useValidationStats } from '@/features/validation/hooks/useValidationStats'
import {
  ValidationQueueTable,
  QueuePagination,
} from '@/features/validation/components/ValidationQueueTable'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { ValidationStatus } from '@/features/validation/types'
import type { SupervisionType } from '@/features/supervisions/types'

const TABS: { value: ValidationStatus | 'ALL'; labelKey: string }[] = [
  { value: 'PENDING', labelKey: 'assistant.status.pending' },
  { value: 'REVISED', labelKey: 'assistant.status.revised' },
  { value: 'REJECTED', labelKey: 'assistant.status.rejected' },
  { value: 'VALIDATED', labelKey: 'assistant.status.validated' },
  { value: 'ALL', labelKey: 'assistant.queue.tabs.all' },
]

const TYPE_OPTIONS = ['PFE', 'MASTER', 'PHD', 'INTERNSHIP', 'PROJECT']

export default function ValidationQueuePage() {
  const { t } = useTranslation()
  const researcherListMatch = useMatch({
    path: '/researcher/:userId/reviews',
    end: true,
  })
  const researcherId = researcherListMatch?.params.userId
  const isResearcherReviews = Boolean(researcherId)
  const resolveDetailPath = useMemo(
    () =>
      isResearcherReviews && researcherId
        ? (id: string) => getResearcherReviewDetailPath(researcherId, id)
        : (id: string) => getAssistantSupervisionDetailPath(id),
    [isResearcherReviews, researcherId],
  )
  const [tab, setTab] = useState<ValidationStatus | 'ALL'>('PENDING')
  const [search, setSearch] = useState('')
  const [type, setType] = useState<string | undefined>(undefined)
  const [page, setPage] = useState(1)

  const filters = {
    ...(tab !== 'ALL' && { status: tab as ValidationStatus }),
    ...(search.trim() && { search: search.trim() }),
    ...(type && { type: type as SupervisionType }),
    page,
    limit: 20,
  }

  const { data, isLoading } = useValidationQueue(filters)
  const { data: stats } = useValidationStats()
  const items = data?.data ?? []
  const total = data?.total ?? 0

  function handleTabChange(value: string) {
    setTab(value as ValidationStatus | 'ALL')
    setPage(1)
  }

  function toggleType(value: string) {
    setType((prev) => (prev === value ? undefined : value))
    setPage(1)
  }

  function clearFilters() {
    setType(undefined)
    setSearch('')
    setPage(1)
  }

  const hasActiveFilters = !!type || !!search.trim()

  return (
    <div className='flex flex-col gap-5 py-6 max-w-7xl'>
      {/* ── Hero card ──────────────────────────────────────────────────────── */}
      <Card className='relative overflow-hidden border-primary/20 bg-linear-to-br from-primary/8 via-primary/3 to-transparent'>
        <div
          className='pointer-events-none absolute -right-2 top-1/2 -translate-y-1/2 select-none text-[7rem] font-black leading-none tabular-nums text-primary/6'
          aria-hidden
        >
          {stats?.pending ?? '·'}
        </div>
        <CardContent className='px-6 py-5'>
          <div className='flex flex-wrap items-start justify-between gap-4'>
            <div>
              <p className='mb-1.5 text-[11px] font-semibold uppercase tracking-widest text-primary/70'>
                {isResearcherReviews
                  ? t('researcher.reviews.breadcrumb')
                  : t('assistant.activityQueue')}
              </p>
              <div className='flex items-baseline gap-2.5'>
                <span className='text-5xl font-black leading-none tabular-nums text-foreground'>
                  {stats?.pending ?? '—'}
                </span>
                <span className='text-sm text-muted-foreground'>
                  {isResearcherReviews
                    ? t('researcher.reviews.pendingQueueHero')
                    : t('assistant.dashboard.pendingLabel')}
                </span>
              </div>
            </div>

            {stats && (
              <div className='flex gap-2.5'>
                <div className='flex flex-col items-center gap-0.5 rounded-xl border border-sky-200 bg-sky-50 px-4 py-2.5 dark:border-sky-800/50 dark:bg-sky-900/20'>
                  <span className='text-2xl font-bold leading-none tabular-nums text-sky-700 dark:text-sky-400'>
                    {stats.revisedThisWeek}
                  </span>
                  <span className='text-[10px] font-semibold uppercase tracking-wider text-sky-600/70 dark:text-sky-500'>
                    {t('assistant.status.revised')}
                  </span>
                </div>
                <div className='flex flex-col items-center gap-0.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 dark:border-emerald-800/50 dark:bg-emerald-900/20'>
                  <span className='text-2xl font-bold leading-none tabular-nums text-emerald-700 dark:text-emerald-400'>
                    {stats.validatedToday}
                  </span>
                  <span className='text-[10px] font-semibold uppercase tracking-wider text-emerald-600/70 dark:text-emerald-500'>
                    {t('assistant.status.validated')}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Type breakdown — clickable chips to filter by type */}
          {stats?.byType && Object.keys(stats.byType).length > 0 && (
            <div className='mt-4 flex flex-wrap items-center gap-2 border-t border-primary/10 pt-4'>
              <span className='text-[11px] font-medium text-muted-foreground'>
                {t('assistant.queue.filters.type')}:
              </span>
              {Object.entries(stats.byType).map(([tp, count]) => (
                <button
                  key={tp}
                  type='button'
                  onClick={() => {
                    setTab('PENDING')
                    toggleType(tp)
                  }}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors',
                    type === tp
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-card hover:border-primary/40 hover:bg-primary/5',
                  )}
                >
                  <span className='text-muted-foreground'>{tp}</span>
                  <span className='font-bold tabular-nums text-foreground'>
                    {count}
                  </span>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Status tabs ────────────────────────────────────────────────────── */}
      <Tabs value={tab} onValueChange={handleTabChange}>
        <TabsList>
          {TABS.map(({ value, labelKey }) => (
            <TabsTrigger key={value} value={value}>
              {t(labelKey)}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* ── Search + type filter chips ──────────────────────────────────────── */}
      <div className='flex flex-col gap-3'>
        <div className='flex flex-wrap items-center gap-3'>
          <div className='relative w-full max-w-sm'>
            <Search
              className='absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground'
              strokeWidth={1.5}
            />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              placeholder={t('assistant.queue.searchPlaceholder')}
              className='pl-9'
            />
          </div>
          <div className='flex flex-wrap gap-1.5'>
            {TYPE_OPTIONS.map((opt) => (
              <button
                key={opt}
                type='button'
                onClick={() => toggleType(opt)}
                className={cn(
                  'h-7 rounded-md border px-2.5 text-xs font-medium transition-colors',
                  type === opt
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {hasActiveFilters && (
          <div className='flex flex-wrap items-center gap-2'>
            <span className='text-xs text-muted-foreground'>
              {t('assistant.queue.filters.active')}:
            </span>
            {type && (
              <span className='inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/8 px-2 py-0.5 text-xs text-primary'>
                {type}
                <button
                  type='button'
                  onClick={() => setType(undefined)}
                  className='hover:text-primary/70'
                >
                  <X className='size-3' />
                </button>
              </span>
            )}
            {search.trim() && (
              <span className='inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/8 px-2 py-0.5 text-xs text-primary'>
                &quot;{search.trim()}&quot;
                <button
                  type='button'
                  onClick={() => setSearch('')}
                  className='hover:text-primary/70'
                >
                  <X className='size-3' />
                </button>
              </span>
            )}
            <button
              type='button'
              onClick={clearFilters}
              className='text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground'
            >
              {t('common.clearAll')}
            </button>
          </div>
        )}
      </div>

      {/* ── Table ──────────────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className='overflow-hidden rounded-xl border border-border bg-card shadow-sm'>
          <div className='divide-y divide-border'>
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className='flex items-center gap-4 px-4 py-4'>
                <div className='flex flex-1 flex-col gap-1.5'>
                  <div className='h-4 w-2/5 animate-pulse rounded bg-muted' />
                  <div className='h-3 w-1/4 animate-pulse rounded bg-muted/60' />
                </div>
                <div className='h-4 w-16 animate-pulse rounded-md bg-muted hidden md:block' />
                <div className='ml-auto h-5 w-20 animate-pulse rounded-full bg-muted' />
                <div className='h-5 w-10 animate-pulse rounded-md bg-muted' />
              </div>
            ))}
          </div>
        </div>
      ) : items.length === 0 ? (
        <div className='flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-card/50 py-20'>
          <div className='flex size-14 items-center justify-center rounded-full bg-muted'>
            <ClipboardCheck
              className='size-6 text-muted-foreground'
              strokeWidth={1.5}
            />
          </div>
          <div className='text-center'>
            <p className='text-sm font-medium text-foreground'>
              {t('assistant.queue.empty')}
            </p>
            {tab !== 'ALL' && (
              <p className='mt-1 text-xs text-muted-foreground'>
                {t('assistant.queue.miniStats', {
                  pending: stats?.pending ?? 0,
                  revised: stats?.revisedThisWeek ?? 0,
                  validated: stats?.validatedToday ?? 0,
                })}
              </p>
            )}
          </div>
        </div>
      ) : (
        <ValidationQueueTable
          items={items}
          readOnly={false}
          resolveDetailPath={resolveDetailPath}
        />
      )}

      <QueuePagination
        page={page}
        total={total}
        limit={20}
        onPageChange={setPage}
      />
    </div>
  )
}
