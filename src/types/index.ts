export interface ExerciceQCM {
  num: number
  type: 'qcm'
  badge_type: string
  badge_label: string
  enonce: string
  reponses: string[]
  correct: number
  correction: string
  piege: string
  metacog: string
}

export interface ExerciceProbleme {
  num: number
  type: 'probleme'
  badge_type: string
  badge_label: string
  contexte: string
  points?: number
  questions: { lettre: string; enonce: string; points?: number; correction: string }[]
  metacog: string
}

export type Exercice = ExerciceQCM | ExerciceProbleme

export interface ExercicesData {
  niveau: string
  duree_estimee: string
  encouragement: string
  competences: string[]
  points_vigilance: string
  exercices: Exercice[]
  // Champs DS / Brevet Blanc (optionnels, absents pour les sessions classiques)
  type_evaluation?: 'session' | 'ds' | 'brevet_blanc'
  titre?: string
  bareme_total?: number
  calculatrice?: boolean
}

export interface Session {
  id: string
  enfant: string
  matiere: string
  chapitre: string
  numero_session: number
  nb_qcm: number
  nb_problemes: number
  html_enfant_url: string
  html_parent_url: string
  statut: 'en_attente' | 'fait' | 'validé'
  type_evaluation?: 'session' | 'ds' | 'brevet_blanc'
  created_at: string
  exercices_json?: ExercicesData
}

export interface Reponse {
  id: string
  session_id: string
  exercice_num: number
  type: 'qcm' | 'probleme'
  reponse_index: number | null
  est_correct: boolean | null
  est_termine: boolean | null
  photo_url: string | null
}

export interface Famille {
  id: string
  enfant: string
  tel_enfant: string
  tel_parent: string
}

export interface SessionAvecStats extends Session {
  qcm_juste: number
  qcm_total: number
  pb_termine: number
}

export interface JourPlanning {
  date: string             // YYYY-MM-DD
  jour: 'lundi' | 'mardi' | 'mercredi' | 'jeudi' | 'vendredi' | 'samedi' | 'dimanche'
  type: 'session' | 'repos'
  matiere?: string
  chapitre?: string
  duree_min?: number
  raison?: string
}

export interface PlanningData {
  semaine_debut: string    // YYYY-MM-DD (lundi)
  focus: string
  points_vigilance: string
  jours: JourPlanning[]
}

export interface Planning {
  id: string
  enfant: string
  semaine_debut: string
  planning_json: PlanningData
  created_at: string
}
