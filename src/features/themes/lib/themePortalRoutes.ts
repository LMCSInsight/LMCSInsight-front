import { useLocation } from 'react-router-dom'
import {
  getAdminThemeDetailPath,
  getAdminThemeEditPath,
  getAdminThemeNewPath,
  getAdminThemesPath,
  getAssistantThemeDetailPath,
  getAssistantThemeEditPath,
  getAssistantThemeNewPath,
  getAssistantThemesPath,
} from '@/config/routes'

/** Resolve theme list/new/detail/edit URLs for assistant vs admin portal. */
export function useThemePortalRoutes() {
  const { pathname } = useLocation()
  const admin = pathname.startsWith('/admin')
  return {
    themesList: admin ? getAdminThemesPath() : getAssistantThemesPath(),
    themeNew: admin ? getAdminThemeNewPath() : getAssistantThemeNewPath(),
    themeDetail: (id: string) =>
      admin ? getAdminThemeDetailPath(id) : getAssistantThemeDetailPath(id),
    themeEdit: (id: string) =>
      admin ? getAdminThemeEditPath(id) : getAssistantThemeEditPath(id),
  }
}
