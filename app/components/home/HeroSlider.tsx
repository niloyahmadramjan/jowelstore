"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, type Variants, type Transition } from "framer-motion";
import Link                                  from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";

/* ── Cubic bezier typed correctly ────────────────────── */
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/* ── Slides data ─────────────────────────────────────── */
const SLIDES = [
  {
    id:            1,
    badge:         "🥦 আজকের তাজা পণ্য",
    headline:      "সরাসরি খামার থেকে",
    highlight:     "তাজা মুদিখানা",
    sub:           "বাছাই করা শাকসবজি, ফলমূল ও দুগ্ধজাত পণ্য — সরাসরি খামার থেকে প্রতিদিন আনা হয়।",
    cta:           "মুদিখানা কিনুন",
    ctaHref:       "/groceries",
    secondary:     "অফার দেখুন",
    secondaryHref: "/offers",
    stat1: { value: "৫০০+",    label: "পণ্য"      },
    stat2: { value: "প্রতিদিন", label: "নতুন স্টক" },
    stat3: { value: "৪.৯★",    label: "রেটিং"     },
    bg:    "from-[#052e16] via-[#14532d] to-[#166534]",
    accent: "#4ade80",
    emoji:  ["🥦", "🍅", "🥕", "🍋", "🫑", "🍇"],
  },
  {
    id:            2,
    badge:         "🧴 সেরা ব্র্যান্ড",
    headline:      "দৈনন্দিন ব্যবহারের",
    highlight:     "প্রসাধনী পণ্য",
    sub:           "সাবান, শ্যাম্পু, ক্রিম, তেল সহ সব ধরনের প্রসাধনী পণ্য — সেরা দামে।",
    cta:           "প্রসাধনী কিনুন",
    ctaHref:       "/beauty",
    secondary:     "ব্র্যান্ড দেখুন",
    secondaryHref: "/beauty",
    stat1: { value: "৩০০+", label: "পণ্য"     },
    stat2: { value: "সেরা", label: "ব্র্যান্ড" },
    stat3: { value: "৪.৮★", label: "রেটিং"    },
    bg:    "from-[#042f2e] via-[#134e4a] to-[#115e59]",
    accent: "#22d3ee",
    emoji:  ["🧴", "🪥", "🧼", "💆", "🧖", "✨"],
  },
  {
    id:            3,
    badge:         "🚀 সীমিত সময়ের অফার",
    headline:      "বিশেষ ছাড়",
    highlight:     "এক্সক্লুসিভ ডিল",
    sub:           "বাছাই করা পণ্যে ৪০% পর্যন্ত ছাড়। ৳৯৯৯ এর উপরে অর্ডারে বিনামূল্যে ডেলিভারি।",
    cta:           "ডিল দেখুন",
    ctaHref:       "/offers",
    secondary:     "সব পণ্য",
    secondaryHref: "/shop",
    stat1: { value: "৪০%",  label: "পর্যন্ত ছাড়" },
    stat2: { value: "ফ্রি", label: "ডেলিভারি"    },
    stat3: { value: "আজই", label: "শেষ সুযোগ"   },
    bg:    "from-[#0d0921] via-[#2e1065] to-[#4c1d95]",
    accent: "#a78bfa",
    emoji:  ["🎁", "🛍️", "💸", "🎉", "⚡", "🏷️"],
  },
] as const;

/* ── Slide transition variants ───────────────────────── */
const slideVariants: Variants = {
  enter:  (dir: number) => ({ x: dir > 0 ? "100%" : "-100%", opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:   (dir: number) => ({ x: dir > 0 ? "-100%" : "100%", opacity: 0 }),
};

/* ── Content stagger variants ────────────────────────── */
const contentVariants: Variants = {
  hidden:  {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren:   0.15,
    } as Transition,
  },
};

/* ── Single item variant ─────────────────────────────── */
const itemVariants: Variants = {
  hidden:  { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y:       0,
    transition: {
      duration: 0.5,
      ease:     EASE,
    } as Transition,
  },
};

/* ── Slide transition config ─────────────────────────── */
const slideTransition: Transition = {
  duration: 0.55,
  ease:     EASE,
};

/* ── Component ───────────────────────────────────────── */
export function HeroSlider() {
  const [index,  setIndex]  = useState(0);
  const [dir,    setDir]    = useState(1);
  const [paused, setPaused] = useState(false);

  const slide = SLIDES[index];

  const goTo = useCallback((next: number, d: number) => {
    setDir(d);
    setIndex(next);
  }, []);

  const next = useCallback(
    () => goTo((index + 1) % SLIDES.length, 1),
    [index, goTo],
  );

  const prev = useCallback(
    () => goTo((index - 1 + SLIDES.length) % SLIDES.length, -1),
    [index, goTo],
  );

  /* Auto-play every 5s — pause on hover */
  useEffect(() => {
    if (paused) return;
    const t = setTimeout(next, 5000);
    return () => clearTimeout(t);
  }, [index, paused, next]);

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ minHeight: "clamp(340px, 52vw, 560px)" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <AnimatePresence custom={dir} mode="popLayout">
        <motion.div
          key={slide.id}
          custom={dir}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={slideTransition}
          className={`
            absolute inset-0 flex items-center
            bg-linear-to-br ${slide.bg}
          `}
        >
          {/* Floating emoji — decorative */}
          <div
            aria-hidden="true"
            className="absolute inset-0 overflow-hidden pointer-events-none select-none"
          >
            {slide.emoji.map((em, i) => (
              <motion.span
                key={i}
                className="absolute text-3xl sm:text-5xl opacity-10"
                style={{
                  top:  `${10 + (i * 15) % 70}%`,
                  left: `${55 + (i * 8)  % 40}%`,
                }}
                animate={{
                  y:      [0, -18, 0],
                  rotate: [0, i % 2 === 0 ? 10 : -10, 0],
                }}
                transition={{
                  duration: 4 + i,
                  repeat:   Infinity,
                  ease:     "easeInOut",
                  delay:    i * 0.3,
                }}
              >
                {em}
              </motion.span>
            ))}
          </div>

          {/* Radial glow */}
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse 60% 60% at 70% 50%, ${slide.accent}, transparent)`,
            }}
          />

          {/* Slide content */}
          <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-10 lg:px-12 py-12 w-full">
            <motion.div
              key={`content-${slide.id}`}
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              className="max-w-xl"
            >
              {/* Badge */}
              <motion.span
                variants={itemVariants}
                className="
                  inline-flex items-center gap-1.5
                  px-3.5 py-1.5 mb-5 rounded-full
                  text-xs font-medium
                  border border-white/25 bg-white/15 text-white/90
                "
              >
                {slide.badge}
              </motion.span>

              {/* Headline */}
              <motion.h1
                variants={itemVariants}
                className="
                  text-3xl sm:text-4xl lg:text-5xl
                  font-bold text-white
                  leading-[1.1] tracking-tight mb-3
                "
              >
                {slide.headline}
                <br />
                <span style={{ color: slide.accent }}>
                  {slide.highlight}
                </span>
              </motion.h1>

              {/* Sub */}
              <motion.p
                variants={itemVariants}
                className="
                  text-white/70 text-sm sm:text-base
                  leading-relaxed mb-7 max-w-md
                "
              >
                {slide.sub}
              </motion.p>

              {/* CTA buttons */}
              <motion.div
                variants={itemVariants}
                className="flex flex-wrap items-center gap-3"
              >
                <Link
                  href={slide.ctaHref}
                  style={{ background: slide.accent, color: "#0a0a0a" }}
                  className="
                    flex items-center gap-2
                    px-5 py-3 rounded-xl
                    text-sm font-semibold
                    hover:opacity-90 hover:-translate-y-0.5
                    transition-all duration-200
                  "
                >
                  {slide.cta}
                  <ArrowRight size={15} />
                </Link>

                <Link
                  href={slide.secondaryHref}
                  className="
                    flex items-center gap-2
                    px-5 py-3 rounded-xl
                    text-sm font-medium text-white
                    bg-white/15 border border-white/25
                    hover:bg-white/25
                    transition-all duration-200
                  "
                >
                  {slide.secondary}
                </Link>
              </motion.div>

              {/* Stats */}
              <motion.div
                variants={itemVariants}
                className="flex items-center gap-7 mt-8"
              >
                {[slide.stat1, slide.stat2, slide.stat3].map(({ value, label }) => (
                  <div key={label}>
                    <p className="text-lg font-bold text-white">{value}</p>
                    <p className="text-xs text-white/55">{label}</p>
                  </div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Prev arrow */}
      <button
        onClick={prev}
        aria-label="Previous slide"
        className="
          absolute left-3 top-1/2 -translate-y-1/2 z-20
          w-9 h-9 rounded-full
          bg-black/30 hover:bg-black/50
          text-white flex items-center justify-center
          backdrop-blur-sm transition-all
        "
      >
        <ChevronLeft size={18} />
      </button>

      {/* Next arrow */}
      <button
        onClick={next}
        aria-label="Next slide"
        className="
          absolute right-3 top-1/2 -translate-y-1/2 z-20
          w-9 h-9 rounded-full
          bg-black/30 hover:bg-black/50
          text-white flex items-center justify-center
          backdrop-blur-sm transition-all
        "
      >
        <ChevronRight size={18} />
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i, i > index ? 1 : -1)}
            aria-label={`Go to slide ${i + 1}`}
            className={`
              rounded-full transition-all duration-300
              ${i === index
                ? "w-6 h-2 bg-white"
                : "w-2 h-2 bg-white/40 hover:bg-white/60"
              }
            `}
          />
        ))}
      </div>
    </section>
  );
}