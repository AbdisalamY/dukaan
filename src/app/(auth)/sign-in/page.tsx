// app/(auth)/sign-in/page.tsx
import { LoginForm } from "@/components/auth/SignInForm"; // ✅ Import LoginForm

export const metadata = {
  title: "Sign in | Teke Teke",
  description: "Sign in to your Teke Teke account",
};

export default function SignInPage() {
  return <LoginForm />; // ✅ Use LoginForm
}