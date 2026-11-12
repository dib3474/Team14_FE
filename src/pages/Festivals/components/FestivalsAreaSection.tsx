import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import getFestivals from '@/apis/festivals/getFestivals';
import FestivalsSection from '@/pages/Festivals/components/FestivalsSection';
import { useParams, useSearchParams } from 'react-router-dom';
import useIntersectionObserver from '@/hooks/useIntersectionObserver';
import LoadingSpinner from '@/components/loading/LoadingSpinner';
import MAP_PINS from '@/constants/mapPins';

const FestivalsAreaSection = () => {
  const { areaId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const showCurrent = (searchParams.get('current') ?? 'true') === 'true';
  const handleCurrentFilter = () => {
    setSearchParams(
      (prev) => {
        const current = (prev.get('current') ?? 'true') === 'true' ? 'false' : 'true';
        prev.set('current', current);
        return prev;
      },
      { replace: true },
    );
  };

  const { data, isFetching, hasNextPage, fetchNextPage } = useSuspenseInfiniteQuery({
    queryKey: ['festivals', areaId, showCurrent],
    queryFn: ({ pageParam = 0 }) =>
      getFestivals({
        areaId: areaId || '',
        size: 6,
        page: pageParam,
        current: showCurrent,
      }),
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.data.last ? undefined : allPages.length;
    },
    initialPageParam: 0,
  });

  const { ref: observerRef } = useIntersectionObserver(() => {
    if (isFetching || !hasNextPage) return;
    fetchNextPage();
  });

  const festivals = data?.pages.flatMap((page) => page.data.content) || [];

  const area = MAP_PINS.find((pin) => pin.areaId === areaId);
  const areaName = area?.name ?? '지역';

  return (
    <div className="w-full h-full">
      <FestivalsSection
        title={`${areaName}의 축제`}
        data={festivals}
        rightAction={
          <div className="festival-filter">
            <span className="text-sm text-gray-800">진행 중</span>
            <button
              type="button"
              role="switch"
              aria-label="진행 중인 축제만 보기"
              aria-checked={showCurrent}
              onClick={handleCurrentFilter}
              className="festival-filter-switch"
            >
              <span className="festival-filter-thumb" />
            </button>
          </div>
        }
      />
      {hasNextPage && <div ref={observerRef} className="h-1" />}
      {isFetching && <LoadingSpinner className="mt-8" />}
    </div>
  );
};

export default FestivalsAreaSection;
