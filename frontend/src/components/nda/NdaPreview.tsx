"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useNdaStore } from "@/store/useNdaStore";
import type { NdaFormData } from "@/lib/schemas/nda";

interface NdaPreviewProps {
  standardTerms: string;
}

function formatMndaTerm(
  type: string,
  years: number | undefined,
  context: "cover" | "terms"
): string {
  if (type === "expires") {
    const n = years ?? 1;
    return `${n} year${n !== 1 ? "s" : ""} from Effective Date`;
  }
  return context === "cover" ? "Continues until terminated" : "the date of termination";
}

function formatConfTerm(
  type: string,
  years: number | undefined,
  context: "cover" | "terms"
): string {
  if (type === "perpetuity") {
    return context === "cover" ? "In perpetuity" : "in perpetuity";
  }
  const n = years ?? 1;
  return `${n} year${n !== 1 ? "s" : ""} from Effective Date`;
}

function injectVariables(markdown: string, data: NdaFormData): string {
  const variables: Record<string, string> = {
    Purpose: data.purpose,
    "Effective Date": data.effectiveDate,
    "MNDA Term": formatMndaTerm(data.mndaTermType, data.mndaTermYears, "terms"),
    "Term of Confidentiality": formatConfTerm(data.confidentialityType, data.confidentialityYears, "terms"),
    "Governing Law": data.governingLaw,
    Jurisdiction: data.jurisdiction,
  };

  let result = markdown;
  for (const [varName, value] of Object.entries(variables)) {
    const pattern = new RegExp(
      `<span class="coverpage_link">${varName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}</span>`,
      "g"
    );
    result = result.replace(pattern, `**${value}**`);
  }
  return result;
}

function CoverPageTable({ data }: { data: NdaFormData }) {
  const mndaTermDisplay = formatMndaTerm(data.mndaTermType, data.mndaTermYears, "cover");
  const confTermDisplay = formatConfTerm(data.confidentialityType, data.confidentialityYears, "cover");

  return (
    <div className="space-y-6">
      <table className="w-full border-collapse text-sm">
        <tbody>
          {[
            ["Purpose", data.purpose],
            ["Effective Date", data.effectiveDate],
            ["MNDA Term", mndaTermDisplay],
            ["Term of Confidentiality", confTermDisplay],
            ["Governing Law", data.governingLaw],
            ["Jurisdiction", data.jurisdiction],
            ...(data.modifications ? [["MNDA Modifications", data.modifications]] : []),
          ].map(([label, value]) => (
            <tr key={label} className="border border-border">
              <th className="w-1/3 bg-muted px-3 py-2 text-left font-semibold">{label}</th>
              <td className="px-3 py-2 whitespace-pre-wrap">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="text-sm text-muted-foreground">
        By signing this Cover Page, each party agrees to enter into this MNDA as of the Effective Date.
      </p>

      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border border-border bg-muted">
            <th className="w-1/4 px-3 py-2 text-left"></th>
            <th className="px-3 py-2 text-center font-semibold">PARTY 1</th>
            <th className="px-3 py-2 text-center font-semibold">PARTY 2</th>
          </tr>
        </thead>
        <tbody>
          {[
            ["Signature", "\u00a0", "\u00a0"],
            ["Print Name", data.party1.printName, data.party2.printName],
            ["Title", data.party1.title, data.party2.title],
            ["Company", data.party1.company, data.party2.company],
            ["Notice Address", data.party1.noticeAddress, data.party2.noticeAddress],
            ["Date", data.party1.date, data.party2.date],
          ].map(([label, p1, p2]) => (
            <tr key={label} className="border border-border">
              <td className="bg-muted px-3 py-2 font-medium">{label}</td>
              <td className="px-3 py-2 whitespace-pre-wrap">{p1}</td>
              <td className="px-3 py-2 whitespace-pre-wrap">{p2}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="text-xs text-muted-foreground border-t pt-2">
        Common Paper Mutual Non-Disclosure Agreement (Version 1.0) free to use under CC BY 4.0.
      </p>
    </div>
  );
}

export function NdaPreview({ standardTerms }: NdaPreviewProps) {
  const router = useRouter();
  const formData = useNdaStore((s) => s.formData);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDownload() {
    if (!formData) return;
    setIsPending(true);
    setError(null);
    try {
      const payload = {
        purpose: formData.purpose,
        effective_date: formData.effectiveDate,
        mnda_term_type: formData.mndaTermType,
        mnda_term_years: formData.mndaTermYears ?? null,
        confidentiality_type: formData.confidentialityType,
        confidentiality_years: formData.confidentialityYears ?? null,
        governing_law: formData.governingLaw,
        jurisdiction: formData.jurisdiction,
        modifications: formData.modifications ?? null,
        party1: {
          print_name: formData.party1.printName,
          title: formData.party1.title,
          company: formData.party1.company,
          notice_address: formData.party1.noticeAddress,
          date: formData.party1.date,
        },
        party2: {
          print_name: formData.party2.printName,
          title: formData.party2.title,
          company: formData.party2.company,
          notice_address: formData.party2.noticeAddress,
          date: formData.party2.date,
        },
      };

      const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "";
      const res = await fetch(`${apiBase}/api/nda/generate-pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("PDF generation failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "mutual-nda.pdf";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (e) {
      setError(e instanceof Error ? e.message : "PDF generation failed");
    } finally {
      setIsPending(false);
    }
  }

  if (!formData) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground mb-4">No NDA data found. Please fill in the form first.</p>
        <Button onClick={() => router.push("/")}>← Back to Form</Button>
      </div>
    );
  }

  const processedTerms = injectVariables(standardTerms, formData);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => router.push("/")}>
          ← Edit
        </Button>
        <Button onClick={handleDownload} disabled={isPending}>
          {isPending ? "Generating…" : "Download PDF"}
        </Button>
      </div>

      {error && (
        <p className="text-sm text-destructive bg-destructive/10 px-4 py-2 rounded">
          {error}
        </p>
      )}

      <div className="bg-white border rounded-lg p-8 shadow-sm space-y-8 font-serif print:shadow-none">
        <h1 className="text-2xl font-bold text-center border-b pb-4">
          Mutual Non-Disclosure Agreement
        </h1>

        <div className="text-sm leading-relaxed text-muted-foreground">
          This Mutual Non-Disclosure Agreement (the "MNDA") consists of: (1) this Cover Page
          ("Cover Page") and (2) the Common Paper Mutual NDA Standard Terms Version 1.0
          ("Standard Terms"). Any modifications of the Standard Terms should be made on the
          Cover Page, which will control over conflicts with the Standard Terms.
        </div>

        <CoverPageTable data={formData} />

        <Separator />

        <h2 className="text-xl font-bold text-center">Standard Terms</h2>

        <div className="prose prose-sm max-w-none leading-relaxed">
          <ReactMarkdown rehypePlugins={[rehypeRaw]} remarkPlugins={[remarkGfm]}>
            {processedTerms}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
