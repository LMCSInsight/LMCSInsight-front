import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface LandingSectionProps {
  id?: string
  children: ReactNode
  className?: string
  containerClassName?: string
  muted?: boolean
}

export function LandingSection({
  id,
  children,
  className,
  containerClassName,
  muted = false,
}: LandingSectionProps) {
  return (
    <section
      id={id}
      className={cn(
        'relative py-28',
        muted ? 'bg-muted/20' : 'bg-background',
        className,
      )}
      style={{ scrollMarginTop: '80px' }}
    >
      <div
        className={cn(
          'mx-auto w-full max-w-6xl px-6 lg:px-12',
          containerClassName,
        )}
      >
        {children}
      </div>
    </section>
  )
}

interface SectionHeaderProps {
  eyebrow: string
  headline: string
  subheading?: string
  align?: 'left' | 'center'
  className?: string
  eyebrowClassName?: string
}

export function SectionHeader({
  eyebrow,
  headline,
  subheading,
  align = 'left',
  className,
  eyebrowClassName,
}: SectionHeaderProps) {
  const centered = align === 'center'

  return (
    <div
      className={cn(
        'flex flex-col gap-3',
        centered ? 'mx-auto items-center text-center' : 'items-start',
        className,
      )}
    >
      <span
        className={cn(
          'inline-flex rounded-md border border-border bg-card px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground',
          eyebrowClassName,
        )}
      >
        {eyebrow}
      </span>
      <h2 className='max-w-3xl text-balance text-4xl font-semibold tracking-[-0.035em] text-foreground md:text-5xl'>
        {headline}
      </h2>
      {subheading ? (
        <p className='max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground'>
          {subheading}
        </p>
      ) : null}
    </div>
  )
}

export function LandingDivider({ className }: { className?: string }) {
  return <div className={cn('h-px w-full bg-border/70', className)} />
}
