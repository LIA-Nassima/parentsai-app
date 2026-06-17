import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  if (!body?.enfant || !body?.token) {
    return NextResponse.json({ ok: false }, { status: 400 })
  }
  const { enfant, token } = body

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data } = await supabase
    .from('familles')
    .select('access_token, classe')
    .ilike('enfant', enfant)
    .single()

  if (!data?.access_token || data.access_token !== token) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  // On renvoie la classe ici (source sûre, vérifiée par le jeton) pour que la
  // page enfant n'ait plus besoin d'appeler /api/familles (qui listait tout).
  return NextResponse.json({ ok: true, classe: data.classe ?? '' })
}
