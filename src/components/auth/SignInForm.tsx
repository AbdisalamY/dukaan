// src/components/auth/SignInForm.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Eye, EyeOff } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { LoadingStates } from '@/components/common/LoadingSpinner'
import { useAuthState } from '@/hooks/auth-hooks'

const signInSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
})

type SignInFormValues = z.infer<typeof signInSchema>

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false)
  const { signIn, isSigningIn, error } = useAuthState()

  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (data: SignInFormValues) => {
    signIn(data)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-black mb-2">Welcome back</h1>
        <p className="text-gray-600">Sign in to your Teke Teke account</p>
      </div>

      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
          {error}
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold text-black">Email Address</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    placeholder="Enter your email"
                    className="bg-white border-2 border-pink-200 rounded-2xl px-6 py-5 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all duration-200 text-lg"
                    disabled={isSigningIn}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold text-black">Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      {...field}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      className="bg-white border-2 border-pink-200 rounded-2xl px-6 py-5 pr-12 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all duration-200 text-lg"
                      disabled={isSigningIn}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      disabled={isSigningIn}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link
                href="/forgot-password"
                className="text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Forgot your password?
              </Link>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-12 rounded-full bg-[#0d0c22] hover:bg-[#565564] text-white font-bold text-base transition-all duration-200"
            disabled={isSigningIn}
          >
            {isSigningIn ? (
              <div className="flex items-center">
                <LoadingStates.Button size="sm" />
                <span className="ml-2">Signing In...</span>
              </div>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>
      </Form>

      <div className="text-center text-sm">
        <p className="text-gray-500">
          Don't have an account?{' '}
          <Link href="/sign-up" className="text-indigo-600 hover:text-indigo-800 font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}