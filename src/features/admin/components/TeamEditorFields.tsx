import { useTranslation } from 'react-i18next'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export interface ThemeOption {
  id: string
  name: string
}

export interface ChercheurOption {
  chercheur_id: string
  nom_complet: string
}

export interface TeamEditorFieldsProps {
  formName: string
  setFormName: (v: string) => void
  formDescription: string
  setFormDescription: (v: string) => void
  themeSearch: string
  setThemeSearch: (v: string) => void
  memberSearch: string
  setMemberSearch: (v: string) => void
  selectedThemeId: string
  setSelectedThemeId: (id: string) => void
  selectedMemberIds: string[]
  setSelectedMemberIds: React.Dispatch<React.SetStateAction<string[]>>
  themesLoading: boolean
  chercheursLoading: boolean
  filteredThemes: ThemeOption[]
  filteredChercheurs: ChercheurOption[]
  formError?: string
  onClearFormError?: () => void
}

export function TeamEditorFields({
  formName,
  setFormName,
  formDescription,
  setFormDescription,
  themeSearch,
  setThemeSearch,
  memberSearch,
  setMemberSearch,
  selectedThemeId,
  setSelectedThemeId,
  selectedMemberIds,
  setSelectedMemberIds,
  themesLoading,
  chercheursLoading,
  filteredThemes,
  filteredChercheurs,
  formError,
  onClearFormError,
}: TeamEditorFieldsProps) {
  const { t } = useTranslation()

  function touchErrorClear() {
    onClearFormError?.()
  }

  return (
    <div className='space-y-4'>
      <div className='space-y-2'>
        <Label htmlFor='teamName'>{t('admin.teams.name')}</Label>
        <Input
          id='teamName'
          placeholder={t('admin.teams.namePlaceholder')}
          value={formName}
          onChange={(e) => {
            setFormName(e.target.value)
            touchErrorClear()
          }}
          className='h-10 rounded-lg'
        />
        {formError && <p className='text-xs text-destructive'>{formError}</p>}
      </div>
      <div className='space-y-2'>
        <Label htmlFor='teamDescription'>
          {t('admin.teams.description')}{' '}
          <span className='text-muted-foreground text-xs font-normal'>
            ({t('common.optional')})
          </span>
        </Label>
        <textarea
          id='teamDescription'
          placeholder={t('admin.teams.descriptionPlaceholder')}
          value={formDescription}
          onChange={(e) => setFormDescription(e.target.value)}
          rows={3}
          className='w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
        />
      </div>
      <div className='space-y-2'>
        <Label htmlFor='teamThemeSearch'>{t('admin.teams.selectTheme')}</Label>
        <Input
          id='teamThemeSearch'
          placeholder={t('admin.teams.searchThemes')}
          value={themeSearch}
          onChange={(e) => setThemeSearch(e.target.value)}
          className='h-10 rounded-lg'
        />
        <div className='max-h-48 space-y-1 overflow-y-auto rounded-lg border border-border/70 p-2'>
          {themesLoading ? (
            <p className='px-2 py-1 text-xs text-muted-foreground'>
              {t('common.loading')}
            </p>
          ) : filteredThemes.length === 0 ? (
            <p className='px-2 py-1 text-xs text-muted-foreground'>
              {t('admin.teams.noThemesAvailable')}
            </p>
          ) : (
            filteredThemes.map((theme) => {
              const isSelected = selectedThemeId === theme.id
              return (
                <label
                  key={theme.id}
                  className='flex cursor-pointer items-start gap-2 rounded-md px-2 py-1.5 hover:bg-muted/50'
                >
                  <input
                    type='radio'
                    name='teamThemeId'
                    className='mt-0.5'
                    checked={isSelected}
                    onChange={(e) => {
                      touchErrorClear()
                      if (e.target.checked) setSelectedThemeId(theme.id)
                    }}
                  />
                  <span className='text-sm text-foreground'>{theme.name}</span>
                </label>
              )
            })
          )}
        </div>
        <p className='text-xs text-muted-foreground'>
          {selectedThemeId
            ? t('admin.teams.themeSelected')
            : t('admin.teams.themeRequiredHint')}
        </p>
      </div>
      <div className='space-y-2'>
        <Label htmlFor='teamMemberSearch'>
          {t('admin.teams.assignMembers')}
        </Label>
        <Input
          id='teamMemberSearch'
          placeholder={t('admin.teams.searchMembers')}
          value={memberSearch}
          onChange={(e) => setMemberSearch(e.target.value)}
          className='h-10 rounded-lg'
        />
        <div className='max-h-48 space-y-1 overflow-y-auto rounded-lg border border-border/70 p-2'>
          {chercheursLoading ? (
            <p className='px-2 py-1 text-xs text-muted-foreground'>
              {t('common.loading')}
            </p>
          ) : filteredChercheurs.length === 0 ? (
            <p className='px-2 py-1 text-xs text-muted-foreground'>
              {t('admin.teams.noMembersAvailable')}
            </p>
          ) : (
            filteredChercheurs.map((chercheur) => {
              const isSelected = selectedMemberIds.includes(
                chercheur.chercheur_id,
              )
              return (
                <label
                  key={chercheur.chercheur_id}
                  className='flex cursor-pointer items-start gap-2 rounded-md px-2 py-1.5 hover:bg-muted/50'
                >
                  <input
                    type='checkbox'
                    className='mt-0.5'
                    checked={isSelected}
                    onChange={(e) => {
                      setSelectedMemberIds((prev) => {
                        if (e.target.checked)
                          return [...prev, chercheur.chercheur_id]
                        return prev.filter(
                          (id) => id !== chercheur.chercheur_id,
                        )
                      })
                    }}
                  />
                  <span className='text-sm text-foreground'>
                    {chercheur.nom_complet}
                  </span>
                </label>
              )
            })
          )}
        </div>
        <p className='text-xs text-muted-foreground'>
          {t('admin.teams.selectedMembersCount', {
            count: selectedMemberIds.length,
          })}
        </p>
      </div>
    </div>
  )
}
