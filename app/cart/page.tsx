"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Tag,
  PackageX,
  Loader2,
} from "lucide-react";
import { useCart } from "../hooks/use-card";

/* ── Types ─────────────────────────────────────────── */
interface CartItem {
  _id: string;
  product: string;
  name: string;
  thumbnail: string;
  price: number;
  originalPrice?: number;
  slug: string;
  unit?: string;
  category: string;
  variantLabel?: string;
  quantity: number;
}

interface CartData {
  items: CartItem[];
  coupon: string | null;
  discount: number;
  subtotal: number;
  total: number;
  itemCount: number;
}

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function CartPage() {
  const [cart, setCart] = useState<CartData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [couponInput, setCouponInput] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");

  const {
    removeFromCart,
    updateQuantity,
    clearCart,
    loading: actionLoading,
  } = useCart();

  /* Fetch cart */
  const fetchCart = async () => {
    try {
      const { data } = await axios.get<CartData>("/api/cart");
      setCart(data);
    } catch {
      setCart(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  /* Listen for cart updates from hook */
  useEffect(() => {
    const refresh = () => fetchCart();
    window.addEventListener("cart:updated", refresh);
    return () => window.removeEventListener("cart:updated", refresh);
  }, []);

  const handleQtyChange = async (itemId: string, qty: number) => {
    if (qty < 1) return;
    await updateQuantity(itemId, qty);
    await fetchCart();
  };

  const handleRemove = async (itemId: string) => {
    await removeFromCart(itemId);
    await fetchCart();
  };

  const handleClear = async () => {
    await clearCart();
    await fetchCart();
  };

  const handleCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    setCouponLoading(true);
    setCouponError("");
    try {
      await axios.post("/api/cart/coupon", { code });
      await fetchCart();
      setCouponInput("");
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? (err.response?.data?.message ?? "Invalid coupon")
        : "Invalid coupon";
      setCouponError(msg);
    } finally {
      setCouponLoading(false);
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
  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-stone-50 dark:bg-stone-950 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: EASE }}
          className="flex flex-col items-center gap-4 text-center"
        >
          <div className="w-24 h-24 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center">
            <ShoppingBag
              size={40}
              className="text-stone-300 dark:text-stone-600"
            />
          </div>
          <h2 className="text-xl font-bold text-stone-900 dark:text-white">
            কার্ট খালি আছে
          </h2>
          <p className="text-sm text-stone-500 dark:text-stone-400 max-w-xs">
            আপনার কার্টে কোনো পণ্য নেই। পণ্য যোগ করুন এবং কেনাকাটা শুরু করুন।
          </p>
          <Link
            href="/shop"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-green-700 hover:bg-green-800 text-white text-sm font-semibold transition-colors"
          >
            কেনাকাটা শুরু করুন <ArrowRight size={16} />
          </Link>
        </motion.div>

        {/* Suggested categories */}
        <div className="flex flex-wrap justify-center gap-2 mt-2">
          {[
            { label: "মুদিখানা", href: "/groceries", emoji: "🥦" },
            { label: "প্রসাধনী", href: "/beauty", emoji: "🧴" },
            { label: "অফার", href: "/offers", emoji: "🎁" },
          ].map(({ label, href, emoji }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-stone-200 dark:border-stone-700 text-sm text-stone-600 dark:text-stone-300 hover:border-green-600 hover:text-green-700 transition-colors"
            >
              {emoji} {label}
            </Link>
          ))}
        </div>
      </div>
    );
  }

  const freeDelivery = cart.total >= 999;
  const deliveryCharge = freeDelivery ? 0 : 60;
  const grandTotal = cart.total + deliveryCharge;

  return (
    <main className="min-h-screen bg-stone-50 dark:bg-stone-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-stone-900 dark:text-white">
              আমার কার্ট
            </h1>
            <p className="text-sm text-stone-500 dark:text-stone-400 mt-0.5">
              {cart.itemCount} টি পণ্য
            </p>
          </div>
          <button
            onClick={handleClear}
            disabled={actionLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors disabled:opacity-50"
          >
            <Trash2 size={13} />
            সব মুছুন
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Cart items ──────────────────────────── */}
          <div className="lg:col-span-2 space-y-3">
            <AnimatePresence mode="popLayout">
              {cart.items.map((item) => (
                <motion.div
                  key={item._id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -30, scale: 0.95 }}
                  transition={{ duration: 0.3, ease: EASE }}
                  className="
                    flex gap-4 p-4 rounded-2xl
                    bg-white dark:bg-stone-900
                    border border-stone-100 dark:border-stone-800
                    shadow-sm
                  "
                >
                  {/* Thumbnail */}
                  <Link href={`/products/${item.slug}`} className="shrink-0">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800">
                      <Image
                        unoptimized
                        src={item.thumbnail || "/placeholder.png"}
                        alt={item.name}
                        width={96}
                        height={96}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  </Link>

                  {/* Info */}
                  <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <Link href={`/products/${item.slug}`}>
                        <p className="text-sm font-semibold text-stone-800 dark:text-stone-200 leading-snug hover:text-green-700 dark:hover:text-green-400 transition-colors line-clamp-2">
                          {item.name}
                        </p>
                      </Link>
                      <button
                        onClick={() => handleRemove(item._id)}
                        disabled={actionLoading}
                        aria-label="Remove"
                        className="p-1 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors shrink-0"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    {item.variantLabel && (
                      <span className="inline-block px-2 py-0.5 rounded-md text-[11px] bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 w-fit">
                        {item.variantLabel}
                      </span>
                    )}

                    <p className="text-xs text-stone-400 dark:text-stone-500 capitalize">
                      {item.category}
                    </p>

                    <div className="flex items-center justify-between mt-auto">
                      {/* Price */}
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-base font-bold text-stone-900 dark:text-white">
                          ৳
                          {(item.price * item.quantity).toLocaleString("bn-BD")}
                        </span>
                        {item.originalPrice &&
                          item.originalPrice > item.price && (
                            <span className="text-xs text-stone-400 line-through">
                              ৳
                              {(
                                item.originalPrice * item.quantity
                              ).toLocaleString("bn-BD")}
                            </span>
                          )}
                      </div>

                      {/* Qty selector */}
                      <div className="flex items-center gap-0 rounded-xl border border-stone-200 dark:border-stone-700 overflow-hidden">
                        <button
                          onClick={() =>
                            handleQtyChange(item._id, item.quantity - 1)
                          }
                          disabled={item.quantity <= 1 || actionLoading}
                          className="w-8 h-8 flex items-center justify-center text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-40 transition-colors"
                        >
                          <Minus size={13} />
                        </button>
                        <span className="w-9 text-center text-sm font-semibold text-stone-900 dark:text-white tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            handleQtyChange(item._id, item.quantity + 1)
                          }
                          disabled={actionLoading}
                          className="w-8 h-8 flex items-center justify-center text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-40 transition-colors"
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Continue shopping */}
            <Link
              href="/shop"
              className="flex items-center gap-2 text-sm font-medium text-green-700 dark:text-green-500 hover:text-green-800 transition-colors mt-2"
            >
              ← কেনাকাটা চালিয়ে যান
            </Link>
          </div>

          {/* ── Order summary ────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: EASE, delay: 0.1 }}
            className="lg:col-span-1"
          >
            <div className="sticky top-24 space-y-4">
              <div
                className="
                bg-white dark:bg-stone-900
                border border-stone-100 dark:border-stone-800
                rounded-2xl p-5 shadow-sm space-y-4
              "
              >
                <h2 className="text-base font-bold text-stone-900 dark:text-white">
                  অর্ডার সামারি
                </h2>

                {/* Coupon */}
                <form onSubmit={handleCoupon} className="space-y-2">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
                      />
                      <input
                        type="text"
                        placeholder="কুপন কোড"
                        value={couponInput}
                        onChange={(e) =>
                          setCouponInput(e.target.value.toUpperCase())
                        }
                        className="
                          w-full pl-8 pr-3 py-2.5 rounded-xl text-sm
                          bg-stone-50 dark:bg-stone-800
                          border border-stone-200 dark:border-stone-700
                          text-stone-900 dark:text-stone-100
                          placeholder:text-stone-400
                          focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/15
                          transition-all
                        "
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={couponLoading || !couponInput.trim()}
                      className="px-3 py-2.5 rounded-xl bg-stone-900 dark:bg-white text-white dark:text-stone-900 text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-all"
                    >
                      {couponLoading ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        "প্রয়োগ"
                      )}
                    </button>
                  </div>
                  {couponError && (
                    <p className="text-xs text-red-500">{couponError}</p>
                  )}
                  {cart.coupon && (
                    <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                      ✓ কুপন &quot;{cart.coupon}&quot; প্রয়োগ হয়েছে
                    </p>
                  )}
                </form>

                {/* Price breakdown */}
                <div className="space-y-2.5 pt-2 border-t border-stone-100 dark:border-stone-800">
                  <Row
                    label="সাবটোটাল"
                    value={`৳${cart.subtotal.toLocaleString("bn-BD")}`}
                  />
                  {cart.discount > 0 && (
                    <Row
                      label="ছাড়"
                      value={`-৳${cart.discount.toLocaleString("bn-BD")}`}
                      valueClass="text-green-600 dark:text-green-400"
                    />
                  )}
                  <Row
                    label="ডেলিভারি চার্জ"
                    value={freeDelivery ? "বিনামূল্যে" : `৳${deliveryCharge}`}
                    valueClass={
                      freeDelivery
                        ? "text-green-600 dark:text-green-400 font-medium"
                        : ""
                    }
                  />
                  {!freeDelivery && (
                    <p className="text-xs text-amber-600 dark:text-amber-400">
                      ৳{(999 - cart.total).toLocaleString("bn-BD")} আরো কিনলে
                      ফ্রি ডেলিভারি
                    </p>
                  )}
                </div>

                {/* Total */}
                <div className="flex items-center justify-between pt-3 border-t border-stone-200 dark:border-stone-700">
                  <span className="text-base font-bold text-stone-900 dark:text-white">
                    মোট
                  </span>
                  <span className="text-xl font-bold text-green-700 dark:text-green-400">
                    ৳{grandTotal.toLocaleString("bn-BD")}
                  </span>
                </div>

                {/* Checkout button */}
                <Link href="/checkout">
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    className="
                      w-full flex items-center justify-center gap-2
                      py-3.5 px-6 rounded-xl
                      bg-green-700 hover:bg-green-800
                      text-white text-sm font-semibold
                      shadow-lg shadow-green-700/25
                      transition-colors duration-200
                    "
                  >
                    চেকআউট করুন <ArrowRight size={16} />
                  </motion.button>
                </Link>

                {/* Trust badges */}
                <div className="flex items-center justify-center gap-4 pt-1">
                  {["bKash", "Nagad", "Rocket", "Cash"].map((m) => (
                    <span
                      key={m}
                      className="text-[10px] font-medium text-stone-400 dark:text-stone-500"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}

/* ── Helper row ────────────────────────────────────── */
function Row({
  label,
  value,
  valueClass = "",
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-stone-500 dark:text-stone-400">
        {label}
      </span>
      <span
        className={`text-sm font-medium text-stone-900 dark:text-white ${valueClass}`}
      >
        {value}
      </span>
    </div>
  );
}
