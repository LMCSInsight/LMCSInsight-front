import type { AppRole } from '@/config/routes'

export interface DevAccount {
  id: string
  email: string
  name: string
  role: AppRole
}

export const DEFAULT_DEV_ROLE: AppRole = 'RESEARCHER'

export const DEV_ACCOUNTS: Record<AppRole, DevAccount> = {
  ADMIN: {
    id: 'dev-admin-001',
    email: 'admin@lmcs.dev',
    name: 'Dev Admin',
    role: 'ADMIN',
  },
  DIRECTOR: {
    id: 'dev-director-001',
    email: 'director@lmcs.dev',
    name: 'Dev Director',
    role: 'DIRECTOR',
  },
  RESEARCHER: {
    id: 'dev-researcher-001',
    email: 'researcher@lmcs.dev',
    name: 'Dev Researcher',
    role: 'RESEARCHER',
  },
  ASSISTANT: {
    id: 'dev-assistant-001',
    email: 'assistant@lmcs.dev',
    name: 'Dev Assistant',
    role: 'ASSISTANT',
  },
}

export function normalizeAppRole(
  role: string | null | undefined,
): AppRole | null {
  if (!role) return null
  const normalized = role.toUpperCase()
  if (
    normalized === 'ADMIN' ||
    normalized === 'DIRECTOR' ||
    normalized === 'RESEARCHER' ||
    normalized === 'ASSISTANT'
  ) {
    return normalized
  }
  return null
}

export function getDevAccountByRole(role: AppRole): DevAccount {
  return DEV_ACCOUNTS[role]
}
