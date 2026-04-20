import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Search, ArrowRight, ListOrdered } from 'lucide-react'
import { useSupervisions } from '@/features/supervisions/hooks/useSupervisions'
import { QueuePagination } from '@/features/validation/components/ValidationQueueTable'
import { ValidationStatusBadge } from '@/features/validation/components/ValidationStatusBadge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { getAssistantValidationDetailPath } from '@/config/routes'
import { cn } from '@/lib/utils'
import type { ValidationStatus } from '@/features/validation/types'

const STATUS_TABS: { value: ValidationStatus | 'ALL'; labelKey: string }[] = [
  { value: 'ALL', labelKey: 'assistant.queue.tabs.all' },
  { value: 'PENDING', labelKey: 'assistant.status.pending' },
  { value: 'VALIDATED', labelKey: 'assistant.status.validated' },
  { value: 'REJECTED', labelKey: 'assistant.status.rejected' },
  { value: 'REVISED', labelKey: 'assistant.status.revised' },
]

const TYPE_OPTIONS = ['PFE', 'MASTER', 'PHD', 'INTERNSHIP', 'PROJECT']

const STATUS_BORDER: Record<string, string> = {
  PENDING: 'border-l-amber-400',
  VALIDATED: 'border-l-emerald-500',
  REJECTED: 'border-l-rose-400',
  REVISED: 'border-l-sky-400',
}

const STATUS_DOT: Record<string, string> = {
  PENDING: 'bg-amber-400',
  VALIDATED: 'bg-emerald-500',
  REJECTED: 'bg-rose-400',
  REVISED: 'bg-sky-400',
}

export default function AssistantSupervisionListPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [statusTab, setStatusTab] = useState<ValidationStatus | 'ALL'>('ALL')
  const [type, setType] = useState<string | undefined>(undefined)
  const [page, setPage] = useState(1)

  const { data, isLoading } = useSupervisions({
    search: search.trim() || undefined,
    validationStatus:
      statusTab !== 'ALL' ? (statusTab as ValidationStatus) : undefined,
    type: type as never,
    page,
    limit: 20,
  })
  const items = data?.data ?? []
  const total = data?.total ?? 0

  function handleTabChange(value: string) {
    setStatusTab(value as ValidationStatus | 'ALL')
    setPage(1)
  }

  function toggleType(value: string) {
    setType((prev) => (prev === value ? undefined : value))
    setPage(1)
  }

  return (
    <div className='flex flex-col gap-5 py-6 max-w-7xl'>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className='flex items-start justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-semibold tracking-tight text-foreground'>
            {t('common.supervisions')}
          </h1>
          <p className='mt-1 text-sm text-muted-foreground'>
            {t('assistant.supervisions.subtitle', { count: total })}
          </p>
        </div>
        {/* Status legend */}
        <div className='hidden sm:flex flex-wrap gap-x-4 gap-y-1.5 pt-1'>
          {(['PENDING', 'VALIDATED', 'REJECTED', 'REVISED'] as const).map(
            (s) => (
              <div
                key={s}
                className='flex items-center gap-1.5 text-xs text-muted-foreground'
              >
                <span className={cn('size-2 rounded-sm', STATUS_DOT[s])} />
                {t(`assistant.status.${s.toLowerCase()}`)}
              </div>
            ),
          )}
        </div>
      </div>

      {/* ── Status tabs ────────────────────────────────────────────────────── */}
      <Tabs value={statusTab} onValueChange={handleTabChange}>
        <TabsList>
          {STATUS_TABS.map(({ value, labelKey }) => (
            <TabsTrigger key={value} value={value}>
              {t(labelKey)}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* ── Search + type chips ────────────────────────────────────────────── */}
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
                <div className='size-7 animate-pulse rounded-md bg-muted' />
              </div>
            ))}
          </div>
        </div>
      ) : items.length === 0 ? (
        <div className='flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-card/50 py-20'>
          <div className='flex size-14 items-center justify-center rounded-full bg-muted'>
            <ListOrdered
              className='size-6 text-muted-foreground'
              strokeWidth={1.5}
            />
          </div>
          <div className='text-center'>
            <p className='text-sm font-medium text-foreground'>
              {t('assistant.queue.empty')}
            </p>
            <p className='mt-1 text-xs text-muted-foreground'>
              {t('assistant.supervisions.subtitle', { count: 0 })}
            </p>
          </div>
        </div>
      ) : (
        <div className='overflow-hidden rounded-xl border border-border bg-card shadow-sm'>
          <table className='w-full text-sm'>
            <thead>
              <tr className='border-b border-border bg-muted/30'>
                <th className='px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground'>
                  {t('assistant.queue.columns.title')}
                </th>
                <th className='px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground hidden md:table-cell'>
                  {t('assistant.queue.columns.type')}
                </th>
                <th className='px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground hidden lg:table-cell'>
                  {t('assistant.queue.columns.supervisor')}
                </th>
                <th className='px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground hidden lg:table-cell'>
                  {t('assistant.queue.columns.year')}
                </th>
                <th className='px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground'>
                  {t('assistant.queue.columns.status')}
                </th>
                <th className='w-12 px-3 py-3' />
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const studentName = item.student
                  ? `${item.student.firstName} ${item.student.lastName}`
                  : '—'
                const mainSupervisor =
                  item.supervisors?.find((s) => s.isMainSupervisor)?.supervisor
                    ?.nom_complet ??
                  item.supervisors?.[0]?.supervisor?.nom_complet
                const isPending =
                  item.validationStatus === 'PENDING' ||
                  item.validationStatus === 'REVISED'

                return (
                  <tr
                    key={item.id}
                    onClick={() => {
                      if (isPending)
                        navigate(getAssistantValidationDetailPath(item.id))
                    }}
                    className={cn(
                      'border-b border-border last:border-0 border-l-[3px] transition-colors',
                      STATUS_BORDER[item.validationStatus] ??
                        'border-l-transparent',
                      isPending && 'cursor-pointer hover:bg-muted/40',
                    )}
                  >
                    <td className='px-4 py-3.5'>
                      <p className='font-medium text-foreground line-clamp-1 leading-snug'>
                        {item.title}
                      </p>
                      <p className='mt-0.5 text-xs text-muted-foreground'>
                        {studentName}
                      </p>
                    </td>
                    <td className='px-4 py-3.5 hidden md:table-cell'>
                      <span className='inline-flex items-center rounded-md border border-border bg-muted/60 px-2.5 py-0.5 text-xs font-medium text-muted-foreground'>
                        {item.type}
                      </span>
                    </td>
                    <td className='px-4 py-3.5 hidden lg:table-cell'>
                      <p className='text-xs text-muted-foreground line-clamp-1 max-w-45'>
                        {mainSupervisor ?? '—'}
                      </p>
                    </td>
                    <td className='px-4 py-3.5 text-xs text-muted-foreground whitespace-nowrap hidden lg:table-cell'>
                      {item.academicYear}
                    </td>
                    <td className='px-4 py-3.5'>
                      <ValidationStatusBadge status={item.validationStatus} />
                    </td>
                    <td className='px-3 py-3.5'>
                      {isPending && (
                        <button
                          type='button'
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(getAssistantValidationDetailPath(item.id))
                          }}
                          className='flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors ml-auto'
                          aria-label={t('common.view')}
                        >
                          <ArrowRight className='size-3.5' strokeWidth={1.5} />
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
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
