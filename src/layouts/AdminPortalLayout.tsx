import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  LayoutDashboard,
  Users,
  Building2,
  BookMarked,
  ScrollText,
} from 'lucide-react'
import { useAuthContext } from '@/shared/context/AuthContext'
import { useTheme } from '@/shared/context/ThemeContext'
import { ROUTES } from '@/config/routes'
import { PortalShell, type PortalNavItem } from '@/layouts/PortalShell'
import {
  useNotifications,
  useMarkNotificationRead,
} from '@/features/notifications/hooks/useNotifications'

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

function getSelectedKey(pathname: string): string {
  if (pathname.startsWith('/admin/users')) return 'users'
  if (pathname.startsWith('/admin/teams')) return 'teams'
  if (pathname.startsWith('/admin/themes')) return 'themes'
  if (pathname.startsWith('/admin/audit-logs')) return 'audit-logs'
  return 'dashboard'
}

function getPageTitle(key: string, t: (k: string) => string): string {
  switch (key) {
    case 'users':
      return t('admin.nav.users')
    case 'teams':
      return t('admin.nav.teams')
    case 'themes':
      return t('admin.nav.themes')
    case 'audit-logs':
      return t('admin.nav.auditLogs')
    default:
      return t('admin.nav.dashboard')
  }
}

export function AdminPortalLayout() {
  const { t } = useTranslation()
  const { currentUser, logout } = useAuthContext()
  const { isDark, toggleTheme } = useTheme()
  const location = useLocation()
  const navigate = useNavigate()

  const { data: notifications = [] } = useNotifications()
  const { mutate: markRead } = useMarkNotificationRead()

  const selectedKey = getSelectedKey(location.pathname)

  const ADMIN_NAV: PortalNavItem[] = [
    {
      key: 'dashboard',
      label: t('admin.nav.dashboard'),
      path: ROUTES.DASHBOARD_ADMIN,
      icon: LayoutDashboard,
    },
    {
      key: 'users',
      label: t('admin.nav.users'),
      path: ROUTES.ADMIN_USERS,
      icon: Users,
    },
    {
      key: 'teams',
      label: t('admin.nav.teams'),
      path: ROUTES.ADMIN_TEAMS,
      icon: Building2,
    },
    {
      key: 'themes',
      label: t('admin.nav.themes'),
      path: ROUTES.ADMIN_THEMES,
      icon: BookMarked,
    },
    {
      key: 'audit-logs',
      label: t('admin.nav.auditLogs'),
      path: ROUTES.ADMIN_AUDIT_LOGS,
      icon: ScrollText,
    },
  ]

  function handleLogout() {
    logout()
    navigate(ROUTES.LOGIN, { replace: true })
  }

  return (
    <PortalShell
      portalLabel={t('admin.portal')}
      pageTitle={getPageTitle(selectedKey, t)}
      currentUserName={currentUser?.name}
      initials={getInitials(currentUser?.name, currentUser?.email)}
      navItems={ADMIN_NAV}
      selectedKey={selectedKey}
      isDark={isDark}
      onThemeToggle={toggleTheme}
      onLogout={handleLogout}
      notifications={notifications}
      onNotificationRead={(id) => markRead(id)}
    >
      <Outlet />
    </PortalShell>
  )
}
