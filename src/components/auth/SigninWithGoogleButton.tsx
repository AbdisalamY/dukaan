"use client";
import { Button } from "@/components/ui/button";
import { signInWithGoogle } from "@/lib/auth-actions";
import React from "react";

interface SignInWithGoogleButtonProps {
  text?: string;
}

const SignInWithGoogleButton = ({ text = "Continue with Google" }: SignInWithGoogleButtonProps) => {
  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      onClick={() => {
        signInWithGoogle();
      }}
    >
      {text}
    </Button>
  );
};

export default SignInWithGoogleButton;
