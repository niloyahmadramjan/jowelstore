import { type NextRequest, NextResponse } from "next/server";
import { auth }    from "@/auth";
import connectDb   from "@/lib/db";
import User        from "@/models/user.model";

/* ── GET /api/profile ──────────────────────────────── */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await connectDb();

  const user = await User.findById(session.user.id)
    .select("-password -__v")
    .lean();

  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ user });
}

/* ── PATCH /api/profile ─ update profile ──────────── */
export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json() as {
    name?:        string;
    phone?:       string;
    dateOfBirth?: string;
    gender?:      string;
    image?:      string;
    preferences?: {
      newsletter?:  boolean;
      smsAlerts?:   boolean;
      emailAlerts?: boolean;
    };
  };

  const allowed: Record<string, unknown> = {};
  if (body.name        !== undefined) allowed.name        = body.name.trim();
  if (body.phone       !== undefined) allowed.phone       = body.phone.trim();
  if (body.dateOfBirth !== undefined) allowed.dateOfBirth = new Date(body.dateOfBirth);
  if (body.gender      !== undefined) allowed.gender      = body.gender;
  if (body.image      !== undefined) allowed.image      = body.image;
  if (body.preferences !== undefined) {
    allowed["preferences.newsletter"]  = body.preferences.newsletter;
    allowed["preferences.smsAlerts"]   = body.preferences.smsAlerts;
    allowed["preferences.emailAlerts"] = body.preferences.emailAlerts;
  }

  await connectDb();

  const user = await User.findByIdAndUpdate(
    session.user.id,
    { $set: allowed },
    { new: true, runValidators: true },
  ).select("-password -__v").lean();

  return NextResponse.json({ user, message: "Profile updated successfully" });
}