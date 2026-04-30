import type { ChercheurListItem } from '@/features/chercheurs/api'
import type { Supervision } from '@/features/supervisions/types'
import type {
  ChercheurRow,
  GradeRecherche,
  Qualite,
} from '@/features/direction/chercheurModel'
import { QUALITES, GRADES } from '@/features/direction/chercheurModel'

export function normalizeQualite(raw: string): Qualite {
  const q = raw?.trim()
  if (QUALITES.includes(q as Qualite)) return q as Qualite
  const lower = q?.toLowerCase() ?? ''
  if (lower.includes('prof')) return 'Professeur'
  if (lower.includes('conf')) return 'Maitre_de_conferences'
  if (lower.includes('maitre') || lower.includes('master'))
    return 'Maitre_assistant'
  return 'Attache_temporaire'
}

export function normalizeGrade(
  raw: string | null | undefined,
): GradeRecherche | undefined {
  if (!raw?.trim()) return undefined
  const g = raw.trim()
  if (GRADES.includes(g as GradeRecherche)) return g as GradeRecherche
  const lower = g.toLowerCase()
  if (lower.includes('directeur')) return 'Directeur_de_recherche'
  if (lower.includes('maitre') && lower.includes('recherche'))
    return 'Maitre_de_recherche'
  if (lower.includes('charge')) return 'Charge_de_recherche'
  if (lower.includes('attache')) return 'Attache_de_recherche'
  return undefined
}

function supervisionsForChercheur(
  cId: string,
  supervisions: Supervision[],
): Supervision[] {
  return supervisions.filter((s) =>
    (s.supervisors ?? []).some(
      (sup) => sup.supervisorId === cId || sup.supervisor?.chercheur_id === cId,
    ),
  )
}

/** Build workload rows by joining `/v1/chercheurs` with loaded supervisions. */
export function buildChercheurWorkloadRows(
  chercheurs: ChercheurListItem[],
  supervisions: Supervision[],
): ChercheurRow[] {
  return chercheurs.map((c) => {
    const mine = supervisionsForChercheur(c.chercheur_id, supervisions)
    let pfe = 0
    let master = 0
    let doctorat = 0
    let stage = 0
    let enCours = 0
    let enAttente = 0
    let termine = 0
    const yearCounts: Record<string, number> = {}
    for (const s of mine) {
      yearCounts[s.academicYear] = (yearCounts[s.academicYear] ?? 0) + 1
      switch (s.type) {
        case 'PFE':
          pfe++
          break
        case 'MASTER':
          master++
          break
        case 'PHD':
          doctorat++
          break
        case 'INTERNSHIP':
          stage++
          break
        default:
          break
      }
      if (s.status === 'IN_PROGRESS') enCours++
      if (s.validationStatus === 'PENDING') enAttente++
      if (s.status === 'DEFENDED') termine++
    }
    const topYear = Object.entries(yearCounts).sort(
      (a, b) => b[1] - a[1],
    )[0]?.[0]

    return {
      chercheur_id: c.chercheur_id,
      nom_complet: c.nom_complet,
      mails: c.mails?.length ? c.mails : [],
      qualite: normalizeQualite(c.qualite),
      grade_recherche: normalizeGrade(c.grade_recherche),
      statut: 'Actif',
      hindex: 0,
      totalEncadrements: mine.length,
      enCours,
      enAttente,
      termine,
      pfe,
      master,
      doctorat,
      stage,
      equipe: c.teams?.[0]?.name ?? '—',
      periodeFocus: topYear ?? '—',
    }
  })
}

/** Aggregated workload for one chercheur (detail page). */
export function workloadStatsForChercheur(
  chercheurId: string,
  supervisions: Supervision[],
) {
  const mine = supervisionsForChercheur(chercheurId, supervisions)
  const acc = {
    totalEncadrements: mine.length,
    enCours: 0,
    enAttente: 0,
    termine: 0,
    pfe: 0,
    master: 0,
    doctorat: 0,
    stage: 0,
  }
  for (const s of mine) {
    switch (s.type) {
      case 'PFE':
        acc.pfe++
        break
      case 'MASTER':
        acc.master++
        break
      case 'PHD':
        acc.doctorat++
        break
      case 'INTERNSHIP':
        acc.stage++
        break
      default:
        break
    }
    if (s.status === 'IN_PROGRESS') acc.enCours++
    if (s.validationStatus === 'PENDING') acc.enAttente++
    if (s.status === 'DEFENDED') acc.termine++
  }
  return acc
}
