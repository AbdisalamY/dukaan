// app/(auth)/forgot-password/page.tsx
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

export const metadata = {
  title: "Forgot Password | Teke Teke",
  description: "Reset your Teke Teke account password",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}