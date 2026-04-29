import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { MoreHorizontal, UserPlus, Search } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Button, buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import { ROUTES, getAdminUserEditPath } from '@/config/routes'
import { useAuthContext } from '@/shared/context/AuthContext'
import {
  useUsers,
  useToggleUserStatus,
  useResetUserPassword,
} from '@/features/admin/hooks/useUsers'
import type { UserRole } from '@/features/admin/api/userApi'
import { adminRoleBadgeClass } from '@/features/admin/lib/adminBadgeStyles'
import {
  AdminEmptyStatePanel,
  AdminInsightCard,
  AdminSectionActionBar,
} from '@/features/admin/components'

const LIMIT = 20

export default function UserManagementPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { currentUser } = useAuthContext()

  const [search, setSearch] = useState('')
  const [role, setRole] = useState<UserRole | ''>('')
  const [isActive, setIsActive] = useState<'' | 'true' | 'false'>('')
  const [page, setPage] = useState(1)

  const [toggleTarget, setToggleTarget] = useState<{
    id: string
    name: string
    active: boolean
  } | null>(null)
  const [resetTarget, setResetTarget] = useState<{
    id: string
    name: string
  } | null>(null)
  const [newPassword, setNewPassword] = useState('')

  const filters = {
    search: search || undefined,
    role: (role || undefined) as UserRole | undefined,
    isActive: isActive !== '' ? isActive === 'true' : undefined,
    page,
    limit: LIMIT,
  }

  const { data, isLoading, isError } = useUsers(filters)
  const { mutate: toggleStatus } = useToggleUserStatus()
  const { mutate: resetPassword, isPending: resetting } = useResetUserPassword()

  const users = data?.data ?? []
  const total = data?.total ?? 0
  const totalPages = Math.ceil(total / LIMIT)
  const activeCount = users.filter((user) => user.isActive).length
  const inactiveCount = users.length - activeCount

  const roleLabel: Record<UserRole, string> = {
    ADMIN: t('admin.users.roles.admin'),
    DIRECTOR: t('admin.users.roles.director'),
    RESEARCHER: t('admin.users.roles.researcher'),
    ASSISTANT: t('admin.users.roles.assistant'),
  }

  function handleToggleConfirm() {
    if (!toggleTarget) return
    toggleStatus(toggleTarget.id, {
      onSuccess: () => {
        toast.success(t('admin.users.toggleSuccess'))
        setToggleTarget(null)
      },
      onError: () => {
        toast.error(t('admin.users.toggleError'))
        setToggleTarget(null)
      },
    })
  }

  function handleResetConfirm() {
    if (!resetTarget || !newPassword) return
    resetPassword(
      { id: resetTarget.id, password: newPassword },
      {
        onSuccess: () => {
          toast.success(t('admin.users.resetSuccess'))
          setResetTarget(null)
          setNewPassword('')
        },
        onError: () => {
          toast.error(t('admin.users.resetError'))
        },
      },
    )
  }

  return (
    <div className='space-y-8'>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
        <header className='max-w-xl space-y-1'>
          <h1 className='text-balance text-3xl font-semibold tracking-tight text-foreground'>
            {t('admin.users.title')}
          </h1>
          <p className='text-pretty text-sm leading-relaxed text-muted-foreground'>
            {t('admin.users.subtitle')}
          </p>
        </header>
        <Link
          to={ROUTES.ADMIN_USERS_NEW}
          className={cn(
            buttonVariants({ variant: 'default', size: 'sm' }),
            'h-10 shrink-0 gap-2 rounded-lg',
          )}
        >
          <UserPlus className='size-4' strokeWidth={1.5} />
          {t('admin.users.createUser')}
        </Link>
      </div>

      <Card className='border-border/70 shadow-none'>
        <CardContent className='grid gap-3 border-b border-border/60 p-4 md:grid-cols-3'>
          <AdminInsightCard
            title={t('admin.users.loadedAccounts')}
            value={total}
            subtitle={t('admin.users.loadedAccountsSubtitle')}
          />
          <AdminInsightCard
            title={t('admin.users.activeCurrentPage')}
            value={activeCount}
            subtitle={t('admin.users.activeCurrentPageSubtitle')}
          />
          <AdminInsightCard
            title={t('admin.users.inactiveCurrentPage')}
            value={inactiveCount}
            subtitle={t('admin.users.inactiveCurrentPageSubtitle')}
          />
        </CardContent>
        <CardContent className='border-b border-border/60 p-4'>
          <AdminSectionActionBar
            title={t('admin.users.quickFilters')}
            actions={[
              { label: t('common.all'), to: ROUTES.ADMIN_USERS },
              {
                label: t('admin.users.inactive'),
                to: `${ROUTES.ADMIN_USERS}?isActive=false`,
              },
              {
                label: t('admin.users.admins'),
                to: `${ROUTES.ADMIN_USERS}?role=ADMIN`,
              },
            ]}
          />
        </CardContent>
        <CardContent className='flex flex-wrap gap-3 border-b border-border/60 p-4'>
          <div className='relative min-w-[min(100%,14rem)] flex-1'>
            <Search
              className='pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground'
              strokeWidth={1.5}
            />
            <Input
              placeholder={t('admin.users.search')}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className='h-10 rounded-lg pl-9'
            />
          </div>
          <select
            value={role}
            onChange={(e) => {
              setRole(e.target.value as UserRole | '')
              setPage(1)
            }}
            className='h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground shadow-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
          >
            <option value=''>{t('admin.users.allRoles')}</option>
            <option value='ADMIN'>{t('admin.users.roles.admin')}</option>
            <option value='DIRECTOR'>{t('admin.users.roles.director')}</option>
            <option value='RESEARCHER'>
              {t('admin.users.roles.researcher')}
            </option>
            <option value='ASSISTANT'>
              {t('admin.users.roles.assistant')}
            </option>
          </select>
          <select
            value={isActive}
            onChange={(e) => {
              setIsActive(e.target.value as '' | 'true' | 'false')
              setPage(1)
            }}
            className='h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground shadow-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
          >
            <option value=''>{t('admin.users.allStatuses')}</option>
            <option value='true'>{t('admin.users.active')}</option>
            <option value='false'>{t('admin.users.inactive')}</option>
          </select>
        </CardContent>
        <CardContent className='p-0'>
          <div className='overflow-x-auto'>
            <Table>
              <TableHeader>
                <TableRow className='border-border/60 hover:bg-transparent'>
                  <TableHead className='text-xs font-medium uppercase tracking-wider text-muted-foreground'>
                    {t('admin.users.firstName')} / {t('admin.users.lastName')}
                  </TableHead>
                  <TableHead className='text-xs font-medium uppercase tracking-wider text-muted-foreground'>
                    {t('admin.users.email')}
                  </TableHead>
                  <TableHead className='text-xs font-medium uppercase tracking-wider text-muted-foreground'>
                    {t('admin.users.role')}
                  </TableHead>
                  <TableHead className='text-xs font-medium uppercase tracking-wider text-muted-foreground'>
                    {t('admin.users.status')}
                  </TableHead>
                  <TableHead className='hidden text-xs font-medium uppercase tracking-wider text-muted-foreground md:table-cell'>
                    {t('admin.users.created')}
                  </TableHead>
                  <TableHead className='w-10' />
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      {[...Array(6)].map((__, j) => (
                        <TableCell key={j}>
                          <div className='h-4 w-full animate-pulse rounded bg-muted' />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : isError ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className='py-10 text-center text-sm text-destructive'
                    >
                      {t('admin.users.loadError')}
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className='py-8'>
                      <AdminEmptyStatePanel
                        title={
                          search || role || isActive
                            ? t('admin.users.noMatchingUsers')
                            : t('admin.users.noUsersYet')
                        }
                        description={
                          search || role || isActive
                            ? t('admin.users.noUsersFiltered')
                            : t('admin.users.noUsers')
                        }
                        ctaLabel={t('admin.users.createUser')}
                        ctaTo={ROUTES.ADMIN_USERS_NEW}
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => {
                    const isSelf = Boolean(
                      currentUser?.id && user.id === currentUser.id,
                    )
                    return (
                      <TableRow
                        key={user.id}
                        className='cursor-pointer border-border/40 transition-colors hover:bg-muted/35 focus-within:bg-muted/35'
                        onClick={() => navigate(getAdminUserEditPath(user.id))}
                      >
                        <TableCell className='font-medium'>
                          {user.firstName} {user.lastName}
                        </TableCell>
                        <TableCell className='max-w-[14rem] truncate text-muted-foreground'>
                          {user.email}
                        </TableCell>
                        <TableCell>
                          <span className={adminRoleBadgeClass(user.role)}>
                            {roleLabel[user.role]}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={user.isActive ? 'outline' : 'secondary'}
                            className='rounded-md font-normal'
                          >
                            {user.isActive
                              ? t('admin.users.active')
                              : t('admin.users.inactive')}
                          </Badge>
                        </TableCell>
                        <TableCell className='hidden tabular text-muted-foreground text-sm md:table-cell'>
                          {new Date(user.createdAt).toLocaleDateString()}
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
                            <DropdownMenuContent align='end' className='w-44'>
                              <DropdownMenuItem
                                onClick={() =>
                                  navigate(getAdminUserEditPath(user.id))
                                }
                              >
                                {t('common.edit')}
                              </DropdownMenuItem>
                              {!isSelf && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    setToggleTarget({
                                      id: user.id,
                                      name: `${user.firstName} ${user.lastName}`,
                                      active: user.isActive,
                                    })
                                  }
                                >
                                  {user.isActive
                                    ? t('admin.users.deactivate')
                                    : t('admin.users.activate')}
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() =>
                                  setResetTarget({
                                    id: user.id,
                                    name: `${user.firstName} ${user.lastName}`,
                                  })
                                }
                              >
                                {t('admin.users.resetPassword')}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
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
          aria-label={t('admin.users.title')}
        >
          <Button
            variant='outline'
            size='sm'
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            {t('common.previous')}
          </Button>
          <span className='text-sm text-muted-foreground'>
            {page} / {totalPages}
          </span>
          <Button
            variant='outline'
            size='sm'
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className='rounded-lg'
          >
            {t('common.next')}
          </Button>
        </nav>
      )}

      {/* Toggle status confirm */}
      <ConfirmDialog
        open={!!toggleTarget}
        title={t('admin.users.confirmToggleTitle')}
        description={t('admin.users.confirmToggleDescription')}
        confirmLabel={
          toggleTarget?.active
            ? t('admin.users.deactivate')
            : t('admin.users.activate')
        }
        cancelLabel={t('common.cancel')}
        onConfirm={handleToggleConfirm}
        onCancel={() => setToggleTarget(null)}
      />

      {/* Reset password dialog */}
      {resetTarget && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
          <div
            className='absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity'
            onClick={() => {
              setResetTarget(null)
              setNewPassword('')
            }}
            aria-hidden
          />
          <div className='relative z-[51] w-full max-w-sm space-y-4 rounded-2xl border border-border/80 bg-card p-6 shadow-lg'>
            <h2 className='text-base font-semibold text-foreground'>
              {t('admin.users.confirmResetTitle')}
            </h2>
            <p className='text-sm text-muted-foreground'>
              {t('admin.users.confirmResetDescription')} —{' '}
              <span className='font-medium text-foreground'>
                {resetTarget.name}
              </span>
            </p>
            <Input
              type='password'
              placeholder={t('admin.users.newPassword')}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <div className='flex justify-end gap-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => {
                  setResetTarget(null)
                  setNewPassword('')
                }}
              >
                {t('common.cancel')}
              </Button>
              <Button
                size='sm'
                disabled={newPassword.length < 6 || resetting}
                onClick={handleResetConfirm}
              >
                {resetting
                  ? t('common.saving')
                  : t('admin.users.resetPassword')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
