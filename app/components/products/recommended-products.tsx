"use client";

import { useEffect, useState } from "react";
import { motion }               from "framer-motion";
import { Sparkles }             from "lucide-react";
import axios                    from "axios";

import { ProductCard }          from "@/app/components/products/product-card";
import { ProductGridSkeleton }  from "@/app/components/products/product-card-skeleton";
import type { ProductItem }     from "@/app/hooks/use-products";

interface RecommendedProductsProps {
  /*
   * Comma-separated category slugs.
   * Pass user's preferred categories from session/localStorage.
   * Leave empty to show featured products instead.
   */
  categories?: string;
  limit?:      number;
}

export function RecommendedProducts({
  categories,
  limit = 12,
}: RecommendedProductsProps) {
  const [products,  setProducts]  = useState<ProductItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams({ limit: String(limit) });
    if (categories) params.set("categories", categories);

    axios
      .get<{ products: ProductItem[] }>(`/api/products/recommended?${params}`)
      .then(({ data }) => setProducts(data.products))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [categories, limit]);

  if (!isLoading && !products.length) return null;

  return (
    <section className="mt-10">
      {/* Header */}
      <motion.div
        className="flex items-center gap-2 mb-5"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y:  0 }}
        transition={{ duration: 0.4 }}
      >
        <Sparkles size={20} className="text-amber-500" />
        <h2 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-white">
          আপনার জন্য বাছাই
        </h2>
      </motion.div>

      {isLoading ? (
        <ProductGridSkeleton count={6} />
      ) : (
        <div className="
          grid gap-3 sm:gap-4
          grid-cols-2
          sm:grid-cols-3
          md:grid-cols-4
          lg:grid-cols-5
          xl:grid-cols-6
        ">
          {products.map((product, i) => (
            <ProductCard key={product._id} product={product} index={i} />
          ))}
        </div>
      )}
    </section>
  );
}