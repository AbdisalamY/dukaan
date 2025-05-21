// components/auth/SignInForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";

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

const signInFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
  rememberMe: z.boolean().optional(),
});

type SignInFormValues = z.infer<typeof signInFormSchema>;

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  
  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signInFormSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  function onSubmit(data: SignInFormValues) {
    // In a real application, you would send this data to your authentication API
    console.log(data);
    // Redirect to dashboard or home page after successful sign in
    // router.push("/dashboard");
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="bg-white rounded-2xl shadow-2xl p-10 max-w-md w-full mx-auto flex flex-col gap-8"
    >
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Sign in to Teke Teke</h1>
      </div>
      {/* Google sign-in button */}
      <Button
        variant="outline"
        className="w-full h-12 text-base font-semibold flex items-center justify-center gap-2 border-gray-300 rounded-full transition-all duration-200 hover:shadow-md hover:border-gray-400"
        style={{ background: "#fff" }}
      >
        <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="none">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
        Sign in with Google
      </Button>
      {/* Divider */}
      <div className="flex items-center gap-2 my-2">
        <span className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
        <span className="text-gray-400 text-xs uppercase tracking-wider">or sign in with email</span>
        <span className="h-px flex-1 bg-gradient-to-l from-transparent via-gray-200 to-transparent" />
      </div>
      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold text-gray-800">Username or Email</FormLabel>
                <FormControl>
                  <Input
                    className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all duration-200 text-base"
                    placeholder=""
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
                <div className="flex items-center justify-between">
                  <FormLabel className="font-semibold text-gray-800">Password</FormLabel>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    Forgot?
                  </Link>
                </div>
                <FormControl>
                  <div className="relative">
                    <Input
                      className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all duration-200 text-base pr-10"
                      placeholder=""
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      {...field}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-500 transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="w-full h-12 rounded-full bg-gradient-to-r from-indigo-900 via-indigo-700 to-indigo-900 hover:scale-[1.02] hover:shadow-lg transition-all duration-200 text-white font-bold text-base mt-2"
          >
            Sign in.
          </Button>
        </form>
      </Form>
      {/* Bottom link */}
      <div className="text-center text-xs text-gray-400 mt-4">
        Don't have an account?{' '}
        <Link href="/sign-up" className="text-indigo-600 hover:text-indigo-800 font-medium transition-colors">Sign up</Link>
      </div>
    </motion.div>
  );
}