export interface CatalogEntry {
  name: string;
  description: string;
  filename: string;
  docType: string;
}

// Map filename → docType slug
const filenameToDocType: Record<string, string> = {
  "Mutual-NDA.md": "mutual-nda",
  "CSA.md": "csa",
  "sla.md": "sla",
  "design-partner-agreement.md": "design-partner",
  "psa.md": "psa",
  "DPA.md": "dpa",
  "Partnership-Agreement.md": "partnership",
  "Software-License-Agreement.md": "software-license",
  "Pilot-Agreement.md": "pilot",
  "BAA.md": "baa",
  "AI-Addendum.md": "ai-addendum",
};

// Raw catalog data (keeping it client-side to avoid build-time file reads)
const rawCatalog = [
  {
    name: "Mutual NDA",
    description:
      "Standard terms for the Common Paper Mutual Non-Disclosure Agreement (MNDA), created by a committee of over 40 attorneys representing technology vendors, procurement teams, boutique firms, and Big Law.",
    filename: "Mutual-NDA.md",
  },
  {
    name: "Cloud Service Agreement (CSA)",
    description:
      "Common Paper standard Cloud Service Agreement for selling and buying cloud software and SaaS products.",
    filename: "CSA.md",
  },
  {
    name: "Service Level Agreement (SLA)",
    description:
      "Common Paper standard Service Level Agreement, designed to be used alongside the Cloud Service Agreement (CSA). Defines uptime commitments and remedies.",
    filename: "sla.md",
  },
  {
    name: "Design Partner Agreement",
    description:
      "Common Paper standard Design Partner Agreement for early-stage product collaborations.",
    filename: "design-partner-agreement.md",
  },
  {
    name: "Professional Services Agreement (PSA)",
    description:
      "Common Paper standard Professional Services Agreement for engagements involving custom work, deliverables, and statement-of-work arrangements.",
    filename: "psa.md",
  },
  {
    name: "Data Processing Agreement (DPA)",
    description:
      "Common Paper standard Data Processing Agreement governing how personal data is handled between controllers and processors.",
    filename: "DPA.md",
  },
  {
    name: "Partnership Agreement",
    description:
      "Common Paper standard Partnership Agreement for formalising commercial partnerships between companies.",
    filename: "Partnership-Agreement.md",
  },
  {
    name: "Software License Agreement",
    description:
      "Common Paper standard Software License Agreement for licensing on-premise or downloadable software.",
    filename: "Software-License-Agreement.md",
  },
  {
    name: "Pilot Agreement",
    description:
      "Common Paper standard Pilot Agreement for short-term trials or evaluations of a product or service.",
    filename: "Pilot-Agreement.md",
  },
  {
    name: "Business Associate Agreement (BAA)",
    description:
      "Common Paper standard Business Associate Agreement governing the handling of protected health information (PHI) under HIPAA.",
    filename: "BAA.md",
  },
  {
    name: "AI Addendum",
    description:
      "Common Paper standard AI Addendum for addressing artificial intelligence-specific terms such as data usage, model training, and output ownership.",
    filename: "AI-Addendum.md",
  },
];

export const catalog: CatalogEntry[] = rawCatalog.map((item) => ({
  ...item,
  docType: filenameToDocType[item.filename] ?? item.filename,
}));

export const NDA_DOC_TYPE = "mutual-nda";
