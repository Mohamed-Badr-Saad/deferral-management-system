import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { notifications, deferrals } from '@/lib/db/schema';
import { headers } from 'next/headers';
import { desc, eq } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rows = await db
      .select({
        id: notifications.id,
        deferralId: notifications.deferralId,
        type: notifications.type,
        message: notifications.message,
        read: notifications.read,
        createdAt: notifications.createdAt,
        deferralCode: deferrals.deferralCode,
      })
      .from(notifications)
      .leftJoin(deferrals, eq(deferrals.id, notifications.deferralId))
      .where(eq(notifications.userId, session.user.id))
      .orderBy(desc(notifications.createdAt))
      .limit(20);

    const data = (rows || []).map(r => ({
      id: r.id,
      deferralId: r.deferralId ?? null,
      type: r.type ?? 'unknown',
      message: r.message ?? '',
      read: Boolean(r.read),
      createdAt: r.createdAt,
      deferralCode: r.deferralCode ?? null,
    }));

    const unreadCount = data.filter(n => !n.read).length;

    return NextResponse.json({
      success: true,
      data,
      unreadCount,
    });
  } catch (error) {
    console.error('Error fetching notifications (GET):', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications', details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  // mark all as read
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await db
      .update(notifications)
      .set({ read: true })
      .where(eq(notifications.userId, session.user.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking notifications as read (POST):', error);
    return NextResponse.json(
      { error: 'Failed to mark as read', details: String(error) },
      { status: 500 }
    );
  }
}
