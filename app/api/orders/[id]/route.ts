import { type NextRequest, NextResponse } from "next/server";
import { auth }    from "@/auth";
import connectDb   from "@/lib/db";
import Order       from "@/models/order.model";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await connectDb();

  const order = await Order.findOne({
    _id:  id,
    user: session.user.id,
  }).lean();

  if (!order) {
    return NextResponse.json({ message: "Order not found" }, { status: 404 });
  }

  return NextResponse.json({ order });
}