import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { getAdminTeamDetailPath, ROUTES } from '@/config/routes'
import type { Team } from '@/features/admin/api/teamApi'
import { useTeam, useUpdateTeam } from '@/features/admin/hooks/useTeams'
import { useChercheurs } from '@/features/chercheurs/hooks'
import { useThemes } from '@/features/themes/hooks'
import { TeamEditorFields } from '@/features/admin/components/TeamEditorFields'

function EditTeamForm({ team, teamId }: { team: Team; teamId: string }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { mutate: updateTeam, isPending } = useUpdateTeam(teamId)

  const [formName, setFormName] = useState(team.name)
  const [formDescription, setFormDescription] = useState(team.description ?? '')
  const [formError, setFormError] = useState('')
  const [themeSearch, setThemeSearch] = useState('')
  const [memberSearch, setMemberSearch] = useState('')
  const [selectedThemeId, setSelectedThemeId] = useState(team.themeId)
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>(() =>
    (team.members ?? []).map((m) => m.chercheur_id),
  )

  const { data: themesPage, isLoading: themesLoading } = useThemes({
    page: 1,
    limit: 200,
  })
  const { data: chercheursPage, isLoading: chercheursLoading } = useChercheurs({
    page: 1,
    limit: 500,
  })

  const themes = themesPage?.data ?? []
  const chercheurs = chercheursPage?.data ?? []

  const filteredThemes = useMemo(
    () =>
      themeSearch
        ? themes.filter((th) =>
            th.name.toLowerCase().includes(themeSearch.toLowerCase()),
          )
        : themes,
    [themes, themeSearch],
  )

  const filteredChercheurs = useMemo(
    () =>
      memberSearch
        ? chercheurs.filter((c) =>
            c.nom_complet.toLowerCase().includes(memberSearch.toLowerCase()),
          )
        : chercheurs,
    [chercheurs, memberSearch],
  )

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formName.trim()) {
      setFormError(t('common.required'))
      return
    }
    if (!selectedThemeId) {
      setFormError(t('admin.teams.themesRequired'))
      return
    }
    setFormError('')
    updateTeam(
      {
        name: formName.trim(),
        description: formDescription.trim() || undefined,
        themeId: selectedThemeId,
        memberIds: selectedMemberIds,
      },
      {
        onSuccess: () => {
          toast.success(t('admin.teams.updateSuccess'))
          navigate(getAdminTeamDetailPath(teamId))
        },
        onError: () => toast.error(t('admin.teams.updateError')),
      },
    )
  }

  return (
    <Card className='border-border/70 shadow-none'>
      <CardHeader className='space-y-1 pb-2'>
        <CardTitle className='text-xl font-semibold tracking-tight'>
          {t('admin.teams.editTeam')}
        </CardTitle>
        <p className='text-sm text-muted-foreground'>
          {t('admin.teams.editPageSubtitle')}
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className='space-y-6'>
          <TeamEditorFields
            formName={formName}
            setFormName={setFormName}
            formDescription={formDescription}
            setFormDescription={setFormDescription}
            themeSearch={themeSearch}
            setThemeSearch={setThemeSearch}
            memberSearch={memberSearch}
            setMemberSearch={setMemberSearch}
            selectedThemeId={selectedThemeId}
            setSelectedThemeId={setSelectedThemeId}
            selectedMemberIds={selectedMemberIds}
            setSelectedMemberIds={setSelectedMemberIds}
            themesLoading={themesLoading}
            chercheursLoading={chercheursLoading}
            filteredThemes={filteredThemes}
            filteredChercheurs={filteredChercheurs}
            formError={formError}
            onClearFormError={() => setFormError('')}
          />
          <div className='flex flex-wrap justify-end gap-2'>
            <Link
              to={getAdminTeamDetailPath(teamId)}
              className={cn(
                buttonVariants({ variant: 'outline', size: 'sm' }),
                'rounded-lg',
              )}
            >
              {t('common.cancel')}
            </Link>
            <Button
              type='submit'
              size='sm'
              className='rounded-lg'
              disabled={isPending}
            >
              {isPending ? t('common.saving') : t('common.save')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export default function EditTeamPage() {
  const { teamId } = useParams<{ teamId: string }>()
  const { t } = useTranslation()

  const { data: team, isLoading, isError } = useTeam(teamId)

  if (isLoading && !team) {
    return (
      <div className='mx-auto w-full max-w-2xl space-y-4'>
        <div className='h-8 w-40 animate-pulse rounded bg-muted' />
        <Card>
          <CardContent className='h-48 animate-pulse py-6' />
        </Card>
      </div>
    )
  }

  if (isError || !team || !teamId) {
    return (
      <div className='mx-auto max-w-2xl py-16 text-center text-sm text-muted-foreground'>
        {t('admin.teams.notFound')}
        <div className='mt-4'>
          <Link
            to={ROUTES.ADMIN_TEAMS}
            className={buttonVariants({ variant: 'outline' })}
          >
            {t('admin.teams.backToList')}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className='mx-auto w-full max-w-2xl space-y-6'>
      <div className='flex flex-wrap items-center gap-3'>
        <Link
          to={getAdminTeamDetailPath(teamId)}
          className={cn(
            buttonVariants({ variant: 'ghost', size: 'sm' }),
            'inline-flex items-center gap-1.5 text-muted-foreground',
          )}
        >
          <ArrowLeft className='size-4' />
          {t('common.back')}
        </Link>
      </div>

      <EditTeamForm key={team.id} team={team} teamId={teamId} />
    </div>
  )
}
