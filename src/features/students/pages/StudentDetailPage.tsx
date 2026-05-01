import { useMemo } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import {
  getAssistantStudentsPath,
  getAssistantStudentEditPath,
} from '@/config/routes'
import { useTranslation } from 'react-i18next'
import {
  Mail,
  Building2,
  GraduationCap,
  BookOpen,
  Calendar,
  Hash,
  ArrowLeft,
  Pencil,
  ListOrdered,
  ChevronRight,
} from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button, buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useStudent } from '@/features/students/hooks'
import { cn } from '@/lib/utils'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getInitials(first?: string, last?: string): string {
  const f = (first ?? '').trim().charAt(0).toUpperCase()
  const l = (last ?? '').trim().charAt(0).toUpperCase()
  return f || l ? `${f}${l}` : '?'
}

function fmt(iso?: string | null, locale?: string, fallback = '—'): string {
  if (!iso) return fallback
  return new Date(iso).toLocaleDateString(locale || undefined, {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function InfoField({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value?: string | null
  icon?: React.ElementType
}) {
  const { t } = useTranslation()
  return (
    <div className='flex flex-col gap-0.5'>
      <span className='text-xs font-semibold text-muted-foreground'>
        {label}
      </span>
      <span className='flex items-center gap-1.5 text-sm font-medium text-foreground'>
        {Icon && <Icon className='size-3.5 text-muted-foreground shrink-0' />}
        {value ?? t('common.notAvailable')}
      </span>
    </div>
  )
}

const LEVEL_COLORS: Record<string, string> = {
  MASTER:
    'bg-blue-100/80 text-blue-900 border border-blue-200/50 dark:bg-blue-900/30 dark:text-blue-200',
  DOCTORANT:
    'bg-violet-100/80 text-violet-900 border border-violet-200/50 dark:bg-violet-900/30 dark:text-violet-200',
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function StudentDetailPage() {
  const { studentId } = useParams<{ studentId: string }>()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const { data: student, isLoading, isError } = useStudent(studentId)

  const INSTITUTION_LABEL = useMemo(
    () => ({
      ESI: t('students.institution.ESI'),
      EXTERNE: t('students.institution.EXTERNE'),
    }),
    [t],
  )

  const LEVEL_LABEL = useMemo(
    () => ({
      MASTER: t('students.level.MASTER'),
      DOCTORANT: t('students.level.DOCTORANT'),
    }),
    [t],
  )

  if (isLoading) {
    return (
      <div className='mx-auto max-w-3xl space-y-4'>
        <Card className='overflow-hidden'>
          <div className='bg-primary/5 px-6 py-7'>
            <div className='flex items-center gap-5'>
              <div className='size-20 animate-pulse rounded-full bg-muted' />
              <div className='space-y-2.5 flex-1'>
                <div className='h-7 w-48 animate-pulse rounded-md bg-muted' />
                <div className='h-4 w-64 animate-pulse rounded-md bg-muted' />
              </div>
            </div>
          </div>
        </Card>
        <div className='grid gap-4 lg:grid-cols-3'>
          <Card className='lg:col-span-2'>
            <CardContent className='space-y-4 pt-6'>
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className='h-9 animate-pulse rounded-md bg-muted'
                />
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardContent className='space-y-4 pt-6'>
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className='h-9 animate-pulse rounded-md bg-muted'
                />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (isError || !student) {
    return (
      <div className='mx-auto max-w-3xl'>
        <Card className='border-destructive/40 bg-destructive/5'>
          <CardContent className='flex flex-col items-center gap-3 py-12 text-center'>
            <div className='flex size-12 items-center justify-center rounded-full bg-destructive/10'>
              <GraduationCap className='size-6 text-destructive' />
            </div>
            <p className='text-sm font-medium text-destructive'>
              {t('students.detail.notFound')}
            </p>
            <Button variant='outline' size='sm' onClick={() => navigate(-1)}>
              <ArrowLeft className='mr-2 size-4' />
              {t('students.detail.back')}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const initials = getInitials(student.firstName, student.lastName)
  const fullName = `${student.firstName} ${student.lastName}`
  const nbSupervisions = Array.isArray(student.supervisions)
    ? student.supervisions.length
    : 0
  const levelColorClass =
    LEVEL_COLORS[student.level ?? ''] ?? 'bg-muted text-foreground'
  const supervisionsPath = `/assistant/supervisions?student=${student.id}`
  const editPath = getAssistantStudentEditPath(studentId!)
  const studentsPath = getAssistantStudentsPath()

  return (
    <div className='mx-auto max-w-3xl space-y-4'>
      {/* ── Breadcrumb ────────────────────────────────────────────────────── */}
      <nav className='flex items-center gap-1.5 text-xs text-muted-foreground'>
        <Link
          to={studentsPath}
          className='hover:text-foreground transition-colors'
        >
          {t('students.detail.breadcrumb')}
        </Link>
        <ChevronRight className='size-3 shrink-0' />
        <span className='text-foreground font-medium truncate max-w-xs'>
          {fullName}
        </span>
      </nav>

      {/* ── Hero banner ─────────────────────────────────────────────────── */}
      <Card className='overflow-hidden'>
        <div className='bg-linear-to-br from-primary/10 via-primary/5 to-transparent px-6 py-7'>
          <div className='flex flex-wrap items-center gap-5'>
            <div className='flex size-20 shrink-0 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground shadow-primary'>
              {initials}
            </div>
            <div className='flex-1 min-w-0'>
              <h1 className='text-2xl font-bold tracking-tight text-foreground truncate'>
                {fullName}
              </h1>
              <div className='mt-2 flex flex-wrap items-center gap-2'>
                {student.email && (
                  <span className='inline-flex items-center gap-1 text-xs text-muted-foreground'>
                    <Mail className='size-3' />
                    {student.email}
                  </span>
                )}
                <span className='inline-flex items-center gap-1 rounded-md border border-border bg-card px-2 py-0.5 text-xs font-medium text-foreground'>
                  <Building2 className='size-3' />
                  {(INSTITUTION_LABEL[student.institution] ??
                    student.institution) ||
                    t('common.notAvailable')}
                </span>
                <span
                  className={cn(
                    'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium',
                    levelColorClass,
                  )}
                >
                  {(LEVEL_LABEL[student.level] ?? student.level) ||
                    t('common.notAvailable')}
                </span>
                <Badge variant='secondary' className='gap-1 tabular'>
                  <BookOpen className='size-3' />
                  {nbSupervisions} {t('students.detail.supervision')}
                  {nbSupervisions !== 1 ? 's' : ''}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* ── Asymmetric info grid — personal (wide) + academic (narrow) ──── */}
      <div className='grid gap-4 lg:grid-cols-3'>
        {/* Personal info — spans 2 cols */}
        <Card className='border-l-4 border-l-primary lg:col-span-2'>
          <CardHeader className='pb-3'>
            <div className='flex items-center gap-2'>
              <div className='flex size-7 items-center justify-center rounded-md bg-primary/10'>
                <GraduationCap className='size-4 text-primary' />
              </div>
              <span className='text-sm font-semibold text-foreground'>
                {t('students.detail.personalInfo')}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-2 gap-x-6 gap-y-4'>
              <InfoField
                label={t('students.detail.firstName')}
                value={student.firstName}
              />
              <InfoField
                label={t('students.detail.lastName')}
                value={student.lastName}
              />
              <div className='col-span-2'>
                <div className='h-px bg-border mb-4' />
                <InfoField
                  label={t('common.email')}
                  value={student.email}
                  icon={Mail}
                />
              </div>
              <InfoField
                label={t('students.detail.addedOn')}
                value={fmt(
                  student.createdAt,
                  i18n.language || undefined,
                  t('common.notAvailable'),
                )}
                icon={Calendar}
              />
              <InfoField
                label={t('students.detail.supervisions')}
                value={String(nbSupervisions)}
                icon={ListOrdered}
              />
            </div>
          </CardContent>
        </Card>

        {/* Academic info — 1 col */}
        <Card className='bg-muted/30 border border-border'>
          <CardHeader className='pb-3'>
            <div className='flex items-center gap-2'>
              <div className='flex size-7 items-center justify-center rounded-md bg-primary/10'>
                <BookOpen className='size-4 text-primary' />
              </div>
              <span className='text-sm font-semibold text-foreground'>
                {t('students.detail.academicInfo')}
              </span>
            </div>
          </CardHeader>
          <CardContent className='space-y-4'>
            <InfoField
              label={t('students.detail.institution')}
              value={
                INSTITUTION_LABEL[student.institution] ?? student.institution
              }
              icon={Building2}
            />
            <div className='h-px bg-border' />
            <InfoField
              label={t('students.detail.level')}
              value={LEVEL_LABEL[student.level] ?? student.level}
            />
            <div className='h-px bg-border' />
            <InfoField
              label={t('students.detail.specialty')}
              value={student.specialty || t('common.notAvailable')}
            />
            <div className='h-px bg-border' />
            <div className='flex flex-col gap-0.5'>
              <span className='text-xs font-semibold text-muted-foreground'>
                ID
              </span>
              <span
                className='flex items-center gap-1 text-xs font-mono text-muted-foreground truncate'
                title={student.id}
              >
                <Hash className='size-3 shrink-0' />
                {student.id}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Sticky action bar ─────────────────────────────────────────────── */}
      <div className='sticky bottom-0 -mx-6 border-t border-border bg-card/80 backdrop-blur-sm px-6 py-3'>
        <div className='mx-auto flex max-w-3xl flex-wrap items-center gap-3'>
          <Button
            variant='ghost'
            onClick={() => navigate(-1)}
            className='gap-2'
          >
            <ArrowLeft className='size-4' />
            {t('students.detail.back')}
          </Button>
          <div className='flex-1' />
          <Link
            to={supervisionsPath}
            className={cn(buttonVariants({ variant: 'outline' }), 'gap-2')}
          >
            <ListOrdered className='size-4' />
            {t('students.detail.supervisions')}
          </Link>
          <Link to={editPath} className={cn(buttonVariants(), 'gap-2')}>
            <Pencil className='size-4' />
            {t('students.detail.edit')}
          </Link>
        </div>
      </div>
    </div>
  )
}
