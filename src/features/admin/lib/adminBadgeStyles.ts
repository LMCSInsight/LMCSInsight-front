import { cn } from '@/lib/utils'

/** Softer semantic badges — one accent family + borders (admin UI). */
const ACTION: Record<string, string> = {
  CREATE:
    'border-emerald-600/20 bg-emerald-600/[0.08] text-emerald-900 dark:border-emerald-500/25 dark:text-emerald-300',
  UPDATE:
    'border-sky-600/20 bg-sky-600/[0.08] text-sky-900 dark:border-sky-500/25 dark:text-sky-300',
  DELETE:
    'border-red-600/20 bg-red-600/[0.08] text-red-900 dark:border-red-500/25 dark:text-red-300',
  LOGIN:
    'border-violet-600/20 bg-violet-600/[0.08] text-violet-900 dark:border-violet-500/25 dark:text-violet-300',
  VALIDATE:
    'border-teal-600/20 bg-teal-600/[0.08] text-teal-900 dark:border-teal-500/25 dark:text-teal-300',
  REJECT:
    'border-orange-600/20 bg-orange-600/[0.08] text-orange-900 dark:border-orange-500/25 dark:text-orange-300',
  REVISE:
    'border-amber-600/20 bg-amber-600/[0.08] text-amber-900 dark:border-amber-500/25 dark:text-amber-300',
}

const ROLE: Record<string, string> = {
  ADMIN:
    'border-neutral-600/25 bg-neutral-600/[0.1] text-neutral-900 dark:text-neutral-200',
  DIRECTOR:
    'border-sky-600/20 bg-sky-600/[0.08] text-sky-900 dark:text-sky-300',
  RESEARCHER:
    'border-emerald-600/20 bg-emerald-600/[0.08] text-emerald-900 dark:text-emerald-300',
  ASSISTANT:
    'border-amber-600/20 bg-amber-600/[0.08] text-amber-900 dark:text-amber-300',
}

export function adminActionBadgeClass(action: string): string {
  return cn(
    'rounded-md border px-2 py-0.5 text-xs font-medium tabular-nums',
    ACTION[action] ?? 'border-border bg-muted text-muted-foreground',
  )
}

export function adminRoleBadgeClass(role: string): string {
  return cn(
    'rounded-md border px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide',
    ROLE[role] ?? 'border-border bg-muted text-muted-foreground',
  )
}
