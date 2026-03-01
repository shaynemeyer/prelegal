import { create } from "zustand";

interface DocumentStore {
  docType: string | null;
  docName: string | null;
  fields: Record<string, unknown> | null;
  setDocument: (docType: string, docName: string, fields: Record<string, unknown>) => void;
  reset: () => void;
}

export const useDocumentStore = create<DocumentStore>((set) => ({
  docType: null,
  docName: null,
  fields: null,
  setDocument: (docType, docName, fields) => set({ docType, docName, fields }),
  reset: () => set({ docType: null, docName: null, fields: null }),
}));
