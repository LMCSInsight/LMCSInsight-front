import { useMemo, useState } from 'react'
import {
  BarChart3,
  Clock,
  GraduationCap,
  Hourglass,
  Users,
  TrendingUp,
  FileSpreadsheet,
  FileText,
  Filter,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { useSupervisions } from '@/features/supervisions/hooks/useSupervisions'
import { useStudents } from '@/features/students/hooks'

// ─── Label maps ───────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<string, string> = {
  IN_PROGRESS: 'En cours',
  DEFENDED: 'Soutenu',
  ABANDONED: 'Abandonné',
  EXTENSION: 'Prolongation',
  SUSPENDED: 'Suspendu',
}
const TYPE_LABELS: Record<string, string> = {
  PFE: 'PFE',
  MASTER: 'Master',
  PHD: 'Doctorat',
  INTERNSHIP: 'Stage (SPE)',
  PROJECT: 'Projet de recherche',
}
const VALIDATION_LABELS: Record<string, string> = {
  PENDING: 'En attente',
  VALIDATED: 'Validé',
  REJECTED: 'Refusé',
  REVISED: 'Révisé',
}

const CHART_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
]
const VALIDATION_COLORS: Record<string, string> = {
  PENDING: 'var(--chart-1)',
  VALIDATED: 'var(--chart-2)',
  REJECTED: 'var(--chart-3)',
  REVISED: 'var(--chart-4)',
}

const VALIDATION_BADGE: Record<
  string,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  PENDING: 'outline',
  VALIDATED: 'default',
  REJECTED: 'destructive',
  REVISED: 'secondary',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(iso?: string | null): string {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('fr-DZ')
}

function countBy(arr: string[]): { name: string; value: number }[] {
  const map: Record<string, number> = {}
  arr.forEach((v) => {
    map[v] = (map[v] ?? 0) + 1
  })
  return Object.entries(map).map(([name, value]) => ({ name, value }))
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({
  title,
  value,
  sub,
  icon: Icon,
  featured,
}: {
  title: string
  value: string | number
  sub?: string
  icon: React.ElementType
  featured?: boolean
}) {
  if (featured) {
    return (
      <Card className='bg-primary text-primary-foreground shadow-primary border-0'>
        <CardHeader className='flex flex-row items-center justify-between pb-2'>
          <CardTitle className='text-sm font-medium text-primary-foreground/70'>
            {title}
          </CardTitle>
          <Icon className='size-4 text-primary-foreground/70' />
        </CardHeader>
        <CardContent>
          <div className='text-3xl font-bold tabular'>{value}</div>
          {sub && (
            <p className='text-xs text-primary-foreground/60 mt-1'>{sub}</p>
          )}
        </CardContent>
      </Card>
    )
  }
  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between pb-2'>
        <CardTitle className='text-sm font-medium text-muted-foreground'>
          {title}
        </CardTitle>
        <Icon className='size-4 text-muted-foreground' />
      </CardHeader>
      <CardContent>
        <div className='text-2xl font-bold tabular'>{value}</div>
        {sub && <p className='text-xs text-muted-foreground mt-1'>{sub}</p>}
      </CardContent>
    </Card>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function StatisticsReportsPage() {
  const { data: supPage, isLoading: loadingSup } = useSupervisions({
    limit: 500,
  })
  const { data: studPage, isLoading: loadingStud } = useStudents({ limit: 500 })

  const allSupervisions = supPage?.data ?? []
  const allStudents = studPage?.data ?? []

  // ── Academic year filter ────────────────────────────────────────────────────
  const [selectedYear, setSelectedYear] = useState<string>('')

  const academicYears = useMemo(() => {
    const years = [
      ...new Set(allSupervisions.map((s) => s.academicYear).filter(Boolean)),
    ]
    return years.sort().reverse()
  }, [allSupervisions])

  const filtered = useMemo(
    () =>
      selectedYear
        ? allSupervisions.filter((s) => s.academicYear === selectedYear)
        : allSupervisions,
    [allSupervisions, selectedYear],
  )

  // ── KPI computations ───────────────────────────────────────────────────────
  const total = filtered.length
  const inProgress = filtered.filter((s) => s.status === 'IN_PROGRESS').length
  const defended = filtered.filter((s) => s.status === 'DEFENDED').length
  const pendingValidation = filtered.filter(
    (s) => s.validationStatus === 'PENDING',
  ).length
  const defenseRate = total > 0 ? Math.round((defended / total) * 100) : 0

  // ── Chart data ─────────────────────────────────────────────────────────────
  const byType = useMemo(
    () =>
      countBy(filtered.map((s) => TYPE_LABELS[s.type] ?? s.type)).map((d) => ({
        ...d,
        pct: total > 0 ? Math.round((d.value / total) * 100) : 0,
      })),
    [filtered, total],
  )

  const byYear = useMemo(() => {
    const map: Record<string, number> = {}
    allSupervisions.forEach((s) => {
      if (s.academicYear) map[s.academicYear] = (map[s.academicYear] ?? 0) + 1
    })
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([year, count]) => ({ year, count }))
  }, [allSupervisions])

  const byStatus = useMemo(
    () => countBy(filtered.map((s) => STATUS_LABELS[s.status] ?? s.status)),
    [filtered],
  )

  const byValidation = useMemo(
    () =>
      countBy(filtered.map((s) => s.validationStatus)).map((d) => ({
        ...d,
        name: VALIDATION_LABELS[d.name] ?? d.name,
        key: d.name,
      })),
    [filtered],
  )

  const studentsByInstitution = useMemo(
    () => countBy(allStudents.map((s) => s.institution).filter(Boolean)),
    [allStudents],
  )

  const studentsByLevel = useMemo(
    () => countBy(allStudents.map((s) => s.level).filter(Boolean)),
    [allStudents],
  )

  // ── Export: Excel supervisions ──────────────────────────────────────────────
  function handleExportSupervisionsXlsx() {
    const rows = filtered.map((s) => ({
      Titre: s.title,
      Étudiant: s.student
        ? `${s.student.lastName} ${s.student.firstName}`
        : s.studentId,
      Type: TYPE_LABELS[s.type] ?? s.type,
      Statut: STATUS_LABELS[s.status] ?? s.status,
      Validation: VALIDATION_LABELS[s.validationStatus] ?? s.validationStatus,
      'Année univ.': s.academicYear,
      'Date début': fmt(s.startDate),
      'Date fin prévue': fmt(s.expectedEndDate),
      'Date fin réelle': fmt(s.actualEndDate),
      'Mots-clés': s.keywords?.join(', ') ?? '',
    }))
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Encadrements')
    XLSX.writeFile(wb, `encadrements_${selectedYear || 'tous'}.xlsx`)
  }

  // ── Export: Excel students ──────────────────────────────────────────────────
  function handleExportStudentsXlsx() {
    const rows = allStudents.map((s) => ({
      Nom: s.lastName,
      Prénom: s.firstName,
      Email: s.email,
      Établissement: s.institution,
      Niveau: s.level,
      Spécialité: s.specialty ?? '',
    }))
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Étudiants')
    XLSX.writeFile(wb, 'etudiants.xlsx')
  }

  // ── Export: PDF report ──────────────────────────────────────────────────────
  function handleExportPDF() {
    const doc = new jsPDF()

    doc.setFontSize(18)
    doc.setTextColor(33, 51, 78)
    doc.text("Rapport d'Encadrements — LMCS", 14, 18)

    doc.setFontSize(10)
    doc.setTextColor(107, 114, 128)
    doc.text(`Généré le : ${new Date().toLocaleDateString('fr-DZ')}`, 14, 26)
    if (selectedYear) doc.text(`Année universitaire : ${selectedYear}`, 14, 32)

    doc.setFontSize(11)
    doc.setTextColor(33, 51, 78)
    const kpiY = selectedYear ? 42 : 36
    doc.text('Résumé :', 14, kpiY)
    doc.setFontSize(10)
    doc.setTextColor(60, 60, 60)
    doc.text(
      [
        `• Total encadrements : ${total}`,
        `• En cours : ${inProgress}`,
        `• Soutenus : ${defended}`,
        `• Taux de soutenance : ${defenseRate}%`,
        `• En attente de validation : ${pendingValidation}`,
        `• Total étudiants : ${allStudents.length}`,
      ],
      14,
      kpiY + 8,
    )

    autoTable(doc, {
      startY: kpiY + 60,
      head: [['Titre', 'Étudiant', 'Type', 'Statut', 'Validation', 'Année']],
      body: filtered.map((s) => [
        s.title,
        s.student
          ? `${s.student.lastName} ${s.student.firstName}`
          : s.studentId,
        TYPE_LABELS[s.type] ?? s.type,
        STATUS_LABELS[s.status] ?? s.status,
        VALIDATION_LABELS[s.validationStatus] ?? s.validationStatus,
        s.academicYear,
      ]),
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [33, 51, 78], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    })

    doc.save(`rapport_encadrements_${selectedYear || 'tous'}.pdf`)
  }

  const isLoading = loadingSup || loadingStud

  return (
    <div className='space-y-6'>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className='flex flex-wrap items-start justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-semibold tracking-tight'>
            Statistiques &amp; Rapports
          </h1>
          <p className='text-sm text-muted-foreground mt-1'>
            Analyse multi-critères de vos encadrements et étudiants.
          </p>
        </div>

        {/* Export toolbar */}
        <div className='flex items-center gap-1 rounded-lg border border-border bg-muted/50 p-1'>
          <Button
            variant='ghost'
            size='sm'
            className='gap-2 text-xs whitespace-nowrap'
            onClick={handleExportSupervisionsXlsx}
            disabled={isLoading || total === 0}
          >
            <FileSpreadsheet className='size-3.5' />
            Encadrements
          </Button>
          <div className='h-4 w-px bg-border' />
          <Button
            variant='ghost'
            size='sm'
            className='gap-2 text-xs whitespace-nowrap'
            onClick={handleExportStudentsXlsx}
            disabled={isLoading || allStudents.length === 0}
          >
            <FileSpreadsheet className='size-3.5' />
            Étudiants
          </Button>
          <div className='h-4 w-px bg-border' />
          <Button
            variant='ghost'
            size='sm'
            className='gap-2 text-xs whitespace-nowrap'
            onClick={handleExportPDF}
            disabled={isLoading || total === 0}
          >
            <FileText className='size-3.5' />
            PDF
          </Button>
        </div>
      </div>

      {/* ── Year filter ────────────────────────────────────────────────────── */}
      <div className='flex flex-wrap items-center gap-3'>
        <Filter className='size-4 text-muted-foreground shrink-0' />
        <span className='text-sm font-medium'>Année universitaire :</span>
        <div className='flex flex-wrap gap-2'>
          <button
            type='button'
            onClick={() => setSelectedYear('')}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-all duration-150 ${
              selectedYear === ''
                ? 'bg-primary text-primary-foreground border-primary shadow-primary-sm scale-[1.02]'
                : 'bg-card text-muted-foreground hover:bg-muted'
            }`}
          >
            Toutes les années
          </button>
          {academicYears.map((y) => (
            <button
              key={y}
              type='button'
              onClick={() => setSelectedYear(y)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-all duration-150 ${
                selectedYear === y
                  ? 'bg-primary text-primary-foreground border-primary shadow-primary-sm scale-[1.02]'
                  : 'bg-card text-muted-foreground hover:bg-muted'
              }`}
            >
              {y}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className='py-16 text-center text-sm text-muted-foreground'>
          Chargement des données...
        </div>
      ) : (
        <>
          {/* ── KPI Cards — featured + 2×2 secondary ────────────────────────── */}
          <div className='grid gap-4 lg:grid-cols-3'>
            <KpiCard
              title='Total encadrements'
              value={total}
              icon={BarChart3}
              featured
            />
            <div className='grid grid-cols-2 gap-4 lg:col-span-2'>
              <KpiCard title='En cours' value={inProgress} icon={Hourglass} />
              <KpiCard title='Soutenus' value={defended} icon={GraduationCap} />
              <KpiCard
                title='Taux de soutenance'
                value={`${defenseRate}%`}
                icon={TrendingUp}
                sub={`${defended} / ${total}`}
              />
              <KpiCard
                title='Validation en attente'
                value={pendingValidation}
                icon={Clock}
              />
            </div>
          </div>
          <div className='grid gap-4 sm:grid-cols-2'>
            <KpiCard
              title='Total étudiants'
              value={allStudents.length}
              icon={Users}
            />
          </div>

          {/* ── Charts row 1: by type (1 col) + by year (2 cols) ──────────── */}
          <div className='grid gap-4 lg:grid-cols-3'>
            <Card className='lg:col-span-1'>
              <CardHeader>
                <CardTitle>Répartition par type</CardTitle>
              </CardHeader>
              <CardContent>
                {byType.length === 0 ? (
                  <div className='h-65 flex items-center justify-center text-sm text-muted-foreground'>
                    Aucune donnée
                  </div>
                ) : (
                  <>
                    <div className='h-65'>
                      <ResponsiveContainer width='100%' height='100%'>
                        <PieChart>
                          <Pie
                            data={byType}
                            dataKey='value'
                            nameKey='name'
                            cx='50%'
                            cy='50%'
                            outerRadius={90}
                            label={({ name, percent }) =>
                              `${name} ${(Number(percent) * 100).toFixed(0)}%`
                            }
                            labelLine={false}
                          >
                            {byType.map((_, i) => (
                              <Cell
                                key={i}
                                fill={CHART_COLORS[i % CHART_COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip formatter={(v) => [String(v ?? ''), '']} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <ul className='mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground'>
                      {byType.map((d, i) => (
                        <li key={d.name} className='flex items-center gap-1'>
                          <span
                            className='inline-block size-2.5 rounded-full'
                            style={{
                              background: CHART_COLORS[i % CHART_COLORS.length],
                            }}
                          />
                          {d.name}: {d.value} ({d.pct}%)
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className='lg:col-span-2'>
              <CardHeader>
                <CardTitle>Évolution par année universitaire</CardTitle>
              </CardHeader>
              <CardContent>
                {byYear.length === 0 ? (
                  <div className='h-65 flex items-center justify-center text-sm text-muted-foreground'>
                    Aucune donnée
                  </div>
                ) : (
                  <div className='h-65'>
                    <ResponsiveContainer width='100%' height='100%'>
                      <BarChart
                        data={byYear}
                        margin={{ top: 12, right: 12, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid
                          strokeDasharray='3 3'
                          className='stroke-muted'
                        />
                        <XAxis dataKey='year' tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                        <Tooltip />
                        <Bar
                          dataKey='count'
                          name='Encadrements'
                          fill='var(--chart-1)'
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* ── Charts row 2: by status + by validation ─────────────────── */}
          <div className='grid gap-4 lg:grid-cols-2'>
            <Card>
              <CardHeader>
                <CardTitle>Répartition par statut</CardTitle>
              </CardHeader>
              <CardContent>
                {byStatus.length === 0 ? (
                  <div className='h-60 flex items-center justify-center text-sm text-muted-foreground'>
                    Aucune donnée
                  </div>
                ) : (
                  <div className='h-60'>
                    <ResponsiveContainer width='100%' height='100%'>
                      <BarChart
                        data={byStatus}
                        layout='vertical'
                        margin={{ top: 4, right: 24, left: 0, bottom: 4 }}
                      >
                        <CartesianGrid
                          strokeDasharray='3 3'
                          className='stroke-muted'
                          horizontal={false}
                        />
                        <XAxis
                          type='number'
                          tick={{ fontSize: 11 }}
                          allowDecimals={false}
                        />
                        <YAxis
                          dataKey='name'
                          type='category'
                          tick={{ fontSize: 11 }}
                          width={90}
                        />
                        <Tooltip />
                        <Bar
                          dataKey='value'
                          name='Encadrements'
                          fill='var(--chart-2)'
                          radius={[0, 4, 4, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Statut de validation</CardTitle>
              </CardHeader>
              <CardContent>
                {byValidation.length === 0 ? (
                  <div className='h-60 flex items-center justify-center text-sm text-muted-foreground'>
                    Aucune donnée
                  </div>
                ) : (
                  <>
                    <div className='h-50'>
                      <ResponsiveContainer width='100%' height='100%'>
                        <PieChart>
                          <Pie
                            data={byValidation}
                            dataKey='value'
                            nameKey='name'
                            cx='50%'
                            cy='50%'
                            innerRadius={50}
                            outerRadius={80}
                          >
                            {byValidation.map((d) => (
                              <Cell
                                key={d.name}
                                fill={
                                  VALIDATION_COLORS[d.key ?? d.name] ??
                                  '#94a3b8'
                                }
                              />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend
                            iconSize={10}
                            wrapperStyle={{ fontSize: 12 }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* ── Charts row 3: students ────────────────────────────────────── */}
          <div className='grid gap-4 lg:grid-cols-2'>
            <Card>
              <CardHeader>
                <CardTitle>Étudiants par établissement</CardTitle>
              </CardHeader>
              <CardContent>
                {studentsByInstitution.length === 0 ? (
                  <div className='h-55 flex items-center justify-center text-sm text-muted-foreground'>
                    Aucune donnée
                  </div>
                ) : (
                  <div className='h-55'>
                    <ResponsiveContainer width='100%' height='100%'>
                      <BarChart
                        data={studentsByInstitution}
                        margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid
                          strokeDasharray='3 3'
                          className='stroke-muted'
                        />
                        <XAxis dataKey='name' tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                        <Tooltip />
                        <Bar
                          dataKey='value'
                          name='Étudiants'
                          fill='var(--chart-3)'
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Étudiants par niveau</CardTitle>
              </CardHeader>
              <CardContent>
                {studentsByLevel.length === 0 ? (
                  <div className='h-55 flex items-center justify-center text-sm text-muted-foreground'>
                    Aucune donnée
                  </div>
                ) : (
                  <>
                    <div className='h-45'>
                      <ResponsiveContainer width='100%' height='100%'>
                        <PieChart>
                          <Pie
                            data={studentsByLevel}
                            dataKey='value'
                            nameKey='name'
                            cx='50%'
                            cy='50%'
                            outerRadius={75}
                            label={({ name, value }) => `${name}: ${value}`}
                          >
                            {studentsByLevel.map((_, i) => (
                              <Cell
                                key={i}
                                fill={
                                  CHART_COLORS[(i + 2) % CHART_COLORS.length]
                                }
                              />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <ul className='mt-2 flex justify-center gap-4 text-xs text-muted-foreground'>
                      {studentsByLevel.map((d, i) => (
                        <li key={d.name} className='flex items-center gap-1'>
                          <span
                            className='inline-block size-2.5 rounded-full'
                            style={{
                              background:
                                CHART_COLORS[(i + 2) % CHART_COLORS.length],
                            }}
                          />
                          {d.name}: {d.value}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* ── Summary table ─────────────────────────────────────────────── */}
          <Card>
            <CardHeader>
              <CardTitle>
                Tableau des encadrements
                {selectedYear && (
                  <span className='ml-2 text-sm font-normal text-muted-foreground'>
                    — {selectedYear}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className='p-0'>
              {filtered.length === 0 ? (
                <div className='py-10 text-center text-sm text-muted-foreground'>
                  Aucun encadrement trouvé.
                </div>
              ) : (
                <div className='overflow-x-auto'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Titre</TableHead>
                        <TableHead>Étudiant</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Validation</TableHead>
                        <TableHead>Année</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map((s) => (
                        <TableRow key={s.id}>
                          <TableCell className='font-medium max-w-50 truncate'>
                            {s.title}
                          </TableCell>
                          <TableCell className='text-muted-foreground'>
                            {s.student
                              ? `${s.student.lastName} ${s.student.firstName}`
                              : s.studentId}
                          </TableCell>
                          <TableCell>{TYPE_LABELS[s.type] ?? s.type}</TableCell>
                          <TableCell>
                            {STATUS_LABELS[s.status] ?? s.status}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                VALIDATION_BADGE[s.validationStatus] ??
                                'outline'
                              }
                            >
                              {VALIDATION_LABELS[s.validationStatus] ??
                                s.validationStatus}
                            </Badge>
                          </TableCell>
                          <TableCell>{s.academicYear}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
