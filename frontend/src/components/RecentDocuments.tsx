"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { apiGet } from "@/lib/api";
import { DocumentsTable, type DocumentRecord } from "@/components/DocumentsTable";

interface RecentDocumentsProps {
  onEdit: (doc: DocumentRecord) => void;
}

export function RecentDocuments({ onEdit }: RecentDocumentsProps) {
  const token = useAuthStore((s) => s.token);
  const [docs, setDocs] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    apiGet<DocumentRecord[]>("/api/documents", token)
      .then(setDocs)
      .catch(() => setError("Failed to load documents."))
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold tracking-tight">My Documents</h3>
      <DocumentsTable
        docs={docs}
        loading={loading}
        error={error}
        onEdit={onEdit}
        onDeleted={(id) => setDocs((prev) => prev.filter((d) => d.id !== id))}
      />
    </div>
  );
}
