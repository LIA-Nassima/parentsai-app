// Utilitaires de gestion des semaines (lundi → dimanche), en heure locale.

// Formate une Date en YYYY-MM-DD (heure locale, évite le décalage UTC)
export function toLocalISO(d: Date): string {
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-')
}

// Lundi de la semaine en cours (YYYY-MM-DD)
export function lundiCourant(): string {
  return lundiDeLaDate(new Date())
}

// Lundi de la semaine contenant une date donnée (Date ou ISO string)
export function lundiDeLaDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : new Date(date)
  const jourSem = d.getDay() // 0=dim, 1=lun, ...
  const decalage = jourSem === 0 ? -6 : 1 - jourSem
  d.setDate(d.getDate() + decalage)
  return toLocalISO(d)
}

// Décale une semaine de N (renvoie le lundi en YYYY-MM-DD)
export function decalerSemaine(lundiIso: string, deltaSemaines: number): string {
  const d = new Date(lundiIso + 'T00:00:00')
  d.setDate(d.getDate() + deltaSemaines * 7)
  return toLocalISO(d)
}

// "15 juin"
export function formaterSemaine(lundiIso: string): string {
  const d = new Date(lundiIso + 'T00:00:00')
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })
}

// Vrai si la date de création tombe dans la semaine commençant à lundiIso
export function dansLaSemaine(dateCreation: string, lundiIso: string): boolean {
  const jour = dateCreation.slice(0, 10) // YYYY-MM-DD
  return jour >= lundiIso && jour < decalerSemaine(lundiIso, 1)
}

// Vrai si lundiIso est la semaine en cours
export function estSemaineCourante(lundiIso: string): boolean {
  return lundiIso === lundiCourant()
}
