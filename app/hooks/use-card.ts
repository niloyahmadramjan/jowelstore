"use client";

import { useState, useCallback } from "react";
import axios                      from "axios";
import { useSession }             from "next-auth/react";
import { useRouter }              from "next/navigation";

interface AddToCartParams {
  productId:     string;
  quantity?:     number;
  variantLabel?: string;
}

interface UseCartReturn {
  addToCart:    (params: AddToCartParams) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart:    () => Promise<void>;
  loading:      boolean;
  error:        string | null;
}

export function useCart(): UseCartReturn {
  const { data: session } = useSession();
  const router            = useRouter();
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const requireAuth = (): boolean => {
    if (!session) {
      router.push("/login");
      return false;
    }
    return true;
  };

  const addToCart = useCallback(async ({ productId, quantity = 1, variantLabel }: AddToCartParams) => {
    if (!requireAuth()) return;
    setLoading(true);
    setError(null);
    try {
      await axios.post("/api/cart", { productId, quantity, variantLabel });
      /* Dispatch custom event so Navbar badge refreshes */
      window.dispatchEvent(new Event("cart:updated"));
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.message ?? "Failed to add to cart"
        : "Failed to add to cart";
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const removeFromCart = useCallback(async (itemId: string) => {
    if (!requireAuth()) return;
    setLoading(true);
    try {
      await axios.delete(`/api/cart?itemId=${itemId}`);
      window.dispatchEvent(new Event("cart:updated"));
    } catch {
      setError("Failed to remove item");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    if (!requireAuth()) return;
    setLoading(true);
    try {
      await axios.patch("/api/cart", { itemId, quantity });
      window.dispatchEvent(new Event("cart:updated"));
    } catch {
      setError("Failed to update quantity");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const clearCart = useCallback(async () => {
    if (!requireAuth()) return;
    setLoading(true);
    try {
      await axios.delete("/api/cart?clear=true");
      window.dispatchEvent(new Event("cart:updated"));
    } catch {
      setError("Failed to clear cart");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  return { addToCart, removeFromCart, updateQuantity, clearCart, loading, error };
}