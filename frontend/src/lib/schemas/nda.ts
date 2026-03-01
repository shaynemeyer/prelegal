import { z } from "zod";

export const partyInfoSchema = z.object({
  printName: z.string().min(1, "Print name is required"),
  title: z.string().min(1, "Title is required"),
  company: z.string().min(1, "Company is required"),
  noticeAddress: z.string().min(1, "Notice address is required"),
  date: z.string().min(1, "Date is required"),
});

export const ndaFormSchema = z
  .object({
    purpose: z.string().min(1, "Purpose is required"),
    effectiveDate: z.string().min(1, "Effective date is required"),
    mndaTermType: z.enum(["expires", "continues"]),
    mndaTermYears: z.number().int().min(1).optional(),
    confidentialityType: z.enum(["years", "perpetuity"]),
    confidentialityYears: z.number().int().min(1).optional(),
    governingLaw: z.string().min(1, "Governing law (state) is required"),
    jurisdiction: z.string().min(1, "Jurisdiction is required"),
    modifications: z.string().optional(),
    party1: partyInfoSchema,
    party2: partyInfoSchema,
  })
  .refine(
    (data) =>
      data.mndaTermType !== "expires" ||
      (data.mndaTermYears !== undefined && data.mndaTermYears >= 1),
    {
      message: "Number of years is required when MNDA expires",
      path: ["mndaTermYears"],
    }
  )
  .refine(
    (data) =>
      data.confidentialityType !== "years" ||
      (data.confidentialityYears !== undefined && data.confidentialityYears >= 1),
    {
      message: "Number of years is required for confidentiality term",
      path: ["confidentialityYears"],
    }
  );

export type NdaFormData = z.infer<typeof ndaFormSchema>;
export type PartyInfo = z.infer<typeof partyInfoSchema>;
