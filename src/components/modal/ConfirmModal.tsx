import { useId, useRef } from 'react';
import { useDialogFocus } from './useDialogFocus';
import Button from '@/components/common/Button';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDelete?: boolean;
}

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = '확인',
  cancelText = '취소',
  isDelete = false,
}: ConfirmModalProps) => {
  const dialog = useRef<HTMLDivElement>(null),
    titleId = useId();
  const handleKeyDown = useDialogFocus(isOpen, dialog, onClose);
  if (!isOpen) return null;

  return (
    <div
      className="ui-overlay"
      ref={dialog}
      role="dialog"
      tabIndex={-1}
      aria-modal="true"
      aria-labelledby={titleId}
      onKeyDown={handleKeyDown}
      onClick={onClose}
    >
      <div className="ui-dialog" onClick={(e) => e.stopPropagation()}>
        <h3 id={titleId} className="ui-section-title mb-2">
          {title}
        </h3>
        {isDelete ? (
          <p className="text-sm text-red-700 mb-6 whitespace-pre-line">{message}</p>
        ) : (
          <p className="ui-body mb-6 whitespace-pre-line">{message}</p>
        )}
        <div className="flex gap-2 justify-center">
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            {cancelText}
          </Button>
          <Button variant="primary" className="flex-1" onClick={onConfirm}>
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
