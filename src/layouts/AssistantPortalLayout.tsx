import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Moon,
  Sun,
  Globe,
  Bell,
  LogOut,
  LayoutDashboard,
  ClipboardCheck,
  ListOrdered,
  History,
  Settings,
  ChevronRight,
  Users,
  BookMarked,
} from 'lucide-react'
import { useAuthContext } from '@/shared/context/AuthContext'
import { useTheme } from '@/shared/context/ThemeContext'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { ROUTES, getAssistantSupervisionDetailPath } from '@/config/routes'
import i18n, { LANGUAGES } from '@/i18n'
import {
  useNotifications,
  useMarkNotificationRead,
} from '@/features/notifications/hooks/useNotifications'

const ASSISTANT_NAV: {
  key: string
  labelKey: string
  path: string
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  isActive?: (pathname: string) => boolean
}[] = [
  {
    key: 'dashboard',
    labelKey: 'common.dashboard',
    path: ROUTES.DASHBOARD_ASSISTANT,
    icon: LayoutDashboard,
  },
  {
    key: 'activity',
    labelKey: 'assistant.activityQueue',
    path: ROUTES.ASSISTANT_ACTIVITY,
    icon: ClipboardCheck,
    isActive: (p) =>
      p === ROUTES.ASSISTANT_ACTIVITY ||
      p.startsWith(`${ROUTES.ASSISTANT_ACTIVITY}/`) ||
      p === ROUTES.ASSISTANT_VALIDATION,
  },
  {
    key: 'supervisions',
    labelKey: 'common.supervisions',
    path: ROUTES.ASSISTANT_SUPERVISIONS,
    icon: ListOrdered,
  },
  {
    key: 'students',
    labelKey: 'common.studentManagement',
    path: ROUTES.ASSISTANT_STUDENTS,
    icon: Users,
    isActive: (p) => p.startsWith('/assistant/students'),
  },
  {
    key: 'themes',
    labelKey: 'common.themeManagement',
    path: ROUTES.ASSISTANT_THEMES,
    icon: BookMarked,
    isActive: (p) => p.startsWith('/assistant/themes'),
  },
  {
    key: 'history',
    labelKey: 'assistant.historyTitle',
    path: ROUTES.ASSISTANT_HISTORY,
    icon: History,
  },
  {
    key: 'profile',
    labelKey: 'common.profileSettings',
    path: ROUTES.ASSISTANT_PROFILE,
    icon: Settings,
  },
]

const PAGE_TITLE_KEYS: Record<string, string> = {
  dashboard: 'common.dashboard',
  activity: 'assistant.activity.pageTitle',
  validation: 'assistant.activity.pageTitle',
  supervisions: 'common.supervisions',
  students: 'common.studentManagement',
  themes: 'themes.pageTitle',
  history: 'assistant.historyPageTitle',
  profile: 'common.profileSettings',
}

function getPageKey(pathname: string): string {
  if (pathname === ROUTES.ASSISTANT_VALIDATION) {
    return 'activity'
  }
  const item = ASSISTANT_NAV.find((nav) => {
    if (nav.isActive) return nav.isActive(pathname)
    return pathname === nav.path || pathname.startsWith(nav.path + '/')
  })
  return item?.key ?? 'dashboard'
}

function getInitials(
  name: string | undefined,
  email: string | undefined,
): string {
  if (name?.trim()) {
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) {
      return (
        parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
      ).toUpperCase()
    }
    return parts[0].charAt(0).toUpperCase()
  }
  if (email?.trim()) return email.trim().slice(0, 2).toUpperCase()
  return '?'
}

export function AssistantPortalLayout() {
  const { t } = useTranslation()
  const { currentUser, logout } = useAuthContext()
  const { isDark, toggleTheme } = useTheme()
  const location = useLocation()
  const navigate = useNavigate()

  function isItemSelected(item: (typeof ASSISTANT_NAV)[number]): boolean {
    if (item.isActive) return item.isActive(location.pathname)
    return (
      location.pathname === item.path ||
      location.pathname.startsWith(item.path + '/')
    )
  }

  function handleLogout() {
    logout()
    navigate(ROUTES.LOGIN, { replace: true })
  }

  const pageKey = getPageKey(location.pathname)
  const pageTitle = t(PAGE_TITLE_KEYS[pageKey] ?? 'common.dashboard')
  const initials = getInitials(currentUser?.name, currentUser?.email)

  const { data: notifications = [] } = useNotifications()
  const { mutate: markRead } = useMarkNotificationRead()
  const unreadCount = notifications.filter((n) => !n.readAt).length

  return (
    <div className='portal-shell flex min-h-screen bg-muted/30 dark:bg-background'>
      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <aside className='fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-border bg-card bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,oklch(0.45_0.2_260_/_0.06),transparent)]'>
        <div className='flex flex-1 flex-col gap-5 overflow-y-auto p-4'>
          {/* Logo */}
          <div className='flex justify-center py-2'>
            <img
              src='/lmcs.png'
              alt='LMCS'
              className='h-24 w-auto object-contain'
            />
          </div>

          {/* User identity */}
          <div className='flex items-center gap-3 rounded-xl border border-border bg-muted/50 px-3 py-2.5'>
            <div className='flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground ring-2 ring-primary/20 ring-offset-2 ring-offset-card'>
              {initials}
            </div>
            <div className='min-w-0 flex-1'>
              <p className='truncate text-sm font-semibold text-foreground'>
                {currentUser?.name ?? '—'}
              </p>
              <p className='text-xs font-medium text-primary'>
                {t('common.assistant')}
              </p>
            </div>
          </div>

          {/* Nav */}
          <nav className='flex flex-col gap-0.5'>
            {ASSISTANT_NAV.map((item) => {
              const selected = isItemSelected(item)
              const Icon = item.icon
              return (
                <Link
                  key={item.key}
                  to={item.path}
                  className={cn(
                    buttonVariants({ variant: 'ghost', size: 'default' }),
                    'relative h-10 w-full justify-start gap-3 px-3 font-normal transition-colors',
                    selected
                      ? "bg-primary/8 text-primary font-medium hover:bg-primary/10 hover:text-primary before:absolute before:left-0 before:top-2 before:h-6 before:w-[3px] before:rounded-r-full before:bg-primary before:content-['']"
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  <Icon className='size-4 shrink-0' strokeWidth={1.5} />
                  {t(item.labelKey)}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Logout */}
        <div className='mt-auto border-t border-border p-4'>
          <Button
            variant='ghost'
            className='w-full justify-start gap-3 px-3 text-muted-foreground hover:bg-muted hover:text-foreground'
            onClick={handleLogout}
          >
            <LogOut className='size-4 shrink-0' strokeWidth={1.5} />
            {t('common.signOut')}
          </Button>
        </div>
      </aside>

      {/* ── Main area ─────────────────────────────────────────────────────── */}
      <div className='ml-64 flex min-w-0 flex-1 flex-col min-h-screen'>
        {/* Header */}
        <header className='sticky top-0 z-10 flex shrink-0 items-center justify-between border-b border-border bg-card/90 backdrop-blur-sm px-6 py-3'>
          {/* Breadcrumb */}
          <nav
            className='flex items-center gap-1.5 text-sm'
            aria-label='Breadcrumb'
          >
            <span className='text-muted-foreground'>
              {t('common.assistant')}
            </span>
            <ChevronRight className='size-3.5 text-muted-foreground/50 shrink-0' />
            <span className='font-medium text-foreground'>{pageTitle}</span>
          </nav>

          {/* Controls */}
          <div className='flex items-center gap-1'>
            <Button
              variant='ghost'
              size='icon'
              className='size-8 text-muted-foreground hover:bg-accent hover:text-foreground'
              aria-label={t('common.theme')}
              onClick={toggleTheme}
            >
              {isDark ? (
                <Sun className='size-4' strokeWidth={1.5} />
              ) : (
                <Moon className='size-4' strokeWidth={1.5} />
              )}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger
                className={cn(
                  buttonVariants({ variant: 'ghost', size: 'icon' }),
                  'size-8 text-muted-foreground hover:bg-accent hover:text-foreground',
                )}
                aria-label={t('common.language')}
              >
                <Globe className='size-4' strokeWidth={1.5} />
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='min-w-[140px]'>
                {LANGUAGES.map(({ code, labelKey }) => (
                  <DropdownMenuItem
                    key={code}
                    onClick={() => i18n.changeLanguage(code)}
                    className={cn(i18n.language === code && 'bg-accent')}
                  >
                    {t(labelKey)}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger
                className={cn(
                  buttonVariants({ variant: 'ghost', size: 'icon' }),
                  'relative size-8 text-muted-foreground hover:bg-accent hover:text-foreground',
                )}
                aria-label={t('common.notifications')}
              >
                <Bell className='size-4' strokeWidth={1.5} />
                {unreadCount > 0 && (
                  <span className='absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground'>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='w-80'>
                <DropdownMenuGroup>
                  <DropdownMenuLabel className='flex items-center justify-between'>
                    {t('common.notifications')}
                    {unreadCount > 0 && (
                      <span className='rounded-full bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary'>
                        {unreadCount}
                      </span>
                    )}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {notifications.length === 0 ? (
                    <DropdownMenuItem
                      disabled
                      className='justify-center py-6 text-center text-muted-foreground cursor-default'
                    >
                      {t('common.noNotifications')}
                    </DropdownMenuItem>
                  ) : (
                    notifications.slice(0, 10).map((n) => (
                      <DropdownMenuItem
                        key={n.id}
                        className={cn(
                          'flex flex-col items-start gap-0.5 px-3 py-2.5 cursor-pointer',
                          !n.readAt && 'bg-primary/5',
                        )}
                        onClick={() => {
                          if (!n.readAt) markRead(n.id)
                          if (n.supervisionId) {
                            navigate(
                              getAssistantSupervisionDetailPath(
                                n.supervisionId,
                              ),
                            )
                          }
                        }}
                      >
                        <span
                          className={cn(
                            'text-xs font-medium',
                            !n.readAt && 'text-primary',
                          )}
                        >
                          {n.title}
                        </span>
                        <span className='text-xs text-muted-foreground line-clamp-2'>
                          {n.message}
                        </span>
                      </DropdownMenuItem>
                    ))
                  )}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className='min-w-0 flex-1 p-6'>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
