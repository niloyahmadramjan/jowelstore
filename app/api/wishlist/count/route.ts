import { NextResponse } from "next/server";
import { auth }         from "@/auth";
import connectDb        from "@/lib/db";
import Wishlist         from "@/models/wishlist.model";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ count: 0 });

  await connectDb();

  const wishlist = await Wishlist.findOne({ user: session.user.id })
    .select("items")
    .lean();

  return NextResponse.json(
    { count: wishlist?.items.length ?? 0 },
    { headers: { "Cache-Control": "no-store" } },
  );
}