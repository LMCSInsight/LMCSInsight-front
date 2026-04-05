import { useState, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
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
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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

// ─── Types ────────────────────────────────────────────────────────────────────

const ETABLISSEMENTS = ['ESI', 'Extérieur'] as const
const NIVEAUX = ['Master', 'Doctorant'] as const
const SPECIALITES = ['SIL', 'SID', 'SIT', 'SIQ'] as const
const NB_ENCADREMENTS = ['Un seul', 'Plusieurs'] as const

type Etablissement = (typeof ETABLISSEMENTS)[number]
type Niveau = (typeof NIVEAUX)[number]
type Specialite = (typeof SPECIALITES)[number]
type NbEncadrement = (typeof NB_ENCADREMENTS)[number]

interface StudentRow {
  id: string
  nom: string
  prenom: string
  email: string
  etablissement: Etablissement
  niveau: Niveau
  specialite: Specialite
  nbEncadrements: number
}

// ─── Mock data (25 students) ──────────────────────────────────────────────────

const MOCK_STUDENTS: StudentRow[] = [
  {
    id: '1',
    nom: 'Khelifi',
    prenom: 'Ali',
    email: 'oa_khelifi@esi.dz',
    etablissement: 'ESI',
    niveau: 'Master',
    specialite: 'SID',
    nbEncadrements: 2,
  },
  {
    id: '2',
    nom: 'Meziani',
    prenom: 'Sara',
    email: 'oa_khelifi@esi.dz',
    etablissement: 'ESI',
    niveau: 'Master',
    specialite: 'SID',
    nbEncadrements: 2,
  },
  {
    id: '3',
    nom: 'Benali',
    prenom: 'Youcef',
    email: 'oa_khelifi@esi.dz',
    etablissement: 'ESI',
    niveau: 'Master',
    specialite: 'SID',
    nbEncadrements: 2,
  },
  {
    id: '4',
    nom: 'Taleb',
    prenom: 'Amina',
    email: 'oa_khelifi@esi.dz',
    etablissement: 'ESI',
    niveau: 'Doctorant',
    specialite: 'SIQ',
    nbEncadrements: 3,
  },
  {
    id: '5',
    nom: 'Khelifi',
    prenom: 'Mohamed',
    email: 'oa_khelifi@esi.dz',
    etablissement: 'ESI',
    niveau: 'Master',
    specialite: 'SID',
    nbEncadrements: 2,
  },
  {
    id: '6',
    nom: 'Lahmar',
    prenom: 'Fatima',
    email: 'oa_khelifi@esi.dz',
    etablissement: 'ESI',
    niveau: 'Master',
    specialite: 'SID',
    nbEncadrements: 2,
  },
  {
    id: '7',
    nom: 'Bouzid',
    prenom: 'Karim',
    email: 'oa_khelifi@esi.dz',
    etablissement: 'ESI',
    niveau: 'Master',
    specialite: 'SIT',
    nbEncadrements: 1,
  },
  {
    id: '8',
    nom: 'Cherif',
    prenom: 'Nadia',
    email: 'oa_khelifi@esi.dz',
    etablissement: 'ESI',
    niveau: 'Master',
    specialite: 'SID',
    nbEncadrements: 2,
  },
  {
    id: '9',
    nom: 'Mokhtar',
    prenom: 'Hamza',
    email: 'oa_khelifi@esi.dz',
    etablissement: 'Extérieur',
    niveau: 'Master',
    specialite: 'SIL',
    nbEncadrements: 1,
  },
  {
    id: '10',
    nom: 'Arous',
    prenom: 'Sami',
    email: 'oa_khelifi@esi.dz',
    etablissement: 'ESI',
    niveau: 'Doctorant',
    specialite: 'SIQ',
    nbEncadrements: 4,
  },
  {
    id: '11',
    nom: 'Amrani',
    prenom: 'Leila',
    email: 'oa_khelifi@esi.dz',
    etablissement: 'ESI',
    niveau: 'Master',
    specialite: 'SID',
    nbEncadrements: 2,
  },
  {
    id: '12',
    nom: 'Djemai',
    prenom: 'Omar',
    email: 'oa_khelifi@esi.dz',
    etablissement: 'Extérieur',
    niveau: 'Master',
    specialite: 'SIL',
    nbEncadrements: 1,
  },
  {
    id: '13',
    nom: 'Bensaad',
    prenom: 'Yasmine',
    email: 'oa_khelifi@esi.dz',
    etablissement: 'ESI',
    niveau: 'Doctorant',
    specialite: 'SIT',
    nbEncadrements: 3,
  },
  {
    id: '14',
    nom: 'Mansouri',
    prenom: 'Rafik',
    email: 'oa_khelifi@esi.dz',
    etablissement: 'ESI',
    niveau: 'Master',
    specialite: 'SID',
    nbEncadrements: 2,
  },
  {
    id: '15',
    nom: 'Ferhat',
    prenom: 'Ines',
    email: 'oa_khelifi@esi.dz',
    etablissement: 'ESI',
    niveau: 'Master',
    specialite: 'SID',
    nbEncadrements: 2,
  },
  {
    id: '16',
    nom: 'Kaddour',
    prenom: 'Anis',
    email: 'oa_khelifi@esi.dz',
    etablissement: 'Extérieur',
    niveau: 'Master',
    specialite: 'SIL',
    nbEncadrements: 1,
  },
  {
    id: '17',
    nom: 'Hamdi',
    prenom: 'Salma',
    email: 'oa_khelifi@esi.dz',
    etablissement: 'ESI',
    niveau: 'Master',
    specialite: 'SID',
    nbEncadrements: 2,
  },
  {
    id: '18',
    nom: 'Chouiter',
    prenom: 'Nabil',
    email: 'oa_khelifi@esi.dz',
    etablissement: 'ESI',
    niveau: 'Doctorant',
    specialite: 'SIQ',
    nbEncadrements: 4,
  },
  {
    id: '19',
    nom: 'Meziane',
    prenom: 'Dalia',
    email: 'oa_khelifi@esi.dz',
    etablissement: 'Extérieur',
    niveau: 'Master',
    specialite: 'SIT',
    nbEncadrements: 1,
  },
  {
    id: '20',
    nom: 'Khelifi',
    prenom: 'Walid',
    email: 'oa_khelifi@esi.dz',
    etablissement: 'ESI',
    niveau: 'Master',
    specialite: 'SID',
    nbEncadrements: 2,
  },
  {
    id: '21',
    nom: 'Belkadi',
    prenom: 'Samira',
    email: 'oa_khelifi@esi.dz',
    etablissement: 'ESI',
    niveau: 'Master',
    specialite: 'SID',
    nbEncadrements: 2,
  },
  {
    id: '22',
    nom: 'Boussaha',
    prenom: 'Tarek',
    email: 'oa_khelifi@esi.dz',
    etablissement: 'Extérieur',
    niveau: 'Master',
    specialite: 'SIL',
    nbEncadrements: 1,
  },
  {
    id: '23',
    nom: 'Slimani',
    prenom: 'Houda',
    email: 'oa_khelifi@esi.dz',
    etablissement: 'ESI',
    niveau: 'Doctorant',
    specialite: 'SIQ',
    nbEncadrements: 3,
  },
  {
    id: '24',
    nom: 'Ziani',
    prenom: 'Ibrahim',
    email: 'oa_khelifi@esi.dz',
    etablissement: 'Extérieur',
    niveau: 'Master',
    specialite: 'SIT',
    nbEncadrements: 1,
  },
  {
    id: '25',
    nom: 'Benali',
    prenom: 'Farida',
    email: 'oa_khelifi@esi.dz',
    etablissement: 'ESI',
    niveau: 'Master',
    specialite: 'SID',
    nbEncadrements: 2,
  },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function StudentManagementPage() {
  const { userId } = useParams<{ userId: string }>()

  const [searchQuery, setSearchQuery] = useState('')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  // Filter state
  const [etablissementFilter, setEtablissementFilter] = useState<
    Etablissement[]
  >([])
  const [niveauFilter, setNiveauFilter] = useState<Niveau[]>([])
  const [specialiteFilter, setSpecialiteFilter] = useState<Specialite[]>([])
  const [nbEncadrementFilter, setNbEncadrementFilter] = useState<
    NbEncadrement[]
  >([])

  const toggleEtablissement = (v: Etablissement) =>
    setEtablissementFilter((p) =>
      p.includes(v) ? p.filter((x) => x !== v) : [...p, v],
    )
  const toggleNiveau = (v: Niveau) =>
    setNiveauFilter((p) =>
      p.includes(v) ? p.filter((x) => x !== v) : [...p, v],
    )
  const toggleSpecialite = (v: Specialite) =>
    setSpecialiteFilter((p) =>
      p.includes(v) ? p.filter((x) => x !== v) : [...p, v],
    )
  const toggleNbEncadrement = (v: NbEncadrement) =>
    setNbEncadrementFilter((p) =>
      p.includes(v) ? p.filter((x) => x !== v) : [...p, v],
    )

  const hasActiveFilters =
    etablissementFilter.length > 0 ||
    niveauFilter.length > 0 ||
    specialiteFilter.length > 0 ||
    nbEncadrementFilter.length > 0

  const activeFilterLabels: { key: string; label: string }[] = []
  etablissementFilter.forEach((v) =>
    activeFilterLabels.push({ key: `etab-${v}`, label: `Établissement: ${v}` }),
  )
  niveauFilter.forEach((v) =>
    activeFilterLabels.push({ key: `niv-${v}`, label: `Niveau: ${v}` }),
  )
  specialiteFilter.forEach((v) =>
    activeFilterLabels.push({ key: `spe-${v}`, label: `Spécialité: ${v}` }),
  )
  nbEncadrementFilter.forEach((v) =>
    activeFilterLabels.push({ key: `nb-${v}`, label: `Encadrements: ${v}` }),
  )

  const removeFilter = (key: string) => {
    if (key.startsWith('etab-'))
      setEtablissementFilter((p) => p.filter((x) => `etab-${x}` !== key))
    else if (key.startsWith('niv-'))
      setNiveauFilter((p) => p.filter((x) => `niv-${x}` !== key))
    else if (key.startsWith('spe-'))
      setSpecialiteFilter((p) => p.filter((x) => `spe-${x}` !== key))
    else if (key.startsWith('nb-'))
      setNbEncadrementFilter((p) => p.filter((x) => `nb-${x}` !== key))
  }

  const clearAllFilters = () => {
    setEtablissementFilter([])
    setNiveauFilter([])
    setSpecialiteFilter([])
    setNbEncadrementFilter([])
    setPage(1)
  }

  const applyFiltersFromPanel = () => {
    setFiltersOpen(false)
    setPage(1)
  }

  const resetPanelFilters = () => {
    setEtablissementFilter([])
    setNiveauFilter([])
    setSpecialiteFilter([])
    setNbEncadrementFilter([])
    setPage(1)
    setFiltersOpen(false)
  }

  // ─── Filtering logic ───────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    let list = MOCK_STUDENTS
    const q = searchQuery.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (r) =>
          r.nom.toLowerCase().includes(q) ||
          r.prenom.toLowerCase().includes(q) ||
          r.email.toLowerCase().includes(q) ||
          r.specialite.toLowerCase().includes(q) ||
          r.etablissement.toLowerCase().includes(q),
      )
    }
    if (etablissementFilter.length > 0)
      list = list.filter((r) => etablissementFilter.includes(r.etablissement))
    if (niveauFilter.length > 0)
      list = list.filter((r) => niveauFilter.includes(r.niveau))
    if (specialiteFilter.length > 0)
      list = list.filter((r) => specialiteFilter.includes(r.specialite))
    if (nbEncadrementFilter.length > 0) {
      list = list.filter((r) => {
        if (nbEncadrementFilter.includes('Un seul') && r.nbEncadrements === 1)
          return true
        if (nbEncadrementFilter.includes('Plusieurs') && r.nbEncadrements > 1)
          return true
        return false
      })
    }
    return list
  }, [
    searchQuery,
    etablissementFilter,
    niveauFilter,
    specialiteFilter,
    nbEncadrementFilter,
  ])

  const totalFiltered = filtered.length
  const totalPages = Math.max(1, Math.ceil(totalFiltered / perPage))
  const currentPage = Math.min(page, totalPages)

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * perPage
    return filtered.slice(start, start + perPage)
  }, [filtered, currentPage, perPage])

  function handleDelete(id: string) {
    // TODO: useMutation → studentApi.deleteStudent(id)
    console.log('Delete student', id)
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className='space-y-4'>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div>
        <h1 className='text-2xl font-semibold tracking-tight'>
          Mes Etudiant ({totalFiltered} total)
        </h1>
      </div>

      {/* ── Toolbar ────────────────────────────────────────────────────────── */}
      <div className='flex flex-wrap items-center gap-3'>
        <div className='relative flex-1 min-w-[200px] max-w-md'>
          <Search className='absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' />
          <Input
            placeholder="Recherche par titre, mots-clés, nom de l'étudiant..."
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
          <span>Filtrer</span>
        </Button>
        <Button
          asChild
          className='inline-flex shrink-0 items-center gap-2 whitespace-nowrap'
        >
          <Link
            to={userId ? `/researcher/${userId}/students/register` : '#'}
            className='inline-flex items-center gap-2'
          >
            <Plus className='size-4 shrink-0' />
            <span>Ajouter un nouveau</span>
          </Link>
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

      {/* ── Table ──────────────────────────────────────────────────────────── */}
      <Card>
        <div className='overflow-x-auto'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom et Prénom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Établissement</TableHead>
                <TableHead>Niveau</TableHead>
                <TableHead>Spécialité</TableHead>
                <TableHead className='text-center'>Nb Encadrements</TableHead>
                <TableHead className='w-[80px] text-right'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className='font-medium'>
                    {row.nom} {row.prenom}
                  </TableCell>
                  <TableCell className='text-muted-foreground'>
                    {row.email}
                  </TableCell>
                  <TableCell>{row.etablissement}</TableCell>
                  <TableCell>{row.niveau}</TableCell>
                  <TableCell>{row.specialite}</TableCell>
                  <TableCell className='text-center'>
                    {row.nbEncadrements}
                  </TableCell>
                  <TableCell className='text-right'>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='size-8'
                          aria-label='Actions'
                        >
                          <MoreVertical className='size-4' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end'>
                        <DropdownMenuItem asChild>
                          <Link
                            to={
                              userId
                                ? `/researcher/${userId}/students/${row.id}`
                                : '#'
                            }
                            className='flex items-center gap-2'
                          >
                            <Eye className='size-4' />
                            Voir détails
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link
                            to={
                              userId
                                ? `/researcher/${userId}/students/${row.id}/edit`
                                : '#'
                            }
                            className='flex items-center gap-2'
                          >
                            <Pencil className='size-4' />
                            Modifier
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className='flex items-center gap-2 text-destructive focus:text-destructive'
                          onClick={() => handleDelete(row.id)}
                        >
                          <Trash2 className='size-4' />
                          Supprimer
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link
                            to={
                              userId
                                ? `/researcher/${userId}/supervisions?student=${row.id}`
                                : '#'
                            }
                            className='flex items-center gap-2'
                          >
                            <BookOpen className='size-4' />
                            Voir Encadrement
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* ── Pagination ─────────────────────────────────────────────────────── */}
      <Card>
        <CardContent className='flex flex-wrap items-center justify-between gap-4 py-3'>
          <div className='flex items-center gap-2'>
            <span className='text-sm text-muted-foreground'>
              Éléments par page :
            </span>
            <select
              value={perPage}
              onChange={(e) => {
                setPerPage(Number(e.target.value))
                setPage(1)
              }}
              className='rounded-md border bg-background px-2 py-1.5 text-sm'
            >
              {[5, 10, 25, 50].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
          <div className='flex items-center gap-1'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className='whitespace-nowrap shrink-0 inline-flex items-center gap-1'
            >
              <ChevronLeft className='size-4 shrink-0' />
              <span>avant</span>
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
              <span>suivant</span>
              <ChevronRight className='size-4 shrink-0' />
            </Button>
          </div>
          <span className='text-sm text-muted-foreground'>
            ({currentPage} sur {totalPages})
          </span>
        </CardContent>
      </Card>

      {/* ── Filters slide-over panel ────────────────────────────────────────── */}
      <div
        className={cn(
          'fixed inset-y-0 right-0 z-50 w-full max-w-sm border-l bg-card shadow-lg transition-transform duration-200 ease-out',
          filtersOpen ? 'translate-x-0' : 'translate-x-full',
        )}
        style={{ visibility: filtersOpen ? 'visible' : 'hidden' }}
      >
        <div className='flex h-full flex-col'>
          {/* Panel header */}
          <div className='flex items-center justify-between border-b px-4 py-3'>
            <h2 className='font-semibold'>Filters</h2>
            <Button
              variant='ghost'
              size='icon'
              onClick={() => setFiltersOpen(false)}
              aria-label='Fermer'
            >
              <X className='size-4' />
            </Button>
          </div>

          {/* Panel body */}
          <div className='flex-1 overflow-y-auto p-4 space-y-6'>
            {/* Établissement */}
            <div>
              <div className='mb-2 text-sm font-medium'>Établissement</div>
              <div className='space-y-2'>
                {ETABLISSEMENTS.map((v) => (
                  <label
                    key={v}
                    className='flex items-center gap-2 cursor-pointer'
                  >
                    <input
                      type='checkbox'
                      checked={etablissementFilter.includes(v)}
                      onChange={() => toggleEtablissement(v)}
                      className='rounded border-input'
                    />
                    <span className='text-sm'>{v}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Niveau */}
            <div>
              <div className='mb-2 text-sm font-medium'>Niveau</div>
              <div className='space-y-2'>
                {NIVEAUX.map((v) => (
                  <label
                    key={v}
                    className='flex items-center gap-2 cursor-pointer'
                  >
                    <input
                      type='checkbox'
                      checked={niveauFilter.includes(v)}
                      onChange={() => toggleNiveau(v)}
                      className='rounded border-input'
                    />
                    <span className='text-sm'>{v}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Spécialité */}
            <div>
              <div className='mb-2 text-sm font-medium'>Spécialité</div>
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
                      className='rounded border-input'
                    />
                    <span className='text-sm'>{v}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Nb Encadrements */}
            <div>
              <div className='mb-2 text-sm font-medium'>Nb Encadrements</div>
              <div className='space-y-2'>
                {NB_ENCADREMENTS.map((v) => (
                  <label
                    key={v}
                    className='flex items-center gap-2 cursor-pointer'
                  >
                    <input
                      type='checkbox'
                      checked={nbEncadrementFilter.includes(v)}
                      onChange={() => toggleNbEncadrement(v)}
                      className='rounded border-input'
                    />
                    <span className='text-sm'>{v}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Panel footer */}
          <div className='flex gap-2 border-t p-4'>
            <Button
              onClick={applyFiltersFromPanel}
              className='flex-1 shrink-0 whitespace-nowrap inline-flex items-center justify-center gap-2'
            >
              Apply Filters
            </Button>
            <Button
              variant='outline'
              onClick={resetPanelFilters}
              className='shrink-0 whitespace-nowrap'
            >
              Reset
            </Button>
          </div>
        </div>
      </div>

      {/* Backdrop */}
      {filtersOpen && (
        <button
          type='button'
          className='fixed inset-0 z-40 bg-black/20'
          aria-label='Fermer les filtres'
          onClick={() => setFiltersOpen(false)}
        />
      )}
    </div>
  )
}
