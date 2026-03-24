"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const REVIEWS = [
  {
    name: "রাহেলা বেগম",
    area: "মিরপুর, ঢাকা",
    rating: 5,
    text: "অনেক দিন ধরে জুয়েল স্টোর থেকে কিনছি। চাল, ডাল, তেল সব কিছু সময়মতো আসে। দাম অন্য দোকানের চেয়ে কম এবং মান ভালো।",
  },
  {
    name: "করিম সাহেব",
    area: "মোহাম্মদপুর, ঢাকা",
    rating: 5,
    text: "অনলাইনে মুদিখানার অর্ডার দিলে এত দ্রুত আসবে ভাবিনি! সকালে অর্ডার দিয়েছি, বিকেলেই পেয়ে গেছি। চমৎকার সার্ভিস।",
  },
  {
    name: "নাফিসা আক্তার",
    area: "উত্তরা, ঢাকা",
    rating: 5,
    text: "সাবান, শ্যাম্পু, ক্রিম সব একসাথে পাই এখানে। একবার ভুল পণ্য এসেছিল, সাথে সাথে রিটার্ন করে নতুন পণ্য পাঠিয়ে দিয়েছে।",
  },
  {
    name: "মো. সালাম",
    area: "রামপুরা, ঢাকা",
    rating: 4,
    text: "দাম সত্যিই কম। প্রতি মাসে বাজার করি জুয়েল স্টোর থেকে। পরিবারের সবাই খুশি। ডেলিভারি আরো দ্রুত হলে ভালো হতো।",
  },
  {
    name: "ফারহানা ইসলাম",
    area: "বনানী, ঢাকা",
    rating: 5,
    text: "শিশু পণ্য সব অরিজিনাল পাই এখানে। অনেক জায়গায় নকল পেয়েছি, জুয়েল স্টোরে কখনো সমস্যা হয়নি। বিশ্বস্ত দোকান।",
  },
  {
    name: "তানভীর হোসেন",
    area: "মতিঝিল, ঢাকা",
    rating: 5,
    text: "অফিসের জন্য প্রতি সপ্তাহে চা, কফি, বিস্কুট অর্ডার করি। কখনো হতাশ হইনি। Customer service অনেক ভালো এবং দ্রুত।",
  },
] as const;

export function TestimonialsSection() {
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
          ক্রেতারা কী বলছেন
        </motion.h2>
        <motion.p
          className="text-sm text-stone-500 dark:text-stone-400 mt-1.5"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          আমাদের ১০,০০০+ সন্তুষ্ট ক্রেতার মতামত
        </motion.p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {REVIEWS.map(({ name, area, rating, text }, i) => (
          <motion.div
            key={name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{
              duration: 0.45,
              delay: i * 0.07,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="
              flex flex-col gap-4 p-5 rounded-2xl
              bg-white dark:bg-stone-900
              border border-stone-100 dark:border-stone-800
              hover:shadow-md dark:hover:shadow-stone-950/40
              transition-shadow duration-300
            "
          >
            <Quote
              size={20}
              className="text-green-200 dark:text-green-900 flex-shrink-0"
            />

            <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed flex-1">
              {text}
            </p>

            <div className="flex items-center justify-between pt-3 border-t border-stone-100 dark:border-stone-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center text-green-700 dark:text-green-400 text-sm font-bold shrink-0">
                  {name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-stone-900 dark:text-white">
                    {name}
                  </p>
                  <p className="text-xs text-stone-400 dark:text-stone-500">
                    {area}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, si) => (
                  <Star
                    key={si}
                    size={13}
                    className={
                      si < rating
                        ? "fill-amber-400 text-amber-400"
                        : "text-stone-200 dark:text-stone-700"
                    }
                  />
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
