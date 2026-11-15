import '../festivals.css';
import LoadingSkeleton from '@/components/loading/LoadingSkeleton';

/** Browse loading keeps the horizontal row geometry of the eventual list. */
export const FestivalCardSkeleton = () => (
  <div className="festival-row-skeleton">
    <LoadingSkeleton className="festival-skeleton-thumbnail" variant="rectangular" />
    <div className="min-w-0 flex-1 space-y-3">
      <LoadingSkeleton className="h-4 w-16" variant="rectangular" />
      <LoadingSkeleton className="h-5 w-full" variant="rectangular" />
      <LoadingSkeleton className="h-4 w-3/4" variant="rectangular" />
      <LoadingSkeleton className="h-4 w-1/2" variant="rectangular" />
    </div>
  </div>
);

export const FestivalsSectionSkeleton = ({ count = 6 }: { count?: number }) => (
  <section className="w-full">
    <div className="mb-6">
      <LoadingSkeleton className="h-8 w-32" variant="rectangular" />
    </div>
    <div className="festival-list">
      {Array.from({ length: count }).map((_, index) => (
        <FestivalCardSkeleton key={index} />
      ))}
    </div>
  </section>
);
