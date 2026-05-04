import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ArrowRight,
  ArrowUpRight,
  Activity,
  BarChart3,
  Bell,
  BookMarked,
  Building2,
  CheckCircle,
  ChevronRight,
  ClipboardCheck,
  ClipboardClock,
  ClipboardList,
  Clock,
  FileBarChart2,
  Globe,
  GraduationCap,
  History,
  Hourglass,
  Layers,
  LayoutDashboard,
  List,
  ListOrdered,
  ListPlus,
  Moon,
  MoreVertical,
  PieChart as PieChartIcon,
  RefreshCw,
  Search,
  Settings,
  ScrollText,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  TrendingUp,
  UserCheck,
  UserPlus,
  Users,
  XCircle,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { LandingSection, SectionHeader } from './LandingPrimitives'
import { PortalCard } from './PortalCard'
import { ScrollReveal } from './ScrollReveal'

type PortalId = 'direction' | 'researcher' | 'assistant' | 'admin'

type SnapshotNavItem = {
  key: string
  label: string
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
}

function useDemoText() {
  const { i18n } = useTranslation()
  const isFrench =
    i18n.resolvedLanguage?.startsWith('fr') ?? i18n.language.startsWith('fr')

  return (fr: string, en: string) => (isFrench ? fr : en)
}

const CHART_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
]

const portalTabs: {
  id: PortalId
  labelKey: string
  descriptionKey: string
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
}[] = [
  {
    id: 'direction',
    labelKey: 'landing.dashboard.tab_direction',
    descriptionKey: 'landing.dashboard.tab_direction_desc',
    icon: GraduationCap,
  },
  {
    id: 'researcher',
    labelKey: 'landing.dashboard.tab_researcher',
    descriptionKey: 'landing.dashboard.tab_researcher_desc',
    icon: Users,
  },
  {
    id: 'assistant',
    labelKey: 'landing.dashboard.tab_assistant',
    descriptionKey: 'landing.dashboard.tab_assistant_desc',
    icon: ClipboardCheck,
  },
  {
    id: 'admin',
    labelKey: 'landing.dashboard.tab_admin',
    descriptionKey: 'landing.dashboard.tab_admin_desc',
    icon: ShieldCheck,
  },
]

const DASHBOARD_PREVIEW_SCALE = 0.72
const DASHBOARD_STAGE_HEIGHT = 720

function StaticPortalShell({
  portalLabel,
  pageTitle,
  currentUserName,
  initials,
  navItems,
  selectedKey = 'dashboard',
  mainClassName,
  children,
}: {
  portalLabel: string
  pageTitle: string
  currentUserName: string
  initials: string
  navItems: SnapshotNavItem[]
  selectedKey?: string
  mainClassName?: string
  children: React.ReactNode
}) {
  const dt = useDemoText()

  return (
    <div className='portal-shell flex min-h-screen bg-muted/30 dark:bg-background'>
      <aside className='fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-border bg-card bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,oklch(0.45_0.2_260/0.06),transparent)]'>
        <div className='flex flex-1 flex-col gap-5 overflow-y-auto p-4'>
          <div className='flex justify-center py-2'>
            <img
              src='/lmcs.png'
              alt='LMCS'
              className='h-24 w-auto object-contain'
              onError={(event) => {
                ;(event.target as HTMLImageElement).style.display = 'none'
              }}
            />
          </div>

          <div className='flex items-center gap-3 rounded-xl border border-border bg-muted/50 px-3 py-2.5'>
            <div className='flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground ring-2 ring-primary/20 ring-offset-2 ring-offset-card'>
              {initials}
            </div>
            <div className='min-w-0 flex-1'>
              <p className='truncate text-sm font-semibold text-foreground'>
                {currentUserName}
              </p>
              <p className='text-xs font-medium text-primary'>{portalLabel}</p>
            </div>
          </div>

          <nav className='flex flex-col gap-0.5'>
            {navItems.map((item) => {
              const selected = selectedKey === item.key
              const Icon = item.icon
              return (
                <div
                  key={item.key}
                  className={cn(
                    buttonVariants({ variant: 'ghost', size: 'default' }),
                    'relative h-10 w-full justify-start gap-3 px-3 font-normal transition-colors duration-200',
                    'rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-card',
                    selected
                      ? "bg-primary/8 text-primary font-medium hover:bg-primary/10 hover:text-primary before:absolute before:left-0 before:top-2 before:h-6 before:w-[3px] before:rounded-r-full before:bg-primary before:content-['']"
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  <Icon className='size-4 shrink-0' strokeWidth={1.5} />
                  {item.label}
                </div>
              )
            })}
          </nav>
        </div>

        <div className='mt-auto border-t border-border p-4'>
          <div className='flex h-10 w-full items-center justify-start gap-3 rounded-md px-3 text-muted-foreground'>
            <Settings className='size-4 shrink-0' strokeWidth={1.5} />
            {dt('Paramètres', 'Settings')}
          </div>
        </div>
      </aside>

      <div className='ml-64 flex min-w-0 flex-1 flex-col min-h-screen'>
        <header className='sticky top-0 z-10 flex shrink-0 items-center justify-between border-b border-border bg-card/90 backdrop-blur-sm px-6 py-3'>
          <nav
            className='flex items-center gap-1.5 text-sm'
            aria-label='Breadcrumb'
          >
            <span className='text-muted-foreground'>{portalLabel}</span>
            <ChevronRight className='size-3.5 shrink-0 text-muted-foreground/50' />
            <span className='font-medium text-foreground'>{pageTitle}</span>
          </nav>

          <div className='flex items-center gap-1'>
            {[Moon, Globe, Bell].map((Icon, index) => (
              <div
                key={index}
                className='relative flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground'
              >
                <Icon className='size-4' strokeWidth={1.5} />
                {Icon === Bell ? (
                  <span className='absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground'>
                    3
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        </header>

        <main className={mainClassName ?? 'min-w-0 flex-1 p-6'}>
          {children}
        </main>
      </div>
    </div>
  )
}

function FeaturedKpiCard({
  title,
  value,
  sub,
  icon: Icon,
}: {
  title: string
  value: number | string
  sub?: string
  icon: React.ElementType
}) {
  return (
    <Card className='h-full cursor-pointer border-0 bg-primary text-primary-foreground shadow-primary-sm transition-all hover:-translate-y-0.5'>
      <CardHeader className='flex flex-row items-start justify-between pb-3'>
        <CardTitle className='text-sm font-medium text-primary-foreground/70'>
          {title}
        </CardTitle>
        <div className='flex size-8 items-center justify-center rounded-lg bg-primary-foreground/15'>
          <Icon className='size-4 text-primary-foreground' />
        </div>
      </CardHeader>
      <CardContent>
        <div className='text-4xl font-bold tabular-nums text-primary-foreground'>
          {value}
        </div>
        {sub ? (
          <p className='mt-1.5 text-xs text-primary-foreground/60'>{sub}</p>
        ) : null}
      </CardContent>
    </Card>
  )
}

function KpiCard({
  title,
  value,
  sub,
  icon: Icon,
  accent,
}: {
  title: string
  value: number | string
  sub?: string
  icon: React.ElementType
  accent?: string
}) {
  return (
    <Card className='cursor-pointer transition-all hover:shadow-sm hover:-translate-y-0.5'>
      <CardHeader className='flex flex-row items-center justify-between pb-2'>
        <CardTitle className='text-xs font-medium text-muted-foreground'>
          {title}
        </CardTitle>
        <div
          className={cn(
            'flex size-7 items-center justify-center rounded-md',
            accent ?? 'bg-primary/10',
          )}
        >
          <Icon className='size-3.5 text-primary' />
        </div>
      </CardHeader>
      <CardContent>
        <div className='text-2xl font-bold tabular-nums text-foreground'>
          {value}
        </div>
        {sub ? (
          <p className='mt-0.5 text-xs text-muted-foreground'>{sub}</p>
        ) : null}
      </CardContent>
    </Card>
  )
}

const researcherByType = [
  { name: 'PFE', value: 7 },
  { name: 'Master', value: 6 },
  { name: 'Doctorat', value: 3 },
  { name: 'Stage', value: 2 },
]

const researcherByYear = [
  { year: '2021/22', count: 4 },
  { year: '2022/23', count: 5 },
  { year: '2023/24', count: 6 },
  { year: '2024/25', count: 3 },
]

export function ResearcherPortalSnapshot({
  clipForHero = false,
}: {
  clipForHero?: boolean
}) {
  const dt = useDemoText()
  const researcherByTypeLocalized = researcherByType.map((item) => ({
    ...item,
    name: item.name === 'Doctorat' ? dt('Doctorat', 'Doctorate') : item.name,
  }))
  const recentSupervisionsLocalized = [
    {
      id: '1',
      title: dt(
        'Détection d’anomalies dans les systèmes distribués',
        'Anomaly detection in distributed systems',
      ),
      student: 'Meziane Lina',
      type: 'PFE',
      status: 'IN_PROGRESS',
      validation: dt('Validé', 'Validated'),
    },
    {
      id: '2',
      title: dt(
        'Optimisation des modèles de vision par ordinateur',
        'Optimizing computer vision models',
      ),
      student: 'Ait Salem Yacine',
      type: 'Master',
      status: 'DEFENDED',
      validation: dt('Validé', 'Validated'),
    },
    {
      id: '3',
      title: dt(
        'Auditabilité des données académiques',
        'Auditability of academic data',
      ),
      student: 'Haddad Nour',
      type: dt('Doctorat', 'Doctorate'),
      status: 'IN_PROGRESS',
      validation: dt('En attente', 'Pending'),
    },
  ]

  return (
    <StaticPortalShell
      portalLabel={dt('Chercheur', 'Researcher')}
      pageTitle={dt('Tableau de bord', 'Dashboard')}
      currentUserName='Benbouzid'
      initials='BB'
      navItems={[
        {
          key: 'dashboard',
          label: dt('Tableau de bord', 'Dashboard'),
          icon: LayoutDashboard,
        },
        {
          key: 'reviews',
          label: dt('Révisions', 'Reviews'),
          icon: ClipboardCheck,
        },
        {
          key: 'supervisions',
          label: dt('Encadrements', 'Supervisions'),
          icon: ListOrdered,
        },
        {
          key: 'statistics',
          label: dt('Statistiques', 'Statistics'),
          icon: BarChart3,
        },
        { key: 'profile', label: dt('Profil', 'Profile'), icon: Settings },
      ]}
    >
      <div className='space-y-6'>
        <Card className='relative overflow-hidden border-0 bg-linear-to-br from-primary/15 via-primary/5 to-transparent'>
          <div
            className='absolute right-6 top-1/2 -translate-y-1/2 select-none text-[5rem] font-black tabular-nums leading-none text-primary/6 pointer-events-none'
            aria-hidden
          >
            72%
          </div>
          <CardContent className='flex flex-wrap items-center justify-between gap-4 px-6 py-5'>
            <div className='space-y-1'>
              <div className='flex items-center gap-2'>
                <h2 className='text-lg font-semibold text-foreground'>
                  {dt('Bonjour, Benbouzid', 'Hello, Benbouzid')}
                </h2>
              </div>
              <p className='text-sm text-muted-foreground capitalize'>
                {dt('lundi 4 mai 2026', 'Monday, May 4, 2026')}
              </p>
            </div>
            <div className='flex flex-wrap gap-2'>
              <span
                className={cn(
                  buttonVariants({ size: 'sm' }),
                  'inline-flex items-center gap-2 whitespace-nowrap shadow-primary-sm',
                )}
              >
                <ClipboardCheck className='size-3.5 shrink-0' />
                {dt('Mes révisions', 'My reviews')}
                <span className='rounded-full bg-primary-foreground/20 px-1.5 text-xs tabular-nums'>
                  3
                </span>
              </span>
              <span
                className={cn(
                  buttonVariants({ size: 'sm', variant: 'outline' }),
                  'inline-flex items-center gap-2 whitespace-nowrap',
                )}
              >
                <UserPlus className='size-3.5 shrink-0' />
                {dt('Inscrire un étudiant', 'Register a student')}
              </span>
            </div>
          </CardContent>
        </Card>

        <div className='grid gap-4 lg:grid-cols-3'>
          <FeaturedKpiCard
            title={dt('Total encadrements', 'Total supervisions')}
            value={18}
            icon={BarChart3}
            sub={dt('Dans votre portefeuille', 'In your portfolio')}
          />
          <div className='grid grid-cols-2 gap-4 lg:col-span-2'>
            <KpiCard
              title={dt('En cours', 'In progress')}
              value={12}
              icon={Hourglass}
              accent='bg-blue-100 dark:bg-blue-900/30'
            />
            <KpiCard
              title={dt('Soutenus', 'Defended')}
              value={5}
              icon={GraduationCap}
              accent='bg-green-100 dark:bg-green-900/30'
            />
            <KpiCard
              title={dt('Taux de soutenance', 'Defense rate')}
              value='72%'
              icon={TrendingUp}
              accent='bg-violet-100 dark:bg-violet-900/30'
              sub={dt('5 soutenus / 18 total', '5 defended / 18 total')}
            />
            <KpiCard
              title={dt('Révisions en attente', 'Pending reviews')}
              value={3}
              icon={Clock}
              accent='bg-amber-100 dark:bg-amber-900/30'
              sub={dt('À traiter', 'To process')}
            />
          </div>
        </div>

        <div className='grid gap-4 lg:grid-cols-3'>
          <Card>
            <CardHeader>
              <CardTitle className='text-sm font-semibold'>
                {dt('Répartition par type', 'Distribution by type')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='h-48'>
                <ResponsiveContainer width='100%' height='100%'>
                  <PieChart>
                    <Pie
                      data={researcherByTypeLocalized}
                      dataKey='value'
                      nameKey='name'
                      cx='50%'
                      cy='50%'
                      outerRadius={70}
                      label={({ name, percent }) =>
                        `${name} ${(Number(percent) * 100).toFixed(0)}%`
                      }
                      labelLine={false}
                      isAnimationActive={false}
                    >
                      {researcherByTypeLocalized.map((_, index) => (
                        <Cell
                          key={index}
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className='mt-2 flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs text-muted-foreground'>
                {researcherByTypeLocalized.map((item, index) => (
                  <li key={item.name} className='flex items-center gap-1'>
                    <span
                      className='inline-block size-2 rounded-sm'
                      style={{
                        background: CHART_COLORS[index % CHART_COLORS.length],
                      }}
                    />
                    {item.name}: {item.value}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className='lg:col-span-2'>
            <CardHeader>
              <CardTitle className='text-sm font-semibold'>
                {dt('Encadrements par année', 'Supervisions by year')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='h-48'>
                <ResponsiveContainer width='100%' height='100%'>
                  <BarChart
                    data={researcherByYear}
                    margin={{ top: 4, right: 12, left: 0, bottom: 0 }}
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
                      name={dt('Encadrements', 'Supervisions')}
                      fill='var(--chart-1)'
                      radius={[4, 4, 0, 0]}
                      isAnimationActive={false}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {!clipForHero ? (
          <>
            <Card>
              <CardHeader className='flex flex-row items-center justify-between'>
                <CardTitle className='text-sm font-semibold flex items-center gap-2'>
                  <History className='size-4 text-muted-foreground' />
                  {dt('Décisions récentes', 'Recent decisions')}
                </CardTitle>
                <span
                  className={cn(
                    buttonVariants({ variant: 'ghost', size: 'sm' }),
                    'text-xs',
                  )}
                >
                  {dt('Tout voir', 'View all')}
                </span>
              </CardHeader>
              <CardContent className='p-0'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{dt('Titre', 'Title')}</TableHead>
                      <TableHead>{dt('Décision', 'Decision')}</TableHead>
                      <TableHead className='hidden sm:table-cell'>
                        {dt('Date', 'Date')}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentSupervisionsLocalized.slice(0, 2).map((row) => (
                      <TableRow
                        key={row.id}
                        className='cursor-pointer hover:bg-muted/50'
                      >
                        <TableCell className='max-w-48 font-medium text-sm'>
                          {row.title}
                        </TableCell>
                        <TableCell>
                          <Badge variant='default' className='text-xs'>
                            {row.validation}
                          </Badge>
                        </TableCell>
                        <TableCell className='hidden sm:table-cell text-xs text-muted-foreground'>
                          04/05/2026 12:18
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='flex flex-row items-center justify-between'>
                <CardTitle className='text-sm font-semibold'>
                  {dt('Encadrements récents', 'Recent supervisions')}
                </CardTitle>
                <span
                  className={cn(
                    buttonVariants({ variant: 'ghost', size: 'sm' }),
                    'gap-1 whitespace-nowrap text-xs inline-flex items-center',
                  )}
                >
                  <List className='size-3.5 shrink-0' />
                  {dt('Tout voir', 'View all')}
                </span>
              </CardHeader>
              <CardContent className='p-0'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{dt('Titre', 'Title')}</TableHead>
                      <TableHead>{dt('Étudiant', 'Student')}</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>{dt('Validation', 'Validation')}</TableHead>
                      <TableHead className='w-16 text-right'>
                        {dt('Actions', 'Actions')}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentSupervisionsLocalized.map((row) => (
                      <TableRow
                        key={row.id}
                        className={cn(
                          'hover:bg-muted/50 transition-colors border-l-2',
                          row.status === 'DEFENDED'
                            ? 'border-l-green-500'
                            : 'border-l-blue-400',
                        )}
                      >
                        <TableCell className='max-w-48 truncate font-medium'>
                          {row.title}
                        </TableCell>
                        <TableCell className='text-muted-foreground text-sm'>
                          {row.student}
                        </TableCell>
                        <TableCell>
                          <span className='rounded-md bg-muted px-2 py-0.5 text-xs font-medium'>
                            {row.type}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant='default'>{row.validation}</Badge>
                        </TableCell>
                        <TableCell className='text-right'>
                          <span
                            className={cn(
                              buttonVariants({
                                variant: 'ghost',
                                size: 'icon',
                              }),
                              'size-8',
                            )}
                          >
                            <MoreVertical className='size-4' />
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='pb-3'>
                <CardTitle className='text-sm font-semibold'>
                  {dt('Répartition des statuts', 'Status distribution')}
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div className='flex h-3 w-full overflow-hidden rounded-full'>
                  <div
                    style={{ width: '67%' }}
                    className='h-full first:rounded-l-full bg-blue-500'
                  />
                  <div
                    style={{ width: '28%' }}
                    className='h-full bg-green-500'
                  />
                  <div
                    style={{ width: '5%' }}
                    className='h-full last:rounded-r-full bg-orange-400'
                  />
                </div>
                <div className='flex flex-wrap gap-x-4 gap-y-1.5'>
                  {[
                    [dt('En cours', 'In progress'), 'bg-blue-500', 12],
                    [dt('Soutenus', 'Defended'), 'bg-green-500', 5],
                    ['Extension', 'bg-orange-400', 1],
                  ].map(([label, color, count]) => (
                    <div
                      key={label}
                      className='flex items-center gap-1.5 text-xs text-muted-foreground'
                    >
                      <span className={cn('size-2 rounded-sm', color)} />
                      <span>{label}</span>
                      <span className='tabular-nums font-medium text-foreground'>
                        {count}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>
    </StaticPortalShell>
  )
}

const assistantStatusDistribution = [
  { name: 'En attente', value: 12, fill: 'var(--chart-4)' },
  { name: 'Validé', value: 78, fill: 'var(--chart-2)' },
  { name: 'Rejeté', value: 15, fill: 'var(--chart-5)' },
  { name: 'Révisé', value: 22, fill: 'var(--chart-3)' },
]

const assistantByYear = [
  { year: '2020/21', count: 38 },
  { year: '2021/22', count: 52 },
  { year: '2022/23', count: 47 },
  { year: '2023/24', count: 68 },
  { year: '2024/25', count: 22 },
]

function AssistantPortalSnapshot() {
  const dt = useDemoText()
  const assistantStatusDistributionLocalized = assistantStatusDistribution.map(
    (item) => ({
      ...item,
      name:
        item.name === 'En attente'
          ? dt('En attente', 'Pending')
          : item.name === 'Validé'
            ? dt('Validé', 'Validated')
            : item.name === 'Rejeté'
              ? dt('Rejeté', 'Rejected')
              : dt('Révisé', 'Revised'),
    }),
  )

  return (
    <StaticPortalShell
      portalLabel='Assistant'
      pageTitle={dt('Tableau de bord', 'Dashboard')}
      currentUserName='Khelouat Benbouzid'
      initials='KB'
      navItems={[
        {
          key: 'dashboard',
          label: dt('Tableau de bord', 'Dashboard'),
          icon: LayoutDashboard,
        },
        {
          key: 'activity',
          label: dt('File de validation', 'Validation queue'),
          icon: ClipboardCheck,
        },
        {
          key: 'supervisions',
          label: dt('Encadrements', 'Supervisions'),
          icon: ListOrdered,
        },
        { key: 'students', label: dt('Étudiants', 'Students'), icon: Users },
        { key: 'themes', label: dt('Thèmes', 'Themes'), icon: BookMarked },
        { key: 'history', label: dt('Historique', 'History'), icon: History },
        { key: 'profile', label: dt('Profil', 'Profile'), icon: Settings },
      ]}
    >
      <div className='mx-auto w-full max-w-7xl space-y-6'>
        <Card className='relative overflow-hidden border-0 bg-linear-to-br from-primary/15 via-primary/5 to-transparent'>
          <div
            className='absolute right-6 top-1/2 -translate-y-1/2 select-none text-[5rem] font-black tabular-nums leading-none text-primary/6 pointer-events-none'
            aria-hidden
          >
            12
          </div>
          <CardContent className='flex flex-wrap items-center justify-between gap-4 px-6 py-5'>
            <div className='space-y-1'>
              <h2 className='text-lg font-semibold text-foreground'>
                {dt('Bonjour, Khelouat', 'Hello, Khelouat')}
              </h2>
              <p className='text-sm text-muted-foreground capitalize'>
                {dt('lundi 4 mai 2026', 'Monday, May 4, 2026')}
              </p>
            </div>
            <div className='flex flex-wrap items-center gap-2'>
              <span
                className={cn(
                  buttonVariants({ size: 'sm' }),
                  'gap-2 whitespace-nowrap shadow-primary-sm',
                )}
              >
                <ClipboardCheck
                  className='size-3.5 shrink-0'
                  strokeWidth={1.5}
                />
                {dt('Accéder à la file', 'Open queue')}
              </span>
              <span
                className={cn(
                  buttonVariants({ size: 'sm', variant: 'outline' }),
                  'gap-2 whitespace-nowrap',
                )}
              >
                <ListPlus className='size-3.5 shrink-0' strokeWidth={1.5} />
                {dt('Nouvel encadrement', 'New supervision')}
              </span>
            </div>
          </CardContent>
        </Card>

        <div className='grid gap-4 lg:grid-cols-3'>
          <FeaturedKpiCard
            title={dt('Soumissions en attente', 'Pending submissions')}
            value={12}
            icon={ClipboardCheck}
            sub={dt(
              'Cliquez pour accéder à la file',
              'Click to open the queue',
            )}
          />
          <div className='grid grid-cols-2 gap-4 lg:col-span-2'>
            <KpiCard
              title={dt("Validés aujourd'hui", 'Validated today')}
              value={5}
              icon={CheckCircle}
              accent='bg-green-100 dark:bg-green-900/30'
            />
            <KpiCard
              title={dt('Rejetés cette semaine', 'Rejected this week')}
              value={3}
              icon={XCircle}
              accent='bg-rose-100 dark:bg-rose-900/30'
            />
            <KpiCard
              title={dt('Révisés cette semaine', 'Revised this week')}
              value={4}
              icon={RefreshCw}
              accent='bg-sky-100 dark:bg-sky-900/30'
            />
            <KpiCard
              title={dt('Total traités', 'Total processed')}
              value={12}
              icon={TrendingUp}
              accent='bg-violet-100 dark:bg-violet-900/30'
            />
          </div>
        </div>

        <div className='grid gap-4 lg:grid-cols-3'>
          <Card>
            <CardHeader>
              <CardTitle className='text-sm font-semibold'>
                {dt('Répartition par statut', 'Distribution by status')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='h-48'>
                <ResponsiveContainer width='100%' height='100%'>
                  <PieChart>
                    <Pie
                      data={assistantStatusDistributionLocalized}
                      dataKey='value'
                      nameKey='name'
                      cx='50%'
                      cy='50%'
                      outerRadius={70}
                      label={({ name, value }) => `${name} ${value}`}
                      labelLine={false}
                      isAnimationActive={false}
                    >
                      {assistantStatusDistributionLocalized.map(
                        (entry, index) => (
                          <Cell key={index} fill={entry.fill} />
                        ),
                      )}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className='mt-2 flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs text-muted-foreground'>
                {assistantStatusDistributionLocalized.map((item) => (
                  <li key={item.name} className='flex items-center gap-1'>
                    <span
                      className='inline-block size-2 rounded-sm'
                      style={{ background: item.fill }}
                    />
                    {item.name}: {item.value}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className='lg:col-span-2'>
            <CardHeader>
              <CardTitle className='text-sm font-semibold'>
                {dt('Encadrements par année', 'Supervisions by year')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='h-48'>
                <ResponsiveContainer width='100%' height='100%'>
                  <BarChart
                    data={assistantByYear}
                    margin={{ top: 4, right: 12, left: 0, bottom: 0 }}
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
                      name={dt('Encadrements', 'Supervisions')}
                      fill='var(--chart-1)'
                      radius={[4, 4, 0, 0]}
                      isAnimationActive={false}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className='grid gap-4 lg:grid-cols-3'>
          <Card className='lg:col-span-2'>
            <CardHeader className='flex flex-row items-center justify-between'>
              <CardTitle className='text-sm font-semibold'>
                {dt('Activité récente', 'Recent activity')}
              </CardTitle>
              <span className='flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors'>
                <ArrowRight className='size-3.5' strokeWidth={1.5} />
              </span>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {[
                  [
                    dt('Validation', 'Validation'),
                    dt(
                      'PFE Algorithmes distribués',
                      'FYP Distributed algorithms',
                    ),
                    dt('il y a 8 min', '8 min ago'),
                  ],
                  [
                    dt('Révision demandée', 'Revision requested'),
                    dt(
                      'Master Vision par ordinateur',
                      'Master Computer vision',
                    ),
                    dt('il y a 31 min', '31 min ago'),
                  ],
                  [
                    dt('Soumission', 'Submission'),
                    dt(
                      'Doctorat Systèmes multi-agents',
                      'Doctorate Multi-agent systems',
                    ),
                    dt('hier', 'yesterday'),
                  ],
                ].map(([status, title, time]) => (
                  <div key={title} className='flex gap-3'>
                    <div className='mt-1 size-2 rounded-full bg-primary' />
                    <div>
                      <p className='text-sm font-medium text-foreground'>
                        {status}
                      </p>
                      <p className='text-xs text-muted-foreground'>{title}</p>
                      <p className='text-xs text-muted-foreground/70'>{time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='text-sm font-semibold'>
                {dt('Répartition par type', 'Distribution by type')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='flex flex-col gap-3'>
                {[
                  ['PFE', 26],
                  ['Master', 18],
                  [dt('Doctorat', 'Doctorate'), 9],
                  ['Stage', 7],
                ].map(([type, count], index) => (
                  <div key={type} className='flex flex-col gap-1'>
                    <div className='flex justify-between text-xs text-muted-foreground'>
                      <span>{type}</span>
                      <span>{count}</span>
                    </div>
                    <div className='h-1.5 rounded-full bg-muted overflow-hidden'>
                      <div
                        className='h-full rounded-full transition-all'
                        style={{
                          width: `${(Number(count) / 26) * 100}%`,
                          background: CHART_COLORS[index % CHART_COLORS.length],
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between'>
            <CardTitle className='text-sm font-semibold'>
              {dt("File d'urgence", 'Urgent queue')}
            </CardTitle>
            <span className='flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors'>
              <ArrowRight className='size-3.5' strokeWidth={1.5} />
            </span>
          </CardHeader>
          <CardContent className='p-0'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{dt('Titre', 'Title')}</TableHead>
                  <TableHead className='hidden md:table-cell'>Type</TableHead>
                  <TableHead className='hidden lg:table-cell'>
                    {dt('Encadrant', 'Supervisor')}
                  </TableHead>
                  <TableHead className='text-right'>
                    {dt('Âge', 'Age')}
                  </TableHead>
                  <TableHead className='w-10' />
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  [
                    dt(
                      'Architecture cloud pour données médicales',
                      'Cloud architecture for medical data',
                    ),
                    'PFE',
                    'Dr. Benbouzid',
                    '7d',
                  ],
                  [
                    dt(
                      'Classification thématique automatique',
                      'Automatic thematic classification',
                    ),
                    'Master',
                    'Dr. Si Tayeb',
                    '4d',
                  ],
                  [
                    dt(
                      'Traçabilité des validations',
                      'Validation traceability',
                    ),
                    dt('Doctorat', 'Doctorate'),
                    'Dr. Khelouat',
                    '2d',
                  ],
                ].map(([title, type, supervisor, age]) => (
                  <TableRow
                    key={title}
                    className='cursor-pointer hover:bg-muted/50 transition-colors border-l-[3px] border-l-amber-400'
                  >
                    <TableCell>
                      <p className='font-medium text-foreground line-clamp-1 leading-snug'>
                        {title}
                      </p>
                      <p className='text-xs text-muted-foreground'>
                        {dt('Étudiant LMCS', 'LMCS student')}
                      </p>
                    </TableCell>
                    <TableCell className='hidden md:table-cell'>
                      <span className='inline-flex items-center rounded-md border border-border bg-muted/60 px-2.5 py-0.5 text-xs font-medium text-muted-foreground'>
                        {type}
                      </span>
                    </TableCell>
                    <TableCell className='hidden lg:table-cell'>
                      <p className='text-xs text-muted-foreground line-clamp-1 max-w-36'>
                        {supervisor}
                      </p>
                    </TableCell>
                    <TableCell className='text-right'>
                      <span className='inline-flex items-center rounded-md bg-amber-100 px-2 py-0.5 text-xs font-semibold tabular-nums text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'>
                        {age}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className='flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors ml-auto'>
                        <ArrowRight className='size-3.5' strokeWidth={1.5} />
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </StaticPortalShell>
  )
}

const directorByYear = [
  { year: '2020/21', count: 38 },
  { year: '2021/22', count: 52 },
  { year: '2022/23', count: 47 },
  { year: '2023/24', count: 68 },
  { year: '2024/25', count: 42 },
]

const directorSupervisionPie = [
  { name: 'En cours', value: 142, fill: CHART_COLORS[0] },
  { name: 'Soutenu', value: 78, fill: CHART_COLORS[1] },
  { name: 'Extension', value: 12, fill: CHART_COLORS[3] },
  { name: 'Abandon', value: 15, fill: CHART_COLORS[4] },
]

const directorValidationPie = [
  { name: 'Validé', value: 176, fill: CHART_COLORS[2] },
  { name: 'En attente', value: 18, fill: CHART_COLORS[3] },
  { name: 'Révisé', value: 29, fill: CHART_COLORS[4] },
  { name: 'Rejeté', value: 24, fill: CHART_COLORS[0] },
]

const thematicData = [
  { name: 'IA', count: 34 },
  { name: 'Réseaux', count: 28 },
  { name: 'Sécurité', count: 21 },
  { name: 'Systèmes distribués', count: 18 },
  { name: 'Génie logiciel', count: 15 },
]

function AdminSectionActionBar({
  title,
  actions,
}: {
  title: string
  actions: { label: string }[]
}) {
  return (
    <div className='flex flex-wrap items-center gap-2 rounded-lg border border-border/70 bg-card px-3 py-2'>
      <span className='mr-1 text-xs font-medium uppercase tracking-wider text-muted-foreground'>
        {title}
      </span>
      {actions.map((action) => (
        <span
          key={action.label}
          className={cn(
            buttonVariants({ variant: 'ghost', size: 'sm' }),
            'h-7 px-2.5',
          )}
        >
          {action.label}
        </span>
      ))}
    </div>
  )
}

function AdminKpiTile({
  label,
  value,
  helper,
  trend,
  icon: Icon,
}: {
  label: string
  value: number | string
  helper: string
  trend?: number
  icon: React.ElementType
}) {
  return (
    <Card className='border-border/70 shadow-none'>
      <CardHeader className='flex flex-row items-start justify-between space-y-0 pb-2'>
        <CardTitle className='text-xs font-medium uppercase tracking-wider text-muted-foreground'>
          {label}
        </CardTitle>
        <Icon className='size-4 text-muted-foreground' strokeWidth={1.5} />
      </CardHeader>
      <CardContent className='space-y-2'>
        <div className='tabular text-3xl font-semibold tracking-tight text-foreground'>
          {value}
        </div>
        <div className='flex items-center justify-between gap-2'>
          <p className='text-xs text-muted-foreground'>{helper}</p>
          {typeof trend === 'number' ? (
            <span
              className={cn(
                'tabular text-xs font-medium',
                trend >= 0 ? 'text-emerald-600' : 'text-red-600',
              )}
            >
              {trend > 0 ? '+' : ''}
              {trend}%
            </span>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}

function AdminInsightCard({
  title,
  value,
  subtitle,
  actionLabel,
  actionTo = true,
}: {
  title: string
  value: number | string
  subtitle: string
  actionLabel?: string
  actionTo?: boolean
}) {
  return (
    <Card className='border-border/70 shadow-none'>
      <CardHeader className='pb-2'>
        <CardTitle className='text-sm font-medium text-muted-foreground'>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-3'>
        <p className='tabular text-2xl font-semibold text-foreground'>
          {value}
        </p>
        <p className='text-xs text-muted-foreground'>{subtitle}</p>
        {actionLabel && actionTo ? (
          <span
            className={cn(
              buttonVariants({ variant: 'ghost', size: 'sm' }),
              'h-8 gap-1 px-2',
            )}
          >
            {actionLabel}
            <ArrowUpRight className='size-3.5' />
          </span>
        ) : null}
      </CardContent>
    </Card>
  )
}

function DirectionPortalSnapshot() {
  const dt = useDemoText()
  const directorSupervisionPieLocalized = directorSupervisionPie.map(
    (item) => ({
      ...item,
      name:
        item.name === 'En cours'
          ? dt('En cours', 'In progress')
          : item.name === 'Soutenu'
            ? dt('Soutenu', 'Defended')
            : item.name === 'Abandon'
              ? dt('Abandon', 'Abandoned')
              : item.name,
    }),
  )
  const directorValidationPieLocalized = directorValidationPie.map((item) => ({
    ...item,
    name:
      item.name === 'Validé'
        ? dt('Validé', 'Validated')
        : item.name === 'En attente'
          ? dt('En attente', 'Pending')
          : item.name === 'Révisé'
            ? dt('Révisé', 'Revised')
            : dt('Rejeté', 'Rejected'),
  }))
  const thematicDataLocalized = thematicData.map((item) => ({
    ...item,
    name:
      item.name === 'Réseaux'
        ? dt('Réseaux', 'Networks')
        : item.name === 'Sécurité'
          ? dt('Sécurité', 'Security')
          : item.name === 'Systèmes distribués'
            ? dt('Systèmes distribués', 'Distributed systems')
            : item.name === 'Génie logiciel'
              ? dt('Génie logiciel', 'Software engineering')
              : item.name,
  }))

  return (
    <StaticPortalShell
      portalLabel={dt('Direction', 'Director')}
      pageTitle={dt('Tableau de bord', 'Dashboard')}
      currentUserName='Si Tayeb'
      initials='ST'
      mainClassName='min-w-0 flex-1 p-6 lg:p-8 mx-auto w-full max-w-[min(100%,90rem)]'
      navItems={[
        {
          key: 'dashboard',
          label: dt('Tableau de bord', 'Dashboard'),
          icon: LayoutDashboard,
        },
        {
          key: 'chercheurs',
          label: dt('Charge chercheurs', 'Researcher workload'),
          icon: Users,
        },
        { key: 'search', label: dt('Recherche', 'Search'), icon: Search },
        {
          key: 'reports',
          label: dt('Rapports', 'Reports'),
          icon: FileBarChart2,
        },
        { key: 'profile', label: dt('Profil', 'Profile'), icon: Settings },
      ]}
    >
      <div className='mx-auto w-full max-w-7xl space-y-6'>
        <Card className='relative overflow-hidden border-0 bg-linear-to-br from-primary/15 via-primary/5 to-transparent'>
          <div
            className='pointer-events-none absolute right-6 top-1/2 -translate-y-1/2 select-none text-[5rem] font-black tabular-nums leading-none text-primary/6'
            aria-hidden
          >
            247
          </div>
          <CardContent className='relative flex flex-wrap items-center justify-between gap-4 px-6 py-5'>
            <div className='max-w-2xl space-y-2'>
              <div className='flex flex-wrap items-center gap-2'>
                <h1 className='text-xl font-semibold text-foreground'>
                  {dt('Tableau de bord laboratoire', 'Laboratory dashboard')}
                </h1>
                <Badge variant='outline' className='font-normal tabular-nums'>
                  {dt(
                    '120 dossiers affichés sur 247 au total',
                    '120 records shown out of 247 total',
                  )}
                </Badge>
              </div>
              <p className='text-sm text-muted-foreground'>
                {dt(
                  'Indicateurs agrégés, tendances et répartition thématique des encadrements.',
                  'Aggregated indicators, trends, and thematic supervision distribution.',
                )}
              </p>
              <p className='text-sm leading-relaxed text-muted-foreground'>
                {dt(
                  'Vue consolidée du laboratoire : volumes, répartition par axe et évolution dans le temps.',
                  'Consolidated laboratory view: volumes, distribution by axis, and evolution over time.',
                )}{' '}
                <span
                  className={cn(
                    buttonVariants({ variant: 'link', size: 'sm' }),
                    'h-auto p-0 align-baseline font-medium text-primary',
                  )}
                >
                  {dt(
                    'Voir la charge par enseignant',
                    'View workload by teacher',
                  )}
                </span>
              </p>
            </div>
            <div className='flex flex-wrap items-center gap-2'>
              {[
                [dt('Rapports', 'Reports'), FileBarChart2],
                [dt('Recherche', 'Search'), Search],
                [dt('Charge chercheurs', 'Researcher workload'), Users],
              ].map(([label, Icon]) => {
                const IconComponent = Icon as React.ElementType
                return (
                  <span
                    key={label as string}
                    className={cn(
                      buttonVariants({
                        size: 'sm',
                        variant:
                          label === dt('Rapports', 'Reports')
                            ? 'default'
                            : 'outline',
                      }),
                      'gap-2 whitespace-nowrap',
                    )}
                  >
                    <IconComponent
                      className='size-3.5 shrink-0'
                      strokeWidth={1.5}
                    />
                    {label as string}
                  </span>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <AdminSectionActionBar
          title={dt('Accès rapides', 'Quick access')}
          actions={[
            { label: dt('Charge chercheurs', 'Researcher workload') },
            { label: dt('Recherche', 'Search') },
            { label: dt('Rapports', 'Reports') },
          ]}
        />

        <Card className='border-border/70 shadow-none'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>
              {dt('File d’attention', 'Attention queue')}
            </CardTitle>
            <ClipboardClock
              className='size-4 text-muted-foreground'
              strokeWidth={1.5}
            />
          </CardHeader>
          <CardContent className='flex flex-wrap items-center justify-between gap-3'>
            <p className='text-sm text-foreground'>
              {dt(
                '18 encadrement(s) en attente de validation',
                '18 supervision record(s) awaiting validation',
              )}
            </p>
            <span
              className={cn(
                buttonVariants({ variant: 'outline', size: 'sm' }),
                'gap-1 transition-[transform] duration-200 active:scale-[0.98]',
              )}
            >
              {dt('Ouvrir la recherche', 'Open search')}
              <ArrowUpRight className='size-3.5' />
            </span>
          </CardContent>
        </Card>

        <div className='grid gap-4 lg:grid-cols-3'>
          <Card className='h-full border-0 bg-primary text-primary-foreground shadow-primary-sm transition-all hover:-translate-y-0.5'>
            <CardHeader className='flex flex-row items-start justify-between pb-3'>
              <CardTitle className='text-sm font-medium text-primary-foreground/70'>
                {dt('Total encadrements', 'Total supervisions')}
              </CardTitle>
              <div className='flex size-8 items-center justify-center rounded-lg bg-primary-foreground/15'>
                <BarChart3
                  className='size-4 text-primary-foreground'
                  strokeWidth={1.5}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className='text-4xl font-bold tabular-nums text-primary-foreground'>
                247
              </div>
              <p className='mt-1.5 text-xs text-primary-foreground/60'>
                {dt('Enregistrés dans le système', 'Registered in the system')}
              </p>
            </CardContent>
          </Card>
          <div className='grid grid-cols-2 gap-4 lg:col-span-2'>
            <AdminKpiTile
              label={dt('Enseignants actifs', 'Active teachers')}
              value={32}
              helper={dt(
                'Encadrants avec au moins un dossier en cours',
                'Supervisors with at least one active record',
              )}
              icon={Users}
            />
            <AdminKpiTile
              label={dt('Taux de soutenance', 'Defense rate')}
              value='78.4%'
              helper={dt(
                'Réalisées / dossiers de l’échantillon',
                'Completed / sample records',
              )}
              icon={GraduationCap}
            />
            <Card className='border-border/70 shadow-none lg:col-span-2'>
              <CardHeader className='flex flex-row items-start justify-between space-y-0 pb-2'>
                <CardTitle className='text-xs font-medium uppercase tracking-wider text-muted-foreground'>
                  {dt('Répartition par type', 'Distribution by type')}
                </CardTitle>
                <SlidersHorizontal
                  className='size-4 text-muted-foreground'
                  strokeWidth={1.5}
                />
              </CardHeader>
              <CardContent>
                <div className='flex flex-wrap items-end gap-4 sm:gap-6'>
                  {[
                    ['PFE', 93],
                    [dt('Doctorat', 'Doctorate'), 41],
                    ['Master', 68],
                    ['Stage', 45],
                  ].map(([label, value]) => (
                    <div key={label} className='min-w-0 text-center'>
                      <p className='tabular-nums text-2xl font-semibold tracking-tight text-foreground'>
                        {value}
                      </p>
                      <p className='mt-0.5 text-[11px] text-muted-foreground'>
                        {label}
                      </p>
                    </div>
                  ))}
                </div>
                <p className='mt-3 text-xs text-muted-foreground'>
                  {dt('Sur l’échantillon chargé', 'On the loaded sample')}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className='grid gap-4 lg:grid-cols-3'>
          <Card className='border-border/70 shadow-none'>
            <CardHeader className='flex flex-row items-start gap-2 pb-2'>
              <PieChartIcon
                className='mt-0.5 size-4 shrink-0 text-muted-foreground'
                aria-hidden
              />
              <CardTitle className='text-sm font-semibold'>
                {dt('Statuts des encadrements', 'Supervision statuses')}
              </CardTitle>
            </CardHeader>
            <CardContent className='pb-3'>
              <p className='mb-3 text-xs text-muted-foreground'>
                {dt(
                  'Répartition de l’état d’avancement des dossiers.',
                  'Distribution of record progress status.',
                )}
              </p>
              <div className='h-55 w-full sm:h-60'>
                <ResponsiveContainer width='100%' height='100%'>
                  <PieChart>
                    <Pie
                      data={directorSupervisionPieLocalized}
                      cx='50%'
                      cy='48%'
                      innerRadius={44}
                      outerRadius={76}
                      paddingAngle={2}
                      dataKey='value'
                      nameKey='name'
                      isAnimationActive={false}
                    >
                      {directorSupervisionPieLocalized.map((entry) => (
                        <Cell key={entry.name} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className='border-border/70 shadow-none lg:col-span-2'>
            <CardHeader className='flex flex-row items-start gap-2 pb-2'>
              <TrendingUp
                className='mt-0.5 size-4 shrink-0 text-muted-foreground'
                aria-hidden
              />
              <div>
                <CardTitle className='text-sm font-semibold'>
                  {dt('Évolution des encadrements', 'Supervision evolution')}
                </CardTitle>
                <p className='text-xs text-muted-foreground'>
                  {dt(
                    'Volume cumulé par année universitaire',
                    'Cumulative volume by academic year',
                  )}
                </p>
              </div>
            </CardHeader>
            <CardContent className='pb-3'>
              <div className='h-55 w-full sm:h-60'>
                <ResponsiveContainer width='100%' height='100%'>
                  <LineChart
                    data={directorByYear}
                    margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray='3 3'
                      className='stroke-muted'
                    />
                    <XAxis dataKey='year' tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip />
                    <Line
                      type='monotone'
                      dataKey='count'
                      name={dt('Encadrements', 'Supervisions')}
                      stroke={CHART_COLORS[0]}
                      strokeWidth={2}
                      dot={{ r: 3, fill: CHART_COLORS[0] }}
                      activeDot={{ r: 5 }}
                      animationDuration={0}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className='grid gap-4 lg:grid-cols-3'>
          <Card className='border-border/70 shadow-none lg:col-span-2'>
            <CardHeader className='flex flex-row items-start gap-2 pb-2'>
              <Layers
                className='mt-0.5 size-4 shrink-0 text-muted-foreground'
                aria-hidden
              />
              <div>
                <CardTitle className='text-sm font-semibold'>
                  {dt('Répartition thématique', 'Thematic distribution')}
                </CardTitle>
                <p className='text-xs text-muted-foreground'>
                  {dt(
                    'Axes les plus représentés dans les encadrements.',
                    'Most represented axes in supervisions.',
                  )}
                </p>
              </div>
            </CardHeader>
            <CardContent className='pb-3'>
              <div className='h-55 w-full sm:h-65'>
                <ResponsiveContainer width='100%' height='100%'>
                  <BarChart
                    layout='vertical'
                    data={thematicDataLocalized}
                    margin={{ top: 4, right: 12, left: 4, bottom: 4 }}
                  >
                    <CartesianGrid
                      strokeDasharray='3 3'
                      className='stroke-muted'
                      horizontal
                      vertical={false}
                    />
                    <XAxis
                      type='number'
                      allowDecimals={false}
                      tick={{ fontSize: 10 }}
                    />
                    <YAxis
                      type='category'
                      dataKey='name'
                      width={140}
                      tick={{ fontSize: 10 }}
                    />
                    <Tooltip />
                    <Bar
                      dataKey='count'
                      fill={CHART_COLORS[1]}
                      radius={[0, 6, 6, 0]}
                      maxBarSize={22}
                      animationDuration={0}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className='border-border/70 shadow-none'>
            <CardHeader className='flex flex-row items-start gap-2 pb-2'>
              <ShieldCheck
                className='mt-0.5 size-4 shrink-0 text-muted-foreground'
                aria-hidden
              />
              <CardTitle className='text-sm font-semibold'>
                {dt('Pipeline de validation', 'Validation pipeline')}
              </CardTitle>
            </CardHeader>
            <CardContent className='pb-3'>
              <p className='mb-3 text-xs text-muted-foreground'>
                {dt(
                  'État des décisions administratives.',
                  'Administrative decision status.',
                )}
              </p>
              <div className='h-55 w-full sm:h-65'>
                <ResponsiveContainer width='100%' height='100%'>
                  <PieChart>
                    <Pie
                      data={directorValidationPieLocalized}
                      cx='50%'
                      cy='48%'
                      innerRadius={44}
                      outerRadius={76}
                      paddingAngle={2}
                      dataKey='value'
                      nameKey='name'
                      isAnimationActive={false}
                    >
                      {directorValidationPieLocalized.map((entry) => (
                        <Cell key={entry.name} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <section className='grid gap-4 lg:grid-cols-3'>
          <AdminInsightCard
            title={dt('Enseignants actifs', 'Active teachers')}
            value={32}
            subtitle={dt(
              'Encadrants avec au moins un dossier en cours',
              'Supervisors with at least one active record',
            )}
            actionLabel={dt('Charge chercheurs', 'Researcher workload')}
          />
          <AdminInsightCard
            title={dt('Pipeline de validation', 'Validation pipeline')}
            value={18}
            subtitle={dt(
              'Dossiers en attente de décision.',
              'Records awaiting a decision.',
            )}
            actionLabel={dt('Ouvrir la recherche', 'Open search')}
          />
          <AdminInsightCard
            title={dt('Taux de soutenance', 'Defense rate')}
            value='78.4%'
            subtitle={dt(
              'Consulter les rapports analytiques.',
              'View analytical reports.',
            )}
            actionLabel={dt('Rapports', 'Reports')}
          />
        </section>
      </div>
    </StaticPortalShell>
  )
}

function AdminPortalSnapshot() {
  const dt = useDemoText()
  const totalUsers = 54
  const activeUsers = 49
  const inactiveUsers = 5
  const activeRate = 91
  const inactiveRate = 9
  const pending = 12
  const roleRows = [
    { role: 'ADMIN', label: dt('Administrateur', 'Administrator'), value: 3 },
    { role: 'DIRECTOR', label: dt('Direction', 'Director'), value: 2 },
    { role: 'RESEARCHER', label: dt('Chercheur', 'Researcher'), value: 42 },
    { role: 'ASSISTANT', label: 'Assistant', value: 7 },
  ]
  const roleDistribution = roleRows.map((row, index) => ({
    name: row.label,
    value: row.value,
    fill: CHART_COLORS[index % CHART_COLORS.length],
  }))
  const actionDistribution = [
    { action: 'CREATE', count: 8 },
    { action: 'UPDATE', count: 17 },
    { action: 'VALIDATE', count: 12 },
    { action: 'REVISE', count: 5 },
    { action: 'LOGIN', count: 21 },
  ]
  const logs = [
    {
      id: '1',
      time: dt('il y a 2 min', '2 min ago'),
      user: 'Khelouat Benbouzid',
      action: 'VALIDATE',
      entityType: 'Supervision',
    },
    {
      id: '2',
      time: dt('il y a 8 min', '8 min ago'),
      user: dt('Administrateur', 'Administrator'),
      action: 'CREATE',
      entityType: 'User',
    },
    {
      id: '3',
      time: dt('il y a 21 min', '21 min ago'),
      user: 'Si Tayeb',
      action: 'UPDATE',
      entityType: 'Theme',
    },
    {
      id: '4',
      time: dt('il y a 1 h', '1 h ago'),
      user: 'Benbouzid',
      action: 'REVISE',
      entityType: 'Supervision',
    },
  ]

  function actionBadgeClass(action: string) {
    if (action === 'CREATE')
      return 'rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
    if (action === 'UPDATE')
      return 'rounded-md bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-700 dark:bg-sky-900/30 dark:text-sky-400'
    if (action === 'VALIDATE')
      return 'rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary'
    if (action === 'REVISE')
      return 'rounded-md bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
    return 'rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground'
  }

  function roleBadgeClass(role: string) {
    if (role === 'ADMIN')
      return 'rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary'
    if (role === 'DIRECTOR')
      return 'rounded-md bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-700 dark:bg-violet-900/30 dark:text-violet-400'
    if (role === 'RESEARCHER')
      return 'rounded-md bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-700 dark:bg-sky-900/30 dark:text-sky-400'
    return 'rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
  }

  return (
    <StaticPortalShell
      portalLabel={dt('Administration', 'Administration')}
      pageTitle={dt('Tableau de bord', 'Dashboard')}
      currentUserName={dt('Administrateur', 'Administrator')}
      initials='AD'
      navItems={[
        {
          key: 'dashboard',
          label: dt('Tableau de bord', 'Dashboard'),
          icon: LayoutDashboard,
        },
        { key: 'users', label: dt('Utilisateurs', 'Users'), icon: Users },
        { key: 'teams', label: dt('Équipes', 'Teams'), icon: Building2 },
        { key: 'themes', label: dt('Thèmes', 'Themes'), icon: BookMarked },
        {
          key: 'audit-logs',
          label: dt('Journal d’audit', 'Audit log'),
          icon: ScrollText,
        },
      ]}
    >
      <div className='mx-auto w-full max-w-7xl space-y-6'>
        <Card className='relative overflow-hidden border-0 bg-linear-to-br from-primary/15 via-primary/5 to-transparent'>
          <div
            className='absolute right-6 top-1/2 -translate-y-1/2 select-none text-[5rem] font-black tabular-nums leading-none text-primary/6 pointer-events-none'
            aria-hidden
          >
            {pending}
          </div>
          <CardContent className='flex flex-wrap items-center justify-between gap-4 px-6 py-5'>
            <div className='space-y-1'>
              <h1 className='text-xl font-semibold text-foreground'>
                {dt(
                  'Tableau de bord administration',
                  'Administration dashboard',
                )}
              </h1>
              <p className='text-sm text-muted-foreground'>
                {dt(
                  'Pilotage des utilisateurs, équipes, thèmes et journaux d’audit.',
                  'Manage users, teams, themes, and audit logs.',
                )}
              </p>
            </div>
            <div className='flex flex-wrap items-center gap-2'>
              <span
                className={cn(
                  buttonVariants({ size: 'sm' }),
                  'gap-2 whitespace-nowrap shadow-primary-sm',
                )}
              >
                <UserPlus className='size-3.5 shrink-0' strokeWidth={1.5} />
                {dt('Créer un utilisateur', 'Create a user')}
              </span>
              <span
                className={cn(
                  buttonVariants({ size: 'sm', variant: 'outline' }),
                  'gap-2 whitespace-nowrap',
                )}
              >
                <BookMarked className='size-3.5 shrink-0' strokeWidth={1.5} />
                {dt('Gérer les thèmes', 'Manage themes')}
              </span>
            </div>
          </CardContent>
        </Card>

        <AdminSectionActionBar
          title='Workflow'
          actions={[
            { label: dt('Créer un utilisateur', 'Create a user') },
            { label: dt('Gérer les équipes', 'Manage teams') },
            { label: dt('Gérer les thèmes', 'Manage themes') },
            { label: dt('Voir les journaux', 'View logs') },
          ]}
        />

        <div className='grid gap-4 lg:grid-cols-3'>
          <Card className='h-full cursor-pointer border-0 bg-primary text-primary-foreground shadow-primary-sm transition-all hover:-translate-y-0.5'>
            <CardHeader className='flex flex-row items-start justify-between pb-3'>
              <CardTitle className='text-sm font-medium text-primary-foreground/70'>
                {dt('Total utilisateurs', 'Total users')}
              </CardTitle>
              <div className='flex size-8 items-center justify-center rounded-lg bg-primary-foreground/15'>
                <Users className='size-4 text-primary-foreground' />
              </div>
            </CardHeader>
            <CardContent>
              <div className='text-4xl font-bold tabular-nums text-primary-foreground'>
                {totalUsers}
              </div>
              <p className='mt-1.5 text-xs text-primary-foreground/60'>
                {dt(
                  `${activeUsers} actifs / ${inactiveUsers} inactifs`,
                  `${activeUsers} active / ${inactiveUsers} inactive`,
                )}
              </p>
            </CardContent>
          </Card>
          <div className='grid grid-cols-2 gap-4 lg:col-span-2'>
            <AdminKpiTile
              label={dt('Encadrements', 'Supervisions')}
              value={247}
              helper={dt(`${pending} en attente`, `${pending} pending`)}
              icon={ClipboardList}
            />
            <AdminKpiTile
              label={dt('Activité récente', 'Recent activity')}
              value={63}
              helper={dt('7 derniers jours', 'Last 7 days')}
              icon={Activity}
            />
            <AdminKpiTile
              label={dt('Taux actifs', 'Active rate')}
              value={`${activeRate}%`}
              helper={dt('Comptes activés', 'Enabled accounts')}
              icon={UserCheck}
              trend={activeRate}
            />
            <AdminKpiTile
              label={dt('Taux inactifs', 'Inactive rate')}
              value={`${inactiveRate}%`}
              helper={dt('Comptes désactivés', 'Disabled accounts')}
              icon={ShieldAlert}
              trend={-inactiveRate}
            />
          </div>
        </div>

        <div className='grid gap-4 lg:grid-cols-3'>
          <Card>
            <CardHeader>
              <CardTitle className='text-sm font-semibold'>
                {dt('Répartition par rôle', 'Distribution by role')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='h-48'>
                <ResponsiveContainer width='100%' height='100%'>
                  <PieChart>
                    <Pie
                      data={roleDistribution}
                      dataKey='value'
                      nameKey='name'
                      cx='50%'
                      cy='50%'
                      outerRadius={70}
                      label={({ name, value }) => `${name} ${value}`}
                      labelLine={false}
                      isAnimationActive={false}
                    >
                      {roleDistribution.map((entry) => (
                        <Cell key={entry.name} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className='mt-2 flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs text-muted-foreground'>
                {roleRows.map((row, index) => (
                  <li key={row.role} className='flex items-center gap-1'>
                    <span
                      className='inline-block size-2 rounded-sm'
                      style={{
                        background: CHART_COLORS[index % CHART_COLORS.length],
                      }}
                    />
                    {row.label}: {row.value}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className='lg:col-span-2'>
            <CardHeader>
              <CardTitle className='text-sm font-semibold'>
                {dt(
                  'Composition des actions récentes',
                  'Recent action composition',
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='h-48'>
                <ResponsiveContainer width='100%' height='100%'>
                  <BarChart
                    data={actionDistribution}
                    margin={{ top: 4, right: 12, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray='3 3'
                      className='stroke-muted'
                    />
                    <XAxis dataKey='action' tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip />
                    <Bar
                      dataKey='count'
                      fill='var(--chart-1)'
                      radius={[4, 4, 0, 0]}
                      isAnimationActive={false}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <section aria-labelledby='admin-recent-audit-heading'>
          <Card className='overflow-hidden border-border/70 shadow-none'>
            <CardHeader className='flex flex-row flex-wrap items-center justify-between gap-2 border-b border-border/60 py-4'>
              <CardTitle
                id='admin-recent-audit-heading'
                className='text-base font-semibold tracking-tight'
              >
                {dt('Activité récente', 'Recent activity')}
              </CardTitle>
              <span
                className={cn(
                  buttonVariants({ variant: 'ghost', size: 'sm' }),
                  'gap-1 text-muted-foreground',
                )}
              >
                {dt('Tout voir', 'View all')}
                <ChevronRight className='size-3.5' />
              </span>
            </CardHeader>
            <CardContent className='p-0'>
              <ul className='divide-y divide-border/60'>
                {logs.map((log) => (
                  <li key={log.id}>
                    <div className='flex flex-wrap items-center gap-x-4 gap-y-2 px-6 py-3.5 text-sm transition-colors hover:bg-muted/30'>
                      <span className='tabular shrink-0 text-xs text-muted-foreground'>
                        {log.time}
                      </span>
                      <span className='min-w-0 shrink truncate font-medium text-foreground'>
                        {log.user}
                      </span>
                      <span
                        className={cn('shrink-0', actionBadgeClass(log.action))}
                      >
                        {log.action}
                      </span>
                      <span className='min-w-0 flex-1 truncate text-muted-foreground'>
                        {log.entityType}
                      </span>
                      <span
                        className={cn(
                          buttonVariants({ variant: 'ghost', size: 'xs' }),
                          'ml-auto h-6 shrink-0 px-2 text-xs',
                        )}
                      >
                        {dt('Voir', 'View')}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>

        <section className='grid gap-4 lg:grid-cols-3'>
          <AdminInsightCard
            title={dt('Actions cette semaine', 'Actions this week')}
            value={63}
            subtitle={dt(
              'Activité administrative sur les 7 derniers jours.',
              'Administrative activity over the last 7 days.',
            )}
            actionTo={false}
          />
          <AdminInsightCard
            title={dt('Pression de validation', 'Validation pressure')}
            value={`${pending}/247`}
            subtitle={dt(
              'Dossiers nécessitant un suivi administratif.',
              'Records requiring administrative follow-up.',
            )}
            actionLabel={dt('Aller à la file', 'Go to queue')}
          />
          <AdminInsightCard
            title={dt('Signal de croissance', 'Growth signal')}
            value={totalUsers}
            subtitle={dt(
              'Comptes structurés dans le portail.',
              'Structured accounts in the portal.',
            )}
            actionLabel={dt('Gérer les utilisateurs', 'Manage users')}
          />
        </section>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between'>
            <CardTitle className='text-sm font-semibold flex items-center gap-2'>
              <BarChart3 className='size-4 shrink-0' strokeWidth={1.5} />
              {dt('Liste opérationnelle des rôles', 'Operational role list')}
            </CardTitle>
            <span className='flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors'>
              <ArrowRight className='size-3.5' strokeWidth={1.5} />
            </span>
          </CardHeader>
          <CardContent className='p-0'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{dt('Rôle', 'Role')}</TableHead>
                  <TableHead className='text-right'>
                    {dt('Utilisateurs', 'Users')}
                  </TableHead>
                  <TableHead className='w-[45%]'>
                    {dt('Part', 'Share')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roleRows.map((row, index) => (
                  <TableRow key={row.role} className='hover:bg-muted/30'>
                    <TableCell>
                      <span className={roleBadgeClass(row.role)}>
                        {row.label}
                      </span>
                    </TableCell>
                    <TableCell className='tabular text-right'>
                      {row.value}
                    </TableCell>
                    <TableCell>
                      <div className='h-1.5 w-full overflow-hidden rounded-full bg-muted'>
                        <div
                          className='h-full rounded-full'
                          style={{
                            width: `${(row.value / totalUsers) * 100}%`,
                            background:
                              CHART_COLORS[index % CHART_COLORS.length],
                          }}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </StaticPortalShell>
  )
}

const portalComponents: Record<PortalId, () => React.ReactElement> = {
  direction: DirectionPortalSnapshot,
  researcher: () => <ResearcherPortalSnapshot />,
  assistant: AssistantPortalSnapshot,
  admin: AdminPortalSnapshot,
}

export function DashboardPreview() {
  const { t } = useTranslation()
  const [activePortal, setActivePortal] = useState<PortalId>('direction')
  const ActivePortal = portalComponents[activePortal]

  return (
    <LandingSection id='dashboard' muted containerClassName='max-w-7xl'>
      <div className='grid gap-8 lg:grid-cols-[0.42fr_0.58fr] lg:items-end'>
        <ScrollReveal>
          <SectionHeader
            eyebrow={t('landing.dashboard.eyebrow')}
            headline={t('landing.dashboard.headline')}
            subheading={t('landing.dashboard.subheading')}
          />
        </ScrollReveal>

        <ScrollReveal delay={80} direction='right'>
          <PortalCard className='bg-card/80'>
            <div className='space-y-4'>
              <p className='text-sm font-semibold tracking-tight text-foreground'>
                {t('landing.dashboard.panel_title')}
              </p>
              <p className='text-sm leading-relaxed text-muted-foreground'>
                {t('landing.dashboard.panel_desc')}
              </p>
            </div>
          </PortalCard>
        </ScrollReveal>
      </div>

      <ScrollReveal delay={120}>
        <div className='mt-10 grid gap-2 rounded-2xl border border-border bg-card p-2 lg:grid-cols-4'>
          {portalTabs.map(({ id, labelKey, descriptionKey, icon: Icon }) => {
            const active = activePortal === id
            return (
              <button
                key={id}
                type='button'
                onClick={() => setActivePortal(id)}
                className={cn(
                  'group rounded-xl border px-4 py-3 text-left transition-colors',
                  active
                    ? 'border-primary/25 bg-primary/8 text-primary'
                    : 'border-transparent text-muted-foreground hover:border-border hover:bg-muted/60 hover:text-foreground',
                )}
              >
                <span className='mb-2 flex items-center gap-2 text-sm font-semibold'>
                  <Icon className='size-4 shrink-0' strokeWidth={1.5} />
                  {t(labelKey)}
                </span>
                <span
                  className={cn(
                    'block text-xs leading-relaxed',
                    active ? 'text-primary/80' : 'text-muted-foreground',
                  )}
                >
                  {t(descriptionKey)}
                </span>
              </button>
            )
          })}
        </div>
      </ScrollReveal>

      <ScrollReveal delay={180}>
        <div className='mt-6 rounded-2xl border border-border bg-background p-3 shadow-primary-sm'>
          <div className='mb-3 flex items-center justify-between px-1'>
            <div className='flex items-center gap-1.5'>
              <span className='size-2 rounded-full bg-primary/40' />
              <span className='size-2 rounded-full bg-primary/25' />
              <span className='size-2 rounded-full bg-primary/15' />
            </div>
            <span className='text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground'>
              {t('landing.dashboard.stage_label')}
            </span>
          </div>
          <div
            className='relative overflow-hidden rounded-xl border border-border bg-muted/30'
            style={{ height: DASHBOARD_STAGE_HEIGHT }}
          >
            <div
              style={{
                transform: `scale(${DASHBOARD_PREVIEW_SCALE})`,
                transformOrigin: 'top left',
                width: `${100 / DASHBOARD_PREVIEW_SCALE}%`,
                height: `${100 / DASHBOARD_PREVIEW_SCALE}%`,
                pointerEvents: 'none',
                userSelect: 'none',
              }}
            >
              <ActivePortal />
            </div>
          </div>
        </div>
      </ScrollReveal>
    </LandingSection>
  )
}
