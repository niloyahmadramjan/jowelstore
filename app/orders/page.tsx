"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";
import {
  Package,
  ChevronRight,
  Loader2,
  PackageX,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  RotateCcw,
  RefreshCw,
  ArrowRight,
} from "lucide-react";

/* ── Types ─────────────────────────────────────────── */
interface OrderItem {
  _id: string;
  name: string;
  thumbnail: string;
  slug: string;
  price: number;
  quantity: number;
  unit?: string;
  variantLabel?: string;
}

interface Order {
  _id: string;
  orderId: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  deliveryCharge: number;
  total: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  shippingAddress: {
    fullName: string;
    phone: string;
    address: string;
    area: string;
    city: string;
    district: string;
  };
}

interface OrdersResponse {
  orders: Order[];
  total: number;
  totalPages: number;
  hasMore: boolean;
}

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; icon: React.ReactNode }
> = {
  pending: {
    label: "অপেক্ষমান",
    color:
      "text-amber-600  dark:text-amber-400  bg-amber-50  dark:bg-amber-950/40  border-amber-200  dark:border-amber-800/50",
    icon: <Clock size={13} />,
  },
  confirmed: {
    label: "নিশ্চিত",
    color:
      "text-blue-600   dark:text-blue-400   bg-blue-50   dark:bg-blue-950/40   border-blue-200   dark:border-blue-800/50",
    icon: <CheckCircle size={13} />,
  },
  processing: {
    label: "প্রস্তুতি",
    color:
      "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800/50",
    icon: <RefreshCw size={13} />,
  },
  shipped: {
    label: "পথে আছে",
    color:
      "text-teal-600   dark:text-teal-400   bg-teal-50   dark:bg-teal-950/40   border-teal-200   dark:border-teal-800/50",
    icon: <Truck size={13} />,
  },
  delivered: {
    label: "ডেলিভারি",
    color:
      "text-green-600  dark:text-green-400  bg-green-50  dark:bg-green-950/40  border-green-200  dark:border-green-800/50",
    icon: <CheckCircle size={13} />,
  },
  cancelled: {
    label: "বাতিল",
    color:
      "text-red-600    dark:text-red-400    bg-red-50    dark:bg-red-950/40    border-red-200    dark:border-red-800/50",
    icon: <XCircle size={13} />,
  },
  refunded: {
    label: "রিফান্ড",
    color:
      "text-stone-600  dark:text-stone-400  bg-stone-50  dark:bg-stone-800     border-stone-200  dark:border-stone-700",
    icon: <RotateCcw size={13} />,
  },
};

const FILTERS = [
  { value: "", label: "সব অর্ডার" },
  { value: "pending", label: "অপেক্ষমান" },
  { value: "confirmed", label: "নিশ্চিত" },
  { value: "shipped", label: "পথে আছে" },
  { value: "delivered", label: "ডেলিভারি" },
  { value: "cancelled", label: "বাতিল" },
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<Order | null>(null);

  const fetchOrders = useCallback(
    async (status: string, pg: number, replace: boolean) => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({ page: String(pg), limit: "8" });
        if (status) params.set("status", status);
        const { data } = await axios.get<OrdersResponse>(
          `/api/orders?${params}`,
        );
        setOrders((prev) =>
          replace ? data.orders : [...prev, ...data.orders],
        );
        setHasMore(data.hasMore);
        setTotal(data.total);
      } catch {
        /* ignore */
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    setPage(1);
    setOrders([]);
    fetchOrders(filter, 1, true);
  }, [filter, fetchOrders]);

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchOrders(filter, next, false);
  };

  /* ── Empty ── */
  if (!isLoading && orders.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-5 bg-stone-50 dark:bg-stone-950 px-4">
        <div className="w-20 h-20 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center">
          <PackageX size={36} className="text-stone-300 dark:text-stone-600" />
        </div>
        <h2 className="text-xl font-bold text-stone-900 dark:text-white">
          কোনো অর্ডার নেই
        </h2>
        <p className="text-sm text-stone-500 dark:text-stone-400">
          আপনি এখনো কোনো অর্ডার করেননি।
        </p>
        <Link
          href="/shop"
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-green-700 hover:bg-green-800 text-white text-sm font-semibold transition-colors"
        >
          কেনাকাটা শুরু করুন <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-stone-50 dark:bg-stone-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-white flex items-center gap-2">
            <Package size={22} className="text-green-700 dark:text-green-500" />
            আমার অর্ডার
          </h1>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-0.5">
            মোট {total} টি অর্ডার
          </p>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
          {FILTERS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap flex-shrink-0 transition-all duration-200 ${
                filter === value
                  ? "bg-green-700 text-white shadow-sm"
                  : "bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:border-green-600 hover:text-green-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Loading */}
        {isLoading && orders.length === 0 && (
          <div className="flex justify-center py-10">
            <Loader2 size={28} className="animate-spin text-green-600" />
          </div>
        )}

        {/* Order cards */}
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {orders.map((order, i) => {
              const st = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;
              return (
                <motion.div
                  key={order._id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, ease: EASE, delay: i * 0.04 }}
                  onClick={() => setSelected(order)}
                  className="
                    bg-white dark:bg-stone-900
                    border border-stone-100 dark:border-stone-800
                    rounded-2xl p-4 sm:p-5 shadow-sm
                    hover:shadow-md dark:hover:shadow-stone-950/40
                    cursor-pointer transition-all duration-200
                    hover:border-green-200 dark:hover:border-green-900
                  "
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <p className="text-sm font-bold text-stone-900 dark:text-white">
                        #{order.orderId}
                      </p>
                      <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString("bn-BD", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${st.color}`}
                      >
                        {st.icon} {st.label}
                      </span>
                      <ChevronRight size={16} className="text-stone-400" />
                    </div>
                  </div>

                  {/* Items preview */}
                  <div className="flex items-center gap-2 mb-3">
                    {order.items.slice(0, 3).map((item) => (
                      <div
                        key={item._id}
                        className="w-12 h-12 rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800 flex-shrink-0"
                      >
                        <Image
                          unoptimized
                          src={item.thumbnail || "/placeholder.png"}
                          alt={item.name}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <div className="w-12 h-12 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-xs font-semibold text-stone-500 dark:text-stone-400">
                        +{order.items.length - 3}
                      </div>
                    )}
                    <div className="ml-auto text-right">
                      <p className="text-base font-bold text-stone-900 dark:text-white">
                        ৳{order.total.toLocaleString("bn-BD")}
                      </p>
                      <p className="text-xs text-stone-400 dark:text-stone-500">
                        {order.items.reduce((s, i) => s + i.quantity, 0)} টি
                        পণ্য
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-stone-500 dark:text-stone-400 truncate">
                    {order.shippingAddress.address},{" "}
                    {order.shippingAddress.area},{" "}
                    {order.shippingAddress.district}
                  </p>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Load more */}
        {hasMore && (
          <div className="flex justify-center">
            <button
              onClick={loadMore}
              disabled={isLoading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 text-sm font-medium text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 disabled:opacity-50 transition-colors"
            >
              {isLoading ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <RefreshCw size={15} />
              )}
              আরো দেখুন
            </button>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      <OrderDetailModal order={selected} onClose={() => setSelected(null)} />
    </main>
  );
}

/* ── Order detail modal ─────────────────────────────── */
function OrderDetailModal({
  order,
  onClose,
}: {
  order: Order | null;
  onClose: () => void;
}) {
  if (!order) return null;
  const st = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;

  return (
    <AnimatePresence>
      {order && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.28, ease: EASE }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          >
            <div className="w-full sm:max-w-lg bg-white dark:bg-stone-900 sm:rounded-2xl rounded-t-2xl shadow-2xl border border-stone-100 dark:border-stone-800 max-h-[90vh] flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100 dark:border-stone-800">
                <div>
                  <p className="font-bold text-stone-900 dark:text-white">
                    #{order.orderId}
                  </p>
                  <p className="text-xs text-stone-400 mt-0.5">
                    {new Date(order.createdAt).toLocaleDateString("bn-BD", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${st.color}`}
                  >
                    {st.icon} {st.label}
                  </span>
                  <button
                    onClick={onClose}
                    className="p-1.5 rounded-lg text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Scrollable body */}
              <div className="overflow-y-auto flex-1 px-5 py-4 space-y-5">
                {/* Items */}
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <Link
                      key={item._id}
                      href={`/products/${item.slug}`}
                      onClick={onClose}
                      className="flex items-center gap-3 hover:bg-stone-50 dark:hover:bg-stone-800 -mx-2 px-2 py-1.5 rounded-xl transition-colors"
                    >
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800 flex-shrink-0">
                        <Image
                          unoptimized
                          src={item.thumbnail || "/placeholder.png"}
                          alt={item.name}
                          width={56}
                          height={56}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-stone-800 dark:text-stone-200 line-clamp-1">
                          {item.name}
                        </p>
                        {item.variantLabel && (
                          <p className="text-xs text-stone-400">
                            {item.variantLabel}
                          </p>
                        )}
                        <p className="text-xs text-stone-500 dark:text-stone-400">
                          {item.quantity} {item.unit ?? "টি"}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-stone-900 dark:text-white shrink-0">
                        ৳{(item.price * item.quantity).toLocaleString("bn-BD")}
                      </p>
                    </Link>
                  ))}
                </div>

                {/* Shipping */}
                <div className="bg-stone-50 dark:bg-stone-800 rounded-xl p-4 space-y-1">
                  <p className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-2">
                    ডেলিভারি ঠিকানা
                  </p>
                  <p className="text-sm font-semibold text-stone-900 dark:text-white">
                    {order.shippingAddress.fullName}
                  </p>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    {order.shippingAddress.phone}
                  </p>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    {order.shippingAddress.address},{" "}
                    {order.shippingAddress.area}, {order.shippingAddress.city},{" "}
                    {order.shippingAddress.district}
                  </p>
                </div>

                {/* Price breakdown */}
                <div className="space-y-2 pt-2 border-t border-stone-100 dark:border-stone-800">
                  {[
                    {
                      l: "সাবটোটাল",
                      v: `৳${order.subtotal.toLocaleString("bn-BD")}`,
                    },
                    ...(order.discount > 0
                      ? [
                          {
                            l: "ছাড়",
                            v: `-৳${order.discount.toLocaleString("bn-BD")}`,
                          },
                        ]
                      : []),
                    {
                      l: "ডেলিভারি",
                      v:
                        order.deliveryCharge === 0
                          ? "বিনামূল্যে"
                          : `৳${order.deliveryCharge}`,
                    },
                  ].map(({ l, v }) => (
                    <div key={l} className="flex justify-between text-sm">
                      <span className="text-stone-500 dark:text-stone-400">
                        {l}
                      </span>
                      <span className="text-stone-900 dark:text-white font-medium">
                        {v}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between text-base font-bold pt-2 border-t border-stone-200 dark:border-stone-700">
                    <span className="text-stone-900 dark:text-white">মোট</span>
                    <span className="text-green-700 dark:text-green-400">
                      ৳{order.total.toLocaleString("bn-BD")}
                    </span>
                  </div>
                </div>

                {/* Payment */}
                <div className="flex items-center justify-between text-sm bg-stone-50 dark:bg-stone-800 rounded-xl px-4 py-3">
                  <span className="text-stone-500 dark:text-stone-400">
                    পেমেন্ট পদ্ধতি
                  </span>
                  <span className="font-semibold text-stone-900 dark:text-white capitalize">
                    {order.paymentMethod.replace("_", " ")}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
