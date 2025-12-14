// src/app/(dashboard)/approvals/sign/[id]/page.tsx
"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, PenTool, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { formatDate, formatDateTime } from "@/lib/utils";
import type { Deferral } from "@/types";

const ROLE_LABELS: Record<string, string> = {
  maintenance_manager: "Maintenance Manager",
  operations_manager: "Operations Manager",
  technical_authority: "Technical Authority",
  plant_manager: "Plant Manager",
};

export default function SignDeferralPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { data: session } = useSession();
  const [deferral, setDeferral] = useState<Deferral | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [signatureName, setSignatureName] = useState("");
  const [comments, setComments] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (session?.user) {
      setSignatureName(session.user.name || "");
      fetchDeferral();
    }
  }, [resolvedParams.id, session]);

  const fetchDeferral = async () => {
    try {
      console.log("Fetching deferral:", resolvedParams.id);
      const response = await fetch(`/api/deferrals/${resolvedParams.id}`);
      const result = await response.json();

      console.log("Deferral fetch result:", result);

      if (result.success) {
        setDeferral(result.data);
      } else {
        toast.error("Failed to load deferral");
      }
    } catch (error) {
      console.error("Error fetching deferral:", error);
      toast.error("Failed to load deferral");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSign = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("Sign button clicked");

    if (!signatureName.trim()) {
      toast.error("Please enter your name");
      return;
    }

    if (!password.trim()) {
      toast.error("Please enter your password to confirm");
      return;
    }

    setIsSubmitting(true);
    console.log("Submitting signature...");

    try {
      const response = await fetch(`/api/deferrals/${resolvedParams.id}/sign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signatureName,
          comments,
          password,
        }),
      });

      console.log("Sign response status:", response.status);
      const result = await response.json();
      console.log("Sign response:", result);

      if (response.ok) {
        toast.success(result.message || "Signature added successfully");
        setTimeout(() => {
          router.push("/approvals");
        }, 1000);
      } else {
        toast.error(result.error || "Failed to add signature");
      }
    } catch (error) {
      console.error("Error signing:", error);
      toast.error("Failed to add signature");
    } finally {
      setIsSubmitting(false);
    }
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
        <Button onClick={() => router.push("/approvals")}>
          Back to Approvals
        </Button>
      </div>
    );
  }

  const signatures = (deferral.signatures as any) || {};
  const required = deferral.requiredSignatures || [];
  const userRole = session?.user?.role || "user";
  const hasUserSigned = signatures[userRole];

  if (hasUserSigned) {
    return (
      <div className="text-center py-12">
        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Already Signed</h2>
        <p className="text-muted-foreground mb-4">
          You have already signed this deferral
        </p>
        <Button onClick={() => router.push("/approvals")}>
          Back to Approvals
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
          <h1 className="text-3xl font-bold">Sign Deferral</h1>
          <p className="text-muted-foreground mt-1">{deferral.deferralCode}</p>
        </div>
      </div>

      <form onSubmit={handleSign}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Deferral Summary */}
          <div className="lg:col-span-2 space-y-6">
            {/* Deferral Info */}
            <Card>
              <CardHeader>
                <CardTitle>Deferral Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-muted-foreground">Equipment</Label>
                  <p className="text-lg">{deferral.equipmentDescription}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Department</Label>
                    <p>{deferral.department}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Initiator</Label>
                    <p>{deferral.initiatorName}</p>
                  </div>
                </div>

                <Separator />

                <div>
                  <Label className="text-muted-foreground">Description</Label>
                  <p>{deferral.description}</p>
                </div>

                <div>
                  <Label className="text-muted-foreground">Justification</Label>
                  <p>{deferral.justification}</p>
                </div>

                <Separator />

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-muted-foreground">
                      Request Date
                    </Label>
                    <p>{formatDate(deferral.deferralRequestDate)}</p>
                  </div>
                  {deferral.currentLAFD && (
                    <div>
                      <Label className="text-muted-foreground">
                        Current LAFD
                      </Label>
                      <p>{formatDate(deferral.currentLAFD)}</p>
                    </div>
                  )}
                  <div>
                    <Label className="text-muted-foreground">New LAFD</Label>
                    <p className="font-semibold text-primary">
                      {formatDate(deferral.deferredToNewLAFD)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Existing Signatures */}
            <Card>
              <CardHeader>
                <CardTitle>Signature Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {required.map((role) => {
                    const signature = signatures[role];
                    return (
                      <div
                        key={role}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">
                            {ROLE_LABELS[role] || role}
                          </p>
                          {signature && (
                            <p className="text-sm text-muted-foreground">
                              Signed by {signature.name} on{" "}
                              {formatDateTime(signature.timestamp)}
                            </p>
                          )}
                        </div>
                        {signature ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : role === userRole ? (
                          <Badge
                            variant="outline"
                            className="text-yellow-700 border-yellow-500"
                          >
                            Your Turn
                          </Badge>
                        ) : (
                          <AlertCircle className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Signature Form */}
          <div className="space-y-6">
            {/* Signature Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PenTool className="h-5 w-5" />
                  Your Signature
                </CardTitle>
                <CardDescription>
                  Sign as {ROLE_LABELS[userRole] || userRole}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={signatureName}
                    onChange={(e) => setSignatureName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="comments">Comments (Optional)</Label>
                  <Textarea
                    id="comments"
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="Add any comments..."
                    rows={4}
                  />
                </div>

                <Separator />

                <div>
                  <Label htmlFor="password">Confirm Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Enter your password to confirm your signature
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Warning */}
            <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                      Important Notice
                    </p>
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      By signing this deferral, you acknowledge that you have
                      reviewed the information and approve the deferral request.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isSubmitting}
              >
                <PenTool className="h-4 w-4 mr-2" />
                {isSubmitting ? "Signing..." : "Sign Deferral"}
              </Button>
              <Button
                type="button"
                className="w-full"
                variant="outline"
                onClick={() => router.push("/approvals")}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
