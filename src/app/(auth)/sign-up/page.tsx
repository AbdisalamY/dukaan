"use client";

import { useState } from "react";
import SignUpForm from "@/components/auth/SignUpForm";
import SignUpInitial from "@/components/auth/SignUpInitial";

export default function SignUpPage() {
  const [showFullForm, setShowFullForm] = useState(false);

  const handleContinue = () => {
    setShowFullForm(true);
  };

  const handleBack = () => {
    setShowFullForm(false);
  };

  return (
    <>
      {showFullForm ? (
        <SignUpForm onBack={handleBack} />
      ) : (
        <SignUpInitial onContinue={handleContinue} />
      )}
    </>
  );
}