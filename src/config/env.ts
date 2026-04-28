export const env = {
  API_URL: import.meta.env.VITE_API_URL ?? '',
  APP_NAME: import.meta.env.VITE_APP_NAME ?? 'LMCS Insight',
  AUTH_BYPASS: import.meta.env.VITE_AUTH_BYPASS === 'true',
  DEV_AUTH_ROLE: import.meta.env.VITE_DEV_AUTH_ROLE ?? 'RESEARCHER',
} as const
