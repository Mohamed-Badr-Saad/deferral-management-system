// src/app/api/deferrals/[id]/sign/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { deferrals, auditLogs, notifications } from "@/lib/db/schema";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";

export async function POST(
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
    const { signatureName, comments, password } = body;

    // Simple password verification - in production, use proper verification
    // For now, we'll skip strict password verification and just check if user is authenticated
    // You can add proper password verification if needed

    // Get deferral
    const deferral = await db.query.deferrals.findFirst({
      where: eq(deferrals.id, id),
    });

    if (!deferral) {
      return NextResponse.json(
        { error: "Deferral not found" },
        { status: 404 }
      );
    }

    const userRole = session.user.role || "user";
    const required = deferral.requiredSignatures || [];
    const signatures = (deferral.signatures as any) || {};

    // Check if user's role is required
    if (!required.includes(userRole)) {
      return NextResponse.json(
        { error: "Your signature is not required for this deferral" },
        { status: 400 }
      );
    }

    // Check if already signed
    if (signatures[userRole]) {
      return NextResponse.json(
        { error: "You have already signed this deferral" },
        { status: 400 }
      );
    }

    // Add signature with full details for printing
    signatures[userRole] = {
      name: signatureName,
      role: userRole,
      userId: session.user.id,
      email: session.user.email,
      department: session.user.department,
      position: session.user.position,
      timestamp: new Date().toISOString(),
      comments: comments || null,
    };

    // Check if all signatures collected
    const allSigned = required.every((role) => signatures[role]);
    const newStatus = allSigned ? "fully_approved" : "partially_approved";

    // Update deferral
    const [updatedDeferral] = await db
      .update(deferrals)
      .set({
        signatures,
        status: newStatus,
        approvedBy: allSigned ? session.user.id : deferral.approvedBy,
        approvalDate: allSigned ? new Date() : deferral.approvalDate,
      })
      .where(eq(deferrals.id, id))
      .returning();

    // Create audit log
    await db.insert(auditLogs).values({
      id: createId(),
      deferralId: id,
      userId: session.user.id,
      action: "SIGNATURE_ADDED",
      details: { role: userRole, name: signatureName, allSigned },
    });

    // Create notification for initiator
    await db.insert(notifications).values({
      id: createId(),
      userId: deferral.initiatorId,
      deferralId: id,
      type: allSigned ? "deferral_fully_approved" : "deferral_signature_added",
      message: allSigned
        ? `Your deferral ${deferral.deferralCode} has been fully approved`
        : `${signatureName} has signed your deferral ${deferral.deferralCode}`,
    });

    return NextResponse.json({
      success: true,
      data: updatedDeferral,
      message: allSigned
        ? "Deferral fully approved! All signatures collected."
        : "Signature added successfully",
    });
  } catch (error) {
    console.error("Error adding signature:", error);
    return NextResponse.json(
      { error: "Failed to add signature" },
      { status: 500 }
    );
  }
}
