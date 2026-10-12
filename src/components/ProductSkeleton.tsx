/** Loading placeholders shown while the catalog chunk / data is in flight. */

export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-3xl overflow-hidden border-2 border-[#0f2f52]/10 animate-pulse">
      <div className="aspect-square bg-[#e7eff8]" />
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-4 w-24 rounded-full bg-[#e7eff8]" />
          <div className="h-4 w-10 rounded-full bg-[#e7eff8]" />
        </div>
        <div className="h-4 w-3/4 rounded-full bg-[#e7eff8]" />
        <div className="h-4 w-1/2 rounded-full bg-[#e7eff8]" />
        <div className="h-10 w-full rounded-full bg-[#e7eff8] mt-2" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5"
      aria-hidden="true"
    >
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

/** Full-catalog Suspense fallback: featured row + shop grid. */
export function CatalogSkeleton() {
  return (
    <section
      className="bg-[#f5f9fe] pt-10 md:pt-14 pb-12 md:pb-20"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">جارٍ تحميل المنتجات…</span>
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="h-7 w-56 rounded-full bg-[#e7eff8] animate-pulse mb-6" />
        <ProductGridSkeleton count={4} />
        <div className="h-9 w-72 rounded-full bg-[#e7eff8] animate-pulse mt-12 mb-6" />
        <ProductGridSkeleton count={8} />
      </div>
    </section>
  );
}
