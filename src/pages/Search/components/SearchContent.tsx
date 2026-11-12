import SearchIcon from '@/components/icon/SearchIcon';
import FestivalCard from '@/pages/Festivals/components/FestivalCard';
import type { Festival } from '@/types/FestivalType';
import useSearch from '@/hooks/useSearch';
import LoadingSpinner from '@/components/loading/LoadingSpinner';
import ErrorComponent from '@/components/error/ErrorComponent';
import OutlineInputField from '@/components/form/OutlineInputField';
import '../search.css';

const SearchContent = () => {
  const { searchQuery, setSearchQuery, searchResults, isLoading, error, canShowResults, refetch } =
    useSearch();
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
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="찾으시는 축제가 있으신가요?"
            rounded="xl"
          />
          <span className="search-adornment" aria-hidden="true">
            <SearchIcon />
          </span>
        </div>
      </section>
      {error ? (
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
        <section aria-labelledby="search-result-title">
          <h2 id="search-result-title" className="ui-section-title mb-4">
            검색 결과 ({searchResults.length}개)
          </h2>
          {searchResults.length === 0 ? (
            <div className="ui-panel search-empty">
              <p className="ui-section-title">검색 결과가 없습니다.</p>
              <p className="ui-body text-ui-muted">
                입력한 단어를 확인하거나 다른 키워드로 찾아보세요.
              </p>
            </div>
          ) : (
            <div className="grid festival-grid">
              {searchResults.map((result: Festival) => (
                <FestivalCard key={result.id} data={result} />
              ))}
            </div>
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
export default SearchContent;
