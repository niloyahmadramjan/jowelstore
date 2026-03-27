"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence }       from "framer-motion";
import Link                              from "next/link";
import Image                             from "next/image";
import { useRouter, useSearchParams }    from "next/navigation";
import { useSession }                    from "next-auth/react";
import axios                             from "axios";
import {
  MapPin, CreditCard, ShoppingBag,
  ChevronRight, ChevronDown, Plus,
  CheckCircle, Loader2, ArrowLeft,
  Truck, Tag, Edit2, AlertCircle,
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
  items:    CartItem[];
  coupon:   string | null;
  discount: number;
  subtotal: number;
  total:    number;
}

interface Address {
  _id?:      string;
  label:     string;
  fullName:  string;
  phone:     string;
  address:   string;
  area:      string;
  city:      string;
  district:  string;
  zip?:      string;
  isDefault: boolean;
}

interface UserProfile {
  name:      string;
  phone:     string;
  addresses: Address[];
}

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const PAYMENT_METHODS = [
  { value: "bkash",             label: "bKash",              icon: "💚" },
  { value: "nagad",             label: "Nagad",              icon: "🟠" },
  { value: "rocket",            label: "Rocket",             icon: "🟣" },
  { value: "cash_on_delivery",  label: "Cash on Delivery",   icon: "💵" },
  { value: "card",              label: "Card",               icon: "💳" },
] as const;

type PaymentMethod = typeof PAYMENT_METHODS[number]["value"];

/* ── Page ───────────────────────────────────────────── */
export default function CheckoutPage() {
  const router        = useRouter();
  const searchParams  = useSearchParams();
  const { data: session } = useSession();

  const selectedIds   = useMemo(
    () => new Set((searchParams.get("items") ?? "").split(",").filter(Boolean)),
    [searchParams],
  );

  const [cart,           setCart]           = useState<CartData | null>(null);
  const [profile,        setProfile]        = useState<UserProfile | null>(null);
  const [isLoading,      setIsLoading]      = useState(true);
  const [placing,        setPlacing]        = useState(false);
  const [placedOrderId,  setPlacedOrderId]  = useState<string | null>(null);
  const [error,          setError]          = useState("");

  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [addrSheetOpen,   setAddrSheetOpen]   = useState(false);
  const [paymentMethod,   setPaymentMethod]   = useState<PaymentMethod>("cash_on_delivery");
  const [note,            setNote]            = useState("");
  const [couponInput,     setCouponInput]     = useState("");
  const [couponLoading,   setCouponLoading]   = useState(false);
  const [couponError,     setCouponError]     = useState("");
  const [showCoupon,      setShowCoupon]      = useState(false);

  /* ── Fetch cart + profile ────────────────────────── */
  useEffect(() => {
    Promise.all([
      axios.get<CartData>("/api/cart"),
      
      axios.get<{ user: UserProfile }>("/api/profile"),
    ]).then(([cartRes, profileRes]) => {
      setCart(cartRes.data);
      const p = profileRes.data.user;
      setProfile(p);
      const def = p.addresses.find((a) => a.isDefault) ?? p.addresses[0] ?? null;
      setSelectedAddress(def);
    }).catch(() => setError("Failed to load checkout data"))
      .finally(() => setIsLoading(false));
  }, []);

  /* ── Computed items (only selected) ─────────────── */
  const checkoutItems = useMemo(
    () => cart?.items.filter((i) => selectedIds.has(i._id)) ?? [],
    [cart, selectedIds],
  );

  const pricing = useMemo(() => {
    const subtotal     = checkoutItems.reduce((s, i) => s + i.price * i.quantity, 0);
    const origTotal    = checkoutItems.reduce((s, i) => s + (i.originalPrice ?? i.price) * i.quantity, 0);
    const productSaved = origTotal - subtotal;

    /* Proportional coupon discount */
    const fraction        = (cart?.subtotal ?? 0) > 0 ? (cart?.discount ?? 0) / cart!.subtotal : 0;
    const couponDiscount  = Math.round(subtotal * fraction);
    const afterDiscount   = subtotal - couponDiscount;
    const deliveryCharge  = afterDiscount >= 999 ? 0 : 60;
    const total           = afterDiscount + deliveryCharge;

    return { subtotal, origTotal, productSaved, couponDiscount, deliveryCharge, total };
  }, [checkoutItems, cart]);

  /* ── Apply coupon ────────────────────────────────── */
  const handleCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    setCouponLoading(true);
    setCouponError("");
    try {
      await axios.post("/api/cart/coupon", { code });
      const { data } = await axios.get<CartData>("/api/cart");
      setCart(data);
      setCouponInput("");
      setShowCoupon(false);
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

  /* ── Place order ─────────────────────────────────── */
  const handlePlaceOrder = async () => {
    if (!selectedAddress) { setError("অনুগ্রহ করে একটি ঠিকানা নির্বাচন করুন"); return; }
    if (checkoutItems.length === 0) { setError("কোনো পণ্য নেই"); return; }

    setPlacing(true);
    setError("");

    try {
      const { data } = await axios.post<{ order: { orderId: string; _id: string } }>(
        "/api/orders",
        {
          shippingAddress: selectedAddress,
          paymentMethod,
          note: note.trim() || undefined,
          selectedItemIds: [...selectedIds],
        },
      );
      setPlacedOrderId(data.order.orderId);
      window.dispatchEvent(new Event("cart:updated"));
    } catch (err: unknown) {
      setError(
        axios.isAxiosError(err)
          ? err.response?.data?.message ?? "Order failed"
          : "Order failed",
      );
    } finally {
      setPlacing(false);
    }
  };

  /* ── Loading ─────────────────────────────────────── */
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-950">
        <Loader2 size={32} className="animate-spin text-green-600" />
      </div>
    );
  }

  /* ── Order Success ───────────────────────────────── */
  if (placedOrderId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-stone-50 dark:bg-stone-950 px-4">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 18 }}
          className="flex flex-col items-center gap-4 text-center max-w-sm"
        >
          <div className="w-24 h-24 rounded-full bg-green-50 dark:bg-green-950/30 flex items-center justify-center">
            <CheckCircle size={48} className="text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-stone-900 dark:text-white">
            অর্ডার সফল হয়েছে!
          </h2>
          <p className="text-sm text-stone-500 dark:text-stone-400">
            আপনার অর্ডার নম্বর:{" "}
            <span className="font-bold text-green-700 dark:text-green-400">
              #{placedOrderId}
            </span>
          </p>
          <p className="text-xs text-stone-400 dark:text-stone-500">
            শীঘ্রই আপনার সাথে যোগাযোগ করা হবে।
          </p>

          <div className="flex flex-col sm:flex-row gap-3 w-full mt-2">
            <Link href="/orders"
              className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-stone-200 dark:border-stone-700 text-sm font-semibold text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors">
              অর্ডার দেখুন
            </Link>
            <Link href="/"
              className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-green-700 hover:bg-green-800 text-white text-sm font-semibold transition-colors">
              কেনাকাটা চালিয়ে যান
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-stone-100 dark:bg-stone-950">
      <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-4">

        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()}
            className="p-2 rounded-xl hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 transition-colors">
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-xl font-bold text-stone-900 dark:text-white">চেকআউট</h1>
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 text-sm"
            >
              <AlertCircle size={15} className="shrink-0" />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-col lg:flex-row gap-4 items-start">

          {/* ── Left column ────────────────────────── */}
          <div className="flex-1 min-w-0 space-y-4">

            {/* Delivery address */}
            <Section title="ডেলিভারি ঠিকানা" icon={<MapPin size={16} className="text-green-600" />}>
              {selectedAddress ? (
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-semibold text-stone-900 dark:text-white">
                          {selectedAddress.fullName}
                        </span>
                        <span className="text-stone-400">|</span>
                        <span className="text-sm text-stone-600 dark:text-stone-300">
                          {selectedAddress.phone}
                        </span>
                        {selectedAddress.isDefault && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800/50">
                            ডিফল্ট
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-stone-500 dark:text-stone-400">
                        {selectedAddress.address}, {selectedAddress.area},{" "}
                        {selectedAddress.city}, {selectedAddress.district}
                        {selectedAddress.zip && ` - ${selectedAddress.zip}`}
                      </p>
                    </div>
                    <button
                      onClick={() => setAddrSheetOpen(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/30 transition-colors shrink-0"
                    >
                      <Edit2 size={12} /> পরিবর্তন
                    </button>
                  </div>
                </div>
              ) : (
                <Link href="/profile?tab=addresses"
                  className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400 font-medium hover:underline">
                  <Plus size={14} /> নতুন ঠিকানা যোগ করুন
                </Link>
              )}
            </Section>

            {/* Products */}
            <Section title="অর্ডার করা পণ্য" icon={<ShoppingBag size={16} className="text-green-600" />}>
              <div className="space-y-3">
                {/* Header row */}
                <div className="hidden sm:grid grid-cols-[1fr_80px_80px_80px] gap-2 text-xs text-stone-400 dark:text-stone-500 font-medium">
                  <span>পণ্য</span>
                  <span className="text-center">একক দাম</span>
                  <span className="text-center">পরিমাণ</span>
                  <span className="text-right">সাবটোটাল</span>
                </div>

                {checkoutItems.map((item) => (
                  <div
                    key={item._id}
                    className="
                      flex flex-col sm:grid sm:grid-cols-[1fr_80px_80px_80px]
                      sm:items-center gap-3 pb-3
                      border-b border-stone-100 dark:border-stone-800 last:border-0 last:pb-0
                    "
                  >
                    {/* Product */}
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800 shrink-0">
                        <Image
                          unoptimized
                          src={item.thumbnail || "/placeholder.png"}
                          alt={item.name}
                          width={56} height={56}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-stone-800 dark:text-stone-200 line-clamp-2">
                          {item.name}
                        </p>
                        {item.variantLabel && (
                          <span className="text-[11px] text-stone-400">
                            {item.variantLabel}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Mobile: price × qty */}
                    <div className="flex items-center justify-between sm:contents">
                      <span className="sm:hidden text-xs text-stone-400">
                        ৳{item.price.toLocaleString("bn-BD")} × {item.quantity}
                      </span>

                      <span className="hidden sm:block text-sm text-stone-700 dark:text-stone-300 text-center">
                        ৳{item.price.toLocaleString("bn-BD")}
                      </span>
                      <span className="hidden sm:block text-sm text-stone-700 dark:text-stone-300 text-center">
                        {item.quantity}
                      </span>

                      <span className="text-sm font-semibold text-green-700 dark:text-green-400 sm:text-right">
                        ৳{(item.price * item.quantity).toLocaleString("bn-BD")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            {/* Voucher */}
            <Section title="ভাউচার / কুপন" icon={<Tag size={16} className="text-green-600" />}>
              {cart?.coupon ? (
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle size={15} className="text-green-600 dark:text-green-400" />
                  <span className="font-medium text-green-700 dark:text-green-400">
                    &quot;{cart.coupon}&quot; — ৳{cart.discount.toLocaleString("bn-BD")} ছাড়
                  </span>
                  <button
                    onClick={async () => {
                      await axios.delete("/api/cart/coupon");
                      const { data } = await axios.get<CartData>("/api/cart");
                      setCart(data);
                    }}
                    className="ml-auto text-xs text-stone-400 hover:text-red-500 transition-colors"
                  >
                    সরান
                  </button>
                </div>
              ) : (
                <div>
                  <button
                    onClick={() => setShowCoupon(!showCoupon)}
                    className="flex items-center gap-1.5 text-sm font-medium text-green-700 dark:text-green-400 hover:text-green-800 transition-colors"
                  >
                    + কুপন কোড যোগ করুন
                    <ChevronDown size={14} className={`transition-transform ${showCoupon ? "rotate-180" : ""}`} />
                  </button>

                  <AnimatePresence>
                    {showCoupon && (
                      <motion.form
                        onSubmit={handleCoupon}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{    height: 0, opacity: 0 }}
                        className="overflow-hidden mt-3"
                      >
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="কুপন কোড"
                            value={couponInput}
                            onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                            className="flex-1 px-3.5 py-2.5 rounded-xl text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/15 transition-all"
                          />
                          <button
                            type="submit"
                            disabled={couponLoading || !couponInput.trim()}
                            className="px-4 py-2.5 rounded-xl bg-green-700 hover:bg-green-800 text-white text-sm font-semibold disabled:opacity-50 transition-colors"
                          >
                            {couponLoading ? <Loader2 size={14} className="animate-spin" /> : "প্রয়োগ"}
                          </button>
                        </div>
                        {couponError && (
                          <p className="mt-1.5 text-xs text-red-500">{couponError}</p>
                        )}
                      </motion.form>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </Section>

            {/* Payment */}
            <Section title="পেমেন্ট পদ্ধতি" icon={<CreditCard size={16} className="text-green-600" />}>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {PAYMENT_METHODS.map(({ value, label, icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setPaymentMethod(value)}
                    className={`
                      flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all
                      ${paymentMethod === value
                        ? "border-green-600 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400"
                        : "border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:border-stone-300 dark:hover:border-stone-600"
                      }
                    `}
                  >
                    <span className="text-base">{icon}</span>
                    {label}
                    {paymentMethod === value && (
                      <CheckCircle size={13} className="ml-auto text-green-600 dark:text-green-400" />
                    )}
                  </button>
                ))}
              </div>
            </Section>

            {/* Seller note */}
            <Section title="বিক্রেতাকে বার্তা (ঐচ্ছিক)" icon={<Edit2 size={16} className="text-green-600" />}>
              <textarea
                placeholder="বিক্রেতাকে কোনো বিশেষ নির্দেশ দিতে চাইলে লিখুন..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={500}
                rows={3}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/15 resize-none transition-all"
              />
              <p className="text-xs text-stone-400 mt-1 text-right">{note.length}/500</p>
            </Section>
          </div>

          {/* ── Right: Order summary ────────────────── */}
          <div className="w-full lg:w-[320px] shrink-0">
            <div className="sticky top-20 space-y-3">

              {/* Summary card */}
              <div className="
                bg-white dark:bg-stone-900
                border border-stone-200 dark:border-stone-800
                rounded-2xl shadow-sm p-5 space-y-4
              ">
                <h2 className="text-base font-bold text-stone-900 dark:text-white">মূল্য বিবরণ</h2>

                <div className="space-y-3">
                  <SumRow label="পণ্যের মূল্য" value={`৳${pricing.subtotal.toLocaleString("bn-BD")}`} />

                  {pricing.productSaved > 0 && (
                    <SumRow
                      label="পণ্যে সাশ্রয়"
                      value={`-৳${pricing.productSaved.toLocaleString("bn-BD")}`}
                      valueClass="text-green-600 dark:text-green-400"
                    />
                  )}

                  {pricing.couponDiscount > 0 && (
                    <SumRow
                      label={`কুপন ছাড় (${cart?.coupon})`}
                      value={`-৳${pricing.couponDiscount.toLocaleString("bn-BD")}`}
                      valueClass="text-green-600 dark:text-green-400"
                    />
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
                      <Truck size={13} /> শিপিং চার্জ
                    </span>
                    <span className={`text-sm font-medium ${pricing.deliveryCharge === 0 ? "text-green-600 dark:text-green-400" : "text-stone-900 dark:text-white"}`}>
                      {pricing.deliveryCharge === 0 ? "বিনামূল্যে" : `৳${pricing.deliveryCharge}`}
                    </span>
                  </div>
                </div>

                {/* Total */}
                <div className="pt-3 border-t border-stone-200 dark:border-stone-700 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-bold text-stone-900 dark:text-white">মোট পরিশোধ</span>
                    <span className="text-xl font-bold text-green-700 dark:text-green-400">
                      ৳{pricing.total.toLocaleString("bn-BD")}
                    </span>
                  </div>
                  {(pricing.productSaved + pricing.couponDiscount) > 0 && (
                    <p className="text-xs text-green-600 dark:text-green-400 text-right">
                      আপনি ৳{(pricing.productSaved + pricing.couponDiscount).toLocaleString("bn-BD")} সাশ্রয় করলেন
                    </p>
                  )}
                </div>

                {/* Place order */}
                <motion.button
                  onClick={handlePlaceOrder}
                  disabled={placing || !selectedAddress || checkoutItems.length === 0}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{   scale: 0.98 }}
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
                  {placing ? (
                    <><Loader2 size={16} className="animate-spin" /> অর্ডার হচ্ছে...</>
                  ) : (
                    <>অর্ডার দিন ({checkoutItems.length} টি) <ChevronRight size={16} /></>
                  )}
                </motion.button>

                {/* Payment icons */}
                <div className="flex flex-wrap justify-center gap-2 pt-1">
                  {["bKash", "Nagad", "Rocket", "Cash"].map((m) => (
                    <span key={m} className="px-2 py-1 rounded text-[10px] font-medium bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Address selection sheet */}
      <AddressSheet
        open={addrSheetOpen}
        addresses={profile?.addresses ?? []}
        selected={selectedAddress}
        onSelect={(addr) => { setSelectedAddress(addr); setAddrSheetOpen(false); }}
        onClose={() => setAddrSheetOpen(false)}
      />
    </main>
  );
}

/* ── Section wrapper ────────────────────────────────── */
function Section({
  title, icon, children,
}: {
  title:    string;
  icon:     React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="
      bg-white dark:bg-stone-900
      border border-stone-200 dark:border-stone-800
      rounded-2xl shadow-sm p-5
    ">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h2 className="text-sm font-bold text-stone-900 dark:text-white">{title}</h2>
      </div>
      {children}
    </div>
  );
}

/* ── Summary row ────────────────────────────────────── */
function SumRow({ label, value, valueClass = "" }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-stone-500 dark:text-stone-400">{label}</span>
      <span className={`text-sm font-medium text-stone-900 dark:text-white ${valueClass}`}>{value}</span>
    </div>
  );
}

/* ── Address bottom sheet ───────────────────────────── */
function AddressSheet({
  open, addresses, selected, onSelect, onClose,
}: {
  open:      boolean;
  addresses: Address[];
  selected:  Address | null;
  onSelect:  (a: Address) => void;
  onClose:   () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0       }}
            exit={{    y: "100%"  }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="
              fixed bottom-0 left-0 right-0 z-50
              bg-white dark:bg-stone-900
              rounded-t-3xl shadow-2xl
              max-h-[80dvh] flex flex-col
            "
          >
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-stone-100 dark:border-stone-800">
              <h3 className="text-base font-bold text-stone-900 dark:text-white">ঠিকানা নির্বাচন</h3>
              <button onClick={onClose} className="p-1.5 rounded-lg text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors">✕</button>
            </div>

            <div className="overflow-y-auto flex-1 px-5 py-4 space-y-3">
              {addresses.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-stone-400 mb-3">কোনো ঠিকানা নেই</p>
                  <Link href="/profile?tab=addresses" onClick={onClose}
                    className="text-sm font-medium text-green-700 dark:text-green-400 hover:underline">
                    + ঠিকানা যোগ করুন
                  </Link>
                </div>
              ) : (
                addresses.map((addr) => {
                  const isSelected = selected?._id === addr._id;
                  return (
                    <button
                      key={addr._id}
                      onClick={() => onSelect(addr)}
                      className={`
                        w-full text-left p-4 rounded-2xl border transition-all
                        ${isSelected
                          ? "border-green-600 bg-green-50 dark:bg-green-950/20"
                          : "border-stone-200 dark:border-stone-700 hover:border-stone-300 dark:hover:border-stone-600"
                        }
                      `}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-sm font-semibold text-stone-900 dark:text-white">{addr.fullName}</span>
                            <span className="text-xs text-stone-500 dark:text-stone-400">{addr.phone}</span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-stone-100 dark:bg-stone-700 text-stone-500 dark:text-stone-400">{addr.label}</span>
                            {addr.isDefault && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800/50">ডিফল্ট</span>
                            )}
                          </div>
                          <p className="text-xs text-stone-500 dark:text-stone-400">
                            {addr.address}, {addr.area}, {addr.city}, {addr.district}
                          </p>
                        </div>
                        {isSelected && (
                          <CheckCircle size={18} className="text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            <div className="px-5 pb-5 pt-2 border-t border-stone-100 dark:border-stone-800">
              <Link href="/profile?tab=addresses" onClick={onClose}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-dashed border-stone-300 dark:border-stone-600 text-sm font-medium text-stone-600 dark:text-stone-300 hover:border-green-600 hover:text-green-700 transition-colors">
                <Plus size={15} /> নতুন ঠিকানা যোগ করুন
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}