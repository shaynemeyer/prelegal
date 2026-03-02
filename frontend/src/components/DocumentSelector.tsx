"use client";

import { catalog, type CatalogEntry } from "@/lib/catalog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DocumentSelectorProps {
  onSelect: (entry: CatalogEntry) => void;
}

export function DocumentSelector({ onSelect }: DocumentSelectorProps) {
  function handleValueChange(docType: string) {
    const entry = catalog.find((e) => e.docType === docType);
    if (entry) onSelect(entry);
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Create a Legal Document</h2>
        <p className="text-muted-foreground mt-1">
          Choose a document type to get started.
        </p>
      </div>
      <Select onValueChange={handleValueChange}>
        <SelectTrigger className="w-full max-w-sm" aria-label="Document type">
          <SelectValue placeholder="Select a document type..." />
        </SelectTrigger>
        <SelectContent>
          {catalog.map((entry) => (
            <SelectItem key={entry.docType} value={entry.docType}>
              {entry.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
