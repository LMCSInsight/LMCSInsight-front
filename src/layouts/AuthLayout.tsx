import { Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export function AuthLayout() {
  const { t } = useTranslation()

  return (
    <div className='min-h-screen flex flex-col lg:flex-row bg-background'>
      {/* Left column: form */}
      <div className='flex-1 flex flex-col w-full lg:w-1/2 px-6 sm:px-12 pt-10 pb-12 lg:pt-28 lg:pl-20 lg:pr-16'>
        <div className='mb-12'>
          <img
            src='/logo-esi.png'
            alt={t('auth.layout.logoAlt')}
            className='h-16 w-auto object-contain object-left'
            onError={(e) => {
              const target = e.currentTarget
              target.style.display = 'none'
              const fallback = target.nextElementSibling
              if (fallback) (fallback as HTMLElement).style.display = 'flex'
            }}
          />
          <div
            className='h-16 w-40 bg-foreground rounded-lg items-center justify-center text-background font-semibold text-lg'
            style={{ display: 'none' }}
            aria-hidden
          >
            ESI
          </div>
        </div>
        <Outlet />
      </div>

      {/* Right column: brand panel */}
      <div className='hidden lg:flex lg:w-1/2 min-h-screen flex-col items-center justify-center px-12 py-16 bg-foreground text-background relative overflow-hidden'>
        {/* Decorative radial glow */}
        <div
          className='absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,oklch(0.45_0.2_260/0.35)_0%,transparent_60%)]'
          aria-hidden
        />
        <div
          className='absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,oklch(0.45_0.2_260/0.2)_0%,transparent_60%)]'
          aria-hidden
        />

        {/* Illustration */}
        <img
          src='/login-illustration.png'
          alt={t('auth.layout.illustrationAlt')}
          className='relative z-10 w-72 h-72 xl:w-96 xl:h-96 object-contain mb-10'
          onError={(e) => {
            const target = e.currentTarget
            target.style.display = 'none'
            const fallback = target.nextElementSibling
            if (fallback) (fallback as HTMLElement).style.display = 'flex'
          }}
        />
        <div
          className='relative z-10 w-72 h-72 xl:w-96 xl:h-96 rounded-2xl bg-background/8 items-center justify-center mb-10 border border-background/10'
          style={{ display: 'none' }}
          aria-hidden
        >
          <img
            src='/lmcs.png'
            alt='LMCS'
            className='h-32 w-auto object-contain opacity-60'
          />
        </div>

        <div className='relative z-10 text-center max-w-sm space-y-3'>
          <p className='text-2xl font-bold leading-snug text-balance'>
            {t('auth.layout.title')}
          </p>
          <p className='text-sm text-background/60 text-balance'>
            {t('auth.layout.subtitle')}
          </p>
        </div>
      </div>
    </div>
  )
}
