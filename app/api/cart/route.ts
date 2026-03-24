import { type NextRequest, NextResponse } from "next/server";
import { auth }        from "@/auth";
import connectDb       from "@/lib/db";
import Cart            from "@/models/cart.model";
import Product         from "@/models/product.model";

/* ── GET /api/cart ─────────────────────────────────── */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await connectDb();

  const cart = await Cart.findOne({ user: session.user.id }).lean();

  return NextResponse.json({
    items:     cart?.items     ?? [],
    coupon:    cart?.coupon    ?? null,
    discount:  cart?.discount  ?? 0,
    subtotal:  cart ? cart.items.reduce((s, i) => s + i.price * i.quantity, 0) : 0,
    total:     cart ? Math.max(0, cart.items.reduce((s, i) => s + i.price * i.quantity, 0) - (cart.discount ?? 0)) : 0,
    itemCount: cart ? cart.items.reduce((s, i) => s + i.quantity, 0) : 0,
  });
}

/* ── POST /api/cart ─ add item ─────────────────────── */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json() as {
    productId:    string;
    quantity?:    number;
    variantLabel?: string;
  };

  const { productId, quantity = 1, variantLabel } = body;

  if (!productId) {
    return NextResponse.json({ message: "productId is required" }, { status: 400 });
  }

  await connectDb();

  const product = await Product.findById(productId).select(
    "name slug thumbnail price originalPrice category unit stock isActive variants",
  );

  if (!product || !product.isActive) {
    return NextResponse.json({ message: "Product not found" }, { status: 404 });
  }

  if (product.stock < 1) {
    return NextResponse.json({ message: "Out of stock" }, { status: 400 });
  }

  /* Resolve price from variant if provided */
  let resolvedPrice = product.price;
  if (variantLabel) {
    const variant = product.variants.find((v: { label: string }) => v.label === variantLabel);
    if (variant) resolvedPrice = variant.price;
  }

  let cart = await Cart.findOne({ user: session.user.id });

  if (!cart) {
    cart = new Cart({ user: session.user.id, items: [] });
  }

  const existIdx = cart.items.findIndex(
    (i) => String(i.product) === productId && i.variantLabel === variantLabel,
  );

  if (existIdx >= 0) {
    cart.items[existIdx].quantity = Math.min(
      cart.items[existIdx].quantity + quantity,
      product.stock,
    );
  } else {
    cart.items.push({
      product:       product._id,
      name:          product.name,
      thumbnail:     product.thumbnail,
      price:         resolvedPrice,
      originalPrice: product.originalPrice,
      slug:          product.slug,
      unit:          product.unit,
      category:      product.category,
      variantLabel,
      quantity,
    });
  }

  await cart.save();

  const itemCount = cart.items.reduce((s: number, i: { quantity: number }) => s + i.quantity, 0);

  return NextResponse.json({ message: "Added to cart", itemCount }, { status: 200 });
}

/* ── PATCH /api/cart ─ update quantity ─────────────── */
export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { itemId, quantity } = await req.json() as { itemId: string; quantity: number };

  if (!itemId || quantity < 1) {
    return NextResponse.json({ message: "Invalid data" }, { status: 400 });
  }

  await connectDb();

  const cart = await Cart.findOne({ user: session.user.id });
  if (!cart) return NextResponse.json({ message: "Cart not found" }, { status: 404 });

  const item = cart.items.id(itemId);
  if (!item) return NextResponse.json({ message: "Item not found" }, { status: 404 });

  item.quantity = quantity;
  await cart.save();

  const subtotal  = cart.items.reduce((s: number, i: { price: number; quantity: number }) => s + i.price * i.quantity, 0);
  const itemCount = cart.items.reduce((s: number, i: { quantity: number }) => s + i.quantity, 0);

  return NextResponse.json({ message: "Updated", subtotal, itemCount });
}

/* ── DELETE /api/cart ─ remove item or clear ───────── */
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const itemId = searchParams.get("itemId");
  const clear  = searchParams.get("clear") === "true";

  await connectDb();

  const cart = await Cart.findOne({ user: session.user.id });
  if (!cart) return NextResponse.json({ message: "Cart not found" }, { status: 404 });

  if (clear) {
    cart.items    = [];
    cart.discount = 0;
    cart.coupon   = undefined;
  } else if (itemId) {
    cart.items = cart.items.filter((i) => String(i._id) !== itemId);
  }

  await cart.save();
  return NextResponse.json({ message: "Done" });
}