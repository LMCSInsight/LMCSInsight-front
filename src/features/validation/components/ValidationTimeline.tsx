import { CheckCircle, XCircle, RefreshCw, Clock } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type {
  ValidationLogEntry,
  ValidationStatus,
} from '@/features/validation/types'
import { cn } from '@/lib/utils'

const ICON_MAP: Record<
  ValidationStatus,
  React.ComponentType<{ className?: string; strokeWidth?: number }>
> = {
  VALIDATED: CheckCircle,
  REJECTED: XCircle,
  REVISED: RefreshCw,
  PENDING: Clock,
}

const COLOR_MAP: Record<ValidationStatus, string> = {
  VALIDATED: 'text-emerald-600',
  REJECTED: 'text-rose-600',
  REVISED: 'text-sky-600',
  PENDING: 'text-amber-600',
}

interface Props {
  entries: ValidationLogEntry[]
  className?: string
}

export function ValidationTimeline({ entries, className }: Props) {
  const { t } = useTranslation()

  if (entries.length === 0) {
    return (
      <p className='text-sm text-muted-foreground py-4 text-center'>
        {t('assistant.timeline.empty')}
      </p>
    )
  }

  return (
    <ol className={cn('flex flex-col gap-0', className)}>
      {entries.map((entry, i) => {
        const Icon = ICON_MAP[entry.status]
        const color = COLOR_MAP[entry.status]
        const isLast = i === entries.length - 1

        return (
          <li key={entry.id} className='relative flex gap-3 pb-4'>
            {!isLast && (
              <div className='absolute left-[13px] top-7 bottom-0 w-px bg-border' />
            )}
            <div className={cn('mt-0.5 shrink-0', color)}>
              <Icon className='size-[26px]' strokeWidth={1.5} />
            </div>
            <div className='min-w-0 flex-1 pt-0.5'>
              <p className='text-sm font-medium text-foreground leading-snug'>
                {entry.supervision?.title ?? t('assistant.timeline.unknown')}
              </p>
              {entry.comments && (
                <p className='mt-0.5 text-xs text-muted-foreground line-clamp-2'>
                  {entry.comments}
                </p>
              )}
              <time className='mt-1 block text-xs text-muted-foreground/70'>
                {new Date(entry.createdAt).toLocaleDateString()}
              </time>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
