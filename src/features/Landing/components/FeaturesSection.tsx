import { useTranslation } from 'react-i18next'
import {
  BookOpen,
  ChartBar,
  ClipboardText,
  FileArrowDown,
  Funnel,
  Scroll,
  ShieldCheck,
  UsersThree,
} from '@phosphor-icons/react'
import { LandingSection, SectionHeader } from './LandingPrimitives'
import { PortalCard } from './PortalCard'
import { ScrollReveal } from './ScrollReveal'
import { cn } from '@/lib/utils'

export function FeaturesSection() {
  const { t } = useTranslation()

  const groups = [
    {
      title: t('landing.features.group_operational_title'),
      desc: t('landing.features.group_operational_desc'),
      items: [
        {
          icon: BookOpen,
          title: t('landing.features.f1_title'),
          desc: t('landing.features.f1_desc'),
        },
        {
          icon: Funnel,
          title: t('landing.features.f2_title'),
          desc: t('landing.features.f2_desc'),
        },
        {
          icon: ChartBar,
          title: t('landing.features.f3_title'),
          desc: t('landing.features.f3_desc'),
        },
        {
          icon: FileArrowDown,
          title: t('landing.features.f4_title'),
          desc: t('landing.features.f4_desc'),
        },
      ],
    },
    {
      title: t('landing.features.group_governance_title'),
      desc: t('landing.features.group_governance_desc'),
      items: [
        {
          icon: ClipboardText,
          title: t('landing.features.f6_title'),
          desc: t('landing.features.f6_desc'),
        },
        {
          icon: UsersThree,
          title: t('landing.features.f7_title'),
          desc: t('landing.features.f7_desc'),
        },
        {
          icon: Scroll,
          title: t('landing.features.f8_title'),
          desc: t('landing.features.f8_desc'),
        },
        {
          icon: ShieldCheck,
          title: t('landing.features.f5_title'),
          desc: t('landing.features.f5_desc'),
        },
      ],
    },
  ]

  return (
    <LandingSection id='features' containerClassName='max-w-7xl'>
      <ScrollReveal>
        <SectionHeader
          eyebrow={t('landing.features.eyebrow')}
          headline={t('landing.features.headline')}
          subheading={t('landing.features.subheading')}
          className='mb-14'
        />
      </ScrollReveal>

      <div className='grid gap-6 lg:grid-cols-6'>
        {groups.map((group, groupIndex) => (
          <ScrollReveal
            key={group.title}
            delay={groupIndex * 100}
            className='lg:col-span-3'
          >
            <PortalCard
              className={cn(
                'h-full',
                groupIndex === 0 ? 'bg-card' : 'bg-muted/35',
              )}
              innerClassName='p-7 lg:p-8'
            >
              <div className='grid h-full gap-7'>
                <div className='grid gap-4 sm:grid-cols-[1fr_auto] sm:items-start'>
                  <div className='max-w-lg space-y-2'>
                    <p className='text-lg font-semibold tracking-tight text-foreground'>
                      {group.title}
                    </p>
                    <p className='text-base leading-relaxed text-muted-foreground'>
                      {group.desc}
                    </p>
                  </div>
                  <span className='rounded-lg border border-border bg-background px-3 py-2 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground'>
                    0{groupIndex + 1}
                  </span>
                </div>

                <div className='grid gap-4 sm:grid-cols-2'>
                  {group.items.map(({ icon: Icon, title, desc }, index) => (
                    <div
                      key={title}
                      className={cn(
                        'rounded-2xl border border-border/70 bg-background/70 p-5',
                        index === 0 && 'sm:col-span-2 sm:min-h-44',
                      )}
                    >
                      <div
                        className={cn(
                          'grid gap-4',
                          index === 0 ? 'sm:grid-cols-[2.5rem_1fr]' : '',
                        )}
                      >
                        <div className='flex size-11 items-center justify-center rounded-xl bg-primary/8 text-primary'>
                          <Icon className='size-5' weight='duotone' />
                        </div>
                        <div className='min-w-0'>
                          <div className='mb-1 flex items-center gap-2'>
                            <span className='text-[10px] font-medium tabular text-muted-foreground'>
                              {String(index + 1).padStart(2, '0')}
                            </span>
                            <h3 className='text-base font-semibold tracking-tight text-foreground'>
                              {title}
                            </h3>
                          </div>
                          <p className='text-sm leading-relaxed text-muted-foreground'>
                            {desc}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </PortalCard>
          </ScrollReveal>
        ))}
      </div>
    </LandingSection>
  )
}
