"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence }                   from "framer-motion";
import { useSession, signOut }         from "next-auth/react";
import { useRouter, usePathname }                    from "next/navigation";
import Link                                          from "next/link";
import axios                                         from "axios";
import { useDebounce }                               from "@/app/hooks/use-debounce";

/* ─────────────────────────────────────────────────────────
   Types
───────────────────────────────────────────────────────── */
interface ProductSuggestion {
  _id:       string;
  name:      string;
  price:     number;
  thumbnail?: string;   // fixed: was "image" — schema uses "thumbnail"
  category:  string;
  slug:      string;
}

interface CartCount {
  count: number;
}

/* ─────────────────────────────────────────────────────────
   Nav links
───────────────────────────────────────────────────────── */
const NAV_LINKS = [
  { label: "Home",      href: "/"          },
  { label: "Groceries", href: "/groceries" },
  { label: "Jewellery", href: "/jewellery" },
  { label: "Offers",    href: "/offers"    },
  { label: "About",     href: "/about"     },
] as const;

/* ─────────────────────────────────────────────────────────
   Navbar
───────────────────────────────────────────────────────── */
export default function Navbar() {
  const { data: session } = useSession();
  const router   = useRouter();
  const pathname = usePathname();

  const [scrolled,    setScrolled]    = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen,  setSearchOpen]  = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([]);
  const [suggLoading, setSuggLoading] = useState(false);
  const [cartCount,   setCartCount]   = useState(0);
  const [wishCount,   setWishCount]   = useState(0);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const profileRef     = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebounce(searchQuery, 350);

  /* Scroll shadow */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Close menus on route change */
  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  /* Close profile dropdown on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* Close search on Escape key */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSearchOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  /* Focus input when search opens / clear when closes */
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 80);
    } else {
      setSearchQuery("");
      setSuggestions([]);
    }
  }, [searchOpen]);

  /* Fetch suggestions */
  const fetchSuggestions = useCallback(async (q: string) => {
    if (!q || q.length < 2) { setSuggestions([]); return; }
    setSuggLoading(true);
    try {
      const { data } = await axios.get<{ products: ProductSuggestion[] }>(
        `/api/search/products?q=${encodeURIComponent(q)}&limit=5`
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

  /* Fetch cart + wishlist counts */
  useEffect(() => {
    if (!session) return;
    const fetchCounts = async () => {
      try {
        const [cartRes, wishRes] = await Promise.all([
          axios.get<CartCount>("/api/cart/count"),
          axios.get<CartCount>("/api/wishlist/count"),
        ]);
        setCartCount(cartRes.data.count ?? 0);
        setWishCount(wishRes.data.count ?? 0);
      } catch { /* silently ignore */ }
    };
    fetchCounts();
  }, [session]);

  /* Search submit */
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
    setSearchOpen(false);
  };

  /* "View all" button — doesn't receive a form event */
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

  return (
    <>
      <header className={`
        sticky top-0 z-50 w-full
        bg-white dark:bg-stone-900
        border-b border-stone-100 dark:border-stone-800
        transition-shadow duration-200
        ${scrolled ? "shadow-md dark:shadow-stone-950/50" : "shadow-none"}
      `}>

        {/* Announcement bar */}
        <div className="bg-green-700 dark:bg-green-900 text-white text-center text-xs py-1.5 px-4 font-medium tracking-wide">
          Free delivery on orders above ৳999 &nbsp;|&nbsp; Use code{" "}
          <span className="font-bold underline">FRESH10</span> for 10% off
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 shrink-0">
              <div className="w-9 h-9 rounded-xl bg-green-700 flex items-center justify-center text-white">
                <JowelIcon />
              </div>
              <span className="text-xl font-bold text-stone-900 dark:text-white tracking-tight hidden sm:block">
                Jowel<span className="text-green-700">Store</span>
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {NAV_LINKS.map(({ label, href }) => (
                <Link key={href} href={href} className={`
                  px-3.5 py-2 rounded-lg text-sm font-medium transition-colors duration-150
                  ${pathname === href
                    ? "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                    : "text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-white"
                  }
                `}>
                  {label}
                </Link>
              ))}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-1.5 sm:gap-2">

              {/* Search */}
              <button
                onClick={() => setSearchOpen(true)}
                aria-label="Search products"
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors duration-150"
              >
                <SearchIcon size={16} />
                <span className="hidden sm:block text-sm text-stone-400 dark:text-stone-500 w-28 text-left">
                  Search...
                </span>
              </button>

              {/* Wishlist */}
              {session && (
                <Link href="/wishlist" aria-label="Wishlist"
                  className="relative p-2 rounded-xl text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-rose-500 transition-colors duration-150">
                  <HeartIcon />
                  {wishCount > 0 && <Badge count={wishCount} color="rose" />}
                </Link>
              )}

              {/* Cart */}
              <Link href="/cart" aria-label="Cart"
                className="relative p-2 rounded-xl text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-green-700 transition-colors duration-150">
                <CartIcon />
                {cartCount > 0 && <Badge count={cartCount} color="green" />}
              </Link>

              {/* Auth — desktop */}
              {session ? (
                <div ref={profileRef} className="relative hidden sm:block">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors duration-150"
                  >
                    <Avatar session={session} />
                    <span className="text-sm font-medium text-stone-700 dark:text-stone-200 max-w-[80px] truncate">
                      {session.user?.name?.split(" ")[0]}
                    </span>
                    <ChevronIcon open={profileOpen} />
                  </button>

                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{    opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="absolute right-0 mt-2 w-52 bg-white dark:bg-stone-900 rounded-xl shadow-lg dark:shadow-stone-950/60 border border-stone-100 dark:border-stone-800 py-1.5 overflow-hidden"
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
                            <span className="inline-flex mt-1.5 items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400">
                              Admin
                            </span>
                          )}
                        </div>

                        {/* Dropdown links */}
                        {([
                          { label: "My Profile", href: "/profile",   icon: <UserIcon />  },
                          { label: "My Orders",  href: "/orders",    icon: <OrderIcon /> },
                          { label: "Wishlist",   href: "/wishlist",  icon: <HeartIcon /> },
                          ...(session.user?.role === "admin"
                            ? [{ label: "Dashboard", href: "/dashboard", icon: <DashIcon /> }]
                            : []
                          ),
                        ] as { label: string; href: string; icon: React.ReactNode }[]).map(({ label, href, icon }) => (
                          <Link key={href} href={href}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-white transition-colors">
                            <span className="text-stone-400 dark:text-stone-500">{icon}</span>
                            {label}
                          </Link>
                        ))}

                        <div className="border-t border-stone-100 dark:border-stone-800 mt-1 pt-1">
                          <button
                            onClick={() => signOut({ callbackUrl: "/" })}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                          >
                            <LogoutIcon />
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Link href="/login"
                    className="px-4 py-2 text-sm font-medium text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white transition-colors">
                    Sign In
                  </Link>
                  <Link href="/register"
                    className="px-4 py-2 text-sm font-semibold text-white bg-green-700 hover:bg-green-800 rounded-xl transition-colors">
                    Register
                  </Link>
                </div>
              )}

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle menu"
                className="lg:hidden p-2 rounded-xl text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              >
                <HamburgerIcon open={mobileOpen} />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{    height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="lg:hidden overflow-hidden border-t border-stone-100 dark:border-stone-800 bg-white dark:bg-stone-900"
            >
              <div className="px-4 py-4 space-y-1">
                {NAV_LINKS.map(({ label, href }) => (
                  <Link key={href} href={href} className={`
                    flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-colors
                    ${pathname === href
                      ? "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                      : "text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800"
                    }
                  `}>
                    {label}
                  </Link>
                ))}

                <div className="pt-3 border-t border-stone-100 dark:border-stone-800 mt-3">
                  {session ? (
                    <div className="space-y-1">
                      <div className="flex items-center gap-3 px-4 py-3">
                        <Avatar session={session} />
                        <div>
                          <p className="text-sm font-semibold text-stone-900 dark:text-white">
                            {session.user?.name}
                          </p>
                          <p className="text-xs text-stone-400 dark:text-stone-500">
                            {session.user?.email}
                          </p>
                        </div>
                      </div>
                      {[
                        { label: "My Profile", href: "/profile"  },
                        { label: "My Orders",  href: "/orders"   },
                        { label: "Wishlist",   href: "/wishlist" },
                      ].map(({ label, href }) => (
                        <Link key={href} href={href}
                          className="flex items-center px-4 py-2.5 rounded-xl text-sm text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors">
                          {label}
                        </Link>
                      ))}
                      <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="w-full text-left px-4 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                      >
                        Sign Out
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 px-1">
                      <Link href="/login"
                        className="px-4 py-3 text-sm font-medium text-center rounded-xl border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors">
                        Sign In
                      </Link>
                      <Link href="/register"
                        className="px-4 py-3 text-sm font-semibold text-center rounded-xl bg-green-700 text-white hover:bg-green-800 transition-colors">
                        Create Account
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Search overlay */}
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
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{    opacity: 0, y: -20 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] as const }}
              className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-stone-900 shadow-2xl"
            >
              <div className="max-w-3xl mx-auto px-4 py-4">

                {/* Search input row */}
                <form onSubmit={handleSearchSubmit} className="flex items-center gap-3">
                  <SearchIcon size={20} className="text-stone-400 shrink-0" />
                  <input
                    ref={searchInputRef}
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search groceries, jewellery, products..."
                    className="flex-1 py-3 text-base bg-transparent text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-500 outline-none"
                  />
                  {suggLoading && (
                    <span className="w-4 h-4 rounded-full border-2 border-stone-200 border-t-green-600 animate-spin shrink-0" />
                  )}
                  <button
                    type="button"
                    onClick={() => setSearchOpen(false)}
                    className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors shrink-0"
                  >
                    <CloseIcon />
                  </button>
                </form>

                {/* Suggestions list */}
                <AnimatePresence>
                  {suggestions.length > 0 && (
                    <motion.ul
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{    opacity: 0 }}
                      className="border-t border-stone-100 dark:border-stone-800 mt-2 pt-2 space-y-0.5"
                    >
                      {suggestions.map((p) => (
                        <li key={p._id}>
                          <button
                            type="button"
                            onClick={() => handleSuggestionClick(p.slug)}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors text-left group"
                          >
                            {/* Thumbnail */}
                            <div className="w-10 h-10 rounded-lg bg-stone-100 dark:bg-stone-800 shrink-0 overflow-hidden">
                              {p.thumbnail ? (
                                <img
                                  src={p.thumbnail}
                                  alt={p.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-stone-300 dark:text-stone-600">
                                  <ImageIcon />
                                </div>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-stone-800 dark:text-stone-200 truncate group-hover:text-green-700 dark:group-hover:text-green-400 transition-colors">
                                {p.name}
                              </p>
                              <p className="text-xs text-stone-400 dark:text-stone-500 capitalize">
                                {p.category}
                              </p>
                            </div>

                            <p className="text-sm font-semibold text-green-700 dark:text-green-400 shrink-0">
                              ৳{p.price.toLocaleString()}
                            </p>
                          </button>
                        </li>
                      ))}

                      {/* View all — fixed: no longer "as any" */}
                      <li className="pt-1 border-t border-stone-100 dark:border-stone-800">
                        <button
                          type="button"
                          onClick={handleViewAll}
                          className="w-full px-3 py-2.5 text-sm text-center font-medium text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-xl transition-colors"
                        >
                          View all results for &quot;{searchQuery}&quot; →
                        </button>
                      </li>
                    </motion.ul>
                  )}
                </AnimatePresence>

                {/* No results */}
                {!suggLoading && searchQuery.length >= 2 && suggestions.length === 0 && (
                  <p className="border-t border-stone-100 dark:border-stone-800 mt-2 pt-4 pb-2 text-sm text-center text-stone-400 dark:text-stone-500">
                    No products found for &quot;{searchQuery}&quot;
                  </p>
                )}

                {/* Keyboard hint */}
                {!searchQuery && (
                  <p className="mt-2 text-xs text-stone-400 dark:text-stone-600 text-center pb-1">
                    Press Enter to search &nbsp;·&nbsp; Esc to close
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
   Badge
───────────────────────────────────────────────────────── */
function Badge({ count, color }: { count: number; color: "green" | "rose" }) {
  const cls = color === "green" ? "bg-green-600 text-white" : "bg-rose-500 text-white";
  return (
    <span className={`
      absolute -top-1 -right-1
      min-w-[18px] h-[18px]
      flex items-center justify-center
      rounded-full text-[10px] font-bold px-1
      ${cls}
    `}>
      {count > 99 ? "99+" : count}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────
   Avatar — properly typed with next-auth Session
───────────────────────────────────────────────────────── */
function Avatar({ session }: { session: Session }) {
  if (session.user?.image) {
    return (
      <img
        src={session.user.image}
        alt={session.user.name ?? "User"}
        className="w-8 h-8 rounded-full object-cover border-2 border-stone-200 dark:border-stone-700"
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
    <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center text-green-700 dark:text-green-400 text-xs font-bold shrink-0">
      {initials}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Icons
───────────────────────────────────────────────────────── */
function JowelIcon() {
  return (
    <svg viewBox="0 0 40 40" fill="none" className="w-5 h-5">
      <path d="M20 4L36 12V28L20 36L4 28V12L20 4Z" fill="white" opacity=".2"/>
      <path d="M20 4L36 12V28L20 36L4 28V12L20 4Z" stroke="white" strokeWidth="1.5"/>
      <circle cx="20" cy="20" r="5" fill="white"/>
    </svg>
  );
}

function SearchIcon({ size = 18, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round"
      className={className} aria-hidden="true">
      <circle cx="11" cy="11" r="8"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  );
}

function CartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <path d="M16 10a4 4 0 0 1-8 0"/>
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  );
}

function OrderIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
      <polyline points="10 9 9 9 8 9"/>
    </svg>
  );
}

function DashIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="3"  y="3"  width="7" height="7"/>
      <rect x="14" y="3"  width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/>
      <rect x="3"  y="14" width="7" height="7"/>
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <line x1="18" y1="6"  x2="6"  y2="18"/>
      <line x1="6"  y1="6"  x2="18" y2="18"/>
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
      className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
      aria-hidden="true">
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  );
}

function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      {open ? (
        <>
          <line x1="18" y1="6"  x2="6"  y2="18"/>
          <line x1="6"  y1="6"  x2="18" y2="18"/>
        </>
      ) : (
        <>
          <line x1="3" y1="6"  x2="21" y2="6"/>
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="3" y1="18" x2="21" y2="18"/>
        </>
      )}
    </svg>
  );
}

function ImageIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <circle cx="8.5" cy="8.5" r="1.5"/>
      <polyline points="21 15 16 10 5 21"/>
    </svg>
  );
}