import { useEffect, type RefObject, type KeyboardEvent } from 'react';
const focusable = (container: HTMLElement) =>
  [
    ...container.querySelectorAll<HTMLElement>(
      'button,a[href],input:not([type="hidden"]),textarea,select,video[controls],[tabindex="0"]',
    ),
  ].filter((node) => {
    if (
      node.matches(':disabled') ||
      node.tabIndex < 0 ||
      node.closest('[inert],[hidden],[aria-hidden="true"]')
    )
      return false;
    for (
      let current: HTMLElement | null = node;
      current && container.contains(current);
      current = current.parentElement
    ) {
      const style = window.getComputedStyle(current);
      if (
        style.display === 'none' ||
        style.visibility === 'hidden' ||
        style.visibility === 'collapse'
      )
        return false;
    }
    return true;
  });
export const useDialogFocus = (
  open: boolean,
  dialog: RefObject<HTMLElement | null>,
  onClose: () => void,
) => {
  useEffect(() => {
    const container = dialog.current;
    if (!open || !container) return;
    const trigger = document.activeElement,
      overflow = document.body.style.overflow;
    let active = true;
    document.body.style.overflow = 'hidden';
    const repair = () => {
      if (!active) return;
      const targets = focusable(container),
        focused = document.activeElement;
      if (focused instanceof HTMLElement && targets.includes(focused)) return;
      const preferred =
        targets.find((node) => node.hasAttribute('data-dialog-close')) || targets[0];
      (preferred || container).focus();
    };
    repair();
    const observer = new MutationObserver(repair);
    observer.observe(container, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['disabled', 'hidden', 'class', 'style', 'inert', 'aria-hidden', 'tabindex'],
    });
    document.addEventListener('focusin', repair);
    return () => {
      active = false;
      observer.disconnect();
      document.removeEventListener('focusin', repair);
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
    if (event.key !== 'Tab' || !dialog.current) return;
    const targets = focusable(dialog.current),
      first = targets[0],
      last = targets.at(-1),
      focused = document.activeElement;
    if (!targets.length) {
      event.preventDefault();
      dialog.current.focus();
    } else if (!(focused instanceof HTMLElement) || !targets.includes(focused)) {
      event.preventDefault();
      (event.shiftKey ? last : first)?.focus();
    } else if (event.shiftKey && focused === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && focused === last) {
      event.preventDefault();
      first?.focus();
    }
  };
};
