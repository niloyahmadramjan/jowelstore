export function ProductCardSkeleton() {
  return (
    <div className="
      flex flex-col rounded-2xl overflow-hidden
      bg-white dark:bg-stone-900
      border border-stone-100 dark:border-stone-800
      animate-pulse
    ">
      {/* Image placeholder */}
      <div className="aspect-square bg-stone-200 dark:bg-stone-800" />

      {/* Text placeholders */}
      <div className="p-3 space-y-2.5">
        <div className="h-2.5 w-16 rounded-full bg-stone-200 dark:bg-stone-700" />
        <div className="h-3.5 w-full rounded-full bg-stone-200 dark:bg-stone-700" />
        <div className="h-3.5 w-3/4  rounded-full bg-stone-200 dark:bg-stone-700" />
        <div className="h-3   w-24   rounded-full bg-stone-200 dark:bg-stone-700" />
        <div className="h-4   w-20   rounded-full bg-stone-200 dark:bg-stone-700" />
        <div className="h-8   w-full rounded-xl  bg-stone-200 dark:bg-stone-700" />
      </div>
    </div>
  );
}

/* Grid of skeletons — used during initial load */
export function ProductGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="
      grid gap-3 sm:gap-4
      grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6
    ">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}