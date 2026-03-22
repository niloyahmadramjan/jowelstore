import { type NextRequest, NextResponse } from "next/server";
import connectDb  from "@/lib/db";
import Product    from "@/models/product.model";

/*
 * GET /api/products
 *
 * Query params:
 *   cursor      — last _id for cursor pagination (like Facebook feed)
 *   limit       — items per page, default 12, max 48
 *   category    — filter by category
 *   subCategory — filter by subCategory
 *   sort        — "newest" | "popular" | "price_asc" | "price_desc" | "rating"
 *   search      — full-text search
 *   featured    — "true" to get only featured
 *
 * Response:
 *   { products, nextCursor, hasMore, total }
 */

export async function GET(req: NextRequest) {
  try {
    await connectDb();

    const p           = req.nextUrl.searchParams;
    const cursor      = p.get("cursor")      ?? null;
    const limit       = Math.min(Number(p.get("limit") ?? 12), 48);
    const category    = p.get("category")    ?? null;
    const subCategory = p.get("subCategory") ?? null;
    const sort        = p.get("sort")        ?? "newest";
    const search      = p.get("search")      ?? null;
    const featured    = p.get("featured")    === "true";

    /* ── Filter ─────────────────────────────────────── */
    const filter: Record<string, unknown> = { isActive: true };

    if (category)    filter.category    = category;
    if (subCategory) filter.subCategory = subCategory;
    if (featured)    filter.isFeatured  = true;
    if (search)      filter.$text       = { $search: search };

    /* Cursor-based pagination — always fast, no OFFSET slowdown */
    if (cursor) filter._id = { $lt: cursor };

    /* ── Sort map ────────────────────────────────────── */
    const sortMap: Record<string, Record<string, 1 | -1>> = {
      newest:     { createdAt: -1 },
      popular:    { sold:      -1 },
      price_asc:  { price:      1 },
      price_desc: { price:     -1 },
      rating:     { rating:    -1 },
    };

    const sortQuery = sortMap[sort] ?? sortMap.newest;

    /* ── Query — fetch +1 to detect hasMore ─────────── */
    const docs = await Product
      .find(filter)
      .sort(sortQuery)
      .limit(limit + 1)
      .select(
        `name slug thumbnail price originalPrice discount
         category subCategory unit stock sold
         rating numReviews isFeatured isNewArrival`,
      )
      .lean();

    const hasMore    = docs.length > limit;
    const products   = hasMore ? docs.slice(0, limit) : docs;
    const nextCursor = hasMore
      ? String(products[products.length - 1]._id)
      : null;

    return NextResponse.json(
      { products, nextCursor, hasMore },
      {
        status:  200,
        headers: {
          /* CDN cache 60s, stale-while-revalidate 120s */
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      },
    );

  } catch (err) {
    console.error("[GET /api/products]", err);
    return NextResponse.json(
      { message: "Failed to fetch products" },
      { status: 500 },
    );
  }
}