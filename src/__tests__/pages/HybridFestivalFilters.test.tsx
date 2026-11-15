import { Suspense } from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { ErrorBoundary } from 'react-error-boundary';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { server } from '@/mocks/server';
import SearchContent from '@/pages/Search/components/SearchContent';
import FestivalsAreaSection from '@/pages/Festivals/components/FestivalsAreaSection';
import type { Festival } from '@/types/FestivalType';

const festival = (id: number, startDate: string, endDate: string): Festival => ({
  id,
  managerId: null,
  title: `샘플 축제 ${id}`,
  startDate,
  endDate,
  addr1: '서울특별시 종로구 사직로 161',
  addr2: '',
  posterInfo: '/poster.jpg',
  averageScore: 4,
  wishCount: 2,
});
const first = festival(1, '2026-01-01', '2026-01-02');
const later = festival(2, '2026-11-10', '2026-11-20');
const page = (content: Festival[], number: number, last: boolean | undefined = true) => ({
  content,
  last,
  totalElements: 2,
  totalPages: 2,
  number,
  size: 1,
  first: number === 0,
  numberOfElements: content.length,
  pageable: {
    pageNumber: number,
    pageSize: 1,
    offset: number,
    paged: true,
    unpaged: false,
    sort: { empty: true, sorted: false, unsorted: true },
  },
  sort: { empty: true, sorted: false, unsorted: true },
});
const CurrentUrl = () => <output aria-label="현재 URL">{useLocation().search}</output>;
function renderPage(kind: 'search' | 'browse', query = '') {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: 3, retryDelay: 0, gcTime: 0 } },
  });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[`${kind === 'search' ? '/search' : '/festivals/1'}${query}`]}>
        <Routes>
          <Route path="/search" element={<SearchContent />} />
          <Route
            path="/festivals/:areaId"
            element={
              <ErrorBoundary fallback={<p>지역 목록 오류 경계</p>}>
                <Suspense fallback={<p>처음 불러오는 중</p>}>
                  <FestivalsAreaSection />
                </Suspense>
              </ErrorBoundary>
            }
          />
        </Routes>
        <CurrentUrl />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}
const search = async () => {
  await userEvent.setup().type(screen.getByRole('searchbox', { name: '축제 검색어' }), '샘플');
};

test('검색 날짜 필터는 뒤 페이지까지 확인하며 진행 중에는 거짓 빈 결과를 표시하지 않는다', async () => {
  const requests: URL[] = [];
  let release: () => void = () => {};
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  server.use(
    http.get('*/api/festivals', async ({ request }) => {
      const url = new URL(request.url);
      requests.push(url);
      if (url.searchParams.get('page') === '1') {
        await pending;
        return HttpResponse.json(page([later], 1));
      }
      return HttpResponse.json(page([first], 0, false));
    }),
  );
  renderPage('search', '?startDate=2026-11-15&endDate=2026-11-15&source=home');
  await search();
  expect(await screen.findByText(/나머지 축제를 확인/)).toBeVisible();
  expect(screen.queryByText('검색 결과가 없습니다.')).not.toBeInTheDocument();
  release();
  expect(await screen.findByRole('heading', { name: '샘플 축제 2' })).toBeVisible();
  expect(screen.queryByRole('heading', { name: '샘플 축제 1' })).not.toBeInTheDocument();
  expect(requests.map((url) => url.searchParams.get('page'))).toEqual(['0', '1']);
  expect([...requests[0].searchParams.keys()].sort()).toEqual(['keyword', 'page', 'size']);
  await userEvent.setup().click(screen.getByRole('button', { name: '필터 초기화' }));
  expect(screen.getByLabelText('현재 URL')).toHaveTextContent('?source=home');
  expect(screen.getByRole('heading', { name: '샘플 축제 1' })).toBeVisible();
});

test('검색의 추가 페이지 실패는 기존 결과를 유지하고 재시도로 스캔을 마친다', async () => {
  let attempts = 0;
  server.use(
    http.get('*/api/festivals', ({ request }) => {
      const next = new URL(request.url).searchParams.get('page') === '1';
      if (next && ++attempts === 1) return new HttpResponse(null, { status: 500 });
      return HttpResponse.json(
        next ? page([later], 1) : page([festival(1, '2026-11-01', '2026-11-30')], 0, false),
      );
    }),
  );
  renderPage('search', '?startDate=2026-11-15');
  await search();
  expect(await screen.findByRole('button', { name: '나머지 결과 다시 불러오기' })).toBeVisible();
  expect(screen.getByRole('heading', { name: '샘플 축제 1' })).toBeVisible();
  expect(attempts).toBe(1);
  await userEvent.setup().click(screen.getByRole('button', { name: '나머지 결과 다시 불러오기' }));
  expect(await screen.findByRole('heading', { name: '샘플 축제 2' })).toBeVisible();
  expect(attempts).toBe(2);
});

test('필터 없는 검색은 전체와 불러온 수를 구분하고 명시적으로 다음 페이지를 불러온다', async () => {
  const requests: string[] = [];
  server.use(
    http.get('*/api/festivals', ({ request }) => {
      const number = Number(new URL(request.url).searchParams.get('page'));
      requests.push(String(number));
      return HttpResponse.json(number === 0 ? page([first], 0, false) : page([later], 1));
    }),
  );
  renderPage('search');
  await search();
  expect(await screen.findByText('전체 2개 중 1개 불러옴')).toBeVisible();
  expect(requests).toEqual(['0']);
  await userEvent.setup().click(screen.getByRole('button', { name: '결과 더 보기' }));
  expect(await screen.findByRole('heading', { name: '샘플 축제 2' })).toBeVisible();
});

test('지역 날짜 필터는 기존 current API 조건을 보존하며 뒤 페이지에서 겹치는 축제를 찾는다', async () => {
  const requests: URL[] = [];
  server.use(
    http.get('*/api/festivals/area/1', ({ request }) => {
      const url = new URL(request.url);
      requests.push(url);
      return HttpResponse.json(
        url.searchParams.get('page') === '1' ? page([later], 1) : page([first], 0, false),
      );
    }),
  );
  renderPage('browse', '?current=false&source=map&startDate=2026-11-15&endDate=2026-11-15');
  expect(await screen.findByRole('heading', { name: '샘플 축제 2' })).toBeVisible();
  expect(screen.queryByRole('heading', { name: '샘플 축제 1' })).not.toBeInTheDocument();
  expect(requests.map((url) => url.searchParams.get('current'))).toEqual(['false', 'false']);
  expect([...requests[0].searchParams.keys()].sort()).toEqual(['current', 'page', 'size']);
  const start = screen.getByLabelText('시작일');
  const end = screen.getByLabelText('종료일');
  expect(start).toHaveAttribute('max', '2026-11-15');
  expect(end).toHaveAttribute('min', '2026-11-15');
  fireEvent.change(start, { target: { value: '2026-12-01' } });
  expect(screen.getByRole('alert')).toHaveTextContent('시작일은 종료일보다 늦을 수 없습니다');
  expect(screen.getByRole('heading', { name: '샘플 축제 1' })).toBeVisible();
  await userEvent.setup().click(screen.getByRole('button', { name: '필터 초기화' }));
  expect(screen.getByLabelText('현재 URL')).toHaveTextContent('?source=map');
  expect(screen.getByRole('switch', { name: '진행 중인 축제만 보기' })).toHaveAttribute(
    'aria-checked',
    'true',
  );
});

test('지역 기본 current만으로 전체를 자동 스캔하지 않으며 추가 페이지 오류 후에도 다시 불러올 수 있다', async () => {
  let attempts = 0;
  const requests: URL[] = [];
  server.use(
    http.get('*/api/festivals/area/1', ({ request }) => {
      const url = new URL(request.url);
      requests.push(url);
      const next = url.searchParams.get('page') === '1';
      if (next && ++attempts === 1) return new HttpResponse(null, { status: 500 });
      return HttpResponse.json(next ? page([later], 1) : page([first], 0, false));
    }),
  );
  renderPage('browse');
  expect(await screen.findByRole('heading', { name: '샘플 축제 1' })).toBeVisible();
  expect(requests).toHaveLength(1);
  await userEvent.setup().click(screen.getByRole('button', { name: '축제 더 보기' }));
  expect(await screen.findByRole('button', { name: '나머지 결과 다시 불러오기' })).toBeVisible();
  expect(screen.getByRole('heading', { name: '샘플 축제 1' })).toBeVisible();
  await userEvent.setup().click(screen.getByRole('button', { name: '나머지 결과 다시 불러오기' }));
  expect(await screen.findByRole('heading', { name: '샘플 축제 2' })).toBeVisible();
});

test('last가 없는 검색 응답은 추가 페이지를 추측하지 않는다', async () => {
  server.use(
    http.get('*/api/festivals', () => {
      const response = { ...page([first], 0), last: undefined };
      return HttpResponse.json(response);
    }),
  );
  renderPage('search');
  await search();
  expect(await screen.findByRole('heading', { name: '샘플 축제 1' })).toBeVisible();
  await waitFor(() =>
    expect(screen.queryByRole('button', { name: '결과 더 보기' })).not.toBeInTheDocument(),
  );
});

test('검색의 진행 중 스위치는 검색 API에 current를 보내지 않고 예정·종료 축제를 제외한다', async () => {
  const requests: URL[] = [];
  server.use(
    http.get('*/api/festivals', ({ request }) => {
      const url = new URL(request.url);
      requests.push(url);
      return HttpResponse.json(
        url.searchParams.get('page') === '1'
          ? page([festival(3, '2020-01-01', '2099-12-31')], 1)
          : page([first, festival(4, '2099-01-01', '2099-12-31')], 0, false),
      );
    }),
  );
  renderPage('search', '?source=search');
  await search();
  expect(await screen.findByRole('heading', { name: '샘플 축제 1' })).toBeVisible();
  await userEvent.setup().click(screen.getByRole('switch', { name: '진행 중인 축제만 보기' }));
  expect(await screen.findByRole('heading', { name: '샘플 축제 3' })).toBeVisible();
  expect(screen.queryByRole('heading', { name: '샘플 축제 1' })).not.toBeInTheDocument();
  expect(screen.queryByRole('heading', { name: '샘플 축제 4' })).not.toBeInTheDocument();
  expect(screen.getByLabelText('현재 URL')).toHaveTextContent('source=search&current=true');
  expect(requests.every((url) => !url.searchParams.has('current'))).toBe(true);
});

test('지역 날짜 스캔의 추가 페이지 실패는 자동 반복 없이 기존 매치를 유지하고 재시도한다', async () => {
  let attempts = 0;
  server.use(
    http.get('*/api/festivals/area/1', ({ request }) => {
      const next = new URL(request.url).searchParams.get('page') === '1';
      if (next && ++attempts === 1) return new HttpResponse(null, { status: 500 });
      return HttpResponse.json(
        next ? page([later], 1) : page([festival(1, '2026-11-01', '2026-11-30')], 0, false),
      );
    }),
  );
  renderPage('browse', '?current=false&startDate=2026-11-15');
  expect(await screen.findByRole('button', { name: '나머지 결과 다시 불러오기' })).toBeVisible();
  expect(screen.getByRole('heading', { name: '샘플 축제 1' })).toBeVisible();
  expect(attempts).toBe(1);
  await userEvent.setup().click(screen.getByRole('button', { name: '나머지 결과 다시 불러오기' }));
  expect(await screen.findByRole('heading', { name: '샘플 축제 2' })).toBeVisible();
  expect(attempts).toBe(2);
});

test('추가 페이지가 남아 있는 빈 검색 페이지는 전체 빈 결과로 단정하지 않는다', async () => {
  server.use(
    http.get('*/api/festivals', ({ request }) =>
      HttpResponse.json(
        new URL(request.url).searchParams.get('page') === '1'
          ? page([later], 1)
          : page([], 0, false),
      ),
    ),
  );
  renderPage('search');
  await search();
  expect(await screen.findByRole('button', { name: '결과 더 보기' })).toBeVisible();
  expect(screen.queryByText('검색 결과가 없습니다.')).not.toBeInTheDocument();
  await userEvent.setup().click(screen.getByRole('button', { name: '결과 더 보기' }));
  expect(await screen.findByRole('heading', { name: '샘플 축제 2' })).toBeVisible();
});

test('지역 첫 요청 실패 후에도 지역 탐색과 날짜 필터를 유지하고 같은 쿼리를 수동 재시도한다', async () => {
  const requests: URL[] = [];
  server.use(
    http.get('*/api/festivals/area/1', ({ request }) => {
      requests.push(new URL(request.url));
      return requests.length === 1
        ? new HttpResponse(null, { status: 500 })
        : HttpResponse.json(page([later], 0));
    }),
  );
  renderPage('browse', '?current=false&source=map&startDate=2026-11-15&endDate=2026-11-15');
  const retry = await screen.findByRole('button', { name: '지역 축제 다시 불러오기' });
  const navigation = screen.getByRole('navigation', { name: '축제 지역' });
  expect(within(navigation).getByRole('link', { name: '인천' })).toHaveAttribute(
    'href',
    '/festivals/2?current=false&source=map&startDate=2026-11-15&endDate=2026-11-15',
  );
  expect(screen.getByLabelText('시작일')).toHaveValue('2026-11-15');
  expect(screen.getByLabelText('종료일')).toHaveValue('2026-11-15');
  expect(screen.queryByText(/전체 0개/)).not.toBeInTheDocument();
  expect(screen.queryByText('선택한 조건에 맞는 축제가 없습니다.')).not.toBeInTheDocument();
  await userEvent.setup().tab();
  expect(requests).toHaveLength(1);
  await userEvent.setup().click(retry);
  expect(await screen.findByRole('heading', { name: '샘플 축제 2' })).toBeVisible();
  expect(requests).toHaveLength(2);
  expect(requests.map((url) => Object.fromEntries(url.searchParams))).toEqual([
    { size: '6', page: '0', current: 'false' },
    { size: '6', page: '0', current: 'false' },
  ]);
  expect(screen.getByLabelText('시작일')).toHaveValue('2026-11-15');
  expect(screen.getByLabelText('현재 URL')).toHaveTextContent(
    'source=map&startDate=2026-11-15&endDate=2026-11-15',
  );
});
