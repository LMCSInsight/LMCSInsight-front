import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Globe, Menu, Moon, Sun, X } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ROUTES } from '@/config/routes'
import i18n, { LANGUAGES } from '@/i18n'
import { cn } from '@/lib/utils'
import { useTheme } from '@/shared/context/ThemeContext'

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

export function LandingNav() {
  const { t } = useTranslation()
  const { isDark, toggleTheme } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('hero')

  const navLinks = [
    { label: t('landing.nav.problem'), target: 'problem' },
    { label: t('landing.nav.features'), target: 'features' },
    { label: t('landing.nav.dashboard'), target: 'dashboard' },
    { label: t('landing.nav.team'), target: 'team' },
  ]

  useEffect(() => {
    const ids = ['problem', 'features', 'dashboard', 'team']
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible?.target.id) setActiveSection(visible.target.id)
      },
      { rootMargin: '-25% 0px -55% 0px', threshold: [0.08, 0.2, 0.4] },
    )

    ids.forEach((id) => {
      const node = document.getElementById(id)
      if (node) observer.observe(node)
    })

    return () => observer.disconnect()
  }, [])

  return (
    <>
      <header className='sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-xl'>
        <div className='mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8'>
          <button
            type='button'
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className='group flex min-w-0 items-center gap-3 rounded-xl pr-2 transition-opacity hover:opacity-90'
          >
            <span className='flex size-10 items-center justify-center rounded-xl border border-border/70 bg-card shadow-primary-sm transition-colors group-hover:border-primary/30'>
              <img
                src='/lmcs.png'
                alt='LMCS'
                className='h-6 w-auto object-contain'
                onError={(event) => {
                  ;(event.target as HTMLImageElement).style.display = 'none'
                }}
              />
            </span>
            <span className='hidden min-w-0 flex-col items-start sm:flex'>
              <span className='text-[15px] font-semibold leading-none tracking-[-0.02em] text-foreground'>
                LMCSInsight
              </span>
              <span className='mt-1 text-[11px] font-medium text-muted-foreground'>
                Portail des encadrements
              </span>
            </span>
          </button>

          <nav
            className='hidden items-center gap-7 md:flex'
            aria-label='Navigation principale'
          >
            {navLinks.map((link) => {
              const active = activeSection === link.target
              return (
                <button
                  key={link.target}
                  type='button'
                  onClick={() => scrollToSection(link.target)}
                  className={cn(
                    'group relative py-2 text-sm font-medium transition-colors',
                    active
                      ? 'text-foreground'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {link.label}
                  <span
                    className={cn(
                      'absolute -bottom-1 left-0 h-px bg-primary transition-all duration-300',
                      active ? 'w-full' : 'w-0 group-hover:w-full',
                    )}
                  />
                </button>
              )
            })}
          </nav>

          <div className='flex items-center gap-2'>
            <Button
              variant='ghost'
              size='icon'
              className='size-9 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground'
              aria-label={t('common.theme')}
              onClick={toggleTheme}
            >
              {isDark ? (
                <Sun className='size-4' strokeWidth={1.5} />
              ) : (
                <Moon className='size-4' strokeWidth={1.5} />
              )}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger
                className={cn(
                  buttonVariants({ variant: 'ghost', size: 'icon' }),
                  'size-9 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
                aria-label={t('common.language')}
              >
                <Globe className='size-4' strokeWidth={1.5} />
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='min-w-[140px]'>
                {LANGUAGES.map(({ code, labelKey }) => (
                  <DropdownMenuItem
                    key={code}
                    onClick={() => i18n.changeLanguage(code)}
                    className={cn(i18n.language === code && 'bg-accent')}
                  >
                    {t(labelKey)}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Link
              to={ROUTES.LOGIN}
              className={cn(
                buttonVariants({ variant: 'outline', size: 'sm' }),
                'hidden rounded-lg border-border/80 bg-card px-4 font-semibold shadow-none hover:border-primary/30 hover:bg-primary/5 hover:text-primary sm:inline-flex',
              )}
            >
              {t('landing.nav.login')}
            </Link>

            <Button
              variant='ghost'
              size='icon'
              className='size-9 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground md:hidden'
              aria-label='Menu'
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? (
                <X className='size-4' strokeWidth={1.5} />
              ) : (
                <Menu className='size-4' strokeWidth={1.5} />
              )}
            </Button>
          </div>
        </div>
      </header>

      {menuOpen ? (
        <div className='fixed inset-x-3 top-[4.75rem] z-40 rounded-2xl border border-border/70 bg-background/95 p-2 shadow-primary backdrop-blur-xl md:hidden'>
          <div className='grid gap-1.5'>
            {navLinks.map((link) => {
              const active = activeSection === link.target
              return (
                <button
                  key={link.target}
                  type='button'
                  onClick={() => {
                    scrollToSection(link.target)
                    setMenuOpen(false)
                  }}
                  className={cn(
                    'rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors',
                    active
                      ? 'bg-primary/8 text-primary'
                      : 'text-muted-foreground hover:bg-card hover:text-foreground',
                  )}
                >
                  {link.label}
                </button>
              )
            })}
            <Link
              to={ROUTES.LOGIN}
              className={cn(
                buttonVariants({ size: 'sm' }),
                'mt-1 rounded-xl justify-center',
              )}
              onClick={() => setMenuOpen(false)}
            >
              {t('landing.nav.login')}
            </Link>
          </div>
        </div>
      ) : null}
    </>
  )
}
