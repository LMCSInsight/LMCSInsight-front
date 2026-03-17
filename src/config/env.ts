export const env = {
  API_URL: import.meta.env.VITE_API_URL ?? "",
  APP_NAME: import.meta.env.VITE_APP_NAME ?? "LMCS Insight",
} as const;
