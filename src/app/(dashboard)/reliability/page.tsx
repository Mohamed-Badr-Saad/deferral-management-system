// src/app/(dashboard)/reliability/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
import { Clock, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { STATUS_LABELS, STATUS_COLORS } from "@/lib/constants";
import type { Deferral } from "@/types";

export default function ReliabilityDashboard() {
  const [deferrals, setDeferrals] = useState<Deferral[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDeferrals();
  }, []);

  const fetchDeferrals = async () => {
    try {
      const response = await fetch("/api/deferrals");
      const result = await response.json();

      if (result.success) {
        setDeferrals(result.data);
      }
    } catch (error) {
      console.error("Error fetching deferrals:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const pendingDeferrals = deferrals.filter((d) => d.status === "submitted");
  const underReviewDeferrals = deferrals.filter(
    (d) => d.status === "under_review"
  );
  const approvedDeferrals = deferrals.filter(
    (d) =>
      d.status === "pending_signatures" ||
      d.status === "partially_approved" ||
      d.status === "fully_approved"
  );
  const returnedDeferrals = deferrals.filter((d) => d.status === "returned");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading deferrals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Reliability Review Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Review and manage deferral requests
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Review
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingDeferrals.length}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting initial review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Under Review</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {underReviewDeferrals.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently being reviewed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedDeferrals.length}</div>
            <p className="text-xs text-muted-foreground">Awaiting signatures</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Returned</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{returnedDeferrals.length}</div>
            <p className="text-xs text-muted-foreground">
              Sent back to initiator
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different statuses */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">
            Pending Review ({pendingDeferrals.length})
          </TabsTrigger>
          <TabsTrigger value="under_review">
            Under Review ({underReviewDeferrals.length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved ({approvedDeferrals.length})
          </TabsTrigger>
          <TabsTrigger value="returned">
            Returned ({returnedDeferrals.length})
          </TabsTrigger>
        </TabsList>

        {/* Pending Review Tab */}
        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Review</CardTitle>
              <CardDescription>
                Deferrals awaiting initial review
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingDeferrals.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No pending deferrals
                </p>
              ) : (
                <DeferralsTable deferrals={pendingDeferrals} showReviewAction />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Under Review Tab */}
        <TabsContent value="under_review">
          <Card>
            <CardHeader>
              <CardTitle>Under Review</CardTitle>
              <CardDescription>
                Deferrals currently being reviewed
              </CardDescription>
            </CardHeader>
            <CardContent>
              {underReviewDeferrals.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No deferrals under review
                </p>
              ) : (
                <DeferralsTable
                  deferrals={underReviewDeferrals}
                  showReviewAction
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Approved Tab */}
        <TabsContent value="approved">
          <Card>
            <CardHeader>
              <CardTitle>Approved</CardTitle>
              <CardDescription>
                Deferrals approved and awaiting signatures
              </CardDescription>
            </CardHeader>
            <CardContent>
              {approvedDeferrals.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No approved deferrals
                </p>
              ) : (
                <DeferralsTable deferrals={approvedDeferrals} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Returned Tab */}
        <TabsContent value="returned">
          <Card>
            <CardHeader>
              <CardTitle>Returned</CardTitle>
              <CardDescription>
                Deferrals returned to initiator for revision
              </CardDescription>
            </CardHeader>
            <CardContent>
              {returnedDeferrals.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No returned deferrals
                </p>
              ) : (
                <DeferralsTable deferrals={returnedDeferrals} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Reusable table component
function DeferralsTable({
  deferrals,
  showReviewAction = false,
}: {
  deferrals: Deferral[];
  showReviewAction?: boolean;
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
            <TableHead>Submitted</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {deferrals.map((deferral) => (
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
                {deferral.submittedAt ? formatDate(deferral.submittedAt) : "-"}
              </TableCell>
              <TableCell>
                <Badge
                  variant="secondary"
                  className={
                    STATUS_COLORS[deferral.status as keyof typeof STATUS_COLORS]
                  }
                >
                  {STATUS_LABELS[deferral.status as keyof typeof STATUS_LABELS]}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex gap-2 justify-end">
                  {showReviewAction && (
                    <Link href={`/reliability/review/${deferral.id}`}>
                      <Button size="sm">Review</Button>
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
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
