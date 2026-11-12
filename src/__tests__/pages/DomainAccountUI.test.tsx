import { act, fireEvent, render, screen } from '@testing-library/react';
import useChatViewport from '@/pages/Chat/useChatViewport';
import MyPage from '@/pages/My/MyPage';
import ChatSendSection from '@/pages/Chat/components/ChatSendSection';
import LoginContent from '@/pages/Login/components/LoginContent';
import { MemoryRouter, useLocation } from 'react-router-dom';
import FestivalPermissionCard from '@/pages/SettingsFestivalMyManageApplication/components/FestivalPermissionCard';
import SettingsFAQContent from '@/pages/SettingsFAQ/components/SettingsFAQContent';

const { pickAndUploadImages } = vi.hoisted(() => ({ pickAndUploadImages: vi.fn() }));

vi.mock('@/components/common/Header', () => ({ default: () => <header /> }));
vi.mock('@/components/common/Footer', () => ({ default: () => <footer /> }));
vi.mock('@/pages/My/components/MyPageChatSection', () => ({ default: () => <p>내 채팅 목록</p> }));
vi.mock('@/pages/My/components/MyPageWishFestivalsSection', () => ({
  default: () => <p>좋아요한 축제 목록</p>,
}));
vi.mock('@/pages/My/components/MyPageReviewFestivalsSection', () => ({
  default: () => <p>리뷰한 축제 목록</p>,
}));
vi.mock('@/hooks/useMediaUpload', () => ({
  useMediaUpload: () => ({ pickAndUploadImages, imageInfos: [], setImageInfos: vi.fn() }),
}));

describe('계정과 대화 화면 접근성', () => {
  beforeEach(() => vi.clearAllMocks());

  test('마이페이지의 선택 상태와 실제 축제 목록이 함께 전환된다', () => {
    render(<MyPage />);
    const wishButton = screen.getByRole('button', { name: '좋아요' });
    const reviewButton = screen.getByRole('button', { name: '리뷰' });
    expect(wishButton).toHaveAttribute('aria-pressed', 'true');
    expect(reviewButton).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByText('좋아요한 축제 목록')).toBeInTheDocument();
    fireEvent.click(reviewButton);
    expect(reviewButton).toHaveAttribute('aria-pressed', 'true');
    expect(wishButton).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByText('리뷰한 축제 목록')).toBeInTheDocument();
    expect(screen.queryByText('좋아요한 축제 목록')).not.toBeInTheDocument();
    expect(screen.getByText('내 채팅 목록')).toBeInTheDocument();
  });

  test('이름이 있는 채팅 입력은 기존 변경, Enter, 전송 핸들러와 길이 제한을 유지한다', () => {
    const handleMessageChange = vi.fn();
    const handleKeyPress = vi.fn();
    const sendMessage = vi.fn();
    render(
      <ChatSendSection
        message="축제에서 만나요"
        handleMessageChange={handleMessageChange}
        handleKeyPress={handleKeyPress}
        sendMessage={sendMessage}
        sendImageMessage={vi.fn()}
      />,
    );
    const textbox = screen.getByRole('textbox', { name: '채팅 메시지' });
    expect(textbox).toHaveAttribute('maxlength', '255');
    fireEvent.change(textbox, { target: { value: '안녕하세요' } });
    expect(handleMessageChange).toHaveBeenCalledTimes(1);
    fireEvent.keyDown(textbox, { key: 'Enter' });
    expect(handleKeyPress).toHaveBeenCalledTimes(1);
    fireEvent.keyDown(textbox, { key: 'Enter', shiftKey: true });
    expect(handleKeyPress).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole('button', { name: /메시지 보내기/ }));
    expect(sendMessage).toHaveBeenCalledTimes(1);
  });

  test('사진 선택 버튼 자체를 누르면 기존 이미지 선택 핸들러가 호출된다', () => {
    render(
      <ChatSendSection
        message=""
        handleMessageChange={vi.fn()}
        handleKeyPress={vi.fn()}
        sendMessage={vi.fn()}
        sendImageMessage={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /사진 선택/ }));
    expect(pickAndUploadImages).toHaveBeenCalledTimes(1);
  });

  test('FAQ 질문은 펼침 상태를 알리고 기존 답변을 표시한다', () => {
    render(<SettingsFAQContent />);
    const questions = screen.getAllByRole('button');
    expect(questions[0]).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(questions[0]);
    expect(questions[0]).toHaveAttribute('aria-expanded', 'true');
    const answerId = questions[0].getAttribute('aria-controls');
    expect(answerId).toBeTruthy();
    expect(document.getElementById(answerId!)).toBeVisible();
    fireEvent.click(questions[0]);
    expect(questions[0]).toHaveAttribute('aria-expanded', 'false');
  });

  test('축제 관리 신청 카드는 키보드로 접근 가능한 버튼이며 기존 상세 주소로 이동한다', () => {
    const CurrentPath = () => <p>{useLocation().pathname}</p>;
    render(
      <MemoryRouter>
        <FestivalPermissionCard
          permission={{
            id: 42,
            title: '한강 가을 축제',
            state: 'PENDING',
            appliedDate: '2026-11-01',
          }}
        />
        <CurrentPath />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole('button', { name: /한강 가을 축제/ }));
    expect(screen.getByText('/settings/festival-my-manage/42')).toBeInTheDocument();
  });

  test('채팅 입력에 초점이 있을 때만 visualViewport 크기를 반영하고 모든 리스너를 해제한다', () => {
    const viewport = new EventTarget();
    Object.defineProperties(viewport, {
      height: { value: 420, writable: true },
      offsetTop: { value: 0, writable: true },
    });
    const originalViewport = Object.getOwnPropertyDescriptor(window, 'visualViewport');
    Object.defineProperty(window, 'visualViewport', { configurable: true, value: viewport });
    const addListener = vi.spyOn(viewport, 'addEventListener');
    const removeListener = vi.spyOn(viewport, 'removeEventListener');
    const documentRemove = vi.spyOn(document, 'removeEventListener');
    const frameSpy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      callback(0);
      return 1;
    });
    const cancelFrame = vi.spyOn(window, 'cancelAnimationFrame');
    const ViewportHarness = () => {
      const ref = useChatViewport();
      return (
        <div ref={ref} data-testid="chat-viewport">
          <textarea aria-label="뷰포트 입력" />
        </div>
      );
    };
    try {
      const { unmount } = render(<ViewportHarness />);
      const layout = screen.getByTestId('chat-viewport');
      expect(layout.style.getPropertyValue('--chat-viewport-height')).toBe('');
      const input = screen.getByRole('textbox', { name: '뷰포트 입력' });
      act(() => input.focus());
      expect(layout.style.getPropertyValue('--chat-viewport-height')).toBe('420px');
      Object.defineProperty(viewport, 'height', { value: 360 });
      act(() => viewport.dispatchEvent(new Event('resize')));
      expect(layout.style.getPropertyValue('--chat-viewport-height')).toBe('360px');
      act(() => input.blur());
      expect(layout.style.getPropertyValue('--chat-viewport-height')).toBe('');
      unmount();
      expect(removeListener.mock.calls).toEqual(
        expect.arrayContaining(addListener.mock.calls.map(([name, callback]) => [name, callback])),
      );
      expect(documentRemove.mock.calls).toEqual(
        expect.arrayContaining([
          ['focusin', expect.any(Function)],
          ['focusout', expect.any(Function)],
        ]),
      );
      expect(cancelFrame).toHaveBeenCalled();
    } finally {
      if (originalViewport) Object.defineProperty(window, 'visualViewport', originalViewport);
      else Reflect.deleteProperty(window, 'visualViewport');
      frameSpy.mockRestore();
      cancelFrame.mockRestore();
      documentRemove.mockRestore();
    }
  });

  test('원본 소셜 로그인 선택지를 네이티브 버튼으로 유지한다', () => {
    render(<LoginContent />);
    expect(screen.getByRole('button', { name: /구글 로그인/ })).toBeEnabled();
    expect(screen.getByRole('button', { name: /카카오 로그인/ })).toBeEnabled();
    expect(screen.getByRole('heading', { name: 'FestaPick' })).toBeInTheDocument();
  });
});
