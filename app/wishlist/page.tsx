"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";
import { useWishlist } from "@/app/hooks/use-wishlist";
import {
  Heart,
  ShoppingCart,
  Trash2,
  ArrowRight,
  Star,
  Loader2,
  PackageX,
} from "lucide-react";
import { useCart } from "../hooks/use-card";

/* ── Types ─────────────────────────────────────────── */
interface WishlistItem {
  _id: string;
  product: string;
  name: string;
  thumbnail: string;
  price: number;
  originalPrice?: number;
  slug: string;
  category: string;
  unit?: string;
  addedAt: string;
}

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [addingId, setAddingId] = useState<string | null>(null);

  const { addToCart } = useCart();
  const { remove, isWishlisted, setIds } = useWishlist();

  /* Fetch wishlist */
  const fetchWishlist = async () => {
    try {
      const { data } = await axios.get<{ items: WishlistItem[] }>(
        "/api/wishlist",
      );
      setItems(data.items ?? []);
      /* Sync wishlist hook state */
      setIds(new Set(data.items.map((i) => i.product)));
    } catch {
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  useEffect(() => {
    const refresh = () => fetchWishlist();
    window.addEventListener("wishlist:updated", refresh);
    return () => window.removeEventListener("wishlist:updated", refresh);
  }, []);

  const handleRemove = async (productId: string) => {
    await remove(productId);
    setItems((prev) => prev.filter((i) => i.product !== productId));
  };

  const handleAddToCart = async (item: WishlistItem) => {
    setAddingId(item.product);
    try {
      await addToCart({ productId: item.product, quantity: 1 });
    } finally {
      setAddingId(null);
    }
  };

  const handleMoveAllToCart = async () => {
    for (const item of items) {
      await addToCart({ productId: item.product, quantity: 1 });
    }
  };

  /* ── Loading ──────────────────────────────────────── */
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-950">
        <Loader2 size={32} className="animate-spin text-green-600" />
      </div>
    );
  }

  /* ── Empty ────────────────────────────────────────── */
  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-stone-50 dark:bg-stone-950 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: EASE }}
          className="flex flex-col items-center gap-4 text-center"
        >
          <div className="w-24 h-24 rounded-full bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center">
            <Heart size={40} className="text-rose-300 dark:text-rose-700" />
          </div>
          <h2 className="text-xl font-bold text-stone-900 dark:text-white">
            উইশলিস্ট খালি আছে
          </h2>
          <p className="text-sm text-stone-500 dark:text-stone-400 max-w-xs">
            পছন্দের পণ্যে হার্ট বাটন চাপলে এখানে যোগ হবে।
          </p>
          <Link
            href="/shop"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-green-700 hover:bg-green-800 text-white text-sm font-semibold transition-colors"
          >
            পণ্য দেখুন <ArrowRight size={16} />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-stone-50 dark:bg-stone-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-stone-900 dark:text-white flex items-center gap-2">
              <Heart size={22} className="text-rose-500 fill-rose-500" />
              উইশলিস্ট
            </h1>
            <p className="text-sm text-stone-500 dark:text-stone-400 mt-0.5">
              {items.length} টি পণ্য সংরক্ষিত
            </p>
          </div>

          {items.length > 0 && (
            <motion.button
              onClick={handleMoveAllToCart}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-700 hover:bg-green-800 text-white text-sm font-semibold transition-colors"
            >
              <ShoppingCart size={15} />
              সব কার্টে যোগ করুন
            </motion.button>
          )}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          <AnimatePresence mode="popLayout">
            {items.map((item, i) => {
              const discountPct =
                item.originalPrice && item.originalPrice > item.price
                  ? Math.round(
                      ((item.originalPrice - item.price) / item.originalPrice) *
                        100,
                    )
                  : 0;
              const isAdding = addingId === item.product;

              return (
                <motion.div
                  key={item._id}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.35, ease: EASE, delay: i * 0.04 }}
                  className="
                    relative flex flex-col
                    bg-white dark:bg-stone-900
                    border border-stone-100 dark:border-stone-800
                    rounded-2xl overflow-hidden
                    shadow-sm hover:shadow-md
                    transition-shadow duration-300
                    group
                  "
                >
                  {/* Discount badge */}
                  {discountPct > 0 && (
                    <span className="absolute top-2 left-2 z-10 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500 text-white">
                      -{discountPct}%
                    </span>
                  )}

                  {/* Remove button */}
                  <button
                    onClick={() => handleRemove(item.product)}
                    aria-label="Remove from wishlist"
                    className="
                      absolute top-2 right-2 z-10
                      w-7 h-7 rounded-full flex items-center justify-center
                      bg-white/90 dark:bg-stone-900/90 backdrop-blur-sm
                      text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40
                      shadow-sm transition-all duration-200 hover:scale-110
                    "
                  >
                    <Trash2 size={13} />
                  </button>

                  {/* Image */}
                  <Link href={`/products/${item.slug}`} className="block">
                    <div className="relative aspect-square overflow-hidden bg-stone-100 dark:bg-stone-800">
                      <Image
                        unoptimized
                        src={item.thumbnail || "/placeholder.png"}
                        alt={item.name}
                        fill
                        sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 16vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  </Link>

                  {/* Info */}
                  <div className="flex flex-col gap-2 p-3 flex-1">
                    <span className="text-[10px] font-medium text-green-700 dark:text-green-500 uppercase tracking-wide">
                      {item.category}
                    </span>

                    <Link href={`/products/${item.slug}`}>
                      <p className="text-xs sm:text-sm font-semibold text-stone-800 dark:text-stone-100 leading-snug line-clamp-2 hover:text-green-700 dark:hover:text-green-400 transition-colors">
                        {item.name}
                      </p>
                    </Link>

                    {/* Price */}
                    <div className="flex items-baseline gap-1.5 mt-auto">
                      <span className="text-sm font-bold text-stone-900 dark:text-white">
                        ৳{item.price.toLocaleString("bn-BD")}
                      </span>
                      {item.originalPrice &&
                        item.originalPrice > item.price && (
                          <span className="text-[11px] text-stone-400 line-through">
                            ৳{item.originalPrice.toLocaleString("bn-BD")}
                          </span>
                        )}
                    </div>

                    {/* Add to cart */}
                    <motion.button
                      onClick={() => handleAddToCart(item)}
                      disabled={isAdding}
                      whileTap={{ scale: 0.97 }}
                      className="
                        w-full flex items-center justify-center gap-1.5
                        py-2 px-3 rounded-xl text-xs font-semibold
                        bg-green-700 hover:bg-green-600 text-white
                        disabled:opacity-60 disabled:cursor-not-allowed
                        transition-colors duration-200
                        shadow-sm shadow-green-700/20
                      "
                    >
                      {isAdding ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <ShoppingCart size={12} />
                      )}
                      {isAdding ? "যোগ হচ্ছে..." : "কার্টে যোগ করুন"}
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Bottom link */}
        <div className="text-center mt-10">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-sm font-medium text-green-700 dark:text-green-500 hover:text-green-800 transition-colors"
          >
            আরো পণ্য দেখুন <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </main>
  );
}
