import { parseFestivalDate } from '@/utils/festivalFilters';

/** Local list status uses the same strict local-day boundaries as the filter. */
export const getListFestivalStatus = (startDate: string, endDate: string, now = new Date()) => {
  const start = parseFestivalDate(startDate);
  const end = parseFestivalDate(endDate);
  if (start === null || end === null || start > end) return 'unknown';
  const today = new Date(now.getTime());
  today.setHours(0, 0, 0, 0);
  if (today.getTime() < start) return 'upcoming';
  return today.getTime() > end ? 'ended' : 'ongoing';
};
