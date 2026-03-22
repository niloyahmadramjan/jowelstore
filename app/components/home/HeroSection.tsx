"use client";

import { useState, useEffect }        from "react";
import { motion, AnimatePresence,
         type Variants, type Transition } from "framer-motion";
import Link                            from "next/link";

/* ─────────────────────────────────────────────────────────
   Shared ease curve — typed as a tuple, not number[]
───────────────────────────────────────────────────────── */
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/* ─────────────────────────────────────────────────────────
   Slide data
───────────────────────────────────────────────────────── */
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
    stat1:         { value: "৫০০+",    label: "পণ্য"       },
    stat2:         { value: "প্রতিদিন", label: "নতুন স্টক"  },
    stat3:         { value: "৪.৯★",    label: "রেটিং"      },
    accent:        "#16a34a",
    accentBright:  "#4ade80",
    bg:            "from-[#052e16] via-[#14532d] to-[#166534]",
    emoji:         ["🥦", "🍅", "🥕", "🍋", "🫑", "🍇"],
  },
  {
    id:            2,
    badge:         "🧴 সেরা ব্র্যান্ড",
    headline:      "দৈনন্দিন ব্যবহারের",
    highlight:     "প্রসাধনী পণ্য",
    sub:           "সাবান, শ্যাম্পু, ক্রিম, তেল সহ সব ধরনের প্রসাধনী পণ্য পাবেন এখানে — সেরা দামে।",
    cta:           "প্রসাধনী কিনুন",
    ctaHref:       "/beauty",
    secondary:     "ব্র্যান্ড দেখুন",
    secondaryHref: "/beauty",
    stat1:         { value: "৩০০+",  label: "পণ্য"      },
    stat2:         { value: "সেরা",  label: "ব্র্যান্ড"  },
    stat3:         { value: "৪.৮★", label: "রেটিং"     },
    accent:        "#0e7490",
    accentBright:  "#22d3ee",
    bg:            "from-[#042f2e] via-[#134e4a] to-[#115e59]",
    emoji:         ["🧴", "🪥", "🧼", "💆", "🧖", "✨"],
  },
  {
    id:            3,
    badge:         "🚀 সীমিত সময়ের অফার",
    headline:      "বিশেষ ছাড়",
    highlight:     "এক্সক্লুসিভ ডিল",
    sub:           "বাছাই করা মুদিখানা ও প্রসাধনীতে ৪০% পর্যন্ত ছাড়। ৳৯৯৯ এর উপরে অর্ডারে বিনামূল্যে ডেলিভারি।",
    cta:           "ডিল দেখুন",
    ctaHref:       "/offers",
    secondary:     "সব পণ্য",
    secondaryHref: "/search",
    stat1:         { value: "৪০%",  label: "পর্যন্ত ছাড়" },
    stat2:         { value: "ফ্রি", label: "ডেলিভারি"    },
    stat3:         { value: "আজই", label: "শেষ সুযোগ"   },
    accent:        "#7c3aed",
    accentBright:  "#a78bfa",
    bg:            "from-[#0d0921] via-[#2e1065] to-[#4c1d95]",
    emoji:         ["🎁", "🛍️", "💸", "🎉", "⚡", "🏷️"],
  },
] as const;

type Slide = typeof SLIDES[number];

/* ─────────────────────────────────────────────────────────
   Animation variants — properly typed
───────────────────────────────────────────────────────── */
const fadeUpVariants: Variants = {
  hidden:  { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0  },
};

const fadeInVariants: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1 },
};

const slideLeftVariants: Variants = {
  hidden:  { opacity: 0, x: 60 },
  visible: { opacity: 1, x: 0  },
};

/* Shared transition presets */
const tFast:   Transition = { duration: 0.4, ease: EASE };
const tMedium: Transition = { duration: 0.6, ease: EASE };
const tSlow:   Transition = { duration: 0.7, ease: EASE };

/* ─────────────────────────────────────────────────────────
   Hero Section
───────────────────────────────────────────────────────── */
export default function HeroSection() {
  const [current, setCurrent] = useState(0);
  const [paused,  setPaused]  = useState(false);

  const slide = SLIDES[current];

  /* Auto-advance every 5 s */
  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setCurrent((c) => (c + 1) % SLIDES.length), 6000);
    return () => clearInterval(t);
  }, [paused]);

  const prev = () => setCurrent((c) => (c - 1 + SLIDES.length) % SLIDES.length);
  const next = () => setCurrent((c) => (c + 1) % SLIDES.length);

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ minHeight: "calc(100vh - 88px)" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Animated background */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`bg-${slide.id}`}
          className={`absolute inset-0 bg-linear-to-br ${slide.bg}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{    opacity: 0 }}
          transition={{ duration: 0.8 }}
        />
      </AnimatePresence>

      {/* Noise texture */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "200px 200px",
        }}
      />

      {/* Radial glow */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`glow-${slide.id}`}
          aria-hidden="true"
          className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full blur-3xl pointer-events-none"
          style={{ background: slide.accent }}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 0.2, scale: 1  }}
          exit={{    opacity: 0, scale: 0.6  }}
          transition={{ duration: 1 }}
        />
      </AnimatePresence>

      {/* Floating emojis */}
      <FloatingEmojis emojis={[...slide.emoji]} slideId={slide.id} />

      {/* Main content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 py-16 lg:py-24 min-h-[calc(100vh-88px)]">

          {/* Left column */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`left-${slide.id}`}
              className="flex-1 max-w-2xl"
              initial="hidden"
              animate="visible"
            >
              {/* Badge */}
              <motion.div
                variants={fadeUpVariants}
                transition={{ ...tMedium, delay: 0 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
                style={{
                  background: `${slide.accent}30`,
                  border:     `1px solid ${slide.accent}50`,
                }}
              >
                <span className="text-sm font-semibold text-white/90 tracking-wide">
                  {slide.badge}
                </span>
              </motion.div>

              {/* Headline */}
              <motion.h1
                variants={fadeUpVariants}
                transition={{ ...tSlow, delay: 0.1 }}
                className="font-display text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold leading-[1.0] tracking-tight text-white mb-4"
              >
                {slide.headline}
                <br />
                <span className="relative inline-block" style={{ color: slide.accentBright }}>
                  {slide.highlight}
                  {/* Animated underline */}
                  <motion.span
                    className="absolute -bottom-2 left-0 h-1 rounded-full"
                    style={{ background: slide.accentBright }}
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 0.8, delay: 0.5, ease: EASE }}
                  />
                </span>
              </motion.h1>

              {/* Sub text */}
              <motion.p
                variants={fadeUpVariants}
                transition={{ ...tMedium, delay: 0.2 }}
                className="text-lg sm:text-xl text-white/65 leading-relaxed max-w-lg mt-6 mb-8"
              >
                {slide.sub}
              </motion.p>

              {/* CTA buttons */}
              <motion.div
                variants={fadeUpVariants}
                transition={{ ...tMedium, delay: 0.3 }}
                className="flex flex-wrap gap-4 mb-12"
              >
                <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    href={slide.ctaHref}
                    className="inline-flex items-center gap-2.5 px-7 py-4 rounded-2xl text-base font-bold text-white shadow-2xl transition-colors duration-200"
                    style={{
                      background: `linear-gradient(135deg, ${slide.accent}, ${slide.accent}cc)`,
                      boxShadow:  `0 8px 32px ${slide.accent}50`,
                    }}
                  >
                    {slide.cta}
                    <ArrowIcon />
                  </Link>
                </motion.div>

                <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    href={slide.secondaryHref}
                    className="inline-flex items-center gap-2.5 px-7 py-4 rounded-2xl text-base font-semibold text-white/90 bg-white/10 border border-white/20 backdrop-blur-sm hover:bg-white/15 transition-colors duration-200"
                  >
                    {slide.secondary}
                  </Link>
                </motion.div>
              </motion.div>

              {/* Stats */}
              <motion.div
                variants={fadeInVariants}
                transition={{ ...tFast, delay: 0.5 }}
                className="flex items-center gap-8"
              >
                {[slide.stat1, slide.stat2, slide.stat3].map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0  }}
                    transition={{ delay: 0.5 + i * 0.1, duration: 0.4, ease: EASE }}
                    className="text-center"
                  >
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                    <p className="text-xs text-white/50 mt-0.5 font-medium uppercase tracking-wider">
                      {stat.label}
                    </p>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </AnimatePresence>

          {/* Right column — showcase card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`right-${slide.id}`}
              className="flex-shrink-0 w-full max-w-sm lg:max-w-md"
              variants={slideLeftVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, x: 60 }}
              transition={{ ...tSlow, delay: 0.3 }}
            >
              <ShowcaseCard slide={slide} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom controls */}
      <div className="absolute bottom-8 left-0 right-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">

          {/* Dot indicators with progress */}
          <div className="flex items-center gap-3">
            {SLIDES.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setCurrent(i)}
                aria-label={`Go to slide ${i + 1}`}
                className="relative h-1 rounded-full overflow-hidden transition-all duration-300"
                style={{
                  width:      i === current ? 40 : 16,
                  background: "rgba(255,255,255,0.25)",
                }}
              >
                {i === current && (
                  <motion.span
                    key={`prog-${current}`}
                    className="absolute inset-y-0 left-0 rounded-full bg-white"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: paused ? 0 : 5, ease: "linear" }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Prev / Next */}
          <div className="flex items-center gap-2">
            <motion.button
              onClick={prev}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Previous slide"
              className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors backdrop-blur-sm"
            >
              <ChevronLeftIcon />
            </motion.button>
            <motion.button
              onClick={next}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Next slide"
              className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors backdrop-blur-sm"
            >
              <ChevronRightIcon />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Bottom fade into page */}
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-stone-50 dark:from-stone-950 to-transparent pointer-events-none z-10"
      />
    </section>
  );
}

/* ─────────────────────────────────────────────────────────
   Showcase Card
───────────────────────────────────────────────────────── */
function ShowcaseCard({ slide }: { slide: Slide }) {
  return (
    <div className="relative">
      {/* Glow */}
      <div
        aria-hidden="true"
        className="absolute inset-0 rounded-3xl blur-2xl opacity-30 scale-95 pointer-events-none"
        style={{ background: slide.accent }}
      />

      {/* Card body */}
      <div className="relative rounded-3xl border border-white/15 overflow-hidden backdrop-blur-md bg-white/8 p-6 shadow-2xl">

        {/* Header row */}
        <div className="flex items-center justify-between mb-6">
          <span
            className="text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full text-white"
            style={{ background: `${slide.accent}40` }}
          >
            Featured
          </span>
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div key={i} className="w-2 h-2 rounded-full bg-white/30" />
            ))}
          </div>
        </div>

        {/* Emoji orbit visual */}
        <div
          className="relative h-48 rounded-2xl flex items-center justify-center mb-6 overflow-hidden"
          style={{ background: `${slide.accent}20` }}
        >
          {/* Grid lines */}
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)`,
              backgroundSize:  "32px 32px",
            }}
          />

          {/* Orbit emojis */}
          <div className="relative w-36 h-36">
            {slide.emoji.slice(0, 6).map((emoji, i) => {
              const angle  = (i / 6) * Math.PI * 2 - Math.PI / 2;
              const x      = Math.cos(angle) * 60 + 72 - 20;
              const y      = Math.sin(angle) * 60 + 72 - 20;
              return (
                <motion.div
                  key={`${emoji}-${i}`}
                  className="absolute w-10 h-10 rounded-xl flex items-center justify-center text-2xl bg-white/15 backdrop-blur-sm border border-white/20"
                  style={{ left: x, top: y }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.4 + i * 0.08, type: "spring", stiffness: 300 }}
                  whileHover={{ scale: 1.2, rotate: 10 }}
                >
                  {emoji}
                </motion.div>
              );
            })}

            {/* Centre pulsing icon */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-xl"
                style={{ background: slide.accent }}
              >
                {slide.emoji[0]}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Product info */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-bold text-lg leading-tight">
                {slide.highlight} Collection
              </p>
              <p className="text-white/50 text-sm mt-0.5">
                {slide.stat1.value} items available
              </p>
            </div>
            <div
              className="text-right px-3 py-1.5 rounded-xl"
              style={{ background: `${slide.accent}25` }}
            >
              <p className="text-white font-bold text-sm">From</p>
              <p className="font-bold text-base" style={{ color: slide.accentBright }}>
                ৳99
              </p>
            </div>
          </div>

          {/* Stars */}
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5">
              {[1,2,3,4,5].map((s) => (
                <svg key={s} width="12" height="12" viewBox="0 0 24 24" fill="#f59e0b" stroke="none" aria-hidden="true">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
              ))}
            </div>
            <span className="text-white/50 text-xs">{slide.stat3.value} · 2.4k reviews</span>
          </div>

          {/* CTA */}
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link
              href={slide.ctaHref}
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-sm font-bold text-white transition-all duration-200"
              style={{
                background: `linear-gradient(135deg, ${slide.accent}cc, ${slide.accent})`,
                boxShadow:  `0 4px 16px ${slide.accent}40`,
              }}
            >
              {slide.cta}
              <ArrowIcon />
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Floating delivery badge */}
      <motion.div
        className="absolute -bottom-4 -left-4 bg-white dark:bg-stone-900 rounded-2xl shadow-xl px-4 py-3 flex items-center gap-2.5 border border-stone-100 dark:border-stone-800"
        initial={{ opacity: 0, y: 12, scale: 0.9 }}
        animate={{ opacity: 1, y: 0,  scale: 1   }}
        transition={{ delay: 0.8, type: "spring", stiffness: 300 }}
      >
        <div className="w-8 h-8 rounded-xl bg-green-100 dark:bg-green-900/40 flex items-center justify-center text-base flex-shrink-0">
          🚚
        </div>
        <div>
          <p className="text-xs font-bold text-stone-900 dark:text-white">Free Delivery</p>
          <p className="text-[10px] text-stone-400 dark:text-stone-500">Orders above ৳999</p>
        </div>
      </motion.div>

      {/* Floating discount badge */}
      <motion.div
        className="absolute -top-3 -right-3 w-14 h-14 rounded-2xl shadow-xl flex flex-col items-center justify-center text-white font-bold bg-gradient-to-br from-red-500 to-red-600"
        initial={{ opacity: 0, scale: 0, rotate: -12 }}
        animate={{ opacity: 1, scale: 1, rotate: -12 }}
        transition={{ delay: 1, type: "spring", stiffness: 400 }}
        whileHover={{ rotate: 0, scale: 1.1 }}
      >
        <p className="text-sm leading-none">40%</p>
        <p className="text-[9px] leading-none opacity-80">OFF</p>
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Floating background emojis
───────────────────────────────────────────────────────── */
const FLOAT_POSITIONS = [
  { top: "8%",  left: "3%",  size: 36, duration: 6,  delay: 0   },
  { top: "15%", left: "88%", size: 28, duration: 8,  delay: 1   },
  { top: "60%", left: "5%",  size: 24, duration: 7,  delay: 2   },
  { top: "75%", left: "90%", size: 32, duration: 9,  delay: 0.5 },
  { top: "40%", left: "92%", size: 20, duration: 5,  delay: 1.5 },
  { top: "85%", left: "18%", size: 22, duration: 10, delay: 3   },
] as const;

function FloatingEmojis({ emojis, slideId }: { emojis: string[]; slideId: number }) {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden pointer-events-none"
    >
      {FLOAT_POSITIONS.map((pos, i) => (
        <motion.div
          key={`${slideId}-float-${i}`}
          className="absolute select-none"
          style={{ top: pos.top, left: pos.left, fontSize: pos.size, opacity: 0.15 }}
          animate={{
            y:       [0, -20, 0],
            rotate:  [0, 10, -10, 0],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: pos.duration,
            repeat:   Infinity,
            delay:    pos.delay,
            ease:     "easeInOut",
          }}
        >
          {emojis[i % emojis.length]}
        </motion.div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Icons
───────────────────────────────────────────────────────── */
function ArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
      <line x1="5" y1="12" x2="19" y2="12"/>
      <polyline points="12 5 19 12 12 19"/>
    </svg>
  );
}

function ChevronLeftIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
      <polyline points="15 18 9 12 15 6"/>
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  );
}