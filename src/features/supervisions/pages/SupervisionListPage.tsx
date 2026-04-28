import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Search,
  SlidersHorizontal,
  MoreVertical,
  X,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Eye,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
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
  getResearcherSupervisionDetailPath,
  getResearcherReviewDetailPath,
} from '@/config/routes'
import { useSupervisions } from '@/features/supervisions/hooks/useSupervisions'
import type {
  SupervisionType,
  SupervisionStatus,
  ValidationStatus,
} from '@/features/supervisions/types'

const SUPERVISION_TYPES = [
  'PFE',
  'MASTER',
  'PHD',
  'INTERNSHIP',
  'PROJECT',
] as const
const SUPERVISION_STATUSES = [
  'IN_PROGRESS',
  'DEFENDED',
  'ABANDONED',
  'EXTENSION',
  'SUSPENDED',
] as const
const ACADEMIC_YEARS = [
  '2021-2022',
  '2022-2023',
  '2023-2024',
  '2024-2025',
  '2025-2026',
] as const

const TYPE_LABELS: Record<SupervisionType, string> = {
  PFE: 'PFE',
  MASTER: 'Master',
  PHD: 'Doctorat',
  INTERNSHIP: 'Stage',
  PROJECT: 'Projet',
}
const STATUS_LABELS: Record<SupervisionStatus, string> = {
  IN_PROGRESS: 'En cours',
  DEFENDED: 'Soutenu',
  ABANDONED: 'Abandonné',
  EXTENSION: 'Prolongation',
  SUSPENDED: 'Suspendu',
}
const VALIDATION_LABELS: Record<ValidationStatus, string> = {
  PENDING: 'En attente',
  VALIDATED: 'Validé',
  REJECTED: 'Refusé',
  REVISED: 'Révisé',
}
const STATUS_DOT: Record<string, string> = {
  IN_PROGRESS: 'bg-blue-500',
  DEFENDED: 'bg-green-500',
  ABANDONED: 'bg-red-400',
  EXTENSION: 'bg-orange-400',
  SUSPENDED: 'bg-gray-400',
}
const STATUS_VARIANT: Record<
  string,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  PENDING: 'outline',
  IN_PROGRESS: 'secondary',
  DEFENDED: 'default',
  VALIDATED: 'default',
  REJECTED: 'destructive',
  REVISED: 'secondary',
  ABANDONED: 'destructive',
  EXTENSION: 'outline',
  SUSPENDED: 'outline',
}
const STATUS_ROW_BORDER: Record<string, string> = {
  IN_PROGRESS: 'border-l-blue-400',
  DEFENDED: 'border-l-green-500',
  ABANDONED: 'border-l-red-400',
  EXTENSION: 'border-l-orange-400',
  SUSPENDED: 'border-l-gray-400',
}
const TYPE_COLOR: Record<string, string> = {
  PFE: 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300',
  MASTER:
    'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300',
  PHD: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
  INTERNSHIP:
    'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300',
  PROJECT:
    'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
}

export default function SupervisionListPage() {
  const { userId } = useParams<{ userId: string }>()
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [searchQuery, setSearchQuery] = useState('')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [page, setPage] = useState(1)
  const perPage = 10

  const [typeFilter, setTypeFilter] = useState<SupervisionType[]>([])
  const [statusFilter, setStatusFilter] = useState<SupervisionStatus[]>([])
  const [validationFilter, setValidationFilter] = useState<ValidationStatus[]>(
    [],
  )
  const [academicYearFilter, setAcademicYearFilter] = useState('')

  const toggleType = (t: SupervisionType) =>
    setTypeFilter((p) => {
      setPage(1)
      return p.includes(t) ? p.filter((x) => x !== t) : [...p, t]
    })
  const toggleStatus = (s: SupervisionStatus) =>
    setStatusFilter((p) => {
      setPage(1)
      return p.includes(s) ? p.filter((x) => x !== s) : [...p, s]
    })
  const toggleValidation = (v: ValidationStatus) =>
    setValidationFilter((p) => {
      setPage(1)
      return p.includes(v) ? p.filter((x) => x !== v) : [...p, v]
    })
  const toggleAcademicYear = (year: string) => {
    setPage(1)
    setAcademicYearFilter(academicYearFilter === year ? '' : year)
  }

  const serverFilters = {
    search: searchQuery.trim() || undefined,
    page,
    limit: perPage,
  }

  const {
    data: pageResult,
    isLoading,
    isError,
  } = useSupervisions(serverFilters)

  const rows = useMemo(() => {
    const baseRows = pageResult?.data ?? []
    const query = searchQuery.trim().toLowerCase()
    return baseRows.filter((row) => {
      if (query) {
        const supervisorName =
          row.supervisors?.[0]?.supervisor?.nom_complet ?? ''
        const themeName = row.theme?.name ?? ''
        const haystack = `${row.title} ${row.student?.firstName ?? ''} ${
          row.student?.lastName ?? ''
        } ${supervisorName} ${themeName} ${row.academicYear} ${row.type} ${
          row.status
        } ${row.validationStatus}`.toLowerCase()
        if (!haystack.includes(query)) return false
      }
      if (typeFilter.length > 0 && !typeFilter.includes(row.type)) return false
      if (statusFilter.length > 0 && !statusFilter.includes(row.status))
        return false
      if (
        validationFilter.length > 0 &&
        !validationFilter.includes(row.validationStatus)
      )
        return false
      if (academicYearFilter && row.academicYear !== academicYearFilter)
        return false
      return true
    })
  }, [
    pageResult?.data,
    searchQuery,
    typeFilter,
    statusFilter,
    validationFilter,
    academicYearFilter,
  ])

  const total = rows.length
  const totalPages = Math.max(1, Math.ceil(total / perPage))
  const safePage = Math.min(page, totalPages)
  const displayRows = rows.slice((safePage - 1) * perPage, safePage * perPage)

  const hasActiveFilters = Boolean(
    typeFilter.length > 0 ||
      statusFilter.length > 0 ||
      validationFilter.length > 0 ||
      academicYearFilter,
  )

  const activeFilterLabels: { key: string; label: string }[] = []
  typeFilter.forEach((t) =>
    activeFilterLabels.push({
      key: `type-${t}`,
      label: `Type: ${TYPE_LABELS[t]}`,
    }),
  )
  statusFilter.forEach((s) =>
    activeFilterLabels.push({
      key: `status-${s}`,
      label: `Statut: ${STATUS_LABELS[s]}`,
    }),
  )
  validationFilter.forEach((v) =>
    activeFilterLabels.push({
      key: `val-${v}`,
      label: `Validation: ${VALIDATION_LABELS[v]}`,
    }),
  )
  if (academicYearFilter)
    activeFilterLabels.push({
      key: 'year',
      label: `Année: ${academicYearFilter}`,
    })

  const removeFilter = (key: string) => {
    if (key.startsWith('type-'))
      setTypeFilter((p) => p.filter((x) => `type-${x}` !== key))
    else if (key.startsWith('status-'))
      setStatusFilter((p) => p.filter((x) => `status-${x}` !== key))
    else if (key.startsWith('val-'))
      setValidationFilter((p) => p.filter((x) => `val-${x}` !== key))
    else if (key === 'year') setAcademicYearFilter('')
    setPage(1)
  }

  const clearAllFilters = () => {
    setTypeFilter([])
    setStatusFilter([])
    setValidationFilter([])
    setAcademicYearFilter('')
    setPage(1)
  }

  return (
    <div className='space-y-4'>
      <div className='flex flex-wrap items-center gap-3'>
        <div className='flex-1'>
          <h1 className='text-2xl font-semibold tracking-tight'>
            {t('supervisions.list.title')}
          </h1>
          <p className='text-sm text-muted-foreground'>
            {t('supervisions.list.subtitle')}
          </p>
        </div>
        {total > 0 && (
          <span className='inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary tabular'>
            {t('supervisions.list.count', { count: total })}
          </span>
        )}
      </div>

      <div className='flex flex-wrap items-center gap-3'>
        <div className='relative flex-1 min-w-50 max-w-md'>
          <Search className='absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' />
          <Input
            placeholder={t('supervisions.list.search')}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setPage(1)
            }}
            className='pl-9'
          />
        </div>
        <Button
          variant='outline'
          onClick={() => setFiltersOpen(true)}
          className='inline-flex shrink-0 items-center gap-2 whitespace-nowrap'
        >
          <SlidersHorizontal className='size-4 shrink-0' />
          <span>{t('common.filter')}</span>
        </Button>
      </div>

      {hasActiveFilters && (
        <Card>
          <CardContent className='flex flex-wrap items-center gap-2 py-3'>
            <span className='text-sm text-muted-foreground'>
              {t('common.activeFilters')}
            </span>
            {activeFilterLabels.map(({ key, label }) => (
              <span
                key={key}
                className='inline-flex items-center gap-1 rounded-md border bg-muted/50 px-2 py-1 text-sm'
              >
                {label}
                <button
                  type='button'
                  onClick={() => removeFilter(key)}
                  className='rounded p-0.5 hover:bg-muted'
                  aria-label={`${t('common.remove')} ${label}`}
                >
                  <X className='size-3.5' />
                </button>
              </span>
            ))}
            <Button variant='ghost' size='sm' onClick={clearAllFilters}>
              {t('common.clearAll')}
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <div className='overflow-x-auto'>
          {isLoading ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('supervisions.columns.title')}</TableHead>
                  <TableHead>{t('supervisions.columns.student')}</TableHead>
                  <TableHead>{t('supervisions.columns.type')}</TableHead>
                  <TableHead>{t('supervisions.columns.status')}</TableHead>
                  <TableHead>{t('supervisions.columns.validation')}</TableHead>
                  <TableHead>
                    {t('supervisions.filters.academicYear')}
                  </TableHead>
                  <TableHead className='w-25 text-right'>
                    {t('supervisions.columns.actions')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className='border-l-2 border-l-muted'>
                    <TableCell>
                      <div className='h-4 w-48 animate-pulse rounded bg-muted' />
                    </TableCell>
                    <TableCell>
                      <div className='h-4 w-32 animate-pulse rounded bg-muted' />
                    </TableCell>
                    <TableCell>
                      <div className='h-5 w-16 animate-pulse rounded-md bg-muted' />
                    </TableCell>
                    <TableCell>
                      <div className='h-4 w-20 animate-pulse rounded bg-muted' />
                    </TableCell>
                    <TableCell>
                      <div className='h-5 w-20 animate-pulse rounded-md bg-muted' />
                    </TableCell>
                    <TableCell>
                      <div className='h-4 w-20 animate-pulse rounded bg-muted' />
                    </TableCell>
                    <TableCell className='text-right'>
                      <div className='ml-auto h-8 w-8 animate-pulse rounded bg-muted' />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : isError ? (
            <div className='py-10 text-center text-sm text-destructive'>
              {t('supervisions.list.loadError')}
            </div>
          ) : displayRows.length === 0 ? (
            <div className='flex flex-col items-center gap-3 py-16 text-center'>
              <div className='flex size-14 items-center justify-center rounded-full bg-muted'>
                <BookOpen className='size-7 text-muted-foreground' />
              </div>
              <p className='text-sm font-medium text-foreground'>
                {t('supervisions.list.noResults')}
              </p>
              <p className='text-xs text-muted-foreground'>
                {hasActiveFilters
                  ? t('supervisions.list.noResultsFiltered')
                  : t('supervisions.list.noResultsEmpty')}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className='min-w-[220px]'>
                    {t('supervisions.columns.title')}
                  </TableHead>
                  <TableHead className='whitespace-nowrap'>
                    {t('supervisions.columns.student')}
                  </TableHead>
                  <TableHead>{t('supervisions.columns.type')}</TableHead>
                  <TableHead>{t('supervisions.columns.status')}</TableHead>
                  <TableHead>{t('supervisions.columns.validation')}</TableHead>
                  <TableHead>
                    {t('supervisions.filters.academicYear')}
                  </TableHead>
                  <TableHead className='w-25 text-right'>
                    {t('supervisions.columns.actions')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayRows.map((row) => (
                  <TableRow
                    key={row.id}
                    className={cn(
                      'hover:bg-muted/50 transition-colors border-l-2',
                      STATUS_ROW_BORDER[row.status] ?? 'border-l-border',
                    )}
                  >
                    <TableCell className='font-medium max-w-[260px]'>
                      <Link
                        to={
                          userId
                            ? getResearcherSupervisionDetailPath(userId, row.id)
                            : '#'
                        }
                        className='block truncate text-inherit no-underline visited:text-inherit hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm'
                        title={row.title}
                      >
                        {row.title}
                      </Link>
                    </TableCell>
                    <TableCell className='text-sm whitespace-nowrap text-muted-foreground'>
                      {row.student
                        ? `${row.student.lastName} ${row.student.firstName}`
                        : '—'}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${
                          TYPE_COLOR[row.type] ?? 'bg-muted text-foreground'
                        }`}
                      >
                        {TYPE_LABELS[row.type] ?? row.type}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className='inline-flex items-center gap-1.5 text-sm text-foreground'>
                        <span
                          className={`inline-block size-2 rounded-full ${
                            STATUS_DOT[row.status] ?? 'bg-muted-foreground'
                          }`}
                        />
                        {STATUS_LABELS[row.status] ?? row.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          STATUS_VARIANT[row.validationStatus] ?? 'outline'
                        }
                      >
                        {VALIDATION_LABELS[row.validationStatus] ??
                          row.validationStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className='text-sm text-muted-foreground'>
                      {row.academicYear}
                    </TableCell>
                    <TableCell className='text-right'>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          className='inline-flex size-8 items-center justify-center rounded-lg text-foreground/70 transition-colors hover:bg-accent hover:text-foreground'
                          aria-label='Actions'
                        >
                          <MoreVertical className='size-4' />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align='end'
                          className='w-44 border border-border/60 bg-popover text-popover-foreground shadow-md'
                        >
                          <DropdownMenuItem
                            className='inline-flex items-center gap-2 focus:bg-accent/80 focus:text-accent-foreground'
                            onClick={() =>
                              userId &&
                              navigate(
                                getResearcherSupervisionDetailPath(
                                  userId,
                                  row.id,
                                ),
                              )
                            }
                          >
                            <Eye className='size-4 shrink-0' />
                            <span>{t('common.view')}</span>
                          </DropdownMenuItem>
                          {row.validationStatus === 'PENDING' && userId && (
                            <DropdownMenuItem
                              className='inline-flex items-center gap-2 focus:bg-accent/80 focus:text-accent-foreground'
                              onClick={() =>
                                navigate(
                                  getResearcherReviewDetailPath(userId, row.id),
                                )
                              }
                            >
                              <BookOpen className='size-4 shrink-0' />
                              <span>{t('researcher.reviews.openDetail')}</span>
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </Card>

      <Card>
        <CardContent className='flex flex-wrap items-center justify-between gap-4 py-3'>
          <span className='tabular text-sm text-muted-foreground'>
            {t('supervisions.list.total', { count: total })}
          </span>
          <div className='flex items-center gap-1'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
              className='whitespace-nowrap shrink-0 inline-flex items-center gap-1'
            >
              <ChevronLeft className='size-4 shrink-0' />
              <span>{t('common.previous')}</span>
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Button
                key={p}
                variant={p === safePage ? 'secondary' : 'ghost'}
                size='sm'
                className='min-w-8 tabular'
                onClick={() => p !== safePage && setPage(p)}
                disabled={p === safePage}
              >
                {p}
              </Button>
            ))}
            <Button
              variant='outline'
              size='sm'
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
              className='whitespace-nowrap shrink-0 inline-flex items-center gap-1'
            >
              <span>{t('common.next')}</span>
              <ChevronRight className='size-4 shrink-0' />
            </Button>
          </div>
          <span className='tabular text-sm text-muted-foreground'>
            ({safePage} / {totalPages})
          </span>
        </CardContent>
      </Card>

      {/* Filter Panel - Side Drawer */}
      {filtersOpen && (
        <div className='fixed inset-0 z-50 flex items-start justify-end'>
          <button
            type='button'
            aria-label={t('common.close')}
            className='absolute inset-0 bg-black/50'
            onClick={() => setFiltersOpen(false)}
          />
          <div className='relative w-full max-w-sm bg-background shadow-xl animate-in slide-in-from-right-full duration-300'>
            <div className='space-y-4 p-5'>
              <div className='flex items-center justify-between'>
                <h2 className='text-lg font-semibold'>{t('common.filter')}</h2>
                <button
                  type='button'
                  onClick={() => setFiltersOpen(false)}
                  className='rounded-lg hover:bg-muted p-1'
                  aria-label={t('common.close')}
                >
                  <X className='size-5' />
                </button>
              </div>

              <div className='space-y-3'>
                <div>
                  <h3 className='mb-2 text-sm font-semibold'>
                    {t('supervisions.filters.type')}
                  </h3>
                  <div className='space-y-2'>
                    {SUPERVISION_TYPES.map((type) => (
                      <label
                        key={type}
                        className='flex items-center gap-2 cursor-pointer'
                      >
                        <input
                          type='checkbox'
                          checked={typeFilter.includes(type)}
                          onChange={() => toggleType(type)}
                          className='rounded border-border'
                          aria-label={TYPE_LABELS[type]}
                        />
                        <span className='text-sm'>{TYPE_LABELS[type]}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className='border-t pt-3'>
                  <h3 className='mb-2 text-sm font-semibold'>
                    {t('supervisions.filters.status')}
                  </h3>
                  <div className='space-y-2'>
                    {SUPERVISION_STATUSES.map((status) => (
                      <label
                        key={status}
                        className='flex items-center gap-2 cursor-pointer'
                      >
                        <input
                          type='checkbox'
                          checked={statusFilter.includes(status)}
                          onChange={() => toggleStatus(status)}
                          className='rounded border-border'
                          aria-label={STATUS_LABELS[status]}
                        />
                        <span className='text-sm'>{STATUS_LABELS[status]}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className='border-t pt-3'>
                  <h3 className='mb-2 text-sm font-semibold'>
                    {t('supervisions.columns.validation')}
                  </h3>
                  <div className='space-y-2'>
                    {(
                      [
                        'PENDING',
                        'VALIDATED',
                        'REJECTED',
                        'REVISED',
                      ] as ValidationStatus[]
                    ).map((val) => (
                      <label
                        key={val}
                        className='flex items-center gap-2 cursor-pointer'
                      >
                        <input
                          type='checkbox'
                          checked={validationFilter.includes(val)}
                          onChange={() => toggleValidation(val)}
                          className='rounded border-border'
                          aria-label={VALIDATION_LABELS[val]}
                        />
                        <span className='text-sm'>
                          {VALIDATION_LABELS[val]}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className='border-t pt-3'>
                  <h3 className='mb-2 text-sm font-semibold'>
                    {t('supervisions.filters.academicYear')}
                  </h3>
                  <div className='space-y-2'>
                    {ACADEMIC_YEARS.map((year) => (
                      <label
                        key={year}
                        className='flex items-center gap-2 cursor-pointer'
                      >
                        <input
                          type='checkbox'
                          checked={academicYearFilter === year}
                          onChange={() => toggleAcademicYear(year)}
                          className='rounded border-border'
                          aria-label={year}
                        />
                        <span className='text-sm'>{year}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className='border-t pt-3 flex gap-2'>
                <Button
                  variant='outline'
                  onClick={clearAllFilters}
                  className='flex-1'
                >
                  {t('common.reset')}
                </Button>
                <Button
                  onClick={() => setFiltersOpen(false)}
                  className='flex-1 bg-slate-900 text-white hover:bg-slate-800'
                >
                  {t('common.apply')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
