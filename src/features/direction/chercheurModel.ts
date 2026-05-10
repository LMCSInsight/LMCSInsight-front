/** Chercheur / encadrement model — aligns with `/v1/chercheurs` + derived supervision stats */

export type Qualite =
  | 'Professeur'
  | 'Maitre_de_conferences'
  | 'Maitre_assistant'
  | 'Attache_temporaire'

export type GradeRecherche =
  | 'Directeur_de_recherche'
  | 'Maitre_de_recherche'
  | 'Charge_de_recherche'
  | 'Attache_de_recherche'

export type StatutChercheur = 'Actif' | 'Inactif' | 'Retraite'

export const QUALITES: Qualite[] = [
  'Professeur',
  'Maitre_de_conferences',
  'Maitre_assistant',
  'Attache_temporaire',
]

export const STATUTS: StatutChercheur[] = ['Actif', 'Inactif', 'Retraite']

export const GRADES: GradeRecherche[] = [
  'Directeur_de_recherche',
  'Maitre_de_recherche',
  'Charge_de_recherche',
  'Attache_de_recherche',
]

export const QUALITE_LABELS: Record<Qualite, string> = {
  Professeur: 'Professeur',
  Maitre_de_conferences: 'Maître de conférences',
  Maitre_assistant: 'Maître assistant',
  Attache_temporaire: 'Attaché temporaire',
}

export const STATUT_LABELS: Record<StatutChercheur, string> = {
  Actif: 'Actif',
  Inactif: 'Inactif',
  Retraite: 'Retraité',
}

export const GRADE_LABELS: Record<GradeRecherche, string> = {
  Directeur_de_recherche: 'Directeur de recherche',
  Maitre_de_recherche: 'Maître de recherche',
  Charge_de_recherche: 'Chargé de recherche',
  Attache_de_recherche: 'Attaché de recherche',
}

export interface ChercheurRow {
  chercheur_id: string
  nom_complet: string
  mails: string[]
  tel?: string
  diplome?: string
  etablissement_origine?: string
  qualite: Qualite
  grade_recherche?: GradeRecherche
  statut: StatutChercheur
  hindex: number
  totalEncadrements: number
  enCours: number
  enAttente: number
  termine: number
  pfe: number
  master: number
  doctorat: number
  stage: number
  equipe: string
  /** Dominant academic year among this researcher’s supervisions (or "—"). */
  periodeFocus: string
}
