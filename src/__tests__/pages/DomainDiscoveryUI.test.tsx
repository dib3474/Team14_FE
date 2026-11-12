import FestivalContentNoticeSection from '@/pages/FestivalInfo/components/FestivalContentNoticeSection';
import FestivalContentReviewMediaSlider from '@/pages/FestivalInfo/components/FestivalContentReviewMediaSlider';
import type { Review } from '@/apis/review/getReview';
import FestivalInfoFooter from '@/pages/FestivalInfo/components/FestivalInfoFooter';
import FestivalPoster from '@/pages/FestivalInfo/components/FestivalPoster';
import FestivalWish from '@/pages/FestivalInfo/components/FestivalWish';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
vi.mock('@/apis/festivals/getFestivalInfo', () => ({
  default: vi.fn().mockResolvedValue({ data: { content: { title: '축제' } } }),
}));
vi.mock('@/apis/wish/postWish', () => ({ postWish: vi.fn().mockResolvedValue({}) }));
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import HomeContent from '@/pages/Home/components/HomeContent';
import FestivalCard from '@/pages/Festivals/components/FestivalCard';
import SearchContent from '@/pages/Search/components/SearchContent';
import MAP_PINS from '@/constants/mapPins';
import { ROUTE_PATH } from '@/constants/routes';
import { generatePath } from 'react-router-dom';
import type { Festival } from '@/types/FestivalType';

const searchState = vi.hoisted(() => ({
  searchQuery: '서울',
  setSearchQuery: vi.fn(),
  searchResults: [],
  isLoading: false,
  error: null as Error | null,
  canShowResults: true,
  refetch: vi.fn(),
}));
vi.mock('@/hooks/useSearch', () => ({ default: () => searchState }));

const Location = () => <output aria-label="현재 경로">{useLocation().pathname}</output>;
const fixture: Festival = {
  id: 42,
  managerId: null,
  title: '아주 긴 이름도 끝까지 읽을 수 있는 서울의 음악과 문화 축제',
  addr1: '서울특별시 종로구 세종대로 175 광장',
  addr2: '',
  posterInfo: '/poster.jpg',
  startDate: '2026-11-01',
  endDate: '2026-11-30',
  averageScore: null,
  wishCount: 12,
};

beforeEach(() => {
  searchState.error = null;
  searchState.isLoading = false;
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute('open');
  };
});

test('지역 모달은 이름과 키보드 포커스를 제공하고 Escape 뒤 선택한 핀으로 돌아간다', async () => {
  const user = userEvent.setup();
  render(
    <MemoryRouter>
      <HomeContent />
    </MemoryRouter>,
  );
  const trigger = screen.getAllByRole('button', { name: '서울' })[0];
  await user.click(trigger);
  const dialog = screen.getByRole('dialog', { name: '서울 축제 여행' });
  const close = within(dialog).getByRole('button', { name: '지역 선택 닫기' });
  expect(close).toHaveFocus();
  await user.tab({ shift: true });
  expect(within(dialog).getByRole('button', { name: '지역 축제 둘러보기' })).toHaveFocus();
  await user.tab();
  expect(close).toHaveFocus();
  await user.keyboard('{Escape}');
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(trigger).toHaveFocus();
});

test.each([
  ['나만의 지역 축제 찾기', ROUTE_PATH.PICK],
  ['지역 축제 둘러보기', ROUTE_PATH.FESTIVALS],
])('지역 모달의 %s는 원래 지역 목적지로 이동한다', async (name, route) => {
  const user = userEvent.setup();
  render(
    <MemoryRouter>
      <HomeContent />
      <Location />
    </MemoryRouter>,
  );
  await user.click(screen.getAllByRole('button', { name: '서울' })[0]);
  await user.click(within(screen.getByRole('dialog')).getByRole('button', { name }));
  expect(screen.getByLabelText('현재 경로')).toHaveTextContent(
    generatePath(route, { areaId: MAP_PINS[0].areaId }),
  );
});

test('축제 카드는 하나의 원래 목적지 링크에 제목·날짜·전체 장소·평점·관심을 제공한다', () => {
  render(
    <MemoryRouter>
      <FestivalCard data={fixture} highlight />
    </MemoryRouter>,
  );
  const link = screen.getByRole('link');
  expect(link).toHaveAttribute(
    'href',
    generatePath(ROUTE_PATH.FESTIVAL_INFO, { festivalId: '42' }),
  );
  expect(within(link).getByRole('heading', { name: fixture.title })).toBeVisible();
  expect(within(link).getByText('2026-11-01 ~ 2026-11-30')).toBeVisible();
  expect(within(link).getByText(fixture.addr1)).toBeVisible();
  expect(within(link).getByText('평점 -')).toBeVisible();
  expect(within(link).getByText('관심 12')).toBeVisible();
  expect(within(link).getByText('AI PICK')).toBeVisible();
  expect(link.querySelector('button')).toBeNull();
});

test('검색 입력은 이름이 있고 로딩·오류 상태에서도 같은 필드와 포커스를 유지한다', async () => {
  const user = userEvent.setup();
  const { rerender } = render(<SearchContent />);
  const input = screen.getByRole('searchbox', { name: '축제 검색어' });
  await user.click(input);
  searchState.isLoading = true;
  rerender(<SearchContent />);
  expect(screen.getByRole('searchbox', { name: '축제 검색어' })).toBe(input);
  searchState.isLoading = false;
  searchState.error = new Error('검색 오류');
  rerender(<SearchContent />);
  expect(screen.getByRole('searchbox', { name: '축제 검색어' })).toBe(input);
  expect(input).toHaveFocus();
  expect(screen.queryByRole('button', { name: '검색' })).not.toBeInTheDocument();
});

test('상세 하단의 두 경로는 중첩 버튼 없이 원래 리뷰 상태와 채팅 링크를 유지한다', async () => {
  const user = userEvent.setup();
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  });
  const cachedFestival = { ...fixture, overView: '축제 소개' };
  client.setQueryData(['festival', '42'], { data: { content: cachedFestival } });
  const Destination = () => {
    const location = useLocation();
    return <output aria-label="리뷰 전달 상태">{JSON.stringify(location.state)}</output>;
  };
  render(
    <MemoryRouter initialEntries={['/festival/42']}>
      <QueryClientProvider client={client}>
        <Routes>
          <Route path="/festival/:festivalId" element={<FestivalInfoFooter />} />
          <Route path="/review/:festivalId" element={<Destination />} />
        </Routes>
      </QueryClientProvider>
    </MemoryRouter>,
  );
  const review = screen.getByRole('link', { name: '리뷰하기' });
  const chat = screen.getByRole('link', { name: '채팅 참여하기' });
  expect(review).toHaveAttribute('href', '/review/42');
  expect(chat).toHaveAttribute('href', '/chat/42');
  expect(review.querySelector('button')).toBeNull();
  expect(chat.querySelector('button')).toBeNull();
  await user.click(review);
  expect(JSON.parse(screen.getByLabelText('리뷰 전달 상태').textContent || '{}')).toEqual({
    festivalInfo: cachedFestival,
  });
});

test('포스터의 이미지 선택 버튼은 이름과 선택 상태가 있고 키보드로 다음 원본을 보여준다', async () => {
  const user = userEvent.setup();
  render(<FestivalPoster posterUrl="/one.jpg" imageUrls={['/two.jpg']} title="서울 축제" />);
  const second = screen.getByRole('button', { name: '2번 이미지 보기' });
  expect(second).toHaveAttribute('aria-pressed', 'false');
  second.focus();
  await user.keyboard('{Enter}');
  expect(second).toHaveAttribute('aria-pressed', 'true');
  expect(screen.getByRole('img', { name: '서울 축제 - 2' })).toHaveAttribute('src', '/two.jpg');
});

test('관심 버튼은 키보드로 기존 관심 추가 동작을 실행한다', async () => {
  const user = userEvent.setup();
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  render(
    <MemoryRouter>
      <QueryClientProvider client={client}>
        <FestivalWish isMyWish={false} wishCount={12} />
      </QueryClientProvider>
    </MemoryRouter>,
  );
  const wish = screen.getByRole('button', { name: '관심 축제 추가' });
  wish.focus();
  await user.keyboard('{Enter}');
  expect(await screen.findByRole('button', { name: '관심 축제 해제' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
});

test('포스터 스테이지는 이름이 있는 갤러리 영역이다', () => {
  render(<FestivalPoster posterUrl="/one.jpg" imageUrls={[]} title="서울 축제" />);
  expect(screen.getByRole('region', { name: '축제 이미지 갤러리' })).toContainElement(
    screen.getByRole('img', { name: '서울 축제 - 1' }),
  );
});

test('숨겨진 공지 슬라이드는 Tab 순서에서 빠지고 다음 슬라이드 선택 시에만 활성화된다', async () => {
  const user = userEvent.setup();
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  });
  client.setQueryData(['festival-notices', '42'], {
    pages: [
      {
        data: {
          content: [
            { id: 1, title: '첫 번째 공지' },
            { id: 2, title: '두 번째 공지' },
          ],
          last: true,
        },
      },
    ],
    pageParams: [0],
  });
  render(
    <MemoryRouter>
      <QueryClientProvider client={client}>
        <FestivalContentNoticeSection festivalId="42" isManager={false} />
      </QueryClientProvider>
    </MemoryRouter>,
  );
  const first = screen.getByRole('button', { name: '첫 번째 공지' });
  const second = screen.getByText('두 번째 공지').closest('button');
  expect(second).toHaveAttribute('tabindex', '-1');
  expect(second?.parentElement).toHaveAttribute('inert');
  expect(screen.queryByRole('button', { name: '두 번째 공지' })).not.toBeInTheDocument();
  first.focus();
  await user.tab();
  expect(screen.getByRole('button', { name: '다음 공지사항' })).toHaveFocus();
  await user.keyboard('{Enter}');
  expect(screen.getByRole('button', { name: '두 번째 공지' })).toHaveAttribute('tabindex', '0');
  expect(first).toHaveAttribute('tabindex', '-1');
  expect(first.parentElement).toHaveAttribute('aria-hidden', 'true');
});

const mediaReview: Review = {
  reviewId: 1,
  userId: 2,
  reviewerName: '여행자',
  festivalTitle: '서울 축제',
  content: '즐거운 축제',
  score: 5,
  videoUrl: '/review-video.mp4',
  imageUrls: ['/review-one.jpg', '/review-two.jpg'],
};
test.each([
  ['리뷰 이미지 2 확대', '2 / 3'],
  ['리뷰 동영상 1 재생', '1 / 3'],
])('리뷰의 %s 버튼은 키보드로 기존 순서의 미디어 모달을 연다', async (name, position) => {
  const user = userEvent.setup();
  render(<FestivalContentReviewMediaSlider review={mediaReview} festivalTitle="서울 축제" />);
  const preview = screen.getByRole('button', { name });
  preview.focus();
  await user.keyboard('{Enter}');
  const modal = screen.getByRole('dialog');
  expect(within(modal).getByText(position)).toBeVisible();
  expect(modal.querySelector('video')).toHaveAttribute('src', '/review-video.mp4');
  expect(
    within(modal)
      .getAllByRole('img', { hidden: true })
      .map((image) => image.getAttribute('src')),
  ).toEqual(mediaReview.imageUrls);
});
