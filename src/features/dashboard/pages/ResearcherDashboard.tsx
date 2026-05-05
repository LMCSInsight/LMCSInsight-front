import { useMemo } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  BarChart3,
  Clock,
  GraduationCap,
  Hourglass,
  UserPlus,
  ClipboardCheck,
  History,
  List,
  MoreVertical,
  Pencil,
  Trash2,
  TrendingUp,
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
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import {
  useSupervisions,
  useDeleteSupervision,
} from '@/features/supervisions/hooks/useSupervisions'
import { useAuthContext } from '@/shared/context/AuthContext'
import {
  getResearcherSupervisionsPath,
  getResearcherSupervisionDetailPath,
  getSupervisionEditPath,
  getResearcherReviewsPath,
  getResearcherStudentsPath,
  getResearcherHistoryPath,
} from '@/config/routes'
import { useValidationStats } from '@/features/validation/hooks/useValidationStats'
import { useValidationHistory } from '@/features/validation/hooks/useValidationHistory'

// ─── Constants ────────────────────────────────────────────────────────────────

const CHART_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
]

const STATUS_BAR_COLOR: Record<string, string> = {
  IN_PROGRESS: 'bg-blue-500',
  DEFENDED: 'bg-green-500',
  ABANDONED: 'bg-red-400',
  EXTENSION: 'bg-orange-400',
  SUSPENDED: 'bg-gray-400',
}

const STATUS_ROW_BORDER: Record<string, string> = {
  IN_PROGRESS: 'border-l-blue-400',
  DEFENDED: 'border-l-green-500',
  ABANDONED: 'border-l-red-400',
  EXTENSION: 'border-l-orange-400',
  SUSPENDED: 'border-l-gray-400',
}

const VALIDATION_BADGE: Record<
  string,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  PENDING: 'outline',
  VALIDATED: 'default',
  REJECTED: 'destructive',
  REVISED: 'secondary',
}

// Note: textual labels (types/statuses) are resolved inside the component
// using `t()` so they follow the active language.

// ─── Featured KPI Card ────────────────────────────────────────────────────────

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
    <Card className='h-full cursor-pointer bg-primary text-primary-foreground shadow-primary transition-all hover:shadow-primary hover:-translate-y-0.5 border-0'>
      <CardHeader className='flex flex-row items-start justify-between pb-3'>
        <CardTitle className='text-sm font-medium text-primary-foreground/70'>
          {title}
        </CardTitle>
        <div className='flex size-8 items-center justify-center rounded-lg bg-primary-foreground/15'>
          <Icon className='size-4 text-primary-foreground' />
        </div>
      </CardHeader>
      <CardContent>
        <div className='text-4xl font-bold tabular text-primary-foreground'>
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

// ─── Secondary KPI Card ───────────────────────────────────────────────────────

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
          className={`flex size-7 items-center justify-center rounded-md ${
            accent ?? 'bg-primary/10'
          }`}
        >
          <Icon className='size-3.5 text-primary' />
        </div>
      </CardHeader>
      <CardContent>
        <div className='text-2xl font-bold tabular text-foreground'>
          {value}
        </div>
        {sub && <p className='mt-0.5 text-xs text-muted-foreground'>{sub}</p>}
      </CardContent>
    </Card>
  )
  return to ? <Link to={to}>{inner}</Link> : inner
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ResearcherDashboard() {
  const { userId } = useParams<{ userId: string }>()
  const navigate = useNavigate()
  const { currentUser } = useAuthContext()
  const { t, i18n } = useTranslation()

  // Localized label maps
  const TYPE_LABELS = useMemo(
    () => ({
      PFE: t('supervisions.type.PFE'),
      MASTER: t('supervisions.type.MASTER'),
      PHD: t('supervisions.type.PHD'),
      INTERNSHIP: t('supervisions.type.INTERNSHIP'),
      PROJECT: t('supervisions.type.PROJECT'),
    }),
    [t],
  )

  const STATUS_LABELS = useMemo(
    () => ({
      IN_PROGRESS: t('supervisions.status.IN_PROGRESS'),
      DEFENDED: t('supervisions.status.DEFENDED'),
      ABANDONED: t('supervisions.status.ABANDONED'),
      EXTENSION: t('supervisions.status.EXTENSION'),
      SUSPENDED: t('supervisions.status.SUSPENDED'),
    }),
    [t],
  )

  const VALIDATION_LABELS = useMemo(
    () => ({
      PENDING: t('supervisions.validation.PENDING'),
      VALIDATED: t('supervisions.validation.VALIDATED'),
      REJECTED: t('supervisions.validation.REJECTED'),
      REVISED: t('supervisions.validation.REVISED'),
    }),
    [t],
  )

  const { data: supPage, isLoading } = useSupervisions({ limit: 200 })
  const { data: reviewStats } = useValidationStats()
  const { data: decisionHistory } = useValidationHistory({ page: 1, limit: 5 })
  const { mutate: deleteSupervision } = useDeleteSupervision()

  const supervisions = supPage?.data ?? []

  // ── KPIs ──────────────────────────────────────────────────────────────────
  const total = supervisions.length
  const inProgress = supervisions.filter(
    (s) => s.status === 'IN_PROGRESS',
  ).length
  const defended = supervisions.filter((s) => s.status === 'DEFENDED').length
  const pending = supervisions.filter(
    (s) => s.validationStatus === 'PENDING',
  ).length
  const defenseRate = total > 0 ? Math.round((defended / total) * 100) : 0

  // ── Chart data ────────────────────────────────────────────────────────────
  const byType = useMemo(() => {
    const map: Record<string, number> = {}
    supervisions.forEach((s) => {
      map[s.type] = (map[s.type] ?? 0) + 1
    })
    return Object.entries(map).map(([k, v]) => ({
      name: TYPE_LABELS[k] ?? k,
      value: v,
      pct: total > 0 ? Math.round((v / total) * 100) : 0,
    }))
  }, [supervisions, total])

  const byYear = useMemo(() => {
    const map: Record<string, number> = {}
    supervisions.forEach((s) => {
      if (s.academicYear) map[s.academicYear] = (map[s.academicYear] ?? 0) + 1
    })
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([year, count]) => ({ year, count }))
  }, [supervisions])

  // ── Recent 5 ─────────────────────────────────────────────────────────────
  const recent = useMemo(
    () =>
      [...supervisions]
        .sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''))
        .slice(0, 5),
    [supervisions],
  )

  const basePath = userId ? getResearcherSupervisionsPath(userId) : '#'
  const reviewsPath = userId ? getResearcherReviewsPath(userId) : '#'
  const studPath = userId ? getResearcherStudentsPath(userId) : '#'
  const myReviewCount = reviewStats?.pending ?? pending
  const today = new Date().toLocaleDateString(i18n.language || undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const firstName = currentUser?.name?.split(' ')[0] ?? t('common.researcher')

  return (
    <div className='space-y-6'>
      {/* ── Welcome hero ─────────────────────────────────────────────────── */}
      <Card className='relative overflow-hidden border-0 bg-linear-to-br from-primary/15 via-primary/5 to-transparent'>
        {/* Watermark rate number */}
        {total > 0 && (
          <div
            className='absolute right-6 top-1/2 -translate-y-1/2 select-none text-[5rem] font-black tabular leading-none text-primary/6 pointer-events-none'
            aria-hidden
          >
            {defenseRate}%
          </div>
        )}
        <CardContent className='flex flex-wrap items-center justify-between gap-4 px-6 py-5'>
          <div className='space-y-1'>
            <div className='flex items-center gap-2'>
              <h2 className='text-lg font-semibold text-foreground'>
                {t('dashboard.greeting', { name: firstName })}
              </h2>
            </div>
            <p className='text-sm text-muted-foreground capitalize'>{today}</p>
          </div>
          <div className='flex flex-wrap gap-2'>
            <Link
              to={reviewsPath}
              className={cn(
                buttonVariants({ size: 'sm' }),
                'inline-flex items-center gap-2 whitespace-nowrap shadow-primary-sm',
              )}
            >
              <ClipboardCheck className='size-3.5 shrink-0' />
              <span>{t('dashboard.quickActions.myReviews')}</span>
              {myReviewCount > 0 && (
                <span className='rounded-full bg-primary-foreground/20 px-1.5 text-xs tabular-nums'>
                  {myReviewCount}
                </span>
              )}
            </Link>
            <Link
              to={studPath}
              className={cn(
                buttonVariants({ size: 'sm', variant: 'outline' }),
                'inline-flex items-center gap-2 whitespace-nowrap',
              )}
            >
              <UserPlus className='size-3.5 shrink-0' />
              <span>{t('dashboard.quickActions.registerStudent')}</span>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* ── KPI cards ────────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className='grid gap-4 lg:grid-cols-3'>
          <Card className='row-span-1'>
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
          {/* Featured */}
          <FeaturedKpiCard
            title={t('dashboard.kpi.total')}
            value={total}
            icon={BarChart3}
            to={basePath}
            sub={t('dashboard.kpi.totalSub')}
          />
          {/* 4 secondary in 2×2 */}
          <div className='grid grid-cols-2 gap-4 lg:col-span-2'>
            <KpiCard
              title={t('dashboard.kpi.inProgress')}
              value={inProgress}
              icon={Hourglass}
              to={basePath}
              accent='bg-blue-100 dark:bg-blue-900/30'
            />
            <KpiCard
              title={t('dashboard.kpi.defended')}
              value={defended}
              icon={GraduationCap}
              to={basePath}
              accent='bg-green-100 dark:bg-green-900/30'
            />
            <KpiCard
              title={t('dashboard.kpi.defenseRate')}
              value={`${defenseRate}%`}
              icon={TrendingUp}
              accent='bg-violet-100 dark:bg-violet-900/30'
              sub={t('dashboard.kpi.defenseRateSub', { defended, total })}
            />
            <KpiCard
              title={t('dashboard.kpi.pendingReviews')}
              value={myReviewCount}
              icon={Clock}
              to={reviewsPath}
              accent='bg-amber-100 dark:bg-amber-900/30'
              sub={t('dashboard.kpi.pendingReviewsSub')}
            />
          </div>
        </div>
      )}

      {/* ── Charts — asymmetric: pie 1 col, bar 2 cols ───────────────────── */}
      <div className='grid gap-4 lg:grid-cols-3'>
        <Card>
          <CardHeader>
            <CardTitle className='text-sm font-semibold'>
              {t('dashboard.charts.byType')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {byType.length === 0 ? (
              <div className='flex h-48 items-center justify-center text-sm text-muted-foreground'>
                {t('dashboard.charts.noData')}
              </div>
            ) : (
              <>
                <div className='h-48'>
                  <ResponsiveContainer width='100%' height='100%'>
                    <PieChart>
                      <Pie
                        data={byType}
                        dataKey='value'
                        nameKey='name'
                        cx='50%'
                        cy='50%'
                        outerRadius={70}
                        isAnimationActive
                        animationDuration={600}
                        label={({ name, percent }) =>
                          `${name} ${(Number(percent) * 100).toFixed(0)}%`
                        }
                        labelLine={false}
                      >
                        {byType.map((_, i) => (
                          <Cell
                            key={i}
                            fill={CHART_COLORS[i % CHART_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <ul className='mt-2 flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs text-muted-foreground'>
                  {byType.map((d, i) => (
                    <li key={d.name} className='flex items-center gap-1'>
                      <span
                        className='inline-block size-2 rounded-sm'
                        style={{
                          background: CHART_COLORS[i % CHART_COLORS.length],
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
              {t('dashboard.charts.byYear')}
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

      {/* ── Recent decisions (validation history) ─────────────────── */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between'>
          <CardTitle className='text-sm font-semibold flex items-center gap-2'>
            <History className='size-4 text-muted-foreground' />
            {t('dashboard.recentDecisions.title')}
          </CardTitle>
          {userId && (
            <Link
              to={getResearcherHistoryPath(userId)}
              className={cn(
                buttonVariants({ variant: 'ghost', size: 'sm' }),
                'text-xs',
              )}
            >
              {t('dashboard.recentDecisions.viewAll')}
            </Link>
          )}
        </CardHeader>
        <CardContent className='p-0'>
          {!(decisionHistory?.data && decisionHistory.data.length > 0) ? (
            <p className='px-6 py-8 text-center text-sm text-muted-foreground'>
              {t('dashboard.recentDecisions.empty')}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    {t('dashboard.recentDecisions.colTitle')}
                  </TableHead>
                  <TableHead>
                    {t('dashboard.recentDecisions.colDecision')}
                  </TableHead>
                  <TableHead className='hidden sm:table-cell'>
                    {t('dashboard.recentDecisions.colDate')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(decisionHistory?.data ?? []).map((entry) => (
                  <TableRow
                    key={entry.id}
                    className='cursor-pointer hover:bg-muted/50'
                    onClick={() => {
                      if (userId) {
                        navigate(
                          getResearcherSupervisionDetailPath(
                            userId,
                            entry.supervisionId,
                          ),
                        )
                      }
                    }}
                  >
                    <TableCell className='max-w-48 font-medium text-sm'>
                      {entry.supervision?.title ?? entry.supervisionId}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={VALIDATION_BADGE[entry.status] ?? 'outline'}
                        className='text-xs'
                      >
                        {VALIDATION_LABELS[entry.status] ?? entry.status}
                      </Badge>
                    </TableCell>
                    <TableCell className='hidden sm:table-cell text-xs text-muted-foreground'>
                      {new Date(entry.createdAt).toLocaleString(
                        i18n.language || undefined,
                        {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        },
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* ── Recent supervisions table ─────────────────────────────── */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between'>
          <CardTitle className='text-sm font-semibold'>
            {t('dashboard.recent.title')}
          </CardTitle>
          <Link
            to={basePath}
            className={cn(
              buttonVariants({ variant: 'ghost', size: 'sm' }),
              'gap-1 whitespace-nowrap text-xs inline-flex items-center',
            )}
          >
            <List className='size-3.5 shrink-0' />
            <span>{t('dashboard.recent.viewAll')}</span>
          </Link>
        </CardHeader>
        <CardContent className='p-0'>
          {recent.length === 0 ? (
            <div className='flex flex-col items-center gap-3 py-12 text-center'>
              <div className='flex size-12 items-center justify-center rounded-full bg-muted'>
                <BarChart3 className='size-6 text-muted-foreground' />
              </div>
              <p className='text-sm text-muted-foreground'>
                {t('dashboard.recent.noSupervisions')}
              </p>
              <Link
                to={reviewsPath}
                className={cn(
                  buttonVariants({ size: 'sm' }),
                  'whitespace-nowrap inline-flex items-center gap-2',
                )}
              >
                <ClipboardCheck className='size-4 shrink-0' />
                <span>{t('dashboard.quickActions.myReviews')}</span>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('dashboard.table.title')}</TableHead>
                  <TableHead>{t('dashboard.table.student')}</TableHead>
                  <TableHead>{t('dashboard.table.type')}</TableHead>
                  <TableHead>{t('dashboard.table.validation')}</TableHead>
                  <TableHead className='w-16 text-right'>
                    {t('dashboard.table.actions')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recent.map((row) => (
                  <TableRow
                    key={row.id}
                    className={cn(
                      'hover:bg-muted/50 transition-colors border-l-2',
                      STATUS_ROW_BORDER[row.status] ?? 'border-l-border',
                    )}
                  >
                    <TableCell className='max-w-48 truncate font-medium'>
                      {row.title}
                    </TableCell>
                    <TableCell className='text-muted-foreground text-sm'>
                      {row.student
                        ? `${row.student.lastName} ${row.student.firstName}`
                        : t('common.notAvailable')}
                    </TableCell>
                    <TableCell>
                      <span className='rounded-md bg-muted px-2 py-0.5 text-xs font-medium'>
                        {TYPE_LABELS[row.type] ?? row.type}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          VALIDATION_BADGE[row.validationStatus] ?? 'outline'
                        }
                      >
                        {VALIDATION_LABELS[row.validationStatus] ??
                          row.validationStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className='text-right'>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          className={cn(
                            buttonVariants({ variant: 'ghost', size: 'icon' }),
                            'size-8',
                          )}
                        >
                          <MoreVertical className='size-4' />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                          <DropdownMenuItem
                            onClick={() => {
                              if (userId) {
                                navigate(
                                  getResearcherSupervisionDetailPath(
                                    userId,
                                    row.id,
                                  ),
                                )
                              }
                            }}
                            className='inline-flex items-center gap-2 whitespace-nowrap'
                          >
                            <List className='size-4 shrink-0' />
                            <span>{t('common.view')}</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              if (userId) {
                                navigate(getSupervisionEditPath(userId, row.id))
                              }
                            }}
                            className='inline-flex items-center gap-2 whitespace-nowrap'
                          >
                            <Pencil className='size-4 shrink-0' />
                            <span>{t('common.edit')}</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className='inline-flex items-center gap-2 whitespace-nowrap text-destructive focus:text-destructive'
                            onClick={() => deleteSupervision(row.id)}
                          >
                            <Trash2 className='size-4 shrink-0' />
                            <span>{t('common.delete')}</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* ── Stacked status bar ───────────────────────────────────────── */}
      {supervisions.length > 0 && (
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-sm font-semibold'>
              {t('dashboard.statusBar.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-3'>
            <div className='flex h-3 w-full overflow-hidden rounded-full'>
              {Object.entries(STATUS_LABELS).map(([key]) => {
                const count = supervisions.filter(
                  (s) => s.status === key,
                ).length
                const pct = total > 0 ? (count / total) * 100 : 0
                if (pct === 0) return null
                return (
                  <div
                    key={key}
                    style={{ width: `${pct}%` }}
                    className={cn(
                      'h-full first:rounded-l-full last:rounded-r-full transition-all',
                      STATUS_BAR_COLOR[key],
                    )}
                    title={`${STATUS_LABELS[key]}: ${count}`}
                  />
                )
              })}
            </div>
            <div className='flex flex-wrap gap-x-4 gap-y-1.5'>
              {Object.entries(STATUS_LABELS).map(([key, label]) => {
                const count = supervisions.filter(
                  (s) => s.status === key,
                ).length
                if (count === 0) return null
                return (
                  <div
                    key={key}
                    className='flex items-center gap-1.5 text-xs text-muted-foreground'
                  >
                    <span
                      className={cn('size-2 rounded-sm', STATUS_BAR_COLOR[key])}
                    />
                    <span>{label}</span>
                    <span className='tabular font-medium text-foreground'>
                      {count}
                    </span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
