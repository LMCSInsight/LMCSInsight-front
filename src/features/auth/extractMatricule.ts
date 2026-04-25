/** `supervision_supervisors.supervisorId` must exist on `chercheurs`; user UUIDs are invalid. */
export function sanitizeChercheurIdForApi(
  value: string | null | undefined,
): string | undefined {
  const t = value?.trim()
  if (!t) return undefined
  if (
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(t)
  ) {
    return undefined
  }
  return t
}

/** Pick first non-empty string (or finite number as string) from value. */
function asMatriculeString(v: unknown): string | undefined {
  if (typeof v === 'string') {
    const t = sanitizeChercheurIdForApi(v)
    return t || undefined
  }
  if (typeof v === 'number' && Number.isFinite(v)) {
    return String(Math.trunc(v))
  }
  return undefined
}

function readNested(
  obj: Record<string, unknown>,
  path: string[],
): string | undefined {
  let cur: unknown = obj
  for (const key of path) {
    if (cur === null || typeof cur !== 'object') return undefined
    cur = (cur as Record<string, unknown>)[key]
  }
  return asMatriculeString(cur)
}

const NESTED_OBJECT_KEYS = [
  'chercheur',
  'profile',
  'teacher',
  'researcher',
  'personnel',
  'account',
  'user',
] as const

/**
 * Reads **chercheur_id** (ESI matricule / PK on `chercheurs`) from auth payloads.
 * LMCS: `supervision_supervisors.supervisorId` → `chercheurs.chercheur_id`, not `users.id`.
 */
export function extractMatriculeFromBackendUser(
  backend: unknown,
  depth = 0,
): string | undefined {
  if (depth > 5 || !backend || typeof backend !== 'object') return undefined
  const o = backend as Record<string, unknown>

  const flatKeys = [
    'chercheur_id',
    'chercheurId',
    'matricule',
    'esiMatricule',
    'chercheurMatricule',
    'esi_matricule',
    'matricule_esi',
    'matriculeEsi',
    'matriculeESI',
    'esiMatricula',
    'numero_matricule',
    'numeroMatricule',
    'noMatricule',
    'idMatricule',
    'employeeId',
    'employeeNumber',
    'num_personnel',
    'numPersonnel',
    'badgeNumber',
    'cip',
    'codeChercheur',
    'code_chercheur',
  ]
  for (const k of flatKeys) {
    const s = asMatriculeString(o[k])
    if (s) return s
  }

  const nestedPaths = [
    ['chercheur', 'chercheur_id'],
    ['chercheur', 'chercheurId'],
    ['chercheur', 'matricule'],
    ['chercheur', 'esiMatricule'],
    ['chercheur', 'esi_matricule'],
    ['teacher', 'matricule'],
    ['profile', 'matricule'],
    ['account', 'matricule'],
    ['user', 'matricule'],
    ['researcher', 'matricule'],
    ['personnel', 'matricule'],
  ] as const
  for (const path of nestedPaths) {
    const s = readNested(o, [...path])
    if (s) return s
  }

  for (const key of NESTED_OBJECT_KEYS) {
    const inner = o[key]
    if (inner && typeof inner === 'object' && !Array.isArray(inner)) {
      const m = extractMatriculeFromBackendUser(inner, depth + 1)
      if (m) return m
    }
  }

  return undefined
}

export function decodeJwtPayload(
  token: string,
): Record<string, unknown> | null {
  const parts = token.split('.')
  if (parts.length < 2) return null
  try {
    let b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const pad = b64.length % 4
    if (pad) b64 += '='.repeat(4 - pad)
    const json = atob(b64)
    const payload = JSON.parse(json) as unknown
    return payload && typeof payload === 'object'
      ? (payload as Record<string, unknown>)
      : null
  } catch {
    return null
  }
}

/** Custom claims sometimes carry matricule when the user JSON does not. */
export function extractMatriculeFromAccessToken(
  token: string | null | undefined,
): string | undefined {
  if (!token || token.startsWith('dev-token')) return undefined
  const payload = decodeJwtPayload(token)
  if (!payload) return undefined

  const claimKeys = [
    'chercheur_id',
    'chercheurId',
    'matricule',
    'esiMatricule',
    'esi_matricule',
    'matricule_esi',
    'matriculeEsi',
    'Matricule',
    'num_personnel',
    'employeeNumber',
    'badgeNumber',
  ]
  for (const k of claimKeys) {
    const s = asMatriculeString(payload[k])
    if (s) return s
  }

  const lmcs = payload.lmcs
  if (lmcs && typeof lmcs === 'object') {
    const nested = lmcs as Record<string, unknown>
    const s =
      asMatriculeString(nested.chercheur_id) ??
      asMatriculeString(nested.chercheurId) ??
      asMatriculeString(nested.matricule) ??
      asMatriculeString(nested.esiMatricule)
    if (s) return s
  }

  const nestedClaims = [
    payload.user,
    payload.chercheur,
    payload.profile,
    payload.account,
    payload.user_metadata,
    payload['https://lmcs.insight/profile'],
  ]
  for (const block of nestedClaims) {
    if (block && typeof block === 'object') {
      const m = extractMatriculeFromBackendUser(block, 0)
      if (m) return m
    }
  }

  return undefined
}
