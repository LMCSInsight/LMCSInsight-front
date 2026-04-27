import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  BarChart3,
  Users,
  GraduationCap,
  SlidersHorizontal,
} from 'lucide-react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Legend,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// ─── Visual Identity ──────────────────────────────────────────────────────────
const C = {
  navy: '#21334E',
  blue: '#11499A',
  lightBlue: '#EBF1F9',
  bg: '#F5F5F5',
  white: '#FFFFFF',
  muted: '#6b7280',
}
const FONT = "'Outfit', sans-serif"

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_SUPERVISIONS = [
  // PFE
  ...Array.from({ length: 84 }, (_, i) => ({
    id: `p${i}`,
    type: 'PFE',
    status:
      i < 40
        ? 'IN_PROGRESS'
        : i < 60
          ? 'DEFENDED'
          : i < 70
            ? 'EXTENSION'
            : 'ABANDONED',
    academicYear: `${2020 + (i % 5)}`,
  })),
  // Doctorat
  ...Array.from({ length: 71 }, (_, i) => ({
    id: `d${i}`,
    type: 'PHD',
    status:
      i < 35
        ? 'IN_PROGRESS'
        : i < 55
          ? 'DEFENDED'
          : i < 65
            ? 'EXTENSION'
            : 'ABANDONED',
    academicYear: `${2020 + (i % 5)}`,
  })),
  // Master
  ...Array.from({ length: 52 }, (_, i) => ({
    id: `m${i}`,
    type: 'MASTER',
    status:
      i < 25
        ? 'IN_PROGRESS'
        : i < 40
          ? 'DEFENDED'
          : i < 48
            ? 'EXTENSION'
            : 'ABANDONED',
    academicYear: `${2020 + (i % 5)}`,
  })),
  // Stage
  ...Array.from({ length: 40 }, (_, i) => ({
    id: `s${i}`,
    type: 'INTERNSHIP',
    status:
      i < 20
        ? 'IN_PROGRESS'
        : i < 30
          ? 'DEFENDED'
          : i < 36
            ? 'EXTENSION'
            : 'ABANDONED',
    academicYear: `${2020 + (i % 5)}`,
  })),
]

const MOCK_RESEARCHERS = [
  {
    id: '1',
    name: 'Dr.Boualem Khalouat',
    role: 'Professeur',
    total: 27,
    enCours: 12,
    enAttente: 5,
    termine: 10,
    pfe: 3,
    master: 8,
    doctorat: 2,
    stage: 12,
  },
  {
    id: '2',
    name: 'Dr.Boualem Khalouat',
    role: 'Professeur',
    total: 27,
    enCours: 12,
    enAttente: 5,
    termine: 10,
    pfe: 3,
    master: 8,
    doctorat: 2,
    stage: 12,
  },
  {
    id: '3',
    name: 'Dr.Boualem Khalouat',
    role: 'Professeur',
    total: 27,
    enCours: 12,
    enAttente: 5,
    termine: 10,
    pfe: 3,
    master: 8,
    doctorat: 2,
    stage: 12,
  },
]

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Top KPI card — plain white box */
function KpiCard({
  title,
  children,
  icon: Icon,
  sub,
}: {
  title: string
  children: React.ReactNode
  icon?: React.ElementType
  sub?: string
}) {
  return (
    <Card
      style={{
        background: C.white,
        borderRadius: 10,
        boxShadow: '0 1px 4px rgba(33,51,78,0.07)',
        border: 'none',
      }}
    >
      <CardHeader className='pb-1 pt-4 px-4'>
        <div className='flex items-center justify-between'>
          <CardTitle
            style={{
              fontSize: 11,
              fontWeight: 500,
              color: C.muted,
              fontFamily: FONT,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            {title}
          </CardTitle>
          {Icon && <Icon size={14} color={C.muted} />}
        </div>
      </CardHeader>
      <CardContent className='px-4 pb-4 pt-0'>
        {children}
        {sub && (
          <p
            style={{
              fontSize: 10,
              color: C.muted,
              marginTop: 4,
              fontFamily: FONT,
            }}
          >
            {sub}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

/** Researcher row card */
function ResearcherCard({ r }: { r: (typeof MOCK_RESEARCHERS)[0] }) {
  const initial = r.name.replace('Dr.', '').trim()[0]
  return (
    <Card
      style={{
        background: C.white,
        border: 'none',
        borderRadius: 10,
        boxShadow: '0 1px 4px rgba(33,51,78,0.06)',
      }}
    >
      <CardContent className='px-5 py-4'>
        <div className='grid w-full items-center gap-4 lg:grid-cols-[minmax(220px,1.8fr)_auto_1px_auto_1px_auto] lg:gap-6'>
          {/* Avatar + name */}
          <div className='flex min-w-0 items-center gap-3'>
            <div
              style={{
                width: 40,
                height: 40,
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
                  fontSize: 16,
                  fontFamily: FONT,
                }}
              >
                {initial}
              </span>
            </div>
            <div>
              <p
                style={{
                  fontWeight: 600,
                  fontSize: 13,
                  color: C.navy,
                  fontFamily: FONT,
                  marginBottom: 1,
                }}
              >
                {r.name}
              </p>
              <p style={{ fontSize: 11, color: C.muted, fontFamily: FONT }}>
                {r.role}{' '}
                <Link
                  to='#'
                  style={{
                    color: C.blue,
                    fontWeight: 600,
                    fontSize: 11,
                    textDecoration: 'none',
                  }}
                >
                  Voir Profile
                </Link>
              </p>
            </div>
          </div>

          {/* Total */}
          <div className='min-w-0 text-center lg:px-2'>
            <p
              style={{
                fontSize: 28,
                fontWeight: 800,
                color: C.navy,
                fontFamily: FONT,
                lineHeight: 1,
              }}
            >
              {r.total}
            </p>
            <p
              style={{
                fontSize: 11,
                color: C.muted,
                fontFamily: FONT,
                marginTop: 2,
              }}
            >
              Encadrements totaux
            </p>
          </div>

          {/* Divider */}
          <div className='hidden h-12 w-px shrink-0 bg-border lg:block' />

          {/* Status breakdown */}
          <div className='min-w-0 lg:px-2'>
            {[
              { label: 'En cours', value: r.enCours },
              { label: 'En attent', value: r.enAttente },
              { label: 'Terminé', value: r.termine },
            ].map((item) => (
              <div
                key={item.label}
                className='flex items-center justify-between gap-4'
                style={{ marginBottom: 1 }}
              >
                <span
                  style={{ fontSize: 11, color: C.muted, fontFamily: FONT }}
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

          {/* Divider */}
          <div className='hidden h-12 w-px shrink-0 bg-border lg:block' />

          {/* Type breakdown */}
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
                    fontSize: 18,
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

export default function DirectorDashboard() {
  const total = MOCK_SUPERVISIONS.length
  const defended = MOCK_SUPERVISIONS.filter(
    (s) => s.status === 'DEFENDED',
  ).length
  const defRate = total > 0 ? Math.round((defended / total) * 100) : 0

  // Active researchers (mock: those with ≥1 in-progress)
  const activeResearchers = 38

  // Type counts for KPI card
  const pfeCount = MOCK_SUPERVISIONS.filter((s) => s.type === 'PFE').length
  const phdCount = MOCK_SUPERVISIONS.filter((s) => s.type === 'PHD').length
  const mastCount = MOCK_SUPERVISIONS.filter((s) => s.type === 'MASTER').length
  const stgCount = MOCK_SUPERVISIONS.filter(
    (s) => s.type === 'INTERNSHIP',
  ).length

  // Line chart: total supervisions by year
  const byYear = useMemo(() => {
    const map: Record<string, number> = {}
    MOCK_SUPERVISIONS.forEach((s) => {
      map[s.academicYear] = (map[s.academicYear] ?? 0) + 1
    })
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([year, count]) => ({ year, count }))
  }, [])

  // Stacked bar: by type × status
  const byTypeStatus = useMemo(() => {
    const types = ['PFE', 'MASTER', 'PHD', 'INTERNSHIP']
    const labels: Record<string, string> = {
      PFE: 'PFE',
      MASTER: 'Master',
      PHD: 'Doctorat',
      INTERNSHIP: 'Stage',
    }
    return types.map((t) => {
      const subs = MOCK_SUPERVISIONS.filter((s) => s.type === t)
      return {
        name: labels[t],
        'En cours': subs.filter((s) => s.status === 'IN_PROGRESS').length,
        Soutenu: subs.filter((s) => s.status === 'DEFENDED').length,
        Prolongation: subs.filter((s) => s.status === 'EXTENSION').length,
        Abandonné: subs.filter((s) => s.status === 'ABANDONED').length,
      }
    })
  }, [])

  return (
    <div className='space-y-5' style={{ fontFamily: FONT }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');`}</style>

      {/* ── Row 1: 4 KPI cards ────────────────────────────────────────────── */}
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        {/* 1. Total encadrements */}
        <KpiCard
          title='Total encadrements'
          icon={BarChart3}
          sub='Cliquez pour tout afficher'
        >
          <p
            style={{
              fontSize: 36,
              fontWeight: 800,
              color: C.navy,
              fontFamily: FONT,
              lineHeight: 1.1,
            }}
          >
            {total}
          </p>
        </KpiCard>

        {/* 2. Répartition par type */}
        <KpiCard
          title='Répartition par type'
          icon={SlidersHorizontal}
          sub='Cliquez pour filtrer'
        >
          <div className='flex items-end gap-3 mt-1'>
            {[
              { label: 'PFE', value: pfeCount },
              { label: 'Doctorat', value: phdCount },
              { label: 'Master', value: mastCount },
              { label: 'Stage', value: stgCount },
            ].map((item) => (
              <div key={item.label} style={{ textAlign: 'center' }}>
                <p
                  style={{
                    fontSize: 22,
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
        </KpiCard>

        {/* 3. Enseignants actifs */}
        <KpiCard
          title='Enseignants actifs'
          icon={Users}
          sub='enseignants avec ≥1 encadrement en cours'
        >
          <p
            style={{
              fontSize: 36,
              fontWeight: 800,
              color: C.navy,
              fontFamily: FONT,
              lineHeight: 1.1,
            }}
          >
            {activeResearchers}
          </p>
        </KpiCard>

        {/* 4. Taux de soutenance */}
        <KpiCard
          title='Taux de soutenance'
          icon={GraduationCap}
          sub='soutenances réalisées / prévues'
        >
          <p
            style={{
              fontSize: 36,
              fontWeight: 800,
              color: C.navy,
              fontFamily: FONT,
              lineHeight: 1.1,
            }}
          >
            {defRate}%
          </p>
        </KpiCard>
      </div>

      {/* ── Row 2: 2 charts side by side ─────────────────────────────────── */}
      <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
        {/* Line chart */}
        <Card
          style={{
            background: C.white,
            border: 'none',
            borderRadius: 10,
            boxShadow: '0 1px 4px rgba(33,51,78,0.07)',
          }}
        >
          <CardHeader className='pb-0 pt-4 px-5'>
            <CardTitle
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: C.navy,
                fontFamily: FONT,
              }}
            >
              Évolution des encadrements
            </CardTitle>
          </CardHeader>
          <CardContent className='px-3 pb-4 pt-2'>
            <div style={{ height: 220 }}>
              <ResponsiveContainer width='100%' height='100%'>
                <LineChart
                  data={byYear}
                  margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
                  <XAxis
                    dataKey='year'
                    tick={{ fontSize: 11, fontFamily: FONT, fill: C.muted }}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fontFamily: FONT, fill: C.muted }}
                    allowDecimals={false}
                  />
                  <Tooltip contentStyle={{ fontFamily: FONT, fontSize: 12 }} />
                  <Line
                    type='monotone'
                    dataKey='count'
                    name='Encadrements'
                    stroke={C.blue}
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: C.blue }}
                    activeDot={{ r: 6 }}
                    isAnimationActive
                    animationDuration={600}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Stacked bar chart */}
        <Card
          style={{
            background: C.white,
            border: 'none',
            borderRadius: 10,
            boxShadow: '0 1px 4px rgba(33,51,78,0.07)',
          }}
        >
          <CardHeader className='pb-0 pt-4 px-5'>
            <CardTitle
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: C.navy,
                fontFamily: FONT,
              }}
            >
              État d&apos;avancement par type
            </CardTitle>
          </CardHeader>
          <CardContent className='px-3 pb-4 pt-2'>
            <div style={{ height: 220 }}>
              <ResponsiveContainer width='100%' height='100%'>
                <BarChart
                  data={byTypeStatus}
                  margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray='3 3' stroke='#e5e7eb' />
                  <XAxis
                    dataKey='name'
                    tick={{ fontSize: 11, fontFamily: FONT, fill: C.muted }}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fontFamily: FONT, fill: C.muted }}
                    allowDecimals={false}
                  />
                  <Tooltip contentStyle={{ fontFamily: FONT, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11, fontFamily: FONT }} />
                  <Bar
                    dataKey='En cours'
                    stackId='a'
                    fill='#3b82f6'
                    radius={[0, 0, 0, 0]}
                    isAnimationActive
                    animationDuration={600}
                  />
                  <Bar
                    dataKey='Soutenu'
                    stackId='a'
                    fill='#22c55e'
                    isAnimationActive
                    animationDuration={600}
                  />
                  <Bar
                    dataKey='Prolongation'
                    stackId='a'
                    fill='#ef4444'
                    isAnimationActive
                    animationDuration={600}
                  />
                  <Bar
                    dataKey='Abandonné'
                    stackId='a'
                    fill='#eab308'
                    radius={[4, 4, 0, 0]}
                    isAnimationActive
                    animationDuration={600}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Row 3: Researcher table ───────────────────────────────────────── */}
      <div>
        <h2
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: C.navy,
            fontFamily: FONT,
            marginBottom: 16,
          }}
        >
          Tableaux Des Encadrants :
        </h2>
        <div className='space-y-3'>
          {MOCK_RESEARCHERS.map((r) => (
            <ResearcherCard key={r.id} r={r} />
          ))}
        </div>
      </div>
    </div>
  )
}
