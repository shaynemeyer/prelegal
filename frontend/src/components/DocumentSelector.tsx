"use client";

import { catalog, type CatalogEntry } from "@/lib/catalog";
import { Button } from "@/components/ui/button";

interface DocumentSelectorProps {
  onSelect: (entry: CatalogEntry) => void;
}

export function DocumentSelector({ onSelect }: DocumentSelectorProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Create a Legal Document</h2>
        <p className="text-muted-foreground mt-1">
          Choose a document type to get started.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {catalog.map((entry) => (
          <button
            key={entry.docType}
            onClick={() => onSelect(entry)}
            className="text-left border rounded-lg p-4 hover:border-primary hover:bg-muted/50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <p className="font-semibold text-sm">{entry.name}</p>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {entry.description}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
