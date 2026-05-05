import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Loader2 } from 'lucide-react'
import { useAuthContext } from '@/shared/context/AuthContext'
import { authApi } from '@/features/auth/api/authApi'
import { extractMatriculeFromAccessToken } from '@/features/auth/extractMatricule'
import { mapBackendUserToDisplayUser } from '@/features/auth/types'
import { getDashboardPath } from '@/config/routes'
import { ROUTES } from '@/config/routes'
import { APP_CONSTANTS } from '@/config/constants'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuthContext()
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await authApi.login({ email, password })
      const payload = res.data
      const { accessToken, refreshToken, user } = payload
      localStorage.setItem(APP_CONSTANTS.STORAGE_KEYS.TOKEN, accessToken)
      let displayUser = mapBackendUserToDisplayUser(user)
      try {
        const meRes = await authApi.me()
        displayUser = {
          ...displayUser,
          ...mapBackendUserToDisplayUser(meRes.data.user),
        }
      } catch {
        /* optional: enrich matricule from /v1/auth/me when login payload omits it */
      }
      if (!displayUser.matricule) {
        const fromJwt = extractMatriculeFromAccessToken(accessToken)
        if (fromJwt) displayUser = { ...displayUser, matricule: fromJwt }
      }
      const path = getDashboardPath(user.role, user)
      login(displayUser, accessToken, refreshToken)
      navigate(path, { replace: true })
    } catch (err: unknown) {
      const axErr =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { status?: number; data?: unknown } })
          : null
      setError(
        axErr?.response?.status === 401 || axErr?.response?.status === 400
          ? t('auth.errors.invalidCredentials')
          : t('auth.errors.serverError'),
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='flex flex-col gap-10 w-full max-w-sm'>
      <div className='space-y-1.5'>
        <h1 className='text-2xl font-semibold tracking-tight text-foreground text-balance'>
          {t('auth.signIn')}
        </h1>
        <p className='text-sm text-muted-foreground'>{t('auth.subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} className='flex flex-col gap-6'>
        {/* Error message */}
        {error && (
          <div
            className='rounded-lg border border-destructive/30 bg-destructive/8 px-3 py-2.5 text-sm text-destructive'
            role='alert'
          >
            {error}
          </div>
        )}

        <div className='flex flex-col gap-4'>
          {/* Email */}
          <div className='flex flex-col gap-1.5'>
            <Label
              htmlFor='email'
              className='text-sm font-medium text-foreground'
            >
              {t('auth.email')}
            </Label>
            <Input
              id='email'
              type='email'
              placeholder='prenom.nom@esi.dz'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete='email'
              disabled={loading}
              className='h-10 rounded-lg border-input bg-background focus-visible:ring-ring'
            />
          </div>

          {/* Password */}
          <div className='flex flex-col gap-1.5'>
            <div className='flex items-center justify-between'>
              <Label
                htmlFor='password'
                className='text-sm font-medium text-foreground'
              >
                {t('auth.password')}
              </Label>
              <Link
                to={ROUTES.FORGOT_PASSWORD}
                className='text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2'
              >
                {t('auth.forgotPassword')}
              </Link>
            </div>
            <Input
              id='password'
              type='password'
              placeholder='••••••••'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete='current-password'
              disabled={loading}
              className='h-10 rounded-lg border-input bg-background focus-visible:ring-ring'
            />
          </div>

          {/* Submit */}
          <Button
            type='submit'
            disabled={loading}
            className='h-10 w-full rounded-lg font-medium transition-all duration-200 active:scale-[0.98] shadow-primary-sm hover:shadow-primary mt-2'
          >
            {loading ? (
              <span className='flex items-center gap-2'>
                <Loader2 className='size-4 animate-spin' />
                {t('auth.signingIn')}
              </span>
            ) : (
              t('auth.signIn')
            )}
          </Button>
        </div>

        {/* Divider */}
        <div className='flex items-center gap-3'>
          <div className='h-px flex-1 bg-border' />
          <span className='text-xs text-muted-foreground'>
            {t('auth.orContinueWith')}
          </span>
          <div className='h-px flex-1 bg-border' />
        </div>

        {/* Google button */}
        <button
          type='button'
          disabled
          className='h-10 w-full rounded-lg flex items-center justify-center gap-2.5 text-sm font-medium border border-input bg-card text-muted-foreground cursor-not-allowed opacity-60'
          title={t('auth.googleSignIn')}
        >
          <GoogleIcon />
          <span>{t('auth.googleSignIn')}</span>
        </button>
      </form>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width='18' height='18' viewBox='0 0 24 24' fill='none' aria-hidden>
      <path
        d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
        fill='#4285F4'
      />
      <path
        d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
        fill='#34A853'
      />
      <path
        d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
        fill='#FBBC05'
      />
      <path
        d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
        fill='#EA4335'
      />
    </svg>
  )
}
