import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import PickPage from '@/pages/Pick/PickPage';
import AiRecommendationFestivalCard from '@/pages/AiRecommendationHistories/components/AiRecommendationFestivalCard';

const RouteResult = () => {
  const location = useLocation();
  return <output aria-label="추천 요청">{JSON.stringify(location.state)}</output>;
};

const renderPick = () =>
  render(
    <MemoryRouter initialEntries={['/pick/1?step=style&source=home']}>
      <Routes>
        <Route path="/pick/:areaId" element={<PickPage />} />
        <Route path="/festivals/:areaId" element={<RouteResult />} />
      </Routes>
    </MemoryRouter>,
  );

describe('AI PICK accessible selection', () => {
  test('native style buttons support keyboard toggling and retain the provider’s latest-three limit', async () => {
    const user = userEvent.setup();
    renderPick();

    const traditional = screen.getByRole('button', { name: '전통 문화' });
    const next = screen.getByRole('button', { name: '다음' });
    expect(traditional.tagName).toBe('BUTTON');
    expect(traditional).toHaveAttribute('aria-pressed', 'false');
    expect(next).toBeDisabled();

    traditional.focus();
    await user.keyboard('{Enter}');
    expect(traditional).toHaveAttribute('aria-pressed', 'true');
    expect(next).toBeEnabled();
    await user.keyboard(' ');
    expect(traditional).toHaveAttribute('aria-pressed', 'false');
    expect(next).toBeDisabled();

    await user.click(traditional);
    await user.click(screen.getByRole('button', { name: '예술/공연' }));
    await user.click(screen.getByRole('button', { name: '휴식' }));
    await user.click(screen.getByRole('button', { name: '자연/경관' }));
    expect(traditional).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getAllByRole('button', { pressed: true })).toHaveLength(3);
    expect(screen.getByRole('status')).toHaveTextContent('3 / 3');
  });

  test('next retains style state and MBTI boolean choices reach the original recommendation route', async () => {
    const user = userEvent.setup();
    renderPick();
    await user.click(screen.getByRole('button', { name: '전통 문화' }));
    await user.click(screen.getByRole('button', { name: '다음' }));
    expect(screen.getByText('2 / 2')).toBeInTheDocument();

    const recommend = screen.getByRole('button', { name: '추천 받기' });
    expect(recommend).toBeDisabled();
    const firstQuestion = screen.getByRole('group', { name: '이번에 나는' });
    const newPlace = within(firstQuestion).getByRole('button', { name: '새로운 곳' });
    const familiarPlace = within(firstQuestion).getByRole('button', { name: '익숙한 곳' });
    newPlace.focus();
    await user.keyboard('{Enter}');
    expect(newPlace).toHaveAttribute('aria-pressed', 'true');
    await user.click(familiarPlace);
    expect(familiarPlace).toHaveAttribute('aria-pressed', 'true');
    expect(newPlace).toHaveAttribute('aria-pressed', 'false');
    await user.click(screen.getByRole('button', { name: '혼자' }));
    await user.click(screen.getByRole('button', { name: '유익함을' }));
    await user.click(screen.getByRole('button', { name: '즉흥적으로' }));
    await user.type(screen.getByRole('textbox', { name: '추가 정보 (선택)' }), '캠핑');
    expect(recommend).toBeEnabled();
    await user.click(recommend);

    expect(JSON.parse(screen.getByLabelText('추천 요청').textContent || '{}')).toEqual({
      requestData: {
        styles: ['TRADITIONAL'],
        areaCode: 1,
        isNewPlace: false,
        isSolo: true,
        prefersEnjoyment: false,
        isSpontaneous: true,
        additionalInfo: '캠핑',
      },
    });
  });
});

describe('AI recommendation result information', () => {
  test('a result keeps its full destination metadata and shows review count once for a zero rating', () => {
    render(
      <MemoryRouter>
        <AiRecommendationFestivalCard
          data={{
            id: 42,
            managerId: null,
            title: '가을의 아름다움과 지역 문화를 함께 만나는 아주 긴 이름의 축제',
            addr1: '서울특별시 종로구 사직로 161',
            addr2: '경복궁 일대',
            posterInfo: '/poster.jpg',
            startDate: '2026-10-01',
            endDate: '2026-11-30',
            averageScore: 0,
            wishCount: 4,
          }}
          rank={1}
          reviewCount={2}
        />
      </MemoryRouter>,
    );
    expect(screen.getByRole('link')).toHaveAttribute('href', '/festival/42');
    expect(screen.getByRole('heading', { name: /가을의 아름다움과 지역 문화/ })).toBeVisible();
    expect(screen.getByText('서울특별시 종로구 사직로 161')).toBeVisible();
    expect(screen.getByText('경복궁 일대')).toBeVisible();
    expect(screen.getByText('2026-10-01 ~ 2026-11-30')).toBeVisible();
    expect(screen.getAllByText('리뷰 2건')).toHaveLength(1);
  });
});
