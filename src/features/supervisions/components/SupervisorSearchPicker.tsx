import { useMemo, useState, type ReactNode } from 'react'
import { UserCheck, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useChercheurs } from '@/features/chercheurs/hooks'
import type { ChercheurListItem } from '@/features/chercheurs/api'
import { cn } from '@/lib/utils'

const LIST_LIMIT = 500

type Props = {
  id: string
  label: ReactNode
  value: string
  onChange: (chercheurId: string) => void
  excludeIds: string[]
  error?: boolean
  helperText?: ReactNode
  compact?: boolean
}

/**
 * Search + list picker for `chercheurs.chercheur_id` (encadrant principal / co-encadrants).
 */
export function SupervisorSearchPicker({
  id,
  label,
  value,
  onChange,
  excludeIds,
  error,
  helperText,
  compact,
}: Props) {
  const [search, setSearch] = useState('')
  const { data: page, isLoading } = useChercheurs({
    limit: LIST_LIMIT,
    page: 1,
  })

  const byId = useMemo(() => {
    const m = new Map<string, ChercheurListItem>()
    for (const c of page?.data ?? []) m.set(c.chercheur_id, c)
    return m
  }, [page?.data])

  const taken = useMemo(
    () => new Set(excludeIds.filter((x) => x && x !== value)),
    [excludeIds, value],
  )

  const list = useMemo(() => {
    const q = search.trim().toLowerCase()
    return (page?.data ?? []).filter((c) => {
      if (taken.has(c.chercheur_id)) return false
      if (!q) return true
      if (c.nom_complet.toLowerCase().includes(q)) return true
      if (c.chercheur_id.toLowerCase().includes(q)) return true
      return false
    })
  }, [page?.data, search, taken])

  const maxShown = 25
  const showList = !value && (list.length > 0 || search.trim() !== '')

  const selected = value ? byId.get(value) : undefined
  const displayName =
    selected?.nom_complet ?? (value ? `Identifiant : ${value}` : '')
  const subline = selected
    ? [selected.chercheur_id, selected.grade_recherche, selected.team?.name]
        .filter(Boolean)
        .join(' · ')
    : ''

  const pickList = search.trim() ? list : list.slice(0, maxShown)

  return (
    <div className='space-y-1.5'>
      <Label
        htmlFor={id}
        className={cn('font-medium', compact ? 'text-xs' : 'text-xs')}
      >
        {label}
      </Label>
      {value && (
        <div
          className={cn(
            'flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 pr-1',
            compact ? 'py-1.5 pl-2' : 'px-3 py-2',
          )}
        >
          <div
            className={cn(
              'flex shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary',
              compact ? 'size-7' : 'size-8',
            )}
          >
            <UserCheck className={compact ? 'size-3.5' : 'size-4'} />
          </div>
          <div className='min-w-0 flex-1'>
            <p
              className={cn(
                'font-medium text-foreground truncate',
                compact ? 'text-xs' : 'text-sm',
              )}
            >
              {displayName}
            </p>
            {subline && (
              <p
                className={cn(
                  'text-muted-foreground truncate',
                  compact ? 'text-[10px]' : 'text-xs',
                )}
              >
                {subline}
              </p>
            )}
          </div>
          <button
            type='button'
            onClick={() => {
              onChange('')
              setSearch('')
            }}
            className='shrink-0 rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground'
            aria-label='Effacer'
          >
            <X className='size-4' />
          </button>
        </div>
      )}
      {!selected && (
        <>
          <Input
            id={id}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder='Rechercher par nom ou identifiant chercheur…'
            className={cn(
              compact ? 'h-8 text-sm' : 'h-9',
              error ? 'border-destructive' : 'border-input',
            )}
            autoComplete='off'
            disabled={isLoading}
          />
          {showList && list.length > 0 && (
            <div
              className={cn(
                'overflow-y-auto rounded-lg border border-border bg-card',
                compact ? 'max-h-40' : 'max-h-56',
              )}
            >
              {pickList.map((c) => (
                <button
                  key={c.chercheur_id}
                  type='button'
                  onClick={() => {
                    onChange(c.chercheur_id)
                    setSearch('')
                  }}
                  className='flex w-full items-center gap-2 border-b border-border px-3 py-2.5 text-left last:border-0 hover:bg-muted/60'
                >
                  <div className='min-w-0 flex-1'>
                    <p
                      className={cn(
                        'font-medium',
                        compact ? 'text-xs' : 'text-sm',
                      )}
                    >
                      {c.nom_complet}
                    </p>
                    <p
                      className={cn(
                        'text-muted-foreground',
                        compact ? 'text-[10px]' : 'text-xs',
                      )}
                    >
                      {c.chercheur_id}
                      {c.grade_recherche ? ` · ${c.grade_recherche}` : ''}
                      {c.team?.name ? ` · ${c.team.name}` : ''}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
          {showList && !isLoading && list.length === 0 && (
            <p className='text-xs text-muted-foreground py-1 text-center'>
              {search.trim()
                ? `Aucun chercheur pour « ${search} »`
                : 'Aucun chercheur actif à afficher.'}
            </p>
          )}
        </>
      )}
      {helperText}
    </div>
  )
}
