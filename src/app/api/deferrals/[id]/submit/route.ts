// src/app/api/deferrals/[id]/submit/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { headers } from 'next/headers';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Get deferral
    const deferral = await db.deferral.findUnique({
      where: { id },
    });

    if (!deferral) {
      return NextResponse.json(
        { error: 'Deferral not found' },
        { status: 404 }
      );
    }

    // Check if user is initiator
    if (deferral.initiatorId !== session.user.id) {
      return NextResponse.json(
        { error: 'Only the initiator can submit this deferral' },
        { status: 403 }
      );
    }

    // Check if already submitted
    if (deferral.status !== 'draft') {
      return NextResponse.json(
        { error: 'Deferral has already been submitted' },
        { status: 400 }
      );
    }

    // Update status to submitted
    const updatedDeferral = await db.deferral.update({
      where: { id },
      data: {
        status: 'submitted',
        submittedAt: new Date(),
      },
    });

    // Create audit log
    await db.auditLog.create({
      data: {
        deferralId: id,
        userId: session.user.id,
        action: 'DEFERRAL_SUBMITTED',
        details: { deferralCode: deferral.deferralCode },
      },
    });

    // Create notification for reliability team
    // Get users with reliability role
    const reliabilityUsers = await db.user.findMany({
      where: {
        role: 'reliability',
      },
    });

    // Create notifications
    await db.notification.createMany({
      data: reliabilityUsers.map(user => ({
        userId: user.id,
        deferralId: id,
        type: 'new_submission',
        message: `New deferral ${deferral.deferralCode} submitted by ${deferral.initiatorName} from ${deferral.department} department`,
      })),
    });

    return NextResponse.json({
      success: true,
      data: updatedDeferral,
      message: 'Deferral submitted successfully',
    });
  } catch (error) {
    console.error('Error submitting deferral:', error);
    return NextResponse.json(
      { error: 'Failed to submit deferral' },
      { status: 500 }
    );
  }
}
