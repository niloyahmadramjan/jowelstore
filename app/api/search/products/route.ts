import { NextRequest, NextResponse } from "next/server";
import connectDb from "@/lib/db";
import Product from "@/models/product.model";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const query       = searchParams.get("q")?.trim()           ?? "";
    const category    = searchParams.get("category")?.trim()    ?? "";
    const subCategory = searchParams.get("subCategory")?.trim() ?? "";
    const sort        = searchParams.get("sort")                 ?? "newest";
    const minPrice    = parseFloat(searchParams.get("minPrice") ?? "0");
    const maxPrice    = parseFloat(searchParams.get("maxPrice") ?? "0");
    const page        = Math.max(1, parseInt(searchParams.get("page")  ?? "1"));
    const limit       = Math.min(50, parseInt(searchParams.get("limit") ?? "12"));
    const skip        = (page - 1) * limit;

    await connectDb();

    /* ── Build filter ────────────────────────────────────── */
    const filter: Record<string, unknown> = {
      isActive: true,   // never return unpublished products
    };

    /*
     * Text search — uses the weighted full-text index on
     * { name, description, tags, category } for fast results.
     * Falls back to $regex only for very short queries (< 3 chars)
     * where $text search is unreliable.
     */
    if (query) {
      if (query.length >= 3) {
        filter.$text = { $search: query };
      } else {
        filter.$or = [
          { name:     { $regex: query, $options: "i" } },
          { category: { $regex: query, $options: "i" } },
          { tags:     { $in: [new RegExp(query, "i")] } },
        ];
      }
    }

    if (category && category !== "all") {
      filter.category = { $regex: `^${category}$`, $options: "i" };
    }

    if (subCategory) {
      filter.subCategory = { $regex: `^${subCategory}$`, $options: "i" };
    }

    /* Price range filter */
    if (minPrice > 0 || maxPrice > 0) {
      const priceFilter: Record<string, number> = {};
      if (minPrice > 0) priceFilter.$gte = minPrice;
      if (maxPrice > 0) priceFilter.$lte = maxPrice;
      filter.price = priceFilter;
    }

    /* ── Build sort ──────────────────────────────────────── */
    const sortMap: Record<string, Record<string, 1 | -1>> = {
      newest:     { createdAt: -1 },
      oldest:     { createdAt:  1 },
      price_asc:  { price:      1 },
      price_desc: { price:     -1 },
      popular:    { sold:      -1 },
      top_rated:  { rating:    -1 },
    };

    /*
     * When using $text search, we can also sort by relevance score.
     * MongoDB assigns a "textScore" to each matched document.
     */
    const sortQuery: Record<string, 1 | -1 | { $meta: string }> =
      query && query.length >= 3 && sort === "newest"
        ? { score: { $meta: "textScore" }, createdAt: -1 }
        : (sortMap[sort] ?? sortMap.newest);

    /* ── Projection for $text score (only needed when text searching) ── */
    const projection =
      query && query.length >= 3
        ? { score: { $meta: "textScore" } }
        : {};

    /* ── Run queries in parallel ─────────────────────────── */
    const [products, total] = await Promise.all([
      Product.find(filter, projection)
        .sort(sortQuery)
        .skip(skip)
        .limit(limit)
        .select(
          "name slug price originalPrice discount thumbnail category subCategory stock sold rating numReviews isNewArrival isFeatured"
        )
        .lean(),
      Product.countDocuments(filter),
    ]);

    return NextResponse.json({
      products,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      hasMore:    page * limit < total,
    });

  } catch (error) {
    console.error("[Search API Error]", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}


/**
 *  ------ Api end point and how to call all the req is GET method
/api/search/products?q=gold          ← text search
/api/search/products?category=fruits ← category filter
/api/search/products?subCategory=leafy
/api/search/products?minPrice=100&maxPrice=500
/api/search/products?sort=top_rated  ← নতুন sort option
/api/search/products?page=2&limit=12
 */