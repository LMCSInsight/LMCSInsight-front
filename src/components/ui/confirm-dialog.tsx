import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Supprimer',
  cancelLabel = 'Annuler',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onCancel])

  if (!open) return null

  return createPortal(
    <div className='fixed inset-0 z-[9999] flex items-center justify-center p-4'>
      {/* Backdrop */}
      <div
        className='absolute inset-0 bg-black/40 backdrop-blur-sm'
        onClick={onCancel}
        aria-hidden
      />
      {/* Dialog panel */}
      <div
        role='alertdialog'
        aria-modal='true'
        aria-labelledby='confirm-dialog-title'
        aria-describedby='confirm-dialog-desc'
        className='relative z-10 w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-xl space-y-5'
      >
        <div className='flex items-start gap-4'>
          <div className='flex size-10 shrink-0 items-center justify-center rounded-full bg-destructive/10'>
            <AlertTriangle className='size-5 text-destructive' />
          </div>
          <div className='min-w-0 flex-1'>
            <h2
              id='confirm-dialog-title'
              className='text-base font-semibold text-foreground'
            >
              {title}
            </h2>
            <p
              id='confirm-dialog-desc'
              className='mt-1 text-sm leading-relaxed text-muted-foreground'
            >
              {description}
            </p>
          </div>
        </div>
        <div className='flex justify-end gap-2'>
          <Button variant='outline' size='sm' onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button variant='destructive' size='sm' onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
