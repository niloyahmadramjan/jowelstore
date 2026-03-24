"use client";

import { useState, useCallback } from "react";
import axios                      from "axios";
import { useSession }             from "next-auth/react";
import { useRouter }              from "next/navigation";

interface UseWishlistReturn {
  toggle:      (productId: string) => Promise<boolean | null>;
  remove:      (productId: string) => Promise<void>;
  isWishlisted:(productId: string) => boolean;
  setIds:      React.Dispatch<React.SetStateAction<Set<string>>>;
  wishlisted:  Set<string>;
  loading:     boolean;
}

export function useWishlist(initialIds: string[] = []): UseWishlistReturn {
  const { data: session } = useSession();
  const router            = useRouter();

  const [wishlisted, setIds] = useState<Set<string>>(new Set(initialIds));
  const [loading,    setLoading] = useState(false);

  const requireAuth = (): boolean => {
    if (!session) { router.push("/login"); return false; }
    return true;
  };

  /* Toggle — returns true=added, false=removed, null=error */
  const toggle = useCallback(async (productId: string): Promise<boolean | null> => {
    if (!requireAuth()) return null;
    setLoading(true);

    /* Optimistic update */
    const wasIn = wishlisted.has(productId);
    setIds((prev) => {
      const next = new Set(prev);
      wasIn ? next.delete(productId) : next.add(productId);
      return next;
    });

    try {
      const { data } = await axios.post<{ wishlisted: boolean; count: number }>(
        "/api/wishlist",
        { productId },
      );
      window.dispatchEvent(new Event("wishlist:updated"));
      return data.wishlisted;
    } catch {
      /* Rollback on error */
      setIds((prev) => {
        const next = new Set(prev);
        wasIn ? next.add(productId) : next.delete(productId);
        return next;
      });
      return null;
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, wishlisted]);

  const remove = useCallback(async (productId: string): Promise<void> => {
    if (!requireAuth()) return;
    setLoading(true);
    try {
      await axios.delete(`/api/wishlist?productId=${productId}`);
      setIds((prev) => { const next = new Set(prev); next.delete(productId); return next; });
      window.dispatchEvent(new Event("wishlist:updated"));
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const isWishlisted = useCallback(
    (productId: string) => wishlisted.has(productId),
    [wishlisted],
  );

  return { toggle, remove, isWishlisted, setIds, wishlisted, loading };
}