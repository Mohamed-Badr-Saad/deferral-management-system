// src/app/(dashboard)/reliability/review/[id]/page.tsx
"use client";

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { formatDate } from '@/lib/utils';
import type { Deferral } from '@/types';

const SIGNATURE_ROLES = [
  { id: 'maintenance_manager', label: 'Maintenance Manager' },
  { id: 'operations_manager', label: 'Operations Manager' },
  { id: 'technical_authority', label: 'Technical Authority' },
  { id: 'plant_manager', label: 'Plant Manager' },
];

export default function ReviewDeferralPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { data: session } = useSession();
  const [deferral, setDeferral] = useState<Deferral | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [reviewComments, setReviewComments] = useState('');
  const [requiredSignatures, setRequiredSignatures] = useState<string[]>([]);

  useEffect(() => {
    fetchDeferral();
  }, [resolvedParams.id]);

  const fetchDeferral = async () => {
    try {
      const response = await fetch(`/api/deferrals/${resolvedParams.id}`);
      const result = await response.json();
      
      if (result.success) {
        setDeferral(result.data);
        setRequiredSignatures(result.data.requiredSignatures || []);
      }
    } catch (error) {
      console.error('Error fetching deferral:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async () => {
    if (requiredSignatures.length === 0) {
      toast.error('Please select at least one required signature');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/deferrals/${resolvedParams.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'approve',
          comments: reviewComments,
          requiredSignatures,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('Deferral approved successfully');
        router.push('/reliability');
      } else {
        toast.error(result.error || 'Failed to approve deferral');
      }
    } catch (error) {
      toast.error('Failed to approve deferral');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReturn = async () => {
    if (!reviewComments.trim()) {
      toast.error('Please provide comments for returning the deferral');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/deferrals/${resolvedParams.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'return',
          comments: reviewComments,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('Deferral returned to initiator');
        router.push('/reliability');
      } else {
        toast.error(result.error || 'Failed to return deferral');
      }
    } catch (error) {
      toast.error('Failed to return deferral');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleSignature = (roleId: string) => {
    setRequiredSignatures(prev =>
      prev.includes(roleId)
        ? prev.filter(id => id !== roleId)
        : [...prev, roleId]
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading deferral...</p>
        </div>
      </div>
    );
  }

  if (!deferral) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">Deferral not found</h2>
        <Button onClick={() => router.push('/reliability')}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Review Deferral</h1>
          <p className="text-muted-foreground mt-1">{deferral.deferralCode}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Deferral Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Equipment Info */}
          <Card>
            <CardHeader>
              <CardTitle>Equipment Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Equipment Description</Label>
                <p className="text-lg">{deferral.equipmentDescription}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Safety Criticality</Label>
                  <Badge variant="secondary" className="mt-1">{deferral.equipmentSafetyCriticality}</Badge>
                </div>
                <div>
                  <Label className="text-muted-foreground">Task Criticality</Label>
                  <Badge variant="secondary" className="mt-1">{deferral.taskCriticality}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Descriptions */}
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Description</Label>
                <p className="mt-1">{deferral.description}</p>
              </div>
              <Separator />
              <div>
                <Label className="text-muted-foreground">Justification</Label>
                <p className="mt-1">{deferral.justification}</p>
              </div>
              <Separator />
              <div>
                <Label className="text-muted-foreground">Consequence</Label>
                <p className="mt-1">{deferral.consequence}</p>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-muted-foreground">Request Date</Label>
                <p className="text-lg">{formatDate(deferral.deferralRequestDate)}</p>
              </div>
              {deferral.currentLAFD && (
                <div>
                  <Label className="text-muted-foreground">Current LAFD</Label>
                  <p className="text-lg">{formatDate(deferral.currentLAFD)}</p>
                </div>
              )}
              <div>
                <Label className="text-muted-foreground">New LAFD</Label>
                <p className="text-lg font-semibold text-primary">{formatDate(deferral.deferredToNewLAFD)}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Review Actions */}
        <div className="space-y-6">
          {/* Initiator Info */}
          <Card>
            <CardHeader>
              <CardTitle>Submitted By</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{deferral.initiatorName}</p>
              <p className="text-sm text-muted-foreground">{deferral.jobTitle}</p>
              <p className="text-sm text-muted-foreground">{deferral.department}</p>
              <p className="text-sm text-muted-foreground mt-2">
                {deferral.submittedAt ? formatDate(deferral.submittedAt) : 'Draft'}
              </p>
            </CardContent>
          </Card>

          {/* Required Signatures */}
          <Card>
            <CardHeader>
              <CardTitle>Required Signatures</CardTitle>
              <CardDescription>Select who needs to sign off</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {SIGNATURE_ROLES.map((role) => (
                <div key={role.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={role.id}
                    checked={requiredSignatures.includes(role.id)}
                    onCheckedChange={() => toggleSignature(role.id)}
                  />
                  <Label
                    htmlFor={role.id}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {role.label}
                  </Label>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Review Comments */}
          <Card>
            <CardHeader>
              <CardTitle>Review Comments</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Add your review comments here..."
                value={reviewComments}
                onChange={(e) => setReviewComments(e.target.value)}
                rows={5}
              />
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              className="w-full"
              size="lg"
              onClick={handleApprove}
              disabled={isSubmitting}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve Deferral
            </Button>
            <Button
              className="w-full"
              variant="destructive"
              size="lg"
              onClick={handleReturn}
              disabled={isSubmitting}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Return to Initiator
            </Button>
            <Button
              className="w-full"
              variant="outline"
              onClick={() => router.push('/reliability')}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
