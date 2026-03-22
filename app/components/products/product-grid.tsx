"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Loader2, RefreshCw, PackageX } from "lucide-react";

import { ProductCard }        from  "@/app/components/products/product-card";
import { ProductGridSkeleton } from "@/app/components/products/product-card-skeleton";
import { useProducts }         from "@/app/hooks/use-products";
import { useIntersection }     from "@/app/hooks/use-intersection";

interface ProductGridProps {
  category?:    string;
  subCategory?: string;
  sort?:        string;
  search?:      string;
  featured?:    boolean;
  title?:       string;
}

export function ProductGrid({
  category,
  subCategory,
  sort,
  search,
  featured,
  title,
}: ProductGridProps) {
  const {
    products,
    isLoading,
    isFetching,
    hasMore,
    error,
    loadMore,
    refresh,
  } = useProducts({ category, subCategory, sort, search, featured });

  /* Sentinel div — when visible, trigger loadMore */
  const sentinelRef = useIntersection(loadMore, {
    threshold:  0.1,
    rootMargin: "300px", /* start loading 300px before bottom */
  });

  /* ── Initial loading ───────────────────────────────── */
  if (isLoading) return <ProductGridSkeleton count={12} />;

  /* ── Error state ───────────────────────────────────── */
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <PackageX size={40} className="text-stone-300 dark:text-stone-600" />
        <p className="text-stone-500 dark:text-stone-400 text-sm">{error}</p>
        <button
          onClick={refresh}
          className="
            flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
            bg-green-700 hover:bg-green-600 text-white transition-colors
          "
        >
          <RefreshCw size={14} />
          আবার চেষ্টা করুন
        </button>
      </div>
    );
  }

  /* ── Empty state ───────────────────────────────────── */
  if (!products.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
        <PackageX size={40} className="text-stone-300 dark:text-stone-600" />
        <p className="text-stone-500 dark:text-stone-400 text-sm">
          কোনো পণ্য পাওয়া যায়নি
        </p>
      </div>
    );
  }

  return (
    <section>
      {/* Section title */}
      {title && (
        <motion.h2
          className="
            text-xl sm:text-2xl font-bold
            text-stone-900 dark:text-white
            mb-5
          "
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {title}
        </motion.h2>
      )}

      {/* Grid
          mobile  : 2 columns
          tablet  : 3-4 columns
          desktop : 5-6 columns
      */}
      <div className="
        grid gap-3 sm:gap-4
        grid-cols-2
        sm:grid-cols-3
        md:grid-cols-4
        lg:grid-cols-5
        xl:grid-cols-6
      ">
        <AnimatePresence mode="popLayout">
          {products.map((product, i) => (
            <ProductCard
              key={product._id}
              product={product}
              index={i}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* ── Sentinel + load-more indicator ─────────── */}
      <div ref={sentinelRef} className="mt-8 flex justify-center">
        {isFetching && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-sm text-stone-400 dark:text-stone-500"
          >
            <Loader2 size={16} className="animate-spin" />
            আরো পণ্য লোড হচ্ছে...
          </motion.div>
        )}

        {!hasMore && products.length > 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-stone-400 dark:text-stone-600 py-4"
          >
            সব পণ্য দেখা হয়ে গেছে
          </motion.p>
        )}
      </div>
    </section>
  );
}