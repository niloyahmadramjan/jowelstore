"use client";

import { useState } from "react";
import Link          from "next/link";
import Image         from "next/image";
import { motion }    from "framer-motion";
import {
  Heart,
  ShoppingCart,
  Star,
  Eye,
  BadgePercent,
  Flame,
} from "lucide-react";
import { ProductItem } from "@/app/hooks/use-products";

interface ProductCardProps {
  product: ProductItem;
  index?:  number;   // stagger animation delay
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const [wishlisted, setWishlisted] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const discountPct = product.discount
    ?? (product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0);

  const isOutOfStock = product.stock === 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isOutOfStock) return;
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 1500);
    /* TODO: dispatch to cart store */
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    setWishlisted((prev) => !prev);
    /* TODO: call wishlist API */
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        ease:     [0.22, 1, 0.36, 1],
        delay:    Math.min(index * 0.05, 0.3), // cap stagger at 300ms
      }}
    >
      <Link href={`/products/${product.slug}`} className="group block">
        <div className="
          relative flex flex-col
          bg-white dark:bg-stone-900
          border border-stone-100 dark:border-stone-800
          rounded-2xl overflow-hidden
          shadow-sm hover:shadow-lg dark:hover:shadow-stone-950/50
          transition-shadow duration-300
        ">

          {/* ── Image area ─────────────────────────── */}
          <div className="relative aspect-square overflow-hidden bg-stone-100 dark:bg-stone-800">
            <Image
              src={product.thumbnail || "/placeholder.png"}
              alt={product.name}
              fill
              sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 16vw"
              className="
                object-cover
                transition-transform duration-500
                group-hover:scale-105
              "
            />

            {/* Badges — top left */}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {discountPct > 0 && (
                <span className="
                  flex items-center gap-0.5
                  px-2 py-0.5 rounded-full text-[11px] font-bold
                  bg-red-500 text-white
                ">
                  <BadgePercent size={10} />
                  {discountPct}%
                </span>
              )}
              {product.isNewArrival && (
                <span className="
                  px-2 py-0.5 rounded-full text-[11px] font-bold
                  bg-green-600 text-white
                ">
                  নতুন
                </span>
              )}
              {product.isFeatured && (
                <span className="
                  flex items-center gap-0.5
                  px-2 py-0.5 rounded-full text-[11px] font-bold
                  bg-amber-500 text-white
                ">
                  <Flame size={10} />
                  হট
                </span>
              )}
            </div>

            {/* Wishlist — top right */}
            <button
              onClick={handleWishlist}
              aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
              className="
                absolute top-2 right-2
                w-8 h-8 rounded-full
                flex items-center justify-center
                bg-white/90 dark:bg-stone-900/90 backdrop-blur-sm
                shadow-sm
                transition-all duration-200
                hover:scale-110 active:scale-95
              "
            >
              <Heart
                size={15}
                className={wishlisted
                  ? "fill-red-500 text-red-500"
                  : "text-stone-400 dark:text-stone-500"
                }
              />
            </button>

            {/* Out of stock overlay */}
            {isOutOfStock && (
              <div className="
                absolute inset-0 flex items-center justify-center
                bg-black/40 backdrop-blur-[2px]
              ">
                <span className="
                  px-3 py-1 rounded-full text-xs font-semibold
                  bg-stone-900/80 text-white
                ">
                  স্টক নেই
                </span>
              </div>
            )}

            {/* Quick view — appears on hover */}
            <div className="
              absolute bottom-2 left-1/2 -translate-x-1/2
              opacity-0 group-hover:opacity-100
              translate-y-2 group-hover:translate-y-0
              transition-all duration-300
            ">
              <span className="
                flex items-center gap-1.5
                px-3 py-1.5 rounded-full text-xs font-medium
                bg-white/90 dark:bg-stone-900/90
                text-stone-700 dark:text-stone-200
                backdrop-blur-sm shadow-md
                whitespace-nowrap
              ">
                <Eye size={12} />
                বিস্তারিত দেখুন
              </span>
            </div>
          </div>

          {/* ── Info area ──────────────────────────── */}
          <div className="flex flex-col gap-2 p-3">

            {/* Category tag */}
            <span className="text-[11px] font-medium text-green-700 dark:text-green-500 uppercase tracking-wide">
              {product.category}
            </span>

            {/* Name */}
            <p className="
              text-sm font-semibold leading-snug
              text-stone-800 dark:text-stone-100
              line-clamp-2
              group-hover:text-green-700 dark:group-hover:text-green-500
              transition-colors duration-200
            ">
              {product.name}
            </p>

            {/* Rating */}
            <div className="flex items-center gap-1">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={11}
                    className={
                      i < Math.round(product.rating)
                        ? "fill-amber-400 text-amber-400"
                        : "text-stone-300 dark:text-stone-600"
                    }
                  />
                ))}
              </div>
              <span className="text-[11px] text-stone-400 dark:text-stone-500">
                ({product.numReviews})
              </span>
              {product.sold > 0 && (
                <span className="text-[11px] text-stone-400 dark:text-stone-500 ml-auto">
                  {product.sold} বিক্রি
                </span>
              )}
            </div>

            {/* Price row */}
            <div className="flex items-center justify-between mt-1">
              <div className="flex items-baseline gap-1.5">
                <span className="text-base font-bold text-stone-900 dark:text-white">
                  ৳{product.price.toLocaleString("bn-BD")}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-xs text-stone-400 dark:text-stone-500 line-through">
                    ৳{product.originalPrice.toLocaleString("bn-BD")}
                  </span>
                )}
              </div>
              {product.unit && (
                <span className="text-[11px] text-stone-400 dark:text-stone-500">
                  /{product.unit}
                </span>
              )}
            </div>

            {/* Add to cart */}
            <motion.button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              whileTap={{ scale: 0.96 }}
              className={`
                w-full flex items-center justify-center gap-2
                py-2 px-3 rounded-xl text-xs font-semibold
                transition-all duration-200
                ${isOutOfStock
                  ? "bg-stone-100 dark:bg-stone-800 text-stone-400 cursor-not-allowed"
                  : addedToCart
                    ? "bg-green-600 text-white"
                    : "bg-green-700 hover:bg-green-600 text-white shadow-sm shadow-green-700/25"
                }
              `}
            >
              <ShoppingCart size={13} />
              {isOutOfStock
                ? "স্টক নেই"
                : addedToCart
                  ? "যোগ হয়েছে ✓"
                  : "কার্টে যোগ করুন"
              }
            </motion.button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}