/* ─────────────────────────────────────────────────────────
   Shared search types
   Import from both page.tsx and search-results.tsx
   so TypeScript sees ONE type — not two unrelated ones.
───────────────────────────────────────────────────────── */

export interface Product {
  _id:            string;
  name:           string;
  slug:           string;
  price:          number;
  originalPrice?: number;
  discount?:      number;
  thumbnail?:     string;
  category:       string;
  stock:          number;
  sold?:          number;
  rating?:        number;
  numReviews?:    number;
  isNewArrival?:  boolean;
  isFeatured?:    boolean;
}

export interface SearchData {
  products:   Product[];
  total:      number;
  totalPages: number;
  hasMore:    boolean;
}