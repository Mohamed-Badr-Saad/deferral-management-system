// src/app/(dashboard)/deferrals/new/page.tsx
import { DeferralForm } from "@/components/deferral/DeferralForm";

export default function NewDeferralPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">New Deferral Request</h1>
        <p className="text-muted-foreground mt-2">
          Create a new maintenance and inspection activity deferral request
        </p>
      </div>
      <DeferralForm />
    </div>
  );
}
