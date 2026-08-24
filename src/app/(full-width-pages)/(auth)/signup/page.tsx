import SignUpForm from "@/components/auth/SignUpForm";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Criar conta",
  description: "Crie sua conta OceanQuiet.",
};

export default function SignUp() {
  return (
    <Suspense fallback={<AuthPageFallback />}>
      <SignUpForm />
    </Suspense>
  );
}

function AuthPageFallback() {
  return <div className="min-h-screen bg-white dark:bg-gray-900" />;
}
