import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Seul ce compte peut consulter le tableau de bord. Surchargeable via env ADMIN_EMAIL.
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'n_hamzaoui@yahoo.fr').toLowerCase()

const JOUR = 86_400_000

export async function GET(req: NextRequest) {
  // 1) On exige le jeton de session de l'appelant
  const auth  = req.headers.get('authorization') || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
  if (!token) return NextResponse.json({ ok: false }, { status: 401 })

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  // 2) On vérifie que le jeton appartient bien à l'admin AVANT toute lecture
  const { data: userData } = await supabase.auth.getUser(token)
  const email = userData?.user?.email?.toLowerCase()
  if (!email || email !== ADMIN_EMAIL) {
    return NextResponse.json({ ok: false }, { status: 403 })
  }

  // 3) Lecture globale (service_role contourne la RLS — réservé à l'admin authentifié)
  const [{ data: familles }, { data: sessions }] = await Promise.all([
    supabase.from('familles').select('id, enfant, classe, parent_id, created_at').order('created_at', { ascending: false }),
    supabase.from('sessions').select('famille_id, created_at'),
  ])
  const fam  = familles || []
  const sess = sessions || []

  // Comptes parents distincts / enfants
  const comptes   = new Set(fam.map(f => f.parent_id).filter(Boolean)).size
  const nbEnfants = fam.length

  // Répartition par classe
  const parClasse: Record<string, number> = {}
  for (const f of fam) {
    const c = f.classe || '—'
    parClasse[c] = (parClasse[c] || 0) + 1
  }

  // Nouvelles inscriptions par jour (30 derniers jours)
  const byDay: Record<string, number> = {}
  for (const f of fam) {
    if (!f.created_at) continue
    const key = new Date(f.created_at).toISOString().slice(0, 10)
    byDay[key] = (byDay[key] || 0) + 1
  }
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const jours: { date: string; label: string; count: number }[] = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today.getTime() - i * JOUR)
    const key = d.toISOString().slice(0, 10)
    jours.push({
      date: key,
      label: d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
      count: byDay[key] || 0,
    })
  }
  const nouveaux7  = jours.slice(-7).reduce((a, j) => a + j.count, 0)
  const nouveaux30 = jours.reduce((a, j) => a + j.count, 0)

  // Familles actives (≥ 1 session récente)
  const now = Date.now()
  const actives7 = new Set<string>()
  const actives30 = new Set<string>()
  for (const s of sess) {
    if (!s.famille_id || !s.created_at) continue
    const age = now - new Date(s.created_at).getTime()
    if (age <= 7 * JOUR)  actives7.add(s.famille_id)
    if (age <= 30 * JOUR) actives30.add(s.famille_id)
  }

  // Dernières inscriptions
  const recentes = fam.slice(0, 12).map(f => ({
    enfant: f.enfant, classe: f.classe, date: f.created_at,
  }))

  return NextResponse.json({
    ok: true,
    comptes,
    nbEnfants,
    moyenne: comptes ? +(nbEnfants / comptes).toFixed(1) : 0,
    totalSessions: sess.length,
    actives7: actives7.size,
    actives30: actives30.size,
    nouveaux7,
    nouveaux30,
    parClasse,
    jours,
    recentes,
  })
}
