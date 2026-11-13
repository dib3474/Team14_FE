import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation, generatePath } from 'react-router-dom';
import Footer from '@/components/common/Footer';
import HomeContent from '@/pages/Home/components/HomeContent';
import MAP_PINS from '@/constants/mapPins';
import { ROUTE_PATH } from '@/constants/routes';

const Location = () => <output aria-label="현재 경로">{useLocation().pathname}</output>;
const originalShowModal = HTMLDialogElement.prototype.showModal;
const originalClose = HTMLDialogElement.prototype.close;
beforeEach(() => {
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute('open');
  };
});
afterEach(() => {
  HTMLDialogElement.prototype.showModal = originalShowModal;
  HTMLDialogElement.prototype.close = originalClose;
});

test('지도는 실제 SVG의 세로 비율과 일치하는 이미지 크기를 제공한다', () => {
  render(
    <MemoryRouter>
      <HomeContent />
    </MemoryRouter>,
  );
  const map = screen.getByRole('img', { name: '대한민국 지역 지도' });
  expect(map).toHaveAttribute('src', '/koreamap.svg');
  expect(map).toHaveAttribute('width', '398');
  expect(map).toHaveAttribute('height', '729');
  expect(screen.getByRole('heading', { name: '설레는 축제 여행, 나의 다음 픽은?' })).toBeVisible();
  expect(screen.getByRole('heading', { name: '지역 이름으로 찾아보기' })).toBeVisible();
});

test.each([
  ['나만의 지역 축제 찾기', ROUTE_PATH.PICK],
  ['지역 축제 둘러보기', ROUTE_PATH.FESTIVALS],
])('지도에서 제주를 선택하면 기존 모달의 %s가 같은 지역 경로를 연다', async (action, route) => {
  const user = userEvent.setup();
  render(
    <MemoryRouter>
      <HomeContent />
      <Location />
    </MemoryRouter>,
  );
  const pin = MAP_PINS.find((item) => item.id === 'jeju')!;
  const region = screen.getByRole('region', { name: '전국 축제 지도' });
  await user.click(within(region).getByRole('button', { name: pin.name }));
  const dialog = screen.getByRole('dialog', { name: `${pin.name} 축제 여행` });
  await user.click(within(dialog).getByRole('button', { name: action }));
  expect(screen.getByLabelText('현재 경로')).toHaveTextContent(
    generatePath(route, { areaId: pin.areaId }),
  );
});

test('하단 메뉴는 native 링크로 기존 경로를 열고 현재 메뉴만 표시한다', async () => {
  const user = userEvent.setup();
  render(
    <MemoryRouter initialEntries={['/settings/faq']}>
      <Footer />
      <Location />
    </MemoryRouter>,
  );
  const menu = screen.getByRole('navigation', { name: '주요 메뉴' });
  expect(within(menu).getByRole('link', { name: 'My' })).toHaveAttribute('aria-current', 'page');
  const targets = [
    ['홈', '/'],
    ['검색', '/search'],
    ['AI PICK', '/pick/histories'],
    ['My', '/mypage'],
  ];
  for (const [name, target] of targets) {
    const link = within(menu).getByRole('link', { name });
    expect(link).toHaveAttribute('href', target);
    expect(link.querySelector('button')).toBeNull();
    link.focus();
    await user.keyboard('{Enter}');
    expect(screen.getByLabelText('현재 경로')).toHaveTextContent(target);
    expect(link).toHaveAttribute('aria-current', 'page');
    expect(
      within(menu)
        .getAllByRole('link')
        .filter((item) => item.hasAttribute('aria-current')),
    ).toHaveLength(1);
  }
});
