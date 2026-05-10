import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { MoreHorizontal, Plus, Search } from 'lucide-react'
import { toast } from 'sonner'
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { cn } from '@/lib/utils'
import {
  ROUTES,
  getAdminTeamDetailPath,
  getAdminTeamEditPath,
  getAdminTeamNewPath,
} from '@/config/routes'
import { useTeams, useDeleteTeam } from '@/features/admin/hooks/useTeams'
import type { Team } from '@/features/admin/api/teamApi'
import {
  AdminEmptyStatePanel,
  AdminInsightCard,
  AdminSectionActionBar,
} from '@/features/admin/components'

const LIMIT = 20

export default function TeamManagementPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const [deleteTarget, setDeleteTarget] = useState<Team | null>(null)

  const { data, isLoading, isError } = useTeams({ page, limit: LIMIT })
  const { mutate: deleteTeam } = useDeleteTeam()

  const teams = data?.data ?? []
  const total = data?.total ?? 0
  const totalPages = Math.ceil(total / LIMIT)
  const membersOnPage = teams.reduce(
    (acc, team) => acc + (team._count?.members ?? 0),
    0,
  )
  const themesOnPage = teams.filter((team) => Boolean(team.themeId)).length

  const filtered = search
    ? teams.filter(
        (team) =>
          team.name.toLowerCase().includes(search.toLowerCase()) ||
          (team.description ?? '').toLowerCase().includes(search.toLowerCase()),
      )
    : teams

  function handleDelete() {
    if (!deleteTarget) return
    deleteTeam(deleteTarget.id, {
      onSuccess: () => {
        toast.success(t('admin.teams.deleteSuccess'))
        setDeleteTarget(null)
      },
      onError: () => {
        toast.error(t('admin.teams.deleteError'))
        setDeleteTarget(null)
      },
    })
  }

  return (
    <div className='space-y-8'>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
        <header className='max-w-xl space-y-1'>
          <h1 className='text-balance text-3xl font-semibold tracking-tight text-foreground'>
            {t('admin.teams.title')}
          </h1>
          <p className='text-pretty text-sm leading-relaxed text-muted-foreground'>
            {t('admin.teams.subtitle')}
          </p>
        </header>
        <Link
          to={getAdminTeamNewPath()}
          className={cn(
            buttonVariants({ size: 'sm' }),
            'inline-flex h-10 shrink-0 items-center gap-2 rounded-lg',
          )}
        >
          <Plus className='size-4' strokeWidth={1.5} />
          {t('admin.teams.createTeam')}
        </Link>
      </div>

      <Card className='border-border/70 shadow-none'>
        <CardContent className='grid gap-3 border-b border-border/60 p-4 md:grid-cols-3'>
          <AdminInsightCard
            title={t('admin.teams.summaryTeams')}
            value={total}
            subtitle={t('admin.teams.summaryTeamsSubtitle')}
          />
          <AdminInsightCard
            title={t('admin.teams.summaryResearchersPage')}
            value={membersOnPage}
            subtitle={t('admin.teams.summaryResearchersPageSubtitle')}
          />
          <AdminInsightCard
            title={t('admin.teams.summaryThemesPage')}
            value={themesOnPage}
            subtitle={t('admin.teams.summaryThemesPageSubtitle')}
          />
        </CardContent>
        <CardContent className='border-b border-border/60 p-4'>
          <AdminSectionActionBar
            title={t('admin.teams.quickActions')}
            actions={[
              { label: t('admin.teams.createTeam'), to: getAdminTeamNewPath() },
              {
                label: t('admin.dashboard.manageThemes'),
                to: ROUTES.ADMIN_THEMES,
              },
              {
                label: t('admin.dashboard.viewAuditLogs'),
                to: ROUTES.ADMIN_AUDIT_LOGS,
              },
            ]}
          />
        </CardContent>
        <CardContent className='border-b border-border/60 p-4'>
          <div className='relative max-w-md'>
            <Search
              className='pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground'
              strokeWidth={1.5}
            />
            <Input
              placeholder={t('common.search')}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className='h-10 rounded-lg pl-9'
            />
          </div>
        </CardContent>
        <CardContent className='p-0'>
          <div className='overflow-x-auto'>
            <Table>
              <TableHeader>
                <TableRow className='border-border/60 hover:bg-transparent'>
                  <TableHead className='text-xs font-medium uppercase tracking-wider text-muted-foreground'>
                    {t('admin.teams.name')}
                  </TableHead>
                  <TableHead className='hidden text-xs font-medium uppercase tracking-wider text-muted-foreground md:table-cell'>
                    {t('admin.teams.description')}
                  </TableHead>
                  <TableHead className='text-right text-xs font-medium uppercase tracking-wider text-muted-foreground'>
                    {t('admin.teams.members')}
                  </TableHead>
                  <TableHead className='text-right text-xs font-medium uppercase tracking-wider text-muted-foreground'>
                    {t('admin.teams.themes')}
                  </TableHead>
                  <TableHead className='w-10' />
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  [...Array(4)].map((_, i) => (
                    <TableRow key={i}>
                      {[...Array(5)].map((__, j) => (
                        <TableCell key={j}>
                          <div className='h-4 w-full animate-pulse rounded bg-muted' />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : isError ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className='py-12 text-center text-sm text-destructive'
                    >
                      {t('admin.teams.loadError')}
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className='py-8'>
                      <AdminEmptyStatePanel
                        title={t('admin.teams.noTeamsFound')}
                        description={t('admin.teams.noTeams')}
                        ctaLabel={t('admin.teams.createTeam')}
                        ctaTo={getAdminTeamNewPath()}
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((team) => (
                    <TableRow
                      key={team.id}
                      className='border-border/40 transition-colors hover:bg-muted/35'
                    >
                      <TableCell className='font-medium'>
                        <Link
                          to={getAdminTeamDetailPath(team.id)}
                          className='text-foreground underline-offset-4 hover:underline'
                        >
                          {team.name}
                        </Link>
                      </TableCell>
                      <TableCell className='hidden max-w-xs truncate text-muted-foreground text-sm md:table-cell'>
                        {team.description ?? t('common.notAvailable')}
                      </TableCell>
                      <TableCell className='tabular text-right text-muted-foreground'>
                        {team._count?.members ?? t('common.notAvailable')}
                      </TableCell>
                      <TableCell className='tabular text-right text-muted-foreground'>
                        {team.theme?.name ?? t('common.notAvailable')}
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            className={cn(
                              buttonVariants({
                                variant: 'ghost',
                                size: 'icon',
                              }),
                              'size-8 rounded-lg text-muted-foreground',
                            )}
                          >
                            <MoreHorizontal
                              className='size-4'
                              strokeWidth={1.5}
                            />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align='end' className='w-40'>
                            <DropdownMenuItem
                              onClick={() =>
                                navigate(getAdminTeamDetailPath(team.id))
                              }
                            >
                              {t('admin.teams.viewTeam')}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                navigate(getAdminTeamEditPath(team.id))
                              }
                            >
                              {t('common.edit')}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className='text-destructive focus:text-destructive'
                              onClick={() => setDeleteTarget(team)}
                            >
                              {t('common.delete')}
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
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <nav
          className='flex items-center justify-center gap-2'
          aria-label={t('admin.teams.title')}
        >
          <Button
            variant='outline'
            size='sm'
            disabled={page === 1}
            className='rounded-lg'
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
            disabled={page === totalPages}
            className='rounded-lg'
            onClick={() => setPage((p) => p + 1)}
          >
            {t('common.next')}
          </Button>
        </nav>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title={t('admin.teams.deleteConfirmTitle')}
        description={t('admin.teams.deleteConfirmDescription')}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
