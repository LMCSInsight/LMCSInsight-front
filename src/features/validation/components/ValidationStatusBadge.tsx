import { cn } from '@/lib/utils'
import type { ValidationStatus } from '@/features/validation/types'
import { useTranslation } from 'react-i18next'

const STATUS_STYLES: Record<ValidationStatus, string> = {
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  VALIDATED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  REJECTED: 'bg-rose-50 text-rose-700 border-rose-200',
  REVISED: 'bg-sky-50 text-sky-700 border-sky-200',
}

const STATUS_LABEL_KEYS: Record<ValidationStatus, string> = {
  PENDING: 'assistant.status.pending',
  VALIDATED: 'assistant.status.validated',
  REJECTED: 'assistant.status.rejected',
  REVISED: 'assistant.status.revised',
}

interface Props {
  status: ValidationStatus
  className?: string
}

export function ValidationStatusBadge({ status, className }: Props) {
  const { t } = useTranslation()
  return (
    <span
      className={cn(
        'inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide',
        STATUS_STYLES[status],
        className,
      )}
    >
      {t(STATUS_LABEL_KEYS[status])}
    </span>
  )
}
