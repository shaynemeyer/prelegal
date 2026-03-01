"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNdaStore } from "@/store/useNdaStore";
import { useAuthStore } from "@/store/useAuthStore";
import { apiPost } from "@/lib/api";
import type { NdaFormData } from "@/lib/schemas/nda";
import type { ChatMessage, ChatResponse } from "@/types/chat";

type PartialParty = Partial<NdaFormData["party1"]>;

interface PartialNdaData {
  purpose?: string;
  effectiveDate?: string;
  mndaTermType?: NdaFormData["mndaTermType"];
  mndaTermYears?: number;
  confidentialityType?: NdaFormData["confidentialityType"];
  confidentialityYears?: number;
  governingLaw?: string;
  jurisdiction?: string;
  modifications?: string;
  party1?: PartialParty;
  party2?: PartialParty;
}

function isReadyForPreview(data: PartialNdaData): boolean {
  const termYearsOk = data.mndaTermType !== "expires" || (data.mndaTermYears != null && data.mndaTermYears >= 1);
  const confYearsOk =
    data.confidentialityType !== "years" || (data.confidentialityYears != null && data.confidentialityYears >= 1);
  return !!(
    data.purpose &&
    data.effectiveDate &&
    data.mndaTermType &&
    termYearsOk &&
    data.confidentialityType &&
    confYearsOk &&
    data.governingLaw &&
    data.jurisdiction &&
    data.party1?.company &&
    data.party2?.company
  );
}

function toNdaFormData(partial: PartialNdaData): NdaFormData {
  const today = new Date().toISOString().split("T")[0];
  return {
    purpose: partial.purpose ?? "Evaluating whether to enter into a business relationship.",
    effectiveDate: partial.effectiveDate ?? today,
    mndaTermType: partial.mndaTermType ?? "expires",
    mndaTermYears: partial.mndaTermYears ?? 1,
    confidentialityType: partial.confidentialityType ?? "years",
    confidentialityYears: partial.confidentialityYears ?? 1,
    governingLaw: partial.governingLaw ?? "",
    jurisdiction: partial.jurisdiction ?? "",
    modifications: partial.modifications ?? "",
    party1: {
      printName: partial.party1?.printName ?? "",
      title: partial.party1?.title ?? "",
      company: partial.party1?.company ?? "",
      noticeAddress: partial.party1?.noticeAddress ?? "",
      date: partial.party1?.date ?? today,
    },
    party2: {
      printName: partial.party2?.printName ?? "",
      title: partial.party2?.title ?? "",
      company: partial.party2?.company ?? "",
      noticeAddress: partial.party2?.noticeAddress ?? "",
      date: partial.party2?.date ?? today,
    },
  };
}

function mergeFields(current: PartialNdaData, incoming: Record<string, unknown>): PartialNdaData {
  const updated = { ...current };
  for (const [key, value] of Object.entries(incoming)) {
    if (value === null || value === undefined) continue;
    if (key === "party1" || key === "party2") {
      updated[key] = { ...(updated[key] ?? {}), ...(value as PartialParty) };
    } else {
      (updated as Record<string, unknown>)[key] = value;
    }
  }
  return updated;
}

export function NdaChat() {
  const router = useRouter();
  const setFormData = useNdaStore((s) => s.setFormData);
  const token = useAuthStore((s) => s.token);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [ndaData, setNdaData] = useState<PartialNdaData>({});
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const greetedRef = useRef(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const sendMessage = useCallback(
    async (history: ChatMessage[], isGreeting = false) => {
      setLoading(true);
      try {
        const res = await apiPost<ChatResponse>("/api/chat", { messages: history }, token);
        const assistantMsg: ChatMessage = { role: "assistant", content: res.message };
        setMessages((prev) => (isGreeting ? [assistantMsg] : [...prev, assistantMsg]));
        if (res.fields && Object.keys(res.fields).length > 0) {
          setNdaData((prev) => mergeFields(prev, res.fields));
        }
      } catch {
        const errorMsg: ChatMessage = { role: "assistant", content: "Something went wrong. Please try again." };
        setMessages((prev) => (isGreeting ? [errorMsg] : [...prev, errorMsg]));
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  // Greet user on mount
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

  function handlePreview() {
    setFormData(toNdaFormData(ndaData));
    router.push("/preview");
  }

  const ready = isReadyForPreview(ndaData);

  return (
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

      <div className="border-t p-3 space-y-2">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Tell me about your NDA..."
            disabled={loading}
            className="flex-1"
          />
          <Button onClick={handleSend} disabled={loading || !input.trim()}>
            Send
          </Button>
        </div>
        <div className="flex justify-end">
          <Button variant="default" onClick={handlePreview} disabled={!ready}>
            Preview NDA →
          </Button>
        </div>
      </div>
    </div>
  );
}
