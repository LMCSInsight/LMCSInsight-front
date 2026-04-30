import { useMemo, useRef, useCallback, useState, type RefObject } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import {
  Download,
  FileSpreadsheet,
  FileText,
  BarChart3,
  Building2,
  Layers,
  TrendingUp,
  Activity,
} from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { AdminKpiTile, AdminEmptyStatePanel } from '@/features/admin/components'
import { downloadDomAsPng } from '@/lib/exportDomImage'
import { useSupervisions } from '@/features/supervisions/hooks/useSupervisions'
import type {
  Supervision,
  SupervisionType,
} from '@/features/supervisions/types'
import { useTeamsDirectory } from '@/features/direction/hooks/useTeamsDirectory'
import {
  studentDisplayName,
  supervisorsDisplayLine,
  themeDisplay,
  SUPERVISION_TYPE_LABEL_FR,
  supervisionStatusBadgeLabel,
} from '@/features/direction/lib/supervisionUi'
import { DIRECTOR_SUPERVISIONS_LIMIT } from '@/features/direction/lib/directorFetchLimits'
import {
  downloadDirectionAnalyticsExcel,
  downloadDirectionAnalyticsPdf,
  downloadDirectionPreviewExcel,
  downloadDirectionPreviewPdf,
} from '@/features/direction/lib/exportDirectionReports'

const REPORT_TYPE_VALUES = [
  'Tous',
  'PFE',
  'MASTER',
  'PHD',
  'INTERNSHIP',
  'PROJECT',
] as const

const REPORT_STATUT_VALUES = [
  'Tous',
  'IN_PROGRESS',
  'VALIDATION_PENDING',
  'DEFENDED',
] as const

const CHART_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
]

function parseDayBoundary(isoDate: string): number {
  return new Date(`${isoDate}T12:00:00`).getTime()
}

function supervisionInPreviewRange(
  s: Supervision,
  du: string,
  au: string,
): boolean {
  const day = s.startDate?.slice(0, 10)
  if (!day) return true
  const t = parseDayBoundary(day)
  return t >= parseDayBoundary(du) && t <= parseDayBoundary(au)
}

function selectFieldClassName(extra?: string) {
  return cn(
    'h-9 w-full max-w-full rounded-md border border-input bg-background px-2.5 text-sm transition-[box-shadow,transform]',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 active:scale-[0.99]',
    extra,
  )
}

const chartTooltip = {
  contentStyle: {
    fontSize: 12,
    borderRadius: 8,
    border: '1px solid hsl(var(--border))',
    background: 'hsl(var(--card))',
  },
}

/** Shared surfaces — tinted shadow on hover, no extra accent colors */
const reportSurfaceCard =
  'rounded-xl border border-border/60 bg-card shadow-none transition-[box-shadow] duration-200 hover:shadow-md dark:border-border/50'
const chartInset =
  'rounded-lg border border-border/55 bg-muted/10 p-3 sm:p-4 dark:bg-muted/5'

export default function DirectionReportsPage() {
  const { t } = useTranslation()
  const [du, setDu] = useState('2024-09-01')
  const [au, setAu] = useState('2025-08-31')
  const [enseignant, setEnseignant] = useState('Tous')
  const [type, setType] = useState<(typeof REPORT_TYPE_VALUES)[number]>('Tous')
  const [statut, setStatut] =
    useState<(typeof REPORT_STATUT_VALUES)[number]>('Tous')
  const [exportFormat, setExportFormat] = useState<'pdf' | 'excel'>('pdf')
  const [reportFormat, setReportFormat] = useState<'pdf' | 'excel'>('pdf')
  const [showPreview, setShowPreview] = useState(false)

  const thematicExportRef = useRef<HTMLDivElement>(null)
  const pieExportRef = useRef<HTMLDivElement>(null)
  const evolutionExportRef = useRef<HTMLDivElement>(null)
  const statusExportRef = useRef<HTMLDivElement>(null)

  const {
    data: supPage,
    isLoading: supLoading,
    isError: supError,
  } = useSupervisions({ page: 1, limit: DIRECTOR_SUPERVISIONS_LIMIT })
  const { data: teamsPage } = useTeamsDirectory({ page: 1, limit: 500 })

  const rows = supPage?.data ?? []
  const teamsCount = teamsPage?.data?.length ?? 0

  const teacherNames = useMemo(() => {
    const set = new Set<string>()
    rows.forEach((s) => {
      ;(s.supervisors ?? []).forEach((sup) => {
        const n = sup.supervisor?.nom_complet?.trim()
        if (n) set.add(n)
      })
    })
    return ['Tous', ...[...set].sort((a, b) => a.localeCompare(b, 'fr'))]
  }, [rows])

  const thematicBarsData = useMemo(() => {
    const m = new Map<string, number>()
    rows.forEach((s) => {
      const name = themeDisplay(s)
      m.set(name, (m.get(name) ?? 0) + 1)
    })
    return [...m.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([name, count]) => ({ name, count }))
  }, [rows])

  const evolutionByYear = useMemo(() => {
    const m = new Map<string, number>()
    rows.forEach((s) => {
      m.set(s.academicYear, (m.get(s.academicYear) ?? 0) + 1)
    })
    return [...m.entries()]
      .sort(([a], [b]) => a.localeCompare(b, 'fr'))
      .map(([year, total]) => ({ year, total }))
  }, [rows])

  const statusLabels = useMemo(
    () => ({
      inProgress: t('director.workload.statusInProgress'),
      pending: t('director.workload.statusPending'),
      done: t('director.workload.statusDone'),
      extended: t('director.reports.statusExtended'),
    }),
    [t],
  )

  const statusChartData = useMemo(() => {
    const inProgress = rows.filter((s) => s.status === 'IN_PROGRESS').length
    const pendingVal = rows.filter(
      (s) => s.validationStatus === 'PENDING',
    ).length
    const done = rows.filter((s) => s.status === 'DEFENDED').length
    const extended = rows.filter((s) => s.status === 'EXTENSION').length
    const breakdown = [
      { labelKey: 'inProgress' as const, count: inProgress },
      { labelKey: 'pending' as const, count: pendingVal },
      { labelKey: 'done' as const, count: done },
      { labelKey: 'extended' as const, count: extended },
    ]
    return breakdown.map((row, i) => ({
      name: statusLabels[row.labelKey],
      count: row.count,
      fill: CHART_COLORS[i % CHART_COLORS.length],
    }))
  }, [rows, statusLabels])

  const analyticsTotals = useMemo(() => {
    const totalSupervisions = rows.length
    const teamCount = teamsCount
    const avgPerTeam =
      teamCount > 0 ? Math.round(totalSupervisions / teamCount) : 0
    return { totalSupervisions, teamCount, avgPerTeam }
  }, [rows.length, teamsCount])

  const typePieData = useMemo(() => {
    const order: SupervisionType[] = [
      'PHD',
      'MASTER',
      'PFE',
      'INTERNSHIP',
      'PROJECT',
    ]
    return order.map((ty, i) => ({
      name:
        ty === 'PHD'
          ? t('director.dashboard.typePhd')
          : ty === 'MASTER'
            ? t('director.dashboard.typeMaster')
            : ty === 'INTERNSHIP'
              ? t('director.dashboard.typeInternship')
              : SUPERVISION_TYPE_LABEL_FR[ty],
      value: rows.filter((s) => s.type === ty).length,
      fill: CHART_COLORS[i % CHART_COLORS.length],
    }))
  }, [rows, t])

  const previewFiltered = useMemo(() => {
    let list = [...rows]
    list = list.filter((s) => supervisionInPreviewRange(s, du, au))
    if (enseignant !== 'Tous')
      list = list.filter((s) => supervisorsDisplayLine(s).includes(enseignant))
    if (type !== 'Tous') list = list.filter((s) => s.type === type)
    if (statut !== 'Tous') {
      if (statut === 'VALIDATION_PENDING')
        list = list.filter((s) => s.validationStatus === 'PENDING')
      else if (statut === 'IN_PROGRESS')
        list = list.filter((s) => s.status === 'IN_PROGRESS')
      else if (statut === 'DEFENDED')
        list = list.filter((s) => s.status === 'DEFENDED')
    }
    return list
  }, [rows, du, au, enseignant, type, statut])

  const previewRows = useMemo(() => {
    if (!showPreview) return []
    return previewFiltered.map((s) => ({
      etudiant: studentDisplayName(s),
      enseignant: supervisorsDisplayLine(s),
      type: SUPERVISION_TYPE_LABEL_FR[s.type],
      thematique: themeDisplay(s),
      annee: s.academicYear,
      statut: supervisionStatusBadgeLabel(s),
    }))
  }, [showPreview, previewFiltered])

  const exportChartPng = useCallback(
    (ref: RefObject<HTMLDivElement | null>, fileSlug: string) => {
      const run = async () => {
        const el = ref.current
        if (!el) throw new Error('no-ref')
        await downloadDomAsPng(el, `lmcs-${fileSlug}.png`)
      }
      void toast.promise(run(), {
        loading: t('director.reports.exportChartLoading'),
        success: t('director.reports.toastChartExportSuccess'),
        error: t('director.reports.toastChartExportError'),
      })
    },
    [t],
  )

  function handleQuickDownload() {
    void toast.promise(
      Promise.resolve().then(() => {
        if (exportFormat === 'excel') {
          downloadDirectionAnalyticsExcel({
            totals: analyticsTotals,
            thematicBarsData,
            evolutionByYear,
            typePieData,
            statusChartData,
          })
        } else {
          downloadDirectionAnalyticsPdf({
            title: t(
              'director.reports.analyticsExportTitle',
              'Rapport analytique — Direction',
            ),
            generatedLine: `${t(
              'director.reports.generatedOn',
              'Généré le',
            )} : ${new Date().toLocaleString('fr-FR')}`,
            totals: analyticsTotals,
            thematicBarsData,
            evolutionByYear,
            typePieData,
            statusChartData,
            evolutionSeriesName: t('director.dashboard.seriesSupervisions'),
          })
        }
      }),
      {
        loading: t('director.reports.exportRunning', 'Export en cours…'),
        success: t('director.reports.exportFileSuccess', 'Fichier téléchargé.'),
        error: t('director.reports.exportFileError', "L'export a échoué."),
      },
    )
  }

  function handleReportDownload() {
    if (!showPreview || previewFiltered.length === 0) {
      toast.error(t('director.reports.toastNoData'), {
        description: t('director.reports.toastNoDataHint'),
      })
      return
    }
    void toast.promise(
      Promise.resolve().then(() => {
        if (reportFormat === 'excel') {
          downloadDirectionPreviewExcel(previewFiltered)
        } else {
          downloadDirectionPreviewPdf(previewFiltered, [
            t('director.search.colTitle'),
            t('director.search.colStudent'),
            t('director.search.colType'),
            t('director.search.colSupervisors'),
            t('director.search.colTheme'),
            t('director.reports.tableYear'),
            t('director.search.colStatus'),
          ])
        }
      }),
      {
        loading: t('director.reports.exportRunning', 'Export en cours…'),
        success: t('director.reports.exportFileSuccess', 'Fichier téléchargé.'),
        error: t('director.reports.exportFileError', "L'export a échoué."),
      },
    )
  }

  if (supLoading) {
    return (
      <div className='mx-auto max-w-5xl space-y-8'>
        <div className='h-10 w-72 animate-pulse rounded-lg bg-muted' />
        <div className='h-32 animate-pulse rounded-2xl bg-muted' />
        <div className='grid gap-4 lg:grid-cols-2'>
          <div className='h-64 animate-pulse rounded-xl bg-muted' />
          <div className='h-64 animate-pulse rounded-xl bg-muted' />
        </div>
      </div>
    )
  }

  if (supError) {
    return (
      <AdminEmptyStatePanel
        title={t('director.reports.loadErrorTitle', 'Rapports indisponibles')}
        description={t(
          'director.reports.loadErrorHint',
          'Les encadrements n’ont pas pu être chargés pour construire les graphiques.',
        )}
        icon={BarChart3}
      />
    )
  }

  return (
    <div className='space-y-10'>
      <div>
        <h1 className='text-balance text-3xl font-semibold tracking-tight text-foreground'>
          {t('director.pageTitles.reports')}
        </h1>
        <p className='mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground'>
          {t('director.reports.pageSubtitle')}
        </p>
      </div>

      <section
        aria-labelledby='dir-analytics'
        className='space-y-6 rounded-2xl border border-border/50 bg-muted/15 p-5 pb-8 sm:p-7 dark:bg-muted/10'
      >
        <div className='space-y-2'>
          <h2
            id='dir-analytics'
            className='text-balance text-lg font-semibold tracking-tight text-foreground'
          >
            {t('director.reports.analyticsSection')}
          </h2>
          <p className='max-w-prose text-sm leading-relaxed text-muted-foreground sm:max-w-3xl'>
            {t('director.reports.analyticsIntro')}
          </p>
        </div>

        <div className='grid grid-cols-1 gap-5 sm:grid-cols-3'>
          <AdminKpiTile
            label={t('director.reports.kpiLabEncadrements')}
            value={analyticsTotals.totalSupervisions}
            helper={t('director.reports.kpiLabEncadrementsHelper')}
            icon={BarChart3}
          />
          <AdminKpiTile
            label={t('director.reports.kpiResearchTeams')}
            value={analyticsTotals.teamCount}
            helper={t('director.reports.kpiResearchTeamsHelper')}
            icon={Building2}
          />
          <AdminKpiTile
            label={t('director.reports.kpiAvgPerTeam')}
            value={analyticsTotals.avgPerTeam}
            helper={t('director.reports.kpiAvgPerTeamHelper')}
            icon={Layers}
          />
        </div>

        <div className='grid grid-cols-1 gap-5 lg:grid-cols-2'>
          <Card className={reportSurfaceCard}>
            <CardHeader className='flex flex-row items-start justify-between gap-2 pb-2 pt-5'>
              <div className='flex items-start gap-2'>
                <BarChart3
                  className='mt-0.5 size-5 shrink-0 text-muted-foreground'
                  aria-hidden
                />
                <div>
                  <CardTitle className='text-base font-semibold tracking-tight text-foreground'>
                    {t('director.reports.chartCardTitle')}
                  </CardTitle>
                  <p className='mt-0.5 text-sm leading-relaxed text-muted-foreground'>
                    {t('director.reports.thematicSubtitle')}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className='pb-4'>
              <div ref={thematicExportRef} className={chartInset}>
                <div className='h-[260px] w-full'>
                  <ResponsiveContainer width='100%' height='100%'>
                    <BarChart
                      layout='vertical'
                      data={thematicBarsData}
                      margin={{ top: 8, right: 24, left: 8, bottom: 8 }}
                    >
                      <CartesianGrid
                        strokeDasharray='3 3'
                        stroke='hsl(var(--border))'
                        horizontal
                        vertical={false}
                      />
                      <XAxis
                        type='number'
                        allowDecimals={false}
                        tick={{
                          fontSize: 11,
                          fill: 'hsl(var(--muted-foreground))',
                        }}
                        className='tabular-nums'
                      />
                      <YAxis
                        type='category'
                        dataKey='name'
                        width={200}
                        tick={{
                          fontSize: 11,
                          fill: 'hsl(var(--foreground))',
                        }}
                      />
                      <Tooltip {...chartTooltip} />
                      <Bar
                        dataKey='count'
                        fill='var(--chart-1)'
                        radius={[0, 6, 6, 0]}
                        maxBarSize={28}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className='mt-3 flex justify-end'>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  className='transition-[transform,box-shadow] duration-200 active:scale-[0.98]'
                  onClick={() => exportChartPng(thematicExportRef, 'equipes')}
                >
                  <Download className='mr-2 size-4' aria-hidden />
                  {t('director.reports.exportChart')}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className={reportSurfaceCard}>
            <CardHeader className='flex flex-row items-start gap-2 pb-2 pt-5'>
              <Layers
                className='mt-0.5 size-5 shrink-0 text-muted-foreground'
                aria-hidden
              />
              <div>
                <CardTitle className='text-base font-semibold tracking-tight text-foreground'>
                  {t('director.reports.chartTypeDistribution')}
                </CardTitle>
                <p className='mt-0.5 text-sm leading-relaxed text-muted-foreground'>
                  {t('director.reports.chartTypeDistributionSubtitle')}
                </p>
              </div>
            </CardHeader>
            <CardContent className='pb-4'>
              <div ref={pieExportRef} className={chartInset}>
                <div className='h-[280px] w-full'>
                  <ResponsiveContainer width='100%' height='100%'>
                    <PieChart>
                      <Pie
                        data={typePieData}
                        cx='50%'
                        cy='48%'
                        innerRadius={48}
                        outerRadius={82}
                        paddingAngle={2}
                        dataKey='value'
                        nameKey='name'
                      >
                        {typePieData.map((entry) => (
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
              </div>
              <div className='mt-3 flex justify-end'>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  className='transition-[transform,box-shadow] duration-200 active:scale-[0.98]'
                  onClick={() => exportChartPng(pieExportRef, 'types')}
                >
                  <Download className='mr-2 size-4' aria-hidden />
                  {t('director.reports.exportChart')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className='grid grid-cols-1 gap-5 xl:grid-cols-3'>
          <Card className={cn(reportSurfaceCard, 'xl:col-span-2')}>
            <CardHeader className='flex flex-row items-start gap-2 pb-2 pt-5'>
              <TrendingUp
                className='mt-0.5 size-5 shrink-0 text-muted-foreground'
                aria-hidden
              />
              <div>
                <CardTitle className='text-base font-semibold tracking-tight text-foreground'>
                  {t('director.reports.chartEvolutionTitle')}
                </CardTitle>
                <p className='mt-0.5 text-sm leading-relaxed text-muted-foreground'>
                  {t('director.reports.chartEvolutionSubtitle')}
                </p>
              </div>
            </CardHeader>
            <CardContent className='pb-4'>
              <div ref={evolutionExportRef} className={chartInset}>
                <div className='h-[280px] w-full'>
                  <ResponsiveContainer width='100%' height='100%'>
                    <LineChart
                      data={evolutionByYear}
                      margin={{ top: 12, right: 16, left: 0, bottom: 4 }}
                    >
                      <CartesianGrid
                        strokeDasharray='3 3'
                        stroke='hsl(var(--border))'
                      />
                      <XAxis
                        dataKey='year'
                        tick={{
                          fontSize: 11,
                          fill: 'hsl(var(--muted-foreground))',
                        }}
                      />
                      <YAxis
                        allowDecimals={false}
                        tick={{
                          fontSize: 11,
                          fill: 'hsl(var(--muted-foreground))',
                        }}
                      />
                      <Tooltip {...chartTooltip} />
                      <Line
                        type='monotone'
                        dataKey='total'
                        name={t('director.dashboard.seriesSupervisions')}
                        stroke='var(--chart-1)'
                        strokeWidth={2}
                        dot={{ r: 4, fill: 'var(--chart-1)' }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className='mt-3 flex justify-end'>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  className='transition-[transform,box-shadow] duration-200 active:scale-[0.98]'
                  onClick={() =>
                    exportChartPng(evolutionExportRef, 'evolution')
                  }
                >
                  <Download className='mr-2 size-4' aria-hidden />
                  {t('director.reports.exportChart')}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className={cn(reportSurfaceCard, 'xl:col-span-1')}>
            <CardHeader className='flex flex-row items-start gap-2 pb-2 pt-5'>
              <Activity
                className='mt-0.5 size-5 shrink-0 text-muted-foreground'
                aria-hidden
              />
              <div>
                <CardTitle className='text-base font-semibold tracking-tight text-foreground'>
                  {t('director.reports.chartStatusTitle')}
                </CardTitle>
                <p className='mt-0.5 text-sm leading-relaxed text-muted-foreground'>
                  {t('director.reports.chartStatusSubtitle')}
                </p>
              </div>
            </CardHeader>
            <CardContent className='pb-4'>
              <div ref={statusExportRef} className={chartInset}>
                <div className='h-[280px] w-full'>
                  <ResponsiveContainer width='100%' height='100%'>
                    <BarChart
                      data={statusChartData}
                      margin={{ top: 12, right: 12, left: 0, bottom: 32 }}
                    >
                      <CartesianGrid
                        strokeDasharray='3 3'
                        stroke='hsl(var(--border))'
                        vertical={false}
                      />
                      <XAxis
                        dataKey='name'
                        tick={{
                          fontSize: 10,
                          fill: 'hsl(var(--muted-foreground))',
                        }}
                        interval={0}
                        angle={-18}
                        textAnchor='end'
                        height={48}
                      />
                      <YAxis
                        allowDecimals={false}
                        tick={{
                          fontSize: 11,
                          fill: 'hsl(var(--muted-foreground))',
                        }}
                      />
                      <Tooltip {...chartTooltip} />
                      <Bar
                        dataKey='count'
                        radius={[6, 6, 0, 0]}
                        maxBarSize={44}
                      >
                        {statusChartData.map((entry) => (
                          <Cell key={entry.name} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className='mt-3 flex justify-end'>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  className='transition-[transform,box-shadow] duration-200 active:scale-[0.98]'
                  onClick={() => exportChartPng(statusExportRef, 'statuts')}
                >
                  <Download className='mr-2 size-4' aria-hidden />
                  {t('director.reports.exportChart')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section
        aria-labelledby='dir-exports'
        className='space-y-6 rounded-2xl border border-border/45 bg-card/35 p-5 pb-7 sm:p-7 dark:bg-card/20'
      >
        <div className='space-y-2'>
          <h2
            id='dir-exports'
            className='text-balance text-lg font-semibold tracking-tight text-foreground'
          >
            {t('director.reports.exportsSection')}
          </h2>
          <p className='max-w-prose text-sm leading-relaxed text-muted-foreground'>
            {t('director.reports.exportsIntro')}
          </p>
        </div>

        <div aria-labelledby='export-rapide'>
          <h3
            id='export-rapide'
            className='mb-3 text-base font-semibold tracking-tight text-foreground'
          >
            {t('director.reports.quickSection')}
          </h3>
          <Card
            className={cn(
              reportSurfaceCard,
              'border-primary/15 bg-muted/15 dark:bg-muted/10',
            )}
          >
            <CardContent className='flex flex-col gap-5 py-6 sm:flex-row sm:items-center sm:justify-between'>
              <p className='text-sm text-muted-foreground'>
                {t('director.reports.quickDesc')}
              </p>
              <div className='flex flex-wrap items-center gap-2'>
                <label className='sr-only' htmlFor='fmt-quick'>
                  {t('director.reports.labelFormat')}
                </label>
                <select
                  id='fmt-quick'
                  className={cn(selectFieldClassName(), 'w-32')}
                  value={exportFormat}
                  onChange={(e) =>
                    setExportFormat(e.target.value as 'pdf' | 'excel')
                  }
                >
                  <option value='pdf'>PDF</option>
                  <option value='excel'>Excel</option>
                </select>
                <Button
                  type='button'
                  className='transition-[transform,box-shadow] duration-200 active:scale-[0.98]'
                  onClick={handleQuickDownload}
                >
                  {exportFormat === 'pdf' ? (
                    <FileText className='mr-2 size-4' aria-hidden />
                  ) : (
                    <FileSpreadsheet className='mr-2 size-4' aria-hidden />
                  )}
                  {t('director.reports.download')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div aria-labelledby='rapport-perso'>
          <h3
            id='rapport-perso'
            className='mb-3 text-base font-semibold tracking-tight text-foreground'
          >
            {t('director.reports.customSection')}
          </h3>
          <Card className={reportSurfaceCard}>
            <CardContent className='space-y-5 py-6'>
              <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
                <div>
                  <Label htmlFor='du' className='text-xs text-muted-foreground'>
                    {t('director.reports.labelFrom')}
                  </Label>
                  <input
                    id='du'
                    type='date'
                    className={cn(selectFieldClassName(), 'mt-1')}
                    value={du}
                    onChange={(e) => setDu(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor='au' className='text-xs text-muted-foreground'>
                    {t('director.reports.labelTo')}
                  </Label>
                  <input
                    id='au'
                    type='date'
                    className={cn(selectFieldClassName(), 'mt-1')}
                    value={au}
                    onChange={(e) => setAu(e.target.value)}
                  />
                </div>
                <div>
                  <Label
                    htmlFor='ens'
                    className='text-xs text-muted-foreground'
                  >
                    {t('director.reports.labelTeacher')}
                  </Label>
                  <select
                    id='ens'
                    className={cn(selectFieldClassName(), 'mt-1')}
                    value={enseignant}
                    onChange={(e) => setEnseignant(e.target.value)}
                  >
                    {teacherNames.map((teacher) => (
                      <option key={teacher} value={teacher}>
                        {teacher}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label
                    htmlFor='typ'
                    className='text-xs text-muted-foreground'
                  >
                    {t('director.reports.labelType')}
                  </Label>
                  <select
                    id='typ'
                    className={cn(selectFieldClassName(), 'mt-1')}
                    value={type}
                    onChange={(e) =>
                      setType(
                        e.target.value as (typeof REPORT_TYPE_VALUES)[number],
                      )
                    }
                  >
                    {REPORT_TYPE_VALUES.map((typ) => (
                      <option key={typ} value={typ}>
                        {typ === 'Tous'
                          ? 'Tous'
                          : typ === 'PHD'
                            ? t('director.dashboard.typePhd')
                            : typ === 'MASTER'
                              ? t('director.dashboard.typeMaster')
                              : typ === 'INTERNSHIP'
                                ? t('director.dashboard.typeInternship')
                                : SUPERVISION_TYPE_LABEL_FR[typ]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
                <div className='lg:col-span-1'>
                  <Label htmlFor='st' className='text-xs text-muted-foreground'>
                    {t('director.reports.labelStatus')}
                  </Label>
                  <select
                    id='st'
                    className={cn(selectFieldClassName(), 'mt-1')}
                    value={statut}
                    onChange={(e) =>
                      setStatut(
                        e.target.value as (typeof REPORT_STATUT_VALUES)[number],
                      )
                    }
                  >
                    {REPORT_STATUT_VALUES.map((st) => (
                      <option key={st} value={st}>
                        {st === 'Tous'
                          ? 'Tous'
                          : st === 'IN_PROGRESS'
                            ? t('director.workload.statusInProgress')
                            : st === 'VALIDATION_PENDING'
                              ? t(
                                  'director.reports.validationPendingOption',
                                  'Validation en attente',
                                )
                              : st === 'DEFENDED'
                                ? t('director.workload.statusDone')
                                : st}
                      </option>
                    ))}
                  </select>
                </div>
                <div className='flex items-end lg:col-span-3'>
                  <Button
                    type='button'
                    variant='secondary'
                    className='transition-transform active:scale-[0.98]'
                    onClick={() => setShowPreview(true)}
                  >
                    {t('director.reports.generatePreview')}
                  </Button>
                </div>
              </div>

              {showPreview && (
                <div className='space-y-3 pt-2'>
                  <p className='text-sm font-medium text-foreground'>
                    {t('director.reports.previewHeading')}{' '}
                    {t('director.reports.previewLines', {
                      count: previewRows.length,
                    })}
                  </p>
                  <div className='overflow-x-auto rounded-xl border border-border/60 bg-muted/5'>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>
                            {t('director.reports.tableStudent')}
                          </TableHead>
                          <TableHead>
                            {t('director.reports.tableTeacher')}
                          </TableHead>
                          <TableHead>
                            {t('director.reports.tableType')}
                          </TableHead>
                          <TableHead>
                            {t('director.reports.tableTheme')}
                          </TableHead>
                          <TableHead>
                            {t('director.reports.tableYear')}
                          </TableHead>
                          <TableHead>
                            {t('director.reports.tableStatus')}
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {previewRows.length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={6}
                              className='py-10 text-center text-muted-foreground'
                            >
                              {t('director.reports.previewEmpty')}
                            </TableCell>
                          </TableRow>
                        ) : (
                          previewRows.map((r, i) => (
                            <TableRow
                              key={i}
                              className='transition-colors hover:bg-muted/40'
                            >
                              <TableCell className='font-medium'>
                                {r.etudiant}
                              </TableCell>
                              <TableCell>{r.enseignant}</TableCell>
                              <TableCell className='tabular-nums'>
                                {r.type}
                              </TableCell>
                              <TableCell className='max-w-[200px] text-sm'>
                                {r.thematique}
                              </TableCell>
                              <TableCell className='tabular-nums'>
                                {r.annee}
                              </TableCell>
                              <TableCell>{r.statut}</TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                  <div className='flex flex-wrap items-center gap-2'>
                    <label className='sr-only' htmlFor='fmt-report'>
                      {t('director.reports.labelExportFormat')}
                    </label>
                    <select
                      id='fmt-report'
                      className={cn(selectFieldClassName(), 'w-32')}
                      value={reportFormat}
                      onChange={(e) =>
                        setReportFormat(e.target.value as 'pdf' | 'excel')
                      }
                    >
                      <option value='pdf'>PDF</option>
                      <option value='excel'>Excel</option>
                    </select>
                    <Button
                      type='button'
                      className='transition-[transform,box-shadow] duration-200 active:scale-[0.98]'
                      onClick={handleReportDownload}
                    >
                      <Download className='mr-2 size-4' aria-hidden />
                      {t('director.reports.download')}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
