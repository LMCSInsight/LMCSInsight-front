import { useTranslation } from 'react-i18next'
import { CheckCircle, XCircle, RefreshCw } from 'lucide-react'
import type { DecisionType } from './ValidationDecisionModal'
import { cn } from '@/lib/utils'

interface Props {
  onAction: (decision: DecisionType) => void
  disabled?: boolean
  status?: string
}

export function ValidationActionBar({ onAction, disabled, status }: Props) {
  const { t } = useTranslation()
  const isPending = !status || status === 'PENDING' || status === 'REVISED'

  if (!isPending) {
    return (
      <div className='sticky bottom-0 z-20 border-t border-border bg-card/95 backdrop-blur-sm px-6 py-3'>
        <p className='text-sm text-muted-foreground text-center'>
          {t('assistant.actionBar.alreadyReviewed')}
        </p>
      </div>
    )
  }

  return (
    <div className='sticky bottom-0 z-20 border-t border-border bg-card/95 backdrop-blur-sm px-6 py-3'>
      <div className='flex items-center justify-end gap-3'>
        <button
          type='button'
          onClick={() => onAction('reject')}
          disabled={disabled}
          className={cn(
            'inline-flex h-9 items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 text-sm font-medium text-rose-700',
            'hover:bg-rose-100 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none',
          )}
        >
          <XCircle className='size-4' strokeWidth={1.5} />
          {t('assistant.decision.reject')}
        </button>
        <button
          type='button'
          onClick={() => onAction('revise')}
          disabled={disabled}
          className={cn(
            'inline-flex h-9 items-center gap-2 rounded-lg border border-sky-200 bg-sky-50 px-4 text-sm font-medium text-sky-700',
            'hover:bg-sky-100 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none',
          )}
        >
          <RefreshCw className='size-4' strokeWidth={1.5} />
          {t('assistant.decision.revise')}
        </button>
        <button
          type='button'
          onClick={() => onAction('validate')}
          disabled={disabled}
          className={cn(
            'inline-flex h-9 items-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-medium text-white',
            'hover:bg-emerald-700 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none',
          )}
        >
          <CheckCircle className='size-4' strokeWidth={1.5} />
          {t('assistant.decision.validate')}
        </button>
      </div>
    </div>
  )
}
