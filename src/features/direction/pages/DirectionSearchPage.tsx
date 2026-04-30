import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Download,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { useChercheurs } from '@/features/chercheurs/hooks'
import { useSupervisions } from '@/features/supervisions/hooks/useSupervisions'
import { useThemes } from '@/features/themes/hooks'
import type { SupervisionType } from '@/features/supervisions/types'
import { QUALITE_LABELS } from '@/features/direction/chercheurModel'
import type { ChercheurRow } from '@/features/direction/chercheurModel'
import { buildChercheurWorkloadRows } from '@/features/direction/lib/workloadFromSupervisions'
import {
  DIRECTOR_CHERCHEURS_LIMIT,
  DIRECTOR_SUPERVISIONS_LIMIT,
} from '@/features/direction/lib/directorFetchLimits'
import { useTeamsDirectory } from '@/features/direction/hooks/useTeamsDirectory'
import {
  SUPERVISION_TYPE_LABEL_FR,
  toSearchSupervisionRow,
  matchesSupervisionStatusFilter,
  SEARCH_STATUS_FILTER_KEYS,
  SEARCH_STATUS_FILTER_LABELS,
  searchRowBadgeLabel,
  type SearchSupervisionRow,
} from '@/features/direction/lib/supervisionUi'
import { AdminEmptyStatePanel } from '@/features/admin/components'
import { truncateWithEllipsis } from '@/lib/truncateText'
import { buildCsv } from '@/lib/csvExport'
import { downloadBlob } from '@/lib/downloadBlob'

const searchSurfaceCard =
  'rounded-xl border border-border/60 bg-card shadow-none transition-[box-shadow] duration-200 hover:shadow-md dark:border-border/50'

const SEARCH_SUP_TYPES: SupervisionType[] = [
  'PFE',
  'MASTER',
  'PHD',
  'INTERNSHIP',
  'PROJECT',
]

/** Max characters shown in the sujet / titre column; full title stays in the tooltip. */
const SUPERVISION_TITLE_TABLE_MAX = 64

function chercheurWorkload(r: ChercheurRow): number {
  return r.pfe + r.master + r.doctorat + r.stage
}

type SortKey = 'title' | 'student' | 'type' | 'status' | 'year'
type SortDir = 'asc' | 'desc'

export default function DirectionSearchPage() {
  const { t } = useTranslation()
  const [q, setQ] = useState('')
  const [teachers, setTeachers] = useState<string[]>([])
  const [years, setYears] = useState<string[]>([])
  const [types, setTypes] = useState<string[]>([])
  const [themes, setThemes] = useState<string[]>([])
  const [statuses, setStatuses] = useState<string[]>([])
  const [includeExt, setIncludeExt] = useState(true)
  const [page, setPage] = useState(1)
  const perPage = 8
  const [sortKey, setSortKey] = useState<SortKey>('title')
  const [sortDir, setSortDir] = useState<SortDir>('asc')

  const [qResearcher, setQResearcher] = useState('')
  const [qTheme, setQTheme] = useState('')
  const [qTeam, setQTeam] = useState('')
  const [searchTab, setSearchTab] = useState('supervisions')

  const {
    data: supPage,
    isLoading: supervisionsLoading,
    isError: supervisionsError,
  } = useSupervisions({ page: 1, limit: DIRECTOR_SUPERVISIONS_LIMIT })
  const {
    data: chercheursPage,
    isLoading: chercheursLoading,
    isError: chercheursError,
  } = useChercheurs({ page: 1, limit: DIRECTOR_CHERCHEURS_LIMIT })
  const { data: themesPage } = useThemes({ page: 1, limit: 500 })
  const { data: teamsPage } = useTeamsDirectory({ page: 1, limit: 500 })

  const supervisions = supPage?.data ?? []
  const chercheurs = chercheursPage?.data ?? []

  const supervisionRows = useMemo(
    () => supervisions.map(toSearchSupervisionRow),
    [supervisions],
  )
  const researcherRows = useMemo(
    () => buildChercheurWorkloadRows(chercheurs, supervisions),
    [chercheurs, supervisions],
  )

  const supervisorNames = useMemo(() => {
    const set = new Set<string>()
    supervisions.forEach((s) => {
      ;(s.supervisors ?? []).forEach((sup) => {
        const n = sup.supervisor?.nom_complet?.trim()
        if (n) set.add(n)
      })
    })
    return [...set].sort((a, b) => a.localeCompare(b, 'fr'))
  }, [supervisions])

  const academicYearOptions = useMemo(
    () =>
      [...new Set(supervisions.map((s) => s.academicYear))].sort((a, b) =>
        a.localeCompare(b, 'fr'),
      ),
    [supervisions],
  )

  const themeNameOptions = useMemo(
    () =>
      [...new Set(supervisionRows.map((r) => r.theme))].sort((a, b) =>
        a.localeCompare(b, 'fr'),
      ),
    [supervisionRows],
  )

  const themeCatalog = useMemo(() => {
    const themesData = themesPage?.data ?? []
    return themesData.map((th) => {
      const mine = supervisions.filter(
        (s) => s.themeId === th.id || s.theme?.id === th.id,
      )
      const kw = new Set<string>()
      mine.forEach((s) => (s.keywords ?? []).forEach((k) => kw.add(k)))
      return {
        id: th.id,
        label: th.name,
        keywords: kw.size,
        encadrements: mine.length,
      }
    })
  }, [themesPage, supervisions])

  const teamOverview = useMemo(() => {
    const teamsData = teamsPage?.data ?? []
    return teamsData.map((team) => ({
      id: team.id,
      name: team.name,
      members: team.members?.length ?? team._count?.members ?? 0,
      supervisions: supervisions.filter((s) =>
        (s.supervisors ?? []).some((sup) =>
          (sup.supervisor?.teams ?? []).some((tm) => tm.id === team.id),
        ),
      ).length,
    }))
  }, [teamsPage, supervisions])

  const filtered = useMemo(() => {
    let list: SearchSupervisionRow[] = [...supervisionRows]
    const qq = q.trim().toLowerCase()
    if (qq) {
      list = list.filter(
        (r) =>
          r.title.toLowerCase().includes(qq) ||
          r.student.toLowerCase().includes(qq) ||
          r.supervisors.toLowerCase().includes(qq),
      )
    }
    if (teachers.length)
      list = list.filter((r) =>
        teachers.some((name) => r.supervisors.includes(name)),
      )
    if (years.length) list = list.filter((r) => years.includes(r.academicYear))
    if (types.length)
      list = list.filter((r) => types.includes(r.type as SupervisionType))
    if (themes.length) list = list.filter((r) => themes.includes(r.theme))
    if (statuses.length)
      list = list.filter((r) => matchesSupervisionStatusFilter(r, statuses))
    if (!includeExt) list = list.filter((r) => !r.hasExternalSupervisor)
    return list
  }, [supervisionRows, q, teachers, years, types, themes, statuses, includeExt])

  const sorted = useMemo(() => {
    const out = [...filtered]
    out.sort((a, b) => {
      const pick = (row: SearchSupervisionRow) => {
        if (sortKey === 'year') return row.academicYear
        if (sortKey === 'status') return searchRowBadgeLabel(row)
        if (sortKey === 'type') return SUPERVISION_TYPE_LABEL_FR[row.type]
        return String(row[sortKey] ?? '')
      }
      const av = pick(a)
      const bv = pick(b)
      const c = String(av).localeCompare(String(bv), 'fr')
      return sortDir === 'asc' ? c : -c
    })
    return out
  }, [filtered, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(sorted.length / perPage))
  const currentPage = Math.min(page, totalPages)
  const pageRows = useMemo(() => {
    const start = (currentPage - 1) * perPage
    return sorted.slice(start, start + perPage)
  }, [sorted, currentPage, perPage])

  const filteredResearchers = useMemo(() => {
    const qq = qResearcher.trim().toLowerCase()
    if (!qq) return researcherRows
    return researcherRows.filter(
      (r) =>
        r.nom_complet.toLowerCase().includes(qq) ||
        r.chercheur_id.toLowerCase().includes(qq) ||
        r.equipe.toLowerCase().includes(qq),
    )
  }, [qResearcher, researcherRows])

  const filteredThemes = useMemo(() => {
    const qq = qTheme.trim().toLowerCase()
    if (!qq) return themeCatalog
    return themeCatalog.filter((row) => row.label.toLowerCase().includes(qq))
  }, [qTheme, themeCatalog])

  const filteredTeams = useMemo(() => {
    const qq = qTeam.trim().toLowerCase()
    if (!qq) return teamOverview
    return teamOverview.filter((row) => row.name.toLowerCase().includes(qq))
  }, [qTeam, teamOverview])

  function toggle<T extends string>(arr: T[], v: T, set: (n: T[]) => void) {
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v])
    setPage(1)
  }

  function headerSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const coreLoading = supervisionsLoading || chercheursLoading
  const coreError = supervisionsError || chercheursError

  if (coreLoading) {
    return (
      <div className='mx-auto max-w-4xl space-y-6'>
        <div className='h-9 w-56 animate-pulse rounded bg-muted' />
        <div className='h-4 max-w-xl animate-pulse rounded bg-muted' />
        <div className='h-48 animate-pulse rounded-xl bg-muted' />
      </div>
    )
  }

  if (coreError) {
    return (
      <AdminEmptyStatePanel
        title={t('director.search.loadErrorTitle', 'Recherche indisponible')}
        description={t(
          'director.search.loadErrorHint',
          'Les données nécessaires (encadrements, chercheurs) n’ont pas pu être chargées.',
        )}
        icon={Search}
      />
    )
  }

  return (
    <div className='space-y-8'>
      <div>
        <h1 className='text-balance text-3xl font-semibold tracking-tight text-foreground'>
          {t('director.pageTitles.search')}
        </h1>
        <p className='mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground'>
          {t('director.search.pageSubtitle')}
        </p>
      </div>

      <Tabs
        value={searchTab}
        onValueChange={setSearchTab}
        className='w-full space-y-6'
      >
        <TabsList className='grid h-auto w-full max-w-4xl grid-cols-2 gap-1 rounded-xl border border-border/40 bg-muted/35 p-1 sm:grid-cols-4'>
          <TabsTrigger
            value='supervisions'
            className='rounded-lg text-xs outline-none transition-all duration-200 focus-visible:ring-2 focus-visible:ring-ring/55 data-[state=active]:bg-card data-[state=active]:shadow-sm sm:text-sm'
          >
            {t('director.search.tabSupervisions')}
          </TabsTrigger>
          <TabsTrigger
            value='researchers'
            className='rounded-lg text-xs outline-none transition-all duration-200 focus-visible:ring-2 focus-visible:ring-ring/55 data-[state=active]:bg-card data-[state=active]:shadow-sm sm:text-sm'
          >
            {t('director.search.tabResearchers')}
          </TabsTrigger>
          <TabsTrigger
            value='themes'
            className='rounded-lg text-xs outline-none transition-all duration-200 focus-visible:ring-2 focus-visible:ring-ring/55 data-[state=active]:bg-card data-[state=active]:shadow-sm sm:text-sm'
          >
            {t('director.search.tabThemes')}
          </TabsTrigger>
          <TabsTrigger
            value='teams'
            className='rounded-lg text-xs outline-none transition-all duration-200 focus-visible:ring-2 focus-visible:ring-ring/55 data-[state=active]:bg-card data-[state=active]:shadow-sm sm:text-sm'
          >
            {t('director.search.tabTeams')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value='supervisions' className='space-y-7'>
          <div className='max-w-prose space-y-3'>
            <p className='text-pretty text-sm leading-relaxed text-muted-foreground'>
              {t('director.search.tabSupervisionsHint')}
            </p>
            <p className='text-pretty text-sm leading-relaxed text-muted-foreground'>
              {t('director.search.intro')}
            </p>
          </div>

          <Card className={cn(searchSurfaceCard, 'bg-card/90')}>
            <CardHeader className='pb-3 pt-5'>
              <CardTitle className='text-base font-semibold tracking-tight text-foreground'>
                {t('director.search.filtersTitle')}
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-5'>
              <div className='relative max-w-xl'>
                <Search
                  className='absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground'
                  aria-hidden
                />
                <Input
                  className='h-10 pl-9 font-medium tabular-nums transition-shadow focus-visible:ring-2 focus-visible:ring-ring/50'
                  placeholder={t('director.search.queryPlaceholder')}
                  value={q}
                  onChange={(e) => {
                    setQ(e.target.value)
                    setPage(1)
                  }}
                  aria-label={t('common.search')}
                />
              </div>

              <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
                <FilterGroup label={t('director.search.filterTeacher')}>
                  {supervisorNames.length === 0 ? (
                    <p className='text-xs text-muted-foreground'>
                      {t(
                        'director.search.emptySupervisorsFilter',
                        'Aucun encadrant dans les données chargées.',
                      )}
                    </p>
                  ) : (
                    supervisorNames.map((n) => (
                      <label
                        key={n}
                        className='flex cursor-pointer items-center gap-2 text-sm'
                      >
                        <input
                          type='checkbox'
                          checked={teachers.includes(n)}
                          onChange={() => toggle(teachers, n, setTeachers)}
                          className='size-3.5 rounded border-input accent-primary'
                        />
                        {n}
                      </label>
                    ))
                  )}
                </FilterGroup>
                <FilterGroup label={t('director.search.filterYear')}>
                  {academicYearOptions.length === 0 ? (
                    <p className='text-xs text-muted-foreground'>
                      {t(
                        'director.search.emptyYearsFilter',
                        'Aucune année universitaire.',
                      )}
                    </p>
                  ) : (
                    academicYearOptions.map((y) => (
                      <label
                        key={y}
                        className='flex cursor-pointer items-center gap-2 text-sm tabular-nums'
                      >
                        <input
                          type='checkbox'
                          checked={years.includes(y)}
                          onChange={() => toggle(years, y, setYears)}
                          className='size-3.5 rounded border-input accent-primary'
                        />
                        {y}
                      </label>
                    ))
                  )}
                </FilterGroup>
                <FilterGroup label={t('director.search.filterType')}>
                  {SEARCH_SUP_TYPES.map((ty) => (
                    <label
                      key={ty}
                      className='flex cursor-pointer items-center gap-2 text-sm'
                    >
                      <input
                        type='checkbox'
                        checked={types.includes(ty)}
                        onChange={() => toggle(types, ty, setTypes)}
                        className='size-3.5 rounded border-input accent-primary'
                      />
                      {SUPERVISION_TYPE_LABEL_FR[ty]}
                    </label>
                  ))}
                </FilterGroup>
                <FilterGroup label={t('director.search.filterTheme')}>
                  {themeNameOptions.length === 0 ? (
                    <p className='text-xs text-muted-foreground'>
                      {t(
                        'director.search.emptyThemesFilter',
                        'Aucune thématique dérivée des encadrements.',
                      )}
                    </p>
                  ) : (
                    themeNameOptions.map((th) => (
                      <label
                        key={th}
                        className='flex cursor-pointer items-center gap-2 text-sm'
                      >
                        <input
                          type='checkbox'
                          checked={themes.includes(th)}
                          onChange={() => toggle(themes, th, setThemes)}
                          className='size-3.5 rounded border-input accent-primary'
                        />
                        {th}
                      </label>
                    ))
                  )}
                </FilterGroup>
                <FilterGroup label={t('director.search.filterStatus')}>
                  {SEARCH_STATUS_FILTER_KEYS.map((s) => (
                    <label
                      key={s}
                      className='flex cursor-pointer items-center gap-2 text-sm'
                    >
                      <input
                        type='checkbox'
                        checked={statuses.includes(s)}
                        onChange={() => toggle(statuses, s, setStatuses)}
                        className='size-3.5 rounded border-input accent-primary'
                      />
                      {SEARCH_STATUS_FILTER_LABELS[s]}
                    </label>
                  ))}
                </FilterGroup>
              </div>

              <label className='flex cursor-pointer items-center gap-2 text-sm font-medium'>
                <input
                  type='checkbox'
                  checked={includeExt}
                  onChange={(e) => {
                    setIncludeExt(e.target.checked)
                    setPage(1)
                  }}
                  className='size-3.5 rounded border-input accent-primary'
                />
                {t('director.search.includeExternal')}
              </label>
            </CardContent>
          </Card>

          <Card className={searchSurfaceCard}>
            <CardHeader className='flex flex-row flex-wrap items-center justify-between gap-3 border-b border-border/40 pb-4 pt-5'>
              <CardTitle className='text-base font-semibold text-foreground'>
                {t('director.search.resultsTitle')}{' '}
                <span className='tabular-nums text-muted-foreground'>
                  ({filtered.length})
                </span>
              </CardTitle>
              <div className='flex flex-wrap items-center gap-2'>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  className='gap-1.5 transition-[transform,box-shadow] duration-200 active:scale-[0.98]'
                  onClick={() => {
                    const headers = [
                      t('director.search.colTitle'),
                      t('director.search.colStudent'),
                      t('director.search.colType'),
                      t('director.search.colSupervisors'),
                      t('director.search.colTheme'),
                      t('director.search.colStatus'),
                    ]
                    const rows = sorted.map((r) => [
                      r.title,
                      r.student,
                      SUPERVISION_TYPE_LABEL_FR[r.type],
                      r.supervisors,
                      r.theme,
                      searchRowBadgeLabel(r),
                    ])
                    const csv = buildCsv(headers, rows)
                    downloadBlob(
                      csv,
                      `lmcs-recherche-encadrements-${new Date()
                        .toISOString()
                        .slice(0, 10)}.csv`,
                      'text/csv;charset=utf-8',
                    )
                    toast.success(
                      t(
                        'director.search.exportCsvSuccess',
                        'Export CSV terminé.',
                      ),
                    )
                  }}
                >
                  <Download className='size-3.5' aria-hidden />
                  {t('director.search.exportCsv')}
                </Button>
                <Badge variant='secondary' className='font-normal'>
                  <Filter className='mr-1 size-3' aria-hidden />
                  {t('director.search.sortBadge', {
                    key: sortKey,
                    dir: sortDir,
                  })}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className='px-0'>
              <div className='overflow-x-auto px-4'>
                <Table>
                  <TableHeader>
                    <TableRow className='hover:bg-transparent'>
                      <TableHead>
                        <button
                          type='button'
                          className='rounded-md px-1 py-0.5 font-semibold transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/55'
                          onClick={() => headerSort('title')}
                        >
                          {t('director.search.colTitle')}
                        </button>
                      </TableHead>
                      <TableHead>
                        <button
                          type='button'
                          className='rounded-md px-1 py-0.5 font-semibold transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/55'
                          onClick={() => headerSort('student')}
                        >
                          {t('director.search.colStudent')}
                        </button>
                      </TableHead>
                      <TableHead>
                        <button
                          type='button'
                          className='rounded-md px-1 py-0.5 font-semibold transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/55'
                          onClick={() => headerSort('type')}
                        >
                          {t('director.search.colType')}
                        </button>
                      </TableHead>
                      <TableHead className='min-w-[140px]'>
                        {t('director.search.colSupervisors')}
                      </TableHead>
                      <TableHead>{t('director.search.colTheme')}</TableHead>
                      <TableHead>
                        <button
                          type='button'
                          className='rounded-md px-1 py-0.5 font-semibold transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/55'
                          onClick={() => headerSort('status')}
                        >
                          {t('director.search.colStatus')}
                        </button>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pageRows.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className='py-12 text-center text-muted-foreground'
                        >
                          {t('director.search.emptyResults')}
                        </TableCell>
                      </TableRow>
                    ) : (
                      pageRows.map((r) => (
                        <TableRow
                          key={r.id}
                          className='cursor-pointer transition-colors hover:bg-muted/45'
                        >
                          <TableCell className='max-w-[min(280px,32vw)] font-medium'>
                            <Link
                              to={`/director/supervisions/${r.id}`}
                              title={r.title}
                              className='block max-w-full wrap-break-word font-medium text-primary underline-offset-4 transition-colors hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/55'
                            >
                              {truncateWithEllipsis(
                                r.title,
                                SUPERVISION_TITLE_TABLE_MAX,
                              )}
                            </Link>
                          </TableCell>
                          <TableCell>
                            <Link
                              to={`/director/students/${r.studentId}`}
                              className='text-foreground underline-offset-4 transition-colors hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/55'
                            >
                              {r.student}
                            </Link>
                          </TableCell>
                          <TableCell className='tabular-nums'>
                            {SUPERVISION_TYPE_LABEL_FR[r.type]}
                          </TableCell>
                          <TableCell className='text-sm text-muted-foreground'>
                            {r.supervisors}
                          </TableCell>
                          <TableCell className='max-w-[200px] text-sm'>
                            {r.theme}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant='outline'
                              className='font-normal tabular-nums'
                            >
                              {searchRowBadgeLabel(r)}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {totalPages > 1 && (
                <div className='flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3'>
                  <span className='text-sm tabular-nums text-muted-foreground'>
                    {t('director.search.pageOf', {
                      current: currentPage,
                      total: totalPages,
                    })}
                  </span>
                  <div className='flex items-center gap-1'>
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      className='active:scale-[0.98]'
                      disabled={currentPage <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      <ChevronLeft className='size-4' aria-hidden />
                      {t('common.previous')}
                    </Button>
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      className='active:scale-[0.98]'
                      disabled={currentPage >= totalPages}
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                    >
                      {t('common.next')}
                      <ChevronRight className='size-4' aria-hidden />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='researchers' className='space-y-5'>
          <p className='max-w-prose text-sm leading-relaxed text-muted-foreground'>
            {t('director.search.tabResearchersHint')}
          </p>
          <div className='relative max-w-xl'>
            <Search
              className='absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground'
              aria-hidden
            />
            <Input
              className='h-10 pl-9 text-sm transition-shadow focus-visible:ring-2 focus-visible:ring-ring/50'
              placeholder={t('director.search.searchResearchersPlaceholder')}
              value={qResearcher}
              onChange={(e) => setQResearcher(e.target.value)}
            />
          </div>
          <Card className={searchSurfaceCard}>
            <CardContent className='p-0'>
              <div className='overflow-x-auto'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        {t('director.search.colResearcherName')}
                      </TableHead>
                      <TableHead>
                        {t('director.search.colResearcherTeam')}
                      </TableHead>
                      <TableHead>
                        {t('director.search.colResearcherGrade')}
                      </TableHead>
                      <TableHead className='text-right'>
                        {t('director.search.colResearcherLoad')}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredResearchers.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className='py-10 text-center text-muted-foreground'
                        >
                          {t('director.search.emptyResearchers')}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredResearchers.map((r) => (
                        <TableRow
                          key={r.chercheur_id}
                          className='transition-colors hover:bg-muted/40'
                        >
                          <TableCell className='font-medium'>
                            <Link
                              to={`/director/chercheurs/${r.chercheur_id}`}
                              className='text-primary underline-offset-4 transition-colors hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/55'
                            >
                              {r.nom_complet}
                            </Link>
                          </TableCell>
                          <TableCell className='text-muted-foreground'>
                            {r.equipe}
                          </TableCell>
                          <TableCell>{QUALITE_LABELS[r.qualite]}</TableCell>
                          <TableCell className='text-right tabular-nums font-medium'>
                            {chercheurWorkload(r)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='themes' className='space-y-5'>
          <p className='max-w-prose text-sm leading-relaxed text-muted-foreground'>
            {t('director.search.tabThemesHint')}
          </p>
          <div className='relative max-w-xl'>
            <Search
              className='absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground'
              aria-hidden
            />
            <Input
              className='h-10 pl-9 text-sm transition-shadow focus-visible:ring-2 focus-visible:ring-ring/50'
              placeholder={t('director.search.searchThemesPlaceholder')}
              value={qTheme}
              onChange={(e) => setQTheme(e.target.value)}
            />
          </div>
          <Card className={searchSurfaceCard}>
            <CardContent className='p-0'>
              <div className='overflow-x-auto'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        {t('director.search.colThemeLabel')}
                      </TableHead>
                      <TableHead className='text-right tabular-nums'>
                        {t('director.search.colThemeKeywords')}
                      </TableHead>
                      <TableHead className='text-right tabular-nums'>
                        {t('director.search.colThemeSupervisions')}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredThemes.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={3}
                          className='py-10 text-center text-muted-foreground'
                        >
                          {t('director.search.emptyThemes')}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredThemes.map((row) => (
                        <TableRow
                          key={row.id}
                          className='transition-colors hover:bg-muted/40'
                        >
                          <TableCell className='font-medium'>
                            {row.label}
                          </TableCell>
                          <TableCell className='text-right tabular-nums text-muted-foreground'>
                            {row.keywords}
                          </TableCell>
                          <TableCell className='text-right tabular-nums'>
                            {row.encadrements}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='teams' className='space-y-5'>
          <p className='max-w-prose text-sm leading-relaxed text-muted-foreground'>
            {t('director.search.tabTeamsHint')}
          </p>
          <div className='relative max-w-xl'>
            <Search
              className='absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground'
              aria-hidden
            />
            <Input
              className='h-10 pl-9 text-sm transition-shadow focus-visible:ring-2 focus-visible:ring-ring/50'
              placeholder={t('director.search.searchTeamsPlaceholder')}
              value={qTeam}
              onChange={(e) => setQTeam(e.target.value)}
            />
          </div>
          <Card className={searchSurfaceCard}>
            <CardContent className='p-0'>
              <div className='overflow-x-auto'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('director.search.colTeamName')}</TableHead>
                      <TableHead className='text-right tabular-nums'>
                        {t('director.search.colTeamMembers')}
                      </TableHead>
                      <TableHead className='text-right tabular-nums'>
                        {t('director.search.colTeamSupervisions')}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTeams.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={3}
                          className='py-10 text-center text-muted-foreground'
                        >
                          {t('director.search.emptyTeams')}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredTeams.map((row) => (
                        <TableRow
                          key={row.id}
                          className='transition-colors hover:bg-muted/40'
                        >
                          <TableCell className='font-medium'>
                            {row.name}
                          </TableCell>
                          <TableCell className='text-right tabular-nums text-muted-foreground'>
                            {row.members}
                          </TableCell>
                          <TableCell className='text-right tabular-nums'>
                            {row.supervisions}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function FilterGroup({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className='space-y-2 rounded-xl border border-border/50 bg-muted/15 p-3 dark:bg-muted/10'>
      <Label className='text-xs font-medium text-muted-foreground'>
        {label}
      </Label>
      <div className='max-h-36 space-y-1.5 overflow-y-auto pr-1'>
        {children}
      </div>
    </div>
  )
}
