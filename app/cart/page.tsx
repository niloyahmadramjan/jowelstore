"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence }       from "framer-motion";
import Link                              from "next/link";
import Image                             from "next/image";
import { useRouter }                     from "next/navigation";
import axios                             from "axios";
import { useCart }                       from "@/app/hooks/use-card";
import {
  ShoppingBag, Trash2, Plus, Minus,
  ArrowRight, Tag, Loader2, X,
  CheckCircle, ChevronRight, Sparkles,
} from "lucide-react";

/* ── Types ─────────────────────────────────────────── */
interface CartItem {
  _id:           string;
  product:       string;
  name:          string;
  thumbnail:     string;
  price:         number;
  originalPrice?: number;
  slug:          string;
  unit?:         string;
  category:      string;
  variantLabel?: string;
  quantity:      number;
}

interface CartData {
  items:     CartItem[];
  coupon:    string | null;
  discount:  number;
  subtotal:  number;
  total:     number;
  itemCount: number;
}

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/* ── Page ───────────────────────────────────────────── */
export default function CartPage() {
  const router = useRouter();

  const [cart,          setCart]          = useState<CartData | null>(null);
  const [isLoading,     setIsLoading]     = useState(true);
  const [selected,      setSelected]      = useState<Set<string>>(new Set());
  const [couponInput,   setCouponInput]   = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError,   setCouponError]   = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");

  const { removeFromCart, updateQuantity, clearCart, loading: actionLoading } = useCart();

  /* ── Fetch ──────────────────────────────────────── */
  const fetchCart = async () => {
    try {
      const { data } = await axios.get<CartData>("/api/cart");
      setCart(data);
      /* Auto-select all on first load */
      setSelected(new Set(data.items.map((i) => i._id)));
    } catch {
      setCart(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchCart(); }, []);

  useEffect(() => {
    const cb = () => fetchCart();
    window.addEventListener("cart:updated", cb);
    return () => window.removeEventListener("cart:updated", cb);
  }, []);

  /* ── Selection helpers ──────────────────────────── */
  const allSelected = cart
    ? cart.items.length > 0 && cart.items.every((i) => selected.has(i._id))
    : false;

  const toggleAll = () => {
    if (!cart) return;
    if (allSelected) setSelected(new Set());
    else             setSelected(new Set(cart.items.map((i) => i._id)));
  };

  const toggleItem = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  /* ── Computed totals (selected items only) ──────── */
  const summary = useMemo(() => {
    if (!cart) return { subtotal: 0, originalTotal: 0, saved: 0, count: 0, itemQty: 0 };

    const items = cart.items.filter((i) => selected.has(i._id));
    const subtotal      = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const originalTotal = items.reduce((s, i) => s + (i.originalPrice ?? i.price) * i.quantity, 0);
    const saved         = originalTotal - subtotal;
    const count         = items.length;
    const itemQty       = items.reduce((s, i) => s + i.quantity, 0);

    /* Apply cart-level discount proportionally if coupon active */
    const discountFraction = cart.subtotal > 0 ? cart.discount / cart.subtotal : 0;
    const couponDiscount   = Math.round(subtotal * discountFraction);
    const deliveryCharge   = subtotal - couponDiscount >= 999 ? 0 : 60;
    const total            = Math.max(0, subtotal - couponDiscount) + deliveryCharge;

    return { subtotal, originalTotal, saved: saved + couponDiscount, count, itemQty, couponDiscount, deliveryCharge, total };
  }, [cart, selected]);

  /* ── Handlers ───────────────────────────────────── */
  const handleQtyChange = async (id: string, qty: number) => {
    if (qty < 1) return;
    await updateQuantity(id, qty);
    await fetchCart();
  };

  const handleRemove = async (id: string) => {
    setSelected((prev) => { const n = new Set(prev); n.delete(id); return n; });
    await removeFromCart(id);
    await fetchCart();
  };

  const handleDeleteSelected = async () => {
    for (const id of selected) await removeFromCart(id);
    setSelected(new Set());
    await fetchCart();
  };

  const handleCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    setCouponLoading(true);
    setCouponError("");
    setCouponSuccess("");
    try {
      const { data } = await axios.post<{ message: string; discount: number; coupon: string }>(
        "/api/cart/coupon", { code },
      );
      await fetchCart();
      setCouponInput("");
      setCouponSuccess(`"${data.coupon}" কুপন প্রয়োগ হয়েছে — ৳${data.discount} ছাড়`);
    } catch (err: unknown) {
      setCouponError(
        axios.isAxiosError(err)
          ? err.response?.data?.message ?? "Invalid coupon"
          : "Invalid coupon",
      );
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = async () => {
    await axios.delete("/api/cart/coupon");
    setCouponSuccess("");
    await fetchCart();
  };

  const handleCheckout = () => {
    if (selected.size === 0) return;
    const ids = [...selected].join(",");
    router.push(`/checkout?items=${ids}`);
  };

  /* ── Loading ────────────────────────────────────── */
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-950">
        <Loader2 size={32} className="animate-spin text-green-600" />
      </div>
    );
  }

  /* ── Empty ──────────────────────────────────────── */
  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-stone-50 dark:bg-stone-950 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1   }}
          transition={{ duration: 0.4, ease: EASE }}
          className="flex flex-col items-center gap-4 text-center"
        >
          <div className="w-24 h-24 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center">
            <ShoppingBag size={40} className="text-stone-300 dark:text-stone-600" />
          </div>
          <h2 className="text-xl font-bold text-stone-900 dark:text-white">কার্ট খালি আছে</h2>
          <p className="text-sm text-stone-500 dark:text-stone-400 max-w-xs">
            আপনার কার্টে কোনো পণ্য নেই। পণ্য যোগ করুন এবং কেনাকাটা শুরু করুন।
          </p>
          <Link href="/"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-green-700 hover:bg-green-800 text-white text-sm font-semibold transition-colors">
            কেনাকাটা শুরু করুন <ArrowRight size={16} />
          </Link>
        </motion.div>
        <div className="flex flex-wrap justify-center gap-2">
          {[
            { label: "মুদিখানা", href: "/groceries", emoji: "🥦" },
            { label: "প্রসাধনী", href: "/beauty",    emoji: "🧴" },
            { label: "অফার",     href: "/offers",    emoji: "🎁" },
          ].map(({ label, href, emoji }) => (
            <Link key={href} href={href}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-stone-200 dark:border-stone-700 text-sm text-stone-600 dark:text-stone-300 hover:border-green-600 hover:text-green-700 transition-colors">
              {emoji} {label}
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-stone-100 dark:bg-stone-950">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-4">

        {/* Page title */}
        <div className="flex items-center gap-2">
          <ShoppingBag size={20} className="text-green-700 dark:text-green-500" />
          <h1 className="text-xl font-bold text-stone-900 dark:text-white">
            শপিং কার্ট
          </h1>
          <span className="text-sm text-stone-400 dark:text-stone-500">
            ({cart.itemCount} টি পণ্য)
          </span>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 items-start">

          {/* ── Left: Items ────────────────────────── */}
          <div className="flex-1 min-w-0 space-y-3">

            {/* Select-all header */}
            <div className="
              flex items-center justify-between
              bg-white dark:bg-stone-900
              rounded-2xl border border-stone-200 dark:border-stone-800
              px-4 py-3 shadow-sm
            ">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <Checkbox
                  checked={allSelected}
                  indeterminate={selected.size > 0 && !allSelected}
                  onChange={toggleAll}
                />
                <span className="text-sm font-medium text-stone-700 dark:text-stone-300">
                  সব পণ্য নির্বাচন করুন
                </span>
              </label>

              {selected.size > 0 && (
                <button
                  onClick={handleDeleteSelected}
                  className="flex items-center gap-1.5 text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 px-2.5 py-1.5 rounded-lg transition-colors"
                >
                  <Trash2 size={12} />
                  নির্বাচিত মুছুন ({selected.size})
                </button>
              )}
            </div>

            {/* Items */}
            <div className="
              bg-white dark:bg-stone-900
              rounded-2xl border border-stone-200 dark:border-stone-800
              shadow-sm overflow-hidden
            ">
              {/* Table header — desktop */}
              <div className="hidden sm:grid grid-cols-[auto_1fr_120px_140px_80px] gap-4 px-4 py-2.5 border-b border-stone-100 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/50">
                <div />
                <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">পণ্য</span>
                <span className="text-xs text-stone-500 dark:text-stone-400 font-medium text-center">একক দাম</span>
                <span className="text-xs text-stone-500 dark:text-stone-400 font-medium text-center">পরিমাণ</span>
                <span className="text-xs text-stone-500 dark:text-stone-400 font-medium text-right">মোট</span>
              </div>

              <AnimatePresence mode="popLayout">
                {cart.items.map((item, idx) => {
                  const isSelected  = selected.has(item._id);
                  const itemTotal   = item.price * item.quantity;
                  const origTotal   = (item.originalPrice ?? item.price) * item.quantity;
                  const itemSaved   = origTotal - itemTotal;
                  const discountPct = item.originalPrice && item.originalPrice > item.price
                    ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
                    : 0;

                  return (
                    <motion.div
                      key={item._id}
                      layout
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{    opacity: 0, height: 0, overflow: "hidden" }}
                      transition={{ duration: 0.28, ease: EASE }}
                      className={`
                        border-b border-stone-100 dark:border-stone-800 last:border-0
                        transition-colors duration-150
                        ${isSelected ? "bg-green-50/40 dark:bg-green-950/10" : ""}
                      `}
                    >
                      {/* Desktop row */}
                      <div className="hidden sm:grid grid-cols-[auto_1fr_120px_140px_80px] gap-4 items-center px-4 py-4">
                        {/* Checkbox */}
                        <Checkbox checked={isSelected} onChange={() => toggleItem(item._id)} />

                        {/* Product */}
                        <div className="flex items-center gap-3 min-w-0">
                          <Link href={`/products/${item.slug}`} className="shrink-0">
                            <div className="w-16 h-16 rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800">
                              <Image
                                unoptimized
                                src={item.thumbnail || "/placeholder.png"}
                                alt={item.name}
                                width={64} height={64}
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                          </Link>
                          <div className="min-w-0">
                            <Link href={`/products/${item.slug}`}>
                              <p className="text-sm font-medium text-stone-800 dark:text-stone-200 line-clamp-2 hover:text-green-700 dark:hover:text-green-400 transition-colors">
                                {item.name}
                              </p>
                            </Link>
                            {item.variantLabel && (
                              <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] bg-stone-100 dark:bg-stone-700 text-stone-500 dark:text-stone-400">
                                {item.variantLabel}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Unit price */}
                        <div className="text-center">
                          <p className="text-sm font-semibold text-stone-900 dark:text-white">
                            ৳{item.price.toLocaleString("bn-BD")}
                          </p>
                          {item.originalPrice && item.originalPrice > item.price && (
                            <p className="text-xs text-stone-400 line-through">
                              ৳{item.originalPrice.toLocaleString("bn-BD")}
                            </p>
                          )}
                          {discountPct > 0 && (
                            <span className="text-[10px] font-bold text-red-500">-{discountPct}%</span>
                          )}
                        </div>

                        {/* Qty */}
                        <div className="flex items-center justify-center gap-0 rounded-xl border border-stone-200 dark:border-stone-700 overflow-hidden w-fit mx-auto">
                          <button
                            onClick={() => handleQtyChange(item._id, item.quantity - 1)}
                            disabled={item.quantity <= 1 || actionLoading}
                            className="w-8 h-8 flex items-center justify-center text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-40 transition-colors"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="w-9 text-center text-sm font-semibold text-stone-900 dark:text-white tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQtyChange(item._id, item.quantity + 1)}
                            disabled={actionLoading}
                            className="w-8 h-8 flex items-center justify-center text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-40 transition-colors"
                          >
                            <Plus size={12} />
                          </button>
                        </div>

                        {/* Total + delete */}
                        <div className="text-right">
                          <p className="text-sm font-bold text-green-700 dark:text-green-400">
                            ৳{itemTotal.toLocaleString("bn-BD")}
                          </p>
                          {itemSaved > 0 && (
                            <p className="text-[10px] text-stone-400 dark:text-stone-500">
                              সাশ্রয় ৳{itemSaved.toLocaleString("bn-BD")}
                            </p>
                          )}
                          <button
                            onClick={() => handleRemove(item._id)}
                            disabled={actionLoading}
                            className="mt-1 text-xs text-stone-400 hover:text-red-500 transition-colors"
                          >
                            মুছুন
                          </button>
                        </div>
                      </div>

                      {/* Mobile row */}
                      <div className="sm:hidden flex gap-3 px-4 py-4">
                        <div className="flex flex-col items-center gap-2 pt-1">
                          <Checkbox checked={isSelected} onChange={() => toggleItem(item._id)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex gap-3">
                            <Link href={`/products/${item.slug}`} className="shrink-0">
                              <div className="w-16 h-16 rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800">
                                <Image
                                  unoptimized
                                  src={item.thumbnail || "/placeholder.png"}
                                  alt={item.name}
                                  width={64} height={64}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </Link>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-stone-800 dark:text-stone-200 line-clamp-2">
                                {item.name}
                              </p>
                              {item.variantLabel && (
                                <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded text-[10px] bg-stone-100 dark:bg-stone-700 text-stone-500">
                                  {item.variantLabel}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between mt-3">
                            <div>
                              <span className="text-base font-bold text-green-700 dark:text-green-400">
                                ৳{itemTotal.toLocaleString("bn-BD")}
                              </span>
                              {item.originalPrice && item.originalPrice > item.price && (
                                <span className="ml-1.5 text-xs text-stone-400 line-through">
                                  ৳{(item.originalPrice * item.quantity).toLocaleString("bn-BD")}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              {/* Qty */}
                              <div className="flex items-center rounded-lg border border-stone-200 dark:border-stone-700 overflow-hidden">
                                <button
                                  onClick={() => handleQtyChange(item._id, item.quantity - 1)}
                                  disabled={item.quantity <= 1 || actionLoading}
                                  className="w-7 h-7 flex items-center justify-center text-stone-600 hover:bg-stone-100 disabled:opacity-40"
                                >
                                  <Minus size={11} />
                                </button>
                                <span className="w-7 text-center text-xs font-semibold text-stone-900 dark:text-white">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => handleQtyChange(item._id, item.quantity + 1)}
                                  disabled={actionLoading}
                                  className="w-7 h-7 flex items-center justify-center text-stone-600 hover:bg-stone-100 disabled:opacity-40"
                                >
                                  <Plus size={11} />
                                </button>
                              </div>
                              <button
                                onClick={() => handleRemove(item._id)}
                                className="p-1.5 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Coupon */}
            <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm p-4">
              <div className="flex items-center gap-2 mb-3">
                <Tag size={15} className="text-green-600 dark:text-green-500" />
                <span className="text-sm font-semibold text-stone-800 dark:text-stone-200">
                  ভাউচার / কুপন কোড
                </span>
              </div>

              {cart.coupon ? (
                <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800/50">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={15} className="text-green-600 dark:text-green-400" />
                    <span className="text-sm font-medium text-green-700 dark:text-green-400">
                      &quot;{cart.coupon}&quot; — ৳{cart.discount.toLocaleString("bn-BD")} ছাড়
                    </span>
                  </div>
                  <button
                    onClick={handleRemoveCoupon}
                    className="p-1 rounded text-green-600 hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCoupon} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="কুপন কোড লিখুন"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    className="
                      flex-1 px-3.5 py-2.5 rounded-xl text-sm
                      bg-stone-50 dark:bg-stone-800
                      border border-stone-200 dark:border-stone-700
                      text-stone-900 dark:text-stone-100
                      placeholder:text-stone-400
                      focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/15
                      transition-all
                    "
                  />
                  <button
                    type="submit"
                    disabled={couponLoading || !couponInput.trim()}
                    className="px-4 py-2.5 rounded-xl bg-green-700 hover:bg-green-800 text-white text-sm font-semibold disabled:opacity-50 transition-colors flex items-center gap-1.5"
                  >
                    {couponLoading ? <Loader2 size={14} className="animate-spin" /> : "প্রয়োগ"}
                  </button>
                </form>
              )}

              <AnimatePresence>
                {couponError && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="mt-2 text-xs text-red-500"
                  >
                    {couponError}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Continue shopping */}
            <Link href="/"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-green-700 dark:text-green-500 hover:text-green-800 transition-colors">
              ← কেনাকাটা চালিয়ে যান
            </Link>
          </div>

          {/* ── Right: Summary ──────────────────────── */}
          <div className="w-full lg:w-[340px] shrink-0">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1,  y: 0  }}
              transition={{ duration: 0.4, ease: EASE, delay: 0.1 }}
              className="sticky top-20 space-y-3"
            >
              {/* Savings banner */}
              {summary.saved > 0 && (
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800/50">
                  <Sparkles size={15} className="text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium text-green-700 dark:text-green-400">
                    আপনি ৳{summary.saved.toLocaleString("bn-BD")} সাশ্রয় করছেন!
                  </span>
                </div>
              )}

              {/* Summary card */}
              <div className="
                bg-white dark:bg-stone-900
                border border-stone-200 dark:border-stone-800
                rounded-2xl shadow-sm p-5 space-y-4
              ">
                <h2 className="text-base font-bold text-stone-900 dark:text-white">
                  অর্ডার সামারি
                </h2>

                <div className="space-y-3">
                  <SumRow
                    label={`পণ্যের দাম (${summary.itemQty} টি)`}
                    value={`৳${summary.subtotal.toLocaleString("bn-BD")}`}
                  />
                  {summary.saved > 0 && (
                    <SumRow
                      label="মোট সাশ্রয়"
                      value={`-৳${summary.saved.toLocaleString("bn-BD")}`}
                      valueClass="text-green-600 dark:text-green-400 font-semibold"
                    />
                  )}
                  {(summary.couponDiscount ?? 0) > 0 && (
                    <SumRow
                      label={`কুপন ছাড় (${cart.coupon})`}
                      value={`-৳${(summary.couponDiscount ?? 0).toLocaleString("bn-BD")}`}
                      valueClass="text-green-600 dark:text-green-400"
                    />
                  )}
                  <SumRow
                    label="ডেলিভারি চার্জ"
                    value={summary.deliveryCharge === 0 ? "বিনামূল্যে" : `৳${summary.deliveryCharge}`}
                    valueClass={summary.deliveryCharge === 0 ? "text-green-600 dark:text-green-400 font-medium" : ""}
                  />
                 {(summary?.deliveryCharge ?? 0) > 0 && summary.subtotal > 0 && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 -mt-1">
                      ৳{(999 - (summary.subtotal - (summary.couponDiscount ?? 0))).toLocaleString("bn-BD")} আরো কিনলে ফ্রি ডেলিভারি
                    </p>
                  )}
                </div>

                {/* Divider + Total */}
                <div className="pt-3 border-t border-stone-200 dark:border-stone-700 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-bold text-stone-900 dark:text-white">
                      মোট পরিশোধ
                    </span>
                    <span className="text-xl font-bold text-green-700 dark:text-green-400">
                      ৳{(summary.total ?? 0).toLocaleString("bn-BD")}
                    </span>
                  </div>

                  {/* Checkout button */}
                  <motion.button
                    onClick={handleCheckout}
                    disabled={selected.size === 0}
                    whileHover={{ scale: selected.size > 0 ? 1.01 : 1 }}
                    whileTap={{   scale: selected.size > 0 ? 0.98 : 1 }}
                    className="
                      w-full flex items-center justify-center gap-2
                      py-3.5 px-6 rounded-xl
                      bg-green-700 hover:bg-green-800
                      disabled:bg-stone-300 dark:disabled:bg-stone-700
                      disabled:cursor-not-allowed
                      text-white text-sm font-semibold
                      shadow-lg shadow-green-700/25
                      transition-all duration-200
                    "
                  >
                    চেকআউট করুন ({selected.size})
                    <ChevronRight size={16} />
                  </motion.button>

                  {selected.size === 0 && (
                    <p className="text-xs text-center text-stone-400 dark:text-stone-500">
                      কমপক্ষে একটি পণ্য নির্বাচন করুন
                    </p>
                  )}
                </div>

                {/* Payment badges */}
                <div className="pt-2 border-t border-stone-100 dark:border-stone-800">
                  <p className="text-[10px] text-stone-400 dark:text-stone-600 text-center mb-2">
                    পেমেন্ট পদ্ধতি
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    {["bKash", "Nagad", "Rocket", "Cash on Delivery"].map((m) => (
                      <span key={m}
                        className="px-2 py-1 rounded-md text-[10px] font-medium bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  );
}

/* ── Checkbox component ─────────────────────────────── */
function Checkbox({
  checked,
  indeterminate = false,
  onChange,
}: {
  checked:         boolean;
  indeterminate?:  boolean;
  onChange:        () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`
        w-5 h-5 rounded-md border-2 flex items-center justify-center
        transition-all duration-150 shrink-0
        ${checked || indeterminate
          ? "bg-green-700 border-green-700"
          : "border-stone-300 dark:border-stone-600 hover:border-green-500"
        }
      `}
    >
      {checked && (
        <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
          <path d="M1 4L4 7.5L10 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
      {!checked && indeterminate && (
        <div className="w-2.5 h-0.5 bg-white rounded-full" />
      )}
    </button>
  );
}

/* ── Summary row ────────────────────────────────────── */
function SumRow({
  label, value, valueClass = "",
}: {
  label: string; value: string; valueClass?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-stone-500 dark:text-stone-400">{label}</span>
      <span className={`text-sm font-medium text-stone-900 dark:text-white ${valueClass}`}>
        {value}
      </span>
    </div>
  );
}