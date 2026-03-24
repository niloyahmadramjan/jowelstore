"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence }                   from "framer-motion";
import { useSession, signOut }                       from "next-auth/react";
import { type Session }                              from "next-auth";
import { useRouter, usePathname }                    from "next/navigation";
import Link                                          from "next/link";
import Image                                         from "next/image";
import axios                                         from "axios";
import { useDebounce }                               from "@/app/hooks/use-debounce";
import {
  Search,
  X,
  ShoppingBag,
  Heart,
  Menu,
  ChevronDown,
  User,
  Package,
  LayoutDashboard,
  LogOut,
  ImageOff,
  Loader2,
  Tag,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────
   Types
───────────────────────────────────────────────────────── */
interface ProductSuggestion {
  _id:        string;
  name:       string;
  price:      number;
  thumbnail?: string;
  category:   string;
  slug:       string;
}

/* ─────────────────────────────────────────────────────────
   Nav links
───────────────────────────────────────────────────────── */
const NAV_LINKS = [
  { label: "হোম",        href: "/"          },
  { label: "মুদিখানা",   href: "/groceries" },
  { label: "প্রসাধনী",   href: "/beauty"    },
  { label: "অফার",       href: "/offers"    },
  { label: "আমাদের",    href: "/about"     },
] as const;

/* ─────────────────────────────────────────────────────────
   Navbar
───────────────────────────────────────────────────────── */
export default function Navbar() {
  const { data: session } = useSession();
  const router            = useRouter();
  const pathname          = usePathname();

  const [scrolled,     setScrolled]     = useState(false);
  const [mobileOpen,   setMobileOpen]   = useState(false);
  const [profileOpen,  setProfileOpen]  = useState(false);
  const [searchOpen,   setSearchOpen]   = useState(false);
  const [searchQuery,  setSearchQuery]  = useState("");
  const [suggestions,  setSuggestions]  = useState<ProductSuggestion[]>([]);
  const [suggLoading,  setSuggLoading]  = useState(false);
  const [cartCount,    setCartCount]    = useState(0);
  const [wishCount,    setWishCount]    = useState(0);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const profileRef     = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebounce(searchQuery, 350);

  /* ── Scroll shadow ─────────────────────────────────── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ── Close everything on route change ──────────────── */
  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  /* ── Close profile on outside click ────────────────── */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ── Escape key closes search ───────────────────────── */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSearchOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  /* ── Focus / clear search input ────────────────────── */
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 80);
    } else {
      setSearchQuery("");
      setSuggestions([]);
    }
  }, [searchOpen]);

  /* ── Fetch search suggestions ───────────────────────── */
  const fetchSuggestions = useCallback(async (q: string) => {
    if (!q || q.length < 2) { setSuggestions([]); return; }
    setSuggLoading(true);
    try {
      const { data } = await axios.get<{ products: ProductSuggestion[] }>(
        `/api/search/products?q=${encodeURIComponent(q)}&limit=5`,
      );
      setSuggestions(data.products ?? []);
    } catch {
      setSuggestions([]);
    } finally {
      setSuggLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSuggestions(debouncedQuery);
  }, [debouncedQuery, fetchSuggestions]);

  /* ── Cart + Wishlist counts ─────────────────────────── */
  useEffect(() => {
    if (!session) return;
    (async () => {
      try {
        const [cartRes, wishRes] = await Promise.all([
          axios.get<{ count: number }>("/api/cart/count"),
          axios.get<{ count: number }>("/api/wishlist/count"),
        ]);
        setCartCount(cartRes.data.count ?? 0);
        setWishCount(wishRes.data.count ?? 0);
      } catch { /* silently ignore */ }
    })();
  }, [session]);

  /* ── Search handlers ────────────────────────────────── */
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
    setSearchOpen(false);
  };

  const handleViewAll = () => {
    const q = searchQuery.trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
    setSearchOpen(false);
  };

  const handleSuggestionClick = (slug: string) => {
    router.push(`/products/${slug}`);
    setSearchOpen(false);
  };

  /* ── Lock body scroll when mobile menu open ─────────── */
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      <header
        className={`
          sticky top-0 z-50 w-full
          bg-white/95 dark:bg-stone-900/95
          backdrop-blur-md
          border-b border-stone-100 dark:border-stone-800
          transition-shadow duration-200
          ${scrolled ? "shadow-md dark:shadow-stone-950/60" : "shadow-none"}
        `}
      >
        {/* ── Announcement bar ────────────────────────── */}
        <div className="bg-green-700 text-white text-center text-xs py-1.5 px-4 font-medium">
          ৳৯৯৯+ অর্ডারে ফ্রি ডেলিভারি &nbsp;·&nbsp;
          কোড <span className="font-bold underline">FRESH10</span> দিয়ে ১০% ছাড় পান
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3">

            {/* ── Logo ──────────────────────────────────── */}
            <Link href="/" className="flex items-center gap-2.5 shrink-0">
              {/* <Image
                src="/brand/logo-horizontal.svg"
                alt="JowelStore"
                width={140}
                height={36}
                priority
                className="h-9 w-auto"
              /> */}
               <div className="flex items-center gap-2.5 mb-3">
                              <div className="w-10 h-10 rounded-xl bg-green-700 flex items-center justify-center">
                                <ShoppingBag size={20} className="text-white" />
                              </div>
                              <div>
                                <p className="text-white font-bold text-lg leading-none">জুয়েল স্টোর</p>
                                <p className="text-green-500 text-xs">Jowel Store</p>
                              </div>
                            </div>
            </Link>

            {/* ── Desktop nav ───────────────────────────── */}
            <nav className="hidden lg:flex items-center gap-0.5">
              {NAV_LINKS.map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  className={`
                    px-3.5 py-2 rounded-lg text-sm font-medium
                    transition-colors duration-150
                    ${pathname === href
                      ? "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                      : "text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-white"
                    }
                  `}
                >
                  {label}
                </Link>
              ))}
            </nav>

            {/* ── Right actions ─────────────────────────── */}
            <div className="flex items-center gap-1 sm:gap-1.5">

              {/* Search button */}
              <button
                onClick={() => setSearchOpen(true)}
                aria-label="পণ্য খুঁজুন"
                className="
                  flex items-center gap-2 px-2.5 py-2 rounded-xl
                  bg-stone-100 dark:bg-stone-800
                  text-stone-500 dark:text-stone-400
                  hover:bg-stone-200 dark:hover:bg-stone-700
                  transition-colors duration-150
                "
              >
                <Search size={17} />
                <span className="hidden md:block text-sm text-stone-400 dark:text-stone-500 w-24 text-left">
                  খুঁজুন...
                </span>
              </button>

              {/* Wishlist */}
              {session && (
                <Link
                  href="/wishlist"
                  aria-label="উইশলিস্ট"
                  className="
                    relative p-2 rounded-xl
                    text-stone-500 dark:text-stone-400
                    hover:bg-stone-100 dark:hover:bg-stone-800
                    hover:text-rose-500
                    transition-colors duration-150
                  "
                >
                  <Heart size={20} />
                  {wishCount > 0 && <CountBadge count={wishCount} color="rose" />}
                </Link>
              )}

              {/* Cart */}
              <Link
                href="/cart"
                aria-label="কার্ট"
                className="
                  relative p-2 rounded-xl
                  text-stone-500 dark:text-stone-400
                  hover:bg-stone-100 dark:hover:bg-stone-800
                  hover:text-green-700
                  transition-colors duration-150
                "
              >
                <ShoppingBag size={20} />
                {cartCount > 0 && <CountBadge count={cartCount} color="green" />}
              </Link>

              {/* Auth — desktop */}
              {session ? (
                <div ref={profileRef} className="relative hidden sm:block">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="
                      flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl
                      hover:bg-stone-100 dark:hover:bg-stone-800
                      transition-colors duration-150
                    "
                  >
                    <UserAvatar session={session} />
                    <span className="hidden md:block text-sm font-medium text-stone-700 dark:text-stone-200 max-w-[80px] truncate">
                      {session.user?.name?.split(" ")[0]}
                    </span>
                    <ChevronDown
                      size={14}
                      className={`
                        text-stone-400 transition-transform duration-200
                        ${profileOpen ? "rotate-180" : ""}
                      `}
                    />
                  </button>

                  {/* Profile dropdown */}
                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1     }}
                        exit={{    opacity: 0, y: 8, scale: 0.96  }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="
                          absolute right-0 mt-2 w-56
                          bg-white dark:bg-stone-900
                          rounded-2xl shadow-xl dark:shadow-stone-950/60
                          border border-stone-100 dark:border-stone-800
                          py-1.5 overflow-hidden
                        "
                      >
                        {/* User info */}
                        <div className="px-4 py-3 border-b border-stone-100 dark:border-stone-800">
                          <p className="text-sm font-semibold text-stone-900 dark:text-white truncate">
                            {session.user?.name}
                          </p>
                          <p className="text-xs text-stone-400 dark:text-stone-500 truncate mt-0.5">
                            {session.user?.email}
                          </p>
                          {session.user?.role === "admin" && (
                            <span className="
                              inline-flex items-center mt-1.5
                              px-2 py-0.5 rounded-full
                              text-[10px] font-semibold
                              bg-amber-100 dark:bg-amber-900/40
                              text-amber-700 dark:text-amber-400
                            ">
                              Admin
                            </span>
                          )}
                        </div>

                        {/* Dropdown links */}
                        {(
                          [
                            { label: "প্রোফাইল",   href: "/profile",   Icon: User          },
                            { label: "আমার অর্ডার", href: "/orders",    Icon: Package       },
                            { label: "উইশলিস্ট",   href: "/wishlist",  Icon: Heart         },
                            ...(session.user?.role === "admin"
                              ? [{ label: "ড্যাশবোর্ড", href: "/dashboard", Icon: LayoutDashboard }]
                              : []
                            ),
                          ] as { label: string; href: string; Icon: React.ElementType }[]
                        ).map(({ label, href, Icon }) => (
                          <Link
                            key={href}
                            href={href}
                            className="
                              flex items-center gap-3 px-4 py-2.5
                              text-sm text-stone-600 dark:text-stone-300
                              hover:bg-stone-50 dark:hover:bg-stone-800
                              hover:text-stone-900 dark:hover:text-white
                              transition-colors
                            "
                          >
                            <Icon size={15} className="text-stone-400 dark:text-stone-500" />
                            {label}
                          </Link>
                        ))}

                        <div className="border-t border-stone-100 dark:border-stone-800 mt-1 pt-1">
                          <button
                            onClick={() => signOut({ callbackUrl: "/" })}
                            className="
                              w-full flex items-center gap-3
                              px-4 py-2.5 text-sm
                              text-red-500
                              hover:bg-red-50 dark:hover:bg-red-950/30
                              transition-colors
                            "
                          >
                            <LogOut size={15} />
                            সাইন আউট
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Link
                    href="/login"
                    className="px-3.5 py-2 text-sm font-medium text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white transition-colors"
                  >
                    লগইন
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-2 text-sm font-semibold text-white bg-green-700 hover:bg-green-800 rounded-xl transition-colors"
                  >
                    রেজিস্টার
                  </Link>
                </div>
              )}

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="মেনু"
                className="
                  lg:hidden p-2 rounded-xl
                  text-stone-500 dark:text-stone-400
                  hover:bg-stone-100 dark:hover:bg-stone-800
                  transition-colors
                "
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={mobileOpen ? "close" : "open"}
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0,   opacity: 1 }}
                    exit={{    rotate:  90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="flex"
                  >
                    {mobileOpen ? <X size={22} /> : <Menu size={22} />}
                  </motion.span>
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>

        {/* ── Mobile menu ───────────────────────────────── */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{    height: 0,    opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="
                lg:hidden overflow-hidden
                border-t border-stone-100 dark:border-stone-800
                bg-white dark:bg-stone-900
              "
            >
              <div className="px-4 py-4 space-y-1 max-h-[calc(100dvh-7rem)] overflow-y-auto">

                {/* Nav links */}
                {NAV_LINKS.map(({ label, href }, i) => (
                  <motion.div
                    key={href}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <Link
                      href={href}
                      className={`
                        flex items-center px-4 py-3 rounded-xl
                        text-sm font-medium transition-colors
                        ${pathname === href
                          ? "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                          : "text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800"
                        }
                      `}
                    >
                      {label}
                    </Link>
                  </motion.div>
                ))}

                {/* Divider */}
                <div className="border-t border-stone-100 dark:border-stone-800 pt-3 mt-3">
                  {session ? (
                    <div className="space-y-1">

                      {/* User info */}
                      <div className="flex items-center gap-3 px-4 py-3 bg-stone-50 dark:bg-stone-800 rounded-xl mb-2">
                        <UserAvatar session={session} />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-stone-900 dark:text-white truncate">
                            {session.user?.name}
                          </p>
                          <p className="text-xs text-stone-400 dark:text-stone-500 truncate">
                            {session.user?.email}
                          </p>
                        </div>
                      </div>

                      {[
                        { label: "প্রোফাইল",    href: "/profile",   Icon: User    },
                        { label: "আমার অর্ডার",  href: "/orders",    Icon: Package },
                        { label: "উইশলিস্ট",    href: "/wishlist",  Icon: Heart   },
                        { label: "অফার",         href: "/offers",    Icon: Tag     },
                      ].map(({ label, href, Icon }) => (
                        <Link
                          key={href}
                          href={href}
                          className="
                            flex items-center gap-3 px-4 py-3 rounded-xl
                            text-sm text-stone-600 dark:text-stone-300
                            hover:bg-stone-50 dark:hover:bg-stone-800
                            transition-colors
                          "
                        >
                          <Icon size={16} className="text-stone-400" />
                          {label}
                        </Link>
                      ))}

                      <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="
                          w-full flex items-center gap-3
                          px-4 py-3 rounded-xl
                          text-sm text-red-500
                          hover:bg-red-50 dark:hover:bg-red-950/30
                          transition-colors
                        "
                      >
                        <LogOut size={16} />
                        সাইন আউট
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 px-1">
                      <Link
                        href="/login"
                        className="
                          px-4 py-3 text-sm font-medium text-center rounded-xl
                          border border-stone-200 dark:border-stone-700
                          text-stone-700 dark:text-stone-200
                          hover:bg-stone-50 dark:hover:bg-stone-800
                          transition-colors
                        "
                      >
                        লগইন করুন
                      </Link>
                      <Link
                        href="/register"
                        className="
                          px-4 py-3 text-sm font-semibold text-center rounded-xl
                          bg-green-700 text-white hover:bg-green-800
                          transition-colors
                        "
                      >
                        অ্যাকাউন্ট তৈরি করুন
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── Search overlay ────────────────────────────── */}
      <AnimatePresence>
        {searchOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{    opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setSearchOpen(false)}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            />

            {/* Search panel */}
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0   }}
              exit={{    opacity: 0, y: -16  }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="
                fixed top-0 left-0 right-0 z-50
                bg-white dark:bg-stone-900
                border-b border-stone-100 dark:border-stone-800
                shadow-2xl dark:shadow-stone-950/60
              "
            >
              <div className="max-w-3xl mx-auto px-4 py-4">

                {/* Search input */}
                <form onSubmit={handleSearchSubmit} className="flex items-center gap-3">
                  <Search size={20} className="text-stone-400 shrink-0" />
                  <input
                    ref={searchInputRef}
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="পণ্যের নাম লিখুন..."
                    className="
                      flex-1 py-3 text-base bg-transparent
                      text-stone-900 dark:text-white
                      placeholder:text-stone-400 dark:placeholder:text-stone-500
                      outline-none
                    "
                  />
                  {suggLoading && (
                    <Loader2
                      size={16}
                      className="text-green-600 animate-spin shrink-0"
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => setSearchOpen(false)}
                    className="
                      p-1.5 rounded-lg shrink-0
                      text-stone-400 hover:text-stone-700 dark:hover:text-stone-200
                      hover:bg-stone-100 dark:hover:bg-stone-800
                      transition-colors
                    "
                  >
                    <X size={18} />
                  </button>
                </form>

                {/* Suggestions */}
                <AnimatePresence>
                  {suggestions.length > 0 && (
                    <motion.ul
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1,  y: 0  }}
                      exit={{    opacity: 0          }}
                      className="border-t border-stone-100 dark:border-stone-800 mt-2 pt-2 space-y-0.5"
                    >
                      {suggestions.map((p) => (
                        <li key={p._id}>
                          <button
                            type="button"
                            onClick={() => handleSuggestionClick(p.slug)}
                            className="
                              w-full flex items-center gap-3
                              px-3 py-2.5 rounded-xl
                              hover:bg-stone-50 dark:hover:bg-stone-800
                              transition-colors text-left group
                            "
                          >
                            {/* Thumbnail */}
                            <div className="
                              w-10 h-10 rounded-lg shrink-0 overflow-hidden
                              bg-stone-100 dark:bg-stone-800
                            ">
                              {p.thumbnail ? (
                                <img
                                  src={p.thumbnail}
                                  alt={p.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-stone-300 dark:text-stone-600">
                                  <ImageOff size={16} />
                                </div>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <p className="
                                text-sm font-medium truncate
                                text-stone-800 dark:text-stone-200
                                group-hover:text-green-700 dark:group-hover:text-green-400
                                transition-colors
                              ">
                                {p.name}
                              </p>
                              <p className="text-xs text-stone-400 dark:text-stone-500 capitalize">
                                {p.category}
                              </p>
                            </div>

                            <p className="text-sm font-semibold text-green-700 dark:text-green-400 shrink-0">
                              ৳{p.price.toLocaleString("bn-BD")}
                            </p>
                          </button>
                        </li>
                      ))}

                      {/* View all */}
                      <li className="pt-1 border-t border-stone-100 dark:border-stone-800">
                        <button
                          type="button"
                          onClick={handleViewAll}
                          className="
                            w-full px-3 py-2.5 text-sm text-center font-medium rounded-xl
                            text-green-700 dark:text-green-400
                            hover:bg-green-50 dark:hover:bg-green-900/20
                            transition-colors
                          "
                        >
                          &quot;{searchQuery}&quot; এর সব ফলাফল দেখুন →
                        </button>
                      </li>
                    </motion.ul>
                  )}
                </AnimatePresence>

                {/* No results */}
                {!suggLoading && searchQuery.length >= 2 && suggestions.length === 0 && (
                  <p className="
                    border-t border-stone-100 dark:border-stone-800
                    mt-2 pt-4 pb-2
                    text-sm text-center text-stone-400 dark:text-stone-500
                  ">
                    &quot;{searchQuery}&quot; — কোনো পণ্য পাওয়া যায়নি
                  </p>
                )}

                {/* Keyboard hint */}
                {!searchQuery && (
                  <p className="mt-2 text-xs text-stone-400 dark:text-stone-600 text-center pb-1">
                    Enter চাপুন খুঁজতে &nbsp;·&nbsp; Esc চাপুন বন্ধ করতে
                  </p>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

/* ─────────────────────────────────────────────────────────
   Count Badge
───────────────────────────────────────────────────────── */
function CountBadge({ count, color }: { count: number; color: "green" | "rose" }) {
  return (
    <span
      className={`
        absolute -top-1 -right-1
        min-w-[18px] h-[18px] px-1
        flex items-center justify-center
        rounded-full text-[10px] font-bold
        ${color === "green"
          ? "bg-green-600 text-white"
          : "bg-rose-500 text-white"
        }
      `}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────
   User Avatar
───────────────────────────────────────────────────────── */
function UserAvatar({ session }: { session: Session }) {
  if (session.user?.image) {
    return (
      <img
        src={session.user.image}
        alt={session.user.name ?? "User"}
        className="
          w-8 h-8 rounded-full object-cover
          border-2 border-stone-200 dark:border-stone-700
          shrink-0
        "
      />
    );
  }

  const initials = (session.user?.name ?? "U")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      className="
        w-8 h-8 rounded-full shrink-0
        flex items-center justify-center
        bg-green-100 dark:bg-green-900/40
        text-green-700 dark:text-green-400
        text-xs font-bold
      "
    >
      {initials}
    </div>
  );
}