import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  ArrowRight,
  Buildings,
  ChartBar,
  Checks,
  FileText,
} from '@phosphor-icons/react'
import { buttonVariants } from '@/components/ui/button'
import { ROUTES } from '@/config/routes'
import { cn } from '@/lib/utils'
import { ResearcherPortalSnapshot } from './DashboardPreview'
import { ScrollReveal } from './ScrollReveal'

const HERO_SNAPSHOT_SCALE = 0.48

function DashboardMockup() {
  return (
    <div className='relative overflow-hidden rounded-2xl border border-border bg-muted/30 shadow-primary-sm'>
      <div className='flex items-center justify-between border-b border-border bg-card/80 px-4 py-3'>
        <div className='flex items-center gap-2'>
          <span className='size-2 rounded-full bg-primary/40' />
          <span className='text-xs font-medium text-muted-foreground'>
            Chercheur / tableau de bord réel
          </span>
        </div>
        <span className='text-[11px] text-muted-foreground'>LMCSInsight</span>
      </div>
      <div className='relative h-[420px] overflow-hidden'>
        <div
          style={{
            transform: `scale(${HERO_SNAPSHOT_SCALE})`,
            transformOrigin: 'top left',
            width: `${100 / HERO_SNAPSHOT_SCALE}%`,
            height: `${100 / HERO_SNAPSHOT_SCALE}%`,
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        >
          <ResearcherPortalSnapshot clipForHero />
        </div>
      </div>
    </div>
  )
}

export function HeroSection() {
  const { t } = useTranslation()

  const evidence = [
    { Icon: Buildings, label: t('landing.hero.badge_pfe') },
    { Icon: ChartBar, label: t('landing.hero.badge_master') },
    { Icon: FileText, label: t('landing.hero.badge_doctorat') },
    { Icon: Checks, label: t('landing.hero.badge_stage') },
  ]

  const bullets = ['bullet1', 'bullet2', 'bullet3'] as const

  return (
    <section className='relative overflow-hidden bg-background py-24 lg:py-32'>
      <div className='pointer-events-none absolute inset-x-0 top-0 h-32 bg-[radial-gradient(ellipse_at_top,oklch(0.45_0.2_260/0.08),transparent_65%)]' />

      <div className='relative mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-10 px-6 lg:grid-cols-[0.88fr_1.12fr] lg:px-12'>
        <div className='grid gap-6 lg:min-w-0'>
          <ScrollReveal>
            <span className='inline-flex w-fit rounded-md border border-border bg-card px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground'>
              {t('landing.hero.eyebrow')}
            </span>
          </ScrollReveal>

          <ScrollReveal delay={80}>
            <div className='space-y-5'>
              <h1 className='max-w-4xl text-balance text-5xl font-semibold leading-[0.96] tracking-[-0.06em] text-foreground md:text-6xl lg:text-7xl'>
                {t('landing.hero.headline1')}{' '}
                <span className='text-primary'>
                  {t('landing.hero.headline2')}
                </span>
              </h1>
              <p className='max-w-[58ch] text-pretty text-base leading-relaxed text-muted-foreground md:text-lg'>
                {t('landing.hero.subheading')}
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={160}>
            <ul className='grid gap-2.5 rounded-2xl border border-border bg-card/70 p-4'>
              {bullets.map((key) => (
                <li
                  key={key}
                  className='grid grid-cols-[0.75rem_1fr] gap-3 text-sm leading-relaxed text-muted-foreground'
                >
                  <span className='mt-2 size-1.5 rounded-full bg-primary/70' />
                  {t(`landing.hero.${key}`)}
                </li>
              ))}
            </ul>
          </ScrollReveal>

          <ScrollReveal delay={220}>
            <div className='flex flex-wrap items-center gap-3'>
              <Link
                to={ROUTES.LOGIN}
                className={cn(buttonVariants({ size: 'lg' }), 'gap-2')}
              >
                {t('landing.hero.cta_primary')}
                <ArrowRight className='size-4' weight='bold' />
              </Link>
              <button
                type='button'
                onClick={() =>
                  document
                    .getElementById('dashboard')
                    ?.scrollIntoView({ behavior: 'smooth' })
                }
                className={cn(
                  buttonVariants({ variant: 'outline', size: 'lg' }),
                )}
              >
                {t('landing.hero.cta_secondary')}
              </button>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={280}>
            <div className='hidden rounded-2xl border border-border bg-muted/30 p-3 lg:block'>
              <p className='mb-3 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground'>
                Couverture académique
              </p>
              <div className='grid grid-cols-2 gap-2'>
                {evidence.map(({ Icon, label }) => (
                  <div
                    key={label}
                    className='rounded-xl border border-border bg-background/80 px-3 py-3 text-xs text-muted-foreground'
                  >
                    <Icon
                      className='mb-2 size-4 text-primary'
                      weight='duotone'
                    />
                    <span className='font-medium'>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>

        <div className='grid gap-4'>
          <ScrollReveal delay={160} direction='right'>
            <DashboardMockup />
          </ScrollReveal>

          <ScrollReveal delay={260} direction='right'>
            <div className='grid grid-cols-2 gap-2 lg:hidden'>
              {evidence.map(({ Icon, label }) => (
                <div
                  key={label}
                  className='rounded-lg border border-border bg-card/70 px-3 py-2 text-xs text-muted-foreground'
                >
                  <Icon className='mb-2 size-4 text-primary' weight='duotone' />
                  <span className='font-medium'>{label}</span>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  )
}
