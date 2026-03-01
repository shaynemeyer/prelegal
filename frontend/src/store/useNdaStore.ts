import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { NdaFormData } from "@/lib/schemas/nda";

interface NdaStore {
  formData: NdaFormData | null;
  setFormData: (data: NdaFormData) => void;
  resetFormData: () => void;
}

export const useNdaStore = create<NdaStore>()(
  persist(
    (set) => ({
      formData: null,
      setFormData: (data) => set({ formData: data }),
      resetFormData: () => set({ formData: null }),
    }),
    { name: "prelegal-nda", storage: createJSONStorage(() => sessionStorage) }
  )
);
