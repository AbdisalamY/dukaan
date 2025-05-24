"use client";

import { useState } from "react";
import { SignUpForm } from "@/components/auth/SignUpForm";

export default function SignUpPage() {
  const [showFullForm, setShowFullForm] = useState(false);

  const handleContinue = () => {
    setShowFullForm(true);
  };

  const handleBack = () => {
    setShowFullForm(false);
  };

  return (
    <div className="flex h-svh items-center"><SignUpForm/></div>
  );
}