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

  // On résout la famille par son TOKEN (unique) et non par le prénom : deux
  // familles peuvent avoir un enfant homonyme, le token seul les distingue.
  const { data } = await supabase
    .from('familles')
    .select('id, enfant, access_token, classe')
    .eq('access_token', token)
    .maybeSingle()

  // Le token doit exister ET correspondre au prénom demandé dans l'URL.
  if (!data || data.enfant.toLowerCase() !== String(enfant).toLowerCase()) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  // On renvoie la classe et l'identifiant famille (source sûre, scellée par le
  // jeton) : la page enfant isole ainsi ses sessions par famille_id.
  return NextResponse.json({ ok: true, classe: data.classe ?? '', famille_id: data.id })
}
