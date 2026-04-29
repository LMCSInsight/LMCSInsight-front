import { useParams, Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { BookMarked, ArrowLeft, Pencil, Calendar, Users } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button, buttonVariants } from '@/components/ui/button'
import { useTheme } from '@/features/themes/hooks'
import { useThemePortalRoutes } from '@/features/themes/lib/themePortalRoutes'
import { cn } from '@/lib/utils'
import { AdminInsightCard } from '@/features/admin/components'

function fmt(iso?: string) {
  if (!iso) return null
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

export default function ThemeDetailPage() {
  const { themeId } = useParams<{ themeId: string }>()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const routes = useThemePortalRoutes()
  const { data: theme, isLoading, isError } = useTheme(themeId)

  if (isLoading) {
    return (
      <div className='mx-auto max-w-2xl space-y-4'>
        <div className='h-8 w-40 animate-pulse rounded bg-muted' />
        <Card>
          <CardContent className='h-32 animate-pulse py-6' />
        </Card>
      </div>
    )
  }

  if (isError || !theme) {
    return (
      <div className='mx-auto max-w-2xl py-16 text-center text-sm text-muted-foreground'>
        {t('themes.detail.notFound')}
        <div className='mt-4'>
          <Button variant='outline' onClick={() => navigate(routes.themesList)}>
            {t('themes.detail.backList')}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className='mx-auto w-full max-w-2xl space-y-4'>
      <div className='flex flex-wrap items-center gap-3'>
        <Link
          to={routes.themesList}
          className={cn(
            buttonVariants({ variant: 'ghost', size: 'sm' }),
            'inline-flex items-center gap-1.5 text-muted-foreground',
          )}
        >
          <ArrowLeft className='size-4' />
          {t('common.back')}
        </Link>
        <div className='ml-auto flex gap-2'>
          <Link
            to={routes.themeEdit(theme.id)}
            className={cn(
              buttonVariants({ size: 'default' }),
              'inline-flex items-center gap-1.5',
            )}
          >
            <Pencil className='size-3.5' />
            {t('common.edit')}
          </Link>
        </div>
      </div>

      <Card className='overflow-hidden border-l-4 border-l-primary/40'>
        <div className='bg-primary/5 px-6 py-6'>
          <div className='flex items-start gap-4'>
            <div className='flex size-14 items-center justify-center rounded-xl bg-primary/15 text-primary'>
              <BookMarked className='size-7' strokeWidth={1.5} />
            </div>
            <div className='min-w-0 flex-1'>
              <h1 className='text-xl font-semibold tracking-tight text-foreground'>
                {theme.name}
              </h1>
              {(theme.teams?.length ?? 0) > 0 && (
                <p className='mt-1 flex items-center gap-1.5 text-sm text-muted-foreground'>
                  <Users className='size-3.5' />
                  {theme.teams?.map((team) => team.name).join(', ')}
                </p>
              )}
            </div>
          </div>
        </div>
        <CardHeader>
          <h2 className='text-sm font-semibold'>
            {t('themes.detail.sectionDescription')}
          </h2>
        </CardHeader>
        <CardContent className='space-y-4 text-sm'>
          <p className='whitespace-pre-wrap text-muted-foreground'>
            {theme.description?.trim() || t('themes.detail.noDescription')}
          </p>
          <div className='flex flex-wrap gap-6 border-t border-border pt-4 text-xs text-muted-foreground'>
            <span className='inline-flex items-center gap-1.5'>
              <Calendar className='size-3.5' />
              {t('themes.detail.created')}:{' '}
              {fmt(theme.createdAt) ?? t('common.notAvailable')}
            </span>
            <span>
              {t('themes.detail.updated')}:{' '}
              {fmt(theme.updatedAt) ?? t('common.notAvailable')}
            </span>
          </div>
        </CardContent>
      </Card>

      <div className='grid gap-3 md:grid-cols-2'>
        <AdminInsightCard
          title={t('themes.admin.metadataQualityTitle')}
          value={
            theme.description?.trim()
              ? t('themes.admin.metadataQualityComplete')
              : t('themes.admin.metadataQualityIncomplete')
          }
          subtitle={t('themes.admin.metadataQualitySubtitle')}
        />
        <AdminInsightCard
          title={t('themes.admin.lastUpdateTitle')}
          value={fmt(theme.updatedAt) ?? t('common.notAvailable')}
          subtitle={t('themes.admin.lastUpdateSubtitle')}
        />
      </div>
    </div>
  )
}
