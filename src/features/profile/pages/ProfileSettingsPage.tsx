import { useState, type ComponentType } from 'react'
import { useTranslation } from 'react-i18next'
import { CircleUserRound, DollarSign, Shield, Settings2 } from 'lucide-react'
import { useAuthContext } from '@/shared/context/AuthContext'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

type SettingsTab = 'profile' | 'academic' | 'research' | 'security'

export default function ProfileSettingsPage() {
  const { t } = useTranslation()
  const { currentUser } = useAuthContext()
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile')

  const [profileForm, setProfileForm] = useState({
    fullName: currentUser?.name ?? '',
    email: currentUser?.email ?? '',
    phone: '',
  })

  const [academicForm, setAcademicForm] = useState({
    diploma: '',
    institution: '',
    quality: '',
    researchGrade: '',
    team: '',
  })

  const [researchForm, setResearchForm] = useState({
    hIndex: '',
    googleScholar: '',
    researchGate: '',
    personalSite: '',
  })

  const [securityForm, setSecurityForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    loginAlert: true,
    passwordChange: true,
    suspiciousActivity: true,
  })

  const tabs: {
    key: SettingsTab
    icon: ComponentType<{ className?: string }>
    labelKey: string
  }[] = [
    { key: 'profile', icon: CircleUserRound, labelKey: 'profile.tabs.profile' },
    { key: 'academic', icon: DollarSign, labelKey: 'profile.tabs.academic' },
    { key: 'research', icon: Shield, labelKey: 'profile.tabs.research' },
    { key: 'security', icon: Settings2, labelKey: 'profile.tabs.security' },
  ]

  const tabLabelKeyMap: Record<SettingsTab, string> = {
    profile: 'profile.tabs.profile',
    academic: 'profile.tabs.academic',
    research: 'profile.tabs.research',
    security: 'profile.tabs.security',
  }

  function updateField(field: keyof typeof profileForm, value: string) {
    setProfileForm((prev) => ({ ...prev, [field]: value }))
  }

  function updateAcademicField(
    field: keyof typeof academicForm,
    value: string,
  ) {
    setAcademicForm((prev) => ({ ...prev, [field]: value }))
  }

  function updateResearchField(
    field: keyof typeof researchForm,
    value: string,
  ) {
    setResearchForm((prev) => ({ ...prev, [field]: value }))
  }

  function updateSecurityField(
    field: keyof typeof securityForm,
    value: string | boolean,
  ) {
    setSecurityForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleSaveSection() {
    // TODO: connect to profile update API when backend endpoint is available.
    if (activeTab === 'profile') {
      console.log('Save profile section', profileForm)
      return
    }
    if (activeTab === 'academic') {
      console.log('Save academic section', academicForm)
      return
    }
    if (activeTab === 'research') {
      console.log('Save research section', researchForm)
      return
    }
    if (activeTab === 'security') {
      console.log('Save security section', securityForm)
    }
  }

  function handleSaveAll() {
    // TODO: aggregate tabs and submit all settings in one request.
    console.log('Save all settings', {
      profileForm,
      academicForm,
      researchForm,
      securityForm,
    })
  }

  return (
    <div className='min-h-[calc(100vh-9rem)] space-y-4'>
      <div className='rounded-xl border border-border bg-card/70 p-3'>
        <div className='grid grid-cols-2 gap-2 sm:grid-cols-4'>
          {tabs.map((tab) => {
            const Icon = tab.icon
            const selected = activeTab === tab.key

            return (
              <button
                key={tab.key}
                type='button'
                onClick={() => setActiveTab(tab.key)}
                className={[
                  'inline-flex h-8 items-center justify-center gap-2 rounded-md border px-3 text-xs font-medium transition-colors',
                  selected
                    ? 'border-primary/25 bg-primary/15 text-foreground'
                    : 'border-transparent text-muted-foreground hover:bg-muted hover:text-foreground',
                ].join(' ')}
              >
                <Icon className='size-3.5' />
                <span>{t(tab.labelKey)}</span>
              </button>
            )
          })}
        </div>
      </div>

      <Card className='shadow-none'>
        <CardContent className='space-y-4 px-5 py-4'>
          <div className='space-y-1 border-b border-border pb-3'>
            <h2 className='text-sm font-semibold text-foreground'>
              {activeTab === 'academic'
                ? t('profile.academicInfo.title')
                : activeTab === 'research'
                  ? t('profile.researchInfo.title')
                  : activeTab === 'security'
                    ? t('profile.securityInfo.title')
                    : t('profile.personalInfo.title')}
            </h2>
            <p className='text-xs text-muted-foreground'>
              {activeTab === 'academic'
                ? t('profile.academicInfo.subtitle')
                : activeTab === 'research'
                  ? t('profile.researchInfo.subtitle')
                  : activeTab === 'security'
                    ? t('profile.securityInfo.subtitle')
                    : t('profile.personalInfo.subtitle')}
            </p>
          </div>

          {activeTab === 'profile' ? (
            <div className='space-y-3'>
              <div className='space-y-1.5'>
                <Label htmlFor='fullName' className='text-xs text-foreground'>
                  {t('profile.fields.fullName')}
                </Label>
                <Input
                  id='fullName'
                  value={profileForm.fullName}
                  onChange={(e) => updateField('fullName', e.target.value)}
                  placeholder={t('profile.placeholders.fullName')}
                  className='h-9'
                />
              </div>

              <div className='space-y-1.5'>
                <Label htmlFor='email' className='text-xs text-foreground'>
                  {t('profile.fields.email')}
                </Label>
                <Input
                  id='email'
                  type='email'
                  value={profileForm.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  placeholder={t('profile.placeholders.email')}
                  className='h-9'
                />
              </div>

              <div className='space-y-1.5'>
                <Label htmlFor='phone' className='text-xs text-foreground'>
                  {t('profile.fields.phone')}
                </Label>
                <Input
                  id='phone'
                  type='tel'
                  value={profileForm.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  placeholder={t('profile.placeholders.phone')}
                  className='h-9'
                />
              </div>

              <Button onClick={handleSaveSection} className='mt-2' size='sm'>
                {t('profile.actions.save')}
              </Button>
            </div>
          ) : activeTab === 'academic' ? (
            <div className='space-y-3'>
              <div className='space-y-1.5'>
                <Label htmlFor='diploma' className='text-xs text-foreground'>
                  {t('profile.academicFields.diploma')}
                </Label>
                <Input
                  id='diploma'
                  value={academicForm.diploma}
                  onChange={(e) =>
                    updateAcademicField('diploma', e.target.value)
                  }
                  placeholder={t('profile.academicPlaceholders.diploma')}
                  className='h-9'
                />
              </div>

              <div className='space-y-1.5'>
                <Label
                  htmlFor='institution'
                  className='text-xs text-foreground'
                >
                  {t('profile.academicFields.institution')}
                </Label>
                <Input
                  id='institution'
                  value={academicForm.institution}
                  onChange={(e) =>
                    updateAcademicField('institution', e.target.value)
                  }
                  placeholder={t('profile.academicPlaceholders.institution')}
                  className='h-9'
                />
              </div>

              <div className='space-y-1.5'>
                <Label htmlFor='quality' className='text-xs text-foreground'>
                  {t('profile.academicFields.quality')}
                </Label>
                <select
                  id='quality'
                  value={academicForm.quality}
                  onChange={(e) =>
                    updateAcademicField('quality', e.target.value)
                  }
                  title={t('profile.academicFields.quality')}
                  aria-label={t('profile.academicFields.quality')}
                  className='h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50'
                >
                  <option value=''>
                    {t('profile.academicPlaceholders.quality')}
                  </option>
                  <option value='teacher-researcher'>
                    {t('profile.academicOptions.quality.teacherResearcher')}
                  </option>
                  <option value='associate-professor'>
                    {t('profile.academicOptions.quality.associateProfessor')}
                  </option>
                  <option value='professor'>
                    {t('profile.academicOptions.quality.professor')}
                  </option>
                </select>
              </div>

              <div className='space-y-1.5'>
                <Label
                  htmlFor='researchGrade'
                  className='text-xs text-foreground'
                >
                  {t('profile.academicFields.researchGrade')}
                </Label>
                <select
                  id='researchGrade'
                  value={academicForm.researchGrade}
                  onChange={(e) =>
                    updateAcademicField('researchGrade', e.target.value)
                  }
                  title={t('profile.academicFields.researchGrade')}
                  aria-label={t('profile.academicFields.researchGrade')}
                  className='h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50'
                >
                  <option value=''>
                    {t('profile.academicPlaceholders.researchGrade')}
                  </option>
                  <option value='director'>
                    {t('profile.academicOptions.researchGrade.director')}
                  </option>
                  <option value='senior'>
                    {t('profile.academicOptions.researchGrade.senior')}
                  </option>
                  <option value='junior'>
                    {t('profile.academicOptions.researchGrade.junior')}
                  </option>
                </select>
              </div>

              <div className='space-y-1.5'>
                <Label htmlFor='team' className='text-xs text-foreground'>
                  {t('profile.academicFields.team')}
                </Label>
                <Input
                  id='team'
                  value={academicForm.team}
                  onChange={(e) => updateAcademicField('team', e.target.value)}
                  placeholder={t('profile.academicPlaceholders.team')}
                  className='h-9'
                />
              </div>

              <Button onClick={handleSaveSection} className='mt-2' size='sm'>
                {t('profile.actions.save')}
              </Button>
            </div>
          ) : activeTab === 'research' ? (
            <div className='space-y-3'>
              <div className='space-y-1.5'>
                <Label htmlFor='hIndex' className='text-xs text-foreground'>
                  {t('profile.researchFields.hIndex')}
                </Label>
                <Input
                  id='hIndex'
                  type='number'
                  min={0}
                  value={researchForm.hIndex}
                  onChange={(e) =>
                    updateResearchField('hIndex', e.target.value)
                  }
                  placeholder={t('profile.researchPlaceholders.hIndex')}
                  className='h-9'
                />
              </div>

              <div className='space-y-1.5'>
                <Label
                  htmlFor='googleScholar'
                  className='text-xs text-foreground'
                >
                  {t('profile.researchFields.googleScholar')}
                </Label>
                <Input
                  id='googleScholar'
                  type='url'
                  value={researchForm.googleScholar}
                  onChange={(e) =>
                    updateResearchField('googleScholar', e.target.value)
                  }
                  placeholder={t('profile.researchPlaceholders.googleScholar')}
                  className='h-9'
                />
              </div>

              <div className='space-y-1.5'>
                <Label
                  htmlFor='researchGate'
                  className='text-xs text-foreground'
                >
                  {t('profile.researchFields.researchGate')}
                </Label>
                <Input
                  id='researchGate'
                  type='url'
                  value={researchForm.researchGate}
                  onChange={(e) =>
                    updateResearchField('researchGate', e.target.value)
                  }
                  placeholder={t('profile.researchPlaceholders.researchGate')}
                  className='h-9'
                />
              </div>

              <div className='space-y-1.5'>
                <Label
                  htmlFor='personalSite'
                  className='text-xs text-foreground'
                >
                  {t('profile.researchFields.personalSite')}
                </Label>
                <Input
                  id='personalSite'
                  type='url'
                  value={researchForm.personalSite}
                  onChange={(e) =>
                    updateResearchField('personalSite', e.target.value)
                  }
                  placeholder={t('profile.researchPlaceholders.personalSite')}
                  className='h-9'
                />
              </div>

              <Button onClick={handleSaveSection} className='mt-2' size='sm'>
                {t('profile.actions.save')}
              </Button>
            </div>
          ) : activeTab === 'security' ? (
            <div className='space-y-3'>
              <div className='space-y-1.5'>
                <Label
                  htmlFor='currentPassword'
                  className='text-xs text-foreground'
                >
                  {t('profile.securityFields.currentPassword')}
                </Label>
                <Input
                  id='currentPassword'
                  type='password'
                  value={securityForm.currentPassword}
                  onChange={(e) =>
                    updateSecurityField('currentPassword', e.target.value)
                  }
                  placeholder={t(
                    'profile.securityPlaceholders.currentPassword',
                  )}
                  className='h-9'
                />
              </div>

              <div className='space-y-1.5'>
                <Label
                  htmlFor='newPassword'
                  className='text-xs text-foreground'
                >
                  {t('profile.securityFields.newPassword')}
                </Label>
                <Input
                  id='newPassword'
                  type='password'
                  value={securityForm.newPassword}
                  onChange={(e) =>
                    updateSecurityField('newPassword', e.target.value)
                  }
                  placeholder={t('profile.securityPlaceholders.newPassword')}
                  className='h-9'
                />
              </div>

              <div className='space-y-1.5'>
                <Label
                  htmlFor='confirmPassword'
                  className='text-xs text-foreground'
                >
                  {t('profile.securityFields.confirmPassword')}
                </Label>
                <Input
                  id='confirmPassword'
                  type='password'
                  value={securityForm.confirmPassword}
                  onChange={(e) =>
                    updateSecurityField('confirmPassword', e.target.value)
                  }
                  placeholder={t(
                    'profile.securityPlaceholders.confirmPassword',
                  )}
                  className='h-9'
                />
              </div>

              <Button onClick={handleSaveSection} className='mt-2' size='sm'>
                {t('profile.actions.confirmPassword')}
              </Button>
            </div>
          ) : (
            <div className='rounded-lg border border-dashed border-border bg-muted/30 p-5 text-sm text-muted-foreground'>
              {t('profile.tabComingSoon', {
                tab: t(tabLabelKeyMap[activeTab]),
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {activeTab === 'security' && (
        <Card className='shadow-none'>
          <CardContent className='space-y-4 px-5 py-4'>
            <div className='space-y-1 border-b border-border pb-3'>
              <h2 className='text-sm font-semibold text-foreground'>
                {t('profile.securityNotifications.title')}
              </h2>
              <p className='text-xs text-muted-foreground'>
                {t('profile.securityNotifications.subtitle')}
              </p>
            </div>

            <div className='space-y-3'>
              <label className='flex items-center justify-between gap-3 text-sm text-foreground'>
                <span>{t('profile.securityNotifications.loginAlert')}</span>
                <input
                  type='checkbox'
                  checked={securityForm.loginAlert}
                  onChange={(e) =>
                    updateSecurityField('loginAlert', e.target.checked)
                  }
                  aria-label={t('profile.securityNotifications.loginAlert')}
                  className='size-4 accent-[#1f3556]'
                />
              </label>

              <label className='flex items-center justify-between gap-3 text-sm text-foreground'>
                <span>{t('profile.securityNotifications.passwordChange')}</span>
                <input
                  type='checkbox'
                  checked={securityForm.passwordChange}
                  onChange={(e) =>
                    updateSecurityField('passwordChange', e.target.checked)
                  }
                  aria-label={t('profile.securityNotifications.passwordChange')}
                  className='size-4 accent-[#1f3556]'
                />
              </label>

              <label className='flex items-center justify-between gap-3 text-sm text-foreground'>
                <span>
                  {t('profile.securityNotifications.suspiciousActivity')}
                </span>
                <input
                  type='checkbox'
                  checked={securityForm.suspiciousActivity}
                  onChange={(e) =>
                    updateSecurityField('suspiciousActivity', e.target.checked)
                  }
                  aria-label={t(
                    'profile.securityNotifications.suspiciousActivity',
                  )}
                  className='size-4 accent-[#1f3556]'
                />
              </label>
            </div>

            <Button onClick={handleSaveSection} size='sm'>
              {t('profile.actions.confirm')}
            </Button>
          </CardContent>
        </Card>
      )}

      <div className='fixed bottom-5 right-6 z-20'>
        <Button onClick={handleSaveAll} size='lg' className='shadow-sm'>
          {t('profile.actions.saveAll')}
        </Button>
      </div>
    </div>
  )
}
