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
  return {
    id: backend.id,
    email: backend.email,
    name:
      backend.name ||
      [backend.firstName, backend.lastName].filter(Boolean).join(' ') ||
      backend.email,
    role: backend.role,
  }
}
