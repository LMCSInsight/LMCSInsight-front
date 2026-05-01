import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { CircleUserRound, KeyRound } from 'lucide-react'
import { useAuthContext } from '@/shared/context/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function AssistantProfilePage() {
  const { t } = useTranslation()
  const { currentUser } = useAuthContext()

  const [fullName, setFullName] = useState(currentUser?.name ?? '')
  const [email, setEmail] = useState(currentUser?.email ?? '')

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    if (!fullName.trim()) {
      toast.error('Le nom est obligatoire')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      toast.error('Adresse courriel invalide')
      return
    }
    toast.message('Profil mis à jour', {
      description:
        'Les changements seront synchronisés lorsque le point d’API profil sera disponible.',
    })
  }

  function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    if (!currentPassword) {
      toast.error('Indiquez le mot de passe actuel')
      return
    }
    if (newPassword.length < 8) {
      toast.error('Le nouveau mot de passe doit contenir au moins 8 caractères')
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error('La confirmation ne correspond pas au nouveau mot de passe')
      return
    }
    toast.message('Mot de passe', {
      description:
        'La modification sera traitée par le serveur une fois l’endpoint sécurisé branché.',
    })
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
  }

  return (
    <div className='mx-auto max-w-2xl space-y-8'>
      <header className='space-y-2'>
        <h1 className='text-balance text-3xl font-semibold tracking-tight text-foreground'>
          {t('director.pageTitles.profile')}
        </h1>
        <p className='text-pretty text-sm leading-relaxed text-muted-foreground'>
          {t('director.profile.intro')}
        </p>
      </header>

      <Card className='rounded-2xl border-border/60 shadow-none transition-[box-shadow] duration-200 hover:shadow-md'>
        <CardHeader className='flex flex-row items-center gap-2 space-y-0 pb-2'>
          <CircleUserRound className='size-5 text-primary' aria-hidden />
          <CardTitle className='text-base font-semibold tracking-tight text-foreground'>
            {t('director.profile.accountCardTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveProfile} className='space-y-4'>
            <div className='space-y-1.5'>
              <Label htmlFor='assistant-name' className='text-xs font-medium'>
                {t('profile.profileFields.fullName', 'Nom complet')}
              </Label>
              <Input
                id='assistant-name'
                autoComplete='name'
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={cn(
                  'h-10 transition-[box-shadow] focus-visible:ring-2 focus-visible:ring-ring/50',
                )}
              />
            </div>
            <div className='space-y-1.5'>
              <Label htmlFor='assistant-email' className='text-xs font-medium'>
                {t('profile.profileFields.email', 'Courriel')}
              </Label>
              <Input
                id='assistant-email'
                type='email'
                autoComplete='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className='h-10 focus-visible:ring-2 focus-visible:ring-ring/50'
              />
            </div>
            <Button type='submit' className='active:scale-[0.98]'>
              {t('profile.actions.save', 'Enregistrer')}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className='rounded-2xl border-border/60 shadow-none transition-[box-shadow] duration-200 hover:shadow-md'>
        <CardHeader className='flex flex-row items-center gap-2 space-y-0 pb-2'>
          <KeyRound className='size-5 text-primary' aria-hidden />
          <CardTitle className='text-base font-semibold tracking-tight text-foreground'>
            {t('profile.tabs.security', 'Sécurité')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className='space-y-4'>
            <div className='space-y-1.5'>
              <Label htmlFor='assistant-cur-pw' className='text-xs font-medium'>
                {t('profile.securityFields.currentPassword')}
              </Label>
              <Input
                id='assistant-cur-pw'
                type='password'
                autoComplete='current-password'
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className='h-10 focus-visible:ring-2 focus-visible:ring-ring/50'
              />
            </div>
            <div className='space-y-1.5'>
              <Label htmlFor='assistant-new-pw' className='text-xs font-medium'>
                {t('profile.securityFields.newPassword')}
              </Label>
              <Input
                id='assistant-new-pw'
                type='password'
                autoComplete='new-password'
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className='h-10 focus-visible:ring-2 focus-visible:ring-ring/50'
              />
            </div>
            <div className='space-y-1.5'>
              <Label
                htmlFor='assistant-confirm-pw'
                className='text-xs font-medium'
              >
                {t('profile.securityFields.confirmPassword')}
              </Label>
              <Input
                id='assistant-confirm-pw'
                type='password'
                autoComplete='new-password'
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className='h-10 focus-visible:ring-2 focus-visible:ring-ring/50'
              />
            </div>
            <Button
              type='submit'
              variant='secondary'
              className='transition-transform active:scale-[0.98]'
            >
              {t('profile.actions.confirmPassword', 'Changer le mot de passe')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
