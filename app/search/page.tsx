import { Suspense }         from "react";
import { type Metadata }    from "next";
import connectDb            from "@/lib/db";
import Product              from "@/models/product.model";
import SearchResults        from "./search-results";
import { type SearchData }  from "./types";          // shared type

/* ─────────────────────────────────────────────────────────
   Props
───────────────────────────────────────────────────────── */
interface SearchPageProps {
  searchParams: Promise<{
    q?:        string;
    category?: string;
    sort?:     string;
  }>;
}

/* ─────────────────────────────────────────────────────────
   Fallback
───────────────────────────────────────────────────────── */
const EMPTY_DATA: SearchData = {
  products:   [],
  total:      0,
  totalPages: 0,
  hasMore:    false,
};

/* ─────────────────────────────────────────────────────────
   SSR data fetch — direct DB query (no HTTP round-trip)
───────────────────────────────────────────────────────── */
async function getInitialProducts(
  q:        string,
  category: string,
): Promise<SearchData> {
  try {
    await connectDb();

    const limit = 12;
    const filter: Record<string, unknown> = { isActive: true };

    if (q.length >= 3) {
      filter.$text = { $search: q };
    } else if (q) {
      filter.$or = [
        { name:     { $regex: q, $options: "i" } },
        { category: { $regex: q, $options: "i" } },
        { tags:     { $in: [new RegExp(q, "i")] } },
      ];
    }

    if (category && category !== "all") {
      filter.category = { $regex: `^${category}$`, $options: "i" };
    }

    const [rawProducts, total] = await Promise.all([
      Product.find(filter)
        .sort({ createdAt: -1 })
        .limit(limit)
        .select(
          "name slug price originalPrice discount thumbnail category stock sold rating numReviews isNewArrival isFeatured"
        )
        .lean(),
      Product.countDocuments(filter),
    ]);

    /*
     * .lean() returns MongoDB documents with _id as ObjectId.
     * JSON.parse(JSON.stringify(...)) converts _id → string
     * so it matches the Product interface exactly.
     */
    const products = JSON.parse(JSON.stringify(rawProducts));

    return {
      products,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore:    total > limit,
    };
  } catch (error) {
    console.error("[SearchPage SSR Error]", error);
    return EMPTY_DATA;
  }
}

/* ─────────────────────────────────────────────────────────
   Metadata
───────────────────────────────────────────────────────── */
export async function generateMetadata({
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    title: q
      ? `Search: "${q}" — JowelStore`
      : "Search Products — JowelStore",
    description: q
      ? `Find the best results for "${q}" at JowelStore`
      : "Browse all products at JowelStore",
  };
}

/* ─────────────────────────────────────────────────────────
   Page — Server Component
───────────────────────────────────────────────────────── */
export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q = "", category = "", sort = "newest" } = await searchParams;

  const initialData = await getInitialProducts(q, category);

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
      <Suspense fallback={<SearchSkeleton />}>
        <SearchResults
          initialQuery={q}
          initialCategory={category}
          initialSort={sort}
          initialData={initialData} 
        />
      </Suspense>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Skeleton
───────────────────────────────────────────────────────── */
function SearchSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 space-y-2">
        <div className="h-8 w-56 bg-stone-200 dark:bg-stone-800 rounded-xl animate-pulse" />
        <div className="h-4 w-32 bg-stone-200 dark:bg-stone-800 rounded-lg  animate-pulse" />
      </div>
      <div className="h-12 w-full bg-stone-200 dark:bg-stone-800 rounded-xl animate-pulse mb-6" />
      <div className="flex gap-2 mb-8 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-7 w-20 bg-stone-200 dark:bg-stone-800 rounded-full animate-pulse shrink-0" />
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-2xl bg-stone-200 dark:bg-stone-800 animate-pulse h-64" />
        ))}
      </div>
    </div>
  );
}