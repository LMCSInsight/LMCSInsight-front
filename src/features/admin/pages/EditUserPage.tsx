import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ROUTES } from '@/config/routes'
import { useUser, useUpdateUser } from '@/features/admin/hooks/useUsers'
import type { UserRole } from '@/features/admin/api/userApi'

interface FormState {
  firstName: string
  lastName: string
  email: string
  role: UserRole
  phoneNumber: string
}

export default function EditUserPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { userId } = useParams<{ userId: string }>()

  const { data: user, isLoading, isError } = useUser(userId)
  const { mutate: updateUser, isPending } = useUpdateUser(userId ?? '')

  const [form, setForm] = useState<FormState>({
    firstName: '',
    lastName: '',
    email: '',
    role: 'RESEARCHER',
    phoneNumber: '',
  })
  const [errors, setErrors] = useState<
    Partial<Record<keyof FormState, string>>
  >({})

  useEffect(() => {
    if (user) {
      setForm({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        phoneNumber: user.phoneNumber ?? '',
      })
    }
  }, [user])

  function validate(): boolean {
    const next: Partial<Record<keyof FormState, string>> = {}
    if (!form.firstName.trim()) next.firstName = t('common.required')
    if (!form.lastName.trim()) next.lastName = t('common.required')
    if (!form.email.trim()) next.email = t('common.required')
    if (!form.role) next.role = t('common.required')
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    updateUser(
      {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        role: form.role,
        phoneNumber: form.phoneNumber.trim() || undefined,
      },
      {
        onSuccess: () => {
          toast.success(t('admin.users.updateSuccess'))
          navigate(ROUTES.ADMIN_USERS)
        },
        onError: () => {
          toast.error(t('admin.users.updateError'))
        },
      },
    )
  }

  if (isLoading) {
    return (
      <div className='mx-auto max-w-3xl space-y-6'>
        <div className='h-10 w-56 animate-pulse rounded-lg bg-muted' />
        <Card className='border-border/70'>
          <CardContent className='space-y-4 p-6'>
            {[...Array(5)].map((_, i) => (
              <div key={i} className='h-10 animate-pulse rounded-lg bg-muted' />
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isError || !user) {
    return (
      <div className='mx-auto max-w-3xl rounded-2xl border border-border/70 bg-muted/20 px-6 py-12 text-center'>
        <p className='text-sm text-destructive'>{t('admin.users.loadError')}</p>
        <Button
          variant='outline'
          className='mt-6 rounded-lg'
          onClick={() => navigate(ROUTES.ADMIN_USERS)}
        >
          {t('admin.users.backToList')}
        </Button>
      </div>
    )
  }

  return (
    <div className='mx-auto max-w-3xl space-y-8'>
      <header className='max-w-xl space-y-1'>
        <h1 className='text-balance text-3xl font-semibold tracking-tight text-foreground'>
          {t('admin.users.editUser')}
        </h1>
        <p className='text-sm text-muted-foreground'>
          <span className='font-medium text-foreground'>
            {user.firstName} {user.lastName}
          </span>{' '}
          · {user.email}
        </p>
      </header>

      <Card className='border-border/70 shadow-none'>
        <CardHeader className='border-b border-border/60 pb-4'>
          <CardTitle className='text-base font-semibold tracking-tight'>
            {t('admin.users.profileSection')}
          </CardTitle>
        </CardHeader>
        <CardContent className='pt-6'>
          <form onSubmit={handleSubmit} className='space-y-6'>
            <div className='grid max-w-[65ch] gap-6 sm:grid-cols-2'>
              <div className='space-y-2'>
                <Label htmlFor='firstName'>{t('admin.users.firstName')}</Label>
                <Input
                  id='firstName'
                  className='h-10 rounded-lg'
                  value={form.firstName}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, firstName: e.target.value }))
                  }
                />
                {errors.firstName && (
                  <p className='text-xs text-destructive'>{errors.firstName}</p>
                )}
              </div>
              <div className='space-y-2'>
                <Label htmlFor='lastName'>{t('admin.users.lastName')}</Label>
                <Input
                  id='lastName'
                  className='h-10 rounded-lg'
                  value={form.lastName}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, lastName: e.target.value }))
                  }
                />
                {errors.lastName && (
                  <p className='text-xs text-destructive'>{errors.lastName}</p>
                )}
              </div>
            </div>

            <div className='max-w-[65ch] space-y-2'>
              <Label htmlFor='email'>{t('admin.users.email')}</Label>
              <Input
                id='email'
                type='email'
                className='h-10 rounded-lg'
                value={form.email}
                onChange={(e) =>
                  setForm((p) => ({ ...p, email: e.target.value }))
                }
              />
              {errors.email && (
                <p className='text-xs text-destructive'>{errors.email}</p>
              )}
            </div>

            <div className='max-w-md space-y-2'>
              <Label htmlFor='role'>{t('admin.users.role')}</Label>
              <select
                id='role'
                value={form.role}
                onChange={(e) =>
                  setForm((p) => ({ ...p, role: e.target.value as UserRole }))
                }
                className='h-10 w-full rounded-lg border border-input bg-background px-3 text-sm shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
              >
                <option value='RESEARCHER'>
                  {t('admin.users.roles.researcher')}
                </option>
                <option value='DIRECTOR'>
                  {t('admin.users.roles.director')}
                </option>
                <option value='ASSISTANT'>
                  {t('admin.users.roles.assistant')}
                </option>
                <option value='ADMIN'>{t('admin.users.roles.admin')}</option>
              </select>
              {errors.role && (
                <p className='text-xs text-destructive'>{errors.role}</p>
              )}
            </div>

            <div className='max-w-[65ch] space-y-2'>
              <Label htmlFor='phoneNumber'>
                {t('admin.users.phoneNumberOptional')}
              </Label>
              <Input
                id='phoneNumber'
                type='tel'
                className='h-10 rounded-lg'
                value={form.phoneNumber}
                onChange={(e) =>
                  setForm((p) => ({ ...p, phoneNumber: e.target.value }))
                }
              />
            </div>

            <div className='flex flex-wrap justify-end gap-2 border-t border-border/60 pt-6'>
              <Button
                type='button'
                variant='outline'
                className='rounded-lg'
                onClick={() => navigate(ROUTES.ADMIN_USERS)}
              >
                {t('common.cancel')}
              </Button>
              <Button type='submit' disabled={isPending} className='rounded-lg'>
                {isPending ? t('common.saving') : t('common.save')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
