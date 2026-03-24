"use client";

import { ProductGrid }             from "@/app/components/products/product-grid";
// import { RecommendedProducts }     from "@/app/components/products/recommended-products";

/* ── Quick category tabs data ───────────────────────── */
const CATEGORIES = [
  { label: "সব পণ্য",    value: "",           emoji: "🛒" },
  { label: "মুদিখানা",   value: "groceries",  emoji: "🥦" },
  { label: "প্রসাধনী",   value: "beauty",     emoji: "🧴" },
  { label: "গৃহস্থালি",  value: "household",  emoji: "🏠" },
  { label: "স্ন্যাকস",   value: "snacks",     emoji: "🍪" },
  { label: "পানীয়",     value: "drinks",     emoji: "🧃" },
  { label: "শিশু পণ্য",  value: "baby",       emoji: "👶" },
] as const;

import { useState } from "react";

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState("");

  return (
    <main className="min-h-screen bg-stone-50 dark:bg-stone-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">

        {/* ── Recommended / Personalized ── */}
        {/* <RecommendedProducts categories="groceries,beauty" limit={6} /> */}

        {/* ── Category tabs ── */}
        <section>
          <h2 className="text-xl sm:text-l2xl font-bold text-stone-900 dark:text-white mb-5">
            সব পণ্য
          </h2>

          {/* Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide [&::-webkit-scrollbar]:hidden">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={`
                  flex items-center gap-1.5 px-4 py-2 rounded-full
                  text-sm font-medium whitespace-nowrap flex-shrink-0
                  transition-all duration-200
                  ${activeCategory === cat.value
                    ? "bg-green-700 text-white shadow-md shadow-green-700/25"
                    : "bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:border-green-600 hover:text-green-700"
                  }
                `}
              >
                <span>{cat.emoji}</span>
                {cat.label}
              </button>
            ))}
          </div>

          {/* Infinite scroll grid */}
          <ProductGrid
            category={activeCategory || undefined}
            sort="newest"
          />
        </section>
      </div>
    </main>
  );
}