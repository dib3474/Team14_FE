import { useEffect } from 'react';
import useActualSearch from '../hooks/useSearch';
/** Opt-in mock examples only. The production search hook is never aliased in builds. */
const useMockSearch = () => {
  const result = useActualSearch();
  const keyword = new URLSearchParams(window.location.search).get('q');
  const setQuery = result.setSearchQuery;
  useEffect(() => {
    if (keyword) setQuery(keyword);
  }, [keyword, setQuery]);
  return result;
};
export default useMockSearch;
