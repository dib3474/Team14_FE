/** Presentation colors shared by account application cards. */
export const statusTone = (state: string) => {
  if (state === 'ACCEPTED' || state === 'APPROVED') {
    return '!bg-secondary-50 !text-secondary-800 !border-secondary-200';
  }
  if (state === 'PENDING' || state === 'PROCESSING') {
    return '!bg-primary-50 !text-primary-800 !border-primary-200';
  }
  return '!bg-ui-canvas !text-ui-ink !border-ui-line';
};
