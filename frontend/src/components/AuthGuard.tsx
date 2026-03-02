"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useInactivityTimeout } from "@/hooks/useInactivityTimeout";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const [hydrated, setHydrated] = useState(false);

  useInactivityTimeout();

  useEffect(() => {
    // Wait for Zustand persist to rehydrate from localStorage before checking auth.
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated && !token) {
      router.replace("/login");
    }
  }, [hydrated, token, router]);

  if (!hydrated || !token) return null;

  return <>{children}</>;
}
