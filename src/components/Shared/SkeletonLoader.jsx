const Bone = ({ className = '' }) => (
  <div className={`animate-skeleton rounded-lg ${className}`} />
);

/* Named aliases used by BannerCarousel and CuisineChips */
export const SkeletonBanner = () => (
  <Bone className="w-full rounded-2xl" style={{ aspectRatio: '16/5' }} />
);

export const SkeletonCuisines = () => (
  <div className="flex gap-5 overflow-hidden pb-2">
    {Array.from({ length: 8 }).map((_, i) => (
      <div key={i} className="flex-shrink-0 flex flex-col items-center gap-2">
        <Bone className="w-16 h-16 md:w-20 md:h-20 rounded-full" />
        <Bone className="h-3 w-14" />
      </div>
    ))}
  </div>
);

/* Legacy aliases kept for backward compat */
export const BannerSkeleton = SkeletonBanner;
export const CuisineChipsSkeleton = SkeletonCuisines;

export const HorizontalCardSkeleton = () => (
  <div className="flex gap-4 overflow-hidden pb-1">
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="flex-shrink-0 w-52 space-y-2">
        <Bone className="h-40 w-full rounded-xl" />
        <Bone className="h-4 w-3/4" />
        <Bone className="h-3 w-1/2" />
        <Bone className="h-3 w-1/3" />
      </div>
    ))}
  </div>
);

export const RestaurantGridSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="bg-surface rounded-xl overflow-hidden border border-surface-container">
        <Bone className="h-[200px] w-full rounded-none" />
        <div className="p-4 space-y-2">
          <div className="flex justify-between">
            <Bone className="h-4 w-36" />
            <Bone className="h-5 w-10 rounded" />
          </div>
          <Bone className="h-3 w-28" />
          <div className="flex gap-4 pt-2 border-t border-surface-container mt-2">
            <Bone className="h-3 w-20" />
            <Bone className="h-3 w-20" />
          </div>
        </div>
      </div>
    ))}
  </div>
);
