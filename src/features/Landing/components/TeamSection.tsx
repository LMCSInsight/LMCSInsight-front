import { useTranslation } from 'react-i18next'
import { LandingSection, SectionHeader } from './LandingPrimitives'
import { PortalCard } from './PortalCard'
import { ScrollReveal } from './ScrollReveal'

const members = [
  {
    nameKey: 'landing.team.member1_name',
    initials: 'LA',
    leader: true,
  },
  {
    nameKey: 'landing.team.member2_name',
    initials: 'GA',
  },
  {
    nameKey: 'landing.team.member3_name',
    initials: 'AY',
  },
  {
    nameKey: 'landing.team.member4_name',
    initials: 'HB',
  },
  {
    nameKey: 'landing.team.member5_name',
    initials: 'BM',
  },
  {
    nameKey: 'landing.team.member6_name',
    initials: 'HA',
  },
]

export function TeamSection() {
  const { t } = useTranslation()

  return (
    <LandingSection id='team' containerClassName='max-w-7xl'>
      <div className='grid gap-6 lg:grid-cols-[0.9fr_1.1fr]'>
        <ScrollReveal>
          <div className='grid h-full gap-6'>
            <SectionHeader
              eyebrow={t('landing.team.eyebrow')}
              headline={t('landing.team.headline')}
              subheading={t('landing.team.subheading')}
              className='[&_h2]:max-w-xl [&_h2]:text-5xl [&_p]:text-base'
            />

            <PortalCard className='bg-muted/30' innerClassName='p-7'>
              <div className='grid gap-8 sm:grid-cols-[1fr_auto] sm:items-end'>
                <div>
                  <p className='text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground'>
                    {t('landing.team.project_title')}
                  </p>
                  <p className='mt-4 max-w-xl text-base leading-relaxed text-muted-foreground'>
                    {t('landing.team.project_desc')}
                  </p>
                </div>
                <div className='rounded-2xl border border-border bg-background p-5 text-right'>
                  <p className='text-3xl font-semibold tracking-[-0.04em] text-foreground'>
                    06
                  </p>
                  <p className='mt-1 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground'>
                    {t('landing.team.members_label')}
                  </p>
                </div>
              </div>
              <div className='mt-6 rounded-2xl border border-border bg-background p-5'>
                <p className='text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground'>
                  {t('landing.team.supervised_by')}
                </p>
                <div className='mt-4 grid gap-3 sm:grid-cols-2'>
                  <div className='rounded-xl border border-border bg-card px-4 py-3'>
                    <p className='text-sm font-semibold tracking-tight text-foreground'>
                      {t('landing.team.supervisor1')}
                    </p>
                  </div>
                  <div className='rounded-xl border border-border bg-card px-4 py-3'>
                    <p className='text-sm font-semibold tracking-tight text-foreground'>
                      {t('landing.team.supervisor2')}
                    </p>
                  </div>
                </div>
              </div>
            </PortalCard>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={100} direction='right'>
          <PortalCard className='h-full bg-card' innerClassName='p-4 sm:p-5'>
            <div className='grid gap-3 sm:grid-cols-2'>
              {members.map((member, index) => (
                <div
                  key={member.nameKey}
                  className={[
                    'relative overflow-hidden rounded-2xl border border-border bg-background p-5 transition-colors hover:border-primary/25',
                    member.leader ? 'sm:col-span-2 bg-primary/5' : '',
                  ].join(' ')}
                >
                  <div className='flex items-start justify-between gap-4'>
                    <div className='flex min-w-0 items-center gap-4'>
                      <div className='flex size-14 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-base font-semibold text-primary'>
                        {member.initials}
                      </div>
                      <div className='min-w-0'>
                        <p className='text-base font-semibold tracking-tight text-foreground'>
                          {t(member.nameKey)}
                        </p>
                        {member.leader ? (
                          <p className='mt-1 text-sm font-medium text-primary'>
                            {t('landing.team.leader_label')}
                          </p>
                        ) : null}
                      </div>
                    </div>
                    <span className='text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground'>
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </PortalCard>
        </ScrollReveal>
      </div>
    </LandingSection>
  )
}
