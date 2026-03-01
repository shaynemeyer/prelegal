import { NdaPageTabs } from "@/components/NdaPageTabs";
import { AuthGuard } from "@/components/AuthGuard";

export default function HomePage() {
  return (
    <AuthGuard>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Mutual NDA Creator</h2>
          <p className="text-muted-foreground mt-1">
            Fill in the form or chat with AI to generate a Mutual Non-Disclosure Agreement.
          </p>
        </div>
        <NdaPageTabs />
      </div>
    </AuthGuard>
  );
}
