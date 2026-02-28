import { NdaForm } from "@/components/nda/NdaForm";

export default function HomePage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Mutual NDA Creator</h2>
        <p className="text-muted-foreground mt-1">
          Fill in the details below to generate a Mutual Non-Disclosure Agreement.
        </p>
      </div>
      <NdaForm />
    </div>
  );
}
