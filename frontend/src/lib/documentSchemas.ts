export interface FieldDef {
  key: string;
  label: string;
  type: "input" | "date" | "textarea";
  placeholder?: string;
  required: boolean;
}

export interface DocSchema {
  coverFields: FieldDef[];
  party1Key: string;
  party1Label: string;
  party2Key: string;
  party2Label: string;
}

const commonEnd: FieldDef[] = [
  { key: "governingLaw", label: "Governing Law (State)", type: "input", placeholder: "Delaware", required: true },
  { key: "jurisdiction", label: "Jurisdiction", type: "input", placeholder: "New Castle County, Delaware", required: true },
  { key: "modifications", label: "Modifications (optional)", type: "textarea", placeholder: "Any modifications to standard terms…", required: false },
];

export const DOC_SCHEMAS: Record<string, DocSchema> = {
  "csa": {
    coverFields: [
      { key: "effectiveDate", label: "Effective Date", type: "date", required: true },
      { key: "subscriptionPeriod", label: "Subscription Period", type: "input", placeholder: "12 months", required: true },
      ...commonEnd,
    ],
    party1Key: "provider", party1Label: "Provider",
    party2Key: "customer", party2Label: "Customer",
  },
  "sla": {
    coverFields: [
      { key: "effectiveDate", label: "Effective Date", type: "date", required: true },
      { key: "targetUptime", label: "Target Uptime", type: "input", placeholder: "99.9%", required: true },
      { key: "targetResponseTime", label: "Target Response Time", type: "input", placeholder: "4 hours", required: false },
      { key: "supportChannel", label: "Support Channel", type: "input", placeholder: "Email / Slack", required: false },
      ...commonEnd,
    ],
    party1Key: "provider", party1Label: "Provider",
    party2Key: "customer", party2Label: "Customer",
  },
  "design-partner": {
    coverFields: [
      { key: "effectiveDate", label: "Effective Date", type: "date", required: true },
      { key: "programDuration", label: "Program Duration", type: "input", placeholder: "6 months", required: true },
      { key: "programScope", label: "Program Scope", type: "textarea", placeholder: "Describe the design partner program scope…", required: true },
      ...commonEnd,
    ],
    party1Key: "provider", party1Label: "Provider",
    party2Key: "designPartner", party2Label: "Design Partner",
  },
  "psa": {
    coverFields: [
      { key: "effectiveDate", label: "Effective Date", type: "date", required: true },
      { key: "projectDescription", label: "Project Description", type: "textarea", placeholder: "Describe the services to be performed…", required: true },
      { key: "paymentTerms", label: "Payment Terms", type: "input", placeholder: "Net 30", required: true },
      ...commonEnd,
    ],
    party1Key: "provider", party1Label: "Provider",
    party2Key: "customer", party2Label: "Customer",
  },
  "dpa": {
    coverFields: [
      { key: "effectiveDate", label: "Effective Date", type: "date", required: true },
      { key: "dataTypes", label: "Data Types", type: "input", placeholder: "Names, emails, usage data…", required: true },
      { key: "processingPurpose", label: "Processing Purpose", type: "textarea", placeholder: "Describe the purpose of processing personal data…", required: true },
      ...commonEnd,
    ],
    party1Key: "controller", party1Label: "Controller",
    party2Key: "processor", party2Label: "Processor",
  },
  "partnership": {
    coverFields: [
      { key: "effectiveDate", label: "Effective Date", type: "date", required: true },
      { key: "partnershipPurpose", label: "Partnership Purpose", type: "textarea", placeholder: "Describe the purpose of the partnership…", required: true },
      { key: "revenueSplit", label: "Revenue Split", type: "input", placeholder: "50/50", required: true },
      ...commonEnd,
    ],
    party1Key: "partner1", party1Label: "Partner 1",
    party2Key: "partner2", party2Label: "Partner 2",
  },
  "software-license": {
    coverFields: [
      { key: "effectiveDate", label: "Effective Date", type: "date", required: true },
      { key: "softwareName", label: "Software Name", type: "input", placeholder: "Acme Platform", required: true },
      { key: "licenseType", label: "License Type", type: "input", placeholder: "Perpetual / Annual", required: true },
      { key: "licenseFees", label: "License Fees", type: "input", placeholder: "$10,000 / year", required: false },
      ...commonEnd,
    ],
    party1Key: "provider", party1Label: "Provider",
    party2Key: "customer", party2Label: "Customer",
  },
  "pilot": {
    coverFields: [
      { key: "effectiveDate", label: "Effective Date", type: "date", required: true },
      { key: "pilotDuration", label: "Pilot Duration", type: "input", placeholder: "90 days", required: true },
      { key: "pilotScope", label: "Pilot Scope", type: "textarea", placeholder: "Describe what is being trialed…", required: true },
      { key: "pilotFees", label: "Pilot Fees", type: "input", placeholder: "No charge / $5,000", required: false },
      ...commonEnd,
    ],
    party1Key: "provider", party1Label: "Provider",
    party2Key: "customer", party2Label: "Customer",
  },
  "baa": {
    coverFields: [
      { key: "effectiveDate", label: "Effective Date", type: "date", required: true },
      { key: "phiScope", label: "PHI Scope", type: "textarea", placeholder: "Describe the protected health information in scope…", required: true },
      { key: "servicesDescription", label: "Services Description", type: "textarea", placeholder: "Describe the services involving PHI…", required: true },
      ...commonEnd,
    ],
    party1Key: "coveredEntity", party1Label: "Covered Entity",
    party2Key: "businessAssociate", party2Label: "Business Associate",
  },
  "ai-addendum": {
    coverFields: [
      { key: "effectiveDate", label: "Effective Date", type: "date", required: true },
      { key: "aiSystemName", label: "AI System", type: "input", placeholder: "Acme AI Assistant", required: true },
      { key: "trainingPermissions", label: "Training Permissions", type: "input", placeholder: "No training on customer data", required: true },
      { key: "outputOwnership", label: "Output Ownership", type: "input", placeholder: "Customer owns all outputs", required: true },
      ...commonEnd,
    ],
    party1Key: "provider", party1Label: "Provider",
    party2Key: "customer", party2Label: "Customer",
  },
};
