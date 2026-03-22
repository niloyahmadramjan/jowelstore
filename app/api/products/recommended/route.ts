import { type NextRequest, NextResponse } from "next/server";
import connectDb from "@/lib/db";
import Product   from "@/models/product.model";

/*
 * GET /api/products/recommended
 *
 * Query params:
 *   categories — comma-separated slugs e.g. "groceries,beauty"
 *   limit      — default 12
 *
 * Logic:
 *   - If categories provided → top-rated from those categories
 *   - Otherwise             → featured + highest rated
 *
 * Response: { products }
 */

export async function GET(req: NextRequest) {
  try {
    await connectDb();

    const p          = req.nextUrl.searchParams;
    const cats       = p.get("categories");
    const limit      = Math.min(Number(p.get("limit") ?? 12), 24);

    const filter: Record<string, unknown> = { isActive: true };

    if (cats) {
      const list = cats.split(",").map((c) => c.trim()).filter(Boolean);
      if (list.length > 0) filter.category = { $in: list };
    } else {
      filter.isFeatured = true;
    }

    const products = await Product
      .find(filter)
      .sort({ rating: -1, sold: -1 })
      .limit(limit)
      .select(
        "name slug thumbnail price originalPrice discount category unit rating numReviews stock isFeatured isNewArrival",
      )
      .lean();

    return NextResponse.json(
      { products },
      {
        status:  200,
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      },
    );

  } catch (err) {
    console.error("[GET /api/products/recommended]", err);
    return NextResponse.json(
      { message: "Failed to fetch recommendations" },
      { status: 500 },
    );
  }
}