import { Fragment, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronDown, ChevronRight } from 'lucide-react'
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
import { cn } from '@/lib/utils'
import { useAuditLogs } from '@/features/admin/hooks/useAuditLogs'
import type { UserRole } from '@/features/admin/api/userApi'
import {
  adminActionBadgeClass,
  adminRoleBadgeClass,
} from '@/features/admin/lib/adminBadgeStyles'
import {
  AdminEmptyStatePanel,
  AdminInsightCard,
} from '@/features/admin/components'

const LIMIT = 20

function formatChanges(changes: unknown): { key: string; value: string }[] {
  if (!changes || typeof changes !== 'object') return []
  return Object.entries(changes as Record<string, unknown>).map(
    ([key, value]) => ({
      key,
      value: typeof value === 'object' ? JSON.stringify(value) : String(value),
    }),
  )
}

export default function AuditLogPage() {
  const { t } = useTranslation()

  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [action, setAction] = useState('')
  const [entityType, setEntityType] = useState('')
  const [page, setPage] = useState(1)
  const [expandedRow, setExpandedRow] = useState<string | null>(null)

  const filters = {
    from: from || undefined,
    to: to || undefined,
    action: action || undefined,
    entityType: entityType || undefined,
    page,
    limit: LIMIT,
  }

  const { data, isLoading, isError } = useAuditLogs(filters)

  const logs = data?.data ?? []
  const total = data?.total ?? 0
  const totalPages = Math.ceil(total / LIMIT)
  const systemEvents = logs.filter((log) => !log.user).length
  const uniqueActors = new Set(logs.map((log) => log.user?.id).filter(Boolean))
    .size
  const roleLabel: Record<UserRole, string> = {
    ADMIN: t('admin.users.roles.admin'),
    DIRECTOR: t('admin.users.roles.director'),
    RESEARCHER: t('admin.users.roles.researcher'),
    ASSISTANT: t('admin.users.roles.assistant'),
  }

  function resetFilters() {
    setFrom('')
    setTo('')
    setAction('')
    setEntityType('')
    setPage(1)
  }

  return (
    <div className='space-y-8'>
      <header className='max-w-2xl space-y-1'>
        <h1 className='text-balance text-3xl font-semibold tracking-tight text-foreground'>
          {t('admin.auditLogs.title')}
        </h1>
        <p className='text-pretty text-sm leading-relaxed text-muted-foreground'>
          {t('admin.auditLogs.subtitle')}
        </p>
      </header>

      <Card className='border-border/70 shadow-none'>
        <CardContent className='grid gap-3 border-b border-border/60 p-4 md:grid-cols-3'>
          <AdminInsightCard
            title={t('admin.auditLogs.entriesLoaded')}
            value={logs.length}
            subtitle={t('admin.auditLogs.entriesLoadedSubtitle')}
          />
          <AdminInsightCard
            title={t('admin.auditLogs.uniqueActors')}
            value={uniqueActors}
            subtitle={t('admin.auditLogs.uniqueActorsSubtitle')}
          />
          <AdminInsightCard
            title={t('admin.auditLogs.systemEvents')}
            value={systemEvents}
            subtitle={t('admin.auditLogs.systemEventsSubtitle')}
          />
        </CardContent>
        <CardContent className='flex flex-wrap items-end gap-3 border-b border-border/60 p-4'>
          <div className='flex flex-col gap-1.5'>
            <span className='text-xs font-medium text-muted-foreground'>
              {t('admin.auditLogs.from')}
            </span>
            <Input
              type='date'
              value={from}
              onChange={(e) => {
                setFrom(e.target.value)
                setPage(1)
              }}
              className='h-10 w-40 rounded-lg text-sm'
            />
          </div>
          <div className='flex flex-col gap-1.5'>
            <span className='text-xs font-medium text-muted-foreground'>
              {t('admin.auditLogs.to')}
            </span>
            <Input
              type='date'
              value={to}
              onChange={(e) => {
                setTo(e.target.value)
                setPage(1)
              }}
              className='h-10 w-40 rounded-lg text-sm'
            />
          </div>
          <div className='flex flex-col gap-1.5'>
            <span className='sr-only'>{t('admin.auditLogs.action')}</span>
            <select
              value={action}
              onChange={(e) => {
                setAction(e.target.value)
                setPage(1)
              }}
              className='h-10 rounded-lg border border-input bg-background px-3 text-sm shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
              aria-label={t('admin.auditLogs.action')}
            >
              <option value=''>{t('admin.auditLogs.allActions')}</option>
              <option value='CREATE'>
                {t('admin.auditLogs.actions.create')}
              </option>
              <option value='UPDATE'>
                {t('admin.auditLogs.actions.update')}
              </option>
              <option value='DELETE'>
                {t('admin.auditLogs.actions.delete')}
              </option>
              <option value='LOGIN'>
                {t('admin.auditLogs.actions.login')}
              </option>
              <option value='VALIDATE'>
                {t('admin.auditLogs.actions.validate')}
              </option>
              <option value='REJECT'>
                {t('admin.auditLogs.actions.reject')}
              </option>
              <option value='REVISE'>
                {t('admin.auditLogs.actions.revise')}
              </option>
            </select>
          </div>
          <div className='flex flex-col gap-1.5'>
            <span className='sr-only'>{t('admin.auditLogs.entityType')}</span>
            <select
              value={entityType}
              onChange={(e) => {
                setEntityType(e.target.value)
                setPage(1)
              }}
              className='h-10 min-w-[10rem] rounded-lg border border-input bg-background px-3 text-sm shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
              aria-label={t('admin.auditLogs.entityType')}
            >
              <option value=''>{t('admin.auditLogs.allEntities')}</option>
              <option value='User'>{t('admin.auditLogs.entities.user')}</option>
              <option value='Supervision'>
                {t('admin.auditLogs.entities.supervision')}
              </option>
              <option value='Student'>
                {t('admin.auditLogs.entities.student')}
              </option>
              <option value='Theme'>
                {t('admin.auditLogs.entities.theme')}
              </option>
              <option value='Team'>{t('admin.auditLogs.entities.team')}</option>
            </select>
          </div>
          {(from || to || action || entityType) && (
            <Button
              variant='ghost'
              size='sm'
              className='rounded-lg'
              onClick={resetFilters}
            >
              {t('common.reset')}
            </Button>
          )}
        </CardContent>

        {!isLoading && !isError && (
          <CardContent className='border-b border-border/60 px-4 py-3'>
            <p className='tabular text-sm text-muted-foreground'>
              {total}{' '}
              {total === 1
                ? t('admin.auditLogs.entryCountOne')
                : t('admin.auditLogs.entryCountMany')}
            </p>
          </CardContent>
        )}

        <CardContent className='p-0'>
          <div className='overflow-x-auto'>
            <Table>
              <TableHeader>
                <TableRow className='border-border/60 hover:bg-transparent'>
                  <TableHead className='w-8' />
                  <TableHead className='text-xs font-medium uppercase tracking-wider text-muted-foreground'>
                    {t('admin.auditLogs.timestamp')}
                  </TableHead>
                  <TableHead className='text-xs font-medium uppercase tracking-wider text-muted-foreground'>
                    {t('admin.auditLogs.user')}
                  </TableHead>
                  <TableHead className='text-xs font-medium uppercase tracking-wider text-muted-foreground'>
                    {t('admin.auditLogs.action')}
                  </TableHead>
                  <TableHead className='text-xs font-medium uppercase tracking-wider text-muted-foreground'>
                    {t('admin.auditLogs.entityType')}
                  </TableHead>
                  <TableHead className='hidden text-xs font-medium uppercase tracking-wider text-muted-foreground lg:table-cell'>
                    {t('admin.auditLogs.entityId')}
                  </TableHead>
                  <TableHead className='hidden text-xs font-medium uppercase tracking-wider text-muted-foreground xl:table-cell'>
                    {t('admin.auditLogs.ipAddress')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  [...Array(8)].map((_, i) => (
                    <TableRow key={i}>
                      {[...Array(7)].map((__, j) => (
                        <TableCell key={j}>
                          <div className='h-4 w-full animate-pulse rounded bg-muted' />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : isError ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className='py-12 text-center text-sm text-destructive'
                    >
                      {t('admin.auditLogs.loadError')}
                    </TableCell>
                  </TableRow>
                ) : logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className='py-8'>
                      <AdminEmptyStatePanel
                        title={t('admin.auditLogs.noAuditEventsFound')}
                        description={
                          from || to || action || entityType
                            ? t('admin.auditLogs.noLogsFiltered')
                            : t('admin.auditLogs.noLogs')
                        }
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => {
                    const isExpanded = expandedRow === log.id
                    const changes = formatChanges(log.changes)
                    const hasChanges = changes.length > 0

                    return (
                      <Fragment key={log.id}>
                        <TableRow
                          className={cn(
                            hasChanges && 'cursor-pointer hover:bg-muted/35',
                            isExpanded && 'bg-muted/25',
                          )}
                          onClick={() =>
                            hasChanges &&
                            setExpandedRow(isExpanded ? null : log.id)
                          }
                        >
                          <TableCell className='w-8'>
                            {hasChanges ? (
                              isExpanded ? (
                                <ChevronDown className='size-3.5 text-muted-foreground' />
                              ) : (
                                <ChevronRight className='size-3.5 text-muted-foreground' />
                              )
                            ) : null}
                          </TableCell>
                          <TableCell className='whitespace-nowrap text-sm tabular text-muted-foreground'>
                            {new Date(log.createdAt).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            {log.user ? (
                              <div className='flex flex-wrap items-center gap-2'>
                                <span className='text-sm font-medium text-foreground'>
                                  {log.user.firstName} {log.user.lastName}
                                </span>
                                <span
                                  className={adminRoleBadgeClass(log.user.role)}
                                >
                                  {roleLabel[log.user.role as UserRole] ??
                                    log.user.role}
                                </span>
                              </div>
                            ) : (
                              <span className='text-sm text-muted-foreground'>
                                {t('admin.auditLogs.systemActor')}
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <span className={adminActionBadgeClass(log.action)}>
                              {t(
                                `admin.auditLogs.actions.${log.action.toLowerCase()}`,
                                {
                                  defaultValue: log.action,
                                },
                              )}
                            </span>
                          </TableCell>
                          <TableCell className='text-sm text-muted-foreground'>
                            {t(
                              `admin.auditLogs.entities.${log.entityType.toLowerCase()}`,
                              {
                                defaultValue: log.entityType,
                              },
                            )}
                          </TableCell>
                          <TableCell className='hidden lg:table-cell'>
                            <span
                              className='font-mono text-xs tabular text-muted-foreground'
                              title={log.entityId ?? undefined}
                            >
                              {log.entityId
                                ? `${log.entityId.slice(0, 8)}…`
                                : '—'}
                            </span>
                          </TableCell>
                          <TableCell className='hidden text-xs tabular text-muted-foreground xl:table-cell'>
                            {log.ipAddress ?? '—'}
                          </TableCell>
                        </TableRow>

                        {isExpanded && hasChanges && (
                          <TableRow className='bg-muted/15'>
                            <TableCell colSpan={7} className='py-4 pl-10'>
                              <p className='mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground'>
                                {t('admin.auditLogs.changes')}
                              </p>
                              <div className='grid gap-2 sm:grid-cols-2 lg:grid-cols-3'>
                                {changes.map(({ key, value }) => (
                                  <div
                                    key={key}
                                    className='rounded-lg border border-border/70 bg-card px-3 py-2'
                                  >
                                    <p className='font-mono text-xs font-medium text-muted-foreground'>
                                      {key}
                                    </p>
                                    <p className='mt-1 break-all font-mono text-sm text-foreground'>
                                      {value}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </Fragment>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <nav
          className='flex items-center justify-center gap-2'
          aria-label={t('admin.auditLogs.title')}
        >
          <Button
            variant='outline'
            size='sm'
            className='rounded-lg'
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            {t('common.previous')}
          </Button>
          <span className='tabular text-sm text-muted-foreground'>
            {page} / {totalPages}
          </span>
          <Button
            variant='outline'
            size='sm'
            className='rounded-lg'
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            {t('common.next')}
          </Button>
        </nav>
      )}
    </div>
  )
}
