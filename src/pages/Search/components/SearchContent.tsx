import { useEffect, useState } from 'react';
import { useInRouterContext, useSearchParams } from 'react-router-dom';
import SearchIcon from '@/components/icon/SearchIcon';
import FestivalCard from '@/pages/Festivals/components/FestivalCard';
import useSearch from '@/hooks/useSearch';
import LoadingSpinner from '@/components/loading/LoadingSpinner';
import ErrorComponent from '@/components/error/ErrorComponent';
import OutlineInputField from '@/components/form/OutlineInputField';
import Button from '@/components/common/Button';
import FestivalFilters from '@/components/festival/FestivalFilters';
import {
  festivalFiltersFromParams,
  hasFestivalDateFilter,
  matchesFestivalFilters,
  updateFestivalFilterParams,
  type FestivalFilterValue,
} from '@/utils/festivalFilters';
import '../search.css';

const defaultFilters: FestivalFilterValue = { startDate: '', endDate: '', currentOnly: false };
interface SearchContentViewProps {
  filters: FestivalFilterValue;
  onFiltersChange: (value: FestivalFilterValue) => void;
  onFiltersReset: () => void;
}
const SearchContentView = ({
  filters,
  onFiltersChange,
  onFiltersReset,
}: SearchContentViewProps) => {
  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    isLoading,
    error,
    canShowResults,
    refetch,
    totalResults = searchResults.length,
    fetchNextPage,
    hasNextPage = false,
    isFetching = false,
    isFetchingNextPage = false,
    isFetchNextPageError = false,
  } = useSearch();
  const clientFiltersActive = hasFestivalDateFilter(filters) || filters.currentOnly;
  const matchingResults = searchResults.filter((festival) =>
    matchesFestivalFilters(festival, filters),
  );
  const scanning = clientFiltersActive && (hasNextPage || isFetching);

  useEffect(() => {
    if (
      canShowResults &&
      clientFiltersActive &&
      hasNextPage &&
      !isFetching &&
      !isFetchNextPageError
    ) {
      void fetchNextPage();
    }
  }, [
    canShowResults,
    clientFiltersActive,
    hasNextPage,
    isFetching,
    isFetchNextPageError,
    fetchNextPage,
  ]);

  return (
    <div className="ui-page search-page">
      <section className="search-intro" aria-labelledby="search-title">
        <p className="ui-eyebrow">지금 떠오른 그 축제</p>
        <h1 id="search-title" className="ui-title">
          어떤 축제를 찾으세요?
        </h1>
        <p className="ui-body text-ui-muted">축제 이름이나 관심 있는 키워드를 입력해보세요.</p>
        <div className="search-input-frame">
          <OutlineInputField
            type="search"
            name="festival-search"
            aria-label="축제 검색어"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="찾으시는 축제가 있으신가요?"
            rounded="xl"
          />
          <span className="search-adornment" aria-hidden="true">
            <SearchIcon />
          </span>
        </div>
      </section>
      <FestivalFilters value={filters} onChange={onFiltersChange} onReset={onFiltersReset} />
      {error && !isFetchNextPageError && searchResults.length === 0 ? (
        <div className="ui-panel">
          <ErrorComponent
            title="검색에 실패했습니다"
            message="다시 시도해주세요."
            onRetry={() => refetch()}
            showBackButton={false}
            className="h-full"
          />
        </div>
      ) : isLoading ? (
        <LoadingSpinner size="lg" className="min-h-[240px]" message="검색 중..." />
      ) : canShowResults ? (
        <section aria-labelledby="search-result-title" className="search-results">
          <h2 id="search-result-title" className="ui-section-title">
            검색 결과 ({matchingResults.length}개)
          </h2>
          <p className="ui-caption">
            전체 {totalResults}개 중 {searchResults.length}개 불러옴
          </p>
          {scanning && !isFetchNextPageError && (
            <p className="ui-feedback ui-body" role="status">
              조건에 맞는 나머지 축제를 확인하고 있어요. 현재 {matchingResults.length}개를 찾았어요.
            </p>
          )}
          {isFetchNextPageError && (
            <div className="ui-feedback">
              <p className="ui-body">
                일부 결과를 불러오지 못했습니다. 현재 불러온 결과를 보여드립니다.
              </p>
              <Button
                variant="secondary"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                나머지 결과 다시 불러오기
              </Button>
            </div>
          )}
          {matchingResults.length === 0 && !scanning && !hasNextPage && !isFetchNextPageError ? (
            <div className="ui-panel search-empty">
              <p className="ui-section-title">검색 결과가 없습니다.</p>
              <p className="ui-body text-ui-muted">
                입력한 단어나 필터 조건을 확인하고 다시 찾아보세요.
              </p>
            </div>
          ) : matchingResults.length > 0 ? (
            <div className="grid festival-grid">
              {matchingResults.map((result) => (
                <FestivalCard key={result.id} data={result} variant="poster" />
              ))}
            </div>
          ) : null}
          {!clientFiltersActive && hasNextPage && !isFetchNextPageError && (
            <Button
              variant="secondary"
              fullWidth
              disabled={isFetching}
              onClick={() => fetchNextPage()}
            >
              {isFetchingNextPage ? '더 불러오는 중...' : '결과 더 보기'}
            </Button>
          )}
        </section>
      ) : (
        <div className="ui-panel search-empty">
          <img src="/lost404.svg" alt="" />
          <p className="ui-section-title">새로운 즐거움을 찾아보세요</p>
          <p className="ui-body text-ui-muted">검색어를 입력하면 축제를 찾아드릴게요.</p>
        </div>
      )}
    </div>
  );
};

const RoutedSearchContent = () => {
  const [params, setParams] = useSearchParams();
  return (
    <SearchContentView
      filters={festivalFiltersFromParams(params)}
      onFiltersChange={(value) =>
        setParams((previous) => updateFestivalFilterParams(previous, value), { replace: true })
      }
      onFiltersReset={() =>
        setParams((previous) => updateFestivalFilterParams(previous, null), { replace: true })
      }
    />
  );
};
// Also keeps the standalone SearchContent contract used by component previews.
const StandaloneSearchContent = () => {
  const [filters, setFilters] = useState(defaultFilters);
  return (
    <SearchContentView
      filters={filters}
      onFiltersChange={setFilters}
      onFiltersReset={() => setFilters(defaultFilters)}
    />
  );
};
const SearchContent = () =>
  useInRouterContext() ? <RoutedSearchContent /> : <StandaloneSearchContent />;
export default SearchContent;
