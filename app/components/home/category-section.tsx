"use client";

import { motion } from "framer-motion";
import Link       from "next/link";
import { ArrowRight } from "lucide-react";

const CATS = [
  { label: "মুদিখানা",  sub: "চাল, ডাল, তেল, মশলা",        href: "/groceries", emoji: "🥦", bg: "bg-green-50  dark:bg-green-950/30",  border: "border-green-100  dark:border-green-900/40",  text: "text-green-700  dark:text-green-400",  ring: "hover:ring-green-200  dark:hover:ring-green-800"  },
  { label: "প্রসাধনী",  sub: "সাবান, শ্যাম্পু, ক্রিম",     href: "/beauty",    emoji: "🧴", bg: "bg-pink-50   dark:bg-pink-950/30",   border: "border-pink-100   dark:border-pink-900/40",   text: "text-pink-600   dark:text-pink-400",   ring: "hover:ring-pink-200   dark:hover:ring-pink-800"   },
  { label: "স্ন্যাকস",  sub: "বিস্কুট, চিপস, চকোলেট",     href: "/snacks",    emoji: "🍪", bg: "bg-amber-50  dark:bg-amber-950/30",  border: "border-amber-100  dark:border-amber-900/40",  text: "text-amber-600  dark:text-amber-400",  ring: "hover:ring-amber-200  dark:hover:ring-amber-800"  },
  { label: "পানীয়",    sub: "চা, কফি, জুস, কোল্ড ড্রিংক", href: "/drinks",    emoji: "🧃", bg: "bg-blue-50   dark:bg-blue-950/30",   border: "border-blue-100   dark:border-blue-900/40",   text: "text-blue-600   dark:text-blue-400",   ring: "hover:ring-blue-200   dark:hover:ring-blue-800"   },
  { label: "গৃহস্থালি", sub: "ডিটারজেন্ট, ক্লিনার",        href: "/household", emoji: "🏠", bg: "bg-purple-50 dark:bg-purple-950/30", border: "border-purple-100 dark:border-purple-900/40", text: "text-purple-600 dark:text-purple-400", ring: "hover:ring-purple-200 dark:hover:ring-purple-800" },
  { label: "শিশু পণ্য", sub: "খাবার, ডায়াপার, বেবি কেয়ার", href: "/baby",      emoji: "👶", bg: "bg-rose-50   dark:bg-rose-950/30",   border: "border-rose-100   dark:border-rose-900/40",   text: "text-rose-600   dark:text-rose-400",   ring: "hover:ring-rose-200   dark:hover:ring-rose-800"   },
] as const;

export function CategorySection() {
  return (
    <section>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-white">ক্যাটাগরি</h2>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-0.5">আপনার পছন্দের পণ্য বেছে নিন</p>
        </div>
        <Link href="/shop" className="flex items-center gap-1 text-sm font-medium text-green-700 dark:text-green-500 hover:text-green-800 transition-colors">
          সব দেখুন <ArrowRight size={14} />
        </Link>
      </div>

      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {CATS.map(({ label, sub, href, emoji, bg, border, text, ring }, i) => (
          <motion.div
            key={href}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.4, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link
              href={href}
              className={`
                flex flex-col items-center gap-2.5 p-4 rounded-2xl border
                ring-2 ring-transparent transition-all duration-200
                hover:-translate-y-1 hover:shadow-md
                ${bg} ${border} ${ring}
              `}
            >
              <span className="text-3xl sm:text-4xl">{emoji}</span>
              <div className="text-center">
                <p className={`text-xs sm:text-sm font-semibold ${text}`}>{label}</p>
                <p className="text-[10px] text-stone-400 dark:text-stone-500 mt-0.5 leading-tight hidden sm:block">{sub}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}