import { NextResponse }  from "next/server";
import { auth }          from "@/auth";
import connectDb         from "@/lib/db";
import Cart              from "@/models/cart.model";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ count: 0 });
  }

  await connectDb();

  const cart = await Cart.findOne({ user: session.user.id })
    .select("items.quantity")
    .lean();

  const count = cart
    ? cart.items.reduce((s, i) => s + i.quantity, 0)
    : 0;

  return NextResponse.json(
    { count },
    { headers: { "Cache-Control": "no-store" } },
  );
}