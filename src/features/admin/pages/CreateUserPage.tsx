import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import axios from 'axios'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ROUTES } from '@/config/routes'
import { useCreateUser } from '@/features/admin/hooks/useUsers'
import type { UserRole } from '@/features/admin/api/userApi'

interface FormState {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
  role: UserRole
  phoneNumber: string
}

export default function CreateUserPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { mutate: createUser, isPending } = useCreateUser()

  const [form, setForm] = useState<FormState>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'RESEARCHER',
    phoneNumber: '',
  })
  const [errors, setErrors] = useState<
    Partial<Record<keyof FormState, string>>
  >({})

  function validate(): boolean {
    const next: Partial<Record<keyof FormState, string>> = {}
    if (!form.firstName.trim()) next.firstName = t('common.required')
    if (!form.lastName.trim()) next.lastName = t('common.required')
    if (!form.email.trim()) next.email = t('common.required')
    if (!form.password) next.password = t('common.required')
    else if (form.password.length < 6)
      next.password = t('admin.users.passwordMinLength')
    if (form.confirmPassword !== form.password)
      next.confirmPassword = t('admin.users.passwordMismatch')
    if (!form.role) next.role = t('common.required')
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    createUser(
      {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
        phoneNumber: form.phoneNumber.trim() || undefined,
      },
      {
        onSuccess: () => {
          toast.success(t('admin.users.createSuccess'))
          navigate(ROUTES.ADMIN_USERS)
        },
        onError: (err) => {
          if (axios.isAxiosError(err)) {
            const apiError = err.response?.data as
              | { error?: string }
              | undefined
            if (
              err.response?.status === 409 &&
              apiError?.error === 'EMAIL_ALREADY_EXISTS'
            ) {
              toast.error(t('admin.users.emailAlreadyExists'))
              return
            }
          }
          toast.error(t('admin.users.createError'))
        },
      },
    )
  }

  function field(key: keyof FormState) {
    return {
      value: form[key],
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        setForm((prev) => ({ ...prev, [key]: e.target.value })),
    }
  }

  return (
    <div className='mx-auto max-w-3xl space-y-8'>
      <header className='max-w-xl space-y-1'>
        <h1 className='text-balance text-3xl font-semibold tracking-tight text-foreground'>
          {t('admin.users.createUser')}
        </h1>
        <p className='text-pretty text-sm leading-relaxed text-muted-foreground'>
          {t('admin.users.createSubtitle')}
        </p>
      </header>

      <Card className='border-border/70 shadow-none'>
        <CardHeader className='border-b border-border/60 pb-4'>
          <CardTitle className='text-base font-semibold tracking-tight'>
            {t('admin.users.accountDetails')}
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
                  {...field('firstName')}
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
                  {...field('lastName')}
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
                {...field('email')}
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
                  setForm((prev) => ({
                    ...prev,
                    role: e.target.value as UserRole,
                  }))
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
              <p className='text-xs leading-relaxed text-muted-foreground'>
                {t('admin.users.researcherProfileHelper')}
              </p>
            </div>

            <div className='max-w-[65ch] space-y-2'>
              <Label htmlFor='phoneNumber'>
                {t('admin.users.phoneNumberOptional')}
              </Label>
              <Input
                id='phoneNumber'
                type='tel'
                className='h-10 rounded-lg'
                {...field('phoneNumber')}
              />
            </div>

            <div className='grid max-w-[65ch] gap-6 border-t border-border/60 pt-6 sm:grid-cols-2'>
              <div className='space-y-2'>
                <Label htmlFor='password'>{t('admin.users.password')}</Label>
                <Input
                  id='password'
                  type='password'
                  className='h-10 rounded-lg'
                  {...field('password')}
                />
                {errors.password && (
                  <p className='text-xs text-destructive'>{errors.password}</p>
                )}
              </div>
              <div className='space-y-2'>
                <Label htmlFor='confirmPassword'>
                  {t('admin.users.confirmPassword')}
                </Label>
                <Input
                  id='confirmPassword'
                  type='password'
                  className='h-10 rounded-lg'
                  {...field('confirmPassword')}
                />
                {errors.confirmPassword && (
                  <p className='text-xs text-destructive'>
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            <div className='flex flex-wrap justify-end gap-2 pt-2'>
              <Button
                type='button'
                variant='outline'
                className='rounded-lg'
                onClick={() => navigate(ROUTES.ADMIN_USERS)}
              >
                {t('common.cancel')}
              </Button>
              <Button type='submit' disabled={isPending} className='rounded-lg'>
                {isPending ? t('common.saving') : t('admin.users.createUser')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
