import { TRPCError } from "@trpc/server";
import { publicProcedure, router } from "@/server/trpc";
import { ndaFormSchema } from "@/lib/schemas/nda";

export const ndaRouter = router({
  generatePdf: publicProcedure.input(ndaFormSchema).mutation(async ({ input }) => {
    const payload = {
      purpose: input.purpose,
      effective_date: input.effectiveDate,
      mnda_term_type: input.mndaTermType,
      mnda_term_years: input.mndaTermYears ?? null,
      confidentiality_type: input.confidentialityType,
      confidentiality_years: input.confidentialityYears ?? null,
      governing_law: input.governingLaw,
      jurisdiction: input.jurisdiction,
      modifications: input.modifications ?? null,
      party1: {
        print_name: input.party1.printName,
        title: input.party1.title,
        company: input.party1.company,
        notice_address: input.party1.noticeAddress,
        date: input.party1.date,
      },
      party2: {
        print_name: input.party2.printName,
        title: input.party2.title,
        company: input.party2.company,
        notice_address: input.party2.noticeAddress,
        date: input.party2.date,
      },
    };

    const backendUrl = process.env.BACKEND_URL ?? "http://localhost:8000";
    const response = await fetch(`${backendUrl}/api/nda/generate-pdf`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.text().catch(() => "Unknown error");
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `PDF generation failed: ${error}`,
      });
    }

    const arrayBuffer = await response.arrayBuffer();
    const pdfBase64 = Buffer.from(arrayBuffer).toString("base64");
    return { pdfBase64 };
  }),
});
