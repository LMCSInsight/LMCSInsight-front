import { useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  ClipboardCheck,
  CheckCircle,
  XCircle,
  RefreshCw,
  BarChart3,
  TrendingUp,
  ArrowRight,
  ListPlus,
} from 'lucide-react'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useValidationStats } from '@/features/validation/hooks/useValidationStats'
import { useValidationHistory } from '@/features/validation/hooks/useValidationHistory'
import { useValidationQueue } from '@/features/validation/hooks/useValidationQueue'
import { useSupervisions } from '@/features/supervisions/hooks/useSupervisions'
import { ValidationTimeline } from '@/features/validation/components/ValidationTimeline'
import {
  getAssistantSupervisionDetailPath,
  getAssistantSupervisionNewPath,
  ROUTES,
} from '@/config/routes'
import { useAuthContext } from '@/shared/context/AuthContext'
import { cn } from '@/lib/utils'

const CHART_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
]

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'var(--chart-4)',
  VALIDATED: 'var(--chart-2)',
  REJECTED: 'var(--chart-5)',
  REVISED: 'var(--chart-3)',
}

function AgeBadge({ dateStr }: { dateStr: string }) {
  const days = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / 86_400_000,
  )
  const label = days === 0 ? 'today' : `${days}d`
  if (days >= 7)
    return (
      <span className='inline-flex items-center rounded-md bg-rose-100 px-2 py-0.5 text-xs font-semibold tabular-nums text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'>
        {label}
      </span>
    )
  if (days >= 3)
    return (
      <span className='inline-flex items-center rounded-md bg-amber-100 px-2 py-0.5 text-xs font-semibold tabular-nums text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'>
        {label}
      </span>
    )
  return (
    <span className='inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium tabular-nums text-muted-foreground'>
      {label}
    </span>
  )
}

function rowBorderClass(dateStr: string): string {
  const days = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / 86_400_000,
  )
  if (days >= 7) return 'border-l-rose-400'
  if (days >= 3) return 'border-l-amber-400'
  return 'border-l-transparent'
}

function FeaturedKpiCard({
  to,
  title,
  value,
  sub,
  icon: Icon,
}: {
  to?: string
  title: string
  value: number | string
  sub?: string
  icon: React.ElementType
}) {
  const inner = (
    <Card className='h-full cursor-pointer border-0 bg-primary text-primary-foreground shadow-primary-sm transition-all hover:-translate-y-0.5'>
      <CardHeader className='flex flex-row items-start justify-between pb-3'>
        <CardTitle className='text-sm font-medium text-primary-foreground/70'>
          {title}
        </CardTitle>
        <div className='flex size-8 items-center justify-center rounded-lg bg-primary-foreground/15'>
          <Icon className='size-4 text-primary-foreground' />
        </div>
      </CardHeader>
      <CardContent>
        <div className='text-4xl font-bold tabular-nums text-primary-foreground'>
          {value}
        </div>
        {sub && (
          <p className='mt-1.5 text-xs text-primary-foreground/60'>{sub}</p>
        )}
      </CardContent>
    </Card>
  )
  return to ? (
    <Link to={to} className='block h-full'>
      {inner}
    </Link>
  ) : (
    inner
  )
}

function KpiCard({
  to,
  title,
  value,
  sub,
  icon: Icon,
  accent,
}: {
  to?: string
  title: string
  value: number | string
  sub?: string
  icon: React.ElementType
  accent?: string
}) {
  const inner = (
    <Card className='cursor-pointer transition-all hover:shadow-sm hover:-translate-y-0.5'>
      <CardHeader className='flex flex-row items-center justify-between pb-2'>
        <CardTitle className='text-xs font-medium text-muted-foreground'>
          {title}
        </CardTitle>
        <div
          className={cn(
            'flex size-7 items-center justify-center rounded-md',
            accent ?? 'bg-primary/10',
          )}
        >
          <Icon className='size-3.5 text-primary' />
        </div>
      </CardHeader>
      <CardContent>
        <div className='text-2xl font-bold tabular-nums text-foreground'>
          {value}
        </div>
        {sub && <p className='mt-0.5 text-xs text-muted-foreground'>{sub}</p>}
      </CardContent>
    </Card>
  )
  return to ? <Link to={to}>{inner}</Link> : inner
}

export default function AssistantDashboard() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { currentUser } = useAuthContext()

  const { data: stats, isLoading: statsLoading } = useValidationStats()
  const { data: historyData } = useValidationHistory({ limit: 8 })
  const { data: urgencyData } = useValidationQueue({
    status: 'PENDING',
    limit: 5,
  })
  const { data: supervisionsPage } = useSupervisions({ limit: 500 })

  const historyEntries = historyData?.data ?? []
  const urgencyItems = urgencyData?.data ?? []
  const allItems = supervisionsPage?.data ?? []

  const pending = stats?.pending ?? 0
  const validatedToday = stats?.validatedToday ?? 0
  const rejectedWeek = stats?.rejectedThisWeek ?? 0
  const revisedWeek = stats?.revisedThisWeek ?? 0
  const totalProcessed = validatedToday + rejectedWeek + revisedWeek

  const firstName = currentUser?.name?.split(' ')[0] ?? t('common.assistant')
  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const statusDistribution = useMemo(() => {
    const map: Record<string, number> = {}
    allItems.forEach((s) => {
      map[s.validationStatus] = (map[s.validationStatus] ?? 0) + 1
    })
    return Object.entries(map).map(([status, count]) => ({
      name: t(`assistant.status.${status.toLowerCase()}`),
      value: count,
      fill: STATUS_COLORS[status] ?? 'var(--chart-1)',
    }))
  }, [allItems, t])

  const byYear = useMemo(() => {
    const map: Record<string, number> = {}
    allItems.forEach((s) => {
      if (s.academicYear) map[s.academicYear] = (map[s.academicYear] ?? 0) + 1
    })
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([year, count]) => ({ year, count }))
  }, [allItems])

  return (
    <div className='mx-auto w-full max-w-7xl space-y-6'>
      {/* ── Welcome hero ────────────────────────────────────────────────── */}
      <Card className='relative overflow-hidden border-0 bg-linear-to-br from-primary/15 via-primary/5 to-transparent'>
        {pending > 0 && (
          <div
            className='absolute right-6 top-1/2 -translate-y-1/2 select-none text-[5rem] font-black tabular-nums leading-none text-primary/6 pointer-events-none'
            aria-hidden
          >
            {pending}
          </div>
        )}
        <CardContent className='flex flex-wrap items-center justify-between gap-4 px-6 py-5'>
          <div className='space-y-1'>
            <h2 className='text-lg font-semibold text-foreground'>
              {t('assistant.dashboard.welcomeTitle', { name: firstName })}
            </h2>
            <p className='text-sm text-muted-foreground capitalize'>{today}</p>
          </div>
          <div className='flex flex-wrap items-center gap-2'>
            <Link
              to={ROUTES.ASSISTANT_ACTIVITY}
              className={cn(
                buttonVariants({ size: 'sm' }),
                'gap-2 whitespace-nowrap shadow-primary-sm',
              )}
            >
              <ClipboardCheck className='size-3.5 shrink-0' strokeWidth={1.5} />
              {t('assistant.dashboard.goToQueue')}
            </Link>
            <Link
              to={getAssistantSupervisionNewPath()}
              className={cn(
                buttonVariants({ size: 'sm', variant: 'outline' }),
                'gap-2 whitespace-nowrap',
              )}
            >
              <ListPlus className='size-3.5 shrink-0' strokeWidth={1.5} />
              {t('assistant.supervisions.new')}
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* ── KPI grid ────────────────────────────────────────────────────── */}
      {statsLoading ? (
        <div className='grid gap-4 lg:grid-cols-3'>
          <Card>
            <CardContent className='py-8'>
              <div className='h-20 animate-pulse rounded-lg bg-muted' />
            </CardContent>
          </Card>
          <div className='grid grid-cols-2 gap-4 lg:col-span-2'>
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className='py-6'>
                  <div className='h-12 animate-pulse rounded-lg bg-muted' />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <div className='grid gap-4 lg:grid-cols-3'>
          <FeaturedKpiCard
            title={t('assistant.dashboard.kpi.pending')}
            value={pending}
            icon={ClipboardCheck}
            to={ROUTES.ASSISTANT_ACTIVITY}
            sub={t('assistant.dashboard.pendingCta')}
          />
          <div className='grid grid-cols-2 gap-4 lg:col-span-2'>
            <KpiCard
              title={t('assistant.dashboard.kpi.validatedToday')}
              value={validatedToday}
              icon={CheckCircle}
              accent='bg-green-100 dark:bg-green-900/30'
            />
            <KpiCard
              title={t('assistant.dashboard.kpi.rejectedWeek')}
              value={rejectedWeek}
              icon={XCircle}
              accent='bg-rose-100 dark:bg-rose-900/30'
            />
            <KpiCard
              title={t('assistant.dashboard.kpi.revisedWeek')}
              value={revisedWeek}
              icon={RefreshCw}
              accent='bg-sky-100 dark:bg-sky-900/30'
            />
            <KpiCard
              title={t('assistant.dashboard.kpi.totalProcessed')}
              value={totalProcessed}
              icon={TrendingUp}
              accent='bg-violet-100 dark:bg-violet-900/30'
            />
          </div>
        </div>
      )}

      {/* ── Charts ──────────────────────────────────────────────────────── */}
      <div className='grid gap-4 lg:grid-cols-3'>
        <Card>
          <CardHeader>
            <CardTitle className='text-sm font-semibold'>
              {t('assistant.dashboard.charts.byStatus')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statusDistribution.length === 0 ? (
              <div className='flex h-48 items-center justify-center text-sm text-muted-foreground'>
                {t('dashboard.charts.noData')}
              </div>
            ) : (
              <>
                <div className='h-48'>
                  <ResponsiveContainer width='100%' height='100%'>
                    <PieChart>
                      <Pie
                        data={statusDistribution}
                        dataKey='value'
                        nameKey='name'
                        cx='50%'
                        cy='50%'
                        outerRadius={70}
                        isAnimationActive
                        animationDuration={600}
                        label={({ name, value }) => `${name} ${value}`}
                        labelLine={false}
                      >
                        {statusDistribution.map((entry, i) => (
                          <Cell
                            key={i}
                            fill={
                              entry.fill ??
                              CHART_COLORS[i % CHART_COLORS.length]
                            }
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <ul className='mt-2 flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs text-muted-foreground'>
                  {statusDistribution.map((d, i) => (
                    <li key={d.name} className='flex items-center gap-1'>
                      <span
                        className='inline-block size-2 rounded-sm'
                        style={{
                          background:
                            d.fill ?? CHART_COLORS[i % CHART_COLORS.length],
                        }}
                      />
                      {d.name}: {d.value}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </CardContent>
        </Card>

        <Card className='lg:col-span-2'>
          <CardHeader>
            <CardTitle className='text-sm font-semibold'>
              {t('assistant.dashboard.charts.byYear')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {byYear.length === 0 ? (
              <div className='flex h-48 items-center justify-center text-sm text-muted-foreground'>
                {t('dashboard.charts.noData')}
              </div>
            ) : (
              <div className='h-48'>
                <ResponsiveContainer width='100%' height='100%'>
                  <BarChart
                    data={byYear}
                    margin={{ top: 4, right: 12, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray='3 3'
                      className='stroke-muted'
                    />
                    <XAxis dataKey='year' tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip />
                    <Bar
                      dataKey='count'
                      name={t('common.supervisions')}
                      fill='var(--chart-1)'
                      radius={[4, 4, 0, 0]}
                      isAnimationActive
                      animationDuration={600}
                      activeShape={{
                        fill: 'var(--chart-1)',
                        stroke: 'var(--chart-1)',
                        strokeWidth: 2,
                      }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Recent activity + type breakdown ────────────────────────────── */}
      <div className='grid gap-4 lg:grid-cols-3'>
        <Card className='lg:col-span-2'>
          <CardHeader className='flex flex-row items-center justify-between'>
            <CardTitle className='text-sm font-semibold'>
              {t('assistant.dashboard.recentActivityTitle')}
            </CardTitle>
            <Link
              to={ROUTES.ASSISTANT_HISTORY}
              className='flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors'
              aria-label={t('assistant.historyTitle')}
            >
              <ArrowRight className='size-3.5' strokeWidth={1.5} />
            </Link>
          </CardHeader>
          <CardContent>
            <ValidationTimeline entries={historyEntries} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='text-sm font-semibold'>
              {t('assistant.dashboard.typeBreakdownTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {Object.entries(stats?.byType ?? {}).length === 0 ? (
              <p className='text-sm text-muted-foreground'>
                {t('dashboard.charts.noData')}
              </p>
            ) : (
              <div className='flex flex-col gap-3'>
                {Object.entries(stats?.byType ?? {}).map(([type, count], i) => {
                  const maxCount = Math.max(
                    ...Object.values(stats?.byType ?? {}),
                    1,
                  )
                  return (
                    <div key={type} className='flex flex-col gap-1'>
                      <div className='flex justify-between text-xs text-muted-foreground'>
                        <span>{type}</span>
                        <span>{count}</span>
                      </div>
                      <div className='h-1.5 rounded-full bg-muted overflow-hidden'>
                        <div
                          className='h-full rounded-full transition-all'
                          style={{
                            width: `${(count / maxCount) * 100}%`,
                            background: CHART_COLORS[i % CHART_COLORS.length],
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Urgency queue ────────────────────────────────────────────────── */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between'>
          <CardTitle className='text-sm font-semibold'>
            {t('assistant.dashboard.urgencyTitle')}
          </CardTitle>
          <Link
            to={ROUTES.ASSISTANT_ACTIVITY}
            className='flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors'
            aria-label={t('assistant.dashboard.goToQueue')}
          >
            <ArrowRight className='size-3.5' strokeWidth={1.5} />
          </Link>
        </CardHeader>
        <CardContent className='p-0'>
          {urgencyItems.length === 0 ? (
            <div className='flex items-center justify-center py-8'>
              <p className='text-sm text-muted-foreground'>
                {t('assistant.queue.empty')}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('assistant.queue.columns.title')}</TableHead>
                  <TableHead className='hidden md:table-cell'>
                    {t('assistant.queue.columns.type')}
                  </TableHead>
                  <TableHead className='hidden lg:table-cell'>
                    {t('assistant.queue.columns.supervisor')}
                  </TableHead>
                  <TableHead className='text-right'>
                    {t('assistant.queue.columns.age')}
                  </TableHead>
                  <TableHead className='w-10' />
                </TableRow>
              </TableHeader>
              <TableBody>
                {urgencyItems.map((item) => {
                  const studentName = item.student
                    ? `${item.student.firstName} ${item.student.lastName}`
                    : '—'
                  const mainSupervisor =
                    item.supervisors?.find((s) => s.isMainSupervisor)
                      ?.supervisor?.nom_complet ??
                    item.supervisors?.[0]?.supervisor?.nom_complet

                  return (
                    <TableRow
                      key={item.id}
                      onClick={() =>
                        navigate(getAssistantSupervisionDetailPath(item.id))
                      }
                      className={cn(
                        'cursor-pointer hover:bg-muted/50 transition-colors border-l-[3px]',
                        rowBorderClass(item.createdAt),
                      )}
                    >
                      <TableCell>
                        <p className='font-medium text-foreground line-clamp-1 leading-snug'>
                          {item.title}
                        </p>
                        <p className='text-xs text-muted-foreground'>
                          {studentName}
                        </p>
                      </TableCell>
                      <TableCell className='hidden md:table-cell'>
                        <span className='inline-flex items-center rounded-md border border-border bg-muted/60 px-2.5 py-0.5 text-xs font-medium text-muted-foreground'>
                          {item.type}
                        </span>
                      </TableCell>
                      <TableCell className='hidden lg:table-cell'>
                        <p className='text-xs text-muted-foreground line-clamp-1 max-w-36'>
                          {mainSupervisor ?? '—'}
                        </p>
                      </TableCell>
                      <TableCell className='text-right'>
                        <AgeBadge dateStr={item.createdAt} />
                      </TableCell>
                      <TableCell>
                        <button
                          type='button'
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(getAssistantSupervisionDetailPath(item.id))
                          }}
                          className='flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors ml-auto'
                          aria-label={t('common.view')}
                        >
                          <ArrowRight className='size-3.5' strokeWidth={1.5} />
                        </button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* ── Stacked status bar ───────────────────────────────────────────── */}
      {allItems.length > 0 &&
        (() => {
          const STATUS_COLORS_BAR: Record<string, string> = {
            PENDING: 'bg-amber-400',
            VALIDATED: 'bg-emerald-500',
            REJECTED: 'bg-rose-400',
            REVISED: 'bg-sky-400',
          }
          const STATUS_LABELS: Record<string, string> = {
            PENDING: t('assistant.status.pending'),
            VALIDATED: t('assistant.status.validated'),
            REJECTED: t('assistant.status.rejected'),
            REVISED: t('assistant.status.revised'),
          }
          const total = allItems.length
          const countByStatus: Record<string, number> = {}
          allItems.forEach((s) => {
            countByStatus[s.validationStatus] =
              (countByStatus[s.validationStatus] ?? 0) + 1
          })

          return (
            <Card>
              <CardHeader className='pb-3'>
                <CardTitle className='text-sm font-semibold flex items-center gap-2'>
                  <BarChart3 className='size-4 shrink-0' strokeWidth={1.5} />
                  {t('dashboard.statusBar.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div className='flex h-3 w-full overflow-hidden rounded-full'>
                  {Object.entries(STATUS_COLORS_BAR).map(([key, cls]) => {
                    const count = countByStatus[key] ?? 0
                    const pct = total > 0 ? (count / total) * 100 : 0
                    if (pct === 0) return null
                    return (
                      <div
                        key={key}
                        style={{ width: `${pct}%` }}
                        className={cn(
                          'h-full first:rounded-l-full last:rounded-r-full transition-all',
                          cls,
                        )}
                        title={`${STATUS_LABELS[key]}: ${count}`}
                      />
                    )
                  })}
                </div>
                <div className='flex flex-wrap gap-x-4 gap-y-1.5'>
                  {Object.entries(STATUS_COLORS_BAR).map(([key, cls]) => {
                    const count = countByStatus[key] ?? 0
                    if (count === 0) return null
                    return (
                      <div
                        key={key}
                        className='flex items-center gap-1.5 text-xs text-muted-foreground'
                      >
                        <span className={cn('size-2 rounded-sm', cls)} />
                        <span>{STATUS_LABELS[key]}</span>
                        <span className='tabular-nums font-medium text-foreground'>
                          {count}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )
        })()}
    </div>
  )
}
