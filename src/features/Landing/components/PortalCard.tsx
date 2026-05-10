import { type ReactNode } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface PortalCardProps {
  children: ReactNode
  className?: string
  innerClassName?: string
  hoverable?: boolean
  padding?: boolean
}

export function PortalCard({
  children,
  className,
  innerClassName,
  hoverable = false,
  padding = true,
}: PortalCardProps) {
  return (
    <Card
      className={cn(
        'h-full border-border/70 shadow-none',
        hoverable &&
          'cursor-pointer transition-[background-color,border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-primary/20 hover:bg-card/80',
        className,
      )}
    >
      <CardContent
        className={cn(padding ? 'p-6' : 'p-0', 'h-full', innerClassName)}
      >
        {children}
      </CardContent>
    </Card>
  )
}
