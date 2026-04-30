import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  BarChart3,
  Users,
  GraduationCap,
  SlidersHorizontal,
  ArrowUpRight,
  ClipboardClock,
  TrendingUp,
  PieChart as PieChartIcon,
  ShieldCheck,
  Layers,
  Search,
  FileBarChart2,
} from 'lucide-react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { ROUTES } from '@/config/routes'
import { useSupervisions } from '@/features/supervisions/hooks/useSupervisions'
import type {
  Supervision,
  SupervisionStatus,
} from '@/features/supervisions/types'
import { DIRECTOR_SUPERVISIONS_LIMIT } from '@/features/direction/lib/directorFetchLimits'
import { AdminEmptyStatePanel } from '@/features/admin/components'
import {
  AdminInsightCard,
  AdminKpiTile,
  AdminSectionActionBar,
} from '@/features/admin/components'

const CHART_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
]

function countByKeys<T extends string>(keys: T[]): { key: T; count: number }[] {
  const m = new Map<T, number>()
  keys.forEach((k) => m.set(k, (m.get(k) ?? 0) + 1))
  return Array.from(m.entries()).map(([key, count]) => ({ key, count }))
}

function aggregateFromApi(rows: Supervision[], apiTotal: number) {
  const total = apiTotal
  const defended = rows.filter((s) => s.status === 'DEFENDED').length
  const defRate =
    rows.length > 0 ? Math.round((defended / rows.length) * 1000) / 10 : 0
  const pfeCount = rows.filter((s) => s.type === 'PFE').length
  const phdCount = rows.filter((s) => s.type === 'PHD').length
  const mastCount = rows.filter((s) => s.type === 'MASTER').length
  const stgCount = rows.filter((s) => s.type === 'INTERNSHIP').length

  const byYearMap: Record<string, number> = {}
  rows.forEach((s) => {
    byYearMap[s.academicYear] = (byYearMap[s.academicYear] ?? 0) + 1
  })
  const byYear = Object.entries(byYearMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([year, count]) => ({ year, count }))

  const themeMap: Record<string, number> = {}
  rows.forEach((s) => {
    const name = s.theme?.name?.trim() || 'Sans thème'
    themeMap[name] = (themeMap[name] ?? 0) + 1
  })
  const thematicData = Object.entries(themeMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)

  const activeIds = new Set<string>()
  rows.forEach((s) => {
    if (s.status !== 'IN_PROGRESS') return
    s.supervisors?.forEach((sup) => {
      if (sup.supervisorId) activeIds.add(sup.supervisorId)
    })
  })
  const activeResearchers = activeIds.size

  const pendingValidation = rows.filter(
    (s) => s.validationStatus === 'PENDING',
  ).length

  const statusSlices = countByKeys(
    rows.map((s) => s.status as SupervisionStatus),
  ).sort((a, b) => b.count - a.count)

  const validationSlices = countByKeys(
    rows.map((s) => s.validationStatus),
  ).sort((a, b) => b.count - a.count)

  return {
    total,
    defRate,
    pfeCount,
    phdCount,
    mastCount,
    stgCount,
    byYear,
    thematicData,
    activeResearchers,
    pendingValidation,
    sampleSize: rows.length,
    statusSlices,
    validationSlices,
  }
}

const chartTooltip = {
  contentStyle: {
    fontSize: 12,
    borderRadius: 8,
    border: '1px solid hsl(var(--border))',
    background: 'hsl(var(--card))',
  },
}

export default function DirectorDashboard() {
  const { t } = useTranslation()
  const {
    data: page,
    isLoading,
    isError,
  } = useSupervisions({
    page: 1,
    limit: DIRECTOR_SUPERVISIONS_LIMIT,
  })

  const rows = page?.data ?? []
  const apiTotal = page?.total ?? 0
  const live = !isError && page !== undefined

  const metrics = useMemo(() => {
    const totalBasis = apiTotal > 0 ? apiTotal : rows.length
    return aggregateFromApi(rows, totalBasis)
  }, [rows, apiTotal])

  const {
    total,
    defRate,
    pfeCount,
    phdCount,
    mastCount,
    stgCount,
    byYear,
    thematicData,
    activeResearchers,
    pendingValidation,
    sampleSize,
    statusSlices,
    validationSlices,
  } = metrics

  const supervisionPieData = useMemo(
    () =>
      statusSlices.map((s, i) => ({
        name: t(`director.dashboard.supervisionStatus.${s.key}`),
        value: s.count,
        fill: CHART_COLORS[i % CHART_COLORS.length],
      })),
    [statusSlices, t],
  )

  const validationPieData = useMemo(
    () =>
      validationSlices.map((s, i) => ({
        name: t(`director.dashboard.validationStatus.${s.key}`),
        value: s.count,
        fill: CHART_COLORS[(i + 2) % CHART_COLORS.length],
      })),
    [validationSlices, t],
  )

  const partialSample =
    live && apiTotal > 0 && sampleSize < apiTotal && sampleSize > 0

  if (!isLoading && isError) {
    return (
      <div className='mx-auto w-full max-w-3xl'>
        <AdminEmptyStatePanel
          title={t('director.dashboard.loadErrorTitle', 'Tableau indisponible')}
          description={t(
            'director.dashboard.loadErrorHint',
            'Les indicateurs ne peuvent pas être calculés tant que les encadrements ne sont pas chargés.',
          )}
          icon={BarChart3}
        />
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className='mx-auto w-full max-w-7xl space-y-6'>
        <Card className='overflow-hidden border-0'>
          <CardContent className='px-6 py-5'>
            <div className='h-7 max-w-xs animate-pulse rounded bg-muted' />
            <div className='mt-2 h-4 max-w-lg animate-pulse rounded bg-muted' />
          </CardContent>
        </Card>
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
        <div className='grid gap-4 lg:grid-cols-3'>
          <Card>
            <CardContent className='py-8'>
              <div className='h-48 animate-pulse rounded-lg bg-muted' />
            </CardContent>
          </Card>
          <Card className='lg:col-span-2'>
            <CardContent className='py-8'>
              <div className='h-48 animate-pulse rounded-lg bg-muted' />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const heroWatermark =
    live && pendingValidation > 0 ? pendingValidation : total > 0 ? total : null

  return (
    <div className='mx-auto w-full max-w-7xl space-y-6'>
      <Card className='relative overflow-hidden border-0 bg-linear-to-br from-primary/15 via-primary/5 to-transparent'>
        {heroWatermark !== null ? (
          <div
            className='pointer-events-none absolute right-6 top-1/2 -translate-y-1/2 select-none text-[5rem] font-black tabular-nums leading-none text-primary/6'
            aria-hidden
          >
            {heroWatermark}
          </div>
        ) : null}
        <CardContent className='relative flex flex-wrap items-center justify-between gap-4 px-6 py-5'>
          <div className='max-w-2xl space-y-2'>
            <div className='flex flex-wrap items-center gap-2'>
              <h1 className='text-xl font-semibold text-foreground'>
                {t('director.dashboard.pageHeading')}
              </h1>
              {live && partialSample ? (
                <Badge variant='outline' className='font-normal tabular-nums'>
                  {t('director.dashboard.partialSample', {
                    shown: sampleSize,
                    total: apiTotal,
                  })}
                </Badge>
              ) : null}
            </div>
            <p className='text-sm text-muted-foreground'>
              {t('director.dashboard.pageSubtitle')}
            </p>
            <p className='text-sm leading-relaxed text-muted-foreground'>
              {t('director.dashboard.intro')}{' '}
              <Link
                to={ROUTES.DIRECTOR_CHERCHEURS}
                className={cn(
                  buttonVariants({ variant: 'link', size: 'sm' }),
                  'h-auto p-0 align-baseline font-medium text-primary',
                )}
              >
                {t('director.dashboard.linkWorkload')}
              </Link>
            </p>
          </div>
          <div className='flex flex-wrap items-center gap-2'>
            <Link
              to={ROUTES.DIRECTOR_REPORTS}
              className={cn(
                buttonVariants({ size: 'sm' }),
                'gap-2 whitespace-nowrap shadow-primary-sm',
              )}
            >
              <FileBarChart2 className='size-3.5 shrink-0' strokeWidth={1.5} />
              {t('director.nav.reports')}
            </Link>
            <Link
              to={ROUTES.DIRECTOR_SEARCH}
              className={cn(
                buttonVariants({ size: 'sm', variant: 'outline' }),
                'gap-2 whitespace-nowrap',
              )}
            >
              <Search className='size-3.5 shrink-0' strokeWidth={1.5} />
              {t('director.nav.search')}
            </Link>
            <Link
              to={ROUTES.DIRECTOR_CHERCHEURS}
              className={cn(
                buttonVariants({ size: 'sm', variant: 'outline' }),
                'gap-2 whitespace-nowrap',
              )}
            >
              <Users className='size-3.5 shrink-0' strokeWidth={1.5} />
              {t('director.nav.workload')}
            </Link>
          </div>
        </CardContent>
      </Card>

      <AdminSectionActionBar
        title={t('director.dashboard.quickAccess')}
        actions={[
          {
            label: t('director.nav.workload'),
            to: ROUTES.DIRECTOR_CHERCHEURS,
          },
          {
            label: t('director.nav.search'),
            to: ROUTES.DIRECTOR_SEARCH,
          },
          {
            label: t('director.nav.reports'),
            to: ROUTES.DIRECTOR_REPORTS,
          },
        ]}
      />

      {live && pendingValidation > 0 ? (
        <Card className='border-border/70 shadow-none'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>
              {t('director.dashboard.attentionQueue')}
            </CardTitle>
            <ClipboardClock
              className='size-4 text-muted-foreground'
              strokeWidth={1.5}
            />
          </CardHeader>
          <CardContent className='flex flex-wrap items-center justify-between gap-3'>
            <p className='text-sm text-foreground'>
              {t('director.dashboard.pendingValidationLine', {
                count: pendingValidation,
              })}
            </p>
            <Link
              to={ROUTES.DIRECTOR_SEARCH}
              className={cn(
                buttonVariants({ variant: 'outline', size: 'sm' }),
                'gap-1 transition-[transform] duration-200 active:scale-[0.98]',
              )}
            >
              {t('director.dashboard.reviewSearch')}
              <ArrowUpRight className='size-3.5' />
            </Link>
          </CardContent>
        </Card>
      ) : null}

      <div className='grid gap-4 lg:grid-cols-3'>
        <Card className='h-full border-0 bg-primary text-primary-foreground shadow-primary-sm transition-all hover:-translate-y-0.5'>
          <CardHeader className='flex flex-row items-start justify-between pb-3'>
            <CardTitle className='text-sm font-medium text-primary-foreground/70'>
              {t('director.dashboard.kpiTotal')}
            </CardTitle>
            <div className='flex size-8 items-center justify-center rounded-lg bg-primary-foreground/15'>
              <BarChart3
                className='size-4 text-primary-foreground'
                strokeWidth={1.5}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className='text-4xl font-bold tabular-nums text-primary-foreground'>
              {total}
            </div>
            <p className='mt-1.5 text-xs text-primary-foreground/60'>
              {t('director.dashboard.kpiTotalHelper')}
            </p>
          </CardContent>
        </Card>
        <div className='grid grid-cols-2 gap-4 lg:col-span-2'>
          <AdminKpiTile
            label={t('director.dashboard.kpiActiveTeachers')}
            value={activeResearchers}
            helper={t('director.dashboard.kpiActiveTeachersHelper')}
            icon={Users}
          />
          <AdminKpiTile
            label={t('director.dashboard.kpiDefenseRate')}
            value={`${defRate}%`}
            helper={t('director.dashboard.kpiDefenseRateHelperLive')}
            icon={GraduationCap}
          />
          <Card className='border-border/70 shadow-none lg:col-span-2'>
            <CardHeader className='flex flex-row items-start justify-between space-y-0 pb-2'>
              <CardTitle className='text-xs font-medium uppercase tracking-wider text-muted-foreground'>
                {t('director.dashboard.kpiByType')}
              </CardTitle>
              <SlidersHorizontal
                className='size-4 text-muted-foreground'
                strokeWidth={1.5}
              />
            </CardHeader>
            <CardContent>
              <div className='flex flex-wrap items-end gap-4 sm:gap-6'>
                {[
                  { label: 'PFE', value: pfeCount },
                  { label: t('director.dashboard.typePhd'), value: phdCount },
                  {
                    label: t('director.dashboard.typeMaster'),
                    value: mastCount,
                  },
                  {
                    label: t('director.dashboard.typeInternship'),
                    value: stgCount,
                  },
                ].map((item) => (
                  <div key={item.label} className='min-w-0 text-center'>
                    <p className='tabular text-2xl font-semibold tracking-tight text-foreground'>
                      {item.value}
                    </p>
                    <p className='mt-0.5 text-[11px] text-muted-foreground'>
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
              <p className='mt-3 text-xs text-muted-foreground'>
                {t('director.dashboard.kpiByTypeHelper')}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className='grid gap-4 lg:grid-cols-3'>
        <Card className='border-border/70 shadow-none'>
          <CardHeader className='flex flex-row items-start gap-2 pb-2'>
            <PieChartIcon
              className='mt-0.5 size-4 shrink-0 text-muted-foreground'
              aria-hidden
            />
            <CardTitle className='text-sm font-semibold'>
              {t('director.dashboard.chartSupervisionStatus')}
            </CardTitle>
          </CardHeader>
          <CardContent className='pb-3'>
            <p className='mb-3 text-xs text-muted-foreground'>
              {t('director.dashboard.chartSupervisionStatusSubtitle')}
            </p>
            <div className='h-[220px] w-full sm:h-[240px]'>
              <ResponsiveContainer width='100%' height='100%'>
                <PieChart>
                  <Pie
                    data={supervisionPieData}
                    cx='50%'
                    cy='48%'
                    innerRadius={44}
                    outerRadius={76}
                    paddingAngle={2}
                    dataKey='value'
                    nameKey='name'
                  >
                    {supervisionPieData.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip {...chartTooltip} />
                  <Legend
                    wrapperStyle={{ fontSize: 11 }}
                    formatter={(value) => (
                      <span className='text-foreground'>{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className='border-border/70 shadow-none lg:col-span-2'>
          <CardHeader className='flex flex-row items-start gap-2 pb-2'>
            <TrendingUp
              className='mt-0.5 size-4 shrink-0 text-muted-foreground'
              aria-hidden
            />
            <div>
              <CardTitle className='text-sm font-semibold'>
                {t('director.dashboard.chartEvolution')}
              </CardTitle>
              <p className='text-xs text-muted-foreground'>
                {t('director.dashboard.chartEvolutionSubtitle')}
              </p>
            </div>
          </CardHeader>
          <CardContent className='pb-3'>
            <div className='h-[220px] w-full sm:h-[240px]'>
              <ResponsiveContainer width='100%' height='100%'>
                <LineChart
                  data={byYear}
                  margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray='3 3'
                    className='stroke-muted'
                  />
                  <XAxis
                    dataKey='year'
                    tick={{
                      fontSize: 11,
                      fill: 'hsl(var(--muted-foreground))',
                    }}
                  />
                  <YAxis
                    tick={{
                      fontSize: 11,
                      fill: 'hsl(var(--muted-foreground))',
                    }}
                    allowDecimals={false}
                  />
                  <Tooltip {...chartTooltip} />
                  <Line
                    type='monotone'
                    dataKey='count'
                    name={t('director.dashboard.seriesSupervisions')}
                    stroke={CHART_COLORS[0]}
                    strokeWidth={2}
                    dot={{ r: 3, fill: CHART_COLORS[0] }}
                    activeDot={{ r: 5 }}
                    animationDuration={400}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className='grid gap-4 lg:grid-cols-3'>
        <Card className='border-border/70 shadow-none lg:col-span-2'>
          <CardHeader className='flex flex-row items-start gap-2 pb-2'>
            <Layers
              className='mt-0.5 size-4 shrink-0 text-muted-foreground'
              aria-hidden
            />
            <div>
              <CardTitle className='text-sm font-semibold'>
                {t('director.dashboard.chartThematic')}
              </CardTitle>
              <p className='text-xs text-muted-foreground'>
                {t('director.dashboard.chartThematicSubtitle')}
              </p>
            </div>
          </CardHeader>
          <CardContent className='pb-3'>
            <div className='h-[220px] w-full sm:h-[260px]'>
              <ResponsiveContainer width='100%' height='100%'>
                <BarChart
                  layout='vertical'
                  data={thematicData}
                  margin={{ top: 4, right: 12, left: 4, bottom: 4 }}
                >
                  <CartesianGrid
                    strokeDasharray='3 3'
                    className='stroke-muted'
                    horizontal
                    vertical={false}
                  />
                  <XAxis
                    type='number'
                    allowDecimals={false}
                    tick={{
                      fontSize: 10,
                      fill: 'hsl(var(--muted-foreground))',
                    }}
                  />
                  <YAxis
                    type='category'
                    dataKey='name'
                    width={thematicData.length ? 140 : 118}
                    tick={{ fontSize: 10, fill: 'hsl(var(--foreground))' }}
                  />
                  <Tooltip {...chartTooltip} />
                  <Bar
                    dataKey='count'
                    fill={CHART_COLORS[1]}
                    radius={[0, 6, 6, 0]}
                    maxBarSize={22}
                    animationDuration={400}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className='border-border/70 shadow-none'>
          <CardHeader className='flex flex-row items-start gap-2 pb-2'>
            <ShieldCheck
              className='mt-0.5 size-4 shrink-0 text-muted-foreground'
              aria-hidden
            />
            <CardTitle className='text-sm font-semibold'>
              {t('director.dashboard.chartValidationPipeline')}
            </CardTitle>
          </CardHeader>
          <CardContent className='pb-3'>
            <p className='mb-3 text-xs text-muted-foreground'>
              {t('director.dashboard.chartValidationPipelineSubtitle')}
            </p>
            <div className='h-[220px] w-full sm:h-[260px]'>
              <ResponsiveContainer width='100%' height='100%'>
                <PieChart>
                  <Pie
                    data={validationPieData}
                    cx='50%'
                    cy='48%'
                    innerRadius={44}
                    outerRadius={76}
                    paddingAngle={2}
                    dataKey='value'
                    nameKey='name'
                  >
                    {validationPieData.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip {...chartTooltip} />
                  <Legend
                    wrapperStyle={{ fontSize: 11 }}
                    formatter={(value) => (
                      <span className='text-foreground'>{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <section className='grid gap-4 lg:grid-cols-3'>
        <AdminInsightCard
          title={t('director.dashboard.kpiActiveTeachers')}
          value={activeResearchers}
          subtitle={t('director.dashboard.kpiActiveTeachersHelper')}
          actionLabel={t('director.nav.workload')}
          actionTo={ROUTES.DIRECTOR_CHERCHEURS}
        />
        <AdminInsightCard
          title={t('director.dashboard.chartValidationPipeline')}
          value={pendingValidation}
          subtitle={t('director.dashboard.chartValidationPipelineSubtitle')}
          actionLabel={t('director.dashboard.reviewSearch')}
          actionTo={ROUTES.DIRECTOR_SEARCH}
        />
        <AdminInsightCard
          title={t('director.dashboard.kpiDefenseRate')}
          value={`${defRate}%`}
          subtitle={t('director.dashboard.linkReportsAnalytics')}
          actionLabel={t('director.nav.reports')}
          actionTo={ROUTES.DIRECTOR_REPORTS}
        />
      </section>
    </div>
  )
}
