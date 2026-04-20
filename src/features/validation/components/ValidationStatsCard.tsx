import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface Props {
  label: string
  value: number | string
  sub?: string
  icon?: ReactNode
  action?: ReactNode
  className?: string
}

export function ValidationStatsCard({
  label,
  value,
  sub,
  icon,
  action,
  className,
}: Props) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-xl border border-border bg-card p-6',
        className,
      )}
    >
      <div className='flex items-start justify-between'>
        <p className='text-sm font-medium text-muted-foreground'>{label}</p>
        {icon && <span className='text-muted-foreground'>{icon}</span>}
      </div>
      <div className='flex items-end justify-between gap-2'>
        <span
          className='text-3xl font-semibold tracking-tight text-foreground'
          style={{ fontFamily: "'Geist', system-ui, sans-serif" }}
        >
          {value}
        </span>
        {sub && (
          <span className='mb-0.5 text-xs text-muted-foreground'>{sub}</span>
        )}
      </div>
      {action && <div className='mt-auto pt-1'>{action}</div>}
    </div>
  )
}
