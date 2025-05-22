// src/components/auth/SignUpForm.tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
// ... other imports

export default function SignUpForm({ initialEmail = "", onBack }: SignUpFormProps) {
  const { signUp } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // ... form setup code

  async function onSubmit(data: SignUpFormValues) {
    setIsLoading(true);
    setError(null);
    
    const result = await signUp(
      data.email, 
      data.password, 
      data.fullName, 
      data.username
    );
    
    if (!result.success) {
      setError(result.error || 'Sign up failed');
      setIsLoading(false);
    } else {
      // Show success message or redirect
    }
  }

  // ... rendering code
}