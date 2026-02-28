import { readFile } from "fs/promises";
import path from "path";
import { NdaPreview } from "@/components/nda/NdaPreview";

export default async function PreviewPage() {
  const templatesDir = path.resolve(process.cwd(), "../templates");
  let standardTerms: string;
  try {
    standardTerms = await readFile(path.join(templatesDir, "Mutual-NDA.md"), "utf-8");
  } catch {
    standardTerms = "_Standard terms could not be loaded. Please contact support._";
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">NDA Preview</h2>
        <p className="text-muted-foreground mt-1">
          Review your completed Mutual NDA below, then download as PDF.
        </p>
      </div>
      <NdaPreview standardTerms={standardTerms} />
    </div>
  );
}
