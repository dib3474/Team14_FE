import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import HomeContent from '@/pages/Home/components/HomeContent';
import MAP_PINS from '@/constants/mapPins';
const originalShow = HTMLDialogElement.prototype.showModal,
  originalClose = HTMLDialogElement.prototype.close;
beforeEach(() => {
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute('open');
  };
});
afterEach(() => {
  HTMLDialogElement.prototype.showModal = originalShow;
  HTMLDialogElement.prototype.close = originalClose;
});
const open = () =>
  render(
    <MemoryRouter>
      <HomeContent />
    </MemoryRouter>,
  );
test('home keeps one requested instruction without the removed promotional copy', () => {
  open();
  expect(screen.getByRole('heading', { name: '설레는 축제 여행' })).toBeVisible();
  expect(
    screen.getAllByText('지도 속 지역 픽픽이를 누르고 취향에 맞는 축제를 만나보세요.'),
  ).toHaveLength(1);
  expect(screen.queryByText('어디로 떠나볼까요?')).not.toBeInTheDocument();
  expect(screen.queryByText('나의 다음 픽은?')).not.toBeInTheDocument();
  expect(
    screen.queryByText('지도 속 지역 친구를 누르고 취향에 맞는 축제를 만나보세요.'),
  ).not.toBeInTheDocument();
});
test('map and name selection share one panel and keep the same selected-region dialog', async () => {
  const user = userEvent.setup();
  open();
  const view = within(screen.getByRole('group', { name: '지역 보기 방식' }));
  expect(view.getByRole('button', { name: '지도' })).toHaveAttribute('aria-pressed', 'true');
  expect(screen.getByRole('img', { name: '대한민국 지역 지도' })).toBeVisible();
  await user.click(view.getByRole('button', { name: '이름' }));
  expect(view.getByRole('button', { name: '이름' })).toHaveAttribute('aria-pressed', 'true');
  expect(screen.queryByRole('img', { name: '대한민국 지역 지도' })).not.toBeInTheDocument();
  const names = within(screen.getByRole('region', { name: '지역 이름 선택' }));
  expect(names.getAllByRole('button')).toHaveLength(MAP_PINS.length);
  const seoul = names.getByRole('button', { name: '서울' });
  seoul.focus();
  await user.keyboard('{Enter}');
  expect(screen.getByRole('dialog', { name: '서울 축제 여행' })).toBeVisible();
  await user.keyboard('{Escape}');
  expect(seoul).toHaveFocus();
  await user.click(view.getByRole('button', { name: '지도' }));
  const map = within(screen.getByRole('region', { name: '전국 축제 지도' }));
  expect(map.getAllByRole('button')).toHaveLength(MAP_PINS.length);
  expect(screen.queryByRole('region', { name: '지역 이름 선택' })).not.toBeInTheDocument();
});
test('character cue can be stopped and the choice survives switching views', async () => {
  const user = userEvent.setup();
  open();
  const motion = screen.getByRole('button', { name: '캐릭터 모션' });
  expect(motion).toHaveAttribute('aria-pressed', 'true');
  await user.click(motion);
  expect(motion).toHaveAttribute('aria-pressed', 'false');
  await user.click(screen.getByRole('button', { name: '이름' }));
  expect(screen.queryByRole('button', { name: '캐릭터 모션' })).not.toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: '지도' }));
  expect(screen.getByRole('button', { name: '캐릭터 모션' })).toHaveAttribute(
    'aria-pressed',
    'false',
  );
});

test('motion control precedes the map and name controls in keyboard order', () => {
  open();
  const motion = screen.getByRole('button', { name: '캐릭터 모션' });
  const map = screen.getByRole('button', { name: '지도' });
  expect(motion.compareDocumentPosition(map) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
});
test('each map character carries its region label without duplicating its accessible name', async () => {
  const user = userEvent.setup();
  open();
  const map = within(screen.getByRole('region', { name: '전국 축제 지도' }));
  for (const pin of MAP_PINS) {
    const character = map.getByRole('button', { name: pin.name });
    expect(within(character).getByText(pin.name)).toBeInTheDocument();
    expect(character).toHaveAccessibleName(pin.name);
  }
  const seoul = map.getByRole('button', { name: '서울' });
  await user.hover(seoul);
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  seoul.focus();
  await user.keyboard('{Enter}');
  expect(screen.getByRole('dialog', { name: '서울 축제 여행' })).toBeVisible();
  await user.keyboard('{Escape}');
});
