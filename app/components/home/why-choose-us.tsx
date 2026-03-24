"use client";

import { motion } from "framer-motion";
import {
  Truck,
  ShieldCheck,
  BadgePercent,
  RotateCcw,
  Clock,
  Headphones,
} from "lucide-react";

const FEATURES = [
  {
    Icon: Truck,
    title: "দ্রুত ডেলিভারি",
    desc: "৳৯৯৯+ অর্ডারে বিনামূল্যে। ঢাকার ভেতরে একই দিনে ডেলিভারি।",
    color: "text-green-600  dark:text-green-400",
    bg: "bg-green-50  dark:bg-green-950/30",
  },
  {
    Icon: ShieldCheck,
    title: "নিরাপদ পেমেন্ট",
    desc: "bKash, Nagad, Rocket সহ সব পেমেন্ট সম্পূর্ণ নিরাপদ।",
    color: "text-blue-600   dark:text-blue-400",
    bg: "bg-blue-50   dark:bg-blue-950/30",
  },
  {
    Icon: BadgePercent,
    title: "সেরা দামের গ্যারান্টি",
    desc: "বাজারের চেয়ে কম দামে পণ্য। দাম বেশি হলে পার্থক্য ফেরত।",
    color: "text-amber-600  dark:text-amber-400",
    bg: "bg-amber-50  dark:bg-amber-950/30",
  },
  {
    Icon: RotateCcw,
    title: "সহজ রিটার্ন",
    desc: "পণ্যে সমস্যা হলে ৭ দিনের মধ্যে রিটার্ন বা এক্সচেঞ্জ করুন।",
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-50 dark:bg-purple-950/30",
  },
  {
    Icon: Clock,
    title: "৭ দিন খোলা",
    desc: "সকাল ৮টা থেকে রাত ১০টা পর্যন্ত। সপ্তাহের ৭ দিন সেবা পাবেন।",
    color: "text-teal-600   dark:text-teal-400",
    bg: "bg-teal-50   dark:bg-teal-950/30",
  },
  {
    Icon: Headphones,
    title: "সার্বক্ষণিক সাপোর্ট",
    desc: "যেকোনো সমস্যায় ফোন, WhatsApp বা Facebook এ যোগাযোগ করুন।",
    color: "text-rose-600   dark:text-rose-400",
    bg: "bg-rose-50   dark:bg-rose-950/30",
  },
] as const;

export function WhyChooseUs() {
  return (
    <section>
      <div className="text-center mb-8">
        <motion.h2
          className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-white"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          কেন জুয়েল স্টোর বেছে নেবেন?
        </motion.h2>
        <motion.p
          className="text-sm text-stone-500 dark:text-stone-400 mt-1.5"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          আপনার বিশ্বাস ও সন্তুষ্টি আমাদের প্রথম অগ্রাধিকার
        </motion.p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {FEATURES.map(({ Icon, title, desc, color, bg }, i) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{
              duration: 0.45,
              delay: i * 0.07,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="
              flex items-start gap-4 p-5 rounded-2xl
              bg-white dark:bg-stone-900
              border border-stone-100 dark:border-stone-800
              hover:shadow-md dark:hover:shadow-stone-950/40
              transition-shadow duration-300
            "
          >
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}
            >
              <Icon size={20} className={color} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-stone-900 dark:text-white mb-1">
                {title}
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                {desc}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
