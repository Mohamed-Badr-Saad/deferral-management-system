// src/app/(dashboard)/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  AlertTriangle,
  Users,
  Calendar,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { STATUS_LABELS, STATUS_COLORS } from "@/lib/constants";
import type { Deferral } from "@/types";

export default function DashboardPage() {
  const { data: session } = useSession();
  const [deferrals, setDeferrals] = useState<Deferral[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("/api/deferrals");
      const result = await response.json();

      if (result.success) {
        setDeferrals(result.data);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate statistics
  const stats = {
    total: deferrals.length,
    pending: deferrals.filter(
      (d) => d.status === "submitted" || d.status === "under_review"
    ).length,
    approved: deferrals.filter((d) => d.status === "fully_approved").length,
    returned: deferrals.filter((d) => d.status === "returned").length,
    myDeferrals: deferrals.filter((d) => d.initiatorId === session?.user?.id)
      .length,
    pendingSignatures: deferrals.filter(
      (d) =>
        d.status === "pending_signatures" || d.status === "partially_approved"
    ).length,
  };

  // Recent deferrals
  const recentDeferrals = deferrals
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 5);

  // Deferrals needing attention
  const needsAttention = deferrals.filter((d) => {
    if (session?.user?.role === "reliability") {
      return d.status === "submitted";
    }
    if (session?.user?.role === "approver" || session?.user?.role === "admin") {
      const signatures = (d.signatures as any) || {};
      const userRole = session?.user?.role || "user";
      return d.requiredSignatures?.includes(userRole) && !signatures[userRole];
    }
    return d.status === "returned" && d.initiatorId === session?.user?.id;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold">
          Welcome back, {session?.user?.name}!
        </h1>
        <p className="text-muted-foreground mt-2">
          Here's what's happening with your deferrals today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Deferrals
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              All deferral requests
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Review
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting reliability review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approved}</div>
            <p className="text-xs text-muted-foreground">
              Fully approved deferrals
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Deferrals</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.myDeferrals}</div>
            <p className="text-xs text-muted-foreground">
              Your submitted requests
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Action Required Section */}
      {needsAttention.length > 0 && (
        <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
              <AlertTriangle className="h-5 w-5" />
              Action Required
            </CardTitle>
            <CardDescription className="text-yellow-700 dark:text-yellow-300">
              You have {needsAttention.length} item(s) that need your attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {needsAttention.slice(0, 3).map((deferral) => (
                <div
                  key={deferral.id}
                  className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{deferral.deferralCode}</p>
                    <p className="text-sm text-muted-foreground truncate max-w-md">
                      {deferral.equipmentDescription}
                    </p>
                  </div>
                  <Link
                    href={
                      deferral.status === "submitted" &&
                      session?.user?.role === "reliability"
                        ? `/reliability/review/${deferral.id}`
                        : deferral.status === "returned"
                        ? `/deferrals/${deferral.id}/edit`
                        : `/approvals/sign/${deferral.id}`
                    }
                  >
                    <Button size="sm">
                      {deferral.status === "submitted"
                        ? "Review"
                        : deferral.status === "returned"
                        ? "Revise"
                        : "Sign"}
                    </Button>
                  </Link>
                </div>
              ))}
              {needsAttention.length > 3 && (
                <p className="text-sm text-center text-muted-foreground">
                  +{needsAttention.length - 3} more items
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Two Column Layout */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Deferrals */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Deferrals</CardTitle>
                <CardDescription>Latest deferral requests</CardDescription>
              </div>
              <Link href="/deferrals">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentDeferrals.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No deferrals yet</p>
                <Link href="/deferrals/new">
                  <Button className="mt-4" size="sm">
                    Create Your First Deferral
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Equipment</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentDeferrals.map((deferral) => (
                      <TableRow key={deferral.id}>
                        <TableCell className="font-medium">
                          {deferral.deferralCode}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {deferral.equipmentDescription}
                        </TableCell>
                        <TableCell>{deferral.department}</TableCell>
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
                        <TableCell>{formatDate(deferral.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <Link href={`/deferrals/${deferral.id}`}>
                            <Button variant="ghost" size="sm">
                              View
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Link href="/deferrals/new" className="block">
              <Card className="hover:bg-accent transition-colors cursor-pointer">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">New Deferral</p>
                      <p className="text-sm text-muted-foreground">
                        Create request
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/deferrals/my-deferrals" className="block">
              <Card className="hover:bg-accent transition-colors cursor-pointer">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">My Deferrals</p>
                      <p className="text-sm text-muted-foreground">
                        {stats.myDeferrals} requests
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {session?.user?.role === "reliability" && (
              <Link href="/reliability" className="block">
                <Card className="hover:bg-accent transition-colors cursor-pointer">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <CheckCircle className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Review Queue</p>
                        <p className="text-sm text-muted-foreground">
                          {stats.pending} pending
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )}

            {(session?.user?.role === "approver" ||
              session?.user?.role === "admin") && (
              <Link href="/approvals" className="block">
                <Card className="hover:bg-accent transition-colors cursor-pointer">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <CheckCircle className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Approvals</p>
                        <p className="text-sm text-muted-foreground">
                          {stats.pendingSignatures} pending
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
