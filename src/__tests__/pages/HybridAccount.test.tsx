import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { server } from '@/mocks/server';
import MyPage from '@/pages/My/MyPage';
import SettingsPage from '@/pages/Settings/SettingsPage';
import type { MyReview } from '@/apis/review/getMyReviews';

vi.mock('@/components/common/Header', () => ({ default: () => <header /> }));
vi.mock('@/components/common/Footer', () => ({ default: () => <footer /> }));
vi.mock('@/hooks/useChatRead', () => ({ default: vi.fn() }));
vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    userInfo: {
      userId: 7,
      username: '축제 여행자',
      email: 'traveler@example.test',
      profileImageUrl: '/profile.png',
    },
    clearAuth: vi.fn(),
    setUserInfo: vi.fn(),
  }),
}));

const review = (reviewId: number, content: string, score: number): MyReview => ({
  reviewId,
  reviewerName: '축제 여행자',
  festivalTitle: '동명이인 축제',
  content,
  score,
  imageUrls: [],
  videoUrl: '',
});
const firstReviews = [
  review(901, '강가에서 본 불꽃이 오래 기억에 남아요.', 4.5),
  review(902, '조용한 공연이 특히 좋았어요.', 3),
];
const fullChatName = '아주 긴 이름을 가진 가을 음악 축제 채팅방';
const festival = {
  id: 44,
  managerId: null,
  title: '동명이인 축제',
  addr1: '서울특별시 영등포구',
  addr2: '',
  posterInfo: '/festival.png',
  startDate: '2026-11-01',
  endDate: '2026-11-03',
  averageScore: 4,
  wishCount: 10,
};

const renderPage = (page: React.ReactNode, initialEntries = ['/']) => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <QueryClientProvider client={client}>{page}</QueryClientProvider>
    </MemoryRouter>,
  );
};

beforeEach(() => {
  server.use(
    http.get('*/api/chatRooms/me', () =>
      HttpResponse.json({
        content: [
          {
            roomId: 1,
            roomName: fullChatName,
            festivalId: 77,
            posterInfo: '/chat.png',
            existNewMessage: true,
          },
        ],
        last: true,
      }),
    ),
    http.get('*/api/festivals/wishedBy/me', () =>
      HttpResponse.json({ content: [festival], last: true }),
    ),
    http.get('*/api/festivals/reviewedBy/me', () =>
      HttpResponse.json({ content: [festival], last: true }),
    ),
    http.get('*/api/reviews/my', () => HttpResponse.json({ content: firstReviews, last: true })),
  );
});

afterEach(() => vi.restoreAllMocks());

describe('하이브리드 마이페이지와 설정', () => {
  test('리뷰 탭 직접 주소를 열면 실제 내 리뷰와 선택 상태를 바로 보여준다', async () => {
    renderPage(<MyPage />, ['/my?source=saved&tab=reviewed']);
    expect(screen.getByRole('button', { name: '리뷰' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: '좋아요' })).toHaveAttribute('aria-pressed', 'false');
    const ownReviews = screen.getByRole('region', { name: '내가 작성한 리뷰' });
    expect(await within(ownReviews).findByText(firstReviews[0].content)).toBeInTheDocument();
  });

  test('탭 변경은 다른 쿼리를 보존하고 현재 방문 기록만 교체한다', () => {
    const NavigationState = () => {
      const location = useLocation();
      const navigate = useNavigate();
      return (
        <>
          <output aria-label="현재 주소">
            {location.pathname}
            {location.search}
          </output>
          <button onClick={() => navigate(-1)}>이전 경로</button>
        </>
      );
    };
    renderPage(
      <>
        <MyPage />
        <NavigationState />
      </>,
      ['/before', '/my?source=saved&extra=keep&tab=unknown'],
    );
    expect(screen.getByRole('button', { name: '좋아요' })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(screen.getByRole('button', { name: '리뷰' }));
    expect(screen.getByLabelText('현재 주소')).toHaveTextContent(
      '/my?source=saved&extra=keep&tab=reviewed',
    );
    fireEvent.click(screen.getByRole('button', { name: '좋아요' }));
    expect(screen.getByLabelText('현재 주소')).toHaveTextContent('/my?source=saved&extra=keep');
    fireEvent.click(screen.getByRole('button', { name: '리뷰' }));
    fireEvent.click(screen.getByRole('button', { name: '이전 경로' }));
    expect(screen.getByLabelText('현재 주소')).toHaveTextContent('/before');
  });

  test('기존 리뷰 수정 주소로 이동했다가 뒤로 돌아오면 리뷰 탭 맥락이 유지된다', async () => {
    const ReviewEditReturn = () => {
      const navigate = useNavigate();
      return <button onClick={() => navigate(-1)}>리뷰 목록으로 돌아가기</button>;
    };
    renderPage(
      <Routes>
        <Route path="/my" element={<MyPage />} />
        <Route path="/review/:reviewId/edit" element={<ReviewEditReturn />} />
      </Routes>,
      ['/my?tab=reviewed&source=saved'],
    );
    const ownReviews = screen.getByRole('region', { name: '내가 작성한 리뷰' });
    const editLinks = await within(ownReviews).findAllByRole('link', { name: /리뷰 수정/ });
    fireEvent.click(editLinks[0]);
    fireEvent.click(screen.getByRole('button', { name: '리뷰 목록으로 돌아가기' }));
    expect(screen.getByRole('button', { name: '리뷰' })).toHaveAttribute('aria-pressed', 'true');
    const restoredReviews = screen.getByRole('region', { name: '내가 작성한 리뷰' });
    expect(await within(restoredReviews).findByText(firstReviews[0].content)).toBeInTheDocument();
  });

  test('줄인 채팅방 이름과 전체 접근성 이름, 기존 채팅 주소를 함께 유지한다', async () => {
    renderPage(<MyPage />);
    const chatLink = await screen.findByRole('link', { name: fullChatName });
    expect(chatLink).toHaveAttribute('href', '/chat/77');
    expect(chatLink).toHaveAttribute('title', fullChatName);
    expect(within(chatLink).getByText('아주 긴 ...')).toBeInTheDocument();
    expect(within(chatLink).getByRole('img', { name: '새 메시지 있음' })).toBeInTheDocument();
  });

  test('실제 내 리뷰 응답의 평점과 본문을 보여주고, 동명 축제여도 리뷰 ID로 수정한다', async () => {
    const pages: string[][] = [];
    server.use(
      http.get('*/api/reviews/my', ({ request }) => {
        const url = new URL(request.url);
        pages.push([url.searchParams.get('page')!, url.searchParams.get('size')!]);
        const page = url.searchParams.get('page') === '1';
        return HttpResponse.json({
          content: page ? [review(903, '다음에도 다시 방문하고 싶어요.', 5)] : firstReviews,
          last: page,
        });
      }),
    );
    renderPage(<MyPage />);
    fireEvent.click(screen.getByRole('button', { name: '리뷰' }));
    const ownReviews = await screen.findByRole('region', { name: '내가 작성한 리뷰' });
    expect(await within(ownReviews).findByText(firstReviews[0].content)).toBeInTheDocument();
    expect(within(ownReviews).getByText(firstReviews[1].content)).toBeInTheDocument();
    expect(within(ownReviews).getByLabelText('내 평점 4.5점')).toBeInTheDocument();
    expect(within(ownReviews).getByLabelText('내 평점 3점')).toBeInTheDocument();
    const editLinks = within(ownReviews).getAllByRole('link', { name: /리뷰 수정/ });
    expect(editLinks.map((link) => link.getAttribute('href'))).toEqual([
      '/review/901/edit',
      '/review/902/edit',
    ]);
    expect(within(ownReviews).queryByRole('link', { name: /축제 상세/ })).not.toBeInTheDocument();
    const reviewedFestivals = screen.getByRole('region', { name: '리뷰를 남긴 축제' });
    expect(await within(reviewedFestivals).findByRole('link')).toHaveAttribute(
      'href',
      '/festival/44',
    );
    fireEvent.click(within(ownReviews).getByRole('button', { name: '리뷰 더 보기' }));
    expect(
      await within(ownReviews).findByText('다음에도 다시 방문하고 싶어요.'),
    ).toBeInTheDocument();
    expect(pages).toEqual([
      ['0', '5'],
      ['1', '5'],
    ]);
    expect(
      within(ownReviews).queryByRole('button', { name: '리뷰 더 보기' }),
    ).not.toBeInTheDocument();
  });

  test('내 리뷰 요청 실패는 기존 축제 카드를 가리지 않고 독립적으로 재시도한다', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    let attempts = 0;
    server.use(
      http.get('*/api/reviews/my', () => {
        attempts += 1;
        return attempts === 1
          ? HttpResponse.json({}, { status: 500 })
          : HttpResponse.json({ content: firstReviews, last: true });
      }),
    );
    renderPage(<MyPage />);
    fireEvent.click(screen.getByRole('button', { name: '리뷰' }));
    const ownReviews = await screen.findByRole('region', { name: '내가 작성한 리뷰' });
    expect(await within(ownReviews).findByRole('alert')).toBeInTheDocument();
    const reviewedFestivals = screen.getByRole('region', { name: '리뷰를 남긴 축제' });
    expect(await within(reviewedFestivals).findByRole('link')).toHaveAttribute(
      'href',
      '/festival/44',
    );
    fireEvent.click(within(ownReviews).getByRole('button', { name: '다시 시도' }));
    expect(await within(ownReviews).findByText(firstReviews[0].content)).toBeInTheDocument();
    expect(attempts).toBe(2);
  });

  test('리뷰를 남긴 축제 요청이 실패해도 내 리뷰 미리보기는 남는다', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    server.use(
      http.get('*/api/festivals/reviewedBy/me', () => HttpResponse.json({}, { status: 500 })),
    );
    renderPage(<MyPage />);
    fireEvent.click(screen.getByRole('button', { name: '리뷰' }));
    const ownReviews = await screen.findByRole('region', { name: '내가 작성한 리뷰' });
    expect(await within(ownReviews).findByText(firstReviews[0].content)).toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
    expect(within(ownReviews).getAllByRole('link')).toHaveLength(2);
  });

  test('내 리뷰가 비어 있어도 평점이나 총 개수를 만들지 않고 기존 축제 목록을 유지한다', async () => {
    server.use(http.get('*/api/reviews/my', () => HttpResponse.json({ content: [], last: true })));
    renderPage(<MyPage />);
    fireEvent.click(screen.getByRole('button', { name: '리뷰' }));
    const ownReviews = await screen.findByRole('region', { name: '내가 작성한 리뷰' });
    expect(await within(ownReviews).findByText('작성한 리뷰가 없습니다.')).toBeInTheDocument();
    expect(within(ownReviews).queryByRole('img', { name: /내 평점/ })).not.toBeInTheDocument();
    expect(within(ownReviews).queryByRole('link')).not.toBeInTheDocument();
    expect(
      within(ownReviews).queryByRole('button', { name: '리뷰 더 보기' }),
    ).not.toBeInTheDocument();
    const reviewedFestivals = screen.getByRole('region', { name: '리뷰를 남긴 축제' });
    expect(await within(reviewedFestivals).findByRole('link')).toHaveAttribute(
      'href',
      '/festival/44',
    );
  });

  test('다음 리뷰 페이지가 실패하면 이미 읽은 리뷰를 유지하며 같은 페이지를 재시도한다', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const requestedPages: string[] = [];
    let nextPageAttempts = 0;
    server.use(
      http.get('*/api/reviews/my', ({ request }) => {
        const page = new URL(request.url).searchParams.get('page')!;
        requestedPages.push(page);
        if (page === '0') return HttpResponse.json({ content: firstReviews, last: false });
        nextPageAttempts += 1;
        return nextPageAttempts === 1
          ? HttpResponse.json({}, { status: 500 })
          : HttpResponse.json({
              content: [review(903, '다음 페이지에서 찾은 내 기록', 5)],
              last: true,
            });
      }),
    );
    renderPage(<MyPage />);
    fireEvent.click(screen.getByRole('button', { name: '리뷰' }));
    const ownReviews = await screen.findByRole('region', { name: '내가 작성한 리뷰' });
    fireEvent.click(await within(ownReviews).findByRole('button', { name: '리뷰 더 보기' }));
    expect(await within(ownReviews).findByRole('alert')).toBeInTheDocument();
    expect(within(ownReviews).getByText(firstReviews[0].content)).toBeInTheDocument();
    fireEvent.click(within(ownReviews).getByRole('button', { name: '다시 시도' }));
    expect(await within(ownReviews).findByText('다음 페이지에서 찾은 내 기록')).toBeInTheDocument();
    expect(requestedPages).toEqual(['0', '1', '1']);
    expect(within(ownReviews).getAllByRole('link')).toHaveLength(3);
  });

  test('프로필 카드 안의 단일 이미지 수정 버튼으로 기존 업로드 모달을 연다', async () => {
    renderPage(<SettingsPage />);
    const profile = screen.getByRole('region', { name: '내 프로필' });
    expect(within(profile).getByText('축제 여행자님 안녕하세요!')).toBeInTheDocument();
    expect(within(profile).getByText('traveler@example.test')).toBeInTheDocument();
    const editButton = within(profile).getByRole('button', { name: '프로필 이미지 수정' });
    expect(screen.getAllByRole('button', { name: '프로필 이미지 수정' })).toHaveLength(1);
    editButton.focus();
    fireEvent.click(editButton);
    expect(await screen.findByRole('dialog', { name: '프로필 이미지 변경' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '취소' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(editButton).toHaveFocus();
  });
});
