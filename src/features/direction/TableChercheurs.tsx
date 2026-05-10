import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Search,
  SlidersHorizontal,
  X,
  ChevronLeft,
  ChevronRight,
  Users,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { AdminEmptyStatePanel } from '@/features/admin/components'
import { useChercheurs } from '@/features/chercheurs/hooks'
import { useSupervisions } from '@/features/supervisions/hooks/useSupervisions'
import {
  QUALITES,
  STATUTS,
  GRADES,
  QUALITE_LABELS,
  STATUT_LABELS,
  GRADE_LABELS,
} from '@/features/direction/chercheurModel'
import type {
  ChercheurRow,
  GradeRecherche,
  Qualite,
  StatutChercheur,
} from '@/features/direction/chercheurModel'
import { buildChercheurWorkloadRows } from '@/features/direction/lib/workloadFromSupervisions'
import {
  DIRECTOR_CHERCHEURS_LIMIT,
  DIRECTOR_SUPERVISIONS_LIMIT,
} from '@/features/direction/lib/directorFetchLimits'

export type { ChercheurRow, Qualite }
export { QUALITE_LABELS }

// ─── Chercheur Card ───────────────────────────────────────────────────────────

function ChercheurCard({
  r,
  labels,
}: {
  r: ChercheurRow
  labels: {
    viewProfile: string
    totalSupervisions: string
    inProgress: string
    pending: string
    done: string
  }
}) {
  const navigate = useNavigate()
  const initial =
    r.nom_complet
      .replace(/^(Dr\.|Pr\.)\s*/i, '')
      .trim()[0]
      ?.toUpperCase() ?? '?'

  return (
    <Card className='cursor-default rounded-xl border border-border/60 bg-card/80 shadow-none transition-all duration-200 hover:border-primary/20 hover:shadow-primary-sm'>
      <CardContent className='px-5 py-4'>
        <div className='grid w-full items-center gap-4 lg:grid-cols-[minmax(220px,1.8fr)_auto_1px_auto_1px_auto] lg:gap-6'>
          <div className='flex min-w-0 items-center gap-3'>
            <div className='flex size-[42px] shrink-0 items-center justify-center rounded-full bg-primary text-[17px] font-bold text-primary-foreground'>
              {initial}
            </div>
            <div>
              <p className='mb-0.5 text-[13px] font-semibold text-foreground'>
                {r.nom_complet}
              </p>
              <p className='text-[11px] text-muted-foreground'>
                {QUALITE_LABELS[r.qualite]}{' '}
                <button
                  type='button'
                  onClick={() =>
                    navigate(`/director/chercheurs/${r.chercheur_id}`)
                  }
                  className='font-semibold text-primary hover:underline'
                >
                  {labels.viewProfile}
                </button>
              </p>
            </div>
          </div>

          <div className='min-w-0 text-center lg:px-2'>
            <p className='text-3xl font-bold tabular-nums leading-none text-foreground'>
              {r.totalEncadrements}
            </p>
            <p className='mt-1 text-[11px] text-muted-foreground'>
              {labels.totalSupervisions}
            </p>
          </div>

          <div className='hidden h-12 w-px shrink-0 bg-border lg:block' />

          <div className='min-w-0 lg:px-2'>
            {[
              { label: labels.inProgress, value: r.enCours },
              { label: labels.pending, value: r.enAttente },
              { label: labels.done, value: r.termine },
            ].map((item) => (
              <div
                key={item.label}
                className='mb-px flex items-center justify-between gap-3'
              >
                <span className='text-[11px] text-muted-foreground'>
                  {item.label}
                </span>
                <span className='text-[11px] font-bold tabular-nums text-foreground'>
                  {item.value}
                </span>
              </div>
            ))}
          </div>

          <div className='hidden h-12 w-px shrink-0 bg-border lg:block' />

          <div className='grid min-w-0 grid-cols-4 gap-4 text-center lg:px-2'>
            {[
              { label: 'PFE', value: r.pfe },
              { label: 'Master', value: r.master },
              { label: 'Doctorat', value: r.doctorat },
              { label: 'Stage', value: r.stage },
            ].map((item) => (
              <div key={item.label} className='min-w-0'>
                <p className='text-xl font-bold tabular-nums leading-none text-foreground'>
                  {item.value}
                </p>
                <p className='mt-0.5 text-[10px] text-muted-foreground'>
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function workloadCharge(r: ChercheurRow): number {
  return r.pfe + r.master + r.doctorat + r.stage
}

const SELECT_TOOLBAR =
  'h-9 rounded-md border border-input bg-background px-2 text-sm shadow-sm transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 active:scale-[0.99]'

export default function TableChercheurs() {
  const { t } = useTranslation()
  const {
    data: chercheursPage,
    isLoading: chercheursLoading,
    isError: chercheursError,
  } = useChercheurs({ page: 1, limit: DIRECTOR_CHERCHEURS_LIMIT })
  const {
    data: supervisionsPage,
    isLoading: supervisionsLoading,
    isError: supervisionsError,
  } = useSupervisions({ page: 1, limit: DIRECTOR_SUPERVISIONS_LIMIT })

  const chercheurs = chercheursPage?.data ?? []
  const supervisions = supervisionsPage?.data ?? []
  const allRows = useMemo(
    () => buildChercheurWorkloadRows(chercheurs, supervisions),
    [chercheurs, supervisions],
  )
  const academicYearOptions = useMemo(() => {
    const ys = new Set(supervisions.map((s) => s.academicYear))
    return [...ys].sort((a, b) => a.localeCompare(b, 'fr'))
  }, [supervisions])
  const equipeOptions = useMemo(() => {
    const names = new Set(
      allRows.map((r) => r.equipe).filter((n) => n && n !== '—'),
    )
    return [...names].sort((a, b) => a.localeCompare(b, 'fr'))
  }, [allRows])

  const [searchQuery, setSearchQuery] = useState('')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [page, setPage] = useState(1)
  const perPage = 10

  const [periodDraft, setPeriodDraft] = useState('Tous')
  const [periodApplied, setPeriodApplied] = useState('Tous')
  const [typeDraft, setTypeDraft] = useState('Tous')
  const [typeApplied, setTypeApplied] = useState('Tous')
  const [statutEncDraft, setStatutEncDraft] = useState('Tous')
  const [statutEncApplied, setStatutEncApplied] = useState('Tous')
  const [equipeDraft, setEquipeDraft] = useState('Tous')
  const [equipeApplied, setEquipeApplied] = useState('Tous')

  // Filter state
  const [qualiteFilter, setQualiteFilter] = useState<Qualite[]>([])
  const [statutFilter, setStatutFilter] = useState<StatutChercheur[]>([])
  const [gradeFilter, setGradeFilter] = useState<GradeRecherche[]>([])

  const toggleQualite = (v: Qualite) =>
    setQualiteFilter((p) =>
      p.includes(v) ? p.filter((x) => x !== v) : [...p, v],
    )
  const toggleStatut = (v: StatutChercheur) =>
    setStatutFilter((p) =>
      p.includes(v) ? p.filter((x) => x !== v) : [...p, v],
    )
  const toggleGrade = (v: GradeRecherche) =>
    setGradeFilter((p) =>
      p.includes(v) ? p.filter((x) => x !== v) : [...p, v],
    )

  const hasActiveFilters =
    qualiteFilter.length > 0 ||
    statutFilter.length > 0 ||
    gradeFilter.length > 0

  const activeFilterLabels: { key: string; label: string }[] = []
  qualiteFilter.forEach((v) =>
    activeFilterLabels.push({
      key: `q-${v}`,
      label: `Qualité: ${QUALITE_LABELS[v]}`,
    }),
  )
  statutFilter.forEach((v) =>
    activeFilterLabels.push({
      key: `s-${v}`,
      label: `Statut: ${STATUT_LABELS[v]}`,
    }),
  )
  gradeFilter.forEach((v) =>
    activeFilterLabels.push({
      key: `g-${v}`,
      label: `Grade: ${GRADE_LABELS[v]}`,
    }),
  )

  const removeFilter = (key: string) => {
    if (key.startsWith('q-'))
      setQualiteFilter((p) => p.filter((x) => `q-${x}` !== key))
    else if (key.startsWith('s-'))
      setStatutFilter((p) => p.filter((x) => `s-${x}` !== key))
    else if (key.startsWith('g-'))
      setGradeFilter((p) => p.filter((x) => `g-${x}` !== key))
  }

  const clearAllFilters = () => {
    setQualiteFilter([])
    setStatutFilter([])
    setGradeFilter([])
    setPeriodDraft('Tous')
    setPeriodApplied('Tous')
    setTypeDraft('Tous')
    setTypeApplied('Tous')
    setStatutEncDraft('Tous')
    setStatutEncApplied('Tous')
    setEquipeDraft('Tous')
    setEquipeApplied('Tous')
    setPage(1)
  }

  function applyWorkloadFilters() {
    setPeriodApplied(periodDraft)
    setTypeApplied(typeDraft)
    setStatutEncApplied(statutEncDraft)
    setEquipeApplied(equipeDraft)
    setPage(1)
  }

  // ─── Filter + search logic ────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = allRows
    const q = searchQuery.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (r) =>
          r.nom_complet.toLowerCase().includes(q) ||
          r.chercheur_id.toLowerCase().includes(q) ||
          r.mails.some((m) => m.toLowerCase().includes(q)),
      )
    }
    if (qualiteFilter.length > 0)
      list = list.filter((r) => qualiteFilter.includes(r.qualite))
    if (statutFilter.length > 0)
      list = list.filter((r) => statutFilter.includes(r.statut))
    if (gradeFilter.length > 0)
      list = list.filter(
        (r) => r.grade_recherche && gradeFilter.includes(r.grade_recherche),
      )

    if (periodApplied !== 'Tous') {
      list = list.filter((r) => r.periodeFocus === periodApplied)
    }
    if (typeApplied !== 'Tous') {
      const key =
        typeApplied === 'PFE'
          ? 'pfe'
          : typeApplied === 'Master'
            ? 'master'
            : typeApplied === 'Doctorat'
              ? 'doctorat'
              : 'stage'
      list = list.filter((r) => r[key as 'pfe'] > 0)
    }
    if (statutEncApplied !== 'Tous') {
      if (statutEncApplied === 'En cours')
        list = list.filter((r) => r.enCours > 0)
      else if (statutEncApplied === 'En attente')
        list = list.filter((r) => r.enAttente > 0)
      else if (statutEncApplied === 'Terminé')
        list = list.filter((r) => r.termine > 0)
    }
    if (equipeApplied !== 'Tous') {
      list = list.filter((r) => r.equipe === equipeApplied)
    }

    return list
  }, [
    searchQuery,
    qualiteFilter,
    statutFilter,
    gradeFilter,
    periodApplied,
    typeApplied,
    statutEncApplied,
    equipeApplied,
    allRows,
  ])

  const loading = chercheursLoading || supervisionsLoading
  const failed = chercheursError || supervisionsError

  const total = filtered.length
  const totalPages = Math.max(1, Math.ceil(total / perPage))
  const currentPage = Math.min(page, totalPages)
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * perPage
    return filtered.slice(start, start + perPage)
  }, [filtered, currentPage, perPage])

  const cardLabels = {
    viewProfile: t('director.workload.viewProfile'),
    totalSupervisions: t('director.workload.totalSupervisions'),
    inProgress: t('director.workload.statusInProgress'),
    pending: t('director.workload.statusPending'),
    done: t('director.workload.statusDone'),
  }

  const cumulativeLoad = useMemo(
    () => filtered.reduce((acc, r) => acc + workloadCharge(r), 0),
    [filtered],
  )

  if (loading) {
    return (
      <div className='mx-auto max-w-4xl space-y-6'>
        <div className='h-8 w-48 animate-pulse rounded bg-muted' />
        <div className='h-4 w-full max-w-lg animate-pulse rounded bg-muted' />
        <div className='h-24 animate-pulse rounded-xl bg-muted' />
        <div className='space-y-3'>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className='h-28 animate-pulse rounded-xl bg-muted' />
          ))}
        </div>
      </div>
    )
  }

  if (failed) {
    return (
      <AdminEmptyStatePanel
        title={t('director.workload.loadErrorTitle', 'Chargement impossible')}
        description={t(
          'director.workload.loadErrorHint',
          'Vérifiez la connexion et que le serveur est joignable.',
        )}
        icon={Users}
      />
    )
  }

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-balance text-3xl font-semibold tracking-tight text-foreground'>
          {t('director.workload.title')}{' '}
          <span className='tabular-nums text-2xl font-semibold text-muted-foreground'>
            ({total})
          </span>
        </h1>
        <p className='mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground'>
          {t('director.workload.subtitle')}
        </p>
      </div>

      <Card className='rounded-xl border-border/60 bg-muted/25 shadow-none dark:bg-muted/15'>
        <CardContent className='py-3 text-sm text-muted-foreground'>
          {t('director.workload.summaryLine', {
            count: total,
            load: cumulativeLoad,
          })}
        </CardContent>
      </Card>

      <div className='flex flex-wrap items-center gap-3'>
        <div className='relative min-w-[200px] max-w-md flex-1'>
          <Search className='absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' />
          <Input
            placeholder={t('director.workload.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setPage(1)
            }}
            className='pl-9 text-sm transition-shadow focus-visible:ring-2 focus-visible:ring-ring/50'
          />
        </div>
        <Button
          variant='outline'
          onClick={() => setFiltersOpen(true)}
          className='inline-flex shrink-0 items-center gap-2 whitespace-nowrap text-sm transition-transform active:scale-[0.98]'
        >
          <SlidersHorizontal className='size-4 shrink-0' />
          <span>{t('director.workload.filterProfile')}</span>
        </Button>
      </div>

      <Card className='rounded-xl border-border/60 bg-card/90 shadow-sm'>
        <CardContent className='flex flex-col gap-4 py-5 sm:flex-row sm:flex-wrap sm:items-end'>
          <p className='w-full text-xs font-medium uppercase tracking-widest text-muted-foreground'>
            {t('director.workload.filterBarHint')}
          </p>
          <div className='grid w-full gap-3 sm:grid-cols-2 lg:grid-cols-4'>
            <div>
              <Label className='text-xs text-muted-foreground'>Période</Label>
              <select
                className={cn(SELECT_TOOLBAR, 'mt-1 w-full')}
                value={periodDraft}
                onChange={(e) => setPeriodDraft(e.target.value)}
              >
                <option value='Tous'>Toutes</option>
                {academicYearOptions.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label className='text-xs text-muted-foreground'>Type</Label>
              <select
                className={cn(SELECT_TOOLBAR, 'mt-1 w-full')}
                value={typeDraft}
                onChange={(e) => setTypeDraft(e.target.value)}
              >
                <option value='Tous'>Tous</option>
                <option value='PFE'>PFE</option>
                <option value='Master'>Master</option>
                <option value='Doctorat'>Doctorat</option>
                <option value='Stage'>Stage</option>
              </select>
            </div>
            <div>
              <Label className='text-xs text-muted-foreground'>
                État encadrement
              </Label>
              <select
                className={cn(SELECT_TOOLBAR, 'mt-1 w-full')}
                value={statutEncDraft}
                onChange={(e) => setStatutEncDraft(e.target.value)}
              >
                <option value='Tous'>Tous</option>
                <option value='En cours'>En cours</option>
                <option value='En attente'>En attente</option>
                <option value='Terminé'>Terminé</option>
              </select>
            </div>
            <div>
              <Label className='text-xs text-muted-foreground'>
                Équipe / axe
              </Label>
              <select
                className={cn(SELECT_TOOLBAR, 'mt-1 w-full')}
                value={equipeDraft}
                onChange={(e) => setEquipeDraft(e.target.value)}
              >
                <option value='Tous'>Toutes</option>
                {equipeOptions.map((team) => (
                  <option key={team} value={team}>
                    {team}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <Button
            type='button'
            className='w-full sm:w-auto sm:shrink-0'
            onClick={applyWorkloadFilters}
          >
            {t('common.filter')}
          </Button>
        </CardContent>
      </Card>

      {/* ── Active Filters ──────────────────────────────────────────────────── */}
      {hasActiveFilters && (
        <Card className='rounded-xl border-dashed border-primary/25 bg-primary/3'>
          <CardContent className='flex flex-wrap items-center gap-2 py-3'>
            <span className='text-sm text-muted-foreground'>
              Filtres actifs :
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
                  aria-label={`Supprimer ${label}`}
                >
                  <X className='size-3.5' />
                </button>
              </span>
            ))}
            <Button variant='ghost' size='sm' onClick={clearAllFilters}>
              Tout effacer
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ── Chercheur cards list ────────────────────────────────────────────── */}
      <div className='space-y-3'>
        {paginated.length === 0 ? (
          <AdminEmptyStatePanel
            title={t('director.workload.empty')}
            description={t(
              'director.workload.emptyHint',
              'Élargissez les critères ou réinitialisez les filtres.',
            )}
            icon={Users}
          />
        ) : (
          paginated.map((r) => (
            <ChercheurCard key={r.chercheur_id} r={r} labels={cardLabels} />
          ))
        )}
      </div>

      {/* ── Pagination ─────────────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <Card className='rounded-xl border-border/60'>
          <CardContent className='flex flex-wrap items-center justify-between gap-4 py-3'>
            <span className='text-sm text-muted-foreground'>
              {total} encadrant{total > 1 ? 's' : ''}
            </span>
            <div className='flex items-center gap-1'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className='whitespace-nowrap shrink-0 inline-flex items-center gap-1'
              >
                <ChevronLeft className='size-4 shrink-0' />
                <span>Précédent</span>
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Button
                  key={p}
                  variant={p === currentPage ? 'secondary' : 'ghost'}
                  size='sm'
                  className='min-w-8'
                  onClick={() => p !== currentPage && setPage(p)}
                  disabled={p === currentPage}
                >
                  {p}
                </Button>
              ))}
              <Button
                variant='outline'
                size='sm'
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className='whitespace-nowrap shrink-0 inline-flex items-center gap-1'
              >
                <span>Suivant</span>
                <ChevronRight className='size-4 shrink-0' />
              </Button>
            </div>
            <span className='text-sm text-muted-foreground'>
              ({currentPage} / {totalPages})
            </span>
          </CardContent>
        </Card>
      )}

      {/* ── Filter slide-over ───────────────────────────────────────────────── */}
      {filtersOpen ? (
        <button
          type='button'
          className='fixed inset-0 z-40 cursor-default bg-background/60 backdrop-blur-[2px] transition-opacity'
          aria-label='Fermer les filtres'
          onClick={() => setFiltersOpen(false)}
        />
      ) : null}
      <div
        className={cn(
          'fixed inset-y-0 right-0 z-50 w-full max-w-sm border-l border-border/80 bg-card shadow-2xl transition-transform duration-300 ease-out',
          filtersOpen
            ? 'translate-x-0'
            : 'translate-x-full pointer-events-none',
        )}
        aria-hidden={!filtersOpen}
      >
        <div className='flex h-full flex-col'>
          <div className='flex items-center justify-between border-b px-4 py-3'>
            <h2 className='font-semibold'>Filtres</h2>
            <Button
              variant='ghost'
              size='icon'
              onClick={() => setFiltersOpen(false)}
              aria-label='Fermer'
            >
              <X className='size-4' />
            </Button>
          </div>

          <div className='flex-1 overflow-y-auto p-4 space-y-6'>
            {/* Qualité */}
            <div>
              <div className='mb-2 text-sm font-medium'>Qualité</div>
              <div className='space-y-2'>
                {QUALITES.map((v) => (
                  <label
                    key={v}
                    className='flex items-center gap-2 cursor-pointer'
                  >
                    <input
                      type='checkbox'
                      checked={qualiteFilter.includes(v)}
                      onChange={() => toggleQualite(v)}
                      className='rounded border-input accent-primary'
                    />
                    <span className='text-sm'>{QUALITE_LABELS[v]}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Statut */}
            <div>
              <div className='mb-2 text-sm font-medium'>Statut</div>
              <div className='space-y-2'>
                {STATUTS.map((v) => (
                  <label
                    key={v}
                    className='flex items-center gap-2 cursor-pointer'
                  >
                    <input
                      type='checkbox'
                      checked={statutFilter.includes(v)}
                      onChange={() => toggleStatut(v)}
                      className='rounded border-input accent-primary'
                    />
                    <span className='text-sm'>{STATUT_LABELS[v]}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Grade */}
            <div>
              <div className='mb-2 text-sm font-medium'>Grade de recherche</div>
              <div className='space-y-2'>
                {GRADES.map((v) => (
                  <label
                    key={v}
                    className='flex items-center gap-2 cursor-pointer'
                  >
                    <input
                      type='checkbox'
                      checked={gradeFilter.includes(v)}
                      onChange={() => toggleGrade(v)}
                      className='rounded border-input accent-primary'
                    />
                    <span className='text-sm'>{GRADE_LABELS[v]}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className='border-t p-4'>
            <div className='flex gap-2'>
              <Button
                variant='outline'
                className='flex-1'
                onClick={clearAllFilters}
              >
                Réinitialiser
              </Button>
              <Button className='flex-1' onClick={() => setFiltersOpen(false)}>
                Appliquer
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
