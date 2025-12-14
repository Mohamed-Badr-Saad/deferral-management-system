// src/app/(dashboard)/deferrals/my-deferrals/page.tsx
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, FileText } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { STATUS_LABELS, STATUS_COLORS } from '@/lib/constants';
import { toast } from 'sonner';
import type { Deferral } from '@/types';

export default function MyDeferralsPage() {
  const { data: session } = useSession();
  const [deferrals, setDeferrals] = useState<Deferral[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      fetchMyDeferrals();
    }
  }, [session]);

  const fetchMyDeferrals = async () => {
    try {
      const response = await fetch(`/api/deferrals?userId=${session?.user?.id}`);
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

  const handleDelete = async (id: string, deferralCode: string) => {
    if (!confirm(`Are you sure you want to delete draft deferral ${deferralCode}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/deferrals/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('Deferral deleted successfully');
        // Refresh the list
        fetchMyDeferrals();
      } else {
        toast.error(result.error || 'Failed to delete deferral');
      }
    } catch (error) {
      toast.error('Failed to delete deferral');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your deferrals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">My Deferrals</h1>
          <p className="text-muted-foreground mt-2">
            View and manage your submitted deferral requests
          </p>
        </div>
        <Link href="/deferrals/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Deferral
          </Button>
        </Link>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Your Deferral Requests ({deferrals.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {deferrals.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No deferrals yet</h3>
              <p className="text-muted-foreground mb-4">
                You haven&apos;t submitted any deferral requests
              </p>
              <Link href="/deferrals/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
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
                    <TableHead>Request Date</TableHead>
                    <TableHead>New LAFD</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deferrals.map((deferral) => (
                    <TableRow 
                      key={deferral.id}
                      className={
                        deferral.status === 'returned' 
                          ? 'bg-yellow-50 dark:bg-yellow-950/20 hover:bg-yellow-100 dark:hover:bg-yellow-950/30' 
                          : ''
                      }
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {deferral.deferralCode}
                          {deferral.status === 'returned' && (
                            <Badge variant="outline" className="text-yellow-700 border-yellow-500">
                              Action Required
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {deferral.equipmentDescription}
                      </TableCell>
                      <TableCell>
                        {formatDate(deferral.deferralRequestDate)}
                      </TableCell>
                      <TableCell>
                        {formatDate(deferral.deferredToNewLAFD)}
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
                          {(deferral.status === "draft" ||
                            deferral.status === "returned") && (
                            <Link href={`/deferrals/${deferral.id}/edit`}>
                              <Button 
                                variant={deferral.status === "returned" ? "default" : "ghost"} 
                                size="sm"
                              >
                                {deferral.status === "returned" ? "Revise" : "Edit"}
                              </Button>
                            </Link>
                          )}
                          <Link href={`/deferrals/${deferral.id}`}>
                            <Button variant="ghost" size="sm">
                              View
                            </Button>
                          </Link>
                          {deferral.status === "draft" && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDelete(deferral.id, deferral.deferralCode)}
                            >
                              Delete
                            </Button>
                          )}
                        </div>
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
