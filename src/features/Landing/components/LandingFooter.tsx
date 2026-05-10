import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ROUTES } from '@/config/routes'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

export function LandingFooter() {
  const { t } = useTranslation()

  const navLinks = [
    { label: t('landing.nav.problem'), target: 'problem' },
    { label: t('landing.nav.features'), target: 'features' },
    { label: t('landing.nav.dashboard'), target: 'dashboard' },
    { label: t('landing.nav.team'), target: 'team' },
  ]

  return (
    <footer className='border-t border-border bg-card'>
      <div className='mx-auto w-full max-w-6xl px-6 py-10 lg:px-12'>
        <div className='grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end'>
          <div className='max-w-xl space-y-5'>
            <div className='flex items-center gap-3'>
              <div className='flex size-10 items-center justify-center rounded-lg border border-border bg-background'>
                <img
                  src='/lmcs.png'
                  alt='LMCS'
                  className='h-7 w-auto'
                  onError={(event) => {
                    ;(event.target as HTMLImageElement).style.display = 'none'
                  }}
                />
              </div>
              <div>
                <p className='text-sm font-semibold tracking-tight text-foreground'>
                  LMCSInsight
                </p>
                <p className='text-xs text-muted-foreground'>
                  {t('landing.footer.project')}
                </p>
              </div>
            </div>

            <p className='text-sm leading-relaxed text-muted-foreground'>
              {t('landing.footer.description')}
            </p>

            <div className='flex flex-wrap gap-2'>
              {navLinks.map((link) => (
                <button
                  key={link.target}
                  type='button'
                  onClick={() => scrollToSection(link.target)}
                  className='rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/25 hover:text-foreground'
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>

          <div className='space-y-4 rounded-xl border border-border bg-background p-5'>
            <p className='text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground'>
              {t('landing.footer.col_contact')}
            </p>
            <div className='space-y-2 text-sm text-muted-foreground'>
              <p>{t('landing.footer.col_institution_lmcs')}</p>
              <p>{t('landing.footer.col_institution_esi')}</p>
              <a
                href={`mailto:${t('landing.footer.col_contact_email')}`}
                className='inline-flex text-primary hover:text-primary/80'
              >
                {t('landing.footer.col_contact_email')}
              </a>
            </div>
            <Link
              to={ROUTES.LOGIN}
              className={cn(
                buttonVariants({ size: 'sm' }),
                'w-full justify-center',
              )}
            >
              {t('landing.nav.access')}
            </Link>
          </div>
        </div>

        <div className='mt-8 flex flex-col gap-3 border-t border-border pt-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between'>
          <p>{t('landing.footer.copyright')}</p>
          <p>{t('landing.footer.col_institution_phase')}</p>
        </div>
      </div>
    </footer>
  )
}
