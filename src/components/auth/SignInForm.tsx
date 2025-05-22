// src/components/auth/SignInForm.tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
// ... other imports 

export default function SignInForm() {
  const { signIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // ... form setup code

  async function onSubmit(data: SignInFormValues) {
    setIsLoading(true);
    setError(null);
    
    const result = await signIn(data.email, data.password);
    
    if (!result.success) {
      setError(result.error || 'Sign in failed');
      setIsLoading(false);
    }
    // Successful sign-in is handled by the auth context through redirection
  }

  // ... rendering code
}