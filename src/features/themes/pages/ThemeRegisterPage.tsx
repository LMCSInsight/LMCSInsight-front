import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { BookMarked, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCreateTheme } from '@/features/themes/hooks'
import { getAssistantThemesPath } from '@/config/routes'
import { cn } from '@/lib/utils'

export default function ThemeRegisterPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { mutate: createTheme, isPending } = useCreateTheme()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [toast, setToast] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)
  const [errName, setErrName] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      setErrName(true)
      return
    }
    setErrName(false)
    createTheme(
      { name: name.trim(), description: description.trim() || undefined },
      {
        onSuccess: (data) => {
          setToast({ type: 'success', message: t('themes.register.success') })
          setTimeout(() => navigate(`/assistant/themes/${data.id}`), 800)
        },
        onError: (err: unknown) => {
          const msg =
            err instanceof Error ? err.message : t('themes.register.error')
          setToast({ type: 'error', message: msg })
          setTimeout(() => setToast(null), 4000)
        },
      },
    )
  }

  return (
    <div className='mx-auto w-full max-w-2xl space-y-4'>
      {toast && (
        <div
          className={cn(
            'flex items-center gap-2 rounded-lg border px-4 py-3 text-sm',
            toast.type === 'success'
              ? 'border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950'
              : 'border-red-200 bg-red-50 text-red-800',
          )}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className='size-4' />
          ) : (
            <AlertCircle className='size-4' />
          )}
          {toast.message}
        </div>
      )}

      <div className='flex items-center gap-3'>
        <Link
          to={getAssistantThemesPath()}
          className={cn(
            buttonVariants({ variant: 'ghost', size: 'sm' }),
            'inline-flex items-center gap-1.5 text-muted-foreground',
          )}
        >
          <ArrowLeft className='size-4' />
          {t('common.back')}
        </Link>
      </div>

      <Card>
        <CardHeader className='space-y-1 border-b border-border pb-4'>
          <div className='flex items-center gap-2 text-primary'>
            <BookMarked className='size-5' strokeWidth={1.5} />
            <span className='text-xs font-semibold uppercase tracking-wide'>
              {t('themes.register.badge')}
            </span>
          </div>
          <h1 className='text-xl font-semibold tracking-tight'>
            {t('themes.register.title')}
          </h1>
          <p className='text-sm text-muted-foreground'>
            {t('themes.register.subtitle')}
          </p>
        </CardHeader>
        <CardContent className='pt-6'>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='space-y-1.5'>
              <Label htmlFor='themeName' className='text-xs font-medium'>
                {t('themes.fields.name')}{' '}
                <span className='text-destructive'>*</span>
              </Label>
              <Input
                id='themeName'
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  if (errName) setErrName(false)
                }}
                placeholder={t('themes.fields.namePlaceholder')}
                className={cn('h-9', errName && 'border-destructive')}
                disabled={isPending}
              />
              {errName && (
                <p className='text-xs text-destructive'>
                  {t('themes.validation.nameRequired')}
                </p>
              )}
            </div>
            <div className='space-y-1.5'>
              <Label htmlFor='themeDesc' className='text-xs font-medium'>
                {t('themes.fields.description')}
              </Label>
              <textarea
                id='themeDesc'
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className='w-full resize-y rounded-lg border border-input bg-transparent px-3 py-2 text-sm'
                disabled={isPending}
              />
            </div>
            <div className='flex justify-end gap-2 pt-2'>
              <Link
                to={getAssistantThemesPath()}
                className={buttonVariants({ variant: 'outline' })}
              >
                {t('common.cancel')}
              </Link>
              <Button type='submit' disabled={isPending}>
                {t('themes.register.submit')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
