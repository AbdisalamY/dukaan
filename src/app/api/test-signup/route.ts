import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName } = await request.json();
    
    console.log('Test signup attempt:', { email, firstName, lastName });
    
    const supabase = await createClient();
    
    const { data: authData, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: `${firstName} ${lastName}`,
          email: email,
        },
      },
    });

    console.log('Signup result:', { authData, error });

    if (error) {
      return NextResponse.json({ 
        success: false, 
        error: error.message,
        details: error 
      }, { status: 400 });
    }

    // Check if user was created in auth.users
    if (authData.user) {
      console.log('User created in auth.users:', authData.user.id);
      
      // Check if profile was created
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();
        
      console.log('Profile check:', { profile, profileError });
      
      return NextResponse.json({ 
        success: true, 
        user: authData.user,
        profile: profile,
        profileError: profileError?.message
      });
    }

    return NextResponse.json({ 
      success: false, 
      error: 'No user data returned' 
    }, { status: 400 });

  } catch (error) {
    console.error('Test signup error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
