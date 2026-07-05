export interface ExerciceQCM {
  num: number
  type: 'qcm'
  badge_type: string
  badge_label: string
  enonce: string
  figure?: string        // SVG optionnel (figure géométrique, graphique, schéma)
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
  figure?: string        // SVG optionnel (figure géométrique, graphique, schéma)
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

// ─── Fiche de révision (type_evaluation === 'fiche') ───────────────────────────
// Une fiche = un titre + une liste de blocs typés (le bloc "plan" est obligatoire).

export interface FicheItem {
  date?: string
  evenement?: string
  terme?: string
  definition?: string
  nom?: string
  role?: string
  formule?: string
  usage?: string
  enonce?: string
}

export interface FicheBloc {
  type: string          // intro, vocabulaire, seance, schema, recap, plan, methode… (ouvert)
  titre?: string
  contenu?: string      // texte structuré (retours à la ligne \n, puces) — champ principal
  figure?: string       // SVG optionnel (schéma, graphique)
  piege?: string        // encadré "piège à éviter" (optionnel)
  metacog?: string      // conseil méthode (optionnel)
  // Champs structurés hérités (rendus en secours si "contenu" absent)
  texte?: string
  description?: string
  note?: string
  etapes?: string[]
  parties?: { titre: string; points: string[] }[]
  items?: (string | FicheItem)[]
}

export interface FicheData {
  type_evaluation: 'fiche'
  titre: string
  niveau?: string
  problematique?: string
  blocs: FicheBloc[]
}

export interface Correction {
  note: number
  note_sur: number
  appreciation: string
  commentaires: { exercice: number; commentaire: string }[]
  corrige_le: string
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
  statut: 'en_attente' | 'fait' | 'validé' | 'fiche'
  type_evaluation?: 'session' | 'ds' | 'brevet_blanc' | 'fiche'
  created_at: string
  exercices_json?: ExercicesData
  correction_json?: Correction
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
  enfant: string
  classe: string
  profs_configures: string[]  // matières dont le template a été copié dans Claude.ai
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
