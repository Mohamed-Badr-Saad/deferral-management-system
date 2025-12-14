'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate, formatDateTime } from '@/lib/utils';
import type { Deferral } from '@/types';
import { ArrowLeft, Printer } from 'lucide-react';

const ROLE_LABELS: Record<string, string> = {
  maintenance_manager: 'Maintenance Manager',
  operations_manager: 'Operations Manager',
  technical_authority: 'Technical Authority',
  plant_manager: 'Plant Manager',
};

export default function PrintDeferralPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [deferral, setDeferral] = useState<Deferral | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/deferrals/${resolvedParams.id}`);
        const data = await res.json();
        if (data.success) setDeferral(data.data);
      } finally {
        setLoading(false);
      }
    })();
  }, [resolvedParams.id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading || !deferral) {
    return (
      <div className="flex items-center justify-center h-96 print:hidden">
        <p className="text-muted-foreground">Loading deferral...</p>
      </div>
    );
  }

  const signatures = (deferral.signatures as any) || {};
  const required = deferral.requiredSignatures || [];

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto print-full">
      {/* Controls (hidden on print) */}
      <div className="flex items-center justify-between mb-4 print-hide">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Print Deferral</h1>
        </div>
        <Button onClick={handlePrint}>
          <Printer className="h-4 w-4 mr-2" />
          Print
        </Button>
      </div>

      {/* Printable content */}
      <div className="bg-white text-black p-6 md:p-10 shadow print:shadow-none print:border print:border-black/20">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-bold uppercase">
              Maintenance & Inspection Activity Deferral
            </h2>
            <p className="text-sm mt-1">
              Deferral Code: <span className="font-semibold">{deferral.deferralCode}</span>
            </p>
          </div>
          <div className="text-right text-xs">
            <p>Generated on {formatDateTime(new Date().toISOString())}</p>
          </div>
        </div>

        {/* Section 1: Equipment & Basic info */}
        <Card className="mb-4 shadow-none border print:border-black/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">1. Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="font-semibold">Equipment Description</p>
              <p>{deferral.equipmentDescription}</p>
            </div>
            <div>
              <p className="font-semibold">Department</p>
              <p>{deferral.department}</p>
            </div>
            <div>
              <p className="font-semibold">Safety Criticality</p>
              <p>{deferral.equipmentSafetyCriticality}</p>
            </div>
            <div>
              <p className="font-semibold">Task Criticality</p>
              <p>{deferral.taskCriticality}</p>
            </div>
            <div>
              <p className="font-semibold">Initiator</p>
              <p>{deferral.initiatorName}</p>
            </div>
            <div>
              <p className="font-semibold">Job Title</p>
              <p>{deferral.jobTitle}</p>
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Description / Justification / Consequence */}
        <Card className="mb-4 shadow-none border print:border-black/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">2. Deferral Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="font-semibold">Description of Activity</p>
              <p className="whitespace-pre-wrap">{deferral.description}</p>
            </div>
            <div>
              <p className="font-semibold">Justification</p>
              <p className="whitespace-pre-wrap">{deferral.justification}</p>
            </div>
            <div>
              <p className="font-semibold">Consequence of Not Performing</p>
              <p className="whitespace-pre-wrap">{deferral.consequence}</p>
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Dates */}
        <Card className="mb-4 shadow-none border print:border-black/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">3. Dates</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-3 text-sm">
            <div>
              <p className="font-semibold">Request Date</p>
              <p>{formatDate(deferral.deferralRequestDate)}</p>
            </div>
            {deferral.currentLAFD && (
              <div>
                <p className="font-semibold">Current LAFD</p>
                <p>{formatDate(deferral.currentLAFD)}</p>
              </div>
            )}
            <div>
              <p className="font-semibold">Deferred LAFD</p>
              <p>{formatDate(deferral.deferredToNewLAFD)}</p>
            </div>
          </CardContent>
        </Card>

        {/* Section 4: Reliability review */}
        {(deferral.reviewComments || deferral.reviewedAt) && (
          <Card className="mb-4 shadow-none border print:border-black/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">
                4. Reliability Review
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {deferral.reviewComments && (
                <div>
                  <p className="font-semibold">Reviewer Comments</p>
                  <p className="whitespace-pre-wrap">{deferral.reviewComments}</p>
                </div>
              )}
              {deferral.reviewedAt && (
                <p className="text-xs">
                  Reviewed on {formatDateTime(deferral.reviewedAt)}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Section 5: Signatures */}
        <Card className="mt-6 shadow-none border print:border-black/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">5. Electronic Signatures</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-sm">
            {required.length === 0 ? (
              <p>No signatures required.</p>
            ) : (
              required.map(roleId => {
                const sig = signatures[roleId];
                return (
                  <div key={roleId} className="border border-dashed p-3 min-h-[120px] flex flex-col justify-between">
                    <div>
                      <p className="font-semibold mb-1">
                        {ROLE_LABELS[roleId] || roleId}
                      </p>
                      {sig ? (
                        <>
                          <p>Name: {sig.name}</p>
                          <p>Position: {sig.position}</p>
                          <p>Department: {sig.department}</p>
                          <p>Date: {formatDateTime(sig.timestamp)}</p>
                        </>
                      ) : (
                        <p className="italic text-muted-foreground">
                          Pending signature
                        </p>
                      )}
                    </div>
                    {sig && (
                      <div className="mt-2 pt-2 border-t text-center">
                        <p className="font-signature text-xl">
                          {sig.name}
                        </p>
                        <p className="text-[10px] uppercase tracking-wide">
                          Electronically signed
                        </p>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
