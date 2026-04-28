import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Moon, Sun, Globe, Bell, LogOut, ChevronRight } from 'lucide-react'
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
import i18n, { LANGUAGES } from '@/i18n'
import type { AppNotification } from '@/features/notifications/hooks/useNotifications'

export interface PortalNavItem {
  key: string
  label: string
  path: string
  icon?: React.ComponentType<{ className?: string; strokeWidth?: number }>
}

interface PortalShellProps {
  portalLabel: string
  pageTitle: string
  currentUserName?: string | null
  initials: string
  navItems: PortalNavItem[]
  selectedKey: string
  isDark: boolean
  onThemeToggle: () => void
  onLogout: () => void
  notifications?: AppNotification[]
  onNotificationRead?: (notificationId: string) => void
  onNotificationSelect?: (notification: AppNotification) => void
  children: React.ReactNode
}

function NotificationBody({
  notifications,
  onNotificationRead,
  onNotificationSelect,
}: Pick<
  PortalShellProps,
  'notifications' | 'onNotificationRead' | 'onNotificationSelect'
>) {
  const { t } = useTranslation()
  const safeNotifications = Array.isArray(notifications) ? notifications : []
  const unreadCount = safeNotifications.filter((n) => !n.readAt).length ?? 0

  return (
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
          {safeNotifications?.length ? (
            safeNotifications.slice(0, 10).map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={cn(
                  'flex flex-col items-start gap-0.5 px-3 py-2.5 cursor-pointer',
                  !notification.readAt && 'bg-primary/5',
                )}
                onClick={() => {
                  if (!notification.readAt)
                    onNotificationRead?.(notification.id)
                  onNotificationSelect?.(notification)
                }}
              >
                <span
                  className={cn(
                    'text-xs font-medium',
                    !notification.readAt && 'text-primary',
                  )}
                >
                  {notification.title}
                </span>
                <span className='text-xs text-muted-foreground line-clamp-2'>
                  {notification.message}
                </span>
              </DropdownMenuItem>
            ))
          ) : (
            <DropdownMenuItem
              disabled
              className='justify-center py-6 text-center text-muted-foreground cursor-default'
            >
              {t('common.noNotifications')}
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function PortalShell({
  portalLabel,
  pageTitle,
  currentUserName,
  initials,
  navItems,
  selectedKey,
  isDark,
  onThemeToggle,
  onLogout,
  notifications,
  onNotificationRead,
  onNotificationSelect,
  children,
}: PortalShellProps) {
  const { t } = useTranslation()
  const safeNotifications = Array.isArray(notifications) ? notifications : []
  const unreadCount = safeNotifications.filter((n) => !n.readAt).length ?? 0

  return (
    <div className='researcher-portal flex min-h-screen bg-muted/30 dark:bg-background'>
      <aside className='fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-border bg-card bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,oklch(0.45_0.2_260_/_0.06),transparent)]'>
        <div className='flex flex-1 flex-col gap-5 overflow-y-auto p-4'>
          <div className='flex justify-center py-2'>
            <img
              src='/lmcs.png'
              alt='LMCS'
              className='h-24 w-auto object-contain'
            />
          </div>

          <div className='flex items-center gap-3 rounded-xl border border-border bg-muted/50 px-3 py-2.5'>
            <div className='flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground ring-2 ring-primary/20 ring-offset-2 ring-offset-card'>
              {initials}
            </div>
            <div className='min-w-0 flex-1'>
              <p className='truncate text-sm font-semibold text-foreground'>
                {currentUserName ?? '—'}
              </p>
              <p className='text-xs font-medium text-primary'>{portalLabel}</p>
            </div>
          </div>

          <nav className='flex flex-col gap-0.5'>
            {navItems.map((item) => {
              const selected = selectedKey === item.key
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
                  {Icon ? (
                    <Icon className='size-4 shrink-0' strokeWidth={1.5} />
                  ) : null}
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className='mt-auto border-t border-border p-4'>
          <Button
            variant='ghost'
            className='w-full justify-start gap-3 px-3 text-muted-foreground hover:bg-muted hover:text-foreground'
            onClick={onLogout}
          >
            <LogOut className='size-4 shrink-0' strokeWidth={1.5} />
            {t('common.signOut')}
          </Button>
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
            <Button
              variant='ghost'
              size='icon'
              className='size-8 text-muted-foreground hover:bg-accent hover:text-foreground'
              aria-label={t('common.theme')}
              onClick={onThemeToggle}
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

            {safeNotifications.length > 0 ? (
              <NotificationBody
                notifications={safeNotifications}
                onNotificationRead={onNotificationRead}
                onNotificationSelect={onNotificationSelect}
              />
            ) : (
              <Button
                variant='ghost'
                size='icon'
                className='relative size-8 text-muted-foreground hover:bg-accent hover:text-foreground'
                aria-label={t('common.notifications')}
              >
                <Bell className='size-4' strokeWidth={1.5} />
                {unreadCount > 0 && (
                  <span className='absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground'>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Button>
            )}
          </div>
        </header>

        <main className='min-w-0 flex-1 p-6'>{children}</main>
      </div>
    </div>
  )
}
