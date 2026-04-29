import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { getAdminTeamDetailPath, ROUTES } from '@/config/routes'
import { useCreateTeam } from '@/features/admin/hooks/useTeams'
import { useChercheurs } from '@/features/chercheurs/hooks'
import { useThemes } from '@/features/themes/hooks'
import { TeamEditorFields } from '@/features/admin/components/TeamEditorFields'

export default function CreateTeamPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { mutate: createTeam, isPending } = useCreateTeam()

  const [formName, setFormName] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formError, setFormError] = useState('')
  const [themeSearch, setThemeSearch] = useState('')
  const [memberSearch, setMemberSearch] = useState('')
  const [selectedThemeId, setSelectedThemeId] = useState('')
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([])

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
        ? themes.filter((theme) =>
            theme.name.toLowerCase().includes(themeSearch.toLowerCase()),
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
    createTeam(
      {
        name: formName.trim(),
        description: formDescription.trim() || undefined,
        themeId: selectedThemeId,
        memberIds: selectedMemberIds,
      },
      {
        onSuccess: (team) => {
          toast.success(t('admin.teams.createSuccess'))
          navigate(getAdminTeamDetailPath(team.id))
        },
        onError: () => toast.error(t('admin.teams.createError')),
      },
    )
  }

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
      </div>

      <Card className='border-border/70 shadow-none'>
        <CardHeader className='space-y-1 pb-2'>
          <CardTitle className='text-xl font-semibold tracking-tight'>
            {t('admin.teams.createTeam')}
          </CardTitle>
          <p className='text-sm text-muted-foreground'>
            {t('admin.teams.createPageSubtitle')}
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
                to={ROUTES.ADMIN_TEAMS}
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
    </div>
  )
}
