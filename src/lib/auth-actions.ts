"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function login(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // Basic validation
  if (!email || !password) {
    redirect("/error?message=Email and password are required");
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect(`/error?message=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/", "layout");
  redirect("/shop/dashboard"); // Redirect to dashboard after successful login
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const firstName = formData.get("first-name") as string;
  const lastName = formData.get("last-name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // Basic validation
  if (!firstName || !lastName || !email || !password) {
    redirect("/error?message=All fields are required");
  }

  if (!email.includes("@")) {
    redirect("/error?message=Please enter a valid email address");
  }

  if (password.length < 6) {
    redirect("/error?message=Password must be at least 6 characters long");
  }

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

  if (error) {
    redirect(`/error?message=${encodeURIComponent(error.message)}`);
  }

  // Check if user needs to confirm email
  if (authData.user && !authData.user.email_confirmed_at) {
    // User needs to confirm email - redirect to confirmation page
    redirect("/confirm-email");
  } else {
    // User is automatically confirmed (if email confirmation is disabled)
    revalidatePath("/", "layout");
    redirect("/dashboard");
  }
}

export async function signout() {
  const supabase = await createClient();
  
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    console.error("Sign out error:", error);
    redirect("/error?message=Failed to sign out");
  }

  revalidatePath("/", "layout");
  redirect("/shop/dashboard");
}

export async function signInWithGoogle() {
  const supabase = await createClient();
  
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  
  if (!siteUrl) {
    console.error("NEXT_PUBLIC_SITE_URL environment variable is not set");
    redirect("/error?message=Configuration error");
  }
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
      redirectTo: `${siteUrl}/api/auth/callback`,
    },
  });

  if (error) {
    console.error("Google sign in error:", error);
    redirect("/error?message=Failed to sign in with Google");
  }

  if (data.url) {
    redirect(data.url);
  }
}

// Additional helper function to resend confirmation email
export async function resendConfirmationEmail(email: string) {
  const supabase = await createClient();

  if (!email) {
    redirect("/error?message=Email is required");
  }

  const { error } = await supabase.auth.resend({
    type: "signup",
    email: email,
  });

  if (error) {
    redirect(`/error?message=${encodeURIComponent(error.message)}`);
  }

  // Success - could redirect to a success page or back to confirm-email
  redirect("/auth/confirm-email?message=Confirmation email sent");
}