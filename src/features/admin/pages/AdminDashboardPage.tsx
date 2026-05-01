import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Users,
  UserPlus,
  BookMarked,
  ShieldAlert,
  Activity,
  ClipboardList,
  BarChart3,
  ChevronRight,
  AlertTriangle,
  UserCheck,
  ArrowRight,
} from 'lucide-react'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { ROUTES } from '@/config/routes'
import { useAdminStats } from '@/features/admin/hooks/useAdminStats'
import { useAuditLogs } from '@/features/admin/hooks/useAuditLogs'
import {
  adminActionBadgeClass,
  adminRoleBadgeClass,
} from '@/features/admin/lib/adminBadgeStyles'
import {
  AdminEmptyStatePanel,
  AdminInsightCard,
  AdminKpiTile,
  AdminSectionActionBar,
} from '@/features/admin/components'

const CHART_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
]

export default function AdminDashboardPage() {
  const { t } = useTranslation()

  const { data: stats, isLoading: statsLoading } = useAdminStats()
  const { data: logsPage, isLoading: logsLoading } = useAuditLogs({ limit: 10 })

  const logs = logsPage?.data ?? []
  const totalUsers = stats?.users.total ?? 0
  const activeUsers = stats?.users.active ?? 0
  const inactiveUsers = stats?.users.inactive ?? 0
  const activeRate =
    totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0
  const inactiveRate =
    totalUsers > 0 ? Math.round((inactiveUsers / totalUsers) * 100) : 0
  const pending = stats?.supervisions.byValidationStatus.PENDING ?? 0

  const roleRows = useMemo(
    () => [
      {
        role: 'ADMIN',
        label: t('admin.users.roles.admin'),
        value: stats?.users.byRole.ADMIN ?? 0,
      },
      {
        role: 'DIRECTOR',
        label: t('admin.users.roles.director'),
        value: stats?.users.byRole.DIRECTOR ?? 0,
      },
      {
        role: 'RESEARCHER',
        label: t('admin.users.roles.researcher'),
        value: stats?.users.byRole.RESEARCHER ?? 0,
      },
      {
        role: 'ASSISTANT',
        label: t('admin.users.roles.assistant'),
        value: stats?.users.byRole.ASSISTANT ?? 0,
      },
    ],
    [stats, t],
  )

  const roleDistribution = useMemo(
    () =>
      roleRows.map((r, i) => ({
        name: r.label,
        value: r.value,
        fill: CHART_COLORS[i % CHART_COLORS.length],
      })),
    [roleRows],
  )

  const actionDistribution = useMemo(() => {
    const counts: Record<string, number> = {}
    logs.forEach((log) => {
      counts[log.action] = (counts[log.action] ?? 0) + 1
    })
    return Object.entries(counts).map(([action, count]) => ({ action, count }))
  }, [logs])

  function formatRelativeTime(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime()
    const minutes = Math.floor(diff / 60_000)
    if (minutes < 1) return t('admin.dashboard.time.justNow')
    if (minutes < 60) {
      return t('admin.dashboard.time.minutesAgo', { count: minutes })
    }
    const hours = Math.floor(minutes / 60)
    if (hours < 24) {
      return t('admin.dashboard.time.hoursAgo', { count: hours })
    }
    return t('admin.dashboard.time.daysAgo', { count: Math.floor(hours / 24) })
  }

  return (
    <div className='mx-auto w-full max-w-7xl space-y-6'>
      <Card className='relative overflow-hidden border-0 bg-linear-to-br from-primary/15 via-primary/5 to-transparent'>
        {pending > 0 && (
          <div
            className='absolute right-6 top-1/2 -translate-y-1/2 select-none text-[5rem] font-black tabular-nums leading-none text-primary/6 pointer-events-none'
            aria-hidden
          >
            {pending}
          </div>
        )}
        <CardContent className='flex flex-wrap items-center justify-between gap-4 px-6 py-5'>
          <div className='space-y-1'>
            <h1 className='text-xl font-semibold text-foreground'>
              {t('admin.dashboard.title')}
            </h1>
            <p className='text-sm text-muted-foreground'>
              {t('admin.dashboard.subtitle')}
            </p>
          </div>
          <div className='flex flex-wrap items-center gap-2'>
            <Link
              to={ROUTES.ADMIN_USERS_NEW}
              className={cn(
                buttonVariants({ size: 'sm' }),
                'gap-2 whitespace-nowrap shadow-primary-sm',
              )}
            >
              <UserPlus className='size-3.5 shrink-0' strokeWidth={1.5} />
              {t('admin.dashboard.createUser')}
            </Link>
            <Link
              to={ROUTES.ADMIN_THEMES}
              className={cn(
                buttonVariants({ size: 'sm', variant: 'outline' }),
                'gap-2 whitespace-nowrap',
              )}
            >
              <BookMarked className='size-3.5 shrink-0' strokeWidth={1.5} />
              {t('admin.dashboard.manageThemes')}
            </Link>
          </div>
        </CardContent>
      </Card>

      <AdminSectionActionBar
        title={t('admin.dashboard.workflow')}
        actions={[
          {
            label: t('admin.dashboard.createUser'),
            to: ROUTES.ADMIN_USERS_NEW,
          },
          { label: t('admin.dashboard.manageTeams'), to: ROUTES.ADMIN_TEAMS },
          { label: t('admin.dashboard.manageThemes'), to: ROUTES.ADMIN_THEMES },
          {
            label: t('admin.dashboard.viewAuditLogs'),
            to: ROUTES.ADMIN_AUDIT_LOGS,
          },
        ]}
      />

      {statsLoading ? (
        <div className='grid gap-4 lg:grid-cols-3'>
          <Card>
            <CardContent className='py-8'>
              <div className='h-20 animate-pulse rounded-lg bg-muted' />
            </CardContent>
          </Card>
          <div className='grid grid-cols-2 gap-4 lg:col-span-2'>
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className='py-6'>
                  <div className='h-12 animate-pulse rounded-lg bg-muted' />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <div className='grid gap-4 lg:grid-cols-3'>
          <Card className='h-full cursor-pointer border-0 bg-primary text-primary-foreground shadow-primary-sm transition-all hover:-translate-y-0.5'>
            <CardHeader className='flex flex-row items-start justify-between pb-3'>
              <CardTitle className='text-sm font-medium text-primary-foreground/70'>
                {t('admin.dashboard.totalUsers')}
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
                {activeUsers} {t('admin.dashboard.active')} / {inactiveUsers}{' '}
                {t('admin.dashboard.inactive')}
              </p>
            </CardContent>
          </Card>
          <div className='grid grid-cols-2 gap-4 lg:col-span-2'>
            <AdminKpiTile
              label={t('admin.dashboard.supervisions')}
              value={stats?.supervisions.total ?? 0}
              helper={`${pending} ${t('admin.dashboard.pending')}`}
              icon={ClipboardList}
            />
            <AdminKpiTile
              label={t('admin.dashboard.recentActivity')}
              value={stats?.recentActivity.count ?? 0}
              helper={t('admin.dashboard.last7Days')}
              icon={Activity}
            />
            <AdminKpiTile
              label={t('admin.dashboard.activeRate')}
              value={`${activeRate}%`}
              helper={t('admin.dashboard.enabledAccounts')}
              icon={UserCheck}
              trend={activeRate}
            />
            <AdminKpiTile
              label={t('admin.dashboard.riskRate')}
              value={`${inactiveRate}%`}
              helper={t('admin.dashboard.inactiveAccounts')}
              icon={ShieldAlert}
              trend={-inactiveRate}
            />
          </div>
        </div>
      )}

      <div className='grid gap-4 lg:grid-cols-3'>
        <Card>
          <CardHeader>
            <CardTitle className='text-sm font-semibold'>
              {t('admin.dashboard.byRole')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {roleDistribution.filter((r) => r.value > 0).length === 0 ? (
              <div className='flex h-48 items-center justify-center text-sm text-muted-foreground'>
                {t('admin.auditLogs.noLogs')}
              </div>
            ) : (
              <>
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
                        isAnimationActive
                        animationDuration={600}
                      >
                        {roleDistribution.map((entry, i) => (
                          <Cell
                            key={entry.name}
                            fill={
                              entry.fill ??
                              CHART_COLORS[i % CHART_COLORS.length]
                            }
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <ul className='mt-2 flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs text-muted-foreground'>
                  {roleRows.map((d, i) => (
                    <li key={d.role} className='flex items-center gap-1'>
                      <span
                        className='inline-block size-2 rounded-sm'
                        style={{
                          background: CHART_COLORS[i % CHART_COLORS.length],
                        }}
                      />
                      {d.label}: {d.value}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </CardContent>
        </Card>

        <Card className='lg:col-span-2'>
          <CardHeader>
            <CardTitle className='text-sm font-semibold'>
              {t('admin.dashboard.recentActionsMix')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {actionDistribution.length === 0 ? (
              <div className='flex h-48 items-center justify-center text-sm text-muted-foreground'>
                {t('admin.auditLogs.noLogs')}
              </div>
            ) : (
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
                      isAnimationActive
                      animationDuration={600}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
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
              {t('admin.dashboard.recentActivity')}
            </CardTitle>
            <Link
              to={ROUTES.ADMIN_AUDIT_LOGS}
              className={cn(
                buttonVariants({ variant: 'ghost', size: 'sm' }),
                'gap-1 text-muted-foreground',
              )}
            >
              {t('admin.dashboard.viewAll')}
              <ChevronRight className='size-3.5' />
            </Link>
          </CardHeader>
          <CardContent className='p-0'>
            {logsLoading ? (
              <div className='divide-y divide-border/60'>
                {[...Array(5)].map((_, i) => (
                  <div key={i} className='flex items-center gap-4 px-6 py-4'>
                    <div className='h-4 w-14 animate-pulse rounded bg-muted' />
                    <div className='h-4 w-32 animate-pulse rounded bg-muted' />
                    <div className='h-5 w-16 animate-pulse rounded bg-muted' />
                    <div className='h-4 flex-1 animate-pulse rounded bg-muted' />
                  </div>
                ))}
              </div>
            ) : logs.length === 0 ? (
              <div className='px-6 py-10'>
                <AdminEmptyStatePanel
                  title={t('admin.dashboard.noRecentAdminActivity')}
                  description={t('admin.auditLogs.noLogs')}
                  icon={AlertTriangle}
                  ctaLabel={t('admin.dashboard.viewAuditLogs')}
                  ctaTo={ROUTES.ADMIN_AUDIT_LOGS}
                />
              </div>
            ) : (
              <ul className='divide-y divide-border/60'>
                {logs.map((log) => (
                  <li key={log.id}>
                    <div className='flex flex-wrap items-center gap-x-4 gap-y-2 px-6 py-3.5 text-sm transition-colors hover:bg-muted/30'>
                      <span className='tabular shrink-0 text-xs text-muted-foreground'>
                        {formatRelativeTime(log.createdAt)}
                      </span>
                      <span className='min-w-0 shrink truncate font-medium text-foreground'>
                        {log.user
                          ? `${log.user.firstName} ${log.user.lastName}`
                          : t('common.notAvailable')}
                      </span>
                      <span
                        className={cn(
                          'shrink-0',
                          adminActionBadgeClass(log.action),
                        )}
                      >
                        {log.action}
                      </span>
                      <span className='min-w-0 flex-1 truncate text-muted-foreground'>
                        {log.entityType}
                      </span>
                      <Link
                        to={ROUTES.ADMIN_AUDIT_LOGS}
                        className={cn(
                          buttonVariants({ variant: 'ghost', size: 'xs' }),
                          'ml-auto h-6 shrink-0 px-2 text-xs',
                        )}
                      >
                        {t('common.view')}
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </section>

      <section className='grid gap-4 lg:grid-cols-3'>
        <AdminInsightCard
          title={t('admin.dashboard.actionsThisWeek')}
          value={stats?.recentActivity.count ?? 0}
          subtitle={t('admin.dashboard.actionsThisWeekSubtitle')}
        />
        <AdminInsightCard
          title={t('admin.dashboard.approvalPressure')}
          value={`${pending}/${stats?.supervisions.total ?? 0}`}
          subtitle={t('admin.dashboard.approvalPressureSubtitle')}
          actionLabel={t('admin.dashboard.goToQueue')}
          actionTo={ROUTES.ADMIN_AUDIT_LOGS}
        />
        <AdminInsightCard
          title={t('admin.dashboard.growthSignal')}
          value={totalUsers}
          subtitle={t('admin.dashboard.growthSignalSubtitle')}
          actionLabel={t('admin.dashboard.manageUsers')}
          actionTo={ROUTES.ADMIN_USERS}
        />
      </section>

      <Card>
        <CardHeader className='flex flex-row items-center justify-between'>
          <CardTitle className='text-sm font-semibold flex items-center gap-2'>
            <BarChart3 className='size-4 shrink-0' strokeWidth={1.5} />
            {t('admin.dashboard.operationalRoleList')}
          </CardTitle>
          <Link
            to={ROUTES.ADMIN_USERS}
            className='flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors'
            aria-label={t('admin.dashboard.manageUsers')}
          >
            <ArrowRight className='size-3.5' strokeWidth={1.5} />
          </Link>
        </CardHeader>
        <CardContent className='p-0'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('admin.users.role')}</TableHead>
                <TableHead className='text-right'>
                  {t('admin.dashboard.usersColumn')}
                </TableHead>
                <TableHead className='w-[45%]'>
                  {t('admin.dashboard.shareColumn')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roleRows.map((row, i) => (
                <TableRow key={row.role} className='hover:bg-muted/30'>
                  <TableCell>
                    <span className={adminRoleBadgeClass(row.role)}>
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
                          width: `${
                            totalUsers > 0 ? (row.value / totalUsers) * 100 : 0
                          }%`,
                          background: CHART_COLORS[i % CHART_COLORS.length],
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
  )
}
