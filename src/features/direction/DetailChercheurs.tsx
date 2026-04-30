import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Mail,
  GraduationCap,
  Globe,
  BookOpen,
  Users,
  Hash,
  Loader2,
  ChevronLeft,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { useChercheurs } from '@/features/chercheurs/hooks'
import { useSupervisions } from '@/features/supervisions/hooks/useSupervisions'
import {
  QUALITE_LABELS,
  GRADE_LABELS,
} from '@/features/direction/chercheurModel'
import {
  workloadStatsForChercheur,
  normalizeQualite,
  normalizeGrade,
} from '@/features/direction/lib/workloadFromSupervisions'
import {
  DIRECTOR_CHERCHEURS_LIMIT,
  DIRECTOR_SUPERVISIONS_LIMIT,
} from '@/features/direction/lib/directorFetchLimits'
import { AdminEmptyStatePanel } from '@/features/admin/components'

function ReadField({
  label,
  value,
  href,
}: {
  label: string
  value?: string | null
  href?: string
}) {
  return (
    <div className='mb-4 space-y-1'>
      <Label className='text-[11px] font-normal uppercase tracking-wider text-muted-foreground'>
        {label}
      </Label>
      {href && value ? (
        <a
          href={href}
          target='_blank'
          rel='noopener noreferrer'
          className='block break-all rounded-md bg-muted/50 px-2.5 py-1.5 text-sm font-medium text-primary hover:underline'
        >
          {value}
        </a>
      ) : (
        <p className='min-h-8 rounded-md bg-muted/50 px-2.5 py-1.5 text-sm text-foreground'>
          {value ?? '—'}
        </p>
      )}
    </div>
  )
}

function StatutBadge({ statut }: { statut: string }) {
  const variant: Record<
    string,
    'default' | 'secondary' | 'destructive' | 'outline'
  > = {
    Actif: 'default',
    Inactif: 'destructive',
    Retraite: 'secondary',
  }
  const labels: Record<string, string> = {
    Actif: 'Actif',
    Inactif: 'Inactif',
    Retraite: 'Retraité',
  }
  return (
    <Badge variant={variant[statut] ?? 'outline'} className='font-medium'>
      {labels[statut] ?? statut}
    </Badge>
  )
}

export default function DetailChercheur() {
  const { t } = useTranslation()
  const { chercheurId } = useParams<{ chercheurId: string }>()
  const navigate = useNavigate()

  const {
    data: chercheursPage,
    isLoading: chercheursLoading,
    isError: chercheursError,
  } = useChercheurs({ page: 1, limit: DIRECTOR_CHERCHEURS_LIMIT })
  const {
    data: supervisionsPage,
    isLoading: supervisionsLoading,
    isError: supervisionsError,
  } = useSupervisions({ page: 1, limit: DIRECTOR_SUPERVISIONS_LIMIT })

  const chercheurs = chercheursPage?.data ?? []
  const supervisions = supervisionsPage?.data ?? []

  const chercheur = useMemo(
    () => chercheurs.find((c) => c.chercheur_id === chercheurId),
    [chercheurs, chercheurId],
  )

  const stats = useMemo(
    () =>
      chercheurId ? workloadStatsForChercheur(chercheurId, supervisions) : null,
    [chercheurId, supervisions],
  )

  const loading = chercheursLoading || supervisionsLoading
  const failed = chercheursError || supervisionsError

  if (loading) {
    return (
      <div className='flex min-h-[40vh] items-center justify-center'>
        <Loader2
          className='size-8 animate-spin text-muted-foreground'
          aria-hidden
        />
      </div>
    )
  }

  if (failed) {
    return (
      <AdminEmptyStatePanel
        title={t(
          'director.researcherDetail.loadErrorTitle',
          'Profil indisponible',
        )}
        description={t(
          'director.researcherDetail.loadErrorHint',
          'Impossible de charger les données du chercheur.',
        )}
        icon={Users}
      />
    )
  }

  if (!chercheur || !stats) {
    return (
      <AdminEmptyStatePanel
        title={t(
          'director.researcherDetail.notFoundTitle',
          'Chercheur introuvable',
        )}
        description={t(
          'director.researcherDetail.notFoundHint',
          'Vérifiez l’identifiant ou retournez à la liste.',
        )}
        icon={Users}
      />
    )
  }

  const qualiteLabel = QUALITE_LABELS[normalizeQualite(chercheur.qualite)]
  const gradeNorm = normalizeGrade(chercheur.grade_recherche)
  const gradeLabel = gradeNorm ? GRADE_LABELS[gradeNorm] : null
  const teamLine = chercheur.teams?.map((x) => x.name).join(', ') || '—'

  const initial =
    chercheur.nom_complet
      .replace(/^(Dr\.|Pr\.)\s*/i, '')
      .trim()[0]
      ?.toUpperCase() ?? '?'

  /** Liste `/v1/chercheurs` sans champ statut — affichage par défaut jusqu’à extension API */
  const statutChercheur = 'Actif'
  const statutLabel = 'Actif'

  return (
    <div className='space-y-10'>
      <div className='flex flex-wrap items-center gap-3'>
        <Button
          type='button'
          variant='ghost'
          size='sm'
          className='-ml-2 gap-1.5 text-muted-foreground transition-colors hover:text-foreground'
          onClick={() => navigate(-1)}
        >
          <ChevronLeft className='size-4 shrink-0' aria-hidden />
          {t('common.back')}
        </Button>
      </div>

      <Card className='overflow-hidden rounded-2xl border-border/60 bg-linear-to-b from-card to-muted/20 shadow-primary-sm dark:from-card dark:to-card dark:shadow-none'>
        <CardContent className='flex flex-col gap-6 pt-6 sm:flex-row sm:items-start'>
          <div className='flex size-16 shrink-0 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground'>
            {initial}
          </div>
          <div className='min-w-0 flex-1 space-y-2'>
            <div className='flex flex-wrap items-center gap-2'>
              <h1 className='text-balance text-2xl font-semibold tracking-tight text-foreground'>
                {chercheur.nom_complet}
              </h1>
              <StatutBadge statut={statutChercheur} />
            </div>
            <p className='text-sm text-muted-foreground'>
              {qualiteLabel}
              {gradeLabel ? ` · ${gradeLabel}` : ''} · {teamLine}
            </p>
          </div>
          <div className='flex flex-wrap gap-6 sm:justify-end'>
            {[
              {
                label: t('director.researcherDetail.statsTotal'),
                value: stats.totalEncadrements,
              },
              {
                label: t('director.researcherDetail.statsProgress'),
                value: stats.enCours,
              },
              {
                label: t('director.researcherDetail.statsDone'),
                value: stats.termine,
              },
            ].map((s) => (
              <div key={s.label} className='text-center'>
                <p className='text-2xl font-bold tabular-nums text-foreground'>
                  {s.value}
                </p>
                <p className='text-xs text-muted-foreground'>{s.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <section className='rounded-2xl border border-border/50 bg-card/40 p-5 sm:p-6 dark:bg-card/30'>
        <h2 className='mb-4 flex items-center gap-2 text-sm font-semibold tracking-tight text-foreground'>
          <Hash className='size-4 text-muted-foreground' aria-hidden />
          {t('director.researcherDetail.sectionId')}
        </h2>
        <div className='grid gap-4 sm:grid-cols-3'>
          <ReadField
            label={t('director.researcherDetail.fieldId')}
            value={chercheur.chercheur_id}
          />
          <ReadField
            label={t('director.researcherDetail.fieldName')}
            value={chercheur.nom_complet}
          />
          <ReadField
            label={t('director.researcherDetail.fieldStatus')}
            value={statutLabel}
          />
        </div>
      </section>

      <section className='rounded-2xl border border-border/50 bg-card/40 p-5 sm:p-6 dark:bg-card/30'>
        <h2 className='mb-4 flex items-center gap-2 text-sm font-semibold tracking-tight text-foreground'>
          <Mail className='size-4 text-muted-foreground' aria-hidden />
          {t('director.researcherDetail.sectionContact')}
        </h2>
        <div className='grid gap-4 sm:grid-cols-2'>
          <div className='mb-4 space-y-1'>
            <Label className='text-[11px] font-normal uppercase tracking-wider text-muted-foreground'>
              {t('director.researcherDetail.fieldEmails')}
            </Label>
            <div className='space-y-1'>
              {chercheur.mails.length > 0 ? (
                chercheur.mails.map((mail) => (
                  <p
                    key={mail}
                    className='rounded-md bg-muted/50 px-2.5 py-1.5 text-sm text-foreground'
                  >
                    {mail}
                  </p>
                ))
              ) : (
                <p className='text-sm text-muted-foreground'>—</p>
              )}
            </div>
          </div>
          <ReadField
            label={t('director.researcherDetail.fieldPhone')}
            value={undefined}
          />
        </div>
      </section>

      <section className='rounded-2xl border border-border/50 bg-card/40 p-5 sm:p-6 dark:bg-card/30'>
        <h2 className='mb-4 flex items-center gap-2 text-sm font-semibold tracking-tight text-foreground'>
          <GraduationCap className='size-4 text-muted-foreground' aria-hidden />
          {t('director.researcherDetail.sectionAcademic')}
        </h2>
        <div className='grid gap-4 sm:grid-cols-2'>
          <ReadField
            label={t('director.researcherDetail.fieldDiploma')}
            value={undefined}
          />
          <ReadField
            label={t('director.researcherDetail.fieldInstitution')}
            value={undefined}
          />
        </div>
      </section>

      <section className='rounded-2xl border border-border/50 bg-card/40 p-5 sm:p-6 dark:bg-card/30'>
        <h2 className='mb-4 flex items-center gap-2 text-sm font-semibold tracking-tight text-foreground'>
          <Users className='size-4 text-muted-foreground' aria-hidden />
          {t('director.researcherDetail.sectionClassification')}
        </h2>
        <div className='grid gap-4 sm:grid-cols-3'>
          <ReadField
            label={t('director.researcherDetail.fieldQuality')}
            value={qualiteLabel}
          />
          <ReadField
            label={t('director.researcherDetail.fieldGrade')}
            value={gradeLabel ?? undefined}
          />
          <ReadField
            label={t('director.researcherDetail.fieldTeams', 'Équipes')}
            value={teamLine}
          />
        </div>
      </section>

      <section className='rounded-2xl border border-border/50 bg-card/40 p-5 sm:p-6 dark:bg-card/30'>
        <h2 className='mb-4 flex items-center gap-2 text-sm font-semibold tracking-tight text-foreground'>
          <BookOpen className='size-4 text-muted-foreground' aria-hidden />
          {t('director.researcherDetail.sectionSupervisions')}
        </h2>
        <div className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
          {[
            {
              label: t('director.researcherDetail.statsTotal'),
              value: stats.totalEncadrements,
            },
            {
              label: t('director.researcherDetail.statsInProgress'),
              value: stats.enCours,
            },
            {
              label: t('director.researcherDetail.statsPending'),
              value: stats.enAttente,
            },
            {
              label: t('director.researcherDetail.statsDone'),
              value: stats.termine,
            },
          ].map((s) => (
            <Card
              key={s.label}
              className='rounded-xl border-border/60 shadow-none'
            >
              <CardContent className='py-4 text-center'>
                <p className='text-2xl font-bold tabular-nums text-foreground'>
                  {s.value}
                </p>
                <p className='mt-1 text-xs text-muted-foreground'>{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className='mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4'>
          {[
            {
              label: t('director.researcherDetail.typePfe'),
              value: stats.pfe,
            },
            {
              label: t('director.researcherDetail.typeMaster'),
              value: stats.master,
            },
            {
              label: t('director.researcherDetail.typePhd'),
              value: stats.doctorat,
            },
            {
              label: t('director.researcherDetail.typeInternship'),
              value: stats.stage,
            },
          ].map((s) => (
            <Card
              key={s.label}
              className='rounded-xl border-border/50 bg-muted/25 shadow-none'
            >
              <CardContent className='py-3 text-center'>
                <p className='text-xl font-bold tabular-nums text-foreground'>
                  {s.value}
                </p>
                <p className='mt-0.5 text-[11px] text-muted-foreground'>
                  {s.label}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className='rounded-2xl border border-border/50 bg-card/40 p-5 sm:p-6 dark:bg-card/30'>
        <h2 className='mb-4 flex items-center gap-2 text-sm font-semibold tracking-tight text-foreground'>
          <Globe className='size-4 text-muted-foreground' aria-hidden />
          {t('director.researcherDetail.sectionOnline')}
        </h2>
        <div className='grid gap-4 sm:grid-cols-2'>
          <ReadField label='DBLP' />
          <ReadField label='Google Scholar' />
          <ReadField label='ResearchGate' />
          <ReadField label={t('director.researcherDetail.fieldPersonalSite')} />
        </div>
      </section>
    </div>
  )
}
