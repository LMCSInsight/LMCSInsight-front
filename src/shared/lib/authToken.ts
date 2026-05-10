import { APP_CONSTANTS } from '@/config/constants'

type JwtPayload = {
  role?: string
}

function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const parts = token.split('.')
    if (parts.length < 2) return null
    const payload = parts[1]
    if (!payload) return null
    const decoded = JSON.parse(atob(payload)) as JwtPayload
    return decoded
  } catch {
    return null
  }
}

export function getStoredAccessToken(): string | null {
  return localStorage.getItem(APP_CONSTANTS.STORAGE_KEYS.TOKEN)
}

export function getTokenRole(token: string | null): string | null {
  if (!token || token.startsWith('dev-token-')) return null
  return decodeJwtPayload(token)?.role ?? null
}

export function canUseAdminApi(currentUserRole?: string): boolean {
  const token = getStoredAccessToken()
  const tokenRole = getTokenRole(token)
  return currentUserRole === 'ADMIN' && tokenRole === 'ADMIN'
}

export function hasRealAccessToken(): boolean {
  const token = getStoredAccessToken()
  return !!token && !token.startsWith('dev-token-')
}
