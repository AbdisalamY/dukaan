// app/auth/confirm-email/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Mail } from "lucide-react";

export default function ConfirmEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="mx-auto max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <Mail className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Check Your Email</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            We've sent you a confirmation email. Please check your inbox and click the link to verify your account.
          </p>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <CheckCircle className="h-4 w-4" />
            <span>Email sent successfully</span>
          </div>
          <p className="text-xs text-gray-500">
            Don't see the email? Check your spam folder or try signing up again.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}