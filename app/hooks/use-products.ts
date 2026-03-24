"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";

/* ── Types ─────────────────────────────────────────────── */
export interface ProductItem {
  _id:           string;
  name:          string;
  slug:          string;
  thumbnail:     string;
  price:         number;
  originalPrice?: number;
  discount?:     number;
  category:      string;
  subCategory?:  string;
  unit?:         string;
  stock:         number;
  sold:          number;
  rating:        number;
  numReviews:    number;
  isFeatured:    boolean;
  isNewArrival:  boolean;
}

interface UseProductsOptions {
  category?:    string;
  subCategory?: string;
  sort?:        string;
  search?:      string;
  featured?:    boolean;
  limit?:       number;
  enabled?:     boolean;  // set false to pause fetching
}

interface UseProductsReturn {
  products:    ProductItem[];
  isLoading:   boolean;
  isFetching:  boolean;  // loading more (not first load)
  hasMore:     boolean;
  error:       string | null;
  loadMore:    () => void;
  refresh:     () => void;
}

/* ── Hook ──────────────────────────────────────────────── */
export function useProducts(opts: UseProductsOptions = {}): UseProductsReturn {
  const {
    category,
    subCategory,
    sort     = "newest",
    search,
    featured,
    limit    = 12,
    enabled  = true,
  } = opts;

  const [products,   setProducts]   = useState<ProductItem[]>([]);
  const [cursor,     setCursor]     = useState<string | null>(null);
  const [hasMore,    setHasMore]    = useState(true);
  const [isLoading,  setIsLoading]  = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  /* Prevent duplicate simultaneous fetches */
  const fetchingRef = useRef(false);

  /* Build query string */
  const buildParams = useCallback(
    (currentCursor: string | null) => {
      const params: Record<string, string> = { sort, limit: String(limit) };
      if (category)    params.category    = category;
      if (subCategory) params.subCategory = subCategory;
      if (search)      params.search      = search;
      if (featured)    params.featured    = "true";
      if (currentCursor) params.cursor   = currentCursor;
      return new URLSearchParams(params).toString();
    },
    [category, subCategory, sort, search, featured, limit],
  );

  /* Fetch a page ─────────────────────────────────────── */
  const fetchPage = useCallback(
    async (currentCursor: string | null, replace: boolean) => {
      if (fetchingRef.current) return;
      fetchingRef.current = true;

      replace ? setIsLoading(true) : setIsFetching(true);
      setError(null);

      try {
        const { data } = await axios.get<{
          products:   ProductItem[];
          nextCursor: string | null;
          hasMore:    boolean;
        }>(`/api/products?${buildParams(currentCursor)}`);

        setProducts((prev) =>
          replace ? data.products : [...prev, ...data.products],
        );
        setCursor(data.nextCursor);
        setHasMore(data.hasMore);
      } catch (err: any) {
        setError(err?.response?.data?.message ?? "Failed to load products");
      } finally {
        replace ? setIsLoading(false) : setIsFetching(false);
        fetchingRef.current = false;
      }
    },
    [buildParams],
  );

  /* Initial load / re-fetch when filters change ─────── */
  useEffect(() => {
    if (!enabled) return;
    setProducts([]);
    setCursor(null);
    setHasMore(true);
    fetchPage(null, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, subCategory, sort, search, featured, enabled]);

  /* Load next page */
  const loadMore = useCallback(() => {
    if (!hasMore || isLoading || isFetching) return;
    fetchPage(cursor, false);
  }, [cursor, hasMore, isLoading, isFetching, fetchPage]);

  /* Force full refresh */
  const refresh = useCallback(() => {
    setProducts([]);
    setCursor(null);
    setHasMore(true);
    fetchPage(null, true);
  }, [fetchPage]);

  return { products, isLoading, isFetching, hasMore, error, loadMore, refresh };
}