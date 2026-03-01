import { readFile } from "fs/promises";
import path from "path";
import { DocumentPreview } from "@/components/document/DocumentPreview";
import { AuthGuard } from "@/components/AuthGuard";

// Map docType slug → template filename (mirrors backend _TEMPLATE_MAP)
const TEMPLATE_FILES: Record<string, string> = {
  "csa": "CSA.md",
  "sla": "sla.md",
  "design-partner": "design-partner-agreement.md",
  "psa": "psa.md",
  "dpa": "DPA.md",
  "partnership": "Partnership-Agreement.md",
  "software-license": "Software-License-Agreement.md",
  "pilot": "Pilot-Agreement.md",
  "baa": "BAA.md",
  "ai-addendum": "AI-Addendum.md",
};

export default async function DocPreviewPage() {
  const templatesDir = path.resolve(process.cwd(), "../templates");

  const templates: Record<string, string> = {};
  for (const [docType, filename] of Object.entries(TEMPLATE_FILES)) {
    try {
      templates[docType] = await readFile(path.join(templatesDir, filename), "utf-8");
    } catch {
      templates[docType] = "_Standard terms could not be loaded._";
    }
  }

  return (
    <AuthGuard>
      <DocumentPreview templates={templates} />
    </AuthGuard>
  );
}
