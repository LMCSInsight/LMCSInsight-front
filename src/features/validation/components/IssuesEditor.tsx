import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tag } from '@/components/ui/tag'
import { Plus } from 'lucide-react'

interface Props {
  issues: string[]
  onChange: (issues: string[]) => void
  disabled?: boolean
}

export function IssuesEditor({ issues, onChange, disabled }: Props) {
  const { t } = useTranslation()
  const [draft, setDraft] = useState('')

  function addIssue() {
    const trimmed = draft.trim()
    if (!trimmed || issues.includes(trimmed)) return
    onChange([...issues, trimmed])
    setDraft('')
  }

  function removeIssue(issue: string) {
    onChange(issues.filter((i) => i !== issue))
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      addIssue()
    }
  }

  return (
    <div className='flex flex-col gap-2'>
      <div className='flex gap-2'>
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('assistant.decision.issueInputPlaceholder')}
          disabled={disabled}
          className='flex-1'
        />
        <Button
          type='button'
          variant='outline'
          size='icon'
          onClick={addIssue}
          disabled={disabled || !draft.trim()}
          aria-label={t('common.add')}
        >
          <Plus className='size-4' strokeWidth={1.5} />
        </Button>
      </div>
      {issues.length > 0 && (
        <div className='flex flex-wrap gap-1.5'>
          {issues.map((issue) => (
            <Tag
              key={issue}
              onRemove={disabled ? undefined : () => removeIssue(issue)}
            >
              {issue}
            </Tag>
          ))}
        </div>
      )}
    </div>
  )
}
