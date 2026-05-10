import * as React from 'react'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'

interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  onRemove?: () => void
}

function Tag({ children, className, onRemove, ...props }: TagProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border border-border bg-muted/60 px-2.5 py-0.5 text-xs font-medium text-foreground',
        className,
      )}
      {...props}
    >
      {children}
      {onRemove && (
        <button
          type='button'
          onClick={onRemove}
          className='ml-0.5 rounded-full p-0.5 hover:bg-muted-foreground/20 transition-colors'
          aria-label='Remove'
        >
          <X className='size-3' strokeWidth={2} />
        </button>
      )}
    </span>
  )
}

export { Tag }
