"use client";

import { useState } from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { DocumentSelector } from "@/components/DocumentSelector";
import { NdaPageTabs } from "@/components/NdaPageTabs";
import { DocumentPageTabs } from "@/components/document/DocumentPageTabs";
import { RecentDocuments } from "@/components/RecentDocuments";
import { Button } from "@/components/ui/button";
import { catalog, NDA_DOC_TYPE, type CatalogEntry } from "@/lib/catalog";
import { useDocumentStore } from "@/store/useDocumentStore";
import { useNdaStore } from "@/store/useNdaStore";
import type { DocumentRecord } from "@/components/DocumentsTable";
import type { NdaFormData } from "@/lib/schemas/nda";

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
  const setDocument = useDocumentStore((s) => s.setDocument);
  const setNdaFormData = useNdaStore((s) => s.setFormData);

  function handleEdit(doc: DocumentRecord) {
    const entry = catalog.find((c) => c.docType === doc.doc_type);
    if (!entry) return;
    if (doc.doc_type === NDA_DOC_TYPE) {
      setNdaFormData(doc.fields as NdaFormData);
    } else {
      setDocument(doc.doc_type, doc.doc_name, doc.fields);
    }
    setSelected(entry);
  }

  return (
    <AuthGuard>
      {selected ? (
        <DocumentCreator entry={selected} onBack={() => setSelected(null)} />
      ) : (
        <div className="space-y-8">
          <DocumentSelector onSelect={setSelected} />
          <RecentDocuments onEdit={handleEdit} />
        </div>
      )}
    </AuthGuard>
  );
}
