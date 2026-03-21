import { useEffect, useState } from "react";

/**
 * Delays updating the returned value until after
 * the specified delay has passed without changes.
 *
 * Usage:
 *   const debounced = useDebounce(searchQuery, 400);
 */
export function useDebounce<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}