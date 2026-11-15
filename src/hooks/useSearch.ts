import { useState } from 'react';
import useDebounce from '@/hooks/useDebounce';
import { useInfiniteQuery } from '@tanstack/react-query';
import { searchFestivals } from '@/apis/search/searchFestivals';

/** Debounced search keeps loaded pages separate from the server's total result count. */
const useSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebounce(searchQuery, 250);
  const canShowResults = debouncedQuery.length >= 1;
  const {
    data,
    isLoading,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetching,
    isFetchNextPageError,
  } = useInfiniteQuery({
    queryKey: ['search', debouncedQuery, 'pages'],
    queryFn: ({ pageParam }) => searchFestivals({ keyword: debouncedQuery, page: pageParam }),
    initialPageParam: 0,
    retry: false, // Extra-page failures wait for the visible retry action.
    getNextPageParam: (lastPage, allPages) =>
      lastPage.data.last === false ? allPages.length : undefined,
    enabled: canShowResults,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
  const searchResults = data?.pages.flatMap((page) => page.data.content) || [];
  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    totalResults: data?.pages[0]?.data.totalElements ?? searchResults.length,
    isLoading,
    error,
    canShowResults,
    debouncedQuery,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetching,
    isFetchNextPageError,
  };
};
export default useSearch;
