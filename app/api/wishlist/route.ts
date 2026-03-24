import { type NextRequest, NextResponse } from "next/server";
import { auth }      from "@/auth";
import connectDb     from "@/lib/db";
import Wishlist      from "@/models/wishlist.model";
import Product       from "@/models/product.model";

/* ── GET /api/wishlist ─────────────────────────────── */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await connectDb();

  const wishlist = await Wishlist.findOne({ user: session.user.id }).lean();

  return NextResponse.json({ items: wishlist?.items ?? [] });
}

/* ── POST /api/wishlist ─ toggle add/remove ────────── */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { productId } = await req.json() as { productId: string };

  if (!productId) {
    return NextResponse.json({ message: "productId is required" }, { status: 400 });
  }

  await connectDb();

  const product = await Product.findById(productId)
    .select("name slug thumbnail price originalPrice category unit isActive")
    .lean();

  if (!product || !product.isActive) {
    return NextResponse.json({ message: "Product not found" }, { status: 404 });
  }

  let wishlist = await Wishlist.findOne({ user: session.user.id });

  if (!wishlist) {
    wishlist = new Wishlist({ user: session.user.id, items: [] });
  }

  const existIdx = wishlist.items.findIndex(
    (i) => String(i.product) === productId,
  );

  let action: "added" | "removed";

  if (existIdx >= 0) {
    wishlist.items.splice(existIdx, 1);
    action = "removed";
  } else {
    wishlist.items.push({
      product:       product._id,
      name:          product.name,
      thumbnail:     product.thumbnail,
      price:         product.price,
      originalPrice: product.originalPrice,
      slug:          product.slug,
      category:      product.category,
      unit:          product.unit,
      addedAt:       new Date(),
    });
    action = "added";
  }

  await wishlist.save();

  return NextResponse.json({
    action,
    count: wishlist.items.length,
    wishlisted: action === "added",
  });
}

/* ── DELETE /api/wishlist?productId=xxx ─ remove one ─ */
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const productId = req.nextUrl.searchParams.get("productId");
  if (!productId) {
    return NextResponse.json({ message: "productId is required" }, { status: 400 });
  }

  await connectDb();

  await Wishlist.findOneAndUpdate(
    { user: session.user.id },
    { $pull: { items: { product: productId } } },
  );

  return NextResponse.json({ message: "Removed from wishlist" });
}