// src/app/(dashboard)/approvals/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PenTool, Clock, CheckCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { STATUS_LABELS, STATUS_COLORS } from "@/lib/constants";
import type { Deferral } from "@/types";

export default function ApprovalsPage() {
  const { data: session } = useSession();
  const [deferrals, setDeferrals] = useState<Deferral[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDeferrals();
  }, []);

  const fetchDeferrals = async () => {
    try {
      // Fetch all deferrals
      const response = await fetch("/api/deferrals");
      const result = await response.json();

      if (result.success) {
        // Filter for deferrals with pending signatures or partially approved
        const signatureDeferrals = result.data.filter(
          (d: Deferral) =>
            d.status === "pending_signatures" ||
            d.status === "partially_approved" ||
            d.status === "fully_approved"
        );
        setDeferrals(signatureDeferrals);
      }
    } catch (error) {
      console.error("Error fetching deferrals:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter deferrals needing my signature
  const pendingMySignature = deferrals.filter((d) => {
    const signatures = (d.signatures as any) || {};
    const required = d.requiredSignatures || [];
    const userRole = session?.user?.role || "user";

    // Check if user's role is in required signatures and hasn't signed yet
    return required.includes(userRole) && !signatures[userRole];
  });

  // Filter deferrals I've already signed
  const alreadySigned = deferrals.filter((d) => {
    const signatures = (d.signatures as any) || {};
    const userRole = session?.user?.role || "user";
    return signatures[userRole];
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading approvals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Approvals & Signatures</h1>
        <p className="text-muted-foreground mt-2">
          Review and sign deferral requests
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending My Signature
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pendingMySignature.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Awaiting your approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Already Signed
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alreadySigned.length}</div>
            <p className="text-xs text-muted-foreground">You have approved</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pending</CardTitle>
            <PenTool className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{deferrals.length}</div>
            <p className="text-xs text-muted-foreground">
              All pending signatures
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">
            Pending My Signature ({pendingMySignature.length})
          </TabsTrigger>
          <TabsTrigger value="signed">
            Already Signed ({alreadySigned.length})
          </TabsTrigger>
          <TabsTrigger value="all">All ({deferrals.length})</TabsTrigger>
        </TabsList>

        {/* Pending My Signature Tab */}
        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Your Signature</CardTitle>
              <CardDescription>
                Deferrals awaiting your approval
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingMySignature.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No pending signatures</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    You're all caught up!
                  </p>
                </div>
              ) : (
                <ApprovalsTable deferrals={pendingMySignature} showSignAction />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Already Signed Tab */}
        <TabsContent value="signed">
          <Card>
            <CardHeader>
              <CardTitle>Already Signed</CardTitle>
              <CardDescription>Deferrals you have approved</CardDescription>
            </CardHeader>
            <CardContent>
              {alreadySigned.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No signed deferrals
                </p>
              ) : (
                <ApprovalsTable deferrals={alreadySigned} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* All Tab */}
        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Pending Signatures</CardTitle>
              <CardDescription>
                All deferrals in signature workflow
              </CardDescription>
            </CardHeader>
            <CardContent>
              {deferrals.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No deferrals pending signatures
                </p>
              ) : (
                <ApprovalsTable deferrals={deferrals} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Reusable table component
function ApprovalsTable({
  deferrals,
  showSignAction = false,
}: {
  deferrals: Deferral[];
  showSignAction?: boolean;
}) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Equipment</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Initiator</TableHead>
            <TableHead>Signatures</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {deferrals.map((deferral) => {
            const signatures = (deferral.signatures as any) || {};
            const required = deferral.requiredSignatures || [];
            const signedCount = Object.keys(signatures).length;

            return (
              <TableRow key={deferral.id}>
                <TableCell className="font-medium">
                  {deferral.deferralCode}
                </TableCell>
                <TableCell className="max-w-xs truncate">
                  {deferral.equipmentDescription}
                </TableCell>
                <TableCell>{deferral.department}</TableCell>
                <TableCell>{deferral.initiatorName}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">
                      {signedCount} / {required.length}
                    </span>
                    {signedCount === required.length && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={
                      STATUS_COLORS[
                        deferral.status as keyof typeof STATUS_COLORS
                      ]
                    }
                  >
                    {
                      STATUS_LABELS[
                        deferral.status as keyof typeof STATUS_LABELS
                      ]
                    }
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-2 justify-end">
                    {showSignAction && (
                      <Link href={`/approvals/sign/${deferral.id}`}>
                        <Button size="sm">Sign</Button>
                      </Link>
                    )}
                    <Link href={`/deferrals/${deferral.id}`}>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
