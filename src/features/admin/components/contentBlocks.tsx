import { Link } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import { ArrowUpRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface AdminKpiTileProps {
  label: string
  value: string | number
  helper?: string
  trend?: number
  icon?: LucideIcon
}

export function AdminKpiTile({
  label,
  value,
  helper,
  trend,
  icon: Icon,
}: AdminKpiTileProps) {
  return (
    <Card className='border-border/70 shadow-none'>
      <CardHeader className='flex flex-row items-start justify-between space-y-0 pb-2'>
        <CardTitle className='text-xs font-medium uppercase tracking-wider text-muted-foreground'>
          {label}
        </CardTitle>
        {Icon ? (
          <Icon className='size-4 text-muted-foreground' strokeWidth={1.5} />
        ) : null}
      </CardHeader>
      <CardContent className='space-y-2'>
        <p className='tabular text-3xl font-semibold tracking-tight text-foreground'>
          {value}
        </p>
        <div className='flex items-center justify-between gap-2'>
          <p className='text-xs text-muted-foreground'>{helper ?? ''}</p>
          {typeof trend === 'number' ? (
            <span
              className={cn(
                'tabular text-xs font-medium',
                trend >= 0 ? 'text-emerald-600' : 'text-red-600',
              )}
            >
              {trend > 0 ? '+' : ''}
              {trend}%
            </span>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}

interface AdminInsightCardProps {
  title: string
  value: string | number
  subtitle?: string
  actionLabel?: string
  actionTo?: string
}

export function AdminInsightCard({
  title,
  value,
  subtitle,
  actionLabel,
  actionTo,
}: AdminInsightCardProps) {
  return (
    <Card className='border-border/70 shadow-none'>
      <CardHeader className='pb-2'>
        <CardTitle className='text-sm font-medium text-muted-foreground'>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-3'>
        <p className='tabular text-2xl font-semibold text-foreground'>
          {value}
        </p>
        {subtitle ? (
          <p className='text-xs text-muted-foreground'>{subtitle}</p>
        ) : null}
        {actionLabel && actionTo ? (
          <Link
            to={actionTo}
            className={cn(
              buttonVariants({ variant: 'ghost', size: 'sm' }),
              'h-8 gap-1 px-2',
            )}
          >
            {actionLabel}
            <ArrowUpRight className='size-3.5' />
          </Link>
        ) : null}
      </CardContent>
    </Card>
  )
}

interface AdminEmptyStatePanelProps {
  title: string
  description: string
  ctaLabel?: string
  ctaTo?: string
  icon?: LucideIcon
}

export function AdminEmptyStatePanel({
  title,
  description,
  ctaLabel,
  ctaTo,
  icon: Icon,
}: AdminEmptyStatePanelProps) {
  return (
    <div className='rounded-xl border border-dashed border-border/80 bg-muted/20 px-6 py-10 text-center'>
      {Icon ? (
        <div className='mx-auto mb-3 flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary'>
          <Icon className='size-4' strokeWidth={1.5} />
        </div>
      ) : null}
      <h3 className='text-base font-semibold tracking-tight text-foreground'>
        {title}
      </h3>
      <p className='mx-auto mt-2 max-w-md text-sm text-muted-foreground'>
        {description}
      </p>
      {ctaLabel && ctaTo ? (
        <Link to={ctaTo} className={cn(buttonVariants({ size: 'sm' }), 'mt-5')}>
          {ctaLabel}
        </Link>
      ) : null}
    </div>
  )
}

interface ActionItem {
  label: string
  to: string
}

interface AdminSectionActionBarProps {
  title: string
  actions: ActionItem[]
}

export function AdminSectionActionBar({
  title,
  actions,
}: AdminSectionActionBarProps) {
  return (
    <div className='flex flex-wrap items-center gap-2 rounded-lg border border-border/70 bg-card px-3 py-2'>
      <span className='mr-1 text-xs font-medium uppercase tracking-wider text-muted-foreground'>
        {title}
      </span>
      {actions.map((action) => (
        <Link
          key={action.to}
          to={action.to}
          className={cn(
            buttonVariants({ variant: 'ghost', size: 'sm' }),
            'h-7 px-2.5',
          )}
        >
          {action.label}
        </Link>
      ))}
    </div>
  )
}
