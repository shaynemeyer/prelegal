"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/store/useAuthStore";

function getEmailFromToken(token: string): string | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.email ?? null;
  } catch {
    return null;
  }
}

export function AppHeader() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const clearToken = useAuthStore((s) => s.clearToken);

  const email = token ? getEmailFromToken(token) : null;

  function handleSignOut() {
    clearToken();
    router.push("/login");
  }

  return (
    <header className="border-b bg-card">
      <div className="mx-auto max-w-4xl px-4 py-4 flex items-center justify-between">
        <div>
          <p className="text-lg font-semibold tracking-tight">Prelegal</p>
          <p className="text-sm text-muted-foreground">Legal documents, simplified.</p>
        </div>

        {email && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="text-sm text-muted-foreground">
                {email}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
