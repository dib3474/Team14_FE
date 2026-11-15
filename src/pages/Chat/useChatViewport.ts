import { useEffect, useRef } from 'react';

/** Keep the composer inside the visible viewport while its input has focus. */
const useChatViewport = () => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    const viewport = window.visualViewport;
    if (!element || !viewport) return;
    let frame = 0;

    const update = () => {
      const focused = document.activeElement;
      const isEditing = focused instanceof HTMLTextAreaElement && element.contains(focused);
      const visibleBottom = viewport.height + viewport.offsetTop;
      if (isEditing && Number.isFinite(visibleBottom) && visibleBottom > 0) {
        element.style.setProperty('--chat-viewport-height', `${visibleBottom}px`);
      } else {
        element.style.removeProperty('--chat-viewport-height');
      }
    };
    const scheduleUpdate = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };

    viewport.addEventListener('resize', scheduleUpdate);
    viewport.addEventListener('scroll', scheduleUpdate, { passive: true });
    document.addEventListener('focusin', scheduleUpdate);
    document.addEventListener('focusout', scheduleUpdate);
    update();

    return () => {
      cancelAnimationFrame(frame);
      viewport.removeEventListener('resize', scheduleUpdate);
      viewport.removeEventListener('scroll', scheduleUpdate);
      document.removeEventListener('focusin', scheduleUpdate);
      document.removeEventListener('focusout', scheduleUpdate);
      element.style.removeProperty('--chat-viewport-height');
    };
  }, []);

  return ref;
};

export default useChatViewport;
