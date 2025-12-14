// src/app/api/admin/make-admin/route.ts
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

const ADMIN_SECRET = process.env.MAKE_ADMIN_SECRET; // optional but recommended

export async function POST(req: NextRequest) {
  try {
    const { email, secret } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 },
      );
    }

    if (ADMIN_SECRET && secret !== ADMIN_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await db
      .update(users)
      .set({ role: "admin" })
      .where(eq(users.email, email));

    return NextResponse.json({
      success: true,
      message: "User promoted to admin",
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
