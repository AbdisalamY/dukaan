// components/auth/SignUpInitial.tsx
"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const initialFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});

type InitialFormValues = z.infer<typeof initialFormSchema>;

interface SignUpInitialProps {
  onContinue: (email?: string) => void;
}

export default function SignUpInitial({ onContinue }: SignUpInitialProps) {
  const form = useForm<InitialFormValues>({
    resolver: zodResolver(initialFormSchema),
    defaultValues: {
      email: "",
    },
  });

  function onSubmit(data: InitialFormValues) {
    onContinue(data.email);
  }

  return (
    <div className="space-y-6 text-center">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Sign up to Teke Teke</h1>
      </div>
      <div className="mt-8">
        <div className="max-w-sm mx-auto space-y-4">
          <Button variant="default" className="w-full h-12 text-base font-semibold flex items-center justify-center gap-2">
            <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Sign up with Google
          </Button>
          <div className="flex items-center justify-center gap-2">
            <span className="h-px w-16 bg-gray-200" />
            <span className="text-gray-400 text-xs uppercase">or</span>
            <span className="h-px w-16 bg-gray-200" />
          </div>
          <Button variant="outline" className="w-full h-12 text-base font-semibold" onClick={() => onContinue()}>
            Continue with email
          </Button>
        </div>
      </div>
      
      <div className="mt-6 text-center text-sm">
        <p className="text-gray-500">
          Already have an account?{" "}
          <Link href="/sign-in" className="text-indigo-600 hover:text-indigo-800 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}