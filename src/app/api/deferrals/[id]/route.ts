// src/app/api/deferrals/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  deferrals,
  attachments,
  auditLogs,
  notifications,
  users,
} from "@/lib/db/schema"; // ← Add users here
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";

// GET - Fetch single deferral
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Fetch deferral with related data using Drizzle query API
    const deferral = await db.query.deferrals.findFirst({
      where: eq(deferrals.id, id),
      with: {
        initiator: {
          columns: {
            id: true,
            name: true,
            email: true,
            department: true,
            position: true,
          },
        },
        attachments: true,
      },
    });

    if (!deferral) {
      return NextResponse.json(
        { error: "Deferral not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: deferral,
    });
  } catch (error) {
    console.error("Error fetching deferral:", error);
    return NextResponse.json(
      { error: "Failed to fetch deferral" },
      { status: 500 }
    );
  }
}

// PATCH - Update deferral
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    // Check if deferral exists and user has permission
    const existingDeferral = await db.query.deferrals.findFirst({
      where: eq(deferrals.id, id),
    });

    if (!existingDeferral) {
      return NextResponse.json(
        { error: "Deferral not found" },
        { status: 404 }
      );
    }

    // Only allow initiator to edit draft or returned deferrals
    if (existingDeferral.initiatorId !== session.user.id) {
      return NextResponse.json(
        { error: "You do not have permission to edit this deferral" },
        { status: 403 }
      );
    }

    // Only allow editing of draft or returned deferrals
    if (
      existingDeferral.status !== "draft" &&
      existingDeferral.status !== "returned"
    ) {
      return NextResponse.json(
        { error: "This deferral cannot be edited" },
        { status: 400 }
      );
    }

    // Extract attachment files from body
    const { attachmentFiles, ...updateData } = body;

    // Convert date strings to Date objects
    if (updateData.deferralRequestDate) {
      updateData.deferralRequestDate = new Date(updateData.deferralRequestDate);
    }
    if (updateData.currentLAFD) {
      updateData.currentLAFD = new Date(updateData.currentLAFD);
    }
    if (updateData.deferredToNewLAFD) {
      updateData.deferredToNewLAFD = new Date(updateData.deferredToNewLAFD);
    }
    if (updateData.submittedAt) {
      updateData.submittedAt = new Date(updateData.submittedAt);
    }

    // Update deferral
    const [updatedDeferral] = await db
      .update(deferrals)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(deferrals.id, id))
      .returning();

    // Create new attachments if provided
    if (attachmentFiles && attachmentFiles.length > 0) {
      await db.insert(attachments).values(
        attachmentFiles.map((file: any) => ({
          id: createId(),
          deferralId: id,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size.toString(),
          filePath: file.path,
          uploadedBy: session.user.id,
        }))
      );
    }

    // Create audit log
    await db.insert(auditLogs).values({
      id: createId(),
      deferralId: id,
      userId: session.user.id,
      action: "DEFERRAL_UPDATED",
      details: {
        status: updateData.status,
        changes: Object.keys(updateData),
      },
    });

    // If resubmitted, create notification for reliability team
    if (updateData.status === "submitted") {
      try {
        // Get reliability users
        const reliabilityUsers = await db.query.users.findMany({
          where: eq(users.role, "reliability"),
        });

        // Create notifications
        if (reliabilityUsers.length > 0) {
          await db.insert(notifications).values(
            reliabilityUsers.map((user) => ({
              id: createId(),
              userId: user.id,
              deferralId: id,
              type: "deferral_resubmitted",
              message: `Deferral ${updatedDeferral.deferralCode} has been resubmitted by ${updatedDeferral.initiatorName}`,
            }))
          );
        }
      } catch (notifError) {
        // Don't fail the whole request if notifications fail
        console.error("Error creating notifications:", notifError);
      }
    }

    return NextResponse.json({
      success: true,
      data: updatedDeferral,
      message:
        updateData.status === "submitted"
          ? "Deferral resubmitted successfully"
          : "Deferral updated successfully",
    });
  } catch (error) {
    console.error("Error updating deferral:", error);
    return NextResponse.json(
      { error: "Failed to update deferral" },
      { status: 500 }
    );
  }
}

// DELETE - Delete deferral
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check if deferral exists
    const deferral = await db.query.deferrals.findFirst({
      where: eq(deferrals.id, id),
    });

    if (!deferral) {
      return NextResponse.json(
        { error: "Deferral not found" },
        { status: 404 }
      );
    }

    // Only allow deletion of own draft deferrals
    if (
      deferral.initiatorId !== session.user.id ||
      deferral.status !== "draft"
    ) {
      return NextResponse.json(
        { error: "You can only delete your own draft deferrals" },
        { status: 403 }
      );
    }

    // Delete deferral (cascades to attachments, notifications, audit logs due to schema)
    await db.delete(deferrals).where(eq(deferrals.id, id));

    return NextResponse.json({
      success: true,
      message: "Deferral deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting deferral:", error);
    return NextResponse.json(
      { error: "Failed to delete deferral" },
      { status: 500 }
    );
  }
}
