import { Link, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeft,
  Building2,
  Calendar,
  Pencil,
  Users,
  BookMarked,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  getAdminTeamEditPath,
  getAdminThemeDetailPath,
  ROUTES,
} from '@/config/routes'
import { useTeam } from '@/features/admin/hooks/useTeams'
import { AdminInsightCard } from '@/features/admin/components'

// moved into component to use i18n locale

export default function TeamDetailPage() {
  const { teamId } = useParams<{ teamId: string }>()
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { data: team, isLoading, isError } = useTeam(teamId)

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

  if (isError || !team) {
    return (
      <div className='mx-auto max-w-2xl py-16 text-center text-sm text-muted-foreground'>
        {t('admin.teams.notFound')}
        <div className='mt-4'>
          <Button
            variant='outline'
            onClick={() => navigate(ROUTES.ADMIN_TEAMS)}
          >
            {t('admin.teams.backToList')}
          </Button>
        </div>
      </div>
    )
  }

  function fmt(iso?: string) {
    if (!iso) return null
    try {
      return new Date(iso).toLocaleDateString(i18n.language || undefined, {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    } catch {
      return new Date(iso).toLocaleDateString(i18n.language || undefined)
    }
  }

  const memberCount = team._count?.members ?? team.members?.length ?? 0

  return (
    <div className='mx-auto w-full max-w-2xl space-y-6'>
      <div className='flex flex-wrap items-center gap-3'>
        <Link
          to={ROUTES.ADMIN_TEAMS}
          className={cn(
            buttonVariants({ variant: 'ghost', size: 'sm' }),
            'inline-flex items-center gap-1.5 text-muted-foreground',
          )}
        >
          <ArrowLeft className='size-4' />
          {t('common.back')}
        </Link>
        <div className='ml-auto'>
          <Link
            to={getAdminTeamEditPath(team.id)}
            className={cn(
              buttonVariants({ size: 'default' }),
              'inline-flex items-center gap-1.5 rounded-lg',
            )}
          >
            <Pencil className='size-3.5' />
            {t('common.edit')}
          </Link>
        </div>
      </div>

      <Card className='overflow-hidden border-l-4 border-l-primary/40 shadow-none'>
        <div className='bg-primary/5 px-6 py-6'>
          <div className='flex items-start gap-4'>
            <div className='flex size-12 shrink-0 items-center justify-center rounded-xl bg-background/80 shadow-sm'>
              <Building2 className='size-6 text-primary' strokeWidth={1.5} />
            </div>
            <div className='min-w-0 flex-1 space-y-2'>
              <h1 className='text-balance text-2xl font-semibold tracking-tight'>
                {team.name}
              </h1>
              <p className='text-pretty text-sm leading-relaxed text-muted-foreground'>
                {team.description?.trim()
                  ? team.description
                  : t('admin.teams.noDescription')}
              </p>
            </div>
          </div>
        </div>
        <CardContent className='grid gap-3 border-t border-border/60 p-4 md:grid-cols-3'>
          <AdminInsightCard
            title={t('admin.teams.members')}
            value={memberCount}
            subtitle={t('admin.teams.detailMembersSubtitle')}
          />
          <AdminInsightCard
            title={t('admin.teams.themes')}
            value={team.theme?.name ?? t('common.notAvailable')}
            subtitle={t('admin.teams.detailThemeSubtitle')}
          />
          <AdminInsightCard
            title={t('admin.teams.updated')}
            value={fmt(team.updatedAt) ?? t('common.notAvailable')}
            subtitle={t('admin.teams.detailUpdatedSubtitle')}
          />
        </CardContent>
      </Card>

      <Card className='border-border/70 shadow-none'>
        <CardContent className='space-y-4 p-6'>
          <div className='flex items-center gap-2 text-sm font-medium text-foreground'>
            <BookMarked
              className='size-4 text-muted-foreground'
              strokeWidth={1.5}
            />
            {t('admin.teams.linkedTheme')}
          </div>
          {team.theme ? (
            <Link
              to={getAdminThemeDetailPath(team.theme.id)}
              className={cn(
                buttonVariants({ variant: 'outline', size: 'sm' }),
                'inline-flex w-fit items-center gap-2 rounded-lg',
              )}
            >
              {team.theme.name}
            </Link>
          ) : (
            <p className='text-sm text-muted-foreground'>
              {t('common.notAvailable')}
            </p>
          )}
        </CardContent>
      </Card>

      <Card className='border-border/70 shadow-none'>
        <CardContent className='space-y-4 p-6'>
          <div className='flex items-center gap-2 text-sm font-medium text-foreground'>
            <Users className='size-4 text-muted-foreground' strokeWidth={1.5} />
            {t('admin.teams.members')}
          </div>
          {(team.members ?? []).length === 0 ? (
            <p className='text-sm text-muted-foreground'>
              {t('admin.teams.noMembersListed')}
            </p>
          ) : (
            <ul className='divide-y divide-border/60 rounded-lg border border-border/70'>
              {(team.members ?? []).map((m) => (
                <li
                  key={m.chercheur_id}
                  className='flex items-center justify-between px-4 py-3 text-sm'
                >
                  <span>{m.nom_complet}</span>
                </li>
              ))}
            </ul>
          )}
          <div className='flex flex-wrap gap-4 border-t border-border/60 pt-4 text-xs text-muted-foreground'>
            <span className='inline-flex items-center gap-1.5'>
              <Calendar className='size-3.5' strokeWidth={1.5} />
              {t('admin.teams.created')}: {fmt(team.createdAt) ?? '—'}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
