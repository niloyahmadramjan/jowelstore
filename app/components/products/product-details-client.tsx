"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ShoppingCart,
  Heart,
  Share2,
  BadgePercent,
  Truck,
  ShieldCheck,
  RotateCcw,
  Minus,
  Plus,
  Star,
  Flame,
} from "lucide-react";
import { useCart } from "@/app/hooks/use-card";
import { useWishlist } from "@/app/hooks/use-wishlist";

interface Variant {
  label: string;
  price: number;
  stock: number;
  sku?: string;
}

interface Product {
  _id: string;
  name: string;
  shortDesc?: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  category: string;
  unit?: string;
  stock: number;
  sold: number;
  rating: number;
  numReviews: number;
  isFeatured: boolean;
  isNewArrival: boolean;
  variants: Variant[];
  tags: string[];
}

export function ProductDetailsClient({ product }: { product: Product }) {
  const [qty, setQty] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<number | null>(
    product.variants.length > 0 ? 0 : null,
  );
  const [wishlisted, setWishlisted] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const { addToCart, loading } = useCart();
  const { toggle, isWishlisted } = useWishlist();

  /* Active price — variant overrides base price */
  const activeVariant =
    selectedVariant !== null ? product.variants[selectedVariant] : null;
  const activePrice = activeVariant?.price ?? product.price;
  const activeStock = activeVariant?.stock ?? product.stock;
  const isOutOfStock = activeStock === 0;

  const discountPct =
    product.discount ??
    (product.originalPrice && product.originalPrice > activePrice
      ? Math.round(
          ((product.originalPrice - activePrice) / product.originalPrice) * 100,
        )
      : 0);



const handleAddToCart = async ( productId: string, quantity: number ) => {
  if (isOutOfStock) return;

  // Prevent invalid quantity
  
  if (quantity <= 0) {
    console.warn("Invalid quantity");
    return;
  }

  try {
    // loading(true);

    // Optimistic UI update
    setAddedToCart(true);

    await addToCart({ productId, quantity });

    // Optional: show success toast instead
    setTimeout(() => setAddedToCart(false), 2000);
  } catch (error) {
    console.error("Add to cart failed:", error);
    setAddedToCart(false);


  } finally {
    // loading(false);
  }
};

 const handleToggleWishlist = async (productId: string) => {
  const previous = wishlisted;
  setWishlisted(!previous);

  try {
    await toggle(productId);
  } catch (error) {
    console.error("Wishlist toggle failed:", error);
    setWishlisted(previous);
  }
};

  const handleShare = async () => {
    try {
      await navigator.share({ title: product.name, url: window.location.href });
    } catch {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="space-y-6">
      {/* Badges */}
      <div className="flex flex-wrap gap-2">
        {product.isFeatured && (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400">
            <Flame size={11} /> হট পণ্য
          </span>
        )}
        {product.isNewArrival && (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-400">
            নতুন
          </span>
        )}
        {discountPct > 0 && (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400">
            <BadgePercent size={11} /> {discountPct}% ছাড়
          </span>
        )}
      </div>

      {/* Name */}
      <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white leading-tight">
        {product.name}
      </h1>

      {/* Rating row */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              size={14}
              className={
                i < Math.round(product.rating)
                  ? "fill-amber-400 text-amber-400"
                  : "text-stone-300 dark:text-stone-600"
              }
            />
          ))}
        </div>
        <span className="text-sm text-stone-500 dark:text-stone-400">
          {product.rating.toFixed(1)} ({product.numReviews} রিভিউ)
        </span>
        <span className="text-sm text-stone-400 dark:text-stone-500">
          · {product.sold} বিক্রি হয়েছে
        </span>
      </div>

      {/* Short description */}
      {product.shortDesc && (
        <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
          {product.shortDesc}
        </p>
      )}

      {/* Price */}
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-bold text-stone-900 dark:text-white">
          ৳{activePrice.toLocaleString("bn-BD")}
        </span>
        {product.originalPrice && product.originalPrice > activePrice && (
          <span className="text-lg text-stone-400 dark:text-stone-500 line-through">
            ৳{product.originalPrice.toLocaleString("bn-BD")}
          </span>
        )}
        {product.unit && (
          <span className="text-sm text-stone-400 dark:text-stone-500">
            / {product.unit}
          </span>
        )}
      </div>

      {/* Variants */}
      {product.variants.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-stone-700 dark:text-stone-300">
            ভ্যারিয়েন্ট বেছে নিন
          </p>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((v, i) => (
              <button
                key={i}
                onClick={() => setSelectedVariant(i)}
                disabled={v.stock === 0}
                className={`
                  px-3 py-1.5 rounded-xl text-sm font-medium
                  border transition-all duration-200
                  disabled:opacity-40 disabled:cursor-not-allowed
                  ${
                    selectedVariant === i
                      ? "border-green-600 bg-green-700 text-white"
                      : "border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:border-green-600"
                  }
                `}
              >
                {v.label}
                {v.stock === 0 && " (নেই)"}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Stock indicator */}
      <div
        className={`text-sm font-medium ${
          isOutOfStock
            ? "text-red-500"
            : activeStock <= 10
              ? "text-amber-500"
              : "text-green-600 dark:text-green-500"
        }`}
      >
        {isOutOfStock
          ? "স্টক নেই"
          : activeStock <= 10
            ? `মাত্র ${activeStock} টি বাকি আছে!`
            : "স্টকে আছে ✓"}
      </div>

      {/* Qty + Add to cart */}
      <div className="flex items-center gap-3">
        {/* Quantity selector */}
        <div className="flex items-center gap-0 rounded-xl border border-stone-200 dark:border-stone-700 overflow-hidden">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="w-10 h-11 flex items-center justify-center text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <Minus size={14} />
          </button>
          <span className="w-10 text-center text-sm font-semibold text-stone-900 dark:text-white">
            {qty}
          </span>
          <button
            onClick={() => setQty((q) => Math.min(activeStock, q + 1))}
            disabled={qty >= activeStock}
            className="w-10 h-11 flex items-center justify-center text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-40 transition-colors"
          >
            <Plus size={14} />
          </button>
        </div>

        {/* Add to cart */}
        <motion.button
          onClick={() => handleAddToCart(product._id, qty)}
          disabled={isOutOfStock}
          whileTap={{ scale: 0.97 }}
          className={`
            flex-1 flex items-center justify-center gap-2
            py-3 px-5 rounded-xl text-sm font-semibold
            transition-all duration-200
            ${
              isOutOfStock
                ? "bg-stone-100 dark:bg-stone-800 text-stone-400 cursor-not-allowed"
                : addedToCart
                  ? "bg-green-600 text-white"
                  : "bg-green-700 hover:bg-green-600 text-white shadow-lg shadow-green-700/25"
            }
          `}
        >
          <ShoppingCart size={16} />
          {isOutOfStock
            ? "স্টক নেই"
            : addedToCart
              ? "কার্টে যোগ হয়েছে ✓"
              : "কার্টে যোগ করুন"}
        </motion.button>

        {/* Wishlist */}
        <button
          onClick={() => handleToggleWishlist(product._id)}
          className="w-11 h-11 rounded-xl border border-stone-200 dark:border-stone-700 flex items-center justify-center hover:border-red-400 transition-colors"
        >
          <Heart
            size={18}
            className={
              wishlisted ? "fill-red-500 text-red-500" : "text-stone-400"
            }
          />
        </button>

        {/* Share */}
        <button
          onClick={handleShare}
          className="w-11 h-11 rounded-xl border border-stone-200 dark:border-stone-700 flex items-center justify-center hover:border-green-600 transition-colors text-stone-400 hover:text-green-600"
        >
          <Share2 size={16} />
        </button>
      </div>

      {/* Trust badges */}
      <div className="grid grid-cols-3 gap-3 pt-2">
        {[
          { icon: Truck, label: "ফ্রি ডেলিভারি", sub: "৳৯৯৯+ অর্ডারে" },
          { icon: ShieldCheck, label: "নিরাপদ পেমেন্ট", sub: "bKash / Nagad" },
          { icon: RotateCcw, label: "রিটার্ন পলিসি", sub: "৭ দিনের মধ্যে" },
        ].map(({ icon: Icon, label, sub }) => (
          <div
            key={label}
            className="flex flex-col items-center gap-1 p-3 rounded-xl bg-stone-50 dark:bg-stone-800/50 text-center"
          >
            <Icon size={18} className="text-green-600 dark:text-green-500" />
            <p className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              {label}
            </p>
            <p className="text-[11px] text-stone-400 dark:text-stone-500">
              {sub}
            </p>
          </div>
        ))}
      </div>

      {/* Tags */}
      {product.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {product.tags.map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 rounded-full text-xs bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
