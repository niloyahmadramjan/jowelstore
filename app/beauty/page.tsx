"use client";

import { useState }       from "react";
import { motion }         from "framer-motion";
import { ProductGrid }    from "@/app/components/products/product-grid";
import { ChevronDown }    from "lucide-react";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const SUB_CATEGORIES = [
  { value: "",         label: "সব প্রসাধনী"    },
  { value: "soap",     label: "সাবান"           },
  { value: "shampoo",  label: "শ্যাম্পু"       },
  { value: "lotion",   label: "লোশন ও ক্রিম"   },
  { value: "hair-care",label: "চুলের যত্ন"      },
];

const SORT_OPTIONS = [
  { value: "newest",     label: "নতুন আগে"           },
  { value: "popular",    label: "সবচেয়ে বিক্রিত"     },
  { value: "price_asc",  label: "দাম: কম থেকে বেশি"  },
  { value: "price_desc", label: "দাম: বেশি থেকে কম"  },
  { value: "rating",     label: "সেরা রেটিং"          },
];

export default function BeautyPage() {
  const [subCat, setSubCat] = useState("");
  const [sort,   setSort]   = useState("newest");

  return (
    <main className="min-h-screen bg-stone-50 dark:bg-stone-950">

      {/* Hero banner */}
      <div className="bg-gradient-to-br from-[#042f2e] via-[#134e4a] to-[#115e59] py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0  }}
            transition={{ duration: 0.5, ease: EASE }}
            className="text-3xl sm:text-4xl font-bold text-white mb-2"
          >
            🧴 প্রসাধনী পণ্য
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-white/70 text-sm"
          >
            সেরা ব্র্যান্ডের প্রসাধনী — সাবান, শ্যাম্পু, ক্রিম ও আরো অনেক কিছু
          </motion.p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Filter + Sort */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex gap-2 overflow-x-auto pb-1 flex-1 [&::-webkit-scrollbar]:hidden">
            {SUB_CATEGORIES.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setSubCat(value)}
                className={`px-3.5 py-2 rounded-full text-sm font-medium whitespace-nowrap flex-shrink-0 transition-all duration-200 ${
                  subCat === value
                    ? "bg-teal-700 text-white shadow-sm"
                    : "bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:border-teal-600 hover:text-teal-700"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="relative shrink-0">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="appearance-none pl-4 pr-9 py-2.5 rounded-xl text-sm font-medium bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-200 focus:outline-none focus:border-teal-600 transition-colors cursor-pointer"
            >
              {SORT_OPTIONS.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
          </div>
        </div>

        <ProductGrid
          category="beauty"
          subCategory={subCat || undefined}
          sort={sort}
        />
      </div>
    </main>
  );
}