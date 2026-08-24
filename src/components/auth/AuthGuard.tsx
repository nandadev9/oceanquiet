"use client";

import { useAuth } from "@/context/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isReady, user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (isReady && !user) {
      const nextPath = pathname && pathname !== "/" ? `?next=${encodeURIComponent(pathname)}` : "";
      router.replace(`/signin${nextPath}`);
    }
  }, [isReady, pathname, router, user]);

  if (!isReady || !user) {
    return (
      <div
        aria-label="Verificando sessão"
        className="min-h-screen bg-gray-50 dark:bg-gray-900"
      />
    );
  }

  return <>{children}</>;
}
