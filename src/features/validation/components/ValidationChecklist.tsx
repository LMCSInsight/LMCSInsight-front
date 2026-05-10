import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

const DEFAULT_FIELDS = [
  'title',
  'type',
  'academicYear',
  'student',
  'supervisors',
  'description',
  'keywords',
  'dates',
]

interface Props {
  fieldsChecked: Record<string, boolean>
  onChange: (updated: Record<string, boolean>) => void
  disabled?: boolean
  className?: string
}

export function ValidationChecklist({
  fieldsChecked,
  onChange,
  disabled,
  className,
}: Props) {
  const { t } = useTranslation()

  function toggle(field: string) {
    onChange({ ...fieldsChecked, [field]: !fieldsChecked[field] })
  }

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <p className='text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1'>
        {t('assistant.checklist.title')}
      </p>
      {DEFAULT_FIELDS.map((field) => (
        <label
          key={field}
          className='flex items-center gap-2.5 cursor-pointer group'
        >
          <input
            type='checkbox'
            checked={!!fieldsChecked[field]}
            onChange={() => toggle(field)}
            disabled={disabled}
            className='size-4 rounded border-border accent-primary'
          />
          <span className='text-sm text-foreground group-hover:text-foreground/80 transition-colors'>
            {t(`assistant.checklist.fields.${field}`)}
          </span>
        </label>
      ))}
    </div>
  )
}
