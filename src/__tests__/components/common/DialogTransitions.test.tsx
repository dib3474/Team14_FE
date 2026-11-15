import { useRef } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useDialogFocus } from '@/components/modal/useDialogFocus';
const DynamicDialog = ({ phase }: { phase: 'ready' | 'busy' | 'success' }) => {
  const dialog = useRef<HTMLDivElement>(null),
    handle = useDialogFocus(true, dialog, () => {});
  return (
    <>
      <button>배경 헤더</button>
      <div ref={dialog} role="dialog" aria-label="프로필 변경" tabIndex={-1} onKeyDown={handle}>
        {phase === 'success' ? (
          <button>다시 수정</button>
        ) : (
          <button disabled={phase === 'busy'}>확인</button>
        )}
        <input type="file" aria-label="숨긴 파일 선택" style={{ display: 'none' }} />
      </div>
      <button>배경 푸터</button>
    </>
  );
};
test('busy controls and success replacement keep focus inside the open dialog', async () => {
  const user = userEvent.setup();
  const { rerender } = render(<DynamicDialog phase="ready" />);
  expect(screen.getByRole('button', { name: '확인' })).toHaveFocus();
  rerender(<DynamicDialog phase="busy" />);
  // Browsers release focus when the focused control becomes disabled.
  (document.activeElement as HTMLElement).blur();
  await waitFor(() => expect(screen.getByRole('dialog')).toHaveFocus());
  await user.tab();
  expect(screen.getByRole('dialog')).toHaveFocus();
  rerender(<DynamicDialog phase="success" />);
  await waitFor(() => expect(screen.getByRole('button', { name: '다시 수정' })).toHaveFocus());
  await user.tab();
  expect(screen.getByRole('button', { name: '다시 수정' })).toHaveFocus();
});
test('hidden file inputs are excluded when cycling focus', async () => {
  const user = userEvent.setup();
  render(<DynamicDialog phase="ready" />);
  await user.tab();
  expect(screen.getByRole('button', { name: '확인' })).toHaveFocus();
  await user.tab({ shift: true });
  expect(screen.getByRole('button', { name: '확인' })).toHaveFocus();
});
