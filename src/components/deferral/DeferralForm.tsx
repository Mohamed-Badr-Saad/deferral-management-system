// src/components/deferral/DeferralForm.tsx
"use client";

import { useState } from "react";
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
import { toast } from "sonner";
import { BasicInfoSection } from "./BasicInfoSection";
import { DatesSection } from "./DatesSection";
import { DescriptionsSection } from "./DescriptionsSection";
import { RiskAssessmentSection } from "./RiskAssessmentSection";
import { MitigationsSection } from "./MitigationsSection";
import { AttachmentsSection } from "./AttachmentsSection";
import type { DeferralFormData } from "@/types";

export function DeferralForm() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");

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
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);

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

  const handleSaveDraft = async () => {
    setIsLoading(true);
    try {
      // Upload files first
      const files = await uploadFiles();

      const response = await fetch("/api/deferrals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
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
      setIsLoading(false);
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

    setIsLoading(true);
    try {
      // Upload files first
      const files = await uploadFiles();

      const response = await fetch("/api/deferrals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          status: "submitted",
          attachmentFiles: files,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(result.message);
        router.push("/deferrals");
      } else {
        toast.error(result.error || "Failed to submit deferral");
      }
    } catch (error) {
      toast.error("Failed to submit deferral");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            Maintenance and Inspection Activity Deferral Form
          </CardTitle>
          <CardDescription>
            Complete all sections to submit a deferral request
          </CardDescription>
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
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <Button
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <div className="space-x-2">
              <Button
                variant="outline"
                onClick={handleSaveDraft}
                disabled={isLoading}
              >
                Save Draft
              </Button>
              <Button onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? "Submitting..." : "Submit Deferral"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
