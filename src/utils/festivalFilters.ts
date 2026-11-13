/** Shared UI filters. Date bounds include both ends and match overlapping festival intervals. */
export interface FestivalFilterValue {
  startDate: string;
  endDate: string;
  currentOnly: boolean;
}

/** Parse strict local YYYY-MM-DD; malformed dates and calendar rollover are invalid. */
export const parseFestivalDate = (value: string): number | null => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split('-').map(Number);
  if (year < 1) return null;
  const date = new Date(0);
  date.setHours(0, 0, 0, 0);
  date.setFullYear(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day)
    return null;
  return date.getTime();
};

export const hasFestivalDateFilter = (value: FestivalFilterValue): boolean =>
  !!(value.startDate || value.endDate);

export const getFestivalFilterError = (value: FestivalFilterValue): string | null => {
  const start = value.startDate ? parseFestivalDate(value.startDate) : null;
  const end = value.endDate ? parseFestivalDate(value.endDate) : null;
  if ((value.startDate && start === null) || (value.endDate && end === null))
    return '날짜를 YYYY-MM-DD 형식의 유효한 날짜로 선택해 주세요.';
  if (start !== null && end !== null && start > end) return '시작일은 종료일보다 늦을 수 없습니다.';
  return null;
};

/** Invalid filter ranges skip only date filtering; the visible controls explain this fallback. */
export const matchesFestivalFilters = (
  festival: { startDate: string; endDate: string },
  value: FestivalFilterValue,
  now = new Date(),
): boolean => {
  const datesActive = hasFestivalDateFilter(value) && !getFestivalFilterError(value);
  if (!datesActive && !value.currentOnly) return true;
  const start = parseFestivalDate(festival.startDate);
  const end = parseFestivalDate(festival.endDate);
  if (start === null || end === null || start > end) return false;
  if (value.currentOnly) {
    const today = new Date(now.getTime());
    today.setHours(0, 0, 0, 0);
    if (start > today.getTime() || end < today.getTime()) return false;
  }
  if (!datesActive) return true;
  const from = value.startDate ? parseFestivalDate(value.startDate) : null;
  const to = value.endDate ? parseFestivalDate(value.endDate) : null;
  return (from === null || end >= from) && (to === null || start <= to);
};

/** Search defaults current=false; Browse passes its existing default current=true. */
export const festivalFiltersFromParams = (
  params: URLSearchParams,
  defaultCurrent = false,
): FestivalFilterValue => ({
  startDate: params.get('startDate') || '',
  endDate: params.get('endDate') || '',
  currentOnly: params.has('current') ? params.get('current') === 'true' : defaultCurrent,
});

/** Keep every non-filter query parameter. Null resets only these three filter parameters. */
export const updateFestivalFilterParams = (
  params: URLSearchParams,
  value: FestivalFilterValue | null,
): URLSearchParams => {
  const next = new URLSearchParams(params);
  for (const key of ['startDate', 'endDate', 'current']) next.delete(key);
  if (value) {
    if (value.startDate) next.set('startDate', value.startDate);
    if (value.endDate) next.set('endDate', value.endDate);
    next.set('current', String(value.currentOnly));
  }
  return next;
};
