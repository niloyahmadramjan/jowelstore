"use client";

import { useEffect, useState, useRef } from "react";
import { motion }                        from "framer-motion";
import { ChevronLeft, ChevronRight }     from "lucide-react";
import axios                             from "axios";

import { ProductCard }         from "@/app/components/products/product-card";
import { ProductCardSkeleton } from "@/app/components/products/product-card-skeleton";
import type { ProductItem }    from "@/app/hooks/use-products";

interface RelatedProductsProps {
  productId: string;
  category:  string;
  title?:    string;
}

export function RelatedProducts({
  productId,
  category,
  title = "সম্পর্কিত পণ্য",
}: RelatedProductsProps) {
  const [products,  setProducts]  = useState<ProductItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error,     setError]     = useState<string | null>(null);

  const scrollRef  = useRef<HTMLDivElement>(null);
  const [canLeft,  setCanLeft]  = useState(false);
  const [canRight, setCanRight] = useState(true);

  /* Fetch related products */
  useEffect(() => {
    if (!productId || !category) return;
    setIsLoading(true);

    axios
      .get<{ products: ProductItem[] }>(
        `/api/products/related?productId=${productId}&category=${category}&limit=10`,
      )
      .then(({ data }) => setProducts(data.products))
      .catch(() => setError("Related products could not be loaded"))
      .finally(() => setIsLoading(false));
  }, [productId, category]);

  /* Track scroll position for arrow visibility */
  const updateArrows = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 10);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 10);
  };

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -320 : 320, behavior: "smooth" });
  };

  if (error)     return null;
  if (!isLoading && !products.length) return null;

  return (
    <section className="mt-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <motion.h2
          className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-white"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x:   0 }}
          transition={{ duration: 0.4 }}
        >
          {title}
        </motion.h2>

        {/* Scroll arrows — visible only when scrollable */}
        {!isLoading && products.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll("left")}
              disabled={!canLeft}
              aria-label="Scroll left"
              className="
                w-8 h-8 rounded-full flex items-center justify-center
                bg-white dark:bg-stone-800
                border border-stone-200 dark:border-stone-700
                text-stone-500 dark:text-stone-400
                hover:bg-stone-50 dark:hover:bg-stone-700
                disabled:opacity-30 disabled:cursor-not-allowed
                transition-all duration-200
              "
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => scroll("right")}
              disabled={!canRight}
              aria-label="Scroll right"
              className="
                w-8 h-8 rounded-full flex items-center justify-center
                bg-white dark:bg-stone-800
                border border-stone-200 dark:border-stone-700
                text-stone-500 dark:text-stone-400
                hover:bg-stone-50 dark:hover:bg-stone-700
                disabled:opacity-30 disabled:cursor-not-allowed
                transition-all duration-200
              "
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Slider */}
      {isLoading ? (
        /* Skeleton row */
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="w-44 shrink-0">
              <ProductCardSkeleton />
            </div>
          ))}
        </div>
      ) : (
        <div
          ref={scrollRef}
          onScroll={updateArrows}
          className="
            flex gap-3 overflow-x-auto
            scroll-smooth snap-x snap-mandatory
            pb-2
            scrollbar-hide
            [&::-webkit-scrollbar]:hidden
          "
        >
          {products.map((product, i) => (
            <div
              key={product._id}
              className="w-44 sm:w-52 shrink-0 snap-start"
            >
              <ProductCard product={product} index={i} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}