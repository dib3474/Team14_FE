import { useEffect, type RefObject, type KeyboardEvent } from 'react';
export const useDialogFocus = (
  open: boolean,
  dialog: RefObject<HTMLElement | null>,
  onClose: () => void,
) => {
  useEffect(() => {
    if (!open) return;
    const trigger = document.activeElement,
      overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const first =
      dialog.current?.querySelector<HTMLElement>('[data-dialog-close]') ||
      dialog.current?.querySelector<HTMLElement>(
        'button:not([disabled]),a[href],input:not([type="hidden"]),textarea,[tabindex="0"]',
      );
    first?.focus();
    return () => {
      document.body.style.overflow = overflow;
      if (trigger instanceof HTMLElement && trigger.isConnected) trigger.focus();
    };
  }, [open, dialog]);
  return (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      onClose();
      return;
    }
    if (event.key !== 'Tab') return;
    const targets = [
      ...(dialog.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]),a[href],input:not([disabled]):not([type="hidden"]),textarea:not([disabled]),video[controls],[tabindex="0"]',
      ) || []),
    ].filter((node) => !node.closest('[inert]'));
    const first = targets[0],
      last = targets.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  };
};
