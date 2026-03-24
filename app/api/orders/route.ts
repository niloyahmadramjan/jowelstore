import { type NextRequest, NextResponse } from "next/server";
import { auth }    from "@/auth";
import connectDb   from "@/lib/db";
import Order       from "@/models/order.model";
import Cart        from "@/models/cart.model";

/* ── GET /api/orders ─ list user orders ────────────── */
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const page   = Number(req.nextUrl.searchParams.get("page")  ?? 1);
  const limit  = Number(req.nextUrl.searchParams.get("limit") ?? 10);
  const status = req.nextUrl.searchParams.get("status") ?? null;
  const skip   = (page - 1) * limit;

  const filter: Record<string, unknown> = { user: session.user.id };
  if (status) filter.status = status;

  await connectDb();

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("-statusHistory -__v")
      .lean(),
    Order.countDocuments(filter),
  ]);

  return NextResponse.json({
    orders,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    hasMore:    page * limit < total,
  });
}

/* ── POST /api/orders ─ place order from cart ───────── */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json() as {
    shippingAddress: {
      fullName: string;
      phone:    string;
      address:  string;
      area:     string;
      city:     string;
      district: string;
      zip?:     string;
    };
    paymentMethod: string;
    note?:         string;
  };

  const { shippingAddress, paymentMethod, note } = body;

  if (!shippingAddress?.fullName || !shippingAddress?.phone || !shippingAddress?.address) {
    return NextResponse.json({ message: "Shipping address is required" }, { status: 400 });
  }

  await connectDb();

  const cart = await Cart.findOne({ user: session.user.id });
  if (!cart || cart.items.length === 0) {
    return NextResponse.json({ message: "Cart is empty" }, { status: 400 });
  }

  const subtotal      = cart.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const discount      = cart.discount ?? 0;
  const total         = subtotal - discount;
  const deliveryCharge= total >= 999 ? 0 : 60;
  const grandTotal    = total + deliveryCharge;

  const order = await Order.create({
    user:            session.user.id,
    items:           cart.items,
    shippingAddress,
    subtotal,
    discount,
    deliveryCharge,
    total:           grandTotal,
    coupon:          cart.coupon,
    paymentMethod,
    note,
    statusHistory:   [{ status: "pending", at: new Date() }],
  });

  /* Clear cart after order */
  cart.items    = [];
  cart.discount = 0;
  cart.coupon   = undefined;
  await cart.save();

  window && window.dispatchEvent(new Event("cart:updated"));

  return NextResponse.json(
    { order, message: "Order placed successfully" },
    { status: 201 },
  );
}