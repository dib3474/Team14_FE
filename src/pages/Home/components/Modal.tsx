import ModalLogo from '@/components/icon/ModalLogo';
import { useEffect, useId, useRef } from 'react';
import { generatePath, useNavigate } from 'react-router-dom';
import Button from '@/components/common/Button';
import type { Pin } from '@/types/Pin';
import { ROUTE_PATH } from '@/constants/routes';
import DIALECT_MESSAGES from '@/constants/dialectMessages';
import Map from '@/components/icon/MapIcon';
import Close from '@/components/icon/CloseIcon';

interface Props {
  close: () => void;
  isOpen: boolean;
  pin: Pin | null;
}
const Modal = ({ close, isOpen, pin }: Props) => {
  const navigate = useNavigate();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const messageId = useId();
  useEffect(() => {
    if (!isOpen) return;
    const dialog = dialogRef.current;
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog?.showModal();
    dialog?.querySelector<HTMLButtonElement>('button')?.focus();
    return () => {
      dialog?.close();
      document.body.style.overflow = original;
      trigger?.focus();
    };
  }, [isOpen]);
  if (!isOpen) return null;
  const message =
    (pin?.id && DIALECT_MESSAGES[pin.id]) ||
    '취향에 딱 맞게 찾아드립니다!\n나만을 위한 지역 축제 추천';
  return (
    <dialog
      ref={dialogRef}
      className="home-dialog"
      aria-labelledby={titleId}
      aria-describedby={messageId}
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          close();
        }
        if (e.key !== 'Tab') return;
        const buttons = Array.from(
          e.currentTarget.querySelectorAll<HTMLButtonElement>('button:not([disabled])'),
        );
        const first = buttons[0];
        const last = buttons[buttons.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }}
    >
      <div className="home-dialog-content">
        <Button
          variant="icon"
          className="home-dialog-close"
          aria-label="지역 선택 닫기"
          onClick={close}
        >
          <Close className="size-5" strokeWidth={2} />
        </Button>
        <p className="ui-eyebrow">우리 동네부터 새로운 여행까지</p>
        <h2 id={titleId} className="ui-title home-dialog-title">
          <Map className="size-7 shrink-0" />
          {pin?.name} 축제 여행
        </h2>
        <p id={messageId} className="ui-body text-center whitespace-pre-line">
          {message}
        </p>
        {pin?.icon ? (
          <img src={pin.icon} alt={pin.name} className="home-dialog-character" />
        ) : (
          <ModalLogo className="size-12" />
        )}
        <div className="home-dialog-actions">
          <Button
            fullWidth
            onClick={() => {
              if (pin?.areaId) navigate(generatePath(ROUTE_PATH.PICK, { areaId: pin.areaId }));
              close();
            }}
          >
            나만의 지역 축제 찾기
          </Button>
          <Button
            variant="secondary"
            fullWidth
            onClick={() => {
              if (pin?.areaId) navigate(generatePath(ROUTE_PATH.FESTIVALS, { areaId: pin.areaId }));
              close();
            }}
          >
            지역 축제 둘러보기
          </Button>
        </div>
      </div>
    </dialog>
  );
};
export default Modal;
