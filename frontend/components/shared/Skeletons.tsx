export function ProductCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="aspect-square skeleton" />
      <div className="p-4 space-y-2">
        <div className="h-3 skeleton w-16" />
        <div className="h-4 skeleton w-full" />
        <div className="h-4 skeleton w-3/4" />
        <div className="h-3 skeleton w-20" />
        <div className="h-6 skeleton w-24 mt-1" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function OrderCardSkeleton() {
  return (
    <div className="card p-5 space-y-3">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <div className="h-4 skeleton w-32" />
          <div className="h-3 skeleton w-24" />
        </div>
        <div className="h-6 skeleton w-20" />
      </div>
      <div className="h-px bg-slate-100 dark:bg-slate-700" />
      <div className="flex gap-3">
        <div className="w-16 h-16 skeleton rounded-xl" />
        <div className="flex-1 space-y-2">
          <div className="h-4 skeleton w-3/4" />
          <div className="h-3 skeleton w-1/2" />
        </div>
      </div>
    </div>
  );
}

export function DashboardStatSkeleton() {
  return (
    <div className="card p-6 space-y-3">
      <div className="flex items-center justify-between">
        <div className="h-4 skeleton w-24" />
        <div className="w-10 h-10 skeleton rounded-xl" />
      </div>
      <div className="h-8 skeleton w-32" />
      <div className="h-3 skeleton w-20" />
    </div>
  );
}
