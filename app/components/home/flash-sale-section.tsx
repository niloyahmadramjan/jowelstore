"use client";

import { useState, useEffect } from "react";
import { motion }               from "framer-motion";
import Link                     from "next/link";
import { Zap, ArrowRight }      from "lucide-react";
import { ProductGrid }          from "@/app/components/products/product-grid";

/* ── Countdown ───────────────────────────────────────── */
function useCountdown(hours = 6) {
  const [time, setTime] = useState({ h: hours, m: 0, s: 0 });

  useEffect(() => {
    const end = Date.now() + hours * 3_600_000;
    const tick = () => {
      const d = end - Date.now();
      if (d <= 0) { setTime({ h: 0, m: 0, s: 0 }); return; }
      setTime({
        h: Math.floor(d / 3_600_000),
        m: Math.floor((d % 3_600_000) / 60_000),
        s: Math.floor((d % 60_000) / 1_000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return time;
}

function Digit({ val, label }: { val: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className="flex gap-0.5">
        {String(val).padStart(2, "0").split("").map((d, i) => (
          <div key={i} className="w-8 h-10 sm:w-10 sm:h-12 flex items-center justify-center rounded-lg bg-stone-900 dark:bg-white text-white dark:text-stone-900 text-base sm:text-xl font-bold tabular-nums">
            {d}
          </div>
        ))}
      </div>
      <span className="text-[10px] text-white/60 uppercase tracking-wide">{label}</span>
    </div>
  );
}

export function FlashSaleSection() {
  const { h, m, s } = useCountdown(6);

  return (
    <section>
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-red-600 to-orange-500 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <Zap size={20} className="text-white fill-white" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white">ফ্ল্যাশ সেল</h2>
            <p className="text-white/70 text-xs">সীমিত সময়ের অফার — দ্রুত নিন!</p>
          </div>
        </div>

        <div className="flex items-end gap-2">
          <Digit val={h} label="ঘণ্টা" />
          <span className="text-white text-xl font-bold mb-3">:</span>
          <Digit val={m} label="মিনিট" />
          <span className="text-white text-xl font-bold mb-3">:</span>
          <Digit val={s} label="সেকেন্ড" />
        </div>

        <Link
          href="/offers"
          className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-red-600 text-sm font-semibold hover:bg-red-50 transition-colors shrink-0"
        >
          সব অফার <ArrowRight size={14} />
        </Link>
      </div>

      {/* Featured products */}
      <ProductGrid featured sort="popular" />

      <div className="mt-5 text-center sm:hidden">
        <Link
          href="/offers"
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors"
        >
          সব অফার দেখুন <ArrowRight size={14} />
        </Link>
      </div>
    </section>
  );
}