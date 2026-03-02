"use client";

import { useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { apiPost } from "@/lib/api";

const DEFAULT_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes
const REFRESH_THRESHOLD_MS = 5 * 60 * 1000; // refresh if < 5 min until expiry
const REFRESH_THROTTLE_MS = 60 * 1000; // at most once per minute

type WindowWithTimeout = Window & { __INACTIVITY_TIMEOUT_MS?: number };

function getTimeoutMs(): number {
  if (typeof window === "undefined") return DEFAULT_TIMEOUT_MS;
  return (window as WindowWithTimeout).__INACTIVITY_TIMEOUT_MS ?? DEFAULT_TIMEOUT_MS;
}

function tokenExpiresInMs(token: string): number {
  try {
    const exp = JSON.parse(atob(token.split(".")[1])).exp as number;
    return exp * 1000 - Date.now();
  } catch {
    return 0;
  }
}

export function useInactivityTimeout() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const setToken = useAuthStore((s) => s.setToken);
  const clearToken = useAuthStore((s) => s.clearToken);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tokenRef = useRef(token);
  const routerRef = useRef(router);
  const lastRefreshRef = useRef(0);

  useEffect(() => {
    tokenRef.current = token;
  }, [token]);

  useEffect(() => {
    routerRef.current = router;
  }, [router]);

  const tryRefresh = useCallback(() => {
    const t = tokenRef.current;
    if (!t) return;
    const now = Date.now();
    if (
      tokenExpiresInMs(t) < REFRESH_THRESHOLD_MS &&
      now - lastRefreshRef.current > REFRESH_THROTTLE_MS
    ) {
      lastRefreshRef.current = now;
      apiPost<{ access_token: string }>("/api/auth/refresh", {}, t)
        .then((res) => setToken(res.access_token))
        .catch(() => {
          clearToken();
          routerRef.current.replace("/login");
        });
    }
  }, [setToken, clearToken]);

  useEffect(() => {
    if (!token) return;

    function reset() {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        clearToken();
        routerRef.current.replace("/login");
      }, getTimeoutMs());
      tryRefresh();
    }

    const events = ["mousemove", "keydown", "click", "touchstart"] as const;
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    reset();

    return () => {
      events.forEach((e) => window.removeEventListener(e, reset));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [token, clearToken, tryRefresh]);
}
