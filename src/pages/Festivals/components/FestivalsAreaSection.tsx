import { ROUTE_PATH } from '@/constants/routes';
import { useEffect } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { FestivalsSectionSkeleton } from '@/pages/Festivals/components/FestivalCardSkeleton';
import getFestivals from '@/apis/festivals/getFestivals';
import FestivalsSection from '@/pages/Festivals/components/FestivalsSection';
import { generatePath, Link, useParams, useSearchParams } from 'react-router-dom';
import useIntersectionObserver from '@/hooks/useIntersectionObserver';
import LoadingSpinner from '@/components/loading/LoadingSpinner';
import MAP_PINS from '@/constants/mapPins';
import FestivalFilters from '@/components/festival/FestivalFilters';
import Button from '@/components/common/Button';
import {
  festivalFiltersFromParams,
  hasFestivalDateFilter,
  matchesFestivalFilters,
  updateFestivalFilterParams,
} from '@/utils/festivalFilters';

const FestivalsAreaSection = () => {
  const { areaId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = festivalFiltersFromParams(searchParams, true);
  const showCurrent = filters.currentOnly;
  const dateFilterActive = hasFestivalDateFilter(filters);

  const {
    data,
    isPending,
    isError,
    refetch,
    isFetching,
    hasNextPage,
    fetchNextPage,
    isFetchNextPageError,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['festivals', areaId, showCurrent],
    queryFn: ({ pageParam = 0 }) =>
      getFestivals({ areaId: areaId || '', size: 6, page: pageParam, current: showCurrent }),
    getNextPageParam: (lastPage, allPages) =>
      lastPage.data.last === false ? allPages.length : undefined,
    initialPageParam: 0,
    retry: false, // Preserve loaded content and wait for an explicit retry.
    throwOnError: false,
  });

  useEffect(() => {
    if (dateFilterActive && hasNextPage && !isFetching && !isFetchNextPageError)
      void fetchNextPage();
  }, [dateFilterActive, hasNextPage, isFetching, isFetchNextPageError, fetchNextPage]);

  const { ref: observerRef } = useIntersectionObserver(() => {
    if (isFetching || !hasNextPage || dateFilterActive || isFetchNextPageError) return;
    void fetchNextPage();
  });

  const loadedFestivals = data?.pages.flatMap((page) => page.data.content) ?? [];
  // Current is already applied by the existing backend query; only dates are filtered locally.
  const festivals = loadedFestivals.filter((festival) =>
    matchesFestivalFilters(festival, { ...filters, currentOnly: false }),
  );
  const scanning = !!data && dateFilterActive && (hasNextPage || isFetching);
  const areaName = MAP_PINS.find((pin) => pin.areaId === areaId)?.name ?? '지역';
  const total = data?.pages[0]?.data.totalElements ?? loadedFestivals.length;
  const initialError = isError && !data;

  return (
    <div className="festival-area-section">
      <nav className="festival-region-links" aria-label="축제 지역">
        {MAP_PINS.filter((pin) => pin.areaId !== '0').map((pin) => (
          <Link
            key={pin.id}
            aria-current={pin.areaId === areaId ? 'page' : undefined}
            to={{
              pathname: generatePath(ROUTE_PATH.FESTIVALS, { areaId: pin.areaId }),
              search: searchParams.toString() ? '?' + searchParams.toString() : '',
            }}
          >
            {pin.name}
          </Link>
        ))}
      </nav>
      <FestivalFilters
        value={filters}
        onChange={(value) =>
          setSearchParams((previous) => updateFestivalFilterParams(previous, value), {
            replace: true,
          })
        }
        onReset={() =>
          setSearchParams((previous) => updateFestivalFilterParams(previous, null), {
            replace: true,
          })
        }
      />
      {data && (
        <p className="ui-caption">
          전체 {total}개 중 {loadedFestivals.length}개 불러옴
          {dateFilterActive ? ` · 조건에 맞는 축제 ${festivals.length}개` : ''}
        </p>
      )}
      {scanning && !isFetchNextPageError && (
        <p className="ui-feedback ui-body" role="status">
          선택한 기간에 맞는 나머지 축제를 확인하고 있어요. 현재 {festivals.length}개를 찾았어요.
        </p>
      )}
      {isPending ? (
        <div role="status" aria-label="지역 축제를 불러오는 중">
          <p className="ui-caption mb-4">지역 축제를 불러오는 중...</p>
          <FestivalsSectionSkeleton count={3} />
        </div>
      ) : initialError ? (
        <div className="ui-feedback festival-page-feedback" role="alert">
          <p className="ui-body">
            지역 축제를 불러오지 못했습니다. 선택한 조건으로 다시 시도해 주세요.
          </p>
          <Button variant="secondary" disabled={isFetching} onClick={() => refetch()}>
            지역 축제 다시 불러오기
          </Button>
        </div>
      ) : (
        <FestivalsSection
          title={`${areaName}의 축제`}
          data={festivals}
          showEmpty={!scanning && !hasNextPage && !isFetchNextPageError}
          emptyTitle={dateFilterActive ? '선택한 조건에 맞는 축제가 없습니다.' : undefined}
          emptyDescription={
            dateFilterActive ? '날짜나 진행 중 조건을 바꾸어 다시 찾아보세요.' : undefined
          }
        />
      )}
      {isFetchNextPageError && (
        <div className="ui-feedback festival-page-feedback">
          <p className="ui-body">
            일부 축제를 불러오지 못했습니다. 현재 불러온 결과를 보여드립니다.
          </p>
          <Button variant="secondary" disabled={isFetchingNextPage} onClick={() => fetchNextPage()}>
            나머지 결과 다시 불러오기
          </Button>
        </div>
      )}
      {hasNextPage && !dateFilterActive && !isFetchNextPageError && (
        <>
          <div ref={observerRef} className="h-1" />
          <Button
            variant="secondary"
            fullWidth
            disabled={isFetching}
            onClick={() => fetchNextPage()}
          >
            {isFetchingNextPage ? '더 불러오는 중...' : '축제 더 보기'}
          </Button>
        </>
      )}
      {isFetching && !!data && <LoadingSpinner className="mt-4" message="축제를 불러오는 중..." />}
    </div>
  );
};
export default FestivalsAreaSection;
