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

// ─── Constants ────────────────────────────────────────────────────────────────

const SUPERVISION_TYPES: SupervisionType[] = [
  'PFE',
  'MASTER',
  'PHD',
  'INTERNSHIP',
  'PROJECT',
]
const SUPERVISION_STATUSES: SupervisionStatus[] = [
  'IN_PROGRESS',
  'DEFENDED',
  'ABANDONED',
  'EXTENSION',
  'SUSPENDED',
]
const VALIDATION_STATUSES: ValidationStatus[] = [
  'PENDING',
  'VALIDATED',
  'REJECTED',
  'REVISED',
]
const ACADEMIC_YEARS = [
  '2021-2022',
  '2022-2023',
  '2023-2024',
  '2024-2025',
  '2025-2026',
]

// Note: textual labels (types/statuses) are resolved inside the component
// using `t()` so they follow the active language.

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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SupervisionListPage() {
  const { userId } = useParams<{ userId: string }>()
  const { t } = useTranslation()

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

  const [searchQuery, setSearchQuery] = useState('')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [page, setPage] = useState(1)
  const perPage = 10

  // Filter state — all sent server-side
  const [typeFilter, setTypeFilter] = useState<SupervisionType[]>([])
  const [statusFilter, setStatusFilter] = useState<SupervisionStatus[]>([])
  const [validationFilter, setValidationFilter] = useState<ValidationStatus[]>(
    [],
  )
  const [academicYearFilter, setAcademicYearFilter] = useState('')

  const toggleType = (t: SupervisionType) =>
    setTypeFilter((p) => (p.includes(t) ? p.filter((x) => x !== t) : [...p, t]))
  const toggleStatus = (s: SupervisionStatus) =>
    setStatusFilter((p) =>
      p.includes(s) ? p.filter((x) => x !== s) : [...p, s],
    )
  const toggleValidation = (v: ValidationStatus) =>
    setValidationFilter((p) =>
      p.includes(v) ? p.filter((x) => x !== v) : [...p, v],
    )

  // Build server-side params
  // For multi-select filters where backend only supports single value, pass first selected value
  const serverFilters = {
    search: searchQuery.trim() || undefined,
    type: typeFilter.length === 1 ? typeFilter[0] : undefined,
    status: statusFilter.length === 1 ? statusFilter[0] : undefined,
    validationStatus:
      validationFilter.length === 1 ? validationFilter[0] : undefined,
    academicYear: academicYearFilter || undefined,
    page,
    limit: perPage,
  }

  const {
    data: pageResult,
    isLoading,
    isError,
  } = useSupervisions(serverFilters)
  const navigate = useNavigate()

  // Client-side filter for multi-select (when >1 value selected)
  const rows = (pageResult?.data ?? []).filter((r) => {
    if (typeFilter.length > 1 && !typeFilter.includes(r.type)) return false
    if (statusFilter.length > 1 && !statusFilter.includes(r.status))
      return false
    if (
      validationFilter.length > 1 &&
      !validationFilter.includes(r.validationStatus)
    )
      return false
    return true
  })

  const total = pageResult?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / perPage))

  const hasActiveFilters =
    typeFilter.length > 0 ||
    statusFilter.length > 0 ||
    validationFilter.length > 0 ||
    academicYearFilter !== ''

  const activeFilterLabels: { key: string; label: string }[] = []
  typeFilter.forEach((typeVal) =>
    activeFilterLabels.push({
      key: `type-${typeVal}`,
      label: `${t('supervisions.filters.type')}: ${TYPE_LABELS[typeVal]}`,
    }),
  )
  statusFilter.forEach((s) =>
    activeFilterLabels.push({
      key: `status-${s}`,
      label: `${t('supervisions.filters.status')}: ${STATUS_LABELS[s]}`,
    }),
  )
  validationFilter.forEach((v) =>
    activeFilterLabels.push({
      key: `val-${v}`,
      label: `${t('supervisions.filters.validation')}: ${VALIDATION_LABELS[v]}`,
    }),
  )
  if (academicYearFilter)
    activeFilterLabels.push({
      key: 'year',
      label: `${t('supervisions.filters.academicYear')}: ${academicYearFilter}`,
    })

  const removeFilter = (key: string) => {
    if (key.startsWith('type-'))
      setTypeFilter((p) => p.filter((x) => `type-${x}` !== key))
    else if (key.startsWith('status-'))
      setStatusFilter((p) => p.filter((x) => `status-${x}` !== key))
    else if (key.startsWith('val-'))
      setValidationFilter((p) => p.filter((x) => `val-${x}` !== key))
    else if (key === 'year') setAcademicYearFilter('')
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
      {/* Header */}
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

      {/* Toolbar */}
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

      {/* Active Filters */}
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

      {/* Table */}
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
          ) : rows.length === 0 ? (
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
                  <TableHead className='min-w-[200px]'>
                    {t('supervisions.columns.title')}
                  </TableHead>
                  <TableHead className='whitespace-nowrap'>
                    {t('supervisions.columns.student')}
                  </TableHead>
                  <TableHead>{t('supervisions.columns.type')}</TableHead>
                  <TableHead>{t('supervisions.columns.status')}</TableHead>
                  <TableHead>{t('supervisions.columns.validation')}</TableHead>
                  <TableHead className='w-25 text-right'>
                    {t('supervisions.columns.actions')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
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
                    <TableCell className='text-muted-foreground text-sm whitespace-nowrap'>
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
                    <TableCell className='text-right'>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          className='inline-flex size-8 items-center justify-center rounded-lg hover:bg-muted'
                          aria-label='Actions'
                        >
                          <MoreVertical className='size-4' />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                          <DropdownMenuItem
                            className='inline-flex items-center gap-2'
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
                              className='inline-flex items-center gap-2'
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

      {/* Pagination */}
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
              disabled={page <= 1}
              className='whitespace-nowrap shrink-0 inline-flex items-center gap-1'
            >
              <ChevronLeft className='size-4 shrink-0' />
              <span>{t('common.previous')}</span>
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Button
                key={p}
                variant={p === page ? 'secondary' : 'ghost'}
                size='sm'
                className='min-w-8 tabular'
                onClick={() => p !== page && setPage(p)}
                disabled={p === page}
              >
                {p}
              </Button>
            ))}
            <Button
              variant='outline'
              size='sm'
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className='whitespace-nowrap shrink-0 inline-flex items-center gap-1'
            >
              <span>{t('common.next')}</span>
              <ChevronRight className='size-4 shrink-0' />
            </Button>
          </div>
          <span className='tabular text-sm text-muted-foreground'>
            ({page} / {totalPages})
          </span>
        </CardContent>
      </Card>

      {/* Filters panel */}
      <div
        className={cn(
          'fixed inset-y-0 right-0 z-50 w-full max-w-sm border-l bg-card shadow-lg transition-transform duration-200 ease-out',
          filtersOpen ? 'translate-x-0 visible' : 'translate-x-full invisible',
        )}
      >
        <div className='flex h-full flex-col'>
          <div className='flex items-center justify-between border-b bg-primary/5 px-4 py-3'>
            <h2 className='font-semibold'>
              {t('common.filter')}
              {hasActiveFilters && (
                <span className='ml-1 text-xs font-normal text-muted-foreground'>
                  ({activeFilterLabels.length})
                </span>
              )}
            </h2>
            <Button
              variant='ghost'
              size='icon'
              onClick={() => setFiltersOpen(false)}
              aria-label={t('common.close')}
            >
              <X className='size-4' />
            </Button>
          </div>

          <div className='flex-1 overflow-y-auto p-4 space-y-6'>
            <div>
              <div className='mb-2 text-sm font-medium'>
                {t('supervisions.filters.type')}
              </div>
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
                      className='rounded border-input accent-primary'
                    />
                    <span className='text-sm'>{TYPE_LABELS[type]}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <div className='mb-2 text-sm font-medium'>
                {t('supervisions.filters.status')}
              </div>
              <div className='space-y-2'>
                {SUPERVISION_STATUSES.map((s) => (
                  <label
                    key={s}
                    className='flex items-center gap-2 cursor-pointer'
                  >
                    <input
                      type='checkbox'
                      checked={statusFilter.includes(s)}
                      onChange={() => toggleStatus(s)}
                      className='rounded border-input accent-primary'
                    />
                    <span className='text-sm'>{STATUS_LABELS[s]}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <div className='mb-2 text-sm font-medium'>
                {t('supervisions.filters.validation')}
              </div>
              <div className='space-y-2'>
                {VALIDATION_STATUSES.map((v) => (
                  <label
                    key={v}
                    className='flex items-center gap-2 cursor-pointer'
                  >
                    <input
                      type='checkbox'
                      checked={validationFilter.includes(v)}
                      onChange={() => toggleValidation(v)}
                      className='rounded border-input accent-primary'
                    />
                    <span className='text-sm'>{VALIDATION_LABELS[v]}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label
                htmlFor='academic-year-filter'
                className='mb-2 block text-sm font-medium'
              >
                {t('supervisions.filters.academicYear')}
              </label>
              <select
                id='academic-year-filter'
                value={academicYearFilter}
                onChange={(e) => setAcademicYearFilter(e.target.value)}
                className='w-full rounded-md border bg-background px-3 py-2 text-sm'
              >
                <option value=''>{t('supervisions.filters.all')}</option>
                {ACADEMIC_YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className='flex gap-2 border-t p-4'>
            <Button
              onClick={() => {
                setFiltersOpen(false)
                setPage(1)
              }}
              className='flex-1 shrink-0 whitespace-nowrap inline-flex items-center justify-center gap-2'
            >
              {t('common.apply')}
            </Button>
            <Button
              variant='outline'
              onClick={() => {
                clearAllFilters()
                setFiltersOpen(false)
              }}
              className='shrink-0 whitespace-nowrap'
            >
              {t('common.reset')}
            </Button>
          </div>
        </div>
      </div>

      {filtersOpen && (
        <button
          type='button'
          className='fixed inset-0 z-40 bg-black/20'
          aria-label={t('common.close')}
          onClick={() => setFiltersOpen(false)}
        />
      )}
    </div>
  )
}
