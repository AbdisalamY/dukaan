// app/auth/callback/route.ts
import { createClient } from '@/utils/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data.user) {
      // Check user's role to determine redirect destination
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      // Redirect based on user role
      if (profile?.role === 'admin') {
        return NextResponse.redirect(`${origin}/admin/dashboard`)
      } else {
        return NextResponse.redirect(`${origin}/shop/dashboard`)
      }
    }
  }

  // ✅ Redirect to error page if something went wrong
  return NextResponse.redirect(`${origin}/auth/error`)
}
