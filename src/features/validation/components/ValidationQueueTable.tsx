import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight, Eye, FileX } from 'lucide-react'
import { ValidationStatusBadge } from './ValidationStatusBadge'
import { getAssistantSupervisionDetailPath } from '@/config/routes'
import type { ValidationQueueItem } from '@/features/validation/types'
import { cn } from '@/lib/utils'

export function AgeBadge({ dateStr }: { dateStr: string }) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86_400_000)
  const label = days === 0 ? 'today' : `${days}d`
  if (days >= 7)
    return (
      <span className='inline-flex items-center rounded-md bg-rose-100 px-2 py-0.5 text-xs font-semibold tabular-nums text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'>
        {label}
      </span>
    )
  if (days >= 3)
    return (
      <span className='inline-flex items-center rounded-md bg-amber-100 px-2 py-0.5 text-xs font-semibold tabular-nums text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'>
        {label}
      </span>
    )
  return (
    <span className='inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium tabular-nums text-muted-foreground'>
      {label}
    </span>
  )
}

function rowBorderClass(dateStr: string): string {
  const days = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / 86_400_000,
  )
  if (days >= 7) return 'border-l-rose-400'
  if (days >= 3) return 'border-l-amber-400'
  return 'border-l-transparent'
}

interface Props {
  items: ValidationQueueItem[]
  /** true = row links disabled (e.g. activity-only). */
  readOnly?: boolean
  emptyMessage?: string
  /** Default: assistant supervisions detail. */
  resolveDetailPath?: (id: string) => string
}

export function ValidationQueueTable({
  items,
  readOnly,
  emptyMessage,
  resolveDetailPath = getAssistantSupervisionDetailPath,
}: Props) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const rowsRef = useRef<HTMLTableRowElement[]>([])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            ;(entry.target as HTMLElement).style.opacity = '1'
            ;(entry.target as HTMLElement).style.transform = 'translateY(0)'
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.05 },
    )
    rowsRef.current.forEach((row) => {
      if (row) observer.observe(row)
    })
    return () => observer.disconnect()
  }, [items])

  if (items.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-card/50 py-16'>
        <div className='flex size-12 items-center justify-center rounded-full bg-muted'>
          <FileX className='size-5 text-muted-foreground' strokeWidth={1.5} />
        </div>
        <p className='text-sm text-muted-foreground'>
          {emptyMessage ?? t('assistant.queue.empty')}
        </p>
      </div>
    )
  }

  return (
    <div className='overflow-hidden rounded-xl border border-border bg-card shadow-sm'>
      <table className='w-full text-sm'>
        <thead>
          <tr className='border-b border-border bg-muted/30'>
            <th className='px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground'>
              {t('assistant.queue.columns.title')}
            </th>
            <th className='px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground hidden md:table-cell'>
              {t('assistant.queue.columns.type')}
            </th>
            <th className='px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground hidden lg:table-cell'>
              {t('assistant.queue.columns.supervisor')}
            </th>
            <th className='px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-widest text-muted-foreground'>
              {t('assistant.queue.columns.status')}
            </th>
            <th className='px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-widest text-muted-foreground hidden sm:table-cell'>
              {t('assistant.queue.columns.age')}
            </th>
            <th className='w-12 px-3 py-3' />
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => {
            const studentName = item.student
              ? `${item.student.firstName} ${item.student.lastName}`
              : '—'
            const mainSupervisor =
              item.supervisors?.find((s) => s.isMainSupervisor)?.supervisor
                ?.nom_complet ?? item.supervisors?.[0]?.supervisor?.nom_complet

            return (
              <tr
                key={item.id}
                ref={(el) => {
                  if (el) rowsRef.current[i] = el
                }}
                onClick={() => navigate(resolveDetailPath(item.id))}
                style={{
                  opacity: 0,
                  transform: 'translateY(10px)',
                  transition: `opacity 500ms cubic-bezier(0.16,1,0.3,1) ${
                    i * 50
                  }ms, transform 500ms cubic-bezier(0.16,1,0.3,1) ${i * 50}ms`,
                }}
                className={cn(
                  'border-b border-border last:border-0 border-l-[3px] transition-colors',
                  rowBorderClass(item.createdAt),
                  'cursor-pointer hover:bg-muted/40',
                )}
              >
                <td className='px-4 py-3.5'>
                  <p className='font-medium text-foreground line-clamp-1 leading-snug'>
                    {item.title}
                  </p>
                  <p className='mt-0.5 text-xs text-muted-foreground'>
                    {studentName}
                  </p>
                </td>
                <td className='px-4 py-3.5 hidden md:table-cell'>
                  <span className='inline-flex items-center rounded-md border border-border bg-muted/60 px-2.5 py-0.5 text-xs font-medium text-muted-foreground'>
                    {item.type}
                  </span>
                </td>
                <td className='px-4 py-3.5 hidden lg:table-cell'>
                  <p className='text-xs text-muted-foreground line-clamp-1 max-w-45'>
                    {mainSupervisor ?? '—'}
                  </p>
                </td>
                <td className='px-4 py-3.5'>
                  <ValidationStatusBadge status={item.validationStatus} />
                </td>
                <td className='px-4 py-3.5 text-right hidden sm:table-cell'>
                  <AgeBadge dateStr={item.createdAt} />
                </td>
                <td className='px-3 py-3.5'>
                  <button
                    type='button'
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate(resolveDetailPath(item.id))
                    }}
                    className='flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors ml-auto'
                    aria-label={t('common.view')}
                  >
                    {readOnly ? (
                      <Eye className='size-3.5' strokeWidth={1.5} />
                    ) : (
                      <ArrowRight className='size-3.5' strokeWidth={1.5} />
                    )}
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

interface PaginationProps {
  page: number
  total: number
  limit: number
  onPageChange: (page: number) => void
}

export function QueuePagination({
  page,
  total,
  limit,
  onPageChange,
}: PaginationProps) {
  const { t } = useTranslation()
  const totalPages = Math.max(1, Math.ceil(total / limit))

  if (totalPages <= 1) return null

  return (
    <div className='flex items-center justify-between text-sm text-muted-foreground'>
      <span className='text-xs'>
        {(page - 1) * limit + 1}–{Math.min(page * limit, total)}{' '}
        <span className='text-muted-foreground/60'>/ {total}</span>
      </span>
      <div className='flex items-center gap-1'>
        <button
          type='button'
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className='h-8 rounded-md border border-border px-3 text-xs hover:bg-muted disabled:opacity-40 disabled:pointer-events-none transition-colors'
        >
          {t('common.previous')}
        </button>
        <span className='px-2 text-xs tabular-nums'>
          {page} / {totalPages}
        </span>
        <button
          type='button'
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className='h-8 rounded-md border border-border px-3 text-xs hover:bg-muted disabled:opacity-40 disabled:pointer-events-none transition-colors'
        >
          {t('common.next')}
        </button>
      </div>
    </div>
  )
}
