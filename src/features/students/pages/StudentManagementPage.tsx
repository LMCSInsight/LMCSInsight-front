import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Search,
  SlidersHorizontal,
  Plus,
  Eye,
  Pencil,
  Trash2,
  MoreVertical,
  X,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  GraduationCap,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button, buttonVariants } from '@/components/ui/button'
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
  getAssistantStudentDetailPath,
  getAssistantStudentEditPath,
  getAssistantStudentRegisterPath,
} from '@/config/routes'
import { useStudents, useDeleteStudent } from '@/features/students/hooks'
import type {
  Institution,
  StudentLevel,
  Specialty,
} from '@/features/students/api'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

// ─── Filter constants ─────────────────────────────────────────────────────────

// Note: textual labels are resolved inside the component using `t()` so they follow the active language.

const LEVEL_BADGE: Record<string, string> = {
  DOCTORANT:
    'bg-violet-100/80 text-violet-900 border border-violet-200/50 dark:bg-violet-900/30 dark:text-violet-200',
  MASTER:
    'bg-blue-100/80 text-blue-900 border border-blue-200/50 dark:bg-blue-900/30 dark:text-blue-200',
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function StudentManagementPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  // Localized filter options
  const ETABLISSEMENTS = useMemo(
    () => [
      { value: 'ESI' as Institution, label: t('students.institution.ESI') },
      {
        value: 'EXTERNE' as Institution,
        label: t('students.institution.EXTERNE'),
      },
    ],
    [t],
  )

  const NIVEAUX = useMemo(
    () => [
      { value: 'MASTER' as StudentLevel, label: t('students.level.MASTER') },
      {
        value: 'DOCTORANT' as StudentLevel,
        label: t('students.level.DOCTORANT'),
      },
    ],
    [t],
  )

  const SPECIALITES: Specialty[] = ['SIL', 'SID', 'SIT', 'SIQ']

  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [perPage] = useState(10)

  const [etablissementFilter, setEtablissementFilter] = useState<Institution[]>(
    [],
  )
  const [niveauFilter, setNiveauFilter] = useState<StudentLevel[]>([])
  const [specialiteFilter, setSpecialiteFilter] = useState<Specialty[]>([])

  const toggleEtablissement = (v: Institution) =>
    setEtablissementFilter((p) =>
      p.includes(v) ? p.filter((x) => x !== v) : [...p, v],
    )
  const toggleNiveau = (v: StudentLevel) =>
    setNiveauFilter((p) =>
      p.includes(v) ? p.filter((x) => x !== v) : [...p, v],
    )
  const toggleSpecialite = (v: Specialty) =>
    setSpecialiteFilter((p) =>
      p.includes(v) ? p.filter((x) => x !== v) : [...p, v],
    )

  const serverFilters = {
    search: searchQuery.trim() || undefined,
    institution:
      etablissementFilter.length === 1 ? etablissementFilter[0] : undefined,
    level: niveauFilter.length === 1 ? niveauFilter[0] : undefined,
    page,
    limit: perPage,
  }

  const { data: pageResult, isLoading, isError } = useStudents(serverFilters)
  const { mutate: deleteStudent } = useDeleteStudent()

  const rows = (pageResult?.data ?? []).filter((r) => {
    if (specialiteFilter.length === 0) return true
    return specialiteFilter.includes(r.specialty as Specialty)
  })

  const total = pageResult?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / perPage))

  const hasActiveFilters =
    etablissementFilter.length > 0 ||
    niveauFilter.length > 0 ||
    specialiteFilter.length > 0

  const ETAB_LABEL: Record<string, string> = Object.fromEntries(
    ETABLISSEMENTS.map((o) => [o.value, o.label]),
  )
  const NIV_LABEL: Record<string, string> = Object.fromEntries(
    NIVEAUX.map((o) => [o.value, o.label]),
  )
  const activeFilterLabels: { key: string; label: string }[] = []
  etablissementFilter.forEach((v) =>
    activeFilterLabels.push({
      key: `etab-${v}`,
      label: `Établissement: ${ETAB_LABEL[v] ?? v}`,
    }),
  )
  niveauFilter.forEach((v) =>
    activeFilterLabels.push({
      key: `niv-${v}`,
      label: `Niveau: ${NIV_LABEL[v] ?? v}`,
    }),
  )
  specialiteFilter.forEach((v) =>
    activeFilterLabels.push({ key: `spe-${v}`, label: `Spécialité: ${v}` }),
  )

  const removeFilter = (key: string) => {
    if (key.startsWith('etab-'))
      setEtablissementFilter((p) => p.filter((x) => `etab-${x}` !== key))
    else if (key.startsWith('niv-'))
      setNiveauFilter((p) => p.filter((x) => `niv-${x}` !== key))
    else if (key.startsWith('spe-'))
      setSpecialiteFilter((p) => p.filter((x) => `spe-${x}` !== key))
  }

  const clearAllFilters = () => {
    setEtablissementFilter([])
    setNiveauFilter([])
    setSpecialiteFilter([])
    setPage(1)
  }

  const handleDelete = (id: string) => {
    setDeleteTarget(id)
  }

  const confirmDelete = () => {
    if (deleteTarget) deleteStudent(deleteTarget)
    setDeleteTarget(null)
  }

  const detailPath = (id: string) => getAssistantStudentDetailPath(id)
  const editPath = (id: string) => getAssistantStudentEditPath(id)
  const registerPath = getAssistantStudentRegisterPath()

  return (
    <div className='mx-auto w-full max-w-7xl space-y-4'>
      {/* Header */}
      <div className='flex flex-wrap items-center gap-3'>
        <div className='flex-1'>
          <h1 className='text-2xl font-semibold tracking-tight'>
            {t('students.list.title')}
          </h1>
          <p className='text-sm text-muted-foreground'>
            {t('students.list.subtitle')}
          </p>
        </div>
        {total > 0 && (
          <span className='tabular inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary'>
            {t('students.list.count', { count: total })}
          </span>
        )}
      </div>

      {/* Toolbar */}
      <div className='flex flex-wrap items-center gap-3'>
        <div className='relative flex-1 min-w-[200px] max-w-md'>
          <Search className='absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' />
          <Input
            placeholder={t('students.list.search')}
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
          {hasActiveFilters && (
            <span className='ml-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold size-4 flex items-center justify-center'>
              {activeFilterLabels.length}
            </span>
          )}
        </Button>
        <Link
          to={registerPath}
          className={cn(
            buttonVariants(),
            'inline-flex shrink-0 items-center gap-2 whitespace-nowrap',
          )}
        >
          <Plus className='size-4 shrink-0' />
          <span>{t('students.list.register')}</span>
        </Link>
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
                  <TableHead className='w-10' />
                  <TableHead>{t('students.columns.name')}</TableHead>
                  <TableHead>{t('students.columns.email')}</TableHead>
                  <TableHead>{t('students.columns.institution')}</TableHead>
                  <TableHead>{t('students.columns.level')}</TableHead>
                  <TableHead>{t('students.columns.specialty')}</TableHead>
                  <TableHead className='w-[80px] text-right'>
                    {t('students.columns.actions')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className='size-8 animate-pulse rounded-full bg-muted' />
                    </TableCell>
                    <TableCell>
                      <div className='h-4 w-36 animate-pulse rounded bg-muted' />
                    </TableCell>
                    <TableCell>
                      <div className='h-4 w-40 animate-pulse rounded bg-muted' />
                    </TableCell>
                    <TableCell>
                      <div className='h-4 w-20 animate-pulse rounded bg-muted' />
                    </TableCell>
                    <TableCell>
                      <div className='h-5 w-16 animate-pulse rounded-md bg-muted' />
                    </TableCell>
                    <TableCell>
                      <div className='h-4 w-12 animate-pulse rounded bg-muted' />
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
              {t('students.list.loadError')}
            </div>
          ) : rows.length === 0 ? (
            <div className='flex flex-col items-center gap-3 py-16 text-center'>
              <div className='flex size-14 items-center justify-center rounded-full bg-muted'>
                <GraduationCap className='size-7 text-muted-foreground' />
              </div>
              <p className='text-sm font-medium text-foreground'>
                {t('students.list.noStudents')}
              </p>
              <p className='text-xs text-muted-foreground'>
                {hasActiveFilters
                  ? t('students.list.noStudentsFiltered')
                  : t('students.list.noStudentsEmpty')}
              </p>
              {!hasActiveFilters && (
                <Link
                  to={registerPath}
                  className={cn(buttonVariants({ size: 'sm' }), 'gap-2')}
                >
                  <Plus className='size-4' />
                  {t('students.list.register')}
                </Link>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className='w-10' />
                  <TableHead className='min-w-[180px]'>
                    {t('students.columns.name')}
                  </TableHead>
                  <TableHead className='hidden sm:table-cell'>
                    {t('students.columns.email')}
                  </TableHead>
                  <TableHead>{t('students.columns.institution')}</TableHead>
                  <TableHead>{t('students.columns.level')}</TableHead>
                  <TableHead>{t('students.columns.specialty')}</TableHead>
                  <TableHead className='w-[80px] text-right'>
                    {t('students.columns.actions')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className='cursor-pointer hover:bg-muted/50 transition-colors'
                    onClick={() => navigate(detailPath(row.id))}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <div className='flex size-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground'>
                        {row.firstName.charAt(0).toUpperCase()}
                        {row.lastName.charAt(0).toUpperCase()}
                      </div>
                    </TableCell>
                    <TableCell className='font-medium'>
                      {row.lastName} {row.firstName}
                    </TableCell>
                    <TableCell className='hidden sm:table-cell text-muted-foreground text-sm'>
                      {row.email}
                    </TableCell>
                    <TableCell className='text-sm'>
                      {ETAB_LABEL[row.institution] ?? row.institution}
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium',
                          LEVEL_BADGE[row.level ?? ''] ??
                            'bg-muted text-foreground',
                        )}
                      >
                        {row.level}
                      </span>
                    </TableCell>
                    <TableCell className='text-sm text-muted-foreground'>
                      {row.specialty ?? '—'}
                    </TableCell>
                    <TableCell
                      className='text-right'
                      onClick={(e) => e.stopPropagation()}
                    >
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          className='inline-flex size-8 items-center justify-center rounded-lg hover:bg-muted'
                          aria-label='Actions'
                        >
                          <MoreVertical className='size-4' />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                          <DropdownMenuItem
                            onClick={() => navigate(detailPath(row.id))}
                          >
                            <Eye className='size-4' />
                            {t('students.actions.viewDetails')}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => navigate(editPath(row.id))}
                          >
                            <Pencil className='size-4' />
                            {t('common.edit')}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant='destructive'
                            onClick={() => handleDelete(row.id)}
                          >
                            <Trash2 className='size-4' />
                            {t('common.delete')}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              navigate(
                                `/assistant/supervisions?student=${row.id}`,
                              )
                            }
                          >
                            <BookOpen className='size-4' />
                            {t('students.actions.supervisions')}
                          </DropdownMenuItem>
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
            {t('students.list.total', { count: total })}
          </span>
          <div className='flex items-center gap-1'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className='whitespace-nowrap shrink-0 gap-1'
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
              className='whitespace-nowrap shrink-0 gap-1'
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
          filtersOpen ? 'translate-x-0' : 'translate-x-full',
        )}
        style={{ visibility: filtersOpen ? 'visible' : 'hidden' }}
      >
        <div className='flex h-full flex-col'>
          <div className='flex items-center justify-between border-b bg-primary/5 px-4 py-3'>
            <h2 className='font-semibold'>
              {t('common.filter')}
              {hasActiveFilters && (
                <span className='ml-1.5 text-xs font-normal text-muted-foreground'>
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
                {t('students.columns.institution')}
              </div>
              <div className='space-y-2'>
                {ETABLISSEMENTS.map((o) => (
                  <label
                    key={o.value}
                    className='flex items-center gap-2 cursor-pointer'
                  >
                    <input
                      type='checkbox'
                      checked={etablissementFilter.includes(o.value)}
                      onChange={() => toggleEtablissement(o.value)}
                      className='rounded border-input accent-primary'
                    />
                    <span className='text-sm'>{o.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <div className='mb-2 text-sm font-medium'>
                {t('students.columns.level')}
              </div>
              <div className='space-y-2'>
                {NIVEAUX.map((o) => (
                  <label
                    key={o.value}
                    className='flex items-center gap-2 cursor-pointer'
                  >
                    <input
                      type='checkbox'
                      checked={niveauFilter.includes(o.value)}
                      onChange={() => toggleNiveau(o.value)}
                      className='rounded border-input accent-primary'
                    />
                    <span className='text-sm'>{o.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <div className='mb-2 text-sm font-medium'>
                {t('students.columns.specialty')}
              </div>
              <div className='space-y-2'>
                {SPECIALITES.map((v) => (
                  <label
                    key={v}
                    className='flex items-center gap-2 cursor-pointer'
                  >
                    <input
                      type='checkbox'
                      checked={specialiteFilter.includes(v)}
                      onChange={() => toggleSpecialite(v)}
                      className='rounded border-input accent-primary'
                    />
                    <span className='text-sm'>{v}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className='flex gap-2 border-t p-4'>
            <Button
              onClick={() => {
                setFiltersOpen(false)
                setPage(1)
              }}
              className='flex-1'
            >
              {t('common.apply')}
            </Button>
            <Button
              variant='outline'
              onClick={() => {
                clearAllFilters()
                setFiltersOpen(false)
              }}
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

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        open={deleteTarget !== null}
        title={t('confirmDelete.students.title')}
        description={t('confirmDelete.students.description')}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
