// src/app/api/deferrals/[id]/review/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { deferrals, auditLogs, notifications } from '@/lib/db/schema';
import { headers } from 'next/headers';
import { eq } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { action, comments, requiredSignatures } = body;

    // Get deferral
    const deferral = await db.query.deferrals.findFirst({
      where: eq(deferrals.id, id),
    });

    if (!deferral) {
      return NextResponse.json({ error: 'Deferral not found' }, { status: 404 });
    }

    if (action === 'approve') {
      // Update deferral status to pending signatures
      const [updatedDeferral] = await db
        .update(deferrals)
        .set({
          status: 'pending_signatures',
          reviewedAt: new Date(),
          reviewedBy: session.user.id,
          reviewComments: comments,
          requiredSignatures: requiredSignatures || [],
        })
        .where(eq(deferrals.id, id))
        .returning();

      // Create audit log
      await db.insert(auditLogs).values({
        id: createId(),
        deferralId: id,
        userId: session.user.id,
        action: 'DEFERRAL_APPROVED',
        details: { comments, requiredSignatures },
      });

      // Create notification for initiator
      await db.insert(notifications).values({
        id: createId(),
        userId: deferral.initiatorId,
        deferralId: id,
        type: 'deferral_approved',
        message: `Your deferral ${deferral.deferralCode} has been approved and is pending signatures`,
      });

      return NextResponse.json({
        success: true,
        data: updatedDeferral,
        message: 'Deferral approved successfully',
      });
    } else if (action === 'return') {
      // Return to initiator
      const [updatedDeferral] = await db
        .update(deferrals)
        .set({
          status: 'returned',
          reviewedAt: new Date(),
          reviewedBy: session.user.id,
          reviewComments: comments,
        })
        .where(eq(deferrals.id, id))
        .returning();

      // Create audit log
      await db.insert(auditLogs).values({
        id: createId(),
        deferralId: id,
        userId: session.user.id,
        action: 'DEFERRAL_RETURNED',
        details: { comments },
      });

      // Create notification for initiator
      await db.insert(notifications).values({
        id: createId(),
        userId: deferral.initiatorId,
        deferralId: id,
        type: 'deferral_returned',
        message: `Your deferral ${deferral.deferralCode} has been returned for revision`,
      });

      return NextResponse.json({
        success: true,
        data: updatedDeferral,
        message: 'Deferral returned to initiator',
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error reviewing deferral:', error);
    return NextResponse.json({ error: 'Failed to review deferral' }, { status: 500 });
  }
}
