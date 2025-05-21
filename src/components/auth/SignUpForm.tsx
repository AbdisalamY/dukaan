// components/auth/SignUpForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

const signUpFormSchema = z.object({
  fullName: z.string().min(2, { message: "Full name must be at least 2 characters" }),
  username: z.string().min(2, { message: "Username must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(8, { 
    message: "Password must be at least 8 characters",
  }),
  confirmPassword: z.string(),
  termsAccepted: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and conditions",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignUpFormValues = z.infer<typeof signUpFormSchema>;

interface SignUpFormProps {
  initialEmail?: string;
  onBack?: () => void;
}

export default function SignUpForm({ initialEmail = "", onBack }: SignUpFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  
  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpFormSchema),
    defaultValues: {
      fullName: "",
      username: "",
      email: initialEmail,
      password: "",
      confirmPassword: "",
      termsAccepted: false,
    },
  });

  function onSubmit(data: SignUpFormValues) {
    // In a real application, you would send this data to your registration API
    console.log(data);
    // Redirect to sign in page or onboarding after successful registration
    // router.push("/sign-in");
  }

  return (
    <div className="max-w-md w-full mx-auto bg-white rounded-2xl shadow-lg p-8 space-y-6">
      {onBack && (
        <button 
          type="button" 
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          <span className="text-sm">Back</span>
        </button>
      )}
      
      <div>
        <h1 className="text-xl font-bold text-gray-900">Sign up to Teke Teke</h1>
        <p className="text-sm text-gray-500 mt-2">Complete your account information</p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input 
                      placeholder="Name" 
                    autoComplete="name"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Username" 
                      autoComplete="username"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Email" 
                    type="email" 
                    autoComplete="email"
                    {...field} 
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
                <FormLabel>Password</FormLabel>
                <FormControl>
                    <Input 
                    placeholder="6+ characters" 
                    type="password"
                      autoComplete="new-password"
                      {...field} 
                    />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="termsAccepted"
            render={({ field }) => (
              <FormItem className="flex items-start space-x-2 mt-2">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="text-xs text-gray-500 leading-tight">
                  I agree with Teke Teke's <Link href="/terms" className="underline">Terms of Service</Link>, <Link href="/privacy" className="underline">Privacy Policy</Link>, and default Notification Settings.
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full h-12 rounded-full bg-gray-900 hover:bg-gray-800 text-white font-bold text-base mt-2">
            Create Account
          </Button>
        </form>
      </Form>
      <div className="text-center text-xs text-gray-500 mt-4">
        Already have an account?{' '}
        <Link href="/sign-in" className="text-indigo-600 hover:text-indigo-800 font-medium">Sign in</Link>
      </div>
      <div className="text-[10px] text-gray-400 text-center mt-2">
        This site is protected by reCAPTCHA and the Google Privacy Policy and Terms of Service apply.
      </div>
    </div>
  );
}