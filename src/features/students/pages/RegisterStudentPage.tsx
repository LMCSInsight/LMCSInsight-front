import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  GraduationCap,
  User,
  BookOpen,
  Mail,
  AlertCircle,
  CheckCircle2,
  Check,
  Loader2,
} from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCreateStudent } from '@/features/students/hooks'
import type {
  StudentPayload,
  Institution,
  StudentLevel,
  Specialty,
} from '@/features/students/api'
import { cn } from '@/lib/utils'

// ─── Options ─────────────────────────────────────────────────────────────────

const SPECIALTY_OPTIONS: Specialty[] = ['SIL', 'SID', 'SIT', 'SIQ']

const SELECT_CLASS =
  'h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getInitials(first: string, last: string): string {
  const f = first.trim().charAt(0).toUpperCase()
  const l = last.trim().charAt(0).toUpperCase()
  return f || l ? `${f}${l}` : '?'
}

// ─── Field wrapper with valid state indicator ─────────────────────────────────

function FieldWrapper({
  children,
  hasError,
  isValid,
}: {
  children: React.ReactNode
  hasError?: boolean
  isValid?: boolean
}) {
  return (
    <div className='relative'>
      {children}
      {isValid && !hasError && (
        <Check className='absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-green-500 pointer-events-none' />
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RegisterStudentPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { mutate: createStudent, isPending } = useCreateStudent()

  const INSTITUTION_OPTIONS = useMemo(
    () => [
      { value: 'ESI' as Institution, label: t('students.institution.ESI') },
      {
        value: 'EXTERNE' as Institution,
        label: t('students.institution.EXTERNE'),
      },
    ],
    [t],
  )

  const LEVEL_OPTIONS = useMemo(
    () => [
      { value: 'MASTER' as StudentLevel, label: t('students.level.MASTER') },
      {
        value: 'DOCTORANT' as StudentLevel,
        label: t('students.level.DOCTORANT'),
      },
    ],
    [t],
  )

  const [form, setForm] = useState<StudentPayload>({
    firstName: '',
    lastName: '',
    email: '',
    institution: '' as Institution,
    level: '' as StudentLevel,
    specialty: undefined,
  })
  const [errors, setErrors] = useState<
    Partial<Record<keyof StudentPayload, boolean>>
  >({})
  const [touched, setTouched] = useState<
    Partial<Record<keyof StudentPayload, boolean>>
  >({})
  const [toast, setToast] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)

  function set(field: keyof StudentPayload, value: string) {
    setForm((p) => ({ ...p, [field]: value }))
    if (errors[field]) setErrors((p) => ({ ...p, [field]: false }))
  }

  function touch(field: keyof StudentPayload) {
    setTouched((p) => ({ ...p, [field]: true }))
  }

  function isValid(field: keyof StudentPayload) {
    return touched[field] && !errors[field] && !!form[field]?.trim()
  }

  function validate(): boolean {
    const required: (keyof StudentPayload)[] = [
      'firstName',
      'lastName',
      'institution',
      'level',
    ]
    const next: typeof errors = {}
    required.forEach((k) => {
      if (!form[k]?.trim()) next[k] = true
    })
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    createStudent(form, {
      onSuccess: () => {
        setToast({ type: 'success', message: t('students.register.success') })
        setTimeout(() => {
          navigate(-1)
        }, 1200)
      },
      onError: (err: unknown) => {
        const msg =
          err instanceof Error ? err.message : t('students.register.error')
        setToast({ type: 'error', message: msg })
        setTimeout(() => setToast(null), 3500)
      },
    })
  }

  const initials = getInitials(form.firstName, form.lastName)
  const avatarVisible =
    form.firstName.trim().length > 0 && form.lastName.trim().length > 0

  return (
    <div className='mx-auto max-w-2xl space-y-4'>
      {/* Toast */}
      {toast && (
        <div
          className={`flex items-center gap-2 rounded-lg border px-4 py-3 text-sm ${
            toast.type === 'success'
              ? 'border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-300'
              : 'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-300'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className='size-4 shrink-0' />
          ) : (
            <AlertCircle className='size-4 shrink-0' />
          )}
          {toast.message}
        </div>
      )}

      {/* Header card */}
      <Card className='overflow-hidden'>
        <div className='relative flex items-center justify-between bg-primary/10 px-6 py-5 overflow-hidden'>
          {/* Decorative watermark icon */}
          <GraduationCap className='absolute right-24 bottom-0 translate-y-1/4 size-36 text-primary opacity-[0.06] pointer-events-none select-none' />
          <div className='flex items-center gap-4'>
            <div className='flex size-12 items-center justify-center rounded-full bg-primary/20'>
              <GraduationCap className='size-6 text-primary' />
            </div>
            <div>
              <h1 className='text-lg font-semibold text-foreground'>
                {t('students.register.title')}
              </h1>
              <p className='text-xs text-muted-foreground'>
                {t('students.register.subtitle')}
              </p>
            </div>
          </div>
          {/* Live avatar preview — animates in when both names are filled */}
          <div
            className={cn(
              'flex size-14 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground shadow-primary transition-all duration-300',
              avatarVisible ? 'scale-100 opacity-100' : 'scale-90 opacity-40',
            )}
          >
            {initials}
          </div>
        </div>
      </Card>

      <form onSubmit={handleSubmit} className='space-y-4'>
        {/* Section 1 — Informations personnelles */}
        <Card className='border-l-4 border-l-primary'>
          <CardHeader className='pb-3'>
            <div className='flex items-center gap-2'>
              <User className='size-4 text-primary' />
              <span className='text-sm font-semibold text-foreground'>
                {t('students.register.section1')}
              </span>
            </div>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-1.5'>
                <Label
                  htmlFor='firstName'
                  className='text-xs font-medium text-foreground'
                >
                  {t('students.register.firstName')}{' '}
                  <span className='text-destructive'>*</span>
                </Label>
                <FieldWrapper
                  hasError={errors.firstName}
                  isValid={isValid('firstName')}
                >
                  <Input
                    id='firstName'
                    value={form.firstName}
                    onChange={(e) => set('firstName', e.target.value)}
                    onBlur={() => touch('firstName')}
                    placeholder={t('students.register.firstName')}
                    className={cn(
                      'h-9',
                      errors.firstName &&
                        'border-destructive focus-visible:ring-destructive/30',
                      isValid('firstName') && 'border-green-500/60 pr-8',
                    )}
                  />
                </FieldWrapper>
                {errors.firstName && (
                  <p className='text-xs text-destructive'>
                    {t('common.required')}
                  </p>
                )}
              </div>
              <div className='space-y-1.5'>
                <Label
                  htmlFor='lastName'
                  className='text-xs font-medium text-foreground'
                >
                  {t('students.register.lastName')}{' '}
                  <span className='text-destructive'>*</span>
                </Label>
                <FieldWrapper
                  hasError={errors.lastName}
                  isValid={isValid('lastName')}
                >
                  <Input
                    id='lastName'
                    value={form.lastName}
                    onChange={(e) => set('lastName', e.target.value)}
                    onBlur={() => touch('lastName')}
                    placeholder={t('students.register.lastName')}
                    className={cn(
                      'h-9',
                      errors.lastName &&
                        'border-destructive focus-visible:ring-destructive/30',
                      isValid('lastName') && 'border-green-500/60 pr-8',
                    )}
                  />
                </FieldWrapper>
                {errors.lastName && (
                  <p className='text-xs text-destructive'>
                    {t('common.required')}
                  </p>
                )}
              </div>
            </div>
            <div className='space-y-1.5'>
              <Label
                htmlFor='email'
                className='text-xs font-medium text-foreground'
              >
                <span className='inline-flex items-center gap-1'>
                  <Mail className='size-3' />
                  Email
                </span>
              </Label>
              <FieldWrapper isValid={isValid('email')}>
                <Input
                  id='email'
                  type='email'
                  value={form.email ?? ''}
                  onChange={(e) => set('email', e.target.value)}
                  onBlur={() => touch('email')}
                  placeholder={t('students.register.emailPlaceholder')}
                  className={cn(
                    'h-9',
                    isValid('email') && 'border-green-500/60 pr-8',
                  )}
                />
              </FieldWrapper>
            </div>
          </CardContent>
        </Card>

        {/* Section 2 — Informations académiques (flat style — no left accent) */}
        <Card className='bg-muted/30 border border-border'>
          <CardHeader className='pb-3'>
            <div className='flex items-center gap-2'>
              <div className='flex size-7 items-center justify-center rounded-md bg-primary/10'>
                <BookOpen className='size-4 text-primary' />
              </div>
              <span className='text-sm font-semibold text-foreground'>
                {t('students.register.section2')}
              </span>
            </div>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-1.5'>
                <Label
                  htmlFor='institution'
                  className='text-xs font-medium text-foreground'
                >
                  {t('students.register.institution')}{' '}
                  <span className='text-destructive'>*</span>
                </Label>
                <select
                  id='institution'
                  value={form.institution}
                  onChange={(e) => set('institution', e.target.value)}
                  onBlur={() => touch('institution')}
                  className={
                    SELECT_CLASS +
                    (errors.institution ? ' border-destructive' : '')
                  }
                >
                  <option value=''>{t('common.select')}</option>
                  {INSTITUTION_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                {errors.institution && (
                  <p className='text-xs text-destructive'>
                    {t('common.required')}
                  </p>
                )}
              </div>
              <div className='space-y-1.5'>
                <Label
                  htmlFor='level'
                  className='text-xs font-medium text-foreground'
                >
                  {t('students.register.level')}{' '}
                  <span className='text-destructive'>*</span>
                </Label>
                <select
                  id='level'
                  value={form.level}
                  onChange={(e) => set('level', e.target.value)}
                  onBlur={() => touch('level')}
                  className={
                    SELECT_CLASS + (errors.level ? ' border-destructive' : '')
                  }
                >
                  <option value=''>{t('common.select')}</option>
                  {LEVEL_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                {errors.level && (
                  <p className='text-xs text-destructive'>
                    {t('common.required')}
                  </p>
                )}
              </div>
            </div>
            <div className='w-1/2 space-y-1.5'>
              <Label
                htmlFor='specialty'
                className='text-xs font-medium text-foreground'
              >
                {t('students.register.specialty')}
              </Label>
              <select
                id='specialty'
                value={form.specialty ?? ''}
                onChange={(e) => set('specialty', e.target.value)}
                className={SELECT_CLASS}
              >
                <option value=''>
                  {t('students.register.specialtyOptional')}
                </option>
                {SPECIALTY_OPTIONS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className='flex items-center justify-end gap-3 pt-1'>
          <Button
            type='button'
            variant='outline'
            onClick={() => navigate(-1)}
            className='px-6'
          >
            {t('common.cancel')}
          </Button>
          <Button
            type='submit'
            disabled={isPending}
            className='px-6 hover:shadow-primary transition-shadow'
          >
            {isPending ? (
              <Loader2 className='mr-2 size-4 animate-spin' />
            ) : (
              <GraduationCap className='mr-2 size-4' />
            )}
            {isPending ? t('common.saving') : t('students.register.submit')}
          </Button>
        </div>
      </form>
    </div>
  )
}
