import { useTranslation } from 'react-i18next'
import { ArrowRight } from '@phosphor-icons/react'
import { LandingSection, SectionHeader } from './LandingPrimitives'
import { PortalCard } from './PortalCard'
import { ScrollReveal } from './ScrollReveal'
import { cn } from '@/lib/utils'

export function ProblemSection() {
  const { t } = useTranslation()

  const steps = [
    {
      title: t('landing.problem.card1_title'),
      desc: t('landing.problem.card1_desc'),
      marker: '01',
    },
    {
      title: t('landing.problem.card2_title'),
      desc: t('landing.problem.card2_desc'),
      marker: '02',
    },
    {
      title: t('landing.problem.card3_title'),
      desc: t('landing.problem.card3_desc'),
      marker: '03',
    },
    {
      title: t('landing.problem.card4_title'),
      desc: t('landing.problem.card4_desc'),
      marker: '04',
    },
  ]

  return (
    <LandingSection id='problem' muted>
      <div className='grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-stretch'>
        <ScrollReveal>
          <div className='flex h-full flex-col justify-between rounded-3xl border border-border bg-card p-7'>
            <SectionHeader
              eyebrow={t('landing.problem.eyebrow')}
              headline={t('landing.problem.headline')}
              subheading={t('landing.problem.subheading')}
            />

            <div className='mt-10 grid gap-3 sm:grid-cols-3 lg:grid-cols-1'>
              {['Fichiers', 'Décisions', 'Bilans'].map((label, index) => (
                <div
                  key={label}
                  className='rounded-2xl border border-border bg-background/70 p-4'
                >
                  <span className='text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground'>
                    0{index + 1}
                  </span>
                  <p className='mt-3 text-sm font-semibold text-foreground'>
                    {label}
                  </p>
                  <p className='mt-1 text-xs leading-relaxed text-muted-foreground'>
                    {index === 0
                      ? 'Sources dispersées entre documents, e-mails et archives.'
                      : index === 1
                        ? 'Historique difficile à retracer sans espace commun.'
                        : 'Reporting manuel avant chaque synthèse institutionnelle.'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        <div className='grid gap-4'>
          <div className='grid gap-4 sm:grid-cols-2'>
            {steps.map((step, index) => (
              <ScrollReveal key={step.title} delay={index * 70}>
                <PortalCard
                  className={cn(
                    'relative overflow-hidden bg-card/80',
                    index === 0 || index === 3 ? 'sm:min-h-56' : 'sm:min-h-48',
                  )}
                >
                  <div className='flex h-full flex-col justify-between gap-8'>
                    <div className='flex items-start justify-between gap-4'>
                      <div className='flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-xs font-semibold tabular text-primary'>
                        {step.marker}
                      </div>
                      {index < steps.length - 1 ? (
                        <ArrowRight
                          className='size-4 text-muted-foreground'
                          weight='bold'
                        />
                      ) : null}
                    </div>
                    <div className='min-w-0 space-y-2'>
                      <h3 className='text-base font-semibold tracking-tight text-foreground'>
                        {step.title}
                      </h3>
                      <p className='text-sm leading-relaxed text-muted-foreground'>
                        {step.desc}
                      </p>
                    </div>
                  </div>
                </PortalCard>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal delay={320}>
            <div
              className={cn(
                'rounded-2xl border border-dashed border-primary/25 bg-primary/5 px-5 py-4',
                'text-sm leading-relaxed text-muted-foreground',
              )}
            >
              <span className='font-medium text-foreground'>
                {t('landing.problem.result_label')}{' '}
              </span>
              {t('landing.problem.result_desc')}
            </div>
          </ScrollReveal>
        </div>
      </div>
    </LandingSection>
  )
}
