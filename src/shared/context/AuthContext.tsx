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
import {
  DEFAULT_DEV_ROLE,
  getDevAccountByRole,
  normalizeAppRole,
} from '@/features/auth/devAccounts'
import type { AppRole } from '@/config/routes'

export interface User {
  id: string
  email: string
  name: string
  role: string
}

interface AuthContextValue {
  currentUser: User | null
  isAuthenticated: boolean
  login: (user: User, token: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

const DEV_ROLE_STORAGE_KEY = 'lmcs_dev_role'

function readStoredUser(): User | null {
  const storedUser = localStorage.getItem(APP_CONSTANTS.STORAGE_KEYS.USER)
  if (!storedUser) return null
  try {
    return JSON.parse(storedUser) as User
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

  const isAuthenticated = env.AUTH_BYPASS ? true : !!currentUser

  const login = useCallback((user: User, token: string) => {
    flushSync(() => setCurrentUser(user))
    localStorage.setItem(APP_CONSTANTS.STORAGE_KEYS.USER, JSON.stringify(user))
    localStorage.setItem(APP_CONSTANTS.STORAGE_KEYS.TOKEN, token)
  }, [])

  const logout = useCallback(() => {
    if (env.AUTH_BYPASS) {
      const fallbackUser = saveBypassUser(resolveBypassRole())
      setCurrentUser(fallbackUser)
      return
    }

    setCurrentUser(null)
    localStorage.removeItem(APP_CONSTANTS.STORAGE_KEYS.USER)
    localStorage.removeItem(APP_CONSTANTS.STORAGE_KEYS.TOKEN)
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
