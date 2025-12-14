// src/app/(dashboard)/deferrals/[id]/edit/page.tsx
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { BasicInfoSection } from "@/components/deferral/BasicInfoSection";
import { DatesSection } from "@/components/deferral/DatesSection";
import { DescriptionsSection } from "@/components/deferral/DescriptionsSection";
import { RiskAssessmentSection } from "@/components/deferral/RiskAssessmentSection";
import { MitigationsSection } from "@/components/deferral/MitigationsSection";
import { AttachmentsSection } from "@/components/deferral/AttachmentsSection";
import type { DeferralFormData, Deferral } from "@/types";

export default function EditDeferralPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [originalDeferral, setOriginalDeferral] = useState<Deferral | null>(
    null
  );

  const [formData, setFormData] = useState<Partial<DeferralFormData>>({
    initiatorName: session?.user?.name || "",
    jobTitle: session?.user?.position || "",
    department: session?.user?.department as any,
    workOrderNumbers: [],
    equipmentFullCodes: [],
    equipmentDescription: "",
    description: "",
    justification: "",
    consequence: "",
    deferralRequestDate: new Date(),
    mitigations: [],
  });

  const [attachments, setAttachments] = useState<File[]>([]);

  useEffect(() => {
    if (session?.user) {
      fetchDeferral();
    }
  }, [resolvedParams.id, session]);

  const fetchDeferral = async () => {
    try {
      const response = await fetch(`/api/deferrals/${resolvedParams.id}`);
      const result = await response.json();

      if (result.success) {
        const deferral = result.data;
        setOriginalDeferral(deferral);

        // Check if user can edit
        if (deferral.initiatorId !== session?.user?.id) {
          toast.error("You do not have permission to edit this deferral");
          router.push("/deferrals/my-deferrals");
          return;
        }

        if (deferral.status !== "draft" && deferral.status !== "returned") {
          toast.error("This deferral cannot be edited");
          router.push(`/deferrals/${resolvedParams.id}`);
          return;
        }

        // Populate form with existing data
        setFormData({
          initiatorName: deferral.initiatorName,
          jobTitle: deferral.jobTitle,
          department: deferral.department,
          workOrderNumbers: deferral.workOrderNumbers || [],
          equipmentFullCodes: deferral.equipmentFullCodes || [],
          equipmentDescription: deferral.equipmentDescription,
          equipmentSafetyCriticality: deferral.equipmentSafetyCriticality,
          taskCriticality: deferral.taskCriticality,
          deferralRequestDate: new Date(deferral.deferralRequestDate),
          currentLAFD: deferral.currentLAFD
            ? new Date(deferral.currentLAFD)
            : undefined,
          deferredToNewLAFD: new Date(deferral.deferredToNewLAFD),
          description: deferral.description,
          justification: deferral.justification,
          consequence: deferral.consequence,
          riskAssessment: deferral.riskAssessment,
          mitigations: deferral.mitigations || [],
        });
      }
    } catch (error) {
      console.error("Error fetching deferral:", error);
      toast.error("Failed to load deferral");
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const uploadFiles = async () => {
    const uploaded = [];
    for (const file of attachments) {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        uploaded.push(result.file);
      }
    }
    return uploaded;
  };

  // src/app/(dashboard)/deferrals/[id]/edit/page.tsx

  const handleSaveDraft = async () => {
    setIsSubmitting(true);
    try {
      // Upload new files if any
      const files = attachments.length > 0 ? await uploadFiles() : [];

      const response = await fetch(`/api/deferrals/${resolvedParams.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          // Convert dates to ISO strings
          deferralRequestDate: formData.deferralRequestDate?.toISOString(),
          currentLAFD: formData.currentLAFD?.toISOString() || null,
          deferredToNewLAFD: formData.deferredToNewLAFD?.toISOString(),
          status: "draft",
          attachmentFiles: files,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(result.message);
        router.push("/deferrals/my-deferrals");
      } else {
        toast.error(result.error || "Failed to save draft");
      }
    } catch (error) {
      toast.error("Failed to save draft");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.equipmentDescription) {
      toast.error("Please fill in equipment description");
      setActiveTab("basic");
      return;
    }

    if (!formData.deferredToNewLAFD) {
      toast.error("Please select deferred LAFD date");
      setActiveTab("dates");
      return;
    }

    if (
      !formData.description ||
      !formData.justification ||
      !formData.consequence
    ) {
      toast.error("Please fill in all description fields");
      setActiveTab("descriptions");
      return;
    }

    setIsSubmitting(true);
    try {
      // Upload new files if any
      const files = attachments.length > 0 ? await uploadFiles() : [];

      const response = await fetch(`/api/deferrals/${resolvedParams.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          // Convert dates to ISO strings
          deferralRequestDate: formData.deferralRequestDate?.toISOString(),
          currentLAFD: formData.currentLAFD?.toISOString() || null,
          deferredToNewLAFD: formData.deferredToNewLAFD?.toISOString(),
          status: "submitted",
          submittedAt: new Date().toISOString(),
          // Clear review fields when resubmitting
          reviewedAt: null,
          reviewedBy: null,
          reviewComments: null,
          attachmentFiles: files,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("Deferral resubmitted successfully");
        router.push("/deferrals/my-deferrals");
      } else {
        toast.error(result.error || "Failed to submit deferral");
      }
    } catch (error) {
      toast.error("Failed to submit deferral");
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Edit Deferral</h1>
          <p className="text-muted-foreground mt-1">
            {originalDeferral?.deferralCode}
          </p>
        </div>
      </div>

      {/* Review Comments Alert */}
      {originalDeferral?.status === "returned" &&
        originalDeferral?.reviewComments && (
          <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
            <CardHeader>
              <CardTitle className="text-yellow-800 dark:text-yellow-200">
                Reviewer Comments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-yellow-900 dark:text-yellow-100">
                {originalDeferral.reviewComments}
              </p>
            </CardContent>
          </Card>
        )}

      <Card>
        <CardHeader>
          <CardTitle>
            Maintenance and Inspection Activity Deferral Form
          </CardTitle>
          <CardDescription>Update the information and resubmit</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="dates">Dates</TabsTrigger>
              <TabsTrigger value="descriptions">Details</TabsTrigger>
              <TabsTrigger value="risk">Risk</TabsTrigger>
              <TabsTrigger value="mitigations">Mitigations</TabsTrigger>
              <TabsTrigger value="attachments">Attachments</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 mt-6">
              <BasicInfoSection
                formData={formData}
                updateFormData={updateFormData}
              />
            </TabsContent>

            <TabsContent value="dates" className="space-y-4 mt-6">
              <DatesSection
                formData={formData}
                updateFormData={updateFormData}
              />
            </TabsContent>

            <TabsContent value="descriptions" className="space-y-4 mt-6">
              <DescriptionsSection
                formData={formData}
                updateFormData={updateFormData}
              />
            </TabsContent>

            <TabsContent value="risk" className="space-y-4 mt-6">
              <RiskAssessmentSection
                formData={formData}
                updateFormData={updateFormData}
              />
            </TabsContent>

            <TabsContent value="mitigations" className="space-y-4 mt-6">
              <MitigationsSection
                formData={formData}
                updateFormData={updateFormData}
              />
            </TabsContent>

            <TabsContent value="attachments" className="space-y-4 mt-6">
              <AttachmentsSection
                attachments={attachments}
                setAttachments={setAttachments}
              />

              {/* Show existing attachments */}
              {originalDeferral?.attachments &&
                originalDeferral.attachments.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Existing Attachments</h4>
                    <div className="space-y-2">
                      {originalDeferral.attachments.map((file: any) => (
                        <div
                          key={file.id}
                          className="flex items-center justify-between p-2 border rounded"
                        >
                          <span className="text-sm">{file.fileName}</span>
                          <Button variant="ghost" size="sm" asChild>
                            <a
                              href={file.filePath}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              View
                            </a>
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <Button
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <div className="space-x-2">
              <Button
                variant="outline"
                onClick={handleSaveDraft}
                disabled={isSubmitting}
              >
                Save Draft
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Resubmit Deferral"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
