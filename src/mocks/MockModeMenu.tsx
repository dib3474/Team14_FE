import { useId, useRef, useState } from 'react';
import { useDialogFocus } from '@/components/modal/useDialogFocus';
import './mock-mode.css';
import { mockScreens } from './mockScreens';

const MockModeMenu = () => {
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDivElement>(null);
  const dialogId = useId();
  const titleId = useId();
  const close = () => setOpen(false);
  const handleKeyDown = useDialogFocus(open, dialog, close);

  return (
    <aside className="mock-mode-tools" aria-label="개발 목 모드">
      <button
        type="button"
        className="mock-mode-launcher"
        aria-label="Mock 화면 목록 열기"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? dialogId : undefined}
        onClick={() => setOpen(true)}
      >
        Mock
      </button>
      {open && (
        <div
          id={dialogId}
          className="mock-mode-overlay"
          ref={dialog}
          role="dialog"
          tabIndex={-1}
          aria-modal="true"
          aria-labelledby={titleId}
          onKeyDown={handleKeyDown}
          onClick={close}
        >
          <div className="mock-mode-panel" onClick={(event) => event.stopPropagation()}>
            <div className="mock-mode-heading">
              <div>
                <h2 id={titleId}>목 화면 바로가기</h2>
                <p>샘플 계정 · 로그인 없이 둘러보기</p>
              </div>
              <button
                type="button"
                className="mock-mode-close"
                aria-label="목 화면 목록 닫기"
                data-dialog-close
                onClick={close}
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <nav aria-label="목 화면 바로가기">
              <p>실제 저장·업로드·소셜 로그인·채팅 전송은 수행하지 않습니다.</p>
              {mockScreens.map(([label, to]) => (
                <a key={to} href={to} onClick={close}>
                  {label}
                </a>
              ))}
            </nav>
          </div>
        </div>
      )}
    </aside>
  );
};
export default MockModeMenu;
