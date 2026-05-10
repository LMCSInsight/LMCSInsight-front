import { extractMatriculeFromBackendUser } from '@/features/auth/extractMatricule'

export interface LoginCredentials {
  email: string
  password: string
}

/** User shape stored in AuthContext (display). */
export interface AuthUser {
  id: string
  email: string
  name: string
  role: string
  /** ESI matricule used as `supervisorId` when assigning the signed-in researcher. */
  matricule?: string
}

/** User shape as returned by the backend auth API. */
export interface BackendAuthUser {
  id: string
  firstName: string
  lastName: string
  email: string
  role: string
  createdAt?: string
  name?: string
  matricule?: string
  esiMatricule?: string
  chercheurMatricule?: string
  /** LMCS: FK to `chercheurs.chercheur_id` — use for POST …/supervisors, not `id` (user PK). */
  chercheur_id?: string
  chercheurId?: string
}

export interface AuthResponse {
  user: BackendAuthUser
  accessToken: string
  refreshToken: string
}

/** Map backend user to display user for AuthContext. */
export function mapBackendUserToDisplayUser(
  backend: BackendAuthUser,
): AuthUser {
  const matricule = extractMatriculeFromBackendUser(backend as unknown)
  return {
    id: backend.id,
    email: backend.email,
    name:
      backend.name ||
      [backend.firstName, backend.lastName].filter(Boolean).join(' ') ||
      backend.email,
    role: backend.role,
    ...(matricule ? { matricule } : {}),
  }
}
