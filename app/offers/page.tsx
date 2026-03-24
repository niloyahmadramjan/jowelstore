"use client";

import { useState, useEffect }  from "react";
import { motion }               from "framer-motion";
import { Zap, Clock }           from "lucide-react";
import { ProductGrid }          from "@/app/components/products/product-grid";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/* ── Countdown ──────────────────────────────────────── */
function useCountdown(hours = 12) {
  const [time, setTime] = useState({ h: hours, m: 0, s: 0 });
  useEffect(() => {
    const end = Date.now() + hours * 3_600_000;
    const tick = () => {
      const d = end - Date.now();
      if (d <= 0) { setTime({ h: 0, m: 0, s: 0 }); return; }
      setTime({
        h: Math.floor(d / 3_600_000),
        m: Math.floor((d % 3_600_000) / 60_000),
        s: Math.floor((d % 60_000)  / 1_000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return time;
}

function TimeBox({ val, label }: { val: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex gap-0.5">
        {String(val).padStart(2, "0").split("").map((d, i) => (
          <div key={i} className="w-9 h-11 sm:w-11 sm:h-14 flex items-center justify-center rounded-lg bg-white/20 text-white text-xl sm:text-2xl font-bold tabular-nums">
            {d}
          </div>
        ))}
      </div>
      <span className="text-[10px] text-white/60 uppercase tracking-widest">{label}</span>
    </div>
  );
}

const OFFER_CATS = [
  { value: "",           label: "সব অফার",    emoji: "🎁" },
  { value: "groceries",  label: "মুদিখানা",   emoji: "🥦" },
  { value: "beauty",     label: "প্রসাধনী",   emoji: "🧴" },
  { value: "snacks",     label: "স্ন্যাকস",   emoji: "🍪" },
  { value: "household",  label: "গৃহস্থালি",  emoji: "🏠" },
];

export default function OffersPage() {
  const [cat, setCat] = useState("");
  const { h, m, s }  = useCountdown(12);

  return (
    <main className="min-h-screen bg-stone-50 dark:bg-stone-950">

      {/* Hero with countdown */}
      <div className="bg-gradient-to-br from-red-700 via-orange-600 to-amber-600 py-10 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0   }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Zap size={20} className="text-yellow-300 fill-yellow-300" />
              <span className="text-yellow-300 text-sm font-bold uppercase tracking-wider">
                ফ্ল্যাশ সেল
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-1">
              বিশেষ ছাড়ের অফার
            </h1>
            <p className="text-white/70 text-sm">
              ৪০% পর্যন্ত ছাড় — সীমিত সময়ের জন্য
            </p>
          </motion.div>

          {/* Countdown */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0  }}
            transition={{ duration: 0.5, ease: EASE }}
            className="flex items-end gap-2"
          >
            <div className="flex items-center gap-1 mr-2">
              <Clock size={16} className="text-white/70" />
              <span className="text-white/70 text-sm">শেষ হবে:</span>
            </div>
            <TimeBox val={h} label="ঘণ্টা" />
            <span className="text-white text-2xl font-bold mb-3">:</span>
            <TimeBox val={m} label="মিনিট" />
            <span className="text-white text-2xl font-bold mb-3">:</span>
            <TimeBox val={s} label="সেকেন্ড" />
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
          {OFFER_CATS.map(({ value, label, emoji }) => (
            <button
              key={value}
              onClick={() => setCat(value)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap flex-shrink-0 transition-all duration-200 ${
                cat === value
                  ? "bg-red-600 text-white shadow-sm"
                  : "bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:border-red-500 hover:text-red-600"
              }`}
            >
              {emoji} {label}
            </button>
          ))}
        </div>

        {/* Featured + discounted products */}
        <ProductGrid
          category={cat || undefined}
          sort="popular"
          featured={!cat}
        />
      </div>
    </main>
  );
}