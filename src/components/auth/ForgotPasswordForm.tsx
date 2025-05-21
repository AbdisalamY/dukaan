// components/auth/ForgotPasswordForm.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { ArrowLeft } from "lucide-react";
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

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordForm() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  function onSubmit(data: ForgotPasswordValues) {
    // In a real application, you would send this data to your password reset API
    console.log(data);
    setIsSubmitted(true);
  }

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="space-y-6"
      >
        <Link 
          href="/sign-in" 
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          <span className="text-sm">Back to sign in</span>
        </Link>
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Check your email</h1>
          <p className="text-sm text-gray-500 mt-2">
            We've sent a password reset link to your email address. Please check your inbox.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="space-y-6"
    >
      <Link 
        href="/sign-in" 
        className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        <span className="text-sm">Back to sign in</span>
      </Link>
      <div>
        <h1 className="text-2xl font-bold text-black mb-6">Forgot Password?</h1>
        <p className="text-base text-black mb-4">
          Enter the email address you used when you joined and we'll send you instructions to reset your password.
        </p>
        <p className="text-base text-black mb-8">
          For security reasons, we do <b>NOT</b> store your password. So rest assured that we will never send your password via email.
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold text-black mb-2">Email Address</FormLabel>
                <FormControl>
                  <Input 
                    className="bg-white border-2 border-pink-200 rounded-2xl px-6 py-5 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all duration-200 text-lg"
                    placeholder="" 
                    type="email" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="w-1/2 mx-auto h-10 rounded-full bg-[#0d0c22] hover:bg-[#565564] text-white font-bold text-base mt-4 transition-all duration-200"
          >
            Send Reset Instructions
          </Button>
        </form>
      </Form>
    </motion.div>
  );
}