"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore";
import { apiGet } from "@/lib/api";

interface DocumentRecord {
  id: number;
  doc_type: string;
  doc_name: string;
  fields: Record<string, unknown>;
  created_at: string;
}

export function RecentDocuments() {
  const token = useAuthStore((s) => s.token);
  const [docs, setDocs] = useState<DocumentRecord[]>([]);
  const [downloading, setDownloading] = useState<number | null>(null);

  useEffect(() => {
    if (!token) return;
    apiGet<DocumentRecord[]>("/api/documents", token)
      .then(setDocs)
      .catch(() => {});
  }, [token]);

  if (docs.length === 0) return null;

  async function handleRedownload(doc: DocumentRecord) {
    setDownloading(doc.id);
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "";
      const isNda = doc.doc_type === "mutual-nda";
      const endpoint = isNda ? "/api/nda/generate-pdf" : "/api/documents/generate-pdf";
      const body = isNda
        ? doc.fields
        : { doc_type: doc.doc_type, fields: doc.fields };

      const res = await fetch(`${apiBase}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("PDF generation failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${doc.doc_name.toLowerCase().replace(/\s+/g, "-")}.pdf`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch {
      // silently ignore re-download errors
    } finally {
      setDownloading(null);
    }
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold tracking-tight">Recent Documents</h3>
      <div className="divide-y rounded-lg border">
        {docs.map((doc) => (
          <div key={doc.id} className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="text-sm font-medium">{doc.doc_name}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(doc.created_at).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRedownload(doc)}
              disabled={downloading === doc.id}
            >
              {downloading === doc.id ? "Generating…" : "Download PDF"}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
