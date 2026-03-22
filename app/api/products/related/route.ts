import { type NextRequest, NextResponse } from "next/server";
import connectDb from "@/lib/db";
import Product   from "@/models/product.model";

/*
 * GET /api/products/related
 *
 * Query params:
 *   productId — exclude this product from results
 *   category  — match same category (required)
 *   limit     — default 10
 *
 * Response: { products }
 */

export async function GET(req: NextRequest) {
  try {
    await connectDb();

    const p         = req.nextUrl.searchParams;
    const productId = p.get("productId") ?? null;
    const category  = p.get("category")  ?? null;
    const limit     = Math.min(Number(p.get("limit") ?? 10), 20);

    if (!category) {
      return NextResponse.json(
        { message: "category is required" },
        { status: 400 },
      );
    }

    const filter: Record<string, unknown> = {
      category,
      isActive: true,
    };

    if (productId) filter._id = { $ne: productId };

    const products = await Product
      .find(filter)
      .sort({ sold: -1, rating: -1 })
      .limit(limit)
      .select(
        "name slug thumbnail price originalPrice discount category unit rating numReviews stock",
      )
      .lean();

    return NextResponse.json(
      { products },
      {
        status:  200,
        headers: {
          "Cache-Control": "public, s-maxage=120, stale-while-revalidate=240",
        },
      },
    );

  } catch (err) {
    console.error("[GET /api/products/related]", err);
    return NextResponse.json(
      { message: "Failed to fetch related products" },
      { status: 500 },
    );
  }
}