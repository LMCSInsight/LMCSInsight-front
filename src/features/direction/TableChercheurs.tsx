import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  SlidersHorizontal,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

// ─── Visual Identity ──────────────────────────────────────────────────────────
const C = {
  navy: '#21334E',
  blue: '#11499A',
  lightBlue: '#EBF1F9',
  bg: '#F5F5F5',
  white: '#FFFFFF',
  muted: '#6b7280',
  border: '#e5e7eb',
}
const FONT = "'Outfit', sans-serif"

// ─── Types (from Chercheur DB model) ─────────────────────────────────────────

type Qualite =
  | 'Professeur'
  | 'Maitre_de_conferences'
  | 'Maitre_assistant'
  | 'Attache_temporaire'
type GradeRecherche =
  | 'Directeur_de_recherche'
  | 'Maitre_de_recherche'
  | 'Charge_de_recherche'
  | 'Attache_de_recherche'
type StatutChercheur = 'Actif' | 'Inactif' | 'Retraite'

const QUALITES: Qualite[] = [
  'Professeur',
  'Maitre_de_conferences',
  'Maitre_assistant',
  'Attache_temporaire',
]
const STATUTS: StatutChercheur[] = ['Actif', 'Inactif', 'Retraite']
const GRADES: GradeRecherche[] = [
  'Directeur_de_recherche',
  'Maitre_de_recherche',
  'Charge_de_recherche',
  'Attache_de_recherche',
]

const QUALITE_LABELS: Record<Qualite, string> = {
  Professeur: 'Professeur',
  Maitre_de_conferences: 'Maître de conférences',
  Maitre_assistant: 'Maître assistant',
  Attache_temporaire: 'Attaché temporaire',
}
const STATUT_LABELS: Record<StatutChercheur, string> = {
  Actif: 'Actif',
  Inactif: 'Inactif',
  Retraite: 'Retraité',
}
const GRADE_LABELS: Record<GradeRecherche, string> = {
  Directeur_de_recherche: 'Directeur de recherche',
  Maitre_de_recherche: 'Maître de recherche',
  Charge_de_recherche: 'Chargé de recherche',
  Attache_de_recherche: 'Attaché de recherche',
}

interface ChercheurRow {
  chercheur_id: string
  nom_complet: string
  mails: string[]
  tel?: string
  diplome?: string
  etablissement_origine?: string
  qualite: Qualite
  grade_recherche?: GradeRecherche
  statut: StatutChercheur
  hindex: number
  // computed supervision stats (would come from API join)
  totalEncadrements: number
  enCours: number
  enAttente: number
  termine: number
  pfe: number
  master: number
  doctorat: number
  stage: number
}

// ─── Mock data (25 chercheurs) ────────────────────────────────────────────────

const MOCK_CHERCHEURS: ChercheurRow[] = Array.from({ length: 25 }, (_, i) => ({
  chercheur_id: `ESI-${String(i + 1).padStart(4, '0')}`,
  nom_complet: [
    'Dr.Boualem Khalouat',
    'Pr.Amina Taleb',
    'Dr.Karim Bouzid',
    'Pr.Sara Meziani',
    'Dr.Youcef Benali',
  ][i % 5],
  mails: [`chercheur${i + 1}@esi.dz`],
  tel: `+213 5${String(i).padStart(8, '0')}`,
  diplome: ["Doctorat d'État", 'PhD', 'Magistère'][i % 3],
  etablissement_origine: ['ESI', 'USTHB', 'USTO', 'ENP'][i % 4],
  qualite: QUALITES[i % 4],
  grade_recherche: GRADES[i % 4],
  statut: i % 7 === 0 ? 'Inactif' : 'Actif',
  hindex: Math.floor(Math.random() * 20) + 1,
  totalEncadrements: 27,
  enCours: 12,
  enAttente: 5,
  termine: 10,
  pfe: 3,
  master: 8,
  doctorat: 2,
  stage: 12,
}))

// ─── Chercheur Card ───────────────────────────────────────────────────────────

function ChercheurCard({ r }: { r: ChercheurRow }) {
  const navigate = useNavigate()
  const initial =
    r.nom_complet
      .replace(/^(Dr\.|Pr\.)\s*/i, '')
      .trim()[0]
      ?.toUpperCase() ?? '?'

  return (
    <Card
      style={{
        background: C.white,
        border: 'none',
        borderRadius: 10,
        boxShadow: '0 1px 4px rgba(33,51,78,0.07)',
        cursor: 'default',
        fontFamily: FONT,
      }}
    >
      <CardContent className='px-5 py-4'>
        <div className='grid w-full items-center gap-4 lg:grid-cols-[minmax(220px,1.8fr)_auto_1px_auto_1px_auto] lg:gap-6'>
          {/* ── Avatar + name ──────────────────────────────────────────── */}
          <div className='flex min-w-0 items-center gap-3'>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: '50%',
                background: C.navy,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  color: C.white,
                  fontWeight: 700,
                  fontSize: 17,
                  fontFamily: FONT,
                }}
              >
                {initial}
              </span>
            </div>
            <div>
              <p
                style={{
                  fontWeight: 700,
                  fontSize: 13,
                  color: C.navy,
                  fontFamily: FONT,
                  marginBottom: 2,
                }}
              >
                {r.nom_complet}
              </p>
              <p style={{ fontSize: 11, color: C.muted, fontFamily: FONT }}>
                {QUALITE_LABELS[r.qualite]}{' '}
                <button
                  type='button'
                  onClick={() =>
                    navigate(`/director/chercheurs/${r.chercheur_id}`)
                  }
                  style={{
                    color: C.blue,
                    fontWeight: 600,
                    fontSize: 11,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    fontFamily: FONT,
                  }}
                >
                  Voir Profile
                </button>
              </p>
            </div>
          </div>

          {/* ── Total encadrements ─────────────────────────────────────── */}
          <div className='min-w-0 text-center lg:px-2'>
            <p
              style={{
                fontSize: 30,
                fontWeight: 800,
                color: C.navy,
                fontFamily: FONT,
                lineHeight: 1,
              }}
            >
              {r.totalEncadrements}
            </p>
            <p
              style={{
                fontSize: 11,
                color: C.muted,
                fontFamily: FONT,
                marginTop: 3,
              }}
            >
              Encadrements totaux
            </p>
          </div>

          {/* ── Divider ────────────────────────────────────────────────── */}
          <div className='hidden h-12 w-px shrink-0 bg-border lg:block' />

          {/* ── Status breakdown ───────────────────────────────────────── */}
          <div className='min-w-0 lg:px-2'>
            {[
              { label: 'En cours', value: r.enCours },
              { label: 'En attent', value: r.enAttente },
              { label: 'Terminé', value: r.termine },
            ].map((item) => (
              <div
                key={item.label}
                className='flex items-center justify-between'
                style={{ marginBottom: 1 }}
              >
                <span
                  style={{
                    fontSize: 11,
                    color: C.muted,
                    fontFamily: FONT,
                    marginRight: 12,
                  }}
                >
                  {item.label}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: C.navy,
                    fontFamily: FONT,
                  }}
                >
                  {item.value}
                </span>
              </div>
            ))}
          </div>

          {/* ── Divider ────────────────────────────────────────────────── */}
          <div className='hidden h-12 w-px shrink-0 bg-border lg:block' />

          {/* ── Type breakdown ─────────────────────────────────────────── */}
          <div className='grid min-w-0 grid-cols-4 gap-4 text-center lg:px-2'>
            {[
              { label: 'PFE', value: r.pfe },
              { label: 'Master', value: r.master },
              { label: 'Doctorat', value: r.doctorat },
              { label: 'Stage', value: r.stage },
            ].map((item) => (
              <div key={item.label} className='min-w-0'>
                <p
                  style={{
                    fontSize: 20,
                    fontWeight: 800,
                    color: C.navy,
                    fontFamily: FONT,
                    lineHeight: 1,
                  }}
                >
                  {item.value}
                </p>
                <p
                  style={{
                    fontSize: 10,
                    color: C.muted,
                    fontFamily: FONT,
                    marginTop: 2,
                  }}
                >
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

export default function TableChercheurs() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [page, setPage] = useState(1)
  const perPage = 10

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
    setPage(1)
  }

  // ─── Filter + search logic ────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = MOCK_CHERCHEURS
    const q = searchQuery.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (r) =>
          r.nom_complet.toLowerCase().includes(q) ||
          r.chercheur_id.toLowerCase().includes(q) ||
          r.mails.some((m) => m.toLowerCase().includes(q)) ||
          (r.etablissement_origine?.toLowerCase().includes(q) ?? false),
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
    return list
  }, [searchQuery, qualiteFilter, statutFilter, gradeFilter])

  const total = filtered.length
  const totalPages = Math.max(1, Math.ceil(total / perPage))
  const currentPage = Math.min(page, totalPages)
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * perPage
    return filtered.slice(start, start + perPage)
  }, [filtered, currentPage, perPage])

  return (
    <div className='space-y-4' style={{ fontFamily: FONT }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');`}</style>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div>
        <h1
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: C.navy,
            fontFamily: FONT,
            marginBottom: 2,
          }}
        >
          Les Encadrants ({total} total)
        </h1>
      </div>

      {/* ── Toolbar ────────────────────────────────────────────────────────── */}
      <div className='flex flex-wrap items-center gap-3'>
        <div className='relative flex-1 min-w-[200px] max-w-md'>
          <Search className='absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' />
          <Input
            placeholder="Recherche par titre, mots-clés, nom de l'Encadrant..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setPage(1)
            }}
            className='pl-9'
            style={{ fontFamily: FONT, fontSize: 13 }}
          />
        </div>
        <Button
          variant='outline'
          onClick={() => setFiltersOpen(true)}
          className='inline-flex shrink-0 items-center gap-2 whitespace-nowrap'
          style={{ fontFamily: FONT, fontSize: 13 }}
        >
          <SlidersHorizontal className='size-4 shrink-0' />
          <span>Filtrer</span>
        </Button>
      </div>

      {/* ── Active Filters ──────────────────────────────────────────────────── */}
      {hasActiveFilters && (
        <Card>
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
          <Card>
            <CardContent className='py-16 text-center'>
              <p style={{ fontSize: 14, color: C.muted, fontFamily: FONT }}>
                Aucun encadrant trouvé.
              </p>
            </CardContent>
          </Card>
        ) : (
          paginated.map((r) => <ChercheurCard key={r.chercheur_id} r={r} />)
        )}
      </div>

      {/* ── Pagination ─────────────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <Card>
          <CardContent className='flex flex-wrap items-center justify-between gap-4 py-3'>
            <span
              className='text-sm text-muted-foreground'
              style={{ fontFamily: FONT }}
            >
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
            <span
              className='text-sm text-muted-foreground'
              style={{ fontFamily: FONT }}
            >
              ({currentPage} / {totalPages})
            </span>
          </CardContent>
        </Card>
      )}

      {/* ── Filter slide-over ───────────────────────────────────────────────── */}
      <div
        className={cn(
          'fixed inset-y-0 right-0 z-50 w-full max-w-sm border-l bg-card shadow-lg transition-transform duration-200 ease-out',
          filtersOpen ? 'translate-x-0 visible' : 'translate-x-full invisible',
        )}
      >
        <div className='flex h-full flex-col'>
          <div className='flex items-center justify-between border-b px-4 py-3'>
            <h2 className='font-semibold' style={{ fontFamily: FONT }}>
              Filtres
            </h2>
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
              <div
                className='mb-2 text-sm font-medium'
                style={{ fontFamily: FONT }}
              >
                Qualité
              </div>
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
                    <span className='text-sm' style={{ fontFamily: FONT }}>
                      {QUALITE_LABELS[v]}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Statut */}
            <div>
              <div
                className='mb-2 text-sm font-medium'
                style={{ fontFamily: FONT }}
              >
                Statut
              </div>
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
                    <span className='text-sm' style={{ fontFamily: FONT }}>
                      {STATUT_LABELS[v]}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Grade */}
            <div>
              <div
                className='mb-2 text-sm font-medium'
                style={{ fontFamily: FONT }}
              >
                Grade de recherche
              </div>
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
                    <span className='text-sm' style={{ fontFamily: FONT }}>
                      {GRADE_LABELS[v]}
                    </span>
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
