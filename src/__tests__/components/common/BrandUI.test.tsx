import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import ConfirmModal from '@/components/modal/ConfirmModal';
import TextInputWithCounter from '@/components/form/TextInputWithCounter';
import FestivalFormPeriodCard from '@/components/festivalForm/FestivalFormPeriodCard';
import ImageModal from '@/components/modal/ImageModal';
import FestivalHostInfo from '@/pages/FestivalInfo/components/FestivalHostInfo';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import OutlineInputField from '@/components/form/OutlineInputField';
test('header settings is one named native link without a nested control', () => {
  const { container } = render(
    <MemoryRouter>
      <Header variant="mypage" />
    </MemoryRouter>,
  );
  expect(screen.getByRole('link', { name: '설정' })).toHaveAttribute('href', '/settings');
  expect(screen.getByRole('button', { name: '뒤로가기' })).toBeVisible();
  expect(container.querySelector('a button,button a')).toBeNull();
});
test('footer reflects direct URL and keyboard navigation using native links', async () => {
  const user = userEvent.setup();
  const { container } = render(
    <MemoryRouter initialEntries={['/search']}>
      <Footer initialSelected="home" />
    </MemoryRouter>,
  );
  const search = screen.getByRole('link', { name: '검색' });
  expect(search).toHaveAttribute('aria-current', 'page');
  expect(container.querySelector('a button,button a')).toBeNull();
  const home = screen.getByRole('link', { name: '홈' });
  home.focus();
  await user.keyboard('{Enter}');
  expect(home).toHaveAttribute('aria-current', 'page');
  expect(search).not.toHaveAttribute('aria-current');
});
test('field connects an error alongside caller help and preserves native input behavior', async () => {
  const user = userEvent.setup();
  render(
    <>
      <p id="help">지역을 입력해주세요</p>
      <OutlineInputField
        id="area"
        name="area"
        aria-label="지역"
        aria-describedby="help"
        errorMsg="필수 입력입니다"
        maxLength={3}
      />
    </>,
  );
  const input = screen.getByRole('textbox', { name: '지역' });
  expect(input).toHaveAttribute('aria-invalid', 'true');
  expect(input).toHaveAccessibleDescription('지역을 입력해주세요 필수 입력입니다');
  expect(input).toHaveAttribute('name', 'area');
  await user.type(input, '서울축제');
  expect(input).toHaveValue('서울축');
});

test('counter preserves length constraints and exposes its count as a field description', () => {
  render(
    <TextInputWithCounter
      value="서울"
      onChange={() => {}}
      placeholder="축제 제목"
      maxLength={30}
      name="title"
    />,
  );
  const input = screen.getByRole('textbox', { name: '축제 제목' });
  expect(input).toHaveAttribute('name', 'title');
  expect(input).toHaveAttribute('maxlength', '30');
  expect(input).toHaveAccessibleDescription('2/30자');
});
test('confirmation dialog is named and Escape returns focus without confirming', async () => {
  const user = userEvent.setup(),
    close = vi.fn(),
    confirm = vi.fn();
  const trigger = document.createElement('button');
  document.body.append(trigger);
  trigger.focus();
  const { unmount } = render(
    <ConfirmModal
      isOpen
      onClose={close}
      onConfirm={confirm}
      title="삭제 확인"
      message="삭제할까요?"
    />,
  );
  expect(screen.getByRole('dialog', { name: '삭제 확인' })).toHaveAttribute('aria-modal', 'true');
  expect(screen.getByRole('button', { name: '취소' })).toHaveFocus();
  await user.keyboard('{Escape}');
  expect(close).toHaveBeenCalledExactlyOnceWith();
  expect(confirm).not.toHaveBeenCalled();
  unmount();
  expect(trigger).toHaveFocus();
  trigger.remove();
});

test('festival period fields keep native names and expose individual start and end labels', () => {
  const formData = { startDate: '2026-11-01', endDate: '2026-12-31' } as React.ComponentProps<
    typeof FestivalFormPeriodCard
  >['formData'];
  render(
    <FestivalFormPeriodCard
      formData={formData}
      handleInputChange={() => {}}
      isSubmitting={false}
    />,
  );
  expect(screen.getByLabelText('시작일')).toHaveAttribute('name', 'startDate');
  expect(screen.getByLabelText('종료일')).toHaveAttribute('name', 'endDate');
});
test('a visible form label targets the named counter field', () => {
  render(
    <>
      <label htmlFor="festival-title">축제명</label>
      <TextInputWithCounter
        name="festival-title"
        value=""
        onChange={() => {}}
        placeholder="축제명을 입력하세요"
        maxLength={255}
      />
    </>,
  );
  expect(screen.getByLabelText('축제명')).toHaveAttribute('name', 'festival-title');
});

test('missing official homepage is readable information rather than an empty button', () => {
  render(<FestivalHostInfo url="no_homepage" />);
  expect(screen.getByText('공식 홈페이지 정보가 없습니다.')).toBeVisible();
  expect(screen.queryByRole('button')).not.toBeInTheDocument();
});
test('media dialog is named, closes with Escape and restores trigger focus', async () => {
  const user = userEvent.setup(),
    close = vi.fn();
  const trigger = document.createElement('button');
  document.body.append(trigger);
  trigger.focus();
  const { unmount } = render(
    <ImageModal
      mediaItems={[
        { type: 'image', url: '/one.png' },
        { type: 'image', url: '/two.png' },
      ]}
      selectedMediaIndex={0}
      title="봄 축제"
      onClose={close}
    />,
  );
  expect(screen.getByRole('dialog', { name: '봄 축제 미디어 확대 보기' })).toHaveAttribute(
    'aria-modal',
    'true',
  );
  expect(screen.getByRole('button', { name: '모달 닫기' })).toHaveFocus();
  await user.keyboard('{Escape}');
  expect(close).toHaveBeenCalledExactlyOnceWith();
  unmount();
  expect(trigger).toHaveFocus();
  trigger.remove();
});
