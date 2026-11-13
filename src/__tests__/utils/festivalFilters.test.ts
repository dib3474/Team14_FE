import {
  getFestivalFilterError,
  matchesFestivalFilters,
  parseFestivalDate,
} from '@/utils/festivalFilters';

const empty = { startDate: '', endDate: '', currentOnly: false };
const interval = { startDate: '2026-11-10', endDate: '2026-11-20' };

test.each([
  ['2026-11-20', '2026-11-30', true],
  ['2026-11-01', '2026-11-10', true],
  ['2026-11-21', '', false],
  ['', '2026-11-09', false],
  ['', '2026-11-10', true],
])(
  '축제 일정은 선택한 날짜 구간 %s ~ %s와 양 끝을 포함해 겹치는지 확인한다',
  (startDate, endDate, expected) => {
    expect(matchesFestivalFilters(interval, { ...empty, startDate, endDate })).toBe(expected);
  },
);

test('현재 진행 조건은 현지 날짜의 시작일과 종료일을 포함하고 예정 축제를 제외한다', () => {
  expect(
    matchesFestivalFilters(interval, { ...empty, currentOnly: true }, new Date(2026, 10, 10, 0)),
  ).toBe(true);
  expect(
    matchesFestivalFilters(
      interval,
      { ...empty, currentOnly: true },
      new Date(2026, 10, 20, 23, 59),
    ),
  ).toBe(true);
  expect(
    matchesFestivalFilters(
      interval,
      { ...empty, currentOnly: true },
      new Date(2026, 10, 9, 23, 59),
    ),
  ).toBe(false);
});

test('활성 필터는 유효하지 않은 축제 날짜를 제외하고 잘못된 필터 구간은 날짜 조건만 적용하지 않는다', () => {
  expect(parseFestivalDate('2026-02-30')).toBeNull();
  expect(parseFestivalDate('2026-2-01')).toBeNull();
  expect(
    matchesFestivalFilters(
      { startDate: 'invalid', endDate: '2026-11-20' },
      { ...empty, startDate: '2026-11-01' },
    ),
  ).toBe(false);
  expect(
    getFestivalFilterError({ ...empty, startDate: '2026-12-01', endDate: '2026-11-01' }),
  ).toBeTruthy();
  expect(
    matchesFestivalFilters(interval, { ...empty, startDate: '2026-12-01', endDate: '2026-11-01' }),
  ).toBe(true);
});
