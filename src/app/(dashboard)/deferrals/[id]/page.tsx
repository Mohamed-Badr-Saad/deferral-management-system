// src/app/(dashboard)/deferrals/[id]/page.tsx
"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Calendar,
  User,
  Building,
  FileText,
  AlertTriangle,
  Shield,
  Paperclip,
  CheckCircle,
  Clock,
  PenTool,
  Printer,
} from "lucide-react";
import { formatDate, formatDateTime } from "@/lib/utils";
import { STATUS_LABELS, STATUS_COLORS } from "@/lib/constants";
import type { Deferral } from "@/types";

export default function DeferralDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [deferral, setDeferral] = useState<Deferral | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDeferral();
  }, [resolvedParams.id]);

  const fetchDeferral = async () => {
    try {
      const response = await fetch(`/api/deferrals/${resolvedParams.id}`);
      const result = await response.json();

      if (result.success) {
        setDeferral(result.data);
      }
    } catch (error) {
      console.error("Error fetching deferral:", error);
    } finally {
      setIsLoading(false);
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
        <p className="text-muted-foreground mb-4">
          The deferral you&apos;re looking for doesn&apos;t exist.
        </p>
        <Button onClick={() => router.push("/deferrals")}>
          Back to Deferrals
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{deferral.deferralCode}</h1>
            <p className="text-muted-foreground mt-1">
              {deferral.equipmentDescription}
            </p>
          </div>
        </div>
        <Badge
          variant="secondary"
          className={`text-base px-4 py-2 ${
            STATUS_COLORS[deferral.status as keyof typeof STATUS_COLORS]
          }`}
        >
          {STATUS_LABELS[deferral.status as keyof typeof STATUS_LABELS]}
        </Badge>

        <div className="flex gap-2">
          <Badge
            variant="secondary"
            className={`text-base px-4 py-2 ${
              STATUS_COLORS[deferral.status as keyof typeof STATUS_COLORS]
            }`}
          >
            {STATUS_LABELS[deferral.status as keyof typeof STATUS_LABELS]}
          </Badge>

          {deferral.status === "fully_approved" && (
            <Link
              href={`/api/deferrals/${deferral.id}/pdf`}
              download
              className=" flex fle-row justify-center items-center gap-2 text-base px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              <div>
                <Printer className="h-4 w-4 mr-1" />
              </div>
              <div>Download PDF</div>
            </Link>
          )}
        </div>
      </div>

      <Tabs defaultValue="details" className="space-y-6">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="risk">Risk Assessment</TabsTrigger>
          <TabsTrigger value="mitigations">Mitigations</TabsTrigger>
          <TabsTrigger value="attachments">Attachments</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="signatures">Signatures</TabsTrigger>
        </TabsList>

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-6">
          {/* Initiator Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Initiator Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Name
                </p>
                <p className="text-lg">{deferral.initiatorName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Job Title
                </p>
                <p className="text-lg">{deferral.jobTitle}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Department
                </p>
                <p className="text-lg">{deferral.department}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Request Date
                </p>
                <p className="text-lg">
                  {formatDate(deferral.deferralRequestDate)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Equipment Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Equipment Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Description
                </p>
                <p className="text-lg">{deferral.equipmentDescription}</p>
              </div>

              {deferral.workOrderNumbers &&
                deferral.workOrderNumbers.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Work Order Numbers
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {deferral.workOrderNumbers.map((wo, index) => (
                        <Badge key={index} variant="outline">
                          {wo}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

              {deferral.equipmentFullCodes &&
                deferral.equipmentFullCodes.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Equipment Codes
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {deferral.equipmentFullCodes.map((code, index) => (
                        <Badge key={index} variant="outline">
                          {code}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {deferral.equipmentSafetyCriticality && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Equipment Safety Criticality
                    </p>
                    <Badge variant="secondary" className="mt-1">
                      {deferral.equipmentSafetyCriticality}
                    </Badge>
                  </div>
                )}
                {deferral.taskCriticality && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Task Criticality
                    </p>
                    <Badge variant="secondary" className="mt-1">
                      {deferral.taskCriticality}
                    </Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Dates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Request Date
                </p>
                <p className="text-lg">
                  {formatDate(deferral.deferralRequestDate)}
                </p>
              </div>
              {deferral.currentLAFD && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Current LAFD
                  </p>
                  <p className="text-lg">{formatDate(deferral.currentLAFD)}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Deferred To (New LAFD)
                </p>
                <p className="text-lg font-semibold text-primary">
                  {formatDate(deferral.deferredToNewLAFD)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Descriptions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  Description
                </p>
                <p className="text-base leading-relaxed">
                  {deferral.description}
                </p>
              </div>
              <Separator />
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  Justification
                </p>
                <p className="text-base leading-relaxed">
                  {deferral.justification}
                </p>
              </div>
              <Separator />
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  Consequence
                </p>
                <p className="text-base leading-relaxed">
                  {deferral.consequence}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Risk Assessment Tab */}
        <TabsContent value="risk" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Risk Assessment
              </CardTitle>
              <CardDescription>
                Evaluation of potential risks associated with deferring this
                activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              {deferral.riskAssessment ? (
                <div className="space-y-6">
                  {Object.entries(deferral.riskAssessment as any).map(
                    ([category, risk]: [string, any]) => (
                      <div key={category} className="border rounded-lg p-4">
                        <h4 className="font-semibold text-lg mb-3 capitalize">
                          {category}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Severity
                            </p>
                            <Badge variant="secondary" className="mt-1">
                              {risk.severity || "Not assessed"}
                            </Badge>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Likelihood
                            </p>
                            <Badge variant="secondary" className="mt-1">
                              {risk.likelihood || "Not assessed"}
                            </Badge>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">
                            Justification
                          </p>
                          <p className="text-base">
                            {risk.justification || "No justification provided"}
                          </p>
                        </div>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No risk assessment provided
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Mitigations Tab */}
        <TabsContent value="mitigations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Mitigation Actions
              </CardTitle>
              <CardDescription>
                Actions to mitigate risks while the activity is deferred
              </CardDescription>
            </CardHeader>
            <CardContent>
              {deferral.mitigations &&
              (deferral.mitigations as any[]).length > 0 ? (
                <div className="space-y-4">
                  {(deferral.mitigations as any[]).map((mitigation, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold">
                          Action #{mitigation.actionNo}
                        </h4>
                        {mitigation.date && (
                          <Badge variant="outline">
                            {formatDate(mitigation.date)}
                          </Badge>
                        )}
                      </div>
                      <p className="text-base mb-3">{mitigation.action}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div>
                          <span className="font-medium">Owner:</span>{" "}
                          {mitigation.owner}
                        </div>
                        {mitigation.comments && (
                          <div>
                            <span className="font-medium">Comments:</span>{" "}
                            {mitigation.comments}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No mitigation actions defined
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Attachments Tab */}
        <TabsContent value="attachments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Paperclip className="h-5 w-5" />
                Attachments
              </CardTitle>
            </CardHeader>
            <CardContent>
              {deferral.attachments && deferral.attachments.length > 0 ? (
                <div className="space-y-2">
                  {deferral.attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{attachment.fileName}</p>
                          <p className="text-sm text-muted-foreground">
                            {attachment.fileSize} •{" "}
                            {formatDateTime(attachment.uploadedAt)}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <a
                          href={attachment.filePath}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Download
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No attachments
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Activity History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="h-3 w-3 rounded-full bg-primary"></div>
                    <div className="w-px h-full bg-border"></div>
                  </div>
                  <div className="pb-4">
                    <p className="font-medium">Deferral Created</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDateTime(deferral.createdAt)}
                    </p>
                    <p className="text-sm mt-1">
                      Created by {deferral.initiatorName}
                    </p>
                  </div>
                </div>

                {deferral.submittedAt && (
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="h-3 w-3 rounded-full bg-primary"></div>
                      <div className="w-px h-full bg-border"></div>
                    </div>
                    <div className="pb-4">
                      <p className="font-medium">Deferral Submitted</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDateTime(deferral.submittedAt)}
                      </p>
                    </div>
                  </div>
                )}

                {deferral.reviewedAt && (
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="h-3 w-3 rounded-full bg-primary"></div>
                    </div>
                    <div>
                      <p className="font-medium">Reviewed</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDateTime(deferral.reviewedAt)}
                      </p>
                      {deferral.reviewComments && (
                        <p className="text-sm mt-1 bg-muted p-2 rounded">
                          {deferral.reviewComments}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Signature Tab */}
        <TabsContent value="signatures" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PenTool className="h-5 w-5" />
                Electronic Signatures
              </CardTitle>
              <CardDescription>
                Approval signatures for this deferral
              </CardDescription>
            </CardHeader>
            <CardContent>
              {deferral.requiredSignatures &&
              deferral.requiredSignatures.length > 0 ? (
                <div className="space-y-4">
                  {deferral.requiredSignatures.map((roleId: string) => {
                    const signature = (deferral.signatures as any)?.[roleId];
                    const roleLabels: Record<string, string> = {
                      maintenance_manager: "Maintenance Manager",
                      operations_manager: "Operations Manager",
                      technical_authority: "Technical Authority",
                      plant_manager: "Plant Manager",
                    };

                    return (
                      <div key={roleId} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-lg">
                              {roleLabels[roleId] || roleId}
                            </h4>
                            {signature ? (
                              <div className="mt-2 space-y-1">
                                <p className="text-sm">
                                  <span className="font-medium">
                                    Signed by:
                                  </span>{" "}
                                  {signature.name}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {signature.position} - {signature.department}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {signature.email}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  <span className="font-medium">Date:</span>{" "}
                                  {formatDateTime(signature.timestamp)}
                                </p>
                                {signature.comments && (
                                  <p className="text-sm mt-2 p-2 bg-muted rounded">
                                    <span className="font-medium">
                                      Comments:
                                    </span>{" "}
                                    {signature.comments}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground mt-1">
                                Pending signature
                              </p>
                            )}
                          </div>
                          {signature ? (
                            <CheckCircle className="h-6 w-6 text-green-500" />
                          ) : (
                            <Clock className="h-6 w-6 text-yellow-500" />
                          )}
                        </div>

                        {signature && (
                          <div className="mt-4 pt-4 border-t">
                            <div className="text-center">
                              <div className="inline-block border-2 border-primary px-6 py-3 rounded">
                                <p className="font-signature text-2xl text-primary">
                                  {signature.name}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Electronically Signed
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No signatures required for this deferral
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
