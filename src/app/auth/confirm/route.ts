import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { EmailOtpType } from '@supabase/supabase-js'

// Valide un lien e-mail (réinitialisation de mot de passe, etc.) via token_hash —
// indépendant de l'appareil, contrairement au flux PKCE. Pose la session en
// cookie puis redirige vers `next` (par défaut la page mot de passe).
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type       = searchParams.get('type') as EmailOtpType | null
  const next       = searchParams.get('next') ?? '/update-password'

  if (token_hash && type) {
    const response = NextResponse.redirect(`${origin}${next}`)
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return request.cookies.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options))
          },
        },
      },
    )
    const { error } = await supabase.auth.verifyOtp({ type, token_hash })
    if (!error) return response
  }

  // Lien invalide, expiré ou déjà utilisé
  return NextResponse.redirect(`${origin}/update-password?erreur=lien`)
}
