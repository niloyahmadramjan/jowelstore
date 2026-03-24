"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Facebook,
  Instagram,
  Youtube,
  ShoppingBag,
  ChevronRight,
  Heart,
} from "lucide-react";

/* ── Data ───────────────────────────────────────────────── */
const quickLinks = [
  { label: "হোম", href: "/" },
  { label: "সব পণ্য", href: "/shop" },
  { label: "ক্যাটাগরি", href: "/categories" },
  { label: "অফার", href: "/offers" },
  { label: "আমাদের সম্পর্কে", href: "/about" },
  { label: "যোগাযোগ", href: "/contact" },
];

const categories = [
  { label: "চাল, ডাল ও আটা", href: "/categories/rice-dal" },
  { label: "তেল ও মশলা", href: "/categories/oil-spices" },
  { label: "সাবান ও শ্যাম্পু", href: "/categories/soap" },
  { label: "বিস্কুট ও চানাচুর", href: "/categories/snacks" },
  { label: "চা, কফি ও পানীয়", href: "/categories/drinks" },
  { label: "শিশু খাদ্য", href: "/categories/baby-food" },
  { label: "ডিটারজেন্ট ও ক্লিনার", href: "/categories/cleaning" },
  { label: "দৈনন্দিন প্রয়োজনীয়", href: "/categories/daily" },
];

const socials = [
  {
    label: "Facebook",
    href: "https://facebook.com",
    icon: Facebook,
    color: "hover:text-blue-500",
  },
  {
    label: "Instagram",
    href: "https://instagram.com",
    icon: Instagram,
    color: "hover:text-pink-500",
  },
  {
    label: "YouTube",
    href: "https://youtube.com",
    icon: Youtube,
    color: "hover:text-red-500",
  },
];

/* ── Animation variants ─────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

/* ── Component ──────────────────────────────────────────── */
export default function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-300">
      {/* Top banner */}
      {/* <div className="bg-green-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-center gap-2 text-white text-sm font-medium">
            <ShoppingBag size={16} />
            <span>
              জুয়েল স্টোর — আপনার পাড়ার বিশ্বস্ত মুদি দোকান 🛒
            </span>
          </div>
        </div>
      </div> */}

      {/* Main footer */}
      <motion.div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14"
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* ── Col 1: Brand & Contact ── */}
          <motion.div className="space-y-6">
            {/* Logo */}
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-10 h-10 rounded-xl bg-green-700 flex items-center justify-center">
                  <ShoppingBag size={20} className="text-white" />
                </div>
                <div>
                  <p className="text-white font-bold text-lg leading-none">
                    জুয়েল স্টোর
                  </p>
                  <p className="text-green-500 text-xs">Jowel Store</p>
                </div>
              </div>
              <p className="text-stone-400 text-sm leading-relaxed">
                আপনার প্রতিদিনের প্রয়োজনীয় সব পণ্য এক জায়গায়। চাল, ডাল, তেল,
                মশলা থেকে শুরু করে সাবান, শ্যাম্পু সবকিছুই পাবেন আমাদের কাছে।
              </p>
            </div>

            {/* Contact info */}
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm">
                <MapPin size={16} className="text-green-500 mt-0.5 shrink-0" />
                <span className="text-stone-400">
                  জুয়েল স্টোর, মেইন রোড, ঢাকা, বাংলাদেশ
                </span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Phone size={16} className="text-green-500 shrink-0" />
                <a
                  href="tel:+8801XXXXXXXXX"
                  className="text-stone-400 hover:text-white transition-colors"
                >
                  +880 1XXX-XXXXXX
                </a>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Mail size={16} className="text-green-500 shrink-0" />
                <a
                  href="mailto:info@jowelstore.com"
                  className="text-stone-400 hover:text-white transition-colors"
                >
                  info@jowelstore.com
                </a>
              </li>
              <li className="flex items-start gap-3 text-sm">
                <Clock size={16} className="text-green-500 mt-0.5 shrink-0" />
                <span className="text-stone-400">
                  সকাল ৮টা — রাত ১০টা
                  <br />
                  সপ্তাহের ৭ দিন খোলা
                </span>
              </li>
            </ul>

            {/* Social links */}
            <div className="flex items-center gap-3">
              {socials.map(({ label, href, icon: Icon, color }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className={`
                    w-9 h-9 rounded-lg flex items-center justify-center
                    bg-stone-800 text-stone-400
                    ${color}
                    hover:bg-stone-700
                    transition-all duration-200
                  `}
                >
                  <Icon size={17} />
                </a>
              ))}
            </div>
          </motion.div>

          {/* ── Col 2: Quick Links ── */}
          <motion.div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-5">
              Quick Links
            </h3>
            <ul className="space-y-2.5">
              {quickLinks.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="flex items-center gap-1.5 text-sm text-stone-400 hover:text-green-400 transition-colors group"
                  >
                    <ChevronRight
                      size={14}
                      className="text-stone-600 group-hover:text-green-400 transition-colors"
                    />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* ── Col 3: Categories ── */}
          <motion.div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-5">
              পণ্যের ধরন
            </h3>
            <ul className="space-y-2.5">
              {categories.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="flex items-center gap-1.5 text-sm text-stone-400 hover:text-green-400 transition-colors group"
                  >
                    <ChevronRight
                      size={14}
                      className="text-stone-600 group-hover:text-green-400 transition-colors"
                    />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* ── Col 4: Newsletter ── */}
          <motion.div className="space-y-5">
            <div>
              <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-1">
                অফার পেতে চান?
              </h3>
              <p className="text-stone-400 text-sm">
                আমাদের নিউজলেটার সাবস্ক্রাইব করুন এবং সেরা ডিল সবার আগে পান।
              </p>
            </div>

            <form onSubmit={(e) => e.preventDefault()} className="space-y-2.5">
              <input
                type="email"
                placeholder="আপনার ইমেইল লিখুন"
                className="
                  w-full px-4 py-2.5 rounded-xl text-sm
                  bg-stone-800 border border-stone-700
                  text-stone-100 placeholder:text-stone-500
                  focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20
                  transition-all duration-200
                "
              />
              <button
                type="submit"
                className="
                  w-full py-2.5 px-4 rounded-xl text-sm font-semibold
                  bg-green-700 hover:bg-green-600 text-white
                  transition-colors duration-200
                "
              >
                সাবস্ক্রাইব করুন
              </button>
            </form>

            {/* Payment badges */}
            <div>
              <p className="text-stone-500 text-xs mb-3 uppercase tracking-wider">
                পেমেন্ট পদ্ধতি
              </p>
              <div className="flex flex-wrap gap-2">
                {["bKash", "Nagad", "Rocket", "Cash"].map((method) => (
                  <span
                    key={method}
                    className="px-2.5 py-1 rounded-md bg-stone-800 border border-stone-700 text-stone-400 text-xs font-medium"
                  >
                    {method}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Bottom bar */}
      <div className="border-t border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-stone-500 text-xs text-center sm:text-left">
              © {new Date().getFullYear()} জুয়েল স্টোর। সর্বস্বত্ব সংরক্ষিত।
            </p>

            <div className="flex items-center gap-1 text-stone-500 text-xs">
              <span>Made with</span>
              <Heart size={12} className="text-red-500 fill-red-500 mx-0.5" />
              <span>in Bangladesh</span>
            </div>

            <div className="flex items-center gap-4">
              {[
                { label: "Privacy", href: "/privacy" },
                { label: "Terms", href: "/terms" },
                { label: "Returns", href: "/returns" },
              ].map(({ label, href }) => (
                <Link
                  key={label}
                  href={href}
                  className="text-stone-500 hover:text-stone-300 text-xs transition-colors"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
