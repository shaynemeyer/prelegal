"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { useAuthStore } from "@/store/useAuthStore";
import { apiPost } from "@/lib/api";
import type { ChatMessage, ChatResponse } from "@/types/chat";

interface DocumentChatProps {
  docType: string;
  docName: string;
}

type PartialFields = Record<string, unknown>;

function isReadyToGenerate(fields: PartialFields, docType: string): boolean {
  // Determine party key names by doc type
  const partyKeys: Record<string, [string, string]> = {
    "csa": ["provider", "customer"],
    "sla": ["provider", "customer"],
    "design-partner": ["provider", "designPartner"],
    "psa": ["provider", "customer"],
    "dpa": ["controller", "processor"],
    "partnership": ["partner1", "partner2"],
    "software-license": ["provider", "customer"],
    "pilot": ["provider", "customer"],
    "baa": ["coveredEntity", "businessAssociate"],
    "ai-addendum": ["provider", "customer"],
  };
  const [key1, key2] = partyKeys[docType] ?? ["party1", "party2"];
  const p1 = fields[key1] as Record<string, unknown> | undefined;
  const p2 = fields[key2] as Record<string, unknown> | undefined;
  return !!(p1?.company && p2?.company && fields.effectiveDate && fields.governingLaw);
}

function mergeFields(current: PartialFields, incoming: Record<string, unknown>): PartialFields {
  const updated = { ...current };
  for (const [key, value] of Object.entries(incoming)) {
    if (value === null || value === undefined) continue;
    const existing = updated[key];
    if (typeof value === "object" && !Array.isArray(value) && typeof existing === "object" && existing !== null) {
      updated[key] = { ...(existing as Record<string, unknown>), ...(value as Record<string, unknown>) };
    } else {
      updated[key] = value;
    }
  }
  return updated;
}

export function DocumentChat({ docType, docName }: DocumentChatProps) {
  const token = useAuthStore((s) => s.token);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [fields, setFields] = useState<PartialFields>({});
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const greetedRef = useRef(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const sendMessage = useCallback(
    async (history: ChatMessage[], isGreeting = false) => {
      setLoading(true);
      try {
        const res = await apiPost<ChatResponse>(
          "/api/chat",
          { messages: history, doc_type: docType },
          token
        );
        const assistantMsg: ChatMessage = { role: "assistant", content: res.message };
        setMessages((prev) => (isGreeting ? [assistantMsg] : [...prev, assistantMsg]));
        if (res.fields && Object.keys(res.fields).length > 0) {
          setFields((prev) => mergeFields(prev, res.fields));
        }
      } catch {
        const errorMsg: ChatMessage = {
          role: "assistant",
          content: "Something went wrong. Please try again.",
        };
        setMessages((prev) => (isGreeting ? [errorMsg] : [...prev, errorMsg]));
      } finally {
        setLoading(false);
        inputRef.current?.focus();
      }
    },
    [token, docType]
  );

  useEffect(() => {
    if (!greetedRef.current) {
      greetedRef.current = true;
      sendMessage([{ role: "user", content: "Hello" }], true);
    }
  }, [sendMessage]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSend() {
    const text = input.trim();
    if (!text || loading) return;
    const userMsg: ChatMessage = { role: "user", content: text };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    sendMessage(nextMessages);
  }

  async function handleDownload() {
    setDownloading(true);
    setDownloadError(null);
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
      a.download = `${docName.toLowerCase().replace(/\s+/g, "-")}.pdf`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 100);

      // Save to document history (best-effort — don't fail download if this errors)
      apiPost("/api/documents", { doc_type: docType, doc_name: docName, fields }, token).catch(() => {});
    } catch (e) {
      setDownloadError(e instanceof Error ? e.message : "PDF generation failed");
    } finally {
      setDownloading(false);
    }
  }

  const ready = isReadyToGenerate(fields, docType);

  return (
    <div className="space-y-3">
    <DisclaimerBanner />
    <div className="flex flex-col h-[600px] border rounded-lg overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
                m.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-lg px-3 py-2 text-sm text-muted-foreground animate-pulse">
              Thinking...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {downloadError && (
        <p className="text-sm text-destructive bg-destructive/10 px-4 py-2">
          {downloadError}
        </p>
      )}

      <div className="border-t p-3 space-y-2">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={`Tell me about your ${docName}...`}
            disabled={loading}
            className="flex-1"
          />
          <Button onClick={handleSend} disabled={loading || !input.trim()}>
            Send
          </Button>
        </div>
        <div className="flex justify-end">
          <Button variant="default" onClick={handleDownload} disabled={!ready || downloading}>
            {downloading ? "Generating..." : `Download ${docName} PDF`}
          </Button>
        </div>
      </div>
    </div>
    </div>
  );
}
