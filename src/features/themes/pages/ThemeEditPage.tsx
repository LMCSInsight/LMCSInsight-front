import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  BookMarked,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Loader2,
} from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useTheme, useUpdateTheme } from '@/features/themes/hooks'
import type { ThemePayload } from '@/features/themes/api'
import {
  getAssistantThemeDetailPath,
  getAssistantThemesPath,
} from '@/config/routes'
import { cn } from '@/lib/utils'

export default function ThemeEditPage() {
  const { themeId } = useParams<{ themeId: string }>()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: theme, isLoading } = useTheme(themeId)
  const { mutate: update, isPending } = useUpdateTheme(themeId!)

  const [form, setForm] = useState<ThemePayload>({ name: '' })
  const [toast, setToast] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)
  const [errName, setErrName] = useState(false)

  useEffect(() => {
    if (theme) {
      setForm({
        name: theme.name,
        description: theme.description ?? undefined,
      })
    }
  }, [theme])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) {
      setErrName(true)
      return
    }
    setErrName(false)
    update(form, {
      onSuccess: () => {
        setToast({ type: 'success', message: t('themes.edit.success') })
        setTimeout(() => navigate(getAssistantThemeDetailPath(themeId!)), 800)
      },
      onError: (err: unknown) => {
        setToast({
          type: 'error',
          message: err instanceof Error ? err.message : t('themes.edit.error'),
        })
        setTimeout(() => setToast(null), 4000)
      },
    })
  }

  if (isLoading || !theme) {
    return (
      <div className='mx-auto flex max-w-2xl items-center justify-center py-24 text-muted-foreground'>
        <Loader2 className='size-6 animate-spin' />
      </div>
    )
  }

  return (
    <div className='mx-auto w-full max-w-2xl space-y-4'>
      {toast && (
        <div
          className={cn(
            'flex items-center gap-2 rounded-lg border px-4 py-3 text-sm',
            toast.type === 'success'
              ? 'border-green-200 bg-green-50 text-green-800'
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

      <Link
        to={getAssistantThemeDetailPath(themeId!)}
        className={cn(
          buttonVariants({ variant: 'ghost', size: 'sm' }),
          'inline-flex items-center gap-1.5 text-muted-foreground',
        )}
      >
        <ArrowLeft className='size-4' />
        {t('common.back')}
      </Link>

      <Card>
        <CardHeader className='space-y-1 border-b border-border'>
          <div className='flex items-center gap-2 text-primary'>
            <BookMarked className='size-5' />
            <span className='text-xs font-semibold uppercase'>
              {t('themes.edit.title')}
            </span>
          </div>
        </CardHeader>
        <CardContent className='pt-6'>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='space-y-1.5'>
              <Label htmlFor='eName'>{t('themes.fields.name')}</Label>
              <Input
                id='eName'
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
                className={cn(errName && 'border-destructive')}
                disabled={isPending}
              />
              {errName && (
                <p className='text-xs text-destructive'>
                  {t('themes.validation.nameRequired')}
                </p>
              )}
            </div>
            <div className='space-y-1.5'>
              <Label htmlFor='eDesc'>{t('themes.fields.description')}</Label>
              <textarea
                id='eDesc'
                value={form.description ?? ''}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
                rows={4}
                className='w-full resize-y rounded-lg border border-input px-3 py-2 text-sm'
                disabled={isPending}
              />
            </div>
            <div className='flex justify-end gap-2'>
              <Link
                to={getAssistantThemesPath()}
                className={buttonVariants({ variant: 'outline' })}
              >
                {t('common.cancel')}
              </Link>
              <Button type='submit' disabled={isPending}>
                {t('themes.edit.save')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
