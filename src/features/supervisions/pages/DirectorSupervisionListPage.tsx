import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Search,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Eye,
  RotateCcw,
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
import { getDirectorSupervisionDetailPath } from '@/config/routes'
const SUPERVISION_TYPES = [
  'PFE',
  'Master',
  'PhD',
  'Internship',
  'Project',
] as const
const SUPERVISION_STATUSES = [
  'IN_PROGRESS',
  'DEFENDED',
  'ABANDONED',
  'EXTENSION',
  'SUSPENDED',
] as const
const VALIDATION_STATUSES = [
  'PENDING',
  'VALIDATED',
  'REJECTED',
  'REVISED',
] as const
const ACADEMIC_YEARS = [
  '2021-2022',
  '2022-2023',
  '2023-2024',
  '2024-2025',
  '2025-2026',
] as const
const THEMES = [
  'Machine Learning',
  'Cybersecurity',
  'Blockchain',
  'IoT',
  'NLP',
  'Cloud',
  'Quantum',
  'Healthcare',
] as const

type SupervisionType = (typeof SUPERVISION_TYPES)[number]
type SupervisionStatus = (typeof SUPERVISION_STATUSES)[number]
type ValidationStatus = (typeof VALIDATION_STATUSES)[number]

interface SupervisionRow {
  id: string
  title: string
  student: string
  type: SupervisionType
  status: SupervisionStatus
  validationStatus: ValidationStatus
  academicYear: string
  theme: string
  startDate: string
}

const MOCK_SUPERVISIONS: SupervisionRow[] = [
  {
    id: '1',
    title: 'Deep Learning for Medical Imaging',
    student: 'Ali Khelifi',
    type: 'Master',
    status: 'IN_PROGRESS',
    validationStatus: 'PENDING',
    academicYear: '2025-2026',
    theme: 'Machine Learning',
    startDate: '2024-09-01',
  },
  {
    id: '2',
    title: 'Blockchain for Supply Chain',
    student: 'Sara Meziani',
    type: 'PFE',
    status: 'DEFENDED',
    validationStatus: 'VALIDATED',
    academicYear: '2024-2025',
    theme: 'Blockchain',
    startDate: '2024-02-01',
  },
  {
    id: '3',
    title: 'IoT Security Framework',
    student: 'Youcef Benali',
    type: 'Master',
    status: 'IN_PROGRESS',
    validationStatus: 'REJECTED',
    academicYear: '2025-2026',
    theme: 'IoT',
    startDate: '2024-10-01',
  },
  {
    id: '4',
    title: 'AI for Healthcare Diagnostics',
    student: 'Amina Taleb',
    type: 'PhD',
    status: 'IN_PROGRESS',
    validationStatus: 'VALIDATED',
    academicYear: '2024-2025',
    theme: 'Healthcare',
    startDate: '2023-09-01',
  },
  {
    id: '5',
    title: 'NLP for Arabic Text',
    student: 'Mohamed Khelifi',
    type: 'Master',
    status: 'IN_PROGRESS',
    validationStatus: 'PENDING',
    academicYear: '2025-2026',
    theme: 'NLP',
    startDate: '2024-09-15',
  },
  {
    id: '6',
    title: 'Cloud Computing Architecture',
    student: 'Fatima Lahmar',
    type: 'Master',
    status: 'DEFENDED',
    validationStatus: 'VALIDATED',
    academicYear: '2023-2024',
    theme: 'Cloud',
    startDate: '2023-02-01',
  },
  {
    id: '7',
    title: 'Mobile App Development',
    student: 'Karim Bouzid',
    type: 'PFE',
    status: 'IN_PROGRESS',
    validationStatus: 'REVISED',
    academicYear: '2025-2026',
    theme: 'IoT',
    startDate: '2024-11-01',
  },
  {
    id: '8',
    title: 'Cybersecurity Analysis',
    student: 'Nadia Cherif',
    type: 'Master',
    status: 'IN_PROGRESS',
    validationStatus: 'PENDING',
    academicYear: '2025-2026',
    theme: 'Cybersecurity',
    startDate: '2024-09-01',
  },
  {
    id: '9',
    title: 'Data Mining Algorithms',
    student: 'Hamza Mokhtar',
    type: 'PFE',
    status: 'ABANDONED',
    validationStatus: 'VALIDATED',
    academicYear: '2023-2024',
    theme: 'Machine Learning',
    startDate: '2023-03-01',
  },
  {
    id: '10',
    title: 'Quantum Computing',
    student: 'Sami Arous',
    type: 'PhD',
    status: 'IN_PROGRESS',
    validationStatus: 'VALIDATED',
    academicYear: '2024-2025',
    theme: 'Quantum',
    startDate: '2023-09-01',
  },
  {
    id: '11',
    title: 'Distributed Systems',
    student: 'Leila Amrani',
    type: 'Master',
    status: 'DEFENDED',
    validationStatus: 'VALIDATED',
    academicYear: '2024-2025',
    theme: 'Cloud',
    startDate: '2023-10-01',
  },
  {
    id: '12',
    title: 'Smart City Sensors',
    student: 'Omar Djemai',
    type: 'Internship',
    status: 'IN_PROGRESS',
    validationStatus: 'PENDING',
    academicYear: '2025-2026',
    theme: 'IoT',
    startDate: '2025-01-15',
  },
  {
    id: '13',
    title: 'Cryptography Protocols',
    student: 'Yasmine Bensaad',
    type: 'PhD',
    status: 'IN_PROGRESS',
    validationStatus: 'REVISED',
    academicYear: '2024-2025',
    theme: 'Cybersecurity',
    startDate: '2022-09-01',
  },
  {
    id: '14',
    title: 'Web Security Audit',
    student: 'Rafik Mansouri',
    type: 'PFE',
    status: 'DEFENDED',
    validationStatus: 'VALIDATED',
    academicYear: '2024-2025',
    theme: 'Cybersecurity',
    startDate: '2024-02-01',
  },
  {
    id: '15',
    title: 'Recommendation Systems',
    student: 'Ines Ferhat',
    type: 'Master',
    status: 'IN_PROGRESS',
    validationStatus: 'VALIDATED',
    academicYear: '2025-2026',
    theme: 'Machine Learning',
    startDate: '2024-09-01',
  },
  {
    id: '16',
    title: 'DeFi Smart Contracts',
    student: 'Anis Kaddour',
    type: 'Master',
    status: 'EXTENSION',
    validationStatus: 'PENDING',
    academicYear: '2024-2025',
    theme: 'Blockchain',
    startDate: '2023-09-01',
  },
  {
    id: '17',
    title: 'Edge Computing',
    student: 'Salma Hamdi',
    type: 'PFE',
    status: 'IN_PROGRESS',
    validationStatus: 'REJECTED',
    academicYear: '2025-2026',
    theme: 'Cloud',
    startDate: '2024-10-01',
  },
  {
    id: '18',
    title: 'Medical Image Segmentation',
    student: 'Nabil Chouiter',
    type: 'PhD',
    status: 'IN_PROGRESS',
    validationStatus: 'VALIDATED',
    academicYear: '2024-2025',
    theme: 'Healthcare',
    startDate: '2022-03-01',
  },
  {
    id: '19',
    title: 'Arabic Speech Recognition',
    student: 'Dalia Meziane',
    type: 'Master',
    status: 'SUSPENDED',
    validationStatus: 'REJECTED',
    academicYear: '2023-2024',
    theme: 'NLP',
    startDate: '2023-02-01',
  },
  {
    id: '20',
    title: 'DevOps Pipeline',
    student: 'Walid Khelifi',
    type: 'Project',
    status: 'DEFENDED',
    validationStatus: 'VALIDATED',
    academicYear: '2024-2025',
    theme: 'Cloud',
    startDate: '2024-01-01',
  },
  {
    id: '21',
    title: 'Network Intrusion Detection',
    student: 'Samira Belkadi',
    type: 'Master',
    status: 'IN_PROGRESS',
    validationStatus: 'PENDING',
    academicYear: '2025-2026',
    theme: 'Cybersecurity',
    startDate: '2024-09-01',
  },
  {
    id: '22',
    title: 'Supply Chain Blockchain',
    student: 'Tarek Boussaha',
    type: 'PFE',
    status: 'DEFENDED',
    validationStatus: 'VALIDATED',
    academicYear: '2023-2024',
    theme: 'Blockchain',
    startDate: '2023-03-01',
  },
  {
    id: '23',
    title: 'Federated Learning',
    student: 'Houda Slimani',
    type: 'PhD',
    status: 'IN_PROGRESS',
    validationStatus: 'REVISED',
    academicYear: '2024-2025',
    theme: 'Machine Learning',
    startDate: '2023-09-01',
  },
  {
    id: '24',
    title: 'Smart Home IoT',
    student: 'Ibrahim Ziani',
    type: 'Internship',
    status: 'IN_PROGRESS',
    validationStatus: 'VALIDATED',
    academicYear: '2025-2026',
    theme: 'IoT',
    startDate: '2025-02-01',
  },
  {
    id: '25',
    title: 'API Security',
    student: 'Farida Benali',
    type: 'PFE',
    status: 'IN_PROGRESS',
    validationStatus: 'PENDING',
    academicYear: '2025-2026',
    theme: 'Cybersecurity',
    startDate: '2024-11-01',
  },
]

const STATUS_LABELS: Record<SupervisionStatus, string> = {
  IN_PROGRESS: 'En cours',
  DEFENDED: 'Soutenu',
  ABANDONED: 'Abandonné',
  EXTENSION: 'Prolongation',
  SUSPENDED: 'Suspendu',
}

const TYPE_LABELS: Record<SupervisionType, string> = {
  PFE: 'PFE',
  Master: 'Master',
  PhD: 'PhD',
  Internship: 'Internship',
  Project: 'Project',
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
  Master:
    'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300',
  PhD: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
  Internship:
    'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300',
  Project:
    'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
}

const VALIDATION_LABELS: Record<ValidationStatus, string> = {
  PENDING: 'En attente',
  VALIDATED: 'Validé',
  REJECTED: 'Refusé',
  REVISED: 'Révisé',
}

const FILTER_SELECT_CLASS =
  'h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground transition-colors hover:border-ring/40 focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20'

export default function DirectorSupervisionListPage() {
  const { t } = useTranslation()

  const [searchQuery, setSearchQuery] = useState('')
  const [draftType, setDraftType] = useState('')
  const [draftStatus, setDraftStatus] = useState('')
  const [draftValidation, setDraftValidation] = useState('')
  const [draftAcademicYear, setDraftAcademicYear] = useState('')
  const [draftTheme, setDraftTheme] = useState('')

  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [validationFilter, setValidationFilter] = useState('')
  const [academicYearFilter, setAcademicYearFilter] = useState('')
  const [themeFilter, setThemeFilter] = useState('')
  const [page, setPage] = useState(1)
  const perPage = 10

  const navigate = useNavigate()

  const query = searchQuery.trim().toLowerCase()
  const filteredRows = MOCK_SUPERVISIONS.filter((r) => {
    if (query) {
      const haystack =
        `${r.title} ${r.student} ${r.theme} ${r.type} ${r.status} ${r.validationStatus} ${r.academicYear}`.toLowerCase()
      if (!haystack.includes(query)) return false
    }
    if (typeFilter && r.type !== typeFilter) return false
    if (statusFilter && r.status !== statusFilter) return false
    if (validationFilter && r.validationStatus !== validationFilter)
      return false
    if (academicYearFilter && r.academicYear !== academicYearFilter)
      return false
    if (themeFilter && r.theme !== themeFilter) return false
    return true
  })

  const total = filteredRows.length
  const totalPages = Math.max(1, Math.ceil(total / perPage))
  const safePage = Math.min(page, totalPages)
  const rows = filteredRows.slice((safePage - 1) * perPage, safePage * perPage)

  const hasActiveFilters = Boolean(
    typeFilter ||
      statusFilter ||
      validationFilter ||
      academicYearFilter ||
      themeFilter,
  )

  const activeFilterLabels = [
    typeFilter ? { key: 'type', label: `Type: ${typeFilter}` } : null,
    statusFilter ? { key: 'status', label: `Statut: ${statusFilter}` } : null,
    validationFilter
      ? { key: 'validation', label: `Validation: ${validationFilter}` }
      : null,
    academicYearFilter
      ? { key: 'year', label: `Année: ${academicYearFilter}` }
      : null,
    themeFilter ? { key: 'theme', label: `Thématique: ${themeFilter}` } : null,
  ].filter(Boolean) as { key: string; label: string }[]

  const applyFilters = () => {
    setTypeFilter(draftType)
    setStatusFilter(draftStatus)
    setValidationFilter(draftValidation)
    setAcademicYearFilter(draftAcademicYear)
    setThemeFilter(draftTheme)
    setPage(1)
  }

  const resetFilters = () => {
    setDraftType('')
    setDraftStatus('')
    setDraftValidation('')
    setDraftAcademicYear('')
    setDraftTheme('')
    setTypeFilter('')
    setStatusFilter('')
    setValidationFilter('')
    setAcademicYearFilter('')
    setThemeFilter('')
    setPage(1)
  }

  const removeFilter = (key: string) => {
    if (key === 'type') {
      setTypeFilter('')
      setDraftType('')
    } else if (key === 'status') {
      setStatusFilter('')
      setDraftStatus('')
    } else if (key === 'validation') {
      setValidationFilter('')
      setDraftValidation('')
    } else if (key === 'year') {
      setAcademicYearFilter('')
      setDraftAcademicYear('')
    } else if (key === 'theme') {
      setThemeFilter('')
      setDraftTheme('')
    }
    setPage(1)
  }

  return (
    <div className='space-y-5'>
      <Card className='overflow-hidden border-border/60 bg-card shadow-sm'>
        <CardContent className='space-y-5 p-5'>
          <div className='flex flex-wrap items-start justify-between gap-4'>
            <div>
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

          <div className='grid gap-3 lg:grid-cols-5'>
            <div className='relative lg:col-span-5'>
              <Search className='absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' />
              <Input
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setPage(1)
                }}
                placeholder={t('supervisions.list.search')}
                className='pl-9'
              />
            </div>

            <select
              aria-label={t('supervisions.filters.type')}
              value={draftType}
              onChange={(e) => setDraftType(e.target.value)}
              className={FILTER_SELECT_CLASS}
            >
              <option value=''>{t('supervisions.filters.type')}</option>
              {SUPERVISION_TYPES.map((opt) => (
                <option key={opt} value={opt}>
                  {TYPE_LABELS[opt as SupervisionType] ?? opt}
                </option>
              ))}
            </select>

            <select
              aria-label={t('supervisions.filters.status')}
              value={draftStatus}
              onChange={(e) => setDraftStatus(e.target.value)}
              className={FILTER_SELECT_CLASS}
            >
              <option value=''>{t('supervisions.filters.status')}</option>
              {SUPERVISION_STATUSES.map((opt) => (
                <option key={opt} value={opt}>
                  {STATUS_LABELS[opt as SupervisionStatus] ?? opt}
                </option>
              ))}
            </select>

            <select
              aria-label={t('supervisions.columns.validation')}
              value={draftValidation}
              onChange={(e) => setDraftValidation(e.target.value)}
              className={FILTER_SELECT_CLASS}
            >
              <option value=''>{t('supervisions.columns.validation')}</option>
              {VALIDATION_STATUSES.map((opt) => (
                <option key={opt} value={opt}>
                  {VALIDATION_LABELS[opt as ValidationStatus] ?? opt}
                </option>
              ))}
            </select>

            <select
              aria-label={t('supervisions.filters.academicYear')}
              value={draftAcademicYear}
              onChange={(e) => setDraftAcademicYear(e.target.value)}
              className={FILTER_SELECT_CLASS}
            >
              <option value=''>{t('supervisions.filters.academicYear')}</option>
              {ACADEMIC_YEARS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>

            <select
              aria-label='Thématique'
              value={draftTheme}
              onChange={(e) => setDraftTheme(e.target.value)}
              className={FILTER_SELECT_CLASS}
            >
              <option value=''>Thématique</option>
              {THEMES.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div className='flex flex-wrap items-center justify-end gap-3'>
            <Button variant='outline' onClick={resetFilters} className='gap-2'>
              <RotateCcw className='size-4' />
              {t('common.reset')}
            </Button>
            <Button
              onClick={applyFilters}
              className='gap-2 bg-slate-900 text-white hover:bg-slate-800'
            >
              {t('common.search')}
            </Button>
          </div>
        </CardContent>
      </Card>

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
                  ×
                </button>
              </span>
            ))}
            <Button variant='ghost' size='sm' onClick={resetFilters}>
              {t('common.clearAll')}
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <div className='overflow-x-auto'>
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
                <TableHead>{t('supervisions.filters.academicYear')}</TableHead>
                <TableHead className='w-25 text-right'>
                  {t('supervisions.columns.actions')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className='text-center py-12'>
                    <div className='flex flex-col items-center gap-3'>
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
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className={cn(
                      'hover:bg-muted/50 transition-colors border-l-2',
                      STATUS_ROW_BORDER[row.status] ?? 'border-l-border',
                    )}
                  >
                    <TableCell className='font-medium max-w-[260px]'>
                      <Link
                        to={getDirectorSupervisionDetailPath(row.id)}
                        className='block truncate text-inherit no-underline visited:text-inherit hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm'
                        title={row.title}
                      >
                        {row.title}
                      </Link>
                    </TableCell>
                    <TableCell className='text-sm whitespace-nowrap text-muted-foreground'>
                      {row.student}
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
                              navigate(getDirectorSupervisionDetailPath(row.id))
                            }
                          >
                            <Eye className='size-4 shrink-0' />
                            <span>{t('common.view')}</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
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
    </div>
  )
}
