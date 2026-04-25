import { useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useValidationHistory } from '@/features/validation/hooks/useValidationHistory'
import { ValidationStatusBadge } from '@/features/validation/components/ValidationStatusBadge'
import { QueuePagination } from '@/features/validation/components/ValidationQueueTable'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import type { ValidationStatus } from '@/features/validation/types'

const TABS: { value: ValidationStatus | 'ALL'; labelKey: string }[] = [
  { value: 'ALL', labelKey: 'assistant.queue.tabs.all' },
  { value: 'VALIDATED', labelKey: 'assistant.status.validated' },
  { value: 'REJECTED', labelKey: 'assistant.status.rejected' },
  { value: 'REVISED', labelKey: 'assistant.status.revised' },
]

const STATUS_BORDER: Record<string, string> = {
  VALIDATED: 'border-l-emerald-500',
  REJECTED: 'border-l-rose-400',
  REVISED: 'border-l-sky-400',
  PENDING: 'border-l-amber-400',
}

export default function ValidationHistoryPage() {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const isAssistant = pathname.startsWith('/assistant')
  const isResearcher = pathname.startsWith('/researcher')
  const [tab, setTab] = useState<ValidationStatus | 'ALL'>('ALL')
  const [page, setPage] = useState(1)
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const filters = {
    ...(tab !== 'ALL' && { status: tab as ValidationStatus }),
    ...(from && { from }),
    ...(to && { to }),
    page,
    limit: 20,
  }

  const { data, isLoading } = useValidationHistory(filters)
  const { data: chartData } = useValidationHistory({ limit: 100 })

  const entries = data?.data ?? []
  const total = data?.total ?? 0

  const activityByDay = useMemo(() => {
    const all = chartData?.data ?? []
    const cutoff = Date.now() - 30 * 86_400_000
    const map: Record<string, number> = {}
    all.forEach((e) => {
      const d = new Date(e.createdAt)
      if (d.getTime() < cutoff) return
      const key = d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      })
      map[key] = (map[key] ?? 0) + 1
    })
    return Object.entries(map)
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .map(([date, count]) => ({ date, count }))
  }, [chartData])

  const statsByDecision = useMemo(() => {
    const all = chartData?.data ?? []
    return {
      validated: all.filter((e) => e.status === 'VALIDATED').length,
      rejected: all.filter((e) => e.status === 'REJECTED').length,
      revised: all.filter((e) => e.status === 'REVISED').length,
    }
  }, [chartData])

  const historyTitle = isAssistant
    ? t('assistant.historyPageTitle')
    : isResearcher
      ? t('researcher.reviews.historyTitle')
      : t('assistant.historyTitle')
  const historyLead = isAssistant
    ? t('assistant.historyOrgSubtitle', { count: total })
    : isResearcher
      ? t('researcher.reviews.historySubtitle', { count: total })
      : t('assistant.historySubtitle', { count: total })

  return (
    <div className='mx-auto flex w-full max-w-7xl flex-col gap-5 py-2'>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div>
        <h1 className='text-2xl font-semibold tracking-tight text-foreground'>
          {historyTitle}
        </h1>
        <p className='mt-1 text-sm text-muted-foreground'>{historyLead}</p>
      </div>

      {/* ── Decision stats row ─────────────────────────────────────────────── */}
      <div className='grid grid-cols-3 gap-3'>
        <div className='rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800/40 dark:bg-emerald-900/15'>
          <p className='text-3xl font-black tabular-nums leading-none text-emerald-700 dark:text-emerald-400'>
            {statsByDecision.validated}
          </p>
          <p className='mt-1.5 text-xs font-medium text-emerald-600/70 dark:text-emerald-500'>
            {t('assistant.status.validated')}
          </p>
        </div>
        <div className='rounded-xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-800/40 dark:bg-rose-900/15'>
          <p className='text-3xl font-black tabular-nums leading-none text-rose-700 dark:text-rose-400'>
            {statsByDecision.rejected}
          </p>
          <p className='mt-1.5 text-xs font-medium text-rose-600/70 dark:text-rose-500'>
            {t('assistant.status.rejected')}
          </p>
        </div>
        <div className='rounded-xl border border-sky-200 bg-sky-50 p-4 dark:border-sky-800/40 dark:bg-sky-900/15'>
          <p className='text-3xl font-black tabular-nums leading-none text-sky-700 dark:text-sky-400'>
            {statsByDecision.revised}
          </p>
          <p className='mt-1.5 text-xs font-medium text-sky-600/70 dark:text-sky-500'>
            {t('assistant.status.revised')}
          </p>
        </div>
      </div>

      {/* ── Activity chart ─────────────────────────────────────────────────── */}
      {activityByDay.length > 0 && (
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-semibold'>
              {t('assistant.history.activityChart')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='h-32'>
              <ResponsiveContainer width='100%' height='100%'>
                <BarChart
                  data={activityByDay}
                  margin={{ top: 4, right: 12, left: -16, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray='3 3'
                    className='stroke-muted'
                    vertical={false}
                  />
                  <XAxis
                    dataKey='date'
                    tick={{ fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10 }}
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      fontSize: 12,
                      borderRadius: '0.5rem',
                      border: '1px solid var(--border)',
                      background: 'var(--card)',
                      color: 'var(--foreground)',
                    }}
                  />
                  <Bar
                    dataKey='count'
                    name={t('assistant.historyTitle')}
                    fill='var(--chart-1)'
                    radius={[4, 4, 0, 0]}
                    isAnimationActive
                    animationDuration={600}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Filters row ────────────────────────────────────────────────────── */}
      <div className='flex flex-wrap items-end gap-4'>
        <Tabs
          value={tab}
          onValueChange={(v) => {
            setTab(v as ValidationStatus | 'ALL')
            setPage(1)
          }}
        >
          <TabsList>
            {TABS.map(({ value, labelKey }) => (
              <TabsTrigger key={value} value={value}>
                {t(labelKey)}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className='flex items-end gap-2'>
          <div className='flex flex-col gap-1'>
            <Label className='text-[11px] font-medium text-muted-foreground uppercase tracking-wider'>
              {t('assistant.history.dateFrom')}
            </Label>
            <Input
              type='date'
              value={from}
              onChange={(e) => {
                setFrom(e.target.value)
                setPage(1)
              }}
              className='h-9 w-36 text-xs'
            />
          </div>
          <div className='flex flex-col gap-1'>
            <Label className='text-[11px] font-medium text-muted-foreground uppercase tracking-wider'>
              {t('assistant.history.dateTo')}
            </Label>
            <Input
              type='date'
              value={to}
              onChange={(e) => {
                setTo(e.target.value)
                setPage(1)
              }}
              className='h-9 w-36 text-xs'
            />
          </div>
        </div>
      </div>

      {/* ── Table ──────────────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className='overflow-hidden rounded-xl border border-border bg-card shadow-sm'>
          <div className='divide-y divide-border'>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className='flex items-center gap-4 px-4 py-4'>
                <div className='flex flex-col gap-1.5'>
                  <div className='h-3.5 w-16 animate-pulse rounded bg-muted' />
                  <div className='h-3 w-10 animate-pulse rounded bg-muted/60' />
                </div>
                <div className='flex flex-1 flex-col gap-1.5 ml-2'>
                  <div className='h-4 w-2/5 animate-pulse rounded bg-muted' />
                </div>
                <div className='ml-auto h-5 w-20 animate-pulse rounded-full bg-muted' />
              </div>
            ))}
          </div>
        </div>
      ) : entries.length === 0 ? (
        <div className='flex items-center justify-center rounded-xl border border-dashed border-border bg-card/50 py-16'>
          <p className='text-sm text-muted-foreground'>
            {t('assistant.history.empty')}
          </p>
        </div>
      ) : (
        <div className='overflow-hidden rounded-xl border border-border bg-card shadow-sm'>
          <table className='w-full text-sm'>
            <thead>
              <tr className='border-b border-border bg-muted/30'>
                <th className='px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground'>
                  {t('assistant.history.columns.date')}
                </th>
                <th className='px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground'>
                  {t('assistant.history.columns.title')}
                </th>
                <th className='px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground hidden md:table-cell'>
                  {t('assistant.queue.columns.type')}
                </th>
                <th className='px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground'>
                  {t('assistant.history.columns.status')}
                </th>
                <th className='px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground hidden lg:table-cell'>
                  {t('assistant.history.columns.comments')}
                </th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => {
                const d = new Date(entry.createdAt)
                return (
                  <tr
                    key={entry.id}
                    className={cn(
                      'border-b border-border last:border-0 border-l-[3px]',
                      STATUS_BORDER[entry.status] ?? 'border-l-transparent',
                    )}
                  >
                    <td className='px-4 py-3.5 whitespace-nowrap'>
                      <p className='text-xs font-medium tabular-nums text-foreground'>
                        {d.toLocaleDateString(undefined, {
                          day: '2-digit',
                          month: 'short',
                        })}
                      </p>
                      <p className='text-[11px] text-muted-foreground tabular-nums'>
                        {d.getFullYear()}
                      </p>
                    </td>
                    <td className='px-4 py-3.5'>
                      <p className='font-medium text-foreground line-clamp-1 leading-snug'>
                        {entry.supervision?.title ?? '—'}
                      </p>
                    </td>
                    <td className='px-4 py-3.5 hidden md:table-cell'>
                      {entry.supervision?.type ? (
                        <span className='inline-flex items-center rounded-md border border-border bg-muted/60 px-2.5 py-0.5 text-xs font-medium text-muted-foreground'>
                          {entry.supervision.type}
                        </span>
                      ) : (
                        <span className='text-xs text-muted-foreground'>—</span>
                      )}
                    </td>
                    <td className='px-4 py-3.5'>
                      <ValidationStatusBadge status={entry.status} />
                    </td>
                    <td className='px-4 py-3.5 hidden lg:table-cell'>
                      <p className='line-clamp-1 text-xs text-muted-foreground max-w-56'>
                        {entry.comments ?? '—'}
                      </p>
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
