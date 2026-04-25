import { useEffect, useRef, useState, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  User,
  BookOpen,
  Mail,
  AlertCircle,
  CheckCircle2,
  PencilLine,
  Loader2,
} from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useStudent, useUpdateStudent } from '@/features/students/hooks'
import type {
  StudentPayload,
  Institution,
  StudentLevel,
  Specialty,
} from '@/features/students/api'
import { cn } from '@/lib/utils'

const INSTITUTION_OPTIONS: { value: Institution; label: string }[] = [
  { value: 'ESI', label: 'ESI' },
  { value: 'EXTERNE', label: 'Extérieur' },
]
const LEVEL_OPTIONS: { value: StudentLevel; label: string }[] = [
  { value: 'MASTER', label: 'Master' },
  { value: 'DOCTORANT', label: 'Doctorant' },
]
const SPECIALTY_OPTIONS: Specialty[] = ['SIL', 'SID', 'SIT', 'SIQ']

const SELECT_CLASS =
  'h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50'

function getInitials(first: string, last: string): string {
  const f = first.trim().charAt(0).toUpperCase()
  const l = last.trim().charAt(0).toUpperCase()
  return f || l ? `${f}${l}` : '?'
}

function SkeletonRow() {
  return <div className='h-9 animate-pulse rounded-lg bg-muted' />
}

export default function EditStudentPage() {
  const { studentId } = useParams<{ studentId: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const { data: student, isLoading } = useStudent(studentId)
  const { mutate: updateStudent, isPending } = useUpdateStudent(studentId!)

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
  const [toast, setToast] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)
  const originalRef = useRef<StudentPayload | null>(null)

  useEffect(() => {
    if (student) {
      const populated: StudentPayload = {
        firstName: student.firstName ?? '',
        lastName: student.lastName ?? '',
        email: student.email ?? '',
        institution: student.institution,
        level: student.level,
        specialty: student.specialty ?? undefined,
      }
      setForm(populated)
      originalRef.current = populated
    }
  }, [student])

  const dirtyCount = useMemo(() => {
    if (!originalRef.current) return 0
    return (Object.keys(form) as (keyof StudentPayload)[]).filter(
      (k) => form[k] !== originalRef.current![k],
    ).length
  }, [form])

  function isDirtyField(field: keyof StudentPayload): boolean {
    return !!originalRef.current && form[field] !== originalRef.current[field]
  }

  function set(field: keyof StudentPayload, value: string) {
    setForm((p) => ({ ...p, [field]: value }))
    if (errors[field]) setErrors((p) => ({ ...p, [field]: false }))
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
    updateStudent(form, {
      onSuccess: () => {
        setToast({ type: 'success', message: t('students.edit.success') })
        setTimeout(() => {
          navigate(-1)
        }, 1200)
      },
      onError: (err: unknown) => {
        const msg =
          err instanceof Error ? err.message : t('students.edit.error')
        setToast({ type: 'error', message: msg })
        setTimeout(() => setToast(null), 3500)
      },
    })
  }

  const initials = getInitials(form.firstName, form.lastName)
  const studentName = student ? `${student.firstName} ${student.lastName}` : ''

  const dirtyInputClass = (field: keyof StudentPayload) =>
    isDirtyField(field)
      ? 'ring-1 ring-amber-400/60 bg-amber-50/40 dark:bg-amber-950/20'
      : ''

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

      {/* Header ribbon */}
      <Card className='overflow-hidden'>
        <div className='flex items-center gap-4 bg-amber-50 px-6 py-4 dark:bg-amber-950/30'>
          <div className='flex size-9 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/50'>
            <PencilLine className='size-4 text-amber-600 dark:text-amber-400' />
          </div>
          <div className='flex-1 min-w-0'>
            <h1 className='text-base font-semibold text-foreground truncate'>
              {studentName || t('students.edit.title')}
            </h1>
            <p className='text-xs text-muted-foreground'>
              {t('students.edit.subtitle')}
            </p>
          </div>
          {/* Change count badge */}
          <span
            className={cn(
              'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium tabular transition-colors',
              dirtyCount > 0
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300'
                : 'bg-muted text-muted-foreground',
            )}
          >
            {dirtyCount > 0
              ? t('students.edit.changesCount_other', { count: dirtyCount })
              : t('students.edit.noChanges')}
          </span>
          <div className='flex size-12 items-center justify-center rounded-full bg-primary text-base font-bold text-primary-foreground shadow-sm'>
            {initials}
          </div>
        </div>
      </Card>

      {isLoading ? (
        <Card>
          <CardContent className='space-y-4 pt-6'>
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </CardContent>
        </Card>
      ) : (
        <form onSubmit={handleSubmit} className='space-y-4'>
          {/* Section 1 */}
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
                  <Input
                    id='firstName'
                    value={form.firstName}
                    onChange={(e) => set('firstName', e.target.value)}
                    className={cn(
                      'h-9 transition-all',
                      errors.firstName &&
                        'border-destructive focus-visible:ring-destructive/30',
                      dirtyInputClass('firstName'),
                    )}
                  />
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
                  <Input
                    id='lastName'
                    value={form.lastName}
                    onChange={(e) => set('lastName', e.target.value)}
                    className={cn(
                      'h-9 transition-all',
                      errors.lastName &&
                        'border-destructive focus-visible:ring-destructive/30',
                      dirtyInputClass('lastName'),
                    )}
                  />
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
                <Input
                  id='email'
                  type='email'
                  value={form.email ?? ''}
                  onChange={(e) => set('email', e.target.value)}
                  placeholder='utilisateur@esi.dz'
                  className={cn('h-9 transition-all', dirtyInputClass('email'))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Section 2 — flat style */}
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
                    className={cn(
                      SELECT_CLASS,
                      errors.institution && 'border-destructive',
                      isDirtyField('institution') &&
                        'ring-1 ring-amber-400/60 bg-amber-50/40 dark:bg-amber-950/20',
                    )}
                  >
                    <option value=''>Sélectionner...</option>
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
                    className={cn(
                      SELECT_CLASS,
                      errors.level && 'border-destructive',
                      isDirtyField('level') &&
                        'ring-1 ring-amber-400/60 bg-amber-50/40 dark:bg-amber-950/20',
                    )}
                  >
                    <option value=''>Sélectionner...</option>
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
                  className={cn(
                    SELECT_CLASS,
                    isDirtyField('specialty') &&
                      'ring-1 ring-amber-400/60 bg-amber-50/40 dark:bg-amber-950/20',
                  )}
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
              disabled={isPending || dirtyCount === 0}
              className='px-6 hover:shadow-primary transition-shadow'
            >
              {isPending ? (
                <Loader2 className='mr-2 size-4 animate-spin' />
              ) : (
                <PencilLine className='mr-2 size-4' />
              )}
              {isPending
                ? t('common.saving')
                : dirtyCount === 0
                  ? t('students.edit.noChanges')
                  : t('students.edit.submit')}
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
