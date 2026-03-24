import { type Metadata } from "next";
import { motion }        from "framer-motion";
import Link              from "next/link";
import {
  MapPin, Phone, Mail, Clock,
  ShieldCheck, Truck, BadgePercent, Heart,
} from "lucide-react";

export const metadata: Metadata = {
  title:       "আমাদের সম্পর্কে — জওয়েল স্টোর",
  description: "জওয়েল স্টোর — আপনার পাড়ার বিশ্বস্ত মুদি দোকান। সেরা মানের পণ্য, সেরা দামে।",
};

const STATS = [
  { value: "১০,০০০+", label: "সন্তুষ্ট ক্রেতা" },
  { value: "৫০০+",    label: "পণ্য উপলব্ধ"     },
  { value: "৩ বছর",   label: "সেবার অভিজ্ঞতা"  },
  { value: "৭ দিন",   label: "সাপ্তাহিক সেবা"  },
];

const VALUES = [
  { Icon: ShieldCheck,  title: "বিশ্বস্ততা",     desc: "প্রতিটি পণ্যের মান নিশ্চিত করে তবেই বিক্রি করা হয়।"       },
  { Icon: Truck,        title: "দ্রুত সেবা",      desc: "ঢাকার ভেতরে একই দিনে ডেলিভারি দেওয়া আমাদের লক্ষ্য।"     },
  { Icon: BadgePercent, title: "সেরা দাম",        desc: "বাজারের চেয়ে সবসময় কম দামে সেরা পণ্য পাবেন।"              },
  { Icon: Heart,        title: "ক্রেতার সন্তুষ্টি", desc: "আপনার সন্তুষ্টি না হলে পণ্য ফেরত বা পরিবর্তন করা হবে।" },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-stone-50 dark:bg-stone-950">

      {/* Hero */}
      <div className="bg-gradient-to-br from-[#052e16] via-[#14532d] to-[#166534] py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            জওয়েল স্টোর
          </h1>
          <p className="text-white/75 text-base sm:text-lg leading-relaxed">
            আপনার পাড়ার বিশ্বস্ত মুদি দোকান — যেখানে পাবেন চাল, ডাল, তেল,
            মশলা থেকে শুরু করে সাবান, শ্যাম্পু সহ প্রতিদিনের সব প্রয়োজনীয় পণ্য।
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-14">

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {STATS.map(({ value, label }) => (
            <div
              key={label}
              className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800 p-5 text-center shadow-sm"
            >
              <p className="text-3xl font-bold text-green-700 dark:text-green-400">{value}</p>
              <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Story */}
        <section className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800 p-6 sm:p-8 shadow-sm">
          <h2 className="text-xl font-bold text-stone-900 dark:text-white mb-4">আমাদের গল্প</h2>
          <div className="space-y-4 text-stone-600 dark:text-stone-400 text-sm leading-relaxed">
            <p>
              জওয়েল স্টোর শুরু হয়েছিল একটি ছোট মুদি দোকান হিসেবে। আমাদের লক্ষ্য ছিল
              পাড়ার মানুষদের কাছে সেরা মানের পণ্য সাশ্রয়ী দামে পৌঁছে দেওয়া।
            </p>
            <p>
              আজ আমরা গর্বিত যে ১০,০০০ এরও বেশি পরিবার আমাদের উপর আস্থা রাখেন।
              অনলাইনে অর্ডার করুন — আমরা পৌঁছে দেব আপনার দরজায়।
            </p>
          </div>
        </section>

        {/* Values */}
        <section>
          <h2 className="text-xl font-bold text-stone-900 dark:text-white mb-5 text-center">
            আমাদের মূল্যবোধ
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {VALUES.map(({ Icon, title, desc }) => (
              <div
                key={title}
                className="flex items-start gap-4 bg-white dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800 p-5 shadow-sm"
              >
                <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-950/30 flex items-center justify-center flex-shrink-0">
                  <Icon size={18} className="text-green-700 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-stone-900 dark:text-white mb-1">{title}</h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800 p-6 sm:p-8 shadow-sm">
          <h2 className="text-xl font-bold text-stone-900 dark:text-white mb-6">যোগাযোগ করুন</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[
              { Icon: MapPin, label: "ঠিকানা",      value: "মেইন রোড, ঢাকা, বাংলাদেশ",        href: null           },
              { Icon: Phone,  label: "ফোন",          value: "+880 1XXX-XXXXXX",                 href: "tel:+880"     },
              { Icon: Mail,   label: "ইমেইল",        value: "info@jowelstore.com",              href: "mailto:info@jowelstore.com" },
              { Icon: Clock,  label: "সময়সূচি",     value: "সকাল ৮টা — রাত ১০টা (৭ দিন)",   href: null           },
            ].map(({ Icon, label, value, href }) => (
              <div key={label} className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-green-50 dark:bg-green-950/30 flex items-center justify-center flex-shrink-0">
                  <Icon size={16} className="text-green-700 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-stone-400 dark:text-stone-500">{label}</p>
                  {href ? (
                    <a href={href} className="text-sm font-medium text-green-700 dark:text-green-400 hover:underline">
                      {value}
                    </a>
                  ) : (
                    <p className="text-sm font-medium text-stone-800 dark:text-stone-200">{value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="text-center py-4">
          <p className="text-stone-500 dark:text-stone-400 text-sm mb-4">
            এখনই কেনাকাটা শুরু করুন
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-green-700 hover:bg-green-800 text-white font-semibold transition-colors shadow-lg shadow-green-700/25"
          >
            পণ্য দেখুন →
          </Link>
        </div>
      </div>
    </main>
  );
}