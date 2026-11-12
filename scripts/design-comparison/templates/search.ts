import { useEffect } from 'react';
import original from '/src/hooks/useSearch';
export default function useComparisonSearch() {
  const result = original();
  const keyword = new URLSearchParams(location.search).get('q');
  useEffect(() => {
    if (keyword) result.setSearchQuery(keyword);
  }, [keyword]);
  return result;
}
