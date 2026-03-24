import { useEffect, useRef, type RefObject } from "react";

export function useIntersection(
  onIntersect: () => void,
  options: IntersectionObserverInit = { threshold: 0.1, rootMargin: "200px" },
): RefObject<HTMLDivElement | null> {  // ← null যোগ করো
  const ref         = useRef<HTMLDivElement>(null);
  const callbackRef = useRef(onIntersect);

  useEffect(() => {
    callbackRef.current = onIntersect;
  }, [onIntersect]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) callbackRef.current();
    }, options);

    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return ref;
}

