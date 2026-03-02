"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useDocumentStore } from "@/store/useDocumentStore";
import { useAuthStore } from "@/store/useAuthStore";
import { apiPost } from "@/lib/api";
import { DOC_SCHEMAS } from "@/lib/documentSchemas";

interface DocumentPreviewProps {
  templates: Record<string, string>;
}

function CoverTable({ docType, docName, fields }: { docType: string; docName: string; fields: Record<string, unknown> }) {
  const schema = DOC_SCHEMAS[docType];

  // Build the cover field rows (skip empty optional fields)
  const coverRows = schema.coverFields
    .filter((f) => f.key !== "modifications")
    .map((f) => [f.label, String(fields[f.key] ?? "")])
    .filter(([, v]) => v);

  const mods = fields["modifications"] as string | undefined;
  if (mods) coverRows.push(["Modifications", mods]);

  const p1 = (fields[schema.party1Key] ?? {}) as Record<string, string>;
  const p2 = (fields[schema.party2Key] ?? {}) as Record<string, string>;

  return (
    <div className="space-y-6">
      <table className="w-full border-collapse text-sm">
        <tbody>
          {coverRows.map(([label, value]) => (
            <tr key={label} className="border border-border">
              <th className="w-1/3 bg-muted px-3 py-2 text-left font-semibold">{label}</th>
              <td className="px-3 py-2 whitespace-pre-wrap">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="text-sm text-muted-foreground">
        By signing this Cover Page, each party agrees to enter into this Agreement as of the Effective Date.
      </p>

      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border border-border bg-muted">
            <th className="w-1/4 px-3 py-2 text-left"></th>
            <th className="px-3 py-2 text-center font-semibold">{schema.party1Label.toUpperCase()}</th>
            <th className="px-3 py-2 text-center font-semibold">{schema.party2Label.toUpperCase()}</th>
          </tr>
        </thead>
        <tbody>
          {[
            ["Signature", "\u00a0", "\u00a0"],
            ["Print Name", p1.printName ?? "", p2.printName ?? ""],
            ["Title", p1.title ?? "", p2.title ?? ""],
            ["Company", p1.company ?? "", p2.company ?? ""],
            ["Notice Address", p1.noticeAddress ?? "", p2.noticeAddress ?? ""],
            ["Date", p1.date ?? "", p2.date ?? ""],
          ].map(([label, v1, v2]) => (
            <tr key={label} className="border border-border">
              <td className="bg-muted px-3 py-2 font-medium">{label}</td>
              <td className="px-3 py-2 whitespace-pre-wrap">{v1}</td>
              <td className="px-3 py-2 whitespace-pre-wrap">{v2}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="text-xs text-muted-foreground border-t pt-2">
        Common Paper {docName} free to use under CC BY 4.0.
      </p>
    </div>
  );
}

export function DocumentPreview({ templates }: DocumentPreviewProps) {
  const router = useRouter();
  const { docType, docName, fields } = useDocumentStore();
  const token = useAuthStore((s) => s.token);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  async function handleSave() {
    if (!docType || !docName || !fields) return;
    setSaving(true);
    setSaved(false);
    setSaveError(null);
    try {
      await apiPost("/api/documents", { doc_type: docType, doc_name: docName, fields }, token);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setSaveError("Save failed. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDownload() {
    if (!docType || !fields) return;
    setIsPending(true);
    setError(null);
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "";
      const res = await fetch(`${apiBase}/api/documents/generate-pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doc_type: docType, fields }),
      });
      if (!res.ok) throw new Error("PDF generation failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${(docName ?? "document").toLowerCase().replace(/\s+/g, "-")}.pdf`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (e) {
      setError(e instanceof Error ? e.message : "PDF generation failed");
    } finally {
      setIsPending(false);
    }
  }

  if (!docType || !docName || !fields) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground mb-4">No document data found. Please fill in the form first.</p>
        <Button onClick={() => router.push("/")}>← Back to Form</Button>
      </div>
    );
  }

  const standardTerms = templates[docType] ?? "_Standard terms could not be loaded._";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{docName} Preview</h2>
        <p className="text-muted-foreground mt-1">
          Review your completed {docName} below, then download as PDF.
        </p>
      </div>

      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => router.push("/")}>
          ← Edit
        </Button>
        <div className="flex items-center gap-2">
          {saved && <span className="text-sm text-green-600">Saved</span>}
          {saveError && <span className="text-sm text-destructive">{saveError}</span>}
          <Button variant="outline" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
          <Button onClick={handleDownload} disabled={isPending}>
            {isPending ? "Generating…" : "Download PDF"}
          </Button>
        </div>
      </div>

      {error && (
        <p className="text-sm text-destructive bg-destructive/10 px-4 py-2 rounded">
          {error}
        </p>
      )}

      <div className="bg-white border rounded-lg p-8 shadow-sm space-y-8 font-serif print:shadow-none">
        <h1 className="text-2xl font-bold text-center border-b pb-4">{docName}</h1>

        <div className="text-sm leading-relaxed text-muted-foreground">
          This {docName} consists of: (1) this Cover Page and (2) the Common Paper Standard Terms.
          Any modifications to the Standard Terms should be made on the Cover Page.
        </div>

        <CoverTable docType={docType} docName={docName} fields={fields} />

        <Separator />

        <h2 className="text-xl font-bold text-center">Standard Terms</h2>

        <div className="prose prose-sm max-w-none leading-relaxed">
          <ReactMarkdown rehypePlugins={[rehypeRaw]} remarkPlugins={[remarkGfm]}>
            {standardTerms}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
