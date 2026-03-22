"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence }                   from "framer-motion";
import { useRouter, useSearchParams }                from "next/navigation";
import Link                                          from "next/link";
import axios                                         from "axios";
import { useDebounce }                               from "@/app/hooks/use-debounce";
import { type Product, type SearchData }             from "./types";  // shared type

/* ─────────────────────────────────────────────────────────
   Props
───────────────────────────────────────────────────────── */
interface Props {
  initialQuery:    string;
  initialCategory: string;
  initialSort:     string;
  initialData:     SearchData;
}

/* ─────────────────────────────────────────────────────────
   Constants
───────────────────────────────────────────────────────── */
// const CATEGORIES = [
//   "all", "vegetables", "fruits", "dairy", "meat",
//   "bakery", "beverages", "gold", "silver", "diamond", "fashion",
// ] as const;

// const SORT_OPTIONS = [
//   { value: "newest",     label: "Newest"             },
//   { value: "price_asc",  label: "Price: Low to High" },
//   { value: "price_desc", label: "Price: High to Low" },
//   { value: "popular",    label: "Most Popular"        },
//   { value: "top_rated",  label: "Top Rated"           },
// ] as const;



const CATEGORIES = [
  { value: "all",        label: "সব পণ্য",     emoji: "🛒" },
  { value: "groceries",  label: "মুদিখানা",    emoji: "🥦" },
  { value: "beauty",     label: "প্রসাধনী",    emoji: "🧴" },
  { value: "snacks",     label: "স্ন্যাকস",    emoji: "🍪" },
  { value: "drinks",     label: "পানীয়",      emoji: "🧃" },
  { value: "household",  label: "গৃহস্থালি",   emoji: "🏠" },
  { value: "baby",       label: "শিশু পণ্য",   emoji: "👶" },
] as const;

const SORT_OPTIONS = [
  { value: "newest",     label: "নতুন পণ্য আগে"      },
  { value: "popular",    label: "সবচেয়ে বিক্রিত"     },
  { value: "top_rated",  label: "সেরা রেটিং"          },
  { value: "price_asc",  label: "দাম: কম থেকে বেশি"  },
  { value: "price_desc", label: "দাম: বেশি থেকে কম"  },
] as const;

const cardVariants = {
  hidden:  { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const },
  },
};

/* ─────────────────────────────────────────────────────────
   Component
───────────────────────────────────────────────────────── */
export default function SearchResults({
  initialQuery,
  initialCategory,
  initialSort,
  initialData,
}: Props) {
  const router       = useRouter();
  const searchParams = useSearchParams();

  const [query,    setQuery]    = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory || "all");
  const [sort,     setSort]     = useState(initialSort || "newest");
  const [page,     setPage]     = useState(1);
  const [products, setProducts] = useState<Product[]>(initialData.products ?? []);
  const [total,    setTotal]    = useState(initialData.total     ?? 0);
  const [hasMore,  setHasMore]  = useState(initialData.hasMore   ?? false);
  const [loading,  setLoading]  = useState(false);
  const [loadMore, setLoadMore] = useState(false);

  const debouncedQuery = useDebounce(query, 400);
  const isFirstRender  = useRef(true);

  /* Sync URL → state on back/forward navigation */
  useEffect(() => {
    setQuery(   searchParams.get("q")        ?? "");
    setCategory(searchParams.get("category") ?? "all");
    setSort(    searchParams.get("sort")     ?? "newest");
  }, [searchParams]);

  /* Fetch products */
  const fetchProducts = useCallback(async (
    q:      string,
    cat:    string,
    s:      string,
    p:      number,
    append: boolean = false,
  ) => {
    append ? setLoadMore(true) : setLoading(true);

    try {
      const params = new URLSearchParams({
        q,
        category: cat === "all" ? "" : cat,
        sort:     s,
        page:     String(p),
        limit:    "12",
      });

      const { data } = await axios.get<SearchData>(
        `/api/search/products?${params.toString()}`
      );

      setProducts(prev =>
        append ? [...prev, ...(data.products ?? [])] : (data.products ?? [])
      );
      setTotal(  data.total   ?? 0);
      setHasMore(data.hasMore ?? false);
      setPage(p);
    } catch {
      /* keep current state on error */
    } finally {
      append ? setLoadMore(false) : setLoading(false);
    }
  }, []);

  /* Re-fetch when filters change — skip first render */
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    setPage(1);
    fetchProducts(debouncedQuery, category, sort, 1);

    const params = new URLSearchParams();
    if (debouncedQuery)     params.set("q",        debouncedQuery);
    if (category !== "all") params.set("category", category);
    if (sort !== "newest")  params.set("sort",      sort);
    router.replace(`/search?${params.toString()}`, { scroll: false });

  }, [debouncedQuery, category, sort, fetchProducts, router]);

  const handleLoadMore    = () => fetchProducts(debouncedQuery, category, sort, page + 1, true);
  const handleClearFilters = () => { setQuery(""); setCategory("all"); setSort("newest"); };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-900 dark:text-white">
          {query ? (
            <>Results for{" "}
              <span className="text-green-700 dark:text-green-400">&quot;{query}&quot;</span>
            </>
          ) : "All Products"}
        </h1>
        {!loading && (
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            {total.toLocaleString()} product{total !== 1 ? "s" : ""} found
          </p>
        )}
      </div>

      {/* Search bar */}
      <div className="relative mb-6">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none"
          width="17" height="17" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products..."
          className="
            w-full pl-11 pr-10 py-3.5 rounded-xl text-sm shadow-sm
            bg-white dark:bg-stone-900
            border border-stone-200 dark:border-stone-700
            text-stone-900 dark:text-stone-100
            placeholder:text-stone-400 dark:placeholder:text-stone-500
            focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/15
            transition-all duration-200
          "
        />
        {loading && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-stone-200 border-t-green-600 animate-spin" />
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="flex gap-2 overflow-x-auto pb-1 flex-1 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button key={cat.value} onClick={() => setCategory(cat.value)}
              className={`
                shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium capitalize transition-all duration-150
                ${category === cat.value
                  ? "bg-green-700 text-white shadow-md shadow-green-700/20"
                  : "bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:border-green-400 hover:text-green-700 dark:hover:text-green-400"
                }
              `}>
              {cat.label}{cat.emoji}
            </button>
          ))}
        </div>
        <select value={sort} onChange={(e) => setSort(e.target.value)}
          className="
            shrink-0 px-3 py-2 rounded-xl text-sm cursor-pointer
            bg-white dark:bg-stone-800
            border border-stone-200 dark:border-stone-700
            text-stone-700 dark:text-stone-200
            focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/15
            transition-all duration-200
          ">
         
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
              ))}
        </select>
      </div>

      {/* Grid */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-stone-200 dark:bg-stone-800 animate-pulse h-64" />
            ))}
          </motion.div>
        ) : products.length === 0 ? (
          <motion.div key="empty" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center mx-auto mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="1.5" className="text-stone-400" aria-hidden="true">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-stone-700 dark:text-stone-300 mb-1">No products found</h3>
            <p className="text-sm text-stone-400 dark:text-stone-500">Try a different keyword or clear the filters</p>
            <button onClick={handleClearFilters}
              className="mt-4 px-5 py-2 rounded-xl text-sm font-medium bg-green-700 text-white hover:bg-green-800 transition-colors">
              Clear filters
            </button>
          </motion.div>
        ) : (
          <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product, i) => (
              <motion.div key={product._id} variants={cardVariants} initial="hidden" animate="visible"
                transition={{ delay: Math.min(i * 0.04, 0.3) }}>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Load more */}
      {hasMore && !loading && (
        <div className="flex justify-center mt-10">
          <button onClick={handleLoadMore} disabled={loadMore}
            className="
              flex items-center gap-2.5 px-8 py-3 rounded-xl text-sm font-semibold text-white
              bg-green-700 hover:bg-green-800 shadow-lg shadow-green-700/20
              disabled:opacity-65 disabled:cursor-not-allowed
              hover:-translate-y-0.5 transition-all duration-200
            ">
            {loadMore ? (
              <><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Loading...</>
            ) : (
              `Load more (${total - products.length} remaining)`
            )}
          </button>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Product Card
───────────────────────────────────────────────────────── */
function ProductCard({ product }: { product: Product }) {
  const [imgError, setImgError] = useState(false);
  const outOfStock = product.stock === 0;

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="
        bg-white dark:bg-stone-900 rounded-2xl overflow-hidden
        border border-stone-100 dark:border-stone-800
        hover:shadow-lg dark:hover:shadow-stone-950/50
        hover:-translate-y-1 transition-all duration-200
      ">
        {/* Image */}
        <div className="relative aspect-square bg-stone-100 dark:bg-stone-800 overflow-hidden">
          {product.thumbnail && !imgError ? (
            <img src={product.thumbnail} alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={() => setImgError(true)} />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-stone-300 dark:text-stone-600">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1.2" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
            </div>
          )}

          {outOfStock && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="text-white text-xs font-semibold bg-black/60 px-2.5 py-1 rounded-full">
                Out of stock
              </span>
            </div>
          )}

          {product.discount != null && product.discount > 0 && (
            <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-red-500 text-white">
              -{product.discount}%
            </span>
          )}

          {product.isNewArrival ? (
            <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-600 text-white">
              New
            </span>
          ) : (
            <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/90 dark:bg-stone-900/90 text-stone-600 dark:text-stone-300 capitalize">
              {product.category}
            </span>
          )}
        </div>

        {/* Info */}
        <div className="p-3">
          <h3 className="
            text-sm font-medium leading-snug line-clamp-2
            text-stone-800 dark:text-stone-200
            group-hover:text-green-700 dark:group-hover:text-green-400
            transition-colors
          ">
            {product.name}
          </h3>

          {product.rating != null && product.rating > 0 && (
            <div className="flex items-center gap-1 mt-1">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="#f59e0b" stroke="none" aria-hidden="true">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              <span className="text-[11px] text-stone-400 dark:text-stone-500">
                {product.rating.toFixed(1)}
                {product.numReviews != null && product.numReviews > 0 && (
                  <span className="ml-0.5">({product.numReviews})</span>
                )}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between mt-2">
            <div>
              <p className="text-base font-bold text-green-700 dark:text-green-400">
                ৳{product.price.toLocaleString()}
              </p>
              {product.originalPrice != null && product.originalPrice > product.price && (
                <p className="text-xs text-stone-400 dark:text-stone-500 line-through">
                  ৳{product.originalPrice.toLocaleString()}
                </p>
              )}
            </div>
            <button
              onClick={(e) => { e.preventDefault(); /* TODO: add to cart */ }}
              disabled={outOfStock}
              aria-label={`Add ${product.name} to cart`}
              className="
                w-7 h-7 rounded-lg flex items-center justify-center text-white
                bg-green-700 hover:bg-green-800
                disabled:bg-stone-300 dark:disabled:bg-stone-700
                transition-colors
              ">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5"  y1="12" x2="19" y2="12"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}