"use client";

import { useState } from "react";
import { useForm, type Control } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { DOC_SCHEMAS } from "@/lib/documentSchemas";

interface DocumentFormProps {
  docType: string;
  docName: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function PartyFields({ control, partyKey, label }: { control: Control<any>; partyKey: string; label: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{label}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={control}
            name={`${partyKey}.printName`}
            rules={{ required: "Print name is required" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Print Name</FormLabel>
                <FormControl>
                  <Input placeholder="Jane Smith" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`${partyKey}.title`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="CEO" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`${partyKey}.company`}
            rules={{ required: "Company is required" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company</FormLabel>
                <FormControl>
                  <Input placeholder="Acme Corp" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`${partyKey}.date`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={control}
          name={`${partyKey}.noticeAddress`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notice Address</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="123 Main St, San Francisco, CA 94105"
                  rows={2}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}

export function DocumentForm({ docType, docName }: DocumentFormProps) {
  const schema = DOC_SCHEMAS[docType];
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const form = useForm<any>({
    defaultValues: {
      effectiveDate: new Date().toISOString().split("T")[0],
    },
  });

  if (!schema) {
    return <p className="text-muted-foreground">Form not available for this document type.</p>;
  }

  async function onSubmit(data: Record<string, unknown>) {
    setDownloading(true);
    setError(null);
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "";
      const res = await fetch(`${apiBase}/api/documents/generate-pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doc_type: docType, fields: data }),
      });
      if (!res.ok) throw new Error("PDF generation failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${docName.toLowerCase().replace(/\s+/g, "-")}.pdf`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (e) {
      setError(e instanceof Error ? e.message : "PDF generation failed");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Agreement Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {schema.coverFields.map((fieldDef) => (
              <FormField
                key={fieldDef.key}
                control={form.control}
                name={fieldDef.key}
                rules={fieldDef.required ? { required: `${fieldDef.label} is required` } : undefined}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{fieldDef.label}</FormLabel>
                    <FormControl>
                      {fieldDef.type === "textarea" ? (
                        <Textarea
                          placeholder={fieldDef.placeholder}
                          rows={3}
                          {...field}
                        />
                      ) : (
                        <Input
                          type={fieldDef.type === "date" ? "date" : "text"}
                          className={fieldDef.type === "date" ? "w-48" : undefined}
                          placeholder={fieldDef.placeholder}
                          {...field}
                        />
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </CardContent>
        </Card>

        <PartyFields
          control={form.control}
          partyKey={schema.party1Key}
          label={schema.party1Label}
        />
        <PartyFields
          control={form.control}
          partyKey={schema.party2Key}
          label={schema.party2Label}
        />

        <Separator />

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex justify-end">
          <Button type="submit" size="lg" disabled={downloading}>
            {downloading ? "Generating PDF..." : `Download ${docName} PDF`}
          </Button>
        </div>
      </form>
    </Form>
  );
}
