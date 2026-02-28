import { create } from "zustand";
import type { NdaFormData } from "@/lib/schemas/nda";

interface NdaStore {
  formData: NdaFormData | null;
  setFormData: (data: NdaFormData) => void;
  resetFormData: () => void;
}

export const useNdaStore = create<NdaStore>((set) => ({
  formData: null,
  setFormData: (data) => set({ formData: data }),
  resetFormData: () => set({ formData: null }),
}));
