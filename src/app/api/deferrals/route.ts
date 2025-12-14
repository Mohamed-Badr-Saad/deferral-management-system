// src/app/api/deferrals/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { deferrals, users, attachments } from "@/lib/db/schema";
import { generateDeferralCode } from "@/lib/utils";
import { headers } from "next/headers";
import { eq, and, desc } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";

// GET - Fetch all deferrals
export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const department = searchParams.get("department");
    const userId = searchParams.get("userId");

    // Build where conditions
    const conditions = [];
    if (status) conditions.push(eq(deferrals.status, status));
    if (department) conditions.push(eq(deferrals.department, department));
    if (userId) conditions.push(eq(deferrals.initiatorId, userId));

    const allDeferrals = await db
      .select()
      .from(deferrals)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(deferrals.createdAt));

    return NextResponse.json({
      success: true,
      data: allDeferrals,
    });
  } catch (error) {
    console.error("Error fetching deferrals:", error);
    return NextResponse.json(
      { error: "Failed to fetch deferrals" },
      { status: 500 }
    );
  }
}

// POST - Create new deferral
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      initiatorName,
      jobTitle,
      department,
      workOrderNumbers,
      equipmentFullCodes,
      equipmentDescription,
      equipmentSafetyCriticality,
      taskCriticality,
      deferralRequestDate,
      currentLAFD,
      deferredToNewLAFD,
      description,
      justification,
      consequence,
      riskAssessment,
      mitigations,
      status = "draft",
      attachmentFiles,
    } = body;

    const deferralCode = generateDeferralCode();
    const deferralId = createId(); // ← Generate ID

    const [deferral] = await db
      .insert(deferrals)
      .values({
        id: deferralId, // ← Add ID
        deferralCode,
        initiatorId: session.user.id,
        initiatorName,
        jobTitle,
        department,
        workOrderNumbers: workOrderNumbers || [],
        equipmentFullCodes: equipmentFullCodes || [],
        equipmentDescription,
        equipmentSafetyCriticality,
        taskCriticality,
        deferralRequestDate: new Date(deferralRequestDate),
        currentLAFD: currentLAFD ? new Date(currentLAFD) : null,
        deferredToNewLAFD: new Date(deferredToNewLAFD),
        description,
        justification,
        consequence,
        riskAssessment: riskAssessment || null,
        mitigations: mitigations || null,
        status,
        submittedAt: status === "submitted" ? new Date() : null,
        requiredSignatures: [],
      })
      .returning();

    // Create attachments if provided
    if (attachmentFiles && attachmentFiles.length > 0) {
      await db.insert(attachments).values(
        attachmentFiles.map((file: any) => ({
          id: createId(), // ← Generate ID for each attachment
          deferralId: deferral.id,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size.toString(),
          filePath: file.path,
          uploadedBy: session.user.id,
        }))
      );
    }

    return NextResponse.json({
      success: true,
      data: deferral,
      message:
        status === "submitted"
          ? "Deferral submitted successfully"
          : "Draft saved successfully",
    });
  } catch (error) {
    console.error("Error creating deferral:", error);
    return NextResponse.json(
      { error: "Failed to create deferral" },
      { status: 500 }
    );
  }
}
