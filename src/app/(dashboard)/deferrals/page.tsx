// src/app/(dashboard)/deferrals/page.tsx
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, FileText, Filter } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { STATUS_LABELS, STATUS_COLORS } from '@/lib/constants';
import type { Deferral } from '@/types';

export default function DeferralsPage() {
  const [deferrals, setDeferrals] = useState<Deferral[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDeferrals();
  }, []);

  const fetchDeferrals = async () => {
    try {
      const response = await fetch('/api/deferrals');
      const result = await response.json();
      
      if (result.success) {
        setDeferrals(result.data);
      }
    } catch (error) {
      console.error('Error fetching deferrals:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">All Deferrals</h1>
          <p className="text-muted-foreground mt-2">
            View and manage all deferral requests
          </p>
        </div>
        <Link href="/deferrals/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Deferral
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Deferrals</CardDescription>
            <CardTitle className="text-3xl">{deferrals.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Submitted</CardDescription>
            <CardTitle className="text-3xl">
              {deferrals.filter(d => d.status === 'submitted').length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Under Review</CardDescription>
            <CardTitle className="text-3xl">
              {deferrals.filter(d => d.status === 'under_review').length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Approved</CardDescription>
            <CardTitle className="text-3xl">
              {deferrals.filter(d => d.status === 'fully_approved').length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Deferrals Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Deferral Requests</CardTitle>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {deferrals.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No deferrals found</h3>
              <p className="text-muted-foreground mb-4">
                Get started by creating your first deferral request
              </p>
              <Link href="/deferrals/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Deferral
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
                    <TableHead>Initiator</TableHead>
                    <TableHead>Request Date</TableHead>
                    <TableHead>New LAFD</TableHead>
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
                        {formatDate(deferral.deferralRequestDate)}
                      </TableCell>
                      <TableCell>
                        {formatDate(deferral.deferredToNewLAFD)}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="secondary"
                          className={STATUS_COLORS[deferral.status as keyof typeof STATUS_COLORS]}
                        >
                          {STATUS_LABELS[deferral.status as keyof typeof STATUS_LABELS]}
                        </Badge>
                      </TableCell>
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
  );
}
