import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { IssuesEditor } from './IssuesEditor'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'

export type DecisionType = 'validate' | 'reject' | 'revise'

interface Props {
  open: boolean
  decision: DecisionType | null
  loading: boolean
  onClose: () => void
  onConfirm: (comments: string, issues: string[]) => void
}

const TITLE_KEYS: Record<DecisionType, string> = {
  validate: 'assistant.decision.validateTitle',
  reject: 'assistant.decision.rejectTitle',
  revise: 'assistant.decision.reviseTitle',
}

const CONFIRM_KEYS: Record<DecisionType, string> = {
  validate: 'assistant.decision.validate',
  reject: 'assistant.decision.reject',
  revise: 'assistant.decision.revise',
}

const CONFIRM_STYLES: Record<DecisionType, string> = {
  validate: 'bg-emerald-600 hover:bg-emerald-700 text-white border-transparent',
  reject: 'bg-rose-600 hover:bg-rose-700 text-white border-transparent',
  revise: 'bg-sky-600 hover:bg-sky-700 text-white border-transparent',
}

export function ValidationDecisionModal({
  open,
  decision,
  loading,
  onClose,
  onConfirm,
}: Props) {
  const { t } = useTranslation()
  const [comments, setComments] = useState('')
  const [issues, setIssues] = useState<string[]>([])

  if (!open || !decision) return null

  const needsIssues = decision === 'reject' || decision === 'revise'
  const canConfirm = needsIssues
    ? comments.trim().length > 0 && issues.length > 0
    : true

  function handleConfirm() {
    if (!canConfirm) return
    onConfirm(comments, issues)
  }

  function handleClose() {
    setComments('')
    setIssues([])
    onClose()
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center'>
      {/* Backdrop */}
      <button
        type='button'
        className='absolute inset-0 bg-black/40 backdrop-blur-[2px]'
        onClick={handleClose}
        aria-label={t('common.close')}
      />

      {/* Panel */}
      <div
        className='relative z-10 w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-lg'
        style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.10)' }}
      >
        {/* Close */}
        <button
          type='button'
          onClick={handleClose}
          className='absolute right-4 top-4 rounded-md p-1 text-muted-foreground hover:bg-muted transition-colors'
          aria-label={t('common.close')}
        >
          <X className='size-4' strokeWidth={1.5} />
        </button>

        <h2 className='mb-1 text-base font-semibold text-foreground'>
          {t(TITLE_KEYS[decision])}
        </h2>
        <p className='mb-5 text-sm text-muted-foreground'>
          {t('assistant.decision.subtitle')}
        </p>

        <div className='flex flex-col gap-4'>
          {/* Comments */}
          <div className='flex flex-col gap-1.5'>
            <Label className='text-sm font-medium text-foreground'>
              {t('assistant.decision.commentsLabel')}
              {needsIssues && <span className='ml-1 text-destructive'>*</span>}
            </Label>
            <Textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder={t('assistant.decision.commentsPlaceholder')}
              rows={3}
              disabled={loading}
              className='resize-none'
            />
          </div>

          {/* Issues (reject / revise only) */}
          {needsIssues && (
            <div className='flex flex-col gap-1.5'>
              <Label className='text-sm font-medium text-foreground'>
                {t('assistant.decision.issuesLabel')}
                <span className='ml-1 text-destructive'>*</span>
              </Label>
              <IssuesEditor
                issues={issues}
                onChange={setIssues}
                disabled={loading}
              />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className='mt-6 flex justify-end gap-2'>
          <Button variant='ghost' onClick={handleClose} disabled={loading}>
            {t('common.cancel')}
          </Button>
          <button
            type='button'
            onClick={handleConfirm}
            disabled={!canConfirm || loading}
            className={cn(
              'inline-flex h-8 items-center justify-center rounded-lg border px-3 text-sm font-medium transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none',
              CONFIRM_STYLES[decision],
            )}
          >
            {loading ? t('common.saving') : t(CONFIRM_KEYS[decision])}
          </button>
        </div>
      </div>
    </div>
  )
}
