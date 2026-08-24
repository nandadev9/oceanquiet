import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Entrar",
  description: "Acesse sua conta OceanQuiet.",
};

export default function SignIn() {
  return (
    <Suspense fallback={<AuthPageFallback />}>
      <SignInForm />
    </Suspense>
  );
}

function AuthPageFallback() {
  return <div className="min-h-screen bg-white dark:bg-gray-900" />;
}
