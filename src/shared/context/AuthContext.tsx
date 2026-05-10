import {
  createContext,
  type ReactNode,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react'
import { flushSync } from 'react-dom'
import { APP_CONSTANTS } from '@/config/constants'
import { env } from '@/config/env'
import { authApi } from '@/features/auth/api/authApi'
import {
  DEFAULT_DEV_ROLE,
  getDevAccountByRole,
  normalizeAppRole,
} from '@/features/auth/devAccounts'
import { extractMatriculeFromAccessToken } from '@/features/auth/extractMatricule'
import {
  mapBackendUserToDisplayUser,
  type BackendAuthUser,
} from '@/features/auth/types'
import type { AppRole } from '@/config/routes'

export interface User {
  id: string
  email: string
  name: string
  role: string
  /** ESI matricule for supervision APIs when the researcher is main supervisor. */
  matricule?: string
}

interface AuthContextValue {
  currentUser: User | null
  isAuthenticated: boolean
  login: (user: User, token: string, refreshToken?: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

const DEV_ROLE_STORAGE_KEY = 'lmcs_dev_role'

function readStoredUser(): User | null {
  const storedUser = localStorage.getItem(APP_CONSTANTS.STORAGE_KEYS.USER)
  if (!storedUser) return null
  try {
    let u = JSON.parse(storedUser) as User
    if (u.role === 'RESEARCHER' && !u.matricule?.trim()) {
      const token = localStorage.getItem(APP_CONSTANTS.STORAGE_KEYS.TOKEN)
      const fromJwt = extractMatriculeFromAccessToken(token)
      if (fromJwt) u = { ...u, matricule: fromJwt }
      else if (env.AUTH_BYPASS) {
        const m = getDevAccountByRole('RESEARCHER').matricule
        if (m) u = { ...u, matricule: m }
      }
    }
    return u
  } catch {
    return null
  }
}

function resolveBypassRole(): AppRole {
  const roleFromStorage = normalizeAppRole(
    localStorage.getItem(DEV_ROLE_STORAGE_KEY),
  )
  const roleFromEnv = normalizeAppRole(env.DEV_AUTH_ROLE)
  return roleFromStorage ?? roleFromEnv ?? DEFAULT_DEV_ROLE
}

function saveBypassUser(role: AppRole): User {
  const devUser = getDevAccountByRole(role)
  localStorage.setItem(APP_CONSTANTS.STORAGE_KEYS.USER, JSON.stringify(devUser))
  localStorage.setItem(
    APP_CONSTANTS.STORAGE_KEYS.TOKEN,
    `dev-token-${role.toLowerCase()}`,
  )
  localStorage.setItem(DEV_ROLE_STORAGE_KEY, role)
  return devUser
}

function getInitialUser(): User | null {
  const storedUser = readStoredUser()
  if (storedUser) return storedUser

  if (env.AUTH_BYPASS) {
    return saveBypassUser(resolveBypassRole())
  }

  return null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(getInitialUser)

  const isAuthenticated = !!currentUser

  const login = useCallback(
    (user: User, token: string, refreshToken?: string) => {
      flushSync(() => setCurrentUser(user))
      localStorage.setItem(
        APP_CONSTANTS.STORAGE_KEYS.USER,
        JSON.stringify(user),
      )
      localStorage.setItem(APP_CONSTANTS.STORAGE_KEYS.TOKEN, token)
      if (refreshToken) {
        localStorage.setItem(
          APP_CONSTANTS.STORAGE_KEYS.REFRESH_TOKEN,
          refreshToken,
        )
      }
    },
    [],
  )

  const logout = useCallback(() => {
    setCurrentUser(null)
    localStorage.removeItem(APP_CONSTANTS.STORAGE_KEYS.USER)
    localStorage.removeItem(APP_CONSTANTS.STORAGE_KEYS.TOKEN)
    localStorage.removeItem(APP_CONSTANTS.STORAGE_KEYS.REFRESH_TOKEN)
    localStorage.removeItem(DEV_ROLE_STORAGE_KEY)
  }, [])

  useEffect(() => {
    if (!env.AUTH_BYPASS) return
    const roleFromQuery = normalizeAppRole(
      new URLSearchParams(window.location.search).get('devRole'),
    )
    if (!roleFromQuery) return

    const devUser = saveBypassUser(roleFromQuery)
    setCurrentUser(devUser)
  }, [])

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(
        APP_CONSTANTS.STORAGE_KEYS.USER,
        JSON.stringify(currentUser),
      )
    }
  }, [currentUser])

  /** Backfill matricule for researchers when /me or JWT carries it but localStorage user was stale. */
  useEffect(() => {
    if (env.AUTH_BYPASS || !currentUser) return
    if (currentUser.role !== 'RESEARCHER') return
    if (currentUser.matricule?.trim()) return
    const token = localStorage.getItem(APP_CONSTANTS.STORAGE_KEYS.TOKEN)
    if (!token || token.startsWith('dev-token')) return

    let cancelled = false
    void (async () => {
      try {
        const { data } = await authApi.me()
        const merged = mapBackendUserToDisplayUser(data.user as BackendAuthUser)
        if (cancelled || !merged.matricule?.trim()) return
        setCurrentUser((prev) =>
          prev && prev.id === merged.id
            ? { ...prev, matricule: merged.matricule }
            : prev,
        )
      } catch {
        /* /v1/auth/me optional */
      }
    })()
    return () => {
      cancelled = true
    }
  }, [currentUser?.id, currentUser?.role, currentUser?.matricule])

  const value: AuthContextValue = {
    currentUser,
    isAuthenticated,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuthContext must be used within AuthProvider')
  }
  return ctx
}
