"use client";

import { useState } from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { DocumentSelector } from "@/components/DocumentSelector";
import { NdaPageTabs } from "@/components/NdaPageTabs";
import { DocumentPageTabs } from "@/components/document/DocumentPageTabs";
import { Button } from "@/components/ui/button";
import { catalog, NDA_DOC_TYPE, type CatalogEntry } from "@/lib/catalog";

function DocumentCreator({ entry, onBack }: { entry: CatalogEntry; onBack: () => void }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={onBack}>
          ← Back
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{entry.name}</h2>
          <p className="text-muted-foreground text-sm mt-0.5">{entry.description}</p>
        </div>
      </div>
      {entry.docType === NDA_DOC_TYPE ? (
        <NdaPageTabs />
      ) : (
        <DocumentPageTabs docType={entry.docType} docName={entry.name} />
      )}
    </div>
  );
}

export default function HomePage() {
  const [selected, setSelected] = useState<CatalogEntry | null>(null);

  return (
    <AuthGuard>
      {selected ? (
        <DocumentCreator entry={selected} onBack={() => setSelected(null)} />
      ) : (
        <DocumentSelector onSelect={setSelected} />
      )}
    </AuthGuard>
  );
}
