import { type NextRequest, NextResponse } from "next/server";
import { auth }    from "@/auth";
import connectDb   from "@/lib/db";
import Cart        from "@/models/cart.model";
import Coupon      from "@/models/coupon.model";

/* POST /api/cart/coupon — apply coupon */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { code } = await req.json() as { code: string };
  if (!code)
    return NextResponse.json({ message: "Coupon code required" }, { status: 400 });

  await connectDb();

  const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

  if (!coupon)
    return NextResponse.json({ message: "Invalid or expired coupon" }, { status: 400 });

  if (coupon.expiresAt && coupon.expiresAt < new Date())
    return NextResponse.json({ message: "Coupon has expired" }, { status: 400 });

  if (coupon.usedCount >= coupon.usageLimit)
    return NextResponse.json({ message: "Coupon usage limit reached" }, { status: 400 });

  const cart = await Cart.findOne({ user: session.user.id });
  if (!cart || cart.items.length === 0)
    return NextResponse.json({ message: "Cart is empty" }, { status: 400 });

  const subtotal = cart.items.reduce((s, i) => s + i.price * i.quantity, 0);

  if (subtotal < coupon.minOrder)
    return NextResponse.json(
      { message: `Minimum order ৳${coupon.minOrder} required` },
      { status: 400 },
    );

  let discount = coupon.discountType === "flat"
    ? coupon.discountValue
    : Math.round(subtotal * coupon.discountValue / 100);

  if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);

  cart.coupon   = coupon.code;
  cart.discount = discount;
  await cart.save();

  return NextResponse.json({ message: "Coupon applied", discount, coupon: coupon.code });
}

/* DELETE /api/cart/coupon — remove coupon */
export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  await connectDb();

  await Cart.findOneAndUpdate(
    { user: session.user.id },
    { $unset: { coupon: "" }, $set: { discount: 0 } },
  );

  return NextResponse.json({ message: "Coupon removed" });
}